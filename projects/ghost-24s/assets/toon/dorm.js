// Night dorm corridor set. Corridor runs along -z, x in [-1.6, 1.6], ceiling 2.8.
// Minh's room 305 opens off the right wall at z = 0 (room interior x in [1.6, 5.6]).
import * as THREE from "../lib/three.module.min.js";

export const hash = (i, k = 0) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const grad = (() => {
  const d = new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();
export const toon = (color, extra = {}) => new THREE.MeshToonMaterial({ color, gradientMap: grad, ...extra });

export function canvasTex(w, h, draw, repeat) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
}
const KR = "'Jua', 'WenQuanYi Zen Hei', sans-serif";

export const FOG = new THREE.Color("#070a12");
export const DOOR_Z = [12, 8, 4, 0, -4, -8, -12, -16, -20];

export function buildDorm(scene) {
  const g = new THREE.Group();
  scene.add(g);
  const add = (m) => { g.add(m); return m; };
  const L = 48, zc = -6;

  // floor: worn green linoleum tiles
  const floorTex = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = "#6f8a7a"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      c.fillStyle = (i + j) % 2 ? "#647e70" : "#7a9585"; c.fillRect(i * 128 + 3, j * 128 + 3, 122, 122);
    }
    for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(0,0,0,${hash(i, 2) * 0.12})`; c.fillRect(hash(i, 3) * w, hash(i, 4) * h, 4 + hash(i, 5) * 10, 2); }
  }, [3, L / 1.2]);
  const floor = add(new THREE.Mesh(new THREE.PlaneGeometry(3.2, L), toon("#ffffff", { map: floorTex })));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, zc);

  // ceiling
  const ceil = add(new THREE.Mesh(new THREE.PlaneGeometry(3.2, L), toon("#cfd3cf")));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 2.8, zc);

  // walls: pale green wainscot + cream upper, with a rail
  const wallTex = canvasTex(256, 512, (c, w, h) => {
    c.fillStyle = "#e9e2cf"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#9fbcaa"; c.fillRect(0, h * 0.58, w, h * 0.42);
    c.fillStyle = "#5f7a6b"; c.fillRect(0, h * 0.57, w, 10);
    c.fillStyle = "#3e4a44"; c.fillRect(0, h - 18, w, 18);
    for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(60,50,30,${hash(i, 7) * 0.08})`; c.fillRect(hash(i, 8) * w, hash(i, 9) * h * 0.55, 3 + hash(i, 1) * 40, 3 + hash(i, 2) * 60); }
  }, [L / 2, 1]);
  const wallSeg = (s, z0, z1, y0 = 0, y1 = 2.8) => {
    const len = z0 - z1, hh = y1 - y0;
    const tex = wallTex.clone(); tex.needsUpdate = true; tex.repeat.set(len / 2, hh / 2.8); tex.offset.set(0, y0 / 2.8);
    const m = add(new THREE.Mesh(new THREE.PlaneGeometry(len, hh), toon("#ffffff", { map: tex })));
    m.rotation.y = -s * Math.PI / 2; m.position.set(s * 1.6, (y0 + y1) / 2, (z0 + z1) / 2);
  };
  wallSeg(-1, zc + L / 2, zc - L / 2);
  wallSeg(1, zc + L / 2, 0.5);
  wallSeg(1, -0.5, zc - L / 2);
  wallSeg(1, 0.5, -0.5, 2.1, 2.8);
  // end wall with exit door + sign
  const end = add(new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.8), toon("#e9e2cf")));
  end.position.set(0, 1.4, zc - L / 2 + 0.01);
  const exitDoor = add(new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.1, 0.08), toon("#59646e")));
  exitDoor.position.set(0, 1.05, zc - L / 2 + 0.05);
  const exitTex = canvasTex(256, 96, (c, w, h) => {
    c.fillStyle = "#1db954"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#ffffff"; c.font = `64px ${KR}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("비상구", w / 2 + 20, h / 2 + 4);
    c.fillRect(22, 26, 18, 44);
  });
  const exit = add(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.06), new THREE.MeshBasicMaterial({ map: exitTex })));
  exit.position.set(0, 2.45, zc - L / 2 + 0.08);

  // doors along both walls
  const doors = {};
  for (const s of [-1, 1]) {
    DOOR_Z.forEach((z, i) => {
      const num = s > 0 ? 302 + i : 312 + i;
      const isMinh = s > 0 && z === 0;
      const fm = toon("#5b4636");
      for (const dz of [-0.53, 0.53]) { const j = add(new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.16, 0.07), fm)); j.position.set(s * 1.6, 1.08, z + dz); }
      const head = add(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 1.13), fm)); head.position.set(s * 1.6, 2.12, z);
      const plateTex = canvasTex(128, 64, (c, w, h) => {
        c.fillStyle = "#e8e0c8"; c.fillRect(0, 0, w, h); c.strokeStyle = "#5b4636"; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6);
        c.fillStyle = "#222"; c.font = "bold 40px sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(String(num), w / 2, h / 2 + 2);
      });
      const plate = add(new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.17), toon("#ffffff", { map: plateTex })));
      plate.rotation.y = -s * Math.PI / 2; plate.position.set(s * 1.585, 2.38, z);
      // hinged door: pivot at the edge nearer +z
      const pivot = new THREE.Group();
      pivot.position.set(s * 1.6, 0, z + 0.5);
      g.add(pivot);
      const doorTex = canvasTex(128, 256, (c, w, h) => {
        c.fillStyle = "#8a6a4f"; c.fillRect(0, 0, w, h);
        c.strokeStyle = "rgba(40,25,15,0.5)"; c.lineWidth = 6; c.strokeRect(16, 18, w - 32, h * 0.38); c.strokeRect(16, h * 0.5, w - 32, h * 0.42);
        c.fillStyle = "rgba(0,0,0,0.1)"; for (let k = 0; k < 12; k++) c.fillRect(0, hash(k + i, s) * h, w, 2);
      });
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.05, 0.98), [toon("#7a5c44"), toon("#7a5c44"), toon("#7a5c44"), toon("#7a5c44"), toon("#ffffff", { map: doorTex }), toon("#ffffff", { map: doorTex })]);
      door.material[0] = door.material[1] = toon("#ffffff", { map: doorTex });
      door.position.set(-s * 0.03, 1.025, -0.49);
      pivot.add(door);
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), toon("#d9b65a"));
      knob.position.set(-s * 0.08, 1.0, -0.88);
      pivot.add(knob);
      if (isMinh) { doors.minh = { pivot, door }; }
    });
  }

  // Minh's room behind door 305: dark, moonlit window, bed
  const room = new THREE.Group();
  g.add(room);
  const rmat = toon("#2a3146");
  const back = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.8), rmat); back.rotation.y = -Math.PI / 2; back.position.set(5.6, 1.4, 0); room.add(back);
  for (const zz of [-2, 2]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.8), rmat); w.position.set(3.6, 1.4, zz); w.rotation.y = zz > 0 ? Math.PI : 0; room.add(w); }
  const rf = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), toon("#3a3a48")); rf.rotation.x = -Math.PI / 2; rf.position.set(3.6, 0.002, 0); room.add(rf);
  const rc = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), rmat); rc.rotation.x = Math.PI / 2; rc.position.set(3.6, 2.8, 0); room.add(rc);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.0), new THREE.MeshBasicMaterial({ color: "#8fb0e8" }));
  win.rotation.y = -Math.PI / 2; win.position.set(5.58, 1.6, 0.6); room.add(win);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.0, 0.05), toon("#1b2030")); bar.position.set(5.55, 1.6, 0.6); room.add(bar);
  const bed = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.45, 1.0), toon("#4c5a8a")); bed.position.set(4.4, 0.23, -1.4); room.add(bed);
  const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.7), toon("#d7dbe8")); pillow.position.set(5.1, 0.52, -1.4); room.add(pillow);

  // ceiling tube lights
  const lights = [];
  DOOR_Z.concat([-24]).forEach((z, i) => {
    const tube = add(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 1.3), new THREE.MeshBasicMaterial({ color: "#eaf6ff" })));
    tube.position.set(0, 2.76, z - 2);
    const pl = new THREE.PointLight("#cfe6ff", 6, 7, 1.6);
    pl.position.set(0, 2.5, z - 2);
    g.add(pl);
    lights.push({ tube, pl, base: 6, i });
  });
  // moonlight in the room
  const moon = new THREE.PointLight("#7f9cff", 3, 5, 1.5);
  moon.position.set(5.0, 1.8, 0.6);
  g.add(moon);

  // wet slippers + puddle + wet footprints leading into the room
  const props = new THREE.Group();
  g.add(props);
  const slipMat = toon("#c9a7b4");
  for (const dz of [-0.17, 0.17]) {
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.035, 0.12), slipMat);
    sole.position.set(1.18, 0.02, 0.05 + dz);
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.02, 6, 12, Math.PI), toon("#9e7a8a"));
    strap.rotation.y = Math.PI / 2; strap.position.set(1.12, 0.035, 0.05 + dz);
    props.add(sole, strap);
  }
  const wetTex = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = "rgba(40,70,120,0.55)";
    c.beginPath(); c.ellipse(w / 2, h / 2, w * 0.45, h * 0.38, 0.3, 0, Math.PI * 2); c.fill();
    c.fillStyle = "rgba(200,230,255,0.5)"; c.beginPath(); c.ellipse(w * 0.4, h * 0.4, w * 0.12, h * 0.05, 0.3, 0, Math.PI * 2); c.fill();
  });
  const puddle = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), new THREE.MeshBasicMaterial({ map: wetTex, transparent: true, depthWrite: false }));
  puddle.rotation.x = -Math.PI / 2; puddle.position.set(1.15, 0.004, 0.05);
  puddle.userData.noNormal = true;
  props.add(puddle);
  const stepTex = canvasTex(64, 128, (c, w, h) => {
    c.fillStyle = "rgba(30,55,100,0.6)";
    c.beginPath(); c.ellipse(w / 2, h * 0.36, w * 0.36, h * 0.3, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(w / 2, h * 0.82, w * 0.26, h * 0.14, 0, 0, Math.PI * 2); c.fill();
  });
  for (let k = 0; k < 6; k++) {
    const fp = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.26), new THREE.MeshBasicMaterial({ map: stepTex, transparent: true, depthWrite: false }));
    fp.rotation.x = -Math.PI / 2; fp.rotation.z = Math.PI / 2;
    fp.position.set(1.45 + k * 0.42, 0.006, 0.05 + (k % 2 ? 0.14 : -0.14));
    fp.userData.noNormal = true;
    props.add(fp);
  }
  return { doors, lights, moon };
}
