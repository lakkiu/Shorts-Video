// Minimal "mono" style kit: stick figures with keyframed poses, a dark room with a hanging bulb, wall clock,
// reflective floor and glowing accent props. Pure Canvas2D — renders fast without a GPU.
export const C = {
  wallTop: "#06080c", wallBot: "#141922", floor: "#0a0c10", line: "#1c222c",
  white: "#f1efe8", gray: "#6c7380", ink: "#050608", accent: "#f5a524", accentDim: "#7a5a22", light: "#fff3d6",
};
const rad = (d) => (d * Math.PI) / 180;
export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
export const lerp = (a, b, k) => a + (b - a) * k;
export const hash = (i, k = 0) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };

// ---- poses: world angles in degrees from straight down, forward = +; lean/tilt from upright ----
export const POSES = {
  stand: { lean: 0, tilt: 0, aF: [10, 8], aB: [-10, 8], lF: [5, 0], lB: [-5, 0] },
  sit: { lean: 5, tilt: 4, aF: [25, 45], aB: [15, 45], lF: [88, -88], lB: [80, -80], seat: true },
  phone: { lean: 18, tilt: 24, aF: [40, 110], aB: [30, 115], lF: [88, -88], lB: [80, -80], seat: true, phone: 1 },
  slumpSit: { lean: 38, tilt: 34, aF: [6, 0], aB: [2, 0], lF: [88, -88], lB: [80, -80], seat: true },
  slump: { lean: 28, tilt: 30, aF: [4, 0], aB: [0, 0], lF: [8, -6], lB: [-4, -2] },
  hold: { lean: 4, tilt: 6, aF: [62, 58], aB: [52, 66], lF: [6, 0], lB: [-6, 0], carry: 1 },
  throw: { lean: 10, tilt: -8, aF: [150, 12], aB: [140, 14], lF: [14, 0], lB: [-10, 0] },
  lift: { lean: 0, tilt: -16, aF: [172, 4], aB: [166, 6], lF: [6, 0], lB: [-6, 0], carryUp: 1 },
  lookUp: { lean: -4, tilt: -38, aF: [8, 6], aB: [-6, 6], lF: [5, 0], lB: [-5, 0] },
  victory: { lean: -4, tilt: -20, aF: [172, 0], aB: [20, 10], lF: [10, 0], lB: [-8, 0] },
  reach: { lean: 6, tilt: -4, aF: [92, 0], aB: [-8, 8], lF: [8, 0], lB: [-6, 0] },
  walkA: { lean: 4, tilt: 0, aF: [-22, 10], aB: [22, 10], lF: [26, -8], lB: [-20, -28] },
  walkB: { lean: 4, tilt: 0, aF: [22, 10], aB: [-22, 10], lF: [-20, -28], lB: [26, -8] },
};
const KEYS = ["lean", "tilt"];
export function mixPose(a, b, k) {
  const o = { ...b };
  for (const key of KEYS) o[key] = lerp(a[key] ?? 0, b[key] ?? 0, k);
  for (const key of ["aF", "aB", "lF", "lB"]) o[key] = [lerp(a[key][0], b[key][0], k), lerp(a[key][1], b[key][1], k)];
  o.phone = lerp(a.phone || 0, b.phone || 0, k);
  o.carry = k < 0.5 ? a.carry : b.carry; o.carryUp = k < 0.5 ? a.carryUp : b.carryUp;
  return o;
}

// keyframed track: [{ t, pose, x, y, dir, blend, move }]; move = seconds to glide from previous x/y
export function trackAt(track, t, walkRate = 2.6) {
  let i = 0;
  while (i + 1 < track.length && track[i + 1].t <= t) i++;
  const k = track[i], p = track[Math.max(0, i - 1)];
  const bk = i === 0 ? 1 : smooth((t - k.t) / (k.blend ?? 0.22));
  const mk = i === 0 || !k.move ? 1 : smooth((t - k.t) / k.move);
  let pose;
  if (k.pose === "walk") {
    const ph = (Math.sin((t - k.t) * walkRate * Math.PI) + 1) / 2;
    pose = mixPose(POSES.walkA, POSES.walkB, ph);
    if (mk >= 1) pose = mixPose(pose, POSES[k.then || "stand"], smooth((t - k.t - k.move) / 0.2));
  } else pose = POSES[k.pose];
  const prevPose = p.pose === "walk" ? POSES[p.then || "stand"] : POSES[p.pose];
  pose = mixPose(prevPose, pose, bk);
  return { pose, x: lerp(p.x, k.x, mk), y: lerp(p.y, k.y, mk), dir: k.dir ?? p.dir ?? 1 };
}

