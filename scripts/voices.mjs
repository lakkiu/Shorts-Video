#!/usr/bin/env node
// Voice catalog: call GenMax voices by name.
//   node scripts/voices.mjs sync                 # refresh library/voice-catalog.json (MiniMax VN + your clones, CapCut VN, ElevenLabs default)
//   node scripts/voices.mjs find "kể chuyện ma"   # look a voice up by name (accents/case ignored); falls back to the ElevenLabs shared library
//   node scripts/voices.mjs list [clone|minimax|capcut|elevenlabs]
// In story JSON / voice demos a voice can be { "name": "Nam Trầm" } instead of { "voice", "provider" }.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const CATALOG = path.join(ROOT, "library", "voice-catalog.json");

// behind an HTTPS proxy Node's fetch needs NODE_USE_ENV_PROXY=1: re-run once with it (CLI use only)
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (isMain && (process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const r = spawnSync(process.execPath, ["--no-warnings", ...process.argv.slice(1)], { stdio: "inherit", env: { ...process.env, NODE_USE_ENV_PROXY: "1" } });
  process.exit(r.status ?? 1);
}

function env() {
  if (process.env.GENMAX_API_KEY) return;
  const p = path.join(ROOT, ".env");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) { const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2]; }
}
async function api(p) {
  env();
  const res = await fetch((process.env.GENMAX_BASE_URL || "https://api.genmax.io") + p, { headers: { "xi-api-key": process.env.GENMAX_API_KEY } });
  if (!res.ok) throw new Error(`GET ${p} -> ${res.status}`);
  return res.json();
}

export const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "d").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

async function sync() {
  const out = [];
  const clones = await api("/v1/minimax/voices");
  for (const v of clones.voices || []) if (v.status === "done") out.push({ name: v.voice_name, provider: "minimax", voice: v.id, kind: "clone", tags: [v.gender, v.language_tag].filter(Boolean).join(", ") });
  const mm = await api("/v1/minimax/system-voices?language=Vietnamese&page_size=100");
  for (const v of mm.voice_list || []) out.push({ name: v.voice_name.split(" - ")[0], full: v.voice_name, provider: "minimax", voice: v.uniq_id || v.voice_id, kind: "system", tags: (v.tag_list || []).join(", ") });
  const cc = await api("/v1/capcut/system-voices?language=vi&page_size=100");
  for (const v of cc.voice_list || []) out.push({ name: v.name, provider: "capcut", voice: v.voice_id, kind: "system", tags: [v.gender, "Vietnamese"].filter(Boolean).join(", ") });
  const el = await api("/v1/default-voices?page_size=100");
  for (const v of el.voices || []) out.push({ name: v.name.split(" - ")[0], full: v.name, provider: "elevenlabs", voice: v.voice_id, kind: "default", tags: [v.gender, v.age, v.accent, v.descriptive].filter(Boolean).join(", ") });
  fs.writeFileSync(CATALOG, JSON.stringify({ synced: new Date().toISOString(), voices: out }, null, 2));
  return out;
}

export function loadCatalog() {
  return fs.existsSync(CATALOG) ? JSON.parse(fs.readFileSync(CATALOG, "utf8")).voices : [];
}

// best matches for a name: exact name, then name/uniq-id containing the query, then all words in name+tags
export function findVoices(q, voices = loadCatalog()) {
  const n = norm(q);
  const exact = voices.filter((v) => norm(v.name) === n || norm(v.full) === n || norm(v.voice) === n);
  if (exact.length) return exact;
  const part = voices.filter((v) => norm(v.name).includes(n) || norm(v.full).includes(n) || norm(v.voice).includes(n));
  if (part.length) return part;
  const words = n.split(" ");
  return voices.filter((v) => words.every((w) => norm(`${v.full || v.name} ${v.tags} ${v.provider} ${v.kind}`).includes(w)));
}

// { name } -> { voice, provider } (throws with the candidates when ambiguous)
export function resolveVoice(v) {
  if (!v || v.voice || !v.name) return v;
  let m = findVoices(v.name);
  if (v.provider) m = m.filter((x) => x.provider === v.provider);
  if (m.length > 1) { const clones = m.filter((x) => x.kind === "clone"); if (clones.length === 1) m = clones; }
  if (m.length !== 1) throw new Error(m.length ? `voice "${v.name}" is ambiguous: ${m.map((x) => `${x.name} (${x.provider})`).join(", ")} — add "provider"` : `voice "${v.name}" not found — run: node scripts/voices.mjs find "${v.name}"`);
  return { ...v, voice: m[0].voice, provider: m[0].provider };
}

const show = (v) => `${v.name.padEnd(28)} ${v.provider.padEnd(10)} ${v.kind.padEnd(7)} ${v.voice}${v.tags ? `  [${v.tags}]` : ""}`;

if (isMain) {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd === "sync") { const v = await sync(); console.log(`synced ${v.length} voices -> ${path.relative(ROOT, CATALOG)}`); }
  else if (cmd === "find") {
    if (!fs.existsSync(CATALOG)) await sync();
    const q = rest.join(" ");
    const m = findVoices(q);
    if (m.length) m.forEach((v) => console.log(show(v)));
    else {
      const d = await api(`/v1/shared-voices?page_size=15&search=${encodeURIComponent(q)}`);
      const s = d.voices || [];
      if (!s.length) { console.log(`không tìm thấy "${q}"`); process.exit(1); }
      console.log(`(không có trong catalog; ElevenLabs shared library:)`);
      s.forEach((v) => console.log(show({ name: v.name, provider: "elevenlabs", kind: "shared", voice: v.voice_id, tags: [v.language, v.gender, v.age].filter(Boolean).join(", ") })));
    }
  } else if (cmd === "list") {
    if (!fs.existsSync(CATALOG)) await sync();
    loadCatalog().filter((v) => !rest[0] || v.provider === rest[0] || v.kind === rest[0]).forEach((v) => console.log(show(v)));
  } else { console.error("usage: voices.mjs sync | find <tên> | list [clone|minimax|capcut|elevenlabs]"); process.exit(2); }
}
