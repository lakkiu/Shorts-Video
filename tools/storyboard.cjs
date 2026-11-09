#!/usr/bin/env node
// Storyboard sheet for approval before rendering: one still per shot (at the middle of the shot).
// Usage: node tools/storyboard.cjs out/<slug>        -> out/<slug>/storyboard.png
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");

const dir = path.resolve(process.argv[2] || "");
const chapters = fs.readdirSync(dir).filter((d) => /^ch\d+$/.test(d)).sort();
if (!chapters.length) { console.error("no chapters in", dir); process.exit(2); }
const tmp = path.join(dir, "storyboard");
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(tmp, { recursive: true });
const types = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".jpg": "image/jpeg", ".png": "image/png", ".mp3": "audio/mpeg", ".wav": "audio/wav" };

(async () => {
  const b = await chromium.launch();
  let n = 0;
  for (const ch of chapters) {
    const root = path.join(dir, ch);
    const srv = http.createServer((q, r) => {
      const f = path.join(root, decodeURIComponent(q.url.split("?")[0]));
      fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" }); r.end(d); });
    });
    await new Promise((res) => srv.listen(0, res));
    const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
    const W = +html.match(/data-width="(\d+)"/)[1], H = +html.match(/data-height="(\d+)"/)[1];
    const p = await b.newPage({ viewport: { width: W, height: H } });
    p.on("pageerror", (e) => console.error(`${ch} page error:`, e.message));
    await p.goto(`http://127.0.0.1:${srv.address().port}/index.html`);
    await p.waitForFunction(() => window.__vf && window.__vf.render, null, { timeout: 60000 });
    await p.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => (i.onload = i.onerror = r))))));
    const shots = await p.evaluate(() => window.STORY.shots.map((s) => (s.start + s.end) / 2));
    for (const t of shots) {
      await p.evaluate((t) => {
        window.__timelines.main.seek(t);
        window.__vf.render(t);
        document.querySelectorAll(".clip").forEach((el) => {
          if (el.tagName === "AUDIO") return;
          const a = parseFloat(el.dataset.start), d = parseFloat(el.dataset.duration);
          el.style.visibility = t >= a && t < a + d ? "visible" : "hidden";
        });
      }, t);
      await p.screenshot({ path: path.join(tmp, `${String(n++).padStart(3, "0")}.png`) });
    }
    await p.close();
    srv.close();
  }
  await b.close();
  const cols = Math.min(7, n), rows = Math.ceil(n / cols);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-framerate", "1", "-i", path.join(tmp, "%03d.png"), "-vf", `scale=300:-1,tile=${cols}x${rows}:padding=8:color=white`, "-frames:v", "1", path.join(dir, "storyboard.png")]);
  console.log(`storyboard: ${path.join(dir, "storyboard.png")} (${n} shots)`);
})();
