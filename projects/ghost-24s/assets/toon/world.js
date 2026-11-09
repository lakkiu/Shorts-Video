// Seoul street set: toon-shaded boxes with painted canvas facades, vertical Hangul shop signs,
// cherry trees, lamps, a language-school gate and hills. Deterministic (seeded hash only).
import * as THREE from "../lib/three.module.min.js";

export const hash = (i, k = 0) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const SKY_TOP = new THREE.Color("#4f8fe0");
export const HORIZON = new THREE.Color("#cfe3f5");
const KR_FONT = "'Jua', 'WenQuanYi Zen Hei', sans-serif";

let gradientMap;
function toonGradient() {
  if (gradientMap) return gradientMap;
  const data = new Uint8Array([135, 135, 135, 255, 200, 200, 200, 255, 255, 255, 255, 255]);
  gradientMap = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  gradientMap.minFilter = gradientMap.magFilter = THREE.NearestFilter;
  gradientMap.needsUpdate = true;
  return gradientMap;
}
export const toon = (color, extra = {}) =>
  new THREE.MeshToonMaterial({ color, gradientMap: toonGradient(), ...extra });

function canvasTex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

const WALLS = ["#f3e3c3", "#e9a37f", "#bfe0cf", "#f6c9a8", "#d9d2ec", "#f1d27a", "#c9dbe9", "#e8b9b9"];
const SHOPS = ["카페", "편의점", "치킨", "서점", "노래방", "약국", "분식", "PC방", "빵집", "꽃집"];
const SIGN_COLORS = ["#e5484d", "#2f6fdb", "#1f9d6b", "#f08a2c", "#7a4fd1", "#d6336c"];

function facade(wall, floors, bays, shop, signColor) {
  const W = 512, H = Math.round(512 * (floors * 3) / (bays * 2.6));
  return canvasTex(W, H, (g) => {
    g.fillStyle = wall;
    g.fillRect(0, 0, W, H);
    // painted variation: soft vertical streaks
    for (let i = 0; i < 18; i++) {
      g.fillStyle = `rgba(0,0,0,${0.02 + hash(i, W) * 0.03})`;
      g.fillRect(hash(i, 3) * W, 0, 6 + hash(i, 5) * 30, H);
    }
    const fh = H / floors, bw = W / bays;
    // upper windows
    for (let f = 0; f < floors - 1; f++) {
      for (let b = 0; b < bays; b++) {
        const x = b * bw + bw * 0.2, y = f * fh + fh * 0.22, w = bw * 0.6, h = fh * 0.55;
        g.fillStyle = "#2b3a67";
        g.fillRect(x, y, w, h);
        g.fillStyle = "rgba(180,215,255,0.55)";
        g.beginPath(); g.moveTo(x, y + h * 0.7); g.lineTo(x + w * 0.5, y); g.lineTo(x + w * 0.75, y); g.lineTo(x, y + h); g.fill();
        g.strokeStyle = "#f7f3ea"; g.lineWidth = 6; g.strokeRect(x, y, w, h);
        g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y + h); g.stroke();
        g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(x - 4, y + h + 3, w + 8, 7);
      }
    }
    // ground floor shop: big window, sign band, awning
    const gy = (floors - 1) * fh;
    g.fillStyle = signColor;
    g.fillRect(0, gy + fh * 0.04, W, fh * 0.22);
    g.fillStyle = "#ffffff";
    g.font = `${Math.round(fh * 0.16)}px ${KR_FONT}`;
    g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(shop, W / 2, gy + fh * 0.15);
    g.fillStyle = "#fff4cf";
    g.fillRect(W * 0.06, gy + fh * 0.34, W * 0.6, fh * 0.6);
    g.fillStyle = "rgba(255,196,110,0.6)";
    for (let i = 0; i < 4; i++) g.fillRect(W * 0.1 + i * W * 0.14, gy + fh * 0.62, W * 0.08, fh * 0.2);
    g.strokeStyle = "#3a2f2a"; g.lineWidth = 8; g.strokeRect(W * 0.06, gy + fh * 0.34, W * 0.6, fh * 0.6);
    g.fillStyle = "#5b3b2a"; g.fillRect(W * 0.74, gy + fh * 0.36, W * 0.18, fh * 0.64);
    g.fillStyle = "#e8c45a"; g.beginPath(); g.arc(W * 0.77, gy + fh * 0.7, 6, 0, 7); g.fill();
    // floor bands
    g.fillStyle = "rgba(0,0,0,0.12)";
    for (let f = 1; f < floors; f++) g.fillRect(0, f * fh - 5, W, 10);
  });
}