// ---- figure ----
const L = { torso: 118, ua: 60, fa: 56, th: 74, sh: 72, head: 34 };
const dv = (a, len, dir) => [Math.sin(rad(a)) * len * dir, Math.cos(rad(a)) * len];
export function figure(ctx, { x, y, dir = 1, pose, color = C.white, scale = 1, glow = 0 }) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(scale, scale);
  const back = shadeHex(color, 0.72);
  const neck = [Math.sin(rad(pose.lean)) * L.torso * dir, -Math.cos(rad(pose.lean)) * L.torso];
  const sh = [neck[0] - Math.sin(rad(pose.lean)) * 10 * dir, neck[1] + Math.cos(rad(pose.lean)) * 10];
  const head = [neck[0] + Math.sin(rad(pose.lean + pose.tilt)) * (L.head + 8) * dir, neck[1] - Math.cos(rad(pose.lean + pose.tilt)) * (L.head + 8)];
  const limb = (o, a1, a2, l1, l2, col, w) => {
    const e = [o[0] + dv(a1, l1, dir)[0], o[1] + dv(a1, l1, dir)[1]];
    const h = [e[0] + dv(a1 + a2, l2, dir)[0], e[1] + dv(a1 + a2, l2, dir)[1]];
    stroke(ctx, [o, e, h], w, col);
    return h;
  };
  if (glow) { ctx.shadowColor = color; ctx.shadowBlur = glow; }
  const hB = limb(sh, pose.aB[0], pose.aB[1], L.ua, L.fa, back, 19);
  limb([0, 0], pose.lB[0], pose.lB[1], L.th, L.sh, back, 21);
  stroke(ctx, [[0, 0], neck], 25, color);
  limb([0, 0], pose.lF[0], pose.lF[1], L.th, L.sh, color, 21);
  circle(ctx, head[0], head[1], L.head, color);
  const hF = limb(sh, pose.aF[0], pose.aF[1], L.ua, L.fa, color, 19);
  ctx.shadowBlur = 0;
  if (pose.phone > 0.05) { // phone glow lighting the face
    const px = (hF[0] + hB[0]) / 2, py = (hF[1] + hB[1]) / 2 - 6;
    const g = ctx.createRadialGradient(px, py, 2, px, py, 120);
    g.addColorStop(0, `rgba(120,170,255,${0.55 * pose.phone})`); g.addColorStop(1, "rgba(120,170,255,0)");
    ctx.fillStyle = g; ctx.fillRect(px - 130, py - 130, 260, 260);
    ctx.fillStyle = `rgba(190,215,255,${pose.phone})`; roundRect(ctx, px - 11, py - 18, 22, 34, 4); ctx.fill();
  }
  ctx.restore();
  return { hands: [[x + ((hF[0] + hB[0]) / 2) * scale, y + ((hF[1] + hB[1]) / 2) * scale]], head: [x + head[0] * scale, y + head[1] * scale] };
}

