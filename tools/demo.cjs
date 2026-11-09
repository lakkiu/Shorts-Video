#!/usr/bin/env node
// Approval sheets.
//   node tools/demo.cjs chars <candidates.json> [out.png]   -> character sheet (N candidates x 3 states)
//   node tools/demo.cjs sets  <candidates.json> [out.png]   -> set sheet (each candidate baked from its hero angle)
// candidates.json: { "candidates": [ { "name", "desc", "spec": {...} }, ... ] }
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");

const ROOT = path.resolve(__dirname, "..");
const [kind, file, outArg] = process.argv.slice(2);
if (!["chars", "sets"].includes(kind) || !file) { console.error("usage: demo.cjs chars|sets <candidates.json> [out.png]"); process.exit(2); }
const abs = path.resolve(file);
if (!abs.startsWith(ROOT)) { console.error("candidates file must be inside the repo"); process.exit(2); }
const out = path.resolve(outArg || abs.replace(/\.json$/, ".png"));
const types = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".woff2": "font/woff2", ".jpg": "image/jpeg", ".png": "image/png" };

const srv = http.createServer((q, r) => {
  const f = path.join(ROOT, decodeURIComponent(q.url.split("?")[0]));
  if (!f.startsWith(ROOT)) { r.writeHead(403); r.end(); return; }
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" }); r.end(d); });
}).listen(0, async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1200 } });
  p.on("pageerror", (e) => console.error("page error:", e.message));
  const rel = "/" + path.relative(ROOT, abs).split(path.sep).join("/");
  await p.goto(`http://127.0.0.1:${srv.address().port}/tools/demo-${kind}.html?file=${encodeURIComponent(rel)}`);
  await p.waitForFunction(() => document.title === "done", null, { timeout: 300000 });
  const el = await p.$("canvas#sheet");
  await el.screenshot({ path: out });
  console.log(`sheet: ${path.relative(ROOT, out)}`);
  await b.close();
  srv.close();
});