function verticalSign(text, color) {
  const chars = [...text];
  return canvasTex(128, 128 * Math.max(3, chars.length) + 40, (g, w, h) => {
    g.fillStyle = color; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#ffffff"; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = "#ffffff"; g.font = `92px ${KR_FONT}`; g.textAlign = "center"; g.textBaseline = "middle";
    const step = (h - 40) / chars.length;
    chars.forEach((ch, i) => g.fillText(ch, w / 2, 20 + step * (i + 0.5)));
  });
}

function gateSign(text) {
  return canvasTex(1024, 192, (g, w, h) => {
    g.fillStyle = "#1f3b73"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#e8c45a"; g.lineWidth = 10; g.strokeRect(12, 12, w - 24, h - 24);
    g.fillStyle = "#ffffff"; g.font = `120px ${KR_FONT}`; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(text, w / 2, h / 2 + 6);
  });
}

function sidewalkTex() {
  const t = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#e6d8bf"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      g.fillStyle = (i + j) % 2 ? "#dccbae" : "#eadfc8";
      g.fillRect(i * 64 + 2, j * 64 + 2, 60, 60);
    }
    g.strokeStyle = "rgba(90,70,50,0.35)"; g.lineWidth = 3;
    for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
function roadTex() {
  const t = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#9097a8"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(255,255,255,${hash(i, 9) * 0.06})`; g.fillRect(hash(i, 1) * w, hash(i, 2) * h, 3, 3); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export function buildWorld(scene) {
  const world = new THREE.Group();
  scene.add(world);
  const add = (mesh, cast = true) => { mesh.castShadow = cast; mesh.receiveShadow = true; world.add(mesh); return mesh; };

  // sky dome
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(500, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: SKY_TOP }, hor: { value: HORIZON } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }",
      fragmentShader: "uniform vec3 top; uniform vec3 hor; varying vec3 vP; void main(){ float k = smoothstep(-0.02, 0.45, vP.y); gl_FragColor = vec4(mix(hor, top, k), 1.); }",
    }),
  );
  sky.userData.isSky = true;
  world.add(sky);

  // ground
  const road = add(new THREE.Mesh(new THREE.PlaneGeometry(8, 200), toon("#ffffff", { map: roadTex() })), false);
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0, -80);
  road.material.map.repeat.set(2, 50);
  for (const s of [-1, 1]) {
    const sw = add(new THREE.Mesh(new THREE.BoxGeometry(4, 0.18, 200), toon("#ffffff", { map: sidewalkTex() })), false);
    sw.position.set(s * 6, 0.09, -80);
    sw.material.map.repeat.set(2, 100);
    const curb = add(new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.22, 200), toon("#bfc3cc")), false);
    curb.position.set(s * 4.05, 0.11, -80);
  }
  // lane dashes + crosswalk
  for (let z = 8; z > -150; z -= 6) {
    const d = add(new THREE.Mesh(new THREE.PlaneGeometry(0.18, 2.6), toon("#f4f1e6")), false);
    d.rotation.x = -Math.PI / 2; d.position.set(0, 0.01, z);
  }
  for (let i = -3; i <= 3; i++) {
    const c = add(new THREE.Mesh(new THREE.PlaneGeometry(0.7, 3.2), toon("#f4f1e6")), false);
    c.rotation.x = -Math.PI / 2; c.rotation.z = Math.PI / 2; c.position.set(i * 1.1, 0.012, -14);
  }

  // buildings both sides
  let n = 0;
  for (const side of [-1, 1]) {
    let z = 12;
    while (z > -110) {
      const depth = 7 + hash(n, 1) * 4;
      const floors = 3 + Math.floor(hash(n, 2) * 4);
      const h = floors * 3;
      const w = 8;
      const wall = WALLS[Math.floor(hash(n, 3) * WALLS.length)];
      const shop = SHOPS[n % SHOPS.length];
      const sc = SIGN_COLORS[Math.floor(hash(n, 4) * SIGN_COLORS.length)];
      const plain = toon(wall);
      const front = toon("#ffffff", { map: facade(wall, floors, 3, shop, sc) });
      const mats = side < 0 ? [front, plain, plain, plain, plain, plain] : [plain, front, plain, plain, plain, plain];
      const b = add(new THREE.Mesh(new THREE.BoxGeometry(w, h, depth - 0.4), mats));
      b.position.set(side * (8 + w / 2), h / 2, z - depth / 2);
      // roof cornice
      const cor = add(new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 0.45, depth), toon("#fbf6ec")));
      cor.position.set(b.position.x, h + 0.2, b.position.z);
      // awning
      const aw = add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, depth * 0.6), toon(sc)));
      aw.position.set(side * 7.35, 2.75, b.position.z); aw.rotation.z = side * -0.25;
      // vertical sign every other building
      if (hash(n, 6) > 0.35) {
        const txt = SHOPS[(n * 3 + 2) % SHOPS.length];
        const len = Math.max(3, [...txt].length);
        const sg = add(new THREE.Mesh(new THREE.BoxGeometry(0.9, len * 0.9 + 0.3, 0.22),
          [toon(sc), toon(sc), toon(sc), toon(sc), toon("#ffffff", { map: verticalSign(txt, sc) }), toon("#ffffff", { map: verticalSign(txt, sc) })]));
        sg.position.set(side * 7.45, 4.2 + len * 0.45, z - depth * 0.15);
      }
      // AC units / balconies for texture
      if (hash(n, 7) > 0.5) {
        const ac = add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.9), toon("#e9ecef")));
        ac.position.set(side * 7.75, 6.5, z - depth * 0.7);
      }
      z -= depth;
      n++;
    }
  }

  // cherry trees and lamps along the sidewalks
  const trunkMat = toon("#7a4a35");
  const blossom = [toon("#f7b8cb"), toon("#f39bb6"), toon("#fbd3df")];
  const ball = new THREE.IcosahedronGeometry(1, 2);
  let ti = 0;
  for (const side of [-1, 1]) {
    for (let z = 6 - (side > 0 ? 4 : 0); z > -90; z -= 9) {
      const x = side * 5.2;
      const tr = add(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 3.0, 8), trunkMat));
      tr.position.set(x, 1.6, z);
      for (let k = 0; k < 6; k++) {
        const r = 0.9 + hash(ti, k) * 0.6;
        const m = add(new THREE.Mesh(ball, blossom[(ti + k) % 3]));
        m.scale.setScalar(r);
        m.position.set(x + (hash(ti, k + 10) - 0.5) * 2.2, 3.6 + hash(ti, k + 20) * 1.3, z + (hash(ti, k + 30) - 0.5) * 2.2);
      }
      ti++;
      // lamp between trees
      const lz = z - 4.5;
      const pole = add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 4.4, 8), toon("#2f3b52")));
      pole.position.set(side * 4.5, 2.2 + 0.18, lz);
      const head = add(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.4), toon("#2f3b52")));
      head.position.set(side * 4.1, 4.5, lz);
      const bulb = add(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.28), new THREE.MeshBasicMaterial({ color: "#fff1c4" })), false);
      bulb.position.set(side * 4.1, 4.37, lz);
    }
  }

  // language-school gate at the end of the street
  const gz = -62;
  const pillarMat = toon("#c7b8a3");
  for (const s of [-1, 1]) {
    const p = add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 7, 1.2), pillarMat));
    p.position.set(s * 5.2, 3.5, gz);
    const cap = add(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 1.6), toon("#9b8a74")));
    cap.position.set(s * 5.2, 7.2, gz);
  }
  const lintel = add(new THREE.Mesh(new THREE.BoxGeometry(12, 1.6, 0.6),
    [toon("#1f3b73"), toon("#1f3b73"), toon("#1f3b73"), toon("#1f3b73"), toon("#ffffff", { map: gateSign("한국어학당") }), toon("#1f3b73")]));
  lintel.position.set(0, 6.2, gz);
  // hanok-style roof over the gate
  const roof = add(new THREE.Mesh(new THREE.CylinderGeometry(0.01, 7.5, 1.6, 4, 1), toon("#3b4a5e")));
  roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.25); roof.position.set(0, 7.9, gz);
  // campus building behind
  const campus = add(new THREE.Mesh(new THREE.BoxGeometry(26, 14, 10), toon("#f1ebe0", { map: facade("#f1ebe0", 5, 7, "본관", "#1f3b73") })));
  campus.position.set(0, 7, gz - 22);

  // hills and far mountains
  const hillMat = toon("#7cc47a");
  for (let i = 0; i < 5; i++) {
    const h = add(new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), hillMat), false);
    h.scale.set(30 + hash(i, 1) * 20, 14 + hash(i, 2) * 10, 20);
    h.position.set((i - 2) * 32, -2, -120 - hash(i, 3) * 20);
  }
  const mtMat = toon("#7f98c9");
  for (let i = 0; i < 6; i++) {
    const m = add(new THREE.Mesh(new THREE.ConeGeometry(30 + hash(i, 4) * 25, 45 + hash(i, 5) * 30, 6), mtMat), false);
    m.position.set((i - 2.5) * 55, 15, -230 - hash(i, 6) * 40);
  }
  // clouds
  const cloudMat = toon("#ffffff", { fog: false });
  for (let i = 0; i < 7; i++) {
    const g = new THREE.Group();
    for (let k = 0; k < 5; k++) {
      const m = new THREE.Mesh(ball, cloudMat);
      m.scale.set(7 + hash(i, k) * 5, 4 + hash(i, k + 5) * 3, 5);
      m.position.set(k * 7 - 14, hash(i, k + 9) * 3, 0);
      g.add(m);
    }
    g.position.set((i - 3) * 60 + hash(i, 1) * 20, 70 + hash(i, 2) * 40, -260 - hash(i, 3) * 60);
    g.userData.cloud = i;
    world.add(g);
  }
  return world;
}

// Falling petals: positions are a pure function of t.
export function makePetals(scene, count = 90) {
  const tex = canvasTex(64, 64, (g) => {
    g.fillStyle = "#ffc2d4";
    g.beginPath(); g.ellipse(32, 32, 26, 16, 0.6, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#e2849f"; g.lineWidth = 4; g.stroke();
  });
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ map: tex, size: 0.22, sizeAttenuation: true, alphaTest: 0.5, transparent: false, depthWrite: false });
  const pts = new THREE.Points(geo, mat);
  pts.userData.noNormal = true;
  pts.frustumCulled = false;
  scene.add(pts);
  pts.userData.update = (t) => {
    for (let i = 0; i < count; i++) {
      const fall = 0.55 + hash(i, 1) * 0.5;
      const y0 = 1 + hash(i, 2) * 6;
      const y = ((y0 - (t + hash(i, 3) * 10) * fall) % 7 + 7) % 7;
      pos[i * 3] = (hash(i, 4) - 0.5) * 12 + Math.sin(t * 1.3 + i) * 0.4;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = 8 - hash(i, 5) * 26;
    }
    geo.attributes.position.needsUpdate = true;
  };
  return pts;
}
