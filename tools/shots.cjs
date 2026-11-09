const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const [root, page, outPrefix, w, h, times] = process.argv.slice(2);
const types = {'.html':'text/html','.js':'text/javascript','.woff2':'font/woff2','.png':'image/png'};
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': types[path.extname(f)] || 'application/octet-stream'}); r.end(d); }); }).listen(0, async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: +h } });
  p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => { if (m.type() !== 'log') console.log(m.type(), m.text()); });
  await p.goto(`http://127.0.0.1:${srv.address().port}/${page}`); await p.waitForFunction(() => document.title === 'done', null, { timeout: 120000 });
  for (const t of times.split(',')) { const t0 = Date.now(); await p.evaluate(t => { window.__toon.render(+t); window.__timelines.main.seek(+t); document.querySelectorAll('.clip').forEach(el => { if (el.tagName === 'CANVAS' || el.tagName === 'AUDIO') return; const a = parseFloat(el.dataset.start), d = parseFloat(el.dataset.duration); el.style.visibility = (+t >= a && +t < a + d) ? 'visible' : 'hidden'; }); }, t); await p.screenshot({ path: `${outPrefix}${t}.png` }); console.log('t', t, Date.now() - t0, 'ms'); }
  await b.close(); srv.close();
});
