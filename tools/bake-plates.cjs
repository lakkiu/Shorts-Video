#!/usr/bin/env node
// Bake background plates for a set: library/plates/<set>/<angle>.jpg + <angle>.json (mark positions).
// Usage: node tools/bake-plates.cjs <set> [angle,angle...] [--landscape]   (--landscape: 16:9 plates in <set>@16x9)
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const argv = process.argv.slice(2), landscape = argv.includes("--landscape");
const [setName, only] = argv.filter((a) => !a.startsWith("--"));
if (!setName) { console.error("usage: bake-plates.cjs <set> [angles]"); process.exit(2); }
const out = path.join(ROOT, "library", "plates", landscape ? `${setName}@16x9` : setName);
fs.mkdirSync(out, { recursive: true });
const types = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".woff2": "font/woff2" };

const srv = http.createServer((q, r) => {
  const f = path.join(ROOT, decodeURIComponent(q.url.split("?")[0]));
  if (!f.startsWith(ROOT)) { r.writeHead(403); r.end(); return; }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" }); r.end(d); });
}).listen(0, async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  p.on("pageerror", (e) => console.error("page error:", e.message));
  await p.goto(`http://127.0.0.1:${srv.address().port}/tools/bake.html?set=${setName}${landscape ? "&w=2400&h=1350" : ""}`);
  await p.waitForFunction(() => document.title === "ready", null, { timeout: 120000 });
  const angles = only ? only.split(",") : await p.evaluate(() => window.angles);
  for (const a of angles) {
    const t0 = Date.now();
    const { png, meta } = await p.evaluate((a) => window.bake(a), a);
    const tmp = path.join(out, `${a}.png`);
    fs.writeFileSync(tmp, Buffer.from(png.split(",")[1], "base64"));
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", tmp, "-q:v", "2", path.join(out, `${a}.jpg`)]);
    fs.unlinkSync(tmp);
    fs.writeFileSync(path.join(out, `${a}.json`), JSON.stringify(meta, null, 2));
    console.log(`baked ${setName}/${a} in ${Date.now() - t0} ms`);
  }
  await b.close();
  srv.close();
});
