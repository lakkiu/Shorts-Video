// Our own flat 2D cast, drawn on a canvas each frame from a pose (pure function of the pose).
// Design space 600 x 1000, soles at y = 975. Chibi build: ~2.4 heads tall, round head,
// dot eyes with a catchlight, rosy cheeks, navy variable-width outline.

export const INK = "#1d2340";
const LW = 13; // outline width in design units

const rad = (d) => (d * Math.PI) / 180;

function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, "0");
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
}

// ---------- cast ----------
export const CAST = {
  linh: {
    skin: "#ffd9bf", hair: "#2b1d1a", hairStyle: "ponytail", top: "#ffc940", hood: true,
    pants: "#3d5a99", shoes: "#ffffff", bag: "#e5484d", headR: 150,
  },
  minh: {
    skin: "#f7cfae", hair: "#1f1a1a", hairStyle: "spiky", top: "#3aa17e", zip: true,
    pants: "#d9c4a0", shoes: "#3b3b3b", glasses: true, headR: 146,
  },
  minhPJ: {
    skin: "#f7cfae", hair: "#1f1a1a", hairStyle: "spiky", top: "#7da3d8", zip: false,
    pants: "#5d79b0", shoes: "#c9c2b8", glasses: true, headR: 146,
  },
  kim: {
    skin: "#ffe0c8", hair: "#4a2c2a", hairStyle: "bob", top: "#8e6bd1", cardigan: true,
    skirt: "#2f3a5a", legs: "#ffe0c8", shoes: "#7a4a3a", book: "#f1e5c8", headR: 140,
  },
};

// default pose
export const POSE = {
  walk: 0, // walk phase in cycles (0..1 per stride pair); speed 0 = standing
  moving: 0, // 0..1 blend of walk swing
  bob: 0, // extra vertical offset (design units, + = up)
  lean: 0, // degrees
  armL: 10, armR: -10, // shoulder angle in degrees from straight down (+ = forward/out to the right of screen)
  elbowL: 0, elbowR: 0,
  eyes: "open", // open | closed | happy | wow
  mouth: "smile", // smile | open | o | flat
  look: 0, // pupil offset -1..1
  tilt: 0, // head tilt degrees
};

// ---------- primitives ----------
function inkFill(ctx, path, fill, lw = LW) {
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = lw;
  ctx.strokeStyle = INK;
  ctx.fillStyle = fill;
  ctx.fill(path);
  ctx.stroke(path);
}

function limb(ctx, pts, w, color) {
  const p = new Path2D();
  p.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = INK;
  ctx.lineWidth = w + LW * 2;
  ctx.stroke(p);
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.stroke(p);
}

function roundRectPath(x, y, w, h, r) {
  const p = new Path2D();
  p.moveTo(x + r, y);
  p.arcTo(x + w, y, x + w, y + h, r);
  p.arcTo(x + w, y + h, x, y + h, r);
  p.arcTo(x, y + h, x, y, r);
  p.arcTo(x, y, x + w, y, r);
  p.closePath();
  return p;
}

// two-segment arm from shoulder: angle a (deg from down), elbow bend e (deg)
function armPts(sx, sy, a, e, len = 105) {
  const ex = sx + Math.sin(rad(a)) * len;
  const ey = sy + Math.cos(rad(a)) * len;
  const b = a + e;
  const hx = ex + Math.sin(rad(b)) * len * 0.92;
  const hy = ey + Math.cos(rad(b)) * len * 0.92;
  return [[sx, sy], [ex, ey], [hx, hy]];
}

