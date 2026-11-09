# Video Factory

Xưởng làm video ngắn (TikTok / Reels / Shorts) bằng [HyperFrames](https://github.com/heygen-com/hyperframes):
nhân vật 2D tự vẽ bằng code, bối cảnh 3D viền mực, giọng đọc tiếng Việt qua GenMax, phụ đề và âm thanh tự động.

## Quy trình (skill `video-factory`)

```
① Kịch bản (3 hook + dàn ý giữ chân) → ② Nhân vật (5 demo) → ③ Bối cảnh (5 demo) → ④ Storyboard → ⑤ Render
```

Chi tiết cho Claude: `.claude/skills/video-factory/SKILL.md`.

| Bước | Lệnh |
|---|---|
| Demo nhân vật | `node tools/demo.cjs chars demos/<vai>.json` |
| Demo bối cảnh | `node tools/demo.cjs sets demos/<noi>.json` |
| Chụp ảnh nền bối cảnh đã duyệt | `node tools/bake-plates.cjs <set>` |
| Giọng + project (chưa render) | `node scripts/make.mjs stories/<slug>.json --no-render` |
| Storyboard | `node tools/storyboard.cjs out/<slug>` |
| Render + ghép + trộn âm | `node scripts/make.mjs stories/<slug>.json --jobs 2` |

Tốc độ (4 nhân, không GPU): 65 s video render trong ~5,7 phút (bản 3D trực tiếp: 52 phút).

## Cấu trúc

| Đường dẫn | Nội dung |
|---|---|
| `scripts/make.mjs` | Kịch bản JSON → video (giọng, chia chương, render, ghép, trộn âm, sheet duyệt) |
| `scripts/genmax-tts.mjs` | Chữ → giọng đọc MP3 (+ phụ đề SRT) qua API GenMax |
| `engine/runtime.js` | Bộ ghép 2.5D: ảnh nền lia/đẩy, nhân vật 2D, đèn chớp, rung, lỗ nhòm, tin nhắn |
| `engine/toon/` | Nhân vật (`characters.js`), bối cảnh lắp ghép (`kit.js`), ký túc xá (`dorm.js`), hậu kỳ viền mực (`post.js`) |
| `library/characters/` | Nhân vật đã duyệt |
| `library/sets/`, `library/plates/` | Bối cảnh đã duyệt và ảnh nền đã chụp |
| `library/sfx/` | Tiếng động và âm nền |
| `stories/` | Kịch bản JSON |
| `demos/` | Phương án demo nhân vật / bối cảnh để duyệt |
| `tools/demo.cjs`, `tools/bake-plates.cjs`, `tools/storyboard.cjs` | Sheet duyệt, chụp ảnh nền, storyboard |
| `tools/shots.cjs` | Chụp nhanh các khung hình của một project để duyệt |
| `tools/bench.cjs` | Đo thời gian dựng mỗi khung hình |
| `projects/` | Các bản thử cũ (3D trực tiếp), giữ để tham khảo |
| `projects/ghost-60s/` | Chuyện ma "Luật ký túc xá" bản 3D (63 s, 9:16) |
| `projects/ghost-24s/` | Chuyện ma "Tiếng gõ cửa lúc 3 giờ sáng" (24 s) |
| `projects/seoul-street/` | Bản thử phong cách: nhân vật 2D trong phố Seoul 3D (6 s) |
| `projects/du-hoc-han-quoc/` | Video thông tin du học Hàn (15 s, 16:9, đồ họa chữ) |
| `docs/PLAN.md` | Kế hoạch xưởng 2.5D và số đo hiệu năng |

Mỗi project là một project HyperFrames độc lập. Phần dùng chung của các project 3D:
`assets/toon/characters.js` (nhân vật), `world.js` / `dorm.js` (bối cảnh), `post.js` (viền mực, làm mờ, chỉnh màu),
`assets/lib/` (three.js, GSAP), `assets/fonts/` (font Hàn Jua, OFL).

## Cài đặt

Cần Node 22+, ffmpeg, Chrome/Chromium và HyperFrames CLI (`npx hyperframes`).

```bash
cp .env.example .env        # điền GENMAX_API_KEY
```

## Dùng

Tạo giọng đọc:

```bash
node scripts/genmax-tts.mjs --text "Ba giờ sáng." --out projects/ghost-60s/assets/vo/n01 --voice Vietnamese_Serene_Man
node scripts/genmax-tts.mjs --voices            # danh sách giọng tiếng Việt (MiniMax); --provider capcut
node scripts/genmax-tts.mjs --credits
```

Xem trước và render một project:

```bash
cd projects/ghost-60s
npx hyperframes preview
npx hyperframes check --json
npx hyperframes render -o renders/video.mp4
```

Chuẩn hóa âm lượng và nén để đăng mạng xã hội:

```bash
ffmpeg -i renders/video.mp4 -c:v libx264 -crf 22 -pix_fmt yuv420p -movflags +faststart \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k renders/video-social.mp4
```

## Lưu ý

- `.env` chứa API key, đã nằm trong `.gitignore`: không commit.
- Cảnh 3D dựng bằng WebGL: trên máy không có card đồ họa, 60 s video mất khoảng 50 phút. Xem `docs/PLAN.md`.
- Nhân vật, bối cảnh, cốt truyện và âm thanh đều tự làm; font Jua (OFL), three.js (MIT), GSAP.