// ---- props ----
export function brick(ctx, x, y, { w = 64, h = 40, color = C.accent, glow = 1, rot = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  if (glow > 0) { ctx.shadowColor = color; ctx.shadowBlur = 34 * glow; }
  ctx.fillStyle = color; roundRect(ctx, -w / 2, -h / 2, w, h, 6); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.28)"; roundRect(ctx, -w / 2 + 5, -h / 2 + 4, w - 10, 6, 3); ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 3; roundRect(ctx, -w / 2, -h / 2, w, h, 6); ctx.stroke();
  ctx.restore();
}
export function stool(ctx, x, floor, h = 96) {
  ctx.fillStyle = "#232a35"; ctx.fillRect(x - 46, floor - h, 92, 14);
  ctx.fillRect(x - 40, floor - h, 9, h); ctx.fillRect(x + 31, floor - h, 9, h);
}
export function clock(ctx, x, y, r, minutes) {
  ctx.fillStyle = "#c9ccd2"; circle(ctx, x, y, r, "#c9ccd2");
  ctx.strokeStyle = "#1a1d22"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + Math.sin(a) * r * 0.78, y - Math.cos(a) * r * 0.78); ctx.lineTo(x + Math.sin(a) * r * 0.9, y - Math.cos(a) * r * 0.9); ctx.stroke(); }
  const hand = (a, len, w) => { ctx.lineWidth = w; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(a) * len, y - Math.cos(a) * len); ctx.stroke(); };
  hand((minutes / 60) * Math.PI * 2, r * 0.75, 4); hand((minutes / 720) * Math.PI * 2, r * 0.5, 6);
}
export function bulb(ctx, x, y, intensity, floor, W) {
  ctx.strokeStyle = "#2a303a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, y - 18); ctx.stroke();
  ctx.fillStyle = "#2a303a"; ctx.beginPath(); ctx.moveTo(x - 20, y - 6); ctx.lineTo(x + 20, y - 6); ctx.lineTo(x + 10, y - 22); ctx.lineTo(x - 10, y - 22); ctx.closePath(); ctx.fill();
  const g = ctx.createRadialGradient(x, y, 4, x, y, 420);
  g.addColorStop(0, `rgba(255,236,200,${0.38 * intensity})`); g.addColorStop(1, "rgba(255,236,200,0)");
  ctx.fillStyle = g; ctx.fillRect(x - 440, y - 440, 880, 880);
  const cone = ctx.createLinearGradient(0, y, 0, floor);
  cone.addColorStop(0, `rgba(255,236,200,${0.1 * intensity})`); cone.addColorStop(1, `rgba(255,236,200,${0.03 * intensity})`);
  ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(x - 30, y); ctx.lineTo(x + 30, y); ctx.lineTo(x + 330, floor); ctx.lineTo(x - 330, floor); ctx.closePath(); ctx.fill();
  circle(ctx, x, y, 13, `rgba(255,240,210,${0.5 + 0.5 * intensity})`);
}
export function room(ctx, W, floor, H) {
  const g = ctx.createLinearGradient(0, 0, 0, floor);
  g.addColorStop(0, C.wallTop); g.addColorStop(1, C.wallBot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, floor);
  ctx.fillStyle = "rgba(255,255,255,0.025)"; for (let x = 60; x < W; x += 150) ctx.fillRect(x, 0, 2, floor);
  ctx.fillStyle = C.floor; ctx.fillRect(0, floor, W, H - floor);
  ctx.fillStyle = C.line; ctx.fillRect(0, floor - 2, W, 4);
}
export function reflect(ctx, src, floor, W, H, alpha = 0.22) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(0, floor * 2); ctx.scale(1, -1);
  ctx.drawImage(src, 0, floor - (H - floor), W, H - floor, 0, floor - (H - floor), W, H - floor);
  ctx.restore();
  const g = ctx.createLinearGradient(0, floor, 0, H);
  g.addColorStop(0, "rgba(10,12,16,0.15)"); g.addColorStop(0.45, "rgba(10,12,16,0.85)"); g.addColorStop(1, "rgba(10,12,16,1)");
  ctx.fillStyle = g; ctx.fillRect(0, floor, W, H - floor);
}

// ---- helpers ----
export function shadeHex(hex, k) { const n = parseInt(hex.slice(1), 16); const c = (v) => Math.round(Math.min(255, v * k)).toString(16).padStart(2, "0"); return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`; }
export function mixHex(a, b, k) { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16); const c = (s) => Math.round(((A >> s) & 255) * (1 - k) + ((B >> s) & 255) * k).toString(16).padStart(2, "0"); return `#${c(16)}${c(8)}${c(0)}`; }
export function stroke(ctx, pts, w, col) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); ctx.moveTo(...pts[0]); for (const p of pts.slice(1)) ctx.lineTo(...p); ctx.stroke(); }
export function circle(ctx, x, y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
export function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