// ---------- face ----------
function face(ctx, c, pose, cx, cy, R) {
  const ex = R * 0.36, ey = cy + R * 0.08 + (pose.lookDown ? 10 : 0);
  const lk = pose.look * 8;
  // cheeks
  ctx.fillStyle = "rgba(255,120,130,0.45)";
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(cx + s * R * 0.58, ey + R * 0.3, R * 0.15, R * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // eyes
  ctx.lineCap = "round";
  for (const s of [-1, 1]) {
    const x = cx + s * ex + lk;
    if (pose.eyes === "closed") {
      ctx.strokeStyle = INK; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.arc(x, ey - 4, 18, rad(20), rad(160)); ctx.stroke();
    } else if (pose.eyes === "happy") {
      ctx.strokeStyle = INK; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.arc(x, ey + 10, 20, rad(200), rad(340)); ctx.stroke();
    } else if (pose.eyes === "scared") {
      ctx.fillStyle = "#ffffff"; ctx.strokeStyle = INK; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.ellipse(x, ey, 24, 30, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x + lk * 0.6, ey + 2, 7, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x - s * 26, ey - 52); ctx.lineTo(x + s * 18, ey - 44); ctx.stroke();
    } else {
      const big = pose.eyes === "wow" ? 1.35 : 1;
      ctx.fillStyle = INK;
      ctx.beginPath(); ctx.ellipse(x, ey, 15 * big, 21 * big, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath(); ctx.arc(x + 5 * big, ey - 8 * big, 6 * big, 0, Math.PI * 2); ctx.fill();
      if (pose.eyes === "wow") {
        ctx.beginPath(); ctx.arc(x - 5, ey + 7, 3, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
  // glasses
  if (c.glasses) {
    ctx.strokeStyle = INK; ctx.lineWidth = 7;
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.arc(cx + s * ex, ey, 36, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(cx - ex + 36, ey); ctx.lineTo(cx + ex - 36, ey); ctx.stroke();
  }
  // mouth
  const my = cy + R * 0.42;
  ctx.strokeStyle = INK; ctx.lineWidth = 9;
  if (pose.mouth === "smile") {
    ctx.beginPath(); ctx.arc(cx, my - 14, 24, rad(25), rad(155)); ctx.stroke();
  } else if (pose.mouth === "wobble") {
    ctx.beginPath(); ctx.moveTo(cx - 30, my);
    for (let i = 1; i <= 6; i++) ctx.lineTo(cx - 30 + i * 10, my + (i % 2 ? -7 : 7));
    ctx.stroke();
  } else if (pose.mouth === "flat") {
    ctx.beginPath(); ctx.moveTo(cx - 16, my); ctx.lineTo(cx + 16, my); ctx.stroke();
  } else if (pose.mouth === "o") {
    ctx.fillStyle = "#6b1f2e";
    ctx.beginPath(); ctx.ellipse(cx, my, 13, 17, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else {
    // open D smile with tongue
    const p = new Path2D();
    p.moveTo(cx - 32, my - 10);
    p.quadraticCurveTo(cx, my - 4, cx + 32, my - 10);
    p.quadraticCurveTo(cx + 26, my + 34, cx, my + 34);
    p.quadraticCurveTo(cx - 26, my + 34, cx - 32, my - 10);
    ctx.fillStyle = "#6b1f2e"; ctx.fill(p);
    ctx.save(); ctx.clip(p);
    ctx.fillStyle = "#f0727e";
    ctx.beginPath(); ctx.ellipse(cx, my + 32, 20, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.lineWidth = 8; ctx.stroke(p);
  }
}

function hairBack(ctx, c, cx, cy, R, t) {
  const hs = c.hairStyle;
  if (hs === "long") {
    const p = new Path2D();
    p.moveTo(cx - R * 1.1, cy - R * 0.2);
    p.bezierCurveTo(cx - R * 1.3, cy - R * 1.4, cx + R * 1.3, cy - R * 1.4, cx + R * 1.1, cy - R * 0.2);
    p.lineTo(cx + R * 1.18, cy + R * 1.75); p.quadraticCurveTo(cx, cy + R * 1.95, cx - R * 1.18, cy + R * 1.75);
    p.closePath();
    inkFill(ctx, p, c.hair);
  }
  if (hs === "bun") inkFill(ctx, circle(cx, cy - R * 1.08, R * 0.42), c.hair);
  if (hs === "twintails") {
    const sway = Math.sin(t * 4) * 8;
    for (const s of [-1, 1]) {
      const p = new Path2D();
      p.moveTo(cx + s * R * 0.85, cy - R * 0.45);
      p.bezierCurveTo(cx + s * R * 1.7, cy - R * 0.4 + sway, cx + s * R * 1.6, cy + R * 0.9, cx + s * R * 1.25, cy + R * 1.4 + sway);
      p.bezierCurveTo(cx + s * R * 1.3, cy + R * 0.7, cx + s * R * 1.0, cy + R * 0.1, cx + s * R * 0.8, cy - R * 0.05);
      p.closePath();
      inkFill(ctx, p, c.hair);
      inkFill(ctx, circle(cx + s * R * 0.9, cy - R * 0.35, 15), c.accent || "#e5484d", 7);
    }
  }
  if (c.hairStyle === "ponytail") {
    const sway = Math.sin(t * 5) * 10;
    const p = new Path2D();
    p.moveTo(cx + R * 0.62, cy - R * 0.72);
    p.bezierCurveTo(cx + R * 1.55 + sway, cy - R * 0.85, cx + R * 1.6 + sway, cy + R * 0.2, cx + R * 1.2 + sway, cy + R * 0.95);
    p.bezierCurveTo(cx + R * 1.25 + sway * 0.5, cy + R * 0.25, cx + R * 1.0, cy - R * 0.2, cx + R * 0.75, cy - R * 0.3);
    p.closePath();
    inkFill(ctx, p, c.hair);
  }
  if (c.hairStyle === "bob") {
    const p = new Path2D();
    p.moveTo(cx - R * 1.12, cy + R * 0.62);
    p.bezierCurveTo(cx - R * 1.3, cy - R * 1.35, cx + R * 1.3, cy - R * 1.35, cx + R * 1.12, cy + R * 0.62);
    p.quadraticCurveTo(cx, cy + R * 0.78, cx - R * 1.12, cy + R * 0.62);
    p.closePath();
    inkFill(ctx, p, c.hair);
  }
}

function hairFront(ctx, c, cx, cy, R) {
  const p = new Path2D();
  if (c.hairStyle === "ponytail") {
    // hair cap down to the ears, scalloped bangs
    p.moveTo(cx - R * 1.04, cy + R * 0.12);
    p.bezierCurveTo(cx - R * 1.12, cy - R * 1.3, cx + R * 1.12, cy - R * 1.3, cx + R * 1.04, cy + R * 0.12);
    p.quadraticCurveTo(cx + R * 0.95, cy - R * 0.3, cx + R * 0.72, cy - R * 0.36);
    p.quadraticCurveTo(cx + R * 0.5, cy - R * 0.16, cx + R * 0.3, cy - R * 0.42);
    p.quadraticCurveTo(cx + R * 0.05, cy - R * 0.14, cx - R * 0.18, cy - R * 0.44);
    p.quadraticCurveTo(cx - R * 0.42, cy - R * 0.18, cx - R * 0.64, cy - R * 0.42);
    p.quadraticCurveTo(cx - R * 0.92, cy - R * 0.3, cx - R * 1.04, cy + R * 0.12);
    p.closePath();
    inkFill(ctx, p, c.hair);
    ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 9; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(cx - R * 0.15, cy - R * 0.25, R * 0.75, rad(205), rad(240)); ctx.stroke();
    ctx.fillStyle = "#e5484d";
    ctx.beginPath(); ctx.arc(cx + R * 0.78, cy - R * 0.68, 16, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
  } else if (c.hairStyle === "spiky") {
    // rounded tufts on the crown only, symmetric
    const A0 = Math.PI * 1.06, A1 = Math.PI * 1.94, tufts = 6;
    const at = (a, r) => [cx + Math.cos(a) * r, cy - R * 0.02 + Math.sin(a) * r];
    p.moveTo(cx - R * 1.03, cy + R * 0.08);
    let prev = at(A0, R * 1.03);
    p.lineTo(prev[0], prev[1]);
    for (let i = 1; i <= tufts; i++) {
      const a0 = A0 + (A1 - A0) * (i - 0.5) / tufts, a1 = A0 + (A1 - A0) * i / tufts;
      const tip = at(a0 - 0.08, R * 1.32), end = at(a1, R * 1.03);
      p.quadraticCurveTo(...at(a0 - 0.2, R * 1.12), tip[0], tip[1]);
      p.quadraticCurveTo(...at(a0 + 0.12, R * 1.12), end[0], end[1]);
      prev = end;
    }
    p.lineTo(cx + R * 1.03, cy + R * 0.08);
    p.quadraticCurveTo(cx + R * 0.7, cy - R * 0.5, cx + R * 0.2, cy - R * 0.42);
    p.quadraticCurveTo(cx - R * 0.1, cy - R * 0.25, cx - R * 0.35, cy - R * 0.45);
    p.quadraticCurveTo(cx - R * 0.8, cy - R * 0.4, cx - R * 1.02, cy + R * 0.02);
    p.closePath();
    inkFill(ctx, p, c.hair);
  } else if (c.hairStyle === "bob") {
    p.moveTo(cx - R * 1.02, cy + R * 0.1);
    p.bezierCurveTo(cx - R * 1.12, cy - R * 1.28, cx + R * 1.12, cy - R * 1.28, cx + R * 1.02, cy + R * 0.1);
    p.quadraticCurveTo(cx + R * 0.9, cy - R * 0.36, cx + R * 0.1, cy - R * 0.38);
    p.quadraticCurveTo(cx - R * 0.55, cy - R * 0.4, cx - R * 0.78, cy - R * 0.15);
    p.quadraticCurveTo(cx - R * 0.95, cy - R * 0.4, cx - R * 1.02, cy + R * 0.1);
    p.closePath();
    inkFill(ctx, p, c.hair);
  } else if (c.hairStyle === "long" || c.hairStyle === "bun" || c.hairStyle === "twintails") {
    // centre part, hair framing the face
    p.moveTo(cx - R * 1.05, cy + R * 0.35);
    p.bezierCurveTo(cx - R * 1.15, cy - R * 1.3, cx + R * 1.15, cy - R * 1.3, cx + R * 1.05, cy + R * 0.35);
    p.quadraticCurveTo(cx + R * 0.85, cy - R * 0.3, cx + R * 0.05, cy - R * 0.62);
    p.quadraticCurveTo(cx - R * 0.85, cy - R * 0.3, cx - R * 1.05, cy + R * 0.35);
    p.closePath();
    inkFill(ctx, p, c.hair);
  } else if (c.hairStyle === "short") {
    p.moveTo(cx - R * 1.03, cy + R * 0.0);
    p.bezierCurveTo(cx - R * 1.12, cy - R * 1.3, cx + R * 1.12, cy - R * 1.3, cx + R * 1.03, cy + R * 0.0);
    p.quadraticCurveTo(cx + R * 0.9, cy - R * 0.45, cx + R * 0.35, cy - R * 0.5);
    p.quadraticCurveTo(cx - R * 0.2, cy - R * 0.62, cx - R * 0.55, cy - R * 0.38);
    p.quadraticCurveTo(cx - R * 0.95, cy - R * 0.4, cx - R * 1.03, cy + R * 0.0);
    p.closePath();
    inkFill(ctx, p, c.hair);
  } else if (c.hairStyle === "curly") {
    const n = 11;
    for (let i = 0; i < n; i++) {
      const a = Math.PI * (0.95 + (i / (n - 1)) * 1.1);
      inkFill(ctx, circle(cx + Math.cos(a) * R * 0.98, cy - R * 0.1 + Math.sin(a) * R * 0.98, R * 0.3), c.hair, 10);
    }
    ctx.fillStyle = c.hair;
    ctx.beginPath(); ctx.ellipse(cx, cy - R * 0.62, R * 0.85, R * 0.42, 0, 0, Math.PI * 2); ctx.fill();
  } else if (c.hairStyle === "cap") {
    p.moveTo(cx - R * 1.03, cy - R * 0.05);
    p.bezierCurveTo(cx - R * 1.1, cy - R * 1.32, cx + R * 1.1, cy - R * 1.32, cx + R * 1.03, cy - R * 0.05);
    p.quadraticCurveTo(cx, cy - R * 0.48, cx - R * 1.03, cy - R * 0.05);
    p.closePath();
    inkFill(ctx, p, c.cap || "#e5484d");
    const brim = new Path2D();
    brim.moveTo(cx - R * 1.0, cy - R * 0.22); brim.quadraticCurveTo(cx - R * 1.75, cy - R * 0.2, cx - R * 1.6, cy - R * 0.02);
    brim.quadraticCurveTo(cx - R * 1.2, cy - R * 0.05, cx - R * 0.7, cy - R * 0.12); brim.closePath();
    inkFill(ctx, brim, shade(c.cap || "#e5484d", 0.8), 10);
    inkFill(ctx, circle(cx, cy - R * 1.12, 12), shade(c.cap || "#e5484d", 0.8), 6);
  } else if (c.hairStyle === "bald") {
    ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 10; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(cx - R * 0.2, cy - R * 0.3, R * 0.6, rad(210), rad(245)); ctx.stroke();
  }
}

// ---------- full character ----------
export function drawCharacter(ctx, c, pose, t = 0) {
  ctx.clearRect(0, 0, 600, 1000);
  ctx.save();
  const swing = Math.sin(pose.walk * Math.PI * 2) * 26 * pose.moving;
  const stepBob = Math.abs(Math.cos(pose.walk * Math.PI * 2)) * 12 * pose.moving;
  const lift = pose.bob + stepBob;
  ctx.translate(300, 975);
  ctx.rotate(rad(pose.lean));
  ctx.translate(-300, -975 - lift);

  const R = c.headR;
  const hipY = 800, shY = 600, cx = 300;
  const legLen = 170;
  const HY = shY - R * 0.74;

  // contact shadow drawn in 3D, not here.
  // legs
  const legColor = c.legs || c.pants;
  for (const s of [-1, 1]) {
    const a = s * swing;
    const hx = cx + s * 38;
    const fx = hx + Math.sin(rad(a)) * legLen;
    const fy = hipY + Math.cos(rad(a)) * legLen + lift;
    limb(ctx, [[hx, hipY], [fx, Math.min(fy, 960)]], 46, legColor);
    // shoe
    const sh = roundRectPath(fx - 34 + s * 6, Math.min(fy, 960) - 6, 70, 34, 16);
    inkFill(ctx, sh, c.shoes, 10);
  }

  // back arm (screen left = character's right)
  const backArm = armPts(cx - 92, shY + 28, -pose.armL, -pose.elbowL);
  if (!pose.phone) {
    limb(ctx, backArm, 36, shade(c.top, 0.86));
    inkFill(ctx, circle(backArm[2][0], backArm[2][1], 22), c.skin, 9);
  }

  hairBack(ctx, c, cx, HY, R, t);

  // backpack behind body
  if (c.bag) {
    inkFill(ctx, roundRectPath(cx + 50, shY - 10, 120, 190, 40), c.bag);
    inkFill(ctx, roundRectPath(cx + 95, shY + 70, 70, 70, 18), shade(c.bag, 0.82), 9);
  }

  // torso
  const torso = new Path2D();
  if (c.dress) {
    torso.moveTo(cx - 90, shY + 4);
    torso.quadraticCurveTo(cx, shY - 30, cx + 90, shY + 4);
    torso.lineTo(cx + 150, hipY + 95);
    torso.quadraticCurveTo(cx, hipY + 118, cx - 150, hipY + 95);
    torso.closePath();
    inkFill(ctx, torso, c.dress);
    ctx.strokeStyle = INK; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(cx - 108, hipY - 40); ctx.quadraticCurveTo(cx, hipY - 22, cx + 108, hipY - 40); ctx.stroke();
  } else if (c.skirt) {
    torso.moveTo(cx - 92, shY);
    torso.quadraticCurveTo(cx, shY - 30, cx + 92, shY);
    torso.lineTo(cx + 140, hipY + 70);
    torso.quadraticCurveTo(cx, hipY + 92, cx - 140, hipY + 70);
    torso.closePath();
    inkFill(ctx, torso, c.skirt);
    inkFill(ctx, roundRectPath(cx - 100, shY - 10, 200, 190, 60), c.top);
  } else {
    torso.moveTo(cx - 95, shY + 10);
    torso.quadraticCurveTo(cx, shY - 32, cx + 95, shY + 10);
    torso.quadraticCurveTo(cx + 118, hipY - 40, cx + 104, hipY + 18);
    torso.quadraticCurveTo(cx, hipY + 36, cx - 104, hipY + 18);
    torso.quadraticCurveTo(cx - 118, hipY - 40, cx - 95, shY + 10);
    torso.closePath();
    inkFill(ctx, torso, c.top);
  }
  ctx.strokeStyle = INK; ctx.lineWidth = 8;
  if (c.zip || c.cardigan) {
    ctx.beginPath(); ctx.moveTo(cx, shY - 6); ctx.lineTo(cx, c.cardigan ? shY + 175 : hipY + 24); ctx.stroke();
  }
  if (c.cardigan) {
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(cx + 18, shY + 40 + i * 48, 8, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 5; ctx.stroke(); }
  }
  if (c.hood) {
    const pocket = new Path2D();
    pocket.moveTo(cx - 60, hipY - 70); pocket.lineTo(cx + 60, hipY - 70);
    pocket.lineTo(cx + 74, hipY - 4); pocket.lineTo(cx - 74, hipY - 4); pocket.closePath();
    inkFill(ctx, pocket, shade(c.top, 0.9), 8);
    ctx.lineWidth = 6;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + s * 22, shY + 4); ctx.lineTo(cx + s * 26, shY + 70); ctx.stroke(); }
  }
  if (c.stripes) {
    ctx.save(); ctx.clip(torso); ctx.fillStyle = c.stripes;
    for (let y = shY + 30; y < hipY + 30; y += 56) ctx.fillRect(cx - 130, y, 260, 20);
    ctx.restore(); ctx.strokeStyle = INK; ctx.lineWidth = LW; ctx.stroke(torso);
  }
  if (c.tie) {
    const col = new Path2D();
    col.moveTo(cx - 50, shY - 14); col.lineTo(cx, shY + 40); col.lineTo(cx + 50, shY - 14); col.lineTo(cx, shY + 8); col.closePath();
    inkFill(ctx, col, "#ffffff", 7);
    const tie = new Path2D();
    tie.moveTo(cx - 14, shY + 26); tie.lineTo(cx + 14, shY + 26); tie.lineTo(cx + 22, shY + 150); tie.lineTo(cx, shY + 175); tie.lineTo(cx - 22, shY + 150); tie.closePath();
    inkFill(ctx, tie, c.tie, 8);
  }
  // backpack strap over shoulder
  if (c.bag) {
    limb(ctx, [[cx + 62, shY - 6], [cx + 70, shY + 140]], 16, c.bag);
  }

  if (c.scarf) {
    inkFill(ctx, roundRectPath(cx - 98, shY - 34, 196, 62, 30), c.scarf);
    inkFill(ctx, roundRectPath(cx + 20, shY + 10, 52, 150, 18), shade(c.scarf, 0.88), 9);
  }
  // head (tilted)
  ctx.save();
  ctx.translate(cx, HY + R * 0.7);
  ctx.rotate(rad(pose.tilt));
  ctx.translate(-cx, -(HY + R * 0.7));
  if (c.hood) {
    inkFill(ctx, roundRectPath(cx - R * 0.9, HY + R * 0.55, R * 1.8, R * 0.55, R * 0.27), shade(c.top, 0.92));
  }
  // ears
  for (const s of [-1, 1]) inkFill(ctx, circle(cx + s * R * 0.98, HY + 12, R * 0.17), c.skin, 10);
  inkFill(ctx, ellipsePath(cx, HY, R * 1.02, R * 0.96), c.skin);
  face(ctx, c, pose, cx, HY, R);
  if (c.mustache) {
    const m = new Path2D(); const my = HY + R * 0.33;
    m.moveTo(cx, my); m.quadraticCurveTo(cx - 40, my - 22, cx - 62, my + 8); m.quadraticCurveTo(cx - 30, my + 4, cx, my + 12);
    m.quadraticCurveTo(cx + 30, my + 4, cx + 62, my + 8); m.quadraticCurveTo(cx + 40, my - 22, cx, my); m.closePath();
    inkFill(ctx, m, c.mustache, 7);
  }
  hairFront(ctx, c, cx, HY, R);
  if (pose.sweat) {
    const d = new Path2D(); const sx = cx - R * 0.95, sy = HY - R * 0.35 + pose.sweat * 30;
    d.moveTo(sx, sy - 34); d.quadraticCurveTo(sx + 22, sy, sx, sy + 14); d.quadraticCurveTo(sx - 22, sy, sx, sy - 34);
    inkFill(ctx, d, "#8fd3ff", 7);
  }
  ctx.restore();

  // phone held up in the screen-left hand, in front of the body
  if (pose.phone) {
    limb(ctx, backArm, 36, shade(c.top, 0.86));
    const [px, py] = backArm[2];
    inkFill(ctx, roundRectPath(px - 34, py - 96, 68, 120, 12), "#22262f", 9);
    ctx.fillStyle = pose.phone > 0.5 ? "#e8f3ff" : "#3b4a66";
    ctx.fillRect(px - 26, py - 86, 52, 96);
    if (pose.phone > 0.5) { ctx.fillStyle = "#3b82f6"; ctx.fillRect(px - 22, py - 70, 40, 14); ctx.fillStyle = "#9aa7bb"; ctx.fillRect(px - 22, py - 50, 30, 8); }
    inkFill(ctx, circle(px, py + 12, 22), c.skin, 9);
  }
  // front arm (screen right = character's left)
  const frontArm = armPts(cx + 92, shY + 28, pose.armR, pose.elbowR);
  limb(ctx, frontArm, 36, c.top);
  inkFill(ctx, circle(frontArm[2][0], frontArm[2][1], 22), c.skin, 9);
  if (c.book) {
    const [hx, hy] = frontArm[2];
    inkFill(ctx, roundRectPath(hx - 70, hy - 110, 90, 120, 10), c.book, 10);
    ctx.fillStyle = "#c0392b"; ctx.fillRect(hx - 58, hy - 96, 66, 16);
  }
  ctx.restore();
}

function circle(x, y, r) {
  const p = new Path2D();
  p.arc(x, y, r, 0, Math.PI * 2);
  return p;
}
function ellipsePath(x, y, rx, ry) {
  const p = new Path2D();
  p.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  return p;
}

// keyed states: [[t, value], ...] -> value at t (step)
export function stepAt(keys, t) {
  let v = keys[0][1];
  for (const [k, val] of keys) if (t >= k) v = val;
  return v;
}
// blink: closed for 0.12 s at each time in list
export function blinking(times, t) {
  return times.some((b) => t >= b && t < b + 0.12);
}

// The ghost: long hair over a pale face, one eye showing, white gown fading out at the hem.
export function drawGhost(ctx, p = {}, t = 0) {
  const { sway = 0, eye = 1, tilt = -8 } = p;
  ctx.clearRect(0, 0, 600, 1000);
  ctx.save();
  ctx.translate(300, 300); ctx.rotate(rad(tilt)); ctx.translate(-300, -300);
  const cx = 300, hy = 250, R = 120;
  // gown
  const gown = new Path2D();
  gown.moveTo(cx - 80, 380);
  gown.quadraticCurveTo(cx, 350, cx + 80, 380);
  gown.lineTo(cx + 150 + sway * 10, 980); gown.lineTo(cx - 150 + sway * 6, 980); gown.closePath();
  const gg = ctx.createLinearGradient(0, 380, 0, 980);
  gg.addColorStop(0, "#e9eef6"); gg.addColorStop(0.75, "#cfd8e6"); gg.addColorStop(1, "rgba(207,216,230,0)");
  ctx.fillStyle = gg; ctx.fill(gown);
  ctx.strokeStyle = INK; ctx.lineWidth = LW; ctx.save(); ctx.clip(new Path2D("M0 0 H600 V820 H0 Z")); ctx.stroke(gown); ctx.restore();
  // arms hanging
  for (const s of [-1, 1]) limb(ctx, [[cx + s * 78, 410], [cx + s * 100, 560], [cx + s * 104 + sway * 4, 690]], 30, "#dfe6f0");
  // face
  inkFill(ctx, ellipsePath(cx, hy, R * 0.9, R), "#dde6ef");
  // the one visible eye (left of screen), dark hollow + pinprick
  ctx.fillStyle = "#0b0d16"; ctx.beginPath(); ctx.ellipse(cx - 38, hy + 6, 26, 20 * eye + 1, -0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f2f5ff"; ctx.beginPath(); ctx.arc(cx - 34, hy + 6, 4 * eye, 0, Math.PI * 2); ctx.fill();
  // faint mouth
  ctx.strokeStyle = "rgba(29,35,64,0.6)"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx - 30, hy + 70); ctx.quadraticCurveTo(cx - 10, hy + 76, cx + 6, hy + 68); ctx.stroke();
  // long hair: crown + curtain over the right half of the face and down to the waist
  const hair = new Path2D();
  hair.moveTo(cx - R * 1.0, hy + 10);
  hair.bezierCurveTo(cx - R * 1.1, hy - R * 1.35, cx + R * 1.15, hy - R * 1.35, cx + R * 1.05, hy + 20);
  hair.quadraticCurveTo(cx + 150 + sway * 12, hy + 260, cx + 120 + sway * 16, hy + 420);
  hair.lineTo(cx + 40 + sway * 10, hy + 380);
  hair.quadraticCurveTo(cx + 10, hy + 200, cx + 0, hy - 40);
  hair.quadraticCurveTo(cx - 40, hy - 70, cx - 70, hy - 50);
  hair.quadraticCurveTo(cx - 100, hy + 60, cx - 112 + sway * 6, hy + 300);
  hair.lineTo(cx - 140 + sway * 8, hy + 330);
  hair.quadraticCurveTo(cx - 130, hy + 150, cx - R * 1.0, hy + 10);
  hair.closePath();
  inkFill(ctx, hair, "#0d0f17");
  ctx.strokeStyle = "rgba(120,140,190,0.25)"; ctx.lineWidth = 5;
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(cx + 20 + i * 18, hy - 60); ctx.quadraticCurveTo(cx + 40 + i * 22, hy + 150, cx + 50 + i * 16 + sway * 10, hy + 360); ctx.stroke(); }
  ctx.restore();
}
