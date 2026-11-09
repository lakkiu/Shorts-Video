#!/usr/bin/env node
// Voice audition: for each role, the role's real line read by every candidate voice (with the role's fx),
// as separate MP3s plus one "listen to all" MP3 with spoken numbers between takes.
//   node tools/voice-demo.mjs demos/voices-<slug>.json      -> demos/voices-<slug>/
// File: { "roles": [ { "role": "narrator", "text": "...", "fx": null,
//          "candidates": [ { "label": "Nam trầm", "voice": "Vietnamese_Serene_Man", "provider": "minimax", "speed": 0.95 } ] } ] }
import fs from "node:fs";
import path from "node:path";
import { synth, pool, ff, ROOT } from "../scripts/tts-lib.mjs";

const file = process.argv[2];
if (!file) { console.error("usage: voice-demo.mjs <voices.json>"); process.exit(2); }
const spec = JSON.parse(fs.readFileSync(file, "utf8"));
const out = path.resolve(file.replace(/\.json$/, ""));
fs.mkdirSync(out, { recursive: true });
const announcer = spec.announce || { voice: "Vietnamese_Professional_Narrator_v2", speed: 1.0 };
const NUM = ["một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín", "mười"];
const toMp3 = (src, dst) => ff(["-i", src, "-ar", "44100", "-ac", "2", "-b:a", "160k", dst]);
const silence = path.join(out, ".sil.wav");
ff(["-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", "0.5", silence]);

const summary = [];
for (const r of spec.roles) {
  const takes = await pool(r.candidates, 4, (c) => synth(r.text, { ...c, fx: c.fx ?? r.fx, lang: c.lang ?? r.lang }));
  const intros = await pool(r.candidates, 4, (_, i) => synth(`Giọng số ${NUM[i] || i + 1}.`, announcer));
  const list = [];
  takes.forEach((t, i) => {
    const name = `${r.role}-${i + 1}.mp3`;
    toMp3(t.file, path.join(out, name));
    summary.push(`${r.role} ${i + 1}: ${r.candidates[i].label || r.candidates[i].name || r.candidates[i].voice} (${r.candidates[i].name ? `"${r.candidates[i].name}"` : `${r.candidates[i].provider || "minimax"} ${r.candidates[i].voice}`}, speed ${r.candidates[i].speed ?? 1}${(r.candidates[i].fx ?? r.fx) ? `, fx ${r.candidates[i].fx ?? r.fx}` : ""}) -> ${name}`);
    list.push(intros[i].file, silence, t.file, silence, silence);
  });
  // one file to listen to every take in order
  const inputs = list.flatMap((f) => ["-i", f]);
  const filt = list.map((_, i) => `[${i}:a]aresample=44100,aformat=channel_layouts=stereo[a${i}]`).join(";") + ";" + list.map((_, i) => `[a${i}]`).join("") + `concat=n=${list.length}:v=0:a=1[o]`;
  ff([...inputs, "-filter_complex", filt, "-map", "[o]", "-b:a", "160k", path.join(out, `${r.role}-tat-ca.mp3`)]);
}
fs.unlinkSync(silence);
fs.writeFileSync(path.join(out, "README.txt"), summary.join("\n") + "\n");
console.log(summary.join("\n"));
console.log(`\nfiles: ${path.relative(ROOT, out)}/  (<role>-tat-ca.mp3 = nghe lần lượt cả 5 giọng)`);
