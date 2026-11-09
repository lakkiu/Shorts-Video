#!/usr/bin/env node
// Story JSON -> finished video.
//   node scripts/make.mjs stories/luat-ktx.json            # voices + projects + render + mix
//   node scripts/make.mjs stories/x.json --no-render       # build projects only (preview in HyperFrames)
//   options: --jobs N (parallel chapter renders, default 1)  --chapter 90 (max chapter seconds)  --out out/<slug>
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawn } from "node:child_process";
import { synth, pool, probe as probeLib } from "./tts-lib.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const flag = (n) => args.includes(`--${n}`);
const storyPath = args.find((a) => a.endsWith(".json"));
if (!storyPath) { console.error("usage: make.mjs <story.json> [--no-render] [--jobs N] [--chapter 90]"); process.exit(2); }
const story = JSON.parse(fs.readFileSync(storyPath, "utf8"));
const slug = story.slug || path.basename(storyPath, ".json");
const OUT = path.resolve(opt("out", path.join(ROOT, "out", slug)));
const CHAPTER_MAX = Number(opt("chapter", 90));
const JOBS = Number(opt("jobs", 1));
const [W, H] = (story.format || "9:16") === "16:9" ? [1920, 1080] : [1080, 1920];
const HF = process.env.HYPERFRAMES_CLI || (fs.existsSync("/home/user/hyperframes/packages/cli/dist/cli.js") ? "/home/user/hyperframes/packages/cli/dist/cli.js" : null);
const log = (...a) => console.log("[make]", ...a);
fs.mkdirSync(OUT, { recursive: true });

const probe = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());
const ff = (a) => execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...a]);

// ---------- 1. voices (cached, parallel; shared cache with tools/voice-demo.mjs) ----------
const voiceOf = (who) => story.voices?.[who] || story.voices?.narrator || { voice: "Vietnamese_Serene_Man", speed: 0.95 };
const beats = [];
story.shots.forEach((s, si) => (s.beats || []).forEach((b, bi) => { if (b.say) beats.push({ si, bi, b }); }));
log(`voices: ${beats.length} lines`);
await pool(beats, 4, async ({ b }) => { const r = await synth(b.text, voiceOf(b.say)); b._file = r.file; b._dur = r.dur; });

// ---------- 2. timeline ----------
const plateMeta = (set, angle) => JSON.parse(fs.readFileSync(path.join(ROOT, "library/plates", set, `${angle}.json`), "utf8"));
const sfxFile = (n) => path.join(ROOT, "library/sfx", `${n}.mp3`);
let cur = 0;
const shots = [], audio = [], caps = [], fx = [], shakes = [], talk = [], notifies = [], overlays = [];
const resolveAt = (spec, sh, def = 0) => {
  if (spec == null) return sh.start + def;
  if (typeof spec === "number") return sh.start + spec;
  const m = String(spec).match(/^([be])(\d+)\s*([+-]\s*[\d.]+)?$/);
  if (!m) throw new Error(`bad time "${spec}"`);
  const bt = sh.beatTimes[+m[2]];
  return (m[1] === "b" ? bt.start : bt.end) + (m[3] ? Number(m[3].replace(/\s/g, "")) : 0);
};
function chunks(text) {
  const parts = text.split(/(?<=[.!?…,:;])\s+|(?<=\.\.\.)\s*/).map((x) => x.trim()).filter(Boolean);
  const out = [];
  for (const p of parts) { if (out.length && (out[out.length - 1] + " " + p).length <= 34) out[out.length - 1] += " " + p; else out.push(p); }
  return out.map((x) => x.replace(/\.\.\./g, "…"));
}

