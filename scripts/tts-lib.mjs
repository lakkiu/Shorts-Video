// Shared, cached GenMax synthesis (+ optional voice fx) used by make.mjs and tools/voice-demo.mjs.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawn, execFileSync } from "node:child_process";
import { resolveVoice } from "./voices.mjs";

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const CACHE = path.join(ROOT, ".cache", "tts");

export const FX = {
  muffled: "lowpass=f=1500,aecho=0.8:0.5:35:0.3,volume=1.3",
  ghost: "highpass=f=250,lowpass=f=6000,asetrate=44100*0.92,aresample=48000,aecho=0.8:0.75:120|260:0.35|0.22,volume=1.6",
  phone: "highpass=f=400,lowpass=f=3200,volume=1.4",
  whisper: "highpass=f=300,aecho=0.8:0.6:80:0.25,volume=1.4",
  radio: "highpass=f=500,lowpass=f=2800,acrusher=bits=8:mix=0.15,volume=1.5",
  cave: "aecho=0.8:0.85:300|600:0.4|0.25,volume=1.2",
};

export const probe = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());
export const ff = (a) => execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...a]);

// v = { voice, speed?, provider?, fx? } -> { file, dur }
export async function synth(text, v) {
  v = resolveVoice(v);
  fs.mkdirSync(CACHE, { recursive: true });
  const provider = v.provider || "minimax";
  const key = crypto.createHash("sha1").update(`${provider}|${v.voice}|${v.speed ?? 1}|${text}${v.model ? `|${v.model}` : ""}${v.lang ? `|${v.lang}` : ""}`).digest("hex").slice(0, 16);
  const base = path.join(CACHE, key);
  if (!fs.existsSync(`${base}.mp3`)) {
    await new Promise((res, rej) => {
      const p = spawn(process.execPath, [path.join(ROOT, "scripts/genmax-tts.mjs"), "--text", text, "--out", base, "--voice", v.voice,
        "--speed", String(v.speed ?? 1), "--no-srt", "--provider", provider, ...(v.model ? ["--model", v.model] : []), ...(v.lang ? ["--lang", v.lang] : [])], { stdio: ["ignore", "ignore", "inherit"], cwd: ROOT });
      p.on("exit", (c) => (c === 0 ? res() : rej(new Error(`TTS failed (${v.voice}): ${text}`))));
    });
  }
  let file = `${base}.mp3`;
  if (v.fx && FX[v.fx]) {
    const fxf = `${base}.${v.fx}.wav`;
    if (!fs.existsSync(fxf)) ff(["-i", file, "-af", FX[v.fx], "-ac", "2", fxf]);
    file = fxf;
  }
  return { file, dur: probe(file) };
}

// run async jobs with a concurrency limit
export async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); }
  }));
  return out;
}
