// Kit-of-parts interiors: a room described as JSON -> toon 3D set with ink outlines (via post.js).
// Room is centred at the origin: x in [-w/2, w/2], z in [-d/2, d/2], floor at y = 0.
// spec = { size: [w, d, h], wall, wainscot?, floor: "wood|tile|carpet|linoleum|tatami", floorColor, ceiling,
//          light: "night-cold|warm-lamp|day|sunset|red-candle", props: [ { kind, at: [x, z], rot?, ...opts } ] }
import * as THREE from "../lib/three.module.min.js";

export const hash = (i, k = 0) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const grad = (() => {
  const d = new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
export const toon = (color, extra = {}) => new THREE.MeshToonMaterial({ color, gradientMap: grad, ...extra });
const basic = (color, extra = {}) => new THREE.MeshBasicMaterial({ color, ...extra });
function canvasTex(w, h, draw, repeat) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
}
const shadeHex = (hex, k) => { const c = new THREE.Color(hex); c.multiplyScalar(k); return `#${c.getHexString()}`; };
const KR = "'Jua', 'WenQuanYi Zen Hei', sans-serif";

export const LIGHTS = {
  "night-cold": { charTint: "rgba(30,40,90,0.22)", hemi: ["#41507a", "#1a1f2a", 0.9], fog: "#070a12", fogNear: 5, fogFar: 26, tint: "#c9d7ff", sat: 0.84, window: "#8fb0e8", winLight: ["#7f9cff", 3] },
  "warm-lamp": { charTint: "rgba(90,50,20,0.15)", hemi: ["#6b5a72", "#2a2020", 0.75], fog: "#120d0c", fogNear: 6, fogFar: 26, tint: "#ffe6cc", sat: 0.95, window: "#2b3a66", winLight: ["#6f8cff", 1.2] },
  day: { charTint: "rgba(0,0,0,0)", hemi: ["#fff6e8", "#b8a888", 1.6], sun: ["#fff1d6", 2.2, [4, 6, 3]], fog: "#dfe8f2", fogNear: 12, fogFar: 40, tint: "#ffffff", sat: 1.05, window: "#cfe8ff", winLight: ["#fff6e0", 3] },
  sunset: { charTint: "rgba(120,50,30,0.15)", hemi: ["#ffb98a", "#4a3050", 1.1], sun: ["#ff9a5a", 2.0, [-4, 3, 2]], fog: "#3a2436", fogNear: 8, fogFar: 30, tint: "#ffd9c0", sat: 1.0, window: "#ff9a6a", winLight: ["#ff8a50", 3] },
  "red-candle": { charTint: "rgba(110,20,20,0.25)", hemi: ["#3a1a22", "#120808", 0.7], fog: "#0b0406", fogNear: 4, fogFar: 20, tint: "#ffc9c0", sat: 0.9, window: "#2a1630", winLight: ["#7a3050", 1.0] },
};

function floorTex(kind, color) {
  return canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = color; c.fillRect(0, 0, w, h);
    if (kind === "wood") {
      for (let i = 0; i < 8; i++) { c.fillStyle = shadeHex(color, 0.85 + hash(i, 1) * 0.25); c.fillRect(0, i * 32 + 1, w, 30); c.fillStyle = "rgba(0,0,0,0.35)"; c.fillRect(0, i * 32, w, 2); c.fillRect(hash(i, 2) * w, i * 32, 2, 32); }
    } else if (kind === "tile" || kind === "linoleum") {
      const n = kind === "tile" ? 4 : 2, s = w / n;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { c.fillStyle = shadeHex(color, (i + j) % 2 ? 0.88 : 1.05); c.fillRect(i * s + 2, j * s + 2, s - 4, s - 4); }
    } else if (kind === "tatami") {
      c.strokeStyle = "rgba(60,50,20,0.25)"; c.lineWidth = 2; for (let y = 0; y < h; y += 6) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
      c.fillStyle = "#3b5a3a"; c.fillRect(0, 0, w, 12); c.fillRect(0, h - 12, w, 12);
    } else {
      for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(0,0,0,${hash(i, 5) * 0.08})`; c.fillRect(hash(i, 6) * w, hash(i, 7) * h, 3, 3); }
    }
  }, [2, 2]);
}
function wallTex(wall, wainscot) {
  return canvasTex(256, 512, (c, w, h) => {
    c.fillStyle = wall; c.fillRect(0, 0, w, h);
    if (wainscot) { c.fillStyle = wainscot; c.fillRect(0, h * 0.62, w, h * 0.38); c.fillStyle = shadeHex(wainscot, 0.7); c.fillRect(0, h * 0.61, w, 8); }
    c.fillStyle = shadeHex(wainscot || wall, 0.55); c.fillRect(0, h - 16, w, 16);
    for (let i = 0; i < 30; i++) { c.fillStyle = `rgba(40,30,20,${hash(i, 8) * 0.06})`; c.fillRect(hash(i, 9) * w, hash(i, 10) * h * 0.6, 3 + hash(i, 11) * 30, 3 + hash(i, 12) * 50); }
  });
}

// ---------- props ----------
const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const cyl = (r1, r2, h, m, seg = 16) => new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m);
const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };

const PROPS = {
  bed: (o) => { const g = new THREE.Group(); const c = o.color || "#4c5a8a";
    g.add(at(box(1.0, 0.3, 2.0, toon("#6b5240")), 0, 0.15, 0), at(box(0.96, 0.18, 1.9, toon(c)), 0, 0.39, 0.03), at(box(0.7, 0.12, 0.38, toon("#e9ecf2")), 0, 0.52, -0.72), at(box(1.0, 0.8, 0.08, toon("#6b5240")), 0, 0.4, -1.0)); return g; },
  desk: (o) => { const g = new THREE.Group(); const m = toon(o.color || "#8a6a4f");
    g.add(at(box(1.3, 0.06, 0.6, m), 0, 0.76, 0)); for (const s of [-1, 1]) g.add(at(box(0.05, 0.74, 0.55, toon(shadeHex(o.color || "#8a6a4f", 0.8))), s * 0.6, 0.37, 0)); return g; },
  chair: (o) => { const g = new THREE.Group(); const m = toon(o.color || "#6b5240");
    g.add(at(box(0.45, 0.05, 0.45, m), 0, 0.46, 0), at(box(0.45, 0.5, 0.05, m), 0, 0.72, -0.2)); for (const [x, z] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) g.add(at(box(0.04, 0.46, 0.04, m), x, 0.23, z)); return g; },
  wardrobe: (o) => { const g = new THREE.Group(); const c = o.color || "#7a5c44";
    g.add(at(box(1.1, 2.0, 0.55, toon(c)), 0, 1.0, 0)); g.add(at(box(0.02, 1.9, 0.01, toon(shadeHex(c, 0.6))), 0, 1.0, 0.28)); for (const s of [-1, 1]) g.add(at(box(0.04, 0.2, 0.04, toon("#d9b65a")), s * 0.08, 1.05, 0.29)); return g; },
  shelf: (o) => { const g = new THREE.Group(); const m = toon(o.color || "#8a6a4f");
    g.add(at(box(1.0, 1.6, 0.3, m), 0, 0.8, 0)); for (let k = 0; k < 4; k++) for (let b = 0; b < 7; b++) { const h = 0.22 + hash(b, k) * 0.1; g.add(at(box(0.1, h, 0.22, toon(["#c0392b", "#2f6fdb", "#1f9d6b", "#e8c45a", "#7a4fd1"][(b + k) % 5])), -0.38 + b * 0.12, 0.2 + k * 0.38 + h / 2, 0.02)); } return g; },
  lamp: (o, ctx) => { const g = new THREE.Group();
    g.add(at(cyl(0.08, 0.1, 0.03, toon("#2c3e50")), 0, 0.015, 0), at(cyl(0.012, 0.012, 0.4, toon("#2c3e50"), 6), 0, 0.2, 0));
    const head = at(new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.14, 12, 1, true), toon(o.color || "#e67e22", { side: THREE.DoubleSide })), 0.04, 0.4, 0); head.rotation.z = 0.5; g.add(head);
    ctx.light(g, [0.06, 0.32, 0], o.light || "#ffb36b", o.intensity ?? 3.2, 4.5); return g; },
  "floor-lamp": (o, ctx) => { const g = new THREE.Group();
    g.add(at(cyl(0.15, 0.18, 0.04, toon("#2c3e50")), 0, 0.02, 0), at(cyl(0.02, 0.02, 1.5, toon("#2c3e50"), 6), 0, 0.77, 0), at(cyl(0.16, 0.24, 0.3, toon(o.color || "#f3e3c3", { side: THREE.DoubleSide }), 16), 0, 1.55, 0));
    ctx.light(g, [0, 1.45, 0], o.light || "#ffcf8a", o.intensity ?? 4, 5); return g; },
  "ceiling-light": (o, ctx) => { const g = new THREE.Group(); const on = o.on !== false;
    g.add(at(box(0.22, 0.06, 1.2, basic(on ? "#eaf6ff" : "#556")), 0, ctx.h - 0.04, 0)); if (on) ctx.light(g, [0, ctx.h - 0.3, 0], o.light || "#cfe6ff", o.intensity ?? 5, 7); return g; },
  window: (o, ctx) => { const g = new THREE.Group(); const L = ctx.L;
    g.add(at(box(1.3, 1.0, 0.04, basic(o.color || L.window)), 0, 1.55, 0), at(box(1.42, 0.08, 0.1, toon("#e9e2cf")), 0, 2.07, 0.03), at(box(1.42, 0.08, 0.14, toon("#e9e2cf")), 0, 1.03, 0.05), at(box(0.05, 1.0, 0.06, toon("#e9e2cf")), 0, 1.55, 0.03));
    if (o.curtain !== false) for (const s of [-1, 1]) g.add(at(box(0.35, 1.3, 0.05, toon(o.curtain || "#8a3b4a")), s * 0.72, 1.45, 0.08));
    ctx.light(g, [0, 1.6, 0.6], L.winLight[0], L.winLight[1], 5); return g; },
  door: (o) => { const g = new THREE.Group(); const c = o.color || "#8a6a4f";
    g.add(at(box(0.98, 2.05, 0.06, toon(c)), 0, 1.025, 0), at(new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), toon("#d9b65a")), 0.38, 1.0, 0.05));
    for (const s of [-1, 1]) g.add(at(box(0.07, 2.16, 0.14, toon("#5b4636")), s * 0.53, 1.08, 0)); g.add(at(box(1.13, 0.08, 0.14, toon("#5b4636")), 0, 2.12, 0)); return g; },
  mirror: (o) => { const g = new THREE.Group(); g.add(at(box(0.6, 0.9, 0.04, toon("#5b4636")), 0, 1.5, 0), at(box(0.52, 0.82, 0.02, basic(o.color || "#9fb4cf")), 0, 1.5, 0.025)); return g; },
  sink: () => { const g = new THREE.Group(); g.add(at(box(0.6, 0.18, 0.45, toon("#eef2f5")), 0, 0.82, 0), at(cyl(0.06, 0.08, 0.72, toon("#eef2f5")), 0, 0.36, 0), at(cyl(0.015, 0.015, 0.2, toon("#b8c2cc"), 6), 0, 1.0, -0.15)); return g; },
  toilet: () => { const g = new THREE.Group(); g.add(at(cyl(0.2, 0.16, 0.4, toon("#eef2f5")), 0, 0.2, 0.1), at(box(0.42, 0.45, 0.2, toon("#eef2f5")), 0, 0.62, -0.18), at(cyl(0.21, 0.21, 0.04, toon("#dfe5ea")), 0, 0.42, 0.1)); return g; },
  bathtub: () => { const g = new THREE.Group(); g.add(at(box(1.6, 0.55, 0.75, toon("#eef2f5")), 0, 0.28, 0), at(box(1.45, 0.05, 0.6, basic("#22303d")), 0, 0.56, 0)); return g; },
  sofa: (o) => { const g = new THREE.Group(); const m = toon(o.color || "#7a4a5a");
    g.add(at(box(1.8, 0.4, 0.8, m), 0, 0.25, 0), at(box(1.8, 0.5, 0.2, m), 0, 0.65, -0.3)); for (const s of [-1, 1]) g.add(at(box(0.2, 0.55, 0.8, m), s * 0.9, 0.35, 0)); return g; },
  tv: (o) => { const g = new THREE.Group(); g.add(at(box(1.0, 0.45, 0.4, toon("#5b4636")), 0, 0.22, 0), at(box(1.1, 0.65, 0.06, toon("#1b1d22")), 0, 0.82, 0), at(box(1.0, 0.56, 0.02, basic(o.on ? "#8fa8c8" : "#0d0f14")), 0, 0.82, 0.035)); return g; },
  table: (o) => { const g = new THREE.Group(); const m = toon(o.color || "#8a6a4f"); g.add(at(box(1.2, 0.06, 0.8, m), 0, 0.72, 0)); for (const [x, z] of [[-0.55, -0.35], [0.55, -0.35], [-0.55, 0.35], [0.55, 0.35]]) g.add(at(box(0.06, 0.7, 0.06, m), x, 0.35, z)); return g; },
  rug: (o) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(o.w || 1.8, o.d || 1.2), toon(o.color || "#a34a4a")); m.rotation.x = -Math.PI / 2; m.position.y = 0.005; const g = new THREE.Group(); g.add(m); return g; },
  plant: () => { const g = new THREE.Group(); g.add(at(cyl(0.16, 0.12, 0.3, toon("#c26b4a")), 0, 0.15, 0)); for (let k = 0; k < 5; k++) g.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 1), toon("#3f8f5a")), (hash(k, 1) - 0.5) * 0.25, 0.42 + hash(k, 2) * 0.3, (hash(k, 3) - 0.5) * 0.25)); return g; },
  fridge: () => { const g = new THREE.Group(); g.add(at(box(0.7, 1.8, 0.65, toon("#e3e7ea")), 0, 0.9, 0), at(box(0.04, 0.5, 0.04, toon("#9aa3ad")), 0.28, 1.2, 0.34)); return g; },
  altar: (o, ctx) => { // Vietnamese family altar: red cabinet, framed portrait, incense bowl, candles
    const g = new THREE.Group();
    g.add(at(box(1.2, 0.9, 0.5, toon("#7a1f1f")), 0, 0.45, 0), at(box(1.3, 0.06, 0.55, toon("#c9a24a")), 0, 0.92, 0));
    g.add(at(box(0.4, 0.5, 0.04, toon("#c9a24a")), 0, 1.25, -0.15), at(box(0.32, 0.42, 0.02, basic(o.portrait || "#3a3a44")), 0, 1.25, -0.125));
    g.add(at(cyl(0.1, 0.08, 0.1, toon("#c9a24a")), 0, 1.0, 0.08));
    for (let k = 0; k < 3; k++) g.add(at(cyl(0.005, 0.005, 0.3, basic("#c0392b"), 4), -0.03 + k * 0.03, 1.2, 0.08));
    for (const s of [-1, 1]) { g.add(at(cyl(0.03, 0.03, 0.18, toon("#f3e3c3"), 8), s * 0.42, 1.04, 0.05)); g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), basic("#ffcf6a")), s * 0.42, 1.16, 0.05)); }
    ctx.light(g, [0, 1.2, 0.3], "#ff9a4a", o.intensity ?? 2.5, 3.5); return g; },
  candle: (o, ctx) => { const g = new THREE.Group(); g.add(at(cyl(0.04, 0.04, 0.2, toon("#f3e3c3"), 8), 0, 0.1, 0), at(new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), basic("#ffcf6a")), 0, 0.23, 0)); ctx.light(g, [0, 0.3, 0], "#ff9a4a", o.intensity ?? 1.6, 2.5); return g; },
  lantern: (o, ctx) => { const g = new THREE.Group(); const y = o.y ?? 2.2; g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), basic(o.color || "#e5484d")), 0, y, 0)); g.children[0].scale.y = 1.25; g.add(at(cyl(0.12, 0.12, 0.05, toon("#2a1a14")), 0, y + 0.29, 0), at(cyl(0.12, 0.12, 0.05, toon("#2a1a14")), 0, y - 0.29, 0)); ctx.light(g, [0, y - 0.1, 0], "#ff6a4a", o.intensity ?? 2.2, 4); return g; },
  frame: (o) => { const g = new THREE.Group(); const tex = canvasTex(256, 320, (c, w, h) => { c.fillStyle = o.bg || "#d9cfb8"; c.fillRect(0, 0, w, h); if (o.text) { c.fillStyle = "#3a2a20"; c.font = `64px ${KR}`; c.textAlign = "center"; c.textBaseline = "middle"; [...o.text].forEach((ch, i, a) => c.fillText(ch, w / 2, h / 2 + (i - (a.length - 1) / 2) * 70)); } else { c.fillStyle = "#6b5a4a"; c.beginPath(); c.arc(w / 2, h * 0.4, 50, 0, 7); c.fill(); c.fillRect(w / 2 - 70, h * 0.58, 140, 120); } });
    g.add(at(box(0.5, 0.62, 0.04, toon("#5b4636")), 0, o.y ?? 1.6, 0), at(new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.54), toon("#ffffff", { map: tex })), 0, o.y ?? 1.6, 0.025)); return g; },
  poster: (o) => { const g = new THREE.Group(); const tex = canvasTex(256, 360, (c, w, h) => { c.fillStyle = o.bg || "#f3ead2"; c.fillRect(0, 0, w, h); c.fillStyle = o.ink || "#c0392b"; c.font = `56px ${KR}`; c.textAlign = "center"; (o.lines || ["공지"]).forEach((l, i) => c.fillText(l, w / 2, 80 + i * 70)); });
    g.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.6), toon("#ffffff", { map: tex })), 0, o.y ?? 1.5, 0)); return g; },
  clock: (o) => { const g = new THREE.Group(); const tex = canvasTex(256, 128, (c, w, h) => { c.fillStyle = "#111"; c.fillRect(0, 0, w, h); c.fillStyle = "#ff3b3b"; c.font = "bold 88px monospace"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(o.text || "03:00", w / 2, h / 2 + 4); });
    g.add(at(box(0.3, 0.15, 0.08, toon("#222")), 0, o.y ?? 0.865, 0), at(new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.12), basic("#fff", { map: tex })), 0, o.y ?? 0.865, 0.041)); return g; },
  stool: (o) => { const g = new THREE.Group(); g.add(at(cyl(0.18, 0.18, 0.05, toon(o.color || "#c0392b")), 0, 0.45, 0), at(cyl(0.03, 0.03, 0.45, toon("#555"), 6), 0, 0.22, 0)); return g; },
};

// ---------- build ----------
export function buildSet(scene, spec) {
  const [w, d, h] = spec.size || [4, 5, 2.7];
  const L = LIGHTS[spec.light || "night-cold"];
  const g = new THREE.Group(); scene.add(g);
  scene.fog = new THREE.Fog(L.fog, L.fogNear, L.fogFar); scene.background = new THREE.Color(L.fog);
  scene.add(new THREE.HemisphereLight(L.hemi[0], L.hemi[1], L.hemi[2]));
  if (L.sun) { const s = new THREE.DirectionalLight(L.sun[0], L.sun[1]); s.position.set(...L.sun[2]); scene.add(s); }
  const lights = [];
  const ctx = { L, h, light: (parent, p, color, intensity, dist) => { const pl = new THREE.PointLight(color, intensity, dist, 1.6); pl.position.set(...p); parent.add(pl); lights.push({ pl, base: intensity }); } };

  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), toon("#ffffff", { map: floorTex(spec.floor || "wood", spec.floorColor || "#a0785a") }));
  fl.rotation.x = -Math.PI / 2; g.add(fl);
  const ce = new THREE.Mesh(new THREE.PlaneGeometry(w, d), toon(spec.ceiling || "#d9d6cf")); ce.rotation.x = Math.PI / 2; ce.position.y = h; g.add(ce);
  const wt = wallTex(spec.wall || "#e9e2cf", spec.wainscot);
  const walls = { back: [w, [0, h / 2, -d / 2], 0], front: [w, [0, h / 2, d / 2], Math.PI], left: [d, [-w / 2, h / 2, 0], Math.PI / 2], right: [d, [w / 2, h / 2, 0], -Math.PI / 2] };
  for (const [name, [len, pos, ry]] of Object.entries(walls)) {
    const t = wt.clone(); t.needsUpdate = true; t.wrapS = THREE.RepeatWrapping; t.repeat.set(len / 2, 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(len, h), toon("#ffffff", { map: t })); m.position.set(...pos); m.rotation.y = ry; m.userData.wall = name; g.add(m);
  }
  // props: "wall" props snap flush to a wall (back|left|right|front) at a position along it
  const props = [];
  for (const p of spec.props || []) {
    const make = PROPS[p.kind]; if (!make) { console.warn("unknown prop", p.kind); continue; }
    const o = make(p, ctx);
    if (p.wall) {
      const along = p.along ?? 0, off = p.offset ?? 0.02;
      if (p.wall === "back") { o.position.set(along, 0, -d / 2 + off); }
      if (p.wall === "front") { o.position.set(along, 0, d / 2 - off); o.rotation.y = Math.PI; }
      if (p.wall === "left") { o.position.set(-w / 2 + off, 0, along); o.rotation.y = Math.PI / 2; }
      if (p.wall === "right") { o.position.set(w / 2 - off, 0, along); o.rotation.y = -Math.PI / 2; }
    } else { o.position.set(p.at?.[0] || 0, 0, p.at?.[1] || 0); o.rotation.y = ((p.rot || 0) * Math.PI) / 180; }
    g.add(o); props.push(o);
  }
  // hide props that would sit in front of the lens (sight-line culling)
  const cull = (camPos, r = 0.85) => { for (const o of props) { const b = new THREE.Box3().setFromObject(o), c = b.getCenter(new THREE.Vector3()); const dx = Math.max(b.min.x - camPos.x, 0, camPos.x - b.max.x), dz = Math.max(b.min.z - camPos.z, 0, camPos.z - b.max.z); o.visible = Math.hypot(dx, dz) > r * 0.5 && Math.hypot(c.x - camPos.x, c.z - camPos.z) > r; } };
  return { lights, props, cull, post: { tint: L.tint, sat: L.sat, charTint: L.charTint } };
}

// default camera angles and marks for demos / new sets
export function defaultMarks(spec) {
  const [w, d] = spec.size || [4, 5, 2.7];
  return { center: [0, 0], left: [-w * 0.25, -d * 0.05], right: [w * 0.25, -d * 0.05], back: [0, -d * 0.3], front: [0, d * 0.2] };
}
export function defaultAngles(spec) {
  const [w, d] = spec.size || [4, 5, 2.7];
  return {
    wide: { desc: "Toàn cảnh từ phía trước phòng", pos: [w * 0.18, 1.45, d * 0.47], look: [-w * 0.06, 0.8, -d * 0.3], fov: 62, marks: ["center", "left", "right", "back"] },
    front: { desc: "Chính diện vào tường sau", pos: [0, 1.1, d * 0.46], look: [0, 0.9, -d / 2], fov: 50, marks: ["center", "back", "front"] },
    "left-wall": { desc: "Nhìn về tường trái", pos: [w * 0.4, 1.05, 0.2], look: [-w / 2, 0.85, -0.1], fov: 52, marks: ["left", "center"] },
    "right-wall": { desc: "Nhìn về tường phải", pos: [-w * 0.4, 1.05, 0.2], look: [w / 2, 0.85, -0.1], fov: 52, marks: ["right", "center"] },
    low: { desc: "Góc thấp sát sàn nhìn lên", pos: [w * 0.15, 0.45, d * 0.4], look: [0, 1.0, -d * 0.4], fov: 56, marks: ["center", "back"] },
  };
}
