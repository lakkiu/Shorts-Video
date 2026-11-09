// 2.5D runtime: baked plates + 2D canvas characters + DOM overlays, driven by window.STORY (timed by make.mjs).
// Every visual is a pure function of t.
import { CAST, POSE, drawCharacter, drawGhost } from "./characters.js";

const S = window.STORY;
const W = S.width, H = S.height;
const sm = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * x * (x * (x * 6 - 15) + 10); };
const lerp = (a, b, k) => a + (b - a) * k;
const hash = (i, k = 0) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const flick = (t, i, rate, thr) => (hash(Math.floor(t * rate), i + 7) > thr ? 1 : 0);

const MOVES = {
  hold: { zoom: [1.04, 1.04], pan: [[0, 0], [0, 0]] },
  drift: { zoom: [1.03, 1.08], pan: [[0, 0], [0.1, -0.05]] },
  push: { zoom: [1.0, 1.14], pan: [[0, 0], [0, 0]] },
  "push-fast": { zoom: [1.0, 1.22], pan: [[0, 0], [0, 0]] },
  pull: { zoom: [1.14, 1.0], pan: [[0, 0], [0, 0]] },
  "pan-left": { zoom: [1.12, 1.12], pan: [[0.8, 0], [-0.8, 0]] },
  "pan-right": { zoom: [1.12, 1.12], pan: [[-0.8, 0], [0.8, 0]] },
  "tilt-down": { zoom: [1.12, 1.12], pan: [[0, -0.8], [0, 0.8]] },
  "tilt-up": { zoom: [1.12, 1.12], pan: [[0, 0.8], [0, -0.8]] },
};
const MOODS = {
  neutral: { eyes: "open", mouth: "flat" },
  calm: { eyes: "open", mouth: "smile" },
  happy: { eyes: "happy", mouth: "smile" },
  excited: { eyes: "happy", mouth: "open" },
  surprised: { eyes: "open", mouth: "o" },
  wow: { eyes: "wow", mouth: "open" },
  scared: { eyes: "scared", mouth: "wobble", sweat: 1, tremble: 1.5 },
  worried: { eyes: "scared", mouth: "o", sweat: 0.6, tremble: 0.6 },
  relieved: { eyes: "closed", mouth: "smile", tilt: -6 },
  sleepy: { eyes: "closed", mouth: "flat" },
};
const POSES = {
  idle: { armL: 10, armR: -8, elbowL: 0, elbowR: 0 },
  wave: { armL: 10, armR: 150, elbowL: 0, elbowR: 20, waveR: 1 },
  "arms-up": { armL: 130, armR: 130, elbowL: -40, elbowR: 40 },
  reach: { armL: 10, armR: 70, elbowL: 0, elbowR: 10 },
  phone: { armL: 10, armR: -8, elbowL: 0, elbowR: 0, phone: 1 },
  "phone-off": { armL: 10, armR: -8, elbowL: 0, elbowR: 0, phone: 0.2 },
  cower: { armL: 25, armR: 30, elbowL: -60, elbowR: 70 },
  point: { armL: 10, armR: 95, elbowL: 0, elbowR: 0 },
};

// ---- per-shot elements ----
const shots = S.shots.map((s, i) => {
  const stage = document.getElementById(`s${i}-stage`);
  const chars = (s.chars || []).map((c, j) => {
    const cv = document.getElementById(`s${i}-c${j}`);
    return { ...c, cv, ctx: cv.getContext("2d") };
  });
  return { ...s, stage, chars };
});
const dark = document.getElementById("fx-dark");
const grain = document.getElementById("fx-grain");

// grain texture, generated once (seeded)
(() => {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d"), d = g.createImageData(256, 256);
  for (let i = 0; i < 256 * 256; i++) { const v = 128 + (hash(i, 3) - 0.5) * 255; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }
  g.putImageData(d, 0, 0);
  if (grain) grain.style.backgroundImage = `url(${c.toDataURL()})`;
})();

function markAt(c, lt) {
  const a = c.from;
  if (!c.to) return a;
  const k = sm((lt - c.walkAt) / c.walkDur);
  return { x: lerp(a.x, c.to.x, k), y: lerp(a.y, c.to.y, k), pxPerM: lerp(a.pxPerM, c.to.pxPerM, k), walking: lt > c.walkAt && lt < c.walkAt + c.walkDur };
}

function charState(c, t) {
  let st = { mood: c.mood || "neutral", pose: c.pose || "idle", look: c.look ?? 0, lookDown: false };
  for (const k of c.keys || []) if (t >= k.at) st = { ...st, ...k };
  return st;
}

