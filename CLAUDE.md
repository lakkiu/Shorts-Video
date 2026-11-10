# Hướng dẫn cho AI (Claude, Codex, …)

Repo này là một xưởng làm video. Khi người dùng muốn làm video / viết kịch bản video, làm theo quy trình trong
`.claude/skills/video-factory/SKILL.md` (4 bước: nội dung + khổ → kịch bản → nhân vật / bối cảnh / giọng → render;
video dài chia nhiều cửa sổ, mỗi cửa sổ chạy một chương).

- Cần: Node 22+, ffmpeg, Chromium/Playwright, HyperFrames CLI (`npx hyperframes`), Python 3 + numpy (nhạc tự tổng hợp).
- `.env` chứa `GENMAX_API_KEY` (giọng đọc) — không commit.
- Lệnh chính: `node scripts/make.mjs stories/<slug>.json` (xem `scripts/make.mjs` đầu file cho mọi tuỳ chọn).
