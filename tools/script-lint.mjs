#!/usr/bin/env node
// Script linter: retention, TTS readability and feasibility checks for a story JSON.
//   node tools/script-lint.mjs stories/<slug>.json      (uses out/<slug>/timeline.json for real timings when present)
// Exit code 1 when there are errors (things make.mjs would fail on); warnings never fail.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const file = process.argv[2];
if (!file) { console.error("usage: script-lint.mjs <story.json>"); process.exit(2); }
const story = JSON.parse(fs.readFileSync(file, "utf8"));
const slug = story.slug || path.basename(file, ".json");
const tlFile = path.join(ROOT, "out", slug, "timeline.json");
const timeline = fs.existsSync(tlFile) ? JSON.parse(fs.readFileSync(tlFile, "utf8")) : null;
const W = (story.format || "9:16") === "16:9" ? "@16x9" : "";

const MOODS = "neutral calm happy excited surprised wow scared worried relieved sleepy stare".split(" ");
const POSES = "idle wave arms-up reach phone phone-off cower point".split(" ");
const MOVES = "hold drift push push-fast pull pan-left pan-right tilt-up tilt-down".split(" ");
const FX = "muffled ghost phone whisper radio cave".split(" ");
const WPS = 3.3; // Vietnamese words per second at ~0.95x

const errors = [], warns = [], notes = [];
const GENRES = "explainer howto listicle storytime skit compare language myth quiz news motivation drama ad series-long horror".split(" ");
const genre = story.genre;
const NEEDS_SOURCES = "explainer howto news myth compare language ad".split(" ");
const FAST = "listicle skit quiz language".split(" ");
const SHOT_MAX = FAST.includes(genre) ? 7 : 8.5;
const err = (where, msg) => errors.push(`✖ ${where}: ${msg}`);
const warn = (where, msg) => warns.push(`⚠ ${where}: ${msg}`);
const words = (t) => t.replace(/\.\.\./g, " ").split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const sentences = (t) => t.split(/(?<=[.!?…])\s+/).map((s) => s.trim()).filter(Boolean);
const hangul = (t) => /[가-힣]/.test(t);

const voices = story.voices || {};
const sfxDir = path.join(ROOT, "library/sfx");
const lineCount = {};
let estT = 0, firstSay = null, charsUsed = new Set();