function drawChar(c, t, lt, shotIndex) {
  const st = charState(c, t);
  const m = markAt(c, lt);
  const hM = c.height || (c.ghost ? 2.0 : 1.6);
  const hp = m.pxPerM * hM, wp = hp * 0.6;
  const el = c.cv;
  el.style.width = `${wp}px`; el.style.height = `${hp}px`;
  el.style.transform = `translate(${m.x - wp / 2}px, ${m.y - hp * 0.975}px)`;
  if (c.ghost) {
    const a = c.fadeAt != null ? sm((t - c.fadeAt) / (c.fadeDur || 2)) : 1;
    const f = S.fx.some((x) => x.type === "flicker" && t >= x.start && t < x.end) ? lerp(0.7, 1, 1 - flick(t, 3, 16, 0.55)) : 1;
    el.style.opacity = String(0.9 * a * f);
    drawGhost(c.ctx, { sway: Math.sin(t * 0.9) * 0.6, eye: st.mood === "stare" ? 1 : 0.6 + 0.4 * sm((t - (c.fadeAt || 0) - 2.5) / 0.5), tilt: -9 + Math.sin(t * 0.7) * 2 }, t);
  } else {
    const spec = (S.cast && S.cast[c.char]) || CAST[c.char] || {};
    if (spec.ghostly) {
      const a = c.fadeAt != null ? sm((t - c.fadeAt) / (c.fadeDur || 2)) : 1;
      const f = S.fx.some((x) => x.type === "flicker" && t >= x.start && t < x.end) ? lerp(0.65, 1, 1 - flick(t, 3, 16, 0.55)) : 1;
      el.style.opacity = String((spec.opacity ?? 0.88) * a * f);
    }
    const md = MOODS[st.mood] || MOODS.neutral, ps = POSES[st.pose] || POSES.idle;
    const talking = S.talk.some((x) => x.who === c.who && t >= x.start && t < x.end);
    const blink = md.eyes === "open" && hash(Math.floor((t + shotIndex * 1.7) / 0.13), 11 + shotIndex) > 0.955;
    const tremble = md.tremble ? Math.sin(t * 40) * md.tremble : 0;
    const sweatK = md.sweat ? Math.min(1, (t - (st.at ?? t)) / 2 + 0.2) * md.sweat : 0;
    drawCharacter(c.ctx, (S.cast && S.cast[c.char]) || CAST[c.char], {
      ...POSE, ...ps,
      elbowR: ps.waveR ? 20 + Math.sin(t * 9) * 22 : ps.elbowR,
      walk: t * 1.1, moving: m.walking ? 1 : 0,
      eyes: blink ? "closed" : md.eyes,
      mouth: talking ? (Math.floor(t * 7) % 2 ? "open" : "smile") : md.mouth,
      look: st.look, lookDown: !!st.lookDown,
      lean: tremble + (st.lean || 0), tilt: st.tilt ?? md.tilt ?? 0,
      sweat: sweatK, bob: st.pose === "arms-up" ? Math.max(0, Math.sin((t - (st.at || 0)) * Math.PI / 0.4)) * 30 * (t - (st.at || 0) < 0.4 ? 1 : 0) : 0,
    }, t);
    // scene tint so the flat card sits in the plate's light
    const tint = c.tint || S.shots[shotIndex].tint || S.tint;
    if (tint) {
      c.ctx.save(); c.ctx.globalCompositeOperation = "source-atop"; c.ctx.fillStyle = tint; c.ctx.fillRect(0, 0, 600, 1000); c.ctx.restore();
    }
  }
}

function render(t) {
  const i = shots.findIndex((s) => t >= s.start && t < s.end);
  const s = shots[i < 0 ? shots.length - 1 : i];
  const si = i < 0 ? shots.length - 1 : i;
  const lt = t - s.start, k = sm(lt / (s.end - s.start));
  const mv = typeof s.move === "object" ? s.move : MOVES[s.move || "drift"] || MOVES.drift;
  const z = lerp(mv.zoom[0], mv.zoom[1], k);
  const px = lerp(mv.pan[0][0], mv.pan[1][0], k), py = lerp(mv.pan[0][1], mv.pan[1][1], k);
  const base = W / s.plateW, sc = base * z;
  let tx = -(s.plateW * sc - W) * (0.5 + px / 2), ty = -(s.plateH * sc - H) * (0.5 + py / 2);
  // impact shake
  for (const sh of S.shakes) if (t >= sh && t < sh + 0.25) { const e = Math.exp(-(t - sh) * 18) * 14; tx += Math.sin(t * 90) * e; ty += Math.cos(t * 77) * e; }
  s.stage.style.transform = `translate(${tx}px, ${ty}px) scale(${sc})`;

  // characters: far first
  const order = [...s.chars].sort((a, b) => b.depth - a.depth);
  order.forEach((c, n) => { c.cv.style.zIndex = String(2 + n); c.cv.style.visibility = c.showAt != null && t < c.showAt ? "hidden" : "visible"; drawChar(c, t, lt, si); });

  // lighting overlay: flicker / blackout / dim
  let d = s.dim || 0;
  for (const f of S.fx) {
    if (t < f.start || t >= f.end) continue;
    if (f.type === "flicker") d = Math.max(d, flick(t, 1, f.rate || 14, f.threshold ?? 0.62) * (f.depth ?? 0.6));
    if (f.type === "blackout") d = 1;
  }
  dark.style.opacity = String(d);
  if (grain) grain.style.backgroundPosition = `${Math.floor(hash(Math.floor(t * 30), 1) * 256)}px ${Math.floor(hash(Math.floor(t * 30), 2) * 256)}px`;
}

window.__vf.render = render;
render(0);
window.__vf.ready();