for (const s of story.shots) {
  const set = s.set || story.set;
  const sh = { start: cur, beatTimes: [], src: s };
  let t = cur + (s.lead ?? 0.3);
  (s.beats || []).forEach((b) => {
    const start = t;
    let dur = b.say ? b._dur : b.hold ?? (b.sfx ? probe(sfxFile(b.sfx)) : 0.5);
    if (b.say) {
      audio.push({ file: b._file, start, vol: b.volume ?? 1 });
      const v = voiceOf(b.say);
      const parts = chunks(b.text), total = parts.reduce((a, p) => a + p.length, 0);
      let c = start;
      for (const p of parts) { const d = (dur * p.length) / total; caps.push({ text: v.quote ? `“${p}”` : p, start: c, end: c + d + 0.12, color: v.color, italic: false }); c += d; }
      talk.push({ who: b.say, start, end: start + dur });
    }
    if (b.sfx) {
      audio.push({ file: sfxFile(b.sfx), start: start + (b.sfxAt || 0), vol: b.volume ?? 1 });
      if (b.caption) caps.push({ text: b.caption, start, end: start + dur, color: "#c9d6ff", italic: true });
      for (const k of b.shake || []) shakes.push(start + k);
    }
    for (const x of b.also || []) { audio.push({ file: sfxFile(x.sfx), start: start + (x.at || 0), vol: x.volume ?? 1 }); for (const k of x.shake || []) shakes.push(start + (x.at || 0) + k); }
    sh.beatTimes.push({ start, end: start + dur });
    t = start + dur + (b.gap ?? 0.35);
  });
  sh.end = s.hold != null && !(s.beats || []).length ? cur + s.hold : t + (s.tail ?? 0);
  if (s.black) {
    sh.black = true;
    if (s.text) caps.push({ text: s.text, start: sh.start + 0.3, end: sh.end, color: "#e9edf7", card: true });
  } else {
    const meta = plateMeta(set, s.angle);
    sh.plate = `plates/${set}/${s.angle}.jpg`; sh.plateW = meta.w; sh.plateH = meta.h;
    sh.chars = (s.chars || []).map((c) => {
      const mk = (name) => { const m = meta.marks[name]; if (!m) throw new Error(`angle ${s.angle} has no mark "${name}" (has: ${Object.keys(meta.marks).join(", ") || "none"})`); return m; };
      const from = mk(c.mark);
      const r = { char: c.char || c.id, who: c.id, ghost: (c.char || c.id) === "ghost" || /ghost/.test(c.char || ""), from, depth: from.depth, mood: c.mood, pose: c.pose, look: c.look, height: c.height, tint: c.tint };
      if (c.walk) { r.to = mk(c.walk.to); r.walkAt = resolveAt(c.walk.at, sh) - sh.start; r.walkDur = c.walk.dur || 3; }
      r.keys = (c.keys || []).map((k) => ({ ...k, at: resolveAt(k.at, sh) }));
      if (c.fadeAt != null) { r.fadeAt = resolveAt(c.fadeAt, sh); r.fadeDur = c.fadeDur || 2.4; }
      if (c.showAt != null) r.showAt = resolveAt(c.showAt, sh);
      return r;
    });
    sh.move = s.move || "drift"; sh.dim = s.dim || 0; sh.tint = s.tint;
  }
  for (const f of s.fx || []) {
    const start = f.at != null ? resolveAt(f.at, sh) : sh.start;
    fx.push({ ...f, start, end: f.type === "blackout" ? Infinity : f.dur ? start + f.dur : sh.end });
  }
  if (s.notify) { const st = resolveAt(s.notify.at ?? 0, sh); notifies.push({ ...s.notify, start: st, end: st + (s.notify.dur || 3.5) }); }
  if (s.overlay) overlays.push({ type: s.overlay, start: sh.start, end: sh.end });
  shots.push(sh);
  cur = sh.end;
}
const TOTAL = cur;
const blackoutAt = Math.min(...fx.filter((f) => f.type === "blackout").map((f) => f.start), TOTAL);
log(`timeline: ${shots.length} shots, ${TOTAL.toFixed(1)} s`);

// ---------- 3. chapters ----------
const chapters = [];
let chStart = 0, chShots = [];
shots.forEach((s, i) => {
  chShots.push(s);
  const next = shots[i + 1];
  if (!next || next.end - chStart > CHAPTER_MAX) { chapters.push({ start: chStart, end: s.end, shots: chShots }); chStart = s.end; chShots = []; }
});
log(`chapters: ${chapters.length}`);

const esc = (x) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const cp = (src, dst) => { fs.mkdirSync(path.dirname(dst), { recursive: true }); if (!fs.existsSync(dst)) fs.copyFileSync(src, dst); };