story.shots.forEach((s, i) => {
  const where = `cảnh ${i + 1}${s.angle ? ` (${s.angle})` : s.black ? " (đen)" : ""}`;
  let dur = s.lead ?? 0.3;
  // feasibility
  if (!s.black) {
    const set = s.set || story.set;
    const pf = path.join(ROOT, "library/plates", `${set}${W}`, `${s.angle}.json`);
    if (!fs.existsSync(pf)) err(where, `chưa có ảnh nền ${set}${W}/${s.angle} (bake-plates${W ? " --landscape" : ""})`);
    else {
      const marks = JSON.parse(fs.readFileSync(pf, "utf8")).marks || {};
      for (const c of s.chars || []) {
        if (!marks[c.mark]) err(where, `góc này không có điểm đứng "${c.mark}" (có: ${Object.keys(marks).join(", ") || "không"})`);
        if (c.walk && !marks[c.walk.to]) err(where, `walk.to "${c.walk.to}" không có trong góc này`);
      }
    }
    if (typeof s.move === "string" && !MOVES.includes(s.move)) err(where, `move "${s.move}" không hợp lệ`);
  }
  if ((s.chars || []).length > 2) warn(where, `${s.chars.length} nhân vật trong một cảnh (nên ≤ 2)`);
  for (const c of s.chars || []) {
    const id = c.char || c.id;
    charsUsed.add(id);
    if (!fs.existsSync(path.join(ROOT, "library/characters", `${id}.json`))) err(where, `nhân vật "${id}" chưa có trong library/characters (cổng ③)`);
    for (const k of [c, ...(c.keys || [])]) {
      if (k.mood && !MOODS.includes(k.mood)) err(where, `mood "${k.mood}" không hợp lệ`);
      if (k.pose && !POSES.includes(k.pose)) err(where, `pose "${k.pose}" không hợp lệ`);
    }
  }
  // beats
  let lastHadSfx = false;
  (s.beats || []).forEach((b, j) => {
    const bw = `${where}, nhịp ${j}`;
    if (b.say) {
      const v = voices[b.say];
      if (!v && b.say !== "narrator") err(bw, `người nói "${b.say}" chưa khai báo trong voices`);
      if (v?.fx && !FX.includes(v.fx)) err(bw, `fx "${v.fx}" không hợp lệ`);
      lineCount[b.say] = (lineCount[b.say] || 0) + 1;
      const lang = b.lang || v?.lang;
      const isKo = lang === "Korean" || hangul(b.text);
      if (isKo && !b.sub) warn(bw, "câu tiếng Hàn chưa có nghĩa tiếng Việt (sub)");
      if (hangul(b.text) && lang !== "Korean") warn(bw, "có chữ Hàn nhưng giọng không đặt lang: \"Korean\"");
      if (!isKo) {
        if (/\d/.test(b.text)) warn(bw, `có chữ số trong lời đọc ("${b.text.match(/\S*\d\S*/)[0]}") — viết bằng chữ`);
        if (/[%&/@#]/.test(b.text)) warn(bw, "có ký hiệu (% & / @ #) trong lời đọc");
        for (const sn of sentences(b.text)) if (words(sn) > 15) warn(bw, `câu dài ${words(sn)} từ: "${sn.slice(0, 60)}…" (nên ≤ 15)`);
      }
      const d = isKo ? Math.max(1.2, b.text.length * 0.18) : words(b.text) / WPS / ((v?.speed ?? 1) / 0.95);
      if (!firstSay) firstSay = { text: b.text, at: estT + dur, shot: i };
      dur += d;
    } else if (b.sfx) {
      if (!fs.existsSync(path.join(sfxDir, `${b.sfx}.mp3`))) err(bw, `tiếng động "${b.sfx}" không có trong library/sfx`);
      dur += b.hold ?? 1.5;
    }
    for (const x of b.also || []) if (!fs.existsSync(path.join(sfxDir, `${x.sfx}.mp3`))) err(bw, `tiếng động "${x.sfx}" không có`);
    const gap = b.gap ?? 0.35;
    if (gap > 1.5 && !(b.also || []).length && !b.sfx) warn(bw, `khoảng lặng ${gap}s không có tiếng động — cố ý thì thêm heart/drone`);
    dur += gap;
    lastHadSfx = !!b.sfx;
  });
  if (s.black) dur = s.hold ?? 2;
  const real = timeline?.shots?.[i] ? timeline.shots[i].end - timeline.shots[i].start : null;
  const D = real ?? dur;
  const changes = (s.chars || []).some((c) => c.walk || (c.keys || []).length) || (s.fx || []).length || s.notify || (s.beats || []).length > 1;
  if (D > SHOT_MAX && !changes) warn(where, `dài ${D.toFixed(1)}s mà không đổi gì (walk / keys / fx / thêm nhịp) — tách cảnh hoặc thêm chuyển động`);
  if (D > 12) warn(where, `dài ${D.toFixed(1)}s — nên tách thành 2 cảnh để đổi nhịp`);
  estT += D;
});

// hook + ending
const total = timeline?.total ?? estT;
if (!firstSay) err("kịch bản", "không có lời nào");
else {
  const hw = words(firstSay.text.split(/(?<=[.!?])\s+/)[0]);
  if (hw > 15) warn("hook", `câu đầu ${hw} từ (nên ≤ 15)`);
  if (firstSay.at > 1.0) warn("hook", `lời đầu tiên bắt đầu ở ${firstSay.at.toFixed(1)}s (nên ≤ 1s)`);
  if (/^(xin chào|chào (các|mọi|cả)|hôm nay (mình|tôi|chúng)|chào mừng|các bạn ơi|đây là (câu chuyện|một câu chuyện)|mình là)/i.test(firstSay.text.trim()))
    warn("hook", "mở bằng lời chào / giới thiệu — vào thẳng điều lạ ngay câu đầu");
  if (/(rất|cực kỳ|vô cùng|siêu) (đáng sợ|kinh dị|hay)|có thật 100|không xem sẽ hối hận/i.test(firstSay.text)) warn("hook", "hook tự khen chung chung (\"rất đáng sợ\"…) — thay bằng chi tiết cụ thể");
  notes.push(`Hook: "${firstSay.text}"`);
}
const last = story.shots[story.shots.length - 1];
const lastSay = [...story.shots].reverse().flatMap((s) => [...(s.beats || [])].reverse()).find((b) => b.say);
if (!genre) warn("thể loại", `chưa ghi "genre" (${GENRES.join(" ")}) — cần để chấm và soát đúng thể loại`);
else if (!GENRES.includes(genre)) warn("thể loại", `genre "${genre}" không có trong danh sách`);
if (NEEDS_SOURCES.includes(genre) && !(story.sources || []).length) warn("nguồn", `thể loại ${genre} cần "sources" (nguồn cho con số / quy định / câu tiếng Hàn)`);
if (genre === "ad" && !story.cta) err("quảng cáo", `thiếu "cta" (hành động + kênh liên hệ)`);
if (genre === "ad" && /(100 ?%|chắc chắn|cam kết) (đậu|đỗ|có visa|thành công)/i.test(JSON.stringify(story.shots))) warn("quảng cáo", "hứa chắc chắn kết quả — nền tảng và luật quảng cáo không cho phép");
if (genre === "listicle") { const n = story.shots.filter((s) => [].concat(s.title || []).some((t) => (t.style || "") === "number")).length; if (n < 3) warn("danh sách", `chỉ ${n} cảnh có số to (title style "number") — mỗi mục nên có số`); }
if (genre !== "ad" && !(last.black && last.text) && !/\?\s*$/.test(lastSay?.text || "")) warn("kết", "không có câu hỏi hay chữ kết — thêm cảnh đen có câu hỏi / câu cần nhớ");
if (charsUsed.size > 3) warn("nhân vật", `${charsUsed.size} nhân vật (${[...charsUsed].join(", ")}) — video ngắn nên ≤ 3`);
const shots = story.shots.length;
notes.push(`Thời lượng: ${total.toFixed(1)}s ${timeline ? "(thật, từ timeline.json)" : "(ước tính ~3,3 từ/giây)"} · ${shots} cảnh · trung bình ${(total / shots).toFixed(1)}s/cảnh`);
notes.push(`Số câu theo vai: ${Object.entries(lineCount).map(([k, v]) => `${k} ${v}`).join(", ")}`);
if (story.target && Math.abs(total - story.target) > story.target * 0.15) warn("thời lượng", `${total.toFixed(0)}s, lệch mục tiêu ${story.target}s quá 15%`);

console.log(notes.join("\n"));
if (errors.length) console.log("\n" + errors.join("\n"));
if (warns.length) console.log("\n" + warns.join("\n"));
if (!errors.length && !warns.length) console.log("\n✔ không có cảnh báo");
console.log(`\n${errors.length} lỗi, ${warns.length} cảnh báo`);
process.exit(errors.length ? 1 : 0);
