#!/usr/bin/env node
// GenMax text-to-speech: text -> MP3 (+ SRT), for Vietnamese voiceovers.
//
// Usage:
//   node genmax-tts.mjs --text "Xin chào" --out assets/vo/scene1 [--voice Vietnamese_Professional_Narrator_v2]
//                       [--provider minimax|capcut|elevenlabs] [--model speech-2.8-turbo] [--lang Vietnamese]
//                       [--speed 1.0] [--no-srt]
//   node genmax-tts.mjs --voices [--provider minimax|capcut]   # list Vietnamese voices
//   node genmax-tts.mjs --credits                              # show credit balance
//
// Writes <out>.mp3 and <out>.srt, prints JSON {mp3, srt, duration, credits}.
// Key: env GENMAX_API_KEY, or a .env file found next to this script's folder or in the cwd.

import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

// Behind an HTTPS proxy, Node's fetch only uses it with NODE_USE_ENV_PROXY=1: re-run once with it.
if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const r = spawnSync(process.execPath, ["--no-warnings", ...process.argv.slice(1)], {
    stdio: "inherit",
    env: { ...process.env, NODE_USE_ENV_PROXY: "1" },
  });
  process.exit(r.status ?? 1);
}

function loadEnv() {
  if (process.env.GENMAX_API_KEY) return;
  const here = path.dirname(new URL(import.meta.url).pathname);
  for (const p of [path.join(process.cwd(), ".env"), path.join(here, "..", ".env"), path.join(here, "..", "..", ".env")]) {
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
    if (process.env.GENMAX_API_KEY) return;
  }
}
loadEnv();
const KEY = process.env.GENMAX_API_KEY;
const BASE = process.env.GENMAX_BASE_URL || "https://api.genmax.io";
if (!KEY) {
  console.error("Missing GENMAX_API_KEY (env or .env)");
  process.exit(2);
}

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : d;
};

async function api(p, init = {}) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(BASE + p, {
      ...init,
      headers: { "xi-api-key": KEY, "Content-Type": "application/json", ...(init.headers || {}) },
    });
    if (res.ok) return res;
    if (attempt < 3 && (res.status === 429 || res.status >= 500)) {
      await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
      continue;
    }
    throw new Error(`${init.method || "GET"} ${p} -> ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
}
const json = async (p, init) => (await api(p, init)).json();

if (flag("credits")) {
  const me = await json("/v1/auth/me");
  console.log(JSON.stringify({ credit_balance: me.credit_balance }));
  process.exit(0);
}

if (flag("voices")) {
  const provider = opt("provider", "minimax");
  const url =
    provider === "capcut"
      ? "/v1/capcut/system-voices?language=vi&page_size=100"
      : "/v1/minimax/system-voices?language=Vietnamese&page_size=100";
  const d = await json(url);
  for (const v of d.voice_list || []) {
    console.log([v.uniq_id || v.voice_id, v.voice_name || v.name, v.gender || (v.tag_list || []).join(",")].join(" | "));
  }
  process.exit(0);
}

const text = opt("text") ?? (opt("text-file") ? fs.readFileSync(opt("text-file"), "utf8") : undefined);
const out = opt("out");
if (!text || !out) {
  console.error("Need --text (or --text-file) and --out");
  process.exit(2);
}
const provider = opt("provider", "minimax");
const voice = opt("voice", provider === "capcut" ? "7264854897953083905" : "Vietnamese_Professional_Narrator_v2");
const body = {
  text,
  provider,
  model_id: opt("model", provider === "minimax" ? "speech-2.8-turbo" : provider === "capcut" ? "capcut" : "eleven_multilingual_v2"),
  language_code: opt("lang", provider === "minimax" ? "Vietnamese" : "vi"),
  export_transcript: !flag("no-srt"),
};
if (opt("speed")) body.voice_settings = { speed: Number(opt("speed")) };

const { id } = await json(`/v1/text-to-speech/${encodeURIComponent(voice)}`, {
  method: "POST",
  body: JSON.stringify(body),
});

let task;
for (let i = 0; i < 150; i++) {
  task = await json(`/v1/history/${id}`);
  if (task.status === "completed" || task.status === "failed") break;
  await new Promise((r) => setTimeout(r, 2000));
}
if (task.status !== "completed") throw new Error(`TTS ${id} ${task.status}: ${task.error || task.detail_error || "timeout"}`);

fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
const save = async (url, file) => fs.writeFileSync(file, Buffer.from(await (await api(url.replace(BASE, ""))).arrayBuffer()));
const mp3 = `${out}.mp3`;
await save(task.result.audio_url, mp3);
let srt = null;
if (task.result.srt_url) {
  srt = `${out}.srt`;
  await save(task.result.srt_url, srt);
}
let duration = null;
try {
  duration = Number(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp3]).toString().trim(),
  );
} catch {}
console.log(JSON.stringify({ id, mp3, srt, duration, credits: task.credits_deducted }));