function writeChapter(ch, n) {
  const dir = path.join(OUT, `ch${String(n + 1).padStart(2, "0")}`);
  fs.mkdirSync(dir, { recursive: true });
  const A = path.join(dir, "assets");
  fs.mkdirSync(path.join(A, "engine"), { recursive: true });
  fs.copyFileSync(path.join(ROOT, "engine/runtime.js"), path.join(A, "engine/runtime.js"));
  fs.copyFileSync(path.join(ROOT, "engine/toon/characters.js"), path.join(A, "engine/characters.js"));
  cp(path.join(ROOT, "engine/lib/gsap.min.js"), path.join(A, "lib/gsap.min.js"));
  const o = ch.start, D = ch.end - ch.start;
  const inCh = (x) => x.start < ch.end && x.end > ch.start;
  const rel = (x) => ({ ...x, start: Math.max(0, x.start - o), end: Math.min(D, x.end - o) });
  const relKey = (c) => ({ ...c, keys: c.keys.map((k) => ({ ...k, at: k.at - o })), fadeAt: c.fadeAt != null ? c.fadeAt - o : undefined, showAt: c.showAt != null ? c.showAt - o : undefined });

  const castIds = new Set(ch.shots.flatMap((s) => (s.chars || []).map((c) => c.char)));
  const cast = {};
  for (const id of castIds) {
    const f = path.join(ROOT, "library/characters", `${id}.json`);
    if (!fs.existsSync(f)) throw new Error(`character "${id}" is not in library/characters (approve one with tools/demo.cjs chars first)`);
    cast[id] = JSON.parse(fs.readFileSync(f, "utf8")).spec;
  }
  const S = {
    width: W, height: H, tint: story.tint || null, cast,
    shots: ch.shots.map((s) => ({ start: s.start - o, end: s.end - o, black: !!s.black, plateW: s.plateW || W, plateH: s.plateH || H, move: s.move || "hold", dim: s.dim || 0, tint: s.tint, chars: (s.chars || []).map(relKey) })),
    fx: fx.filter((f) => f.start < ch.end && f.end > ch.start).map((f) => ({ ...f, start: f.start - o, end: Math.min(f.end, 1e6) - o })),
    shakes: shakes.filter((x) => x >= ch.start && x < ch.end).map((x) => x - o),
    talk: talk.filter(inCh).map(rel),
  };
  let shotsHtml = "", capsHtml = "", audioHtml = "", ovHtml = "";
  ch.shots.forEach((s, i) => {
    const st = (s.start - o).toFixed(3), du = (s.end - s.start).toFixed(3);
    let inner = "";
    if (!s.black) {
      cp(path.join(ROOT, "library", s.plate), path.join(A, s.plate));
      inner = `<img class="plate" src="assets/${s.plate}" alt="" />` + (s.chars || []).map((c, j) => `<canvas id="s${i}-c${j}" class="char" width="600" height="1000"></canvas>`).join("");
    }
    shotsHtml += `      <div id="s${i}" class="shot clip" data-start="${st}" data-duration="${du}" data-track-index="0"><div id="s${i}-stage" class="stage" style="width:${s.plateW || W}px;height:${s.plateH || H}px">${inner}</div></div>\n`;
  });
  caps.filter(inCh).forEach((c, i) => {
    const r = rel(c);
    capsHtml += `      <div id="cap${i}" class="cap${c.italic ? " sfx" : ""}${c.card ? " card" : ""} clip" data-start="${r.start.toFixed(3)}" data-duration="${(r.end - r.start).toFixed(3)}" data-track-index="1"${c.color ? ` style="color:${c.color}"` : ""}><span>${esc(c.text)}</span></div>\n`;
  });
  notifies.filter(inCh).forEach((x, i) => {
    const r = rel(x);
    ovHtml += `      <div id="nt${i}" class="notify clip" data-start="${r.start.toFixed(3)}" data-duration="${(r.end - r.start).toFixed(3)}" data-track-index="2"><div class="row"><div class="av">${esc((x.who || "?")[0])}</div><div class="who">${esc(x.who || "")}</div><div class="time">${esc(x.time || "")}</div></div><div class="msg">${esc(x.text)}</div></div>\n`;
  });
  overlays.filter(inCh).forEach((x, i) => {
    const r = rel(x);
    ovHtml += `      <div id="ov${i}" class="ov-${x.type} clip" data-start="${r.start.toFixed(3)}" data-duration="${(r.end - r.start).toFixed(3)}" data-track-index="2"></div>\n`;
  });
  let ai = 0;
  for (const a of audio) {
    const d = probe(a.file);
    if (a.start >= ch.end || a.start + d <= ch.start) continue;
    const name = `audio/${path.basename(a.file)}`;
    cp(a.file, path.join(A, name));
    const st = a.start - o, trim = st < 0 ? -st : 0;
    audioHtml += `      <audio id="a${ai++}" class="clip" src="assets/${name}" data-start="${Math.max(0, st).toFixed(3)}"${trim ? ` data-media-start="${trim.toFixed(3)}"` : ""} data-duration="${Math.min(d - trim, D - Math.max(0, st)).toFixed(3)}" data-track-index="3" data-volume="${a.vol}"></audio>\n`;
  }
  const html = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="assets/lib/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #000; }
      #root { width: 100%; height: 100%; position: relative; overflow: hidden; background: #000; }
      .shot { position: absolute; inset: 0; overflow: hidden; background: #000; }
      .stage { position: absolute; left: 0; top: 0; transform-origin: 0 0; }
      .plate { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
      .char { position: absolute; left: 0; top: 0; }
      #fx-dark { position: absolute; inset: 0; background: #000; opacity: 0; z-index: 20; pointer-events: none; }
      #fx-vig { position: absolute; inset: 0; z-index: 21; background: radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%); }
      #fx-grain { position: absolute; inset: 0; z-index: 22; opacity: 0.07; mix-blend-mode: overlay; }
      .cap { position: absolute; left: 90px; right: 90px; top: ${Math.round(H * 0.75)}px; text-align: center; z-index: 30;
        font-family: "Montserrat"; font-weight: 900; font-size: ${W < H ? 74 : 64}px; line-height: 1.12; color: #fff;
        -webkit-text-stroke: 14px #07080f; paint-order: stroke fill; }
      .cap span { display: inline-block; }
      .cap.sfx { font-style: italic; font-size: ${W < H ? 68 : 58}px; }
      .cap.card { top: ${Math.round(H * 0.45)}px; font-size: 64px; }
      .notify { position: absolute; left: 110px; right: 110px; top: 260px; z-index: 25; background: rgba(245,247,252,0.97); border-radius: 44px;
        padding: 34px 38px; box-shadow: 0 30px 80px rgba(0,0,0,0.55); font-family: "Inter"; }
      .notify .row { display: flex; align-items: center; gap: 22px; }
      .notify .av { width: 92px; height: 92px; border-radius: 50%; background: #ffc940; border: 6px solid #1d2340; display: flex; align-items: center;
        justify-content: center; font-weight: 900; font-size: 44px; color: #1d2340; font-family: "Montserrat"; flex-shrink: 0; }
      .notify .who { font-weight: 800; font-size: 44px; color: #111; }
      .notify .time { margin-left: auto; font-size: 32px; color: #777; }
      .notify .msg { margin-top: 20px; font-size: 46px; line-height: 1.3; color: #222; font-weight: 600; }
      .ov-peephole { position: absolute; inset: 0; z-index: 19; background: radial-gradient(circle at 50% 44%, rgba(0,0,0,0) 0, rgba(0,0,0,0) 330px, rgba(0,0,0,0.75) 380px, #000 430px); }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${D.toFixed(3)}" data-width="${W}" data-height="${H}">
${shotsHtml}${ovHtml}      <div id="fx-dark"></div>
      <div id="fx-vig"></div>
      <div id="fx-grain"></div>
${capsHtml}${audioHtml}    </div>
    <script>
      window.STORY = ${JSON.stringify(S)};
      (function () {
        var D = ${D.toFixed(3)}, clock = { t: 0 }, vf = { render: null };
        window.__vf = vf;
        window.__hf = window.__hf || {};
        window.__hf.buildReady = window.__hf.buildReady || {};
        window.__hf.buildReady["main"] = new Promise(function (r) { vf.ready = r; });
        var tl = gsap.timeline({ paused: true });
        tl.to(clock, { t: D, duration: D, ease: "none", onUpdate: function () { if (vf.render) vf.render(clock.t); } }, 0);
        document.querySelectorAll(".cap, .notify").forEach(function (el) {
          tl.fromTo("#" + el.id + (el.classList.contains("cap") ? " span" : ""), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.16, ease: "power2.out" }, parseFloat(el.dataset.start));
        });
        window.__timelines = window.__timelines || {};
        window.__timelines["main"] = tl;
      })();
    </script>
    <script type="module" src="assets/engine/runtime.js"></script>
  </body>
</html>
`;
  fs.writeFileSync(path.join(dir, "index.html"), html);
  fs.writeFileSync(path.join(dir, "hyperframes.json"), JSON.stringify({ paths: { assets: "assets" } }, null, 2));
  return dir;
}
const dirs = chapters.map(writeChapter);
fs.writeFileSync(path.join(OUT, "timeline.json"), JSON.stringify({ total: TOTAL, shots: shots.map((s) => ({ angle: s.src.angle, start: s.start, end: s.end })) }, null, 2));
log(`projects: ${dirs.map((d) => path.relative(ROOT, d)).join(", ")}`);
if (flag("no-render")) process.exit(0);

// ---------- 4. render chapters ----------
const hfArgs = (dir) => (HF ? [HF] : ["hyperframes"]).concat(["render", "-o", "renders/chapter.mp4", "--crf", "20", "--skill", "hyperframes"]);
async function renderDir(dir) {
  const t0 = Date.now();
  await new Promise((res, rej) => {
    const cmd = HF ? process.execPath : "npx";
    const p = spawn(cmd, hfArgs(dir), { cwd: dir, stdio: ["ignore", fs.openSync(path.join(dir, "render.log"), "w"), fs.openSync(path.join(dir, "render.log"), "a")] });
    p.on("exit", (c) => (c === 0 ? res() : rej(new Error(`render failed in ${dir} (see render.log)`))));
  });
  log(`rendered ${path.basename(dir)} in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
const T0 = Date.now();
const queue = [...dirs];
await Promise.all(Array.from({ length: Math.min(JOBS, dirs.length) }, async () => { while (queue.length) await renderDir(queue.shift()); }));

// ---------- 5. concat + ambience + loudness ----------
const list = path.join(OUT, "chapters.txt");
fs.writeFileSync(list, dirs.map((d) => `file '${path.join(d, "renders/chapter.mp4")}'`).join("\n"));
const joined = path.join(OUT, "joined.mp4");
ff(["-f", "concat", "-safe", "0", "-i", list, "-c", "copy", joined]);
const amb = story.ambience || [];
const inputs = ["-i", joined], parts = [];
amb.forEach((a, i) => {
  inputs.push("-stream_loop", "-1", "-i", sfxFile(a.sfx));
  parts.push(`[${i + 1}:a]atrim=0:${blackoutAt.toFixed(3)},afade=t=in:d=2,afade=t=out:st=${Math.max(0, blackoutAt - 0.08).toFixed(3)}:d=0.08,volume=${a.volume ?? 0.5},apad=whole_dur=${TOTAL.toFixed(3)}[m${i}]`);
});
const mix = amb.length ? `${parts.join(";")};[0:a]${amb.map((_, i) => `[m${i}]`).join("")}amix=inputs=${amb.length + 1}:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11[a]` : "[0:a]loudnorm=I=-14:TP=-1.5:LRA=11[a]";
const final = path.join(OUT, `${slug}.mp4`);
ff([...inputs, "-filter_complex", mix, "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", final]);
fs.unlinkSync(joined);

// ---------- 6. review sheet ----------
const sheetDir = path.join(OUT, "sheet");
fs.mkdirSync(sheetDir, { recursive: true });
shots.forEach((s, i) => ff(["-ss", ((s.start + s.end) / 2).toFixed(2), "-i", final, "-frames:v", "1", "-vf", "scale=270:-1", path.join(sheetDir, `${String(i).padStart(3, "0")}.png`)]));
const cols = 8, rows = Math.ceil(shots.length / cols);
ff(["-framerate", "1", "-i", path.join(sheetDir, "%03d.png"), "-vf", `tile=${cols}x${rows}`, "-frames:v", "1", path.join(OUT, "sheet.png")]);
log(`done: ${path.relative(ROOT, final)} (${TOTAL.toFixed(1)} s video, render ${((Date.now() - T0) / 1000).toFixed(0)} s)`);
