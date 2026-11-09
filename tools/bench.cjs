const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const root = process.argv[2];
const types = {'.html':'text/html','.js':'text/javascript','.woff2':'font/woff2'};
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': types[path.extname(f)] || 'application/octet-stream'}); r.end(d); }); }).listen(0, async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto(`http://127.0.0.1:${srv.address().port}/index.html`); await p.waitForFunction(() => document.title === 'done', null, { timeout: 120000 });
  const ms = await p.evaluate(() => { const c = document.getElementById('gl'); const gl = c.getContext('webgl2'); const px = new Uint8Array(4); const ts = [10, 20, 30, 40, 50, 55, 58]; const t0 = performance.now(); for (const t of ts) { window.__toon.render(t); gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px); } return (performance.now() - t0) / ts.length; });
  const t1 = Date.now(); for (let i = 0; i < 5; i++) await p.screenshot({ type: 'png' }); const shot = (Date.now() - t1) / 5;
  console.log(path.basename(root), 'webgl ms/frame', ms.toFixed(0), '| screenshot ms', shot.toFixed(0));
  await b.close(); srv.close();
});
