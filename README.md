# Video Factory

Xưởng làm video ngắn (TikTok / Reels / Shorts) bằng [HyperFrames](https://github.com/heygen-com/hyperframes):
nhân vật 2D tự vẽ bằng code, bối cảnh 3D viền mực, giọng đọc tiếng Việt qua GenMax, phụ đề và âm thanh tự động.

## Cấu trúc

| Đường dẫn | Nội dung |
|---|---|
| `scripts/genmax-tts.mjs` | Chữ → giọng đọc MP3 (+ phụ đề SRT) qua API GenMax |
| `tools/shots.cjs` | Chụp nhanh các khung hình của một project để duyệt |
| `tools/bench.cjs` | Đo thời gian dựng mỗi khung hình |
| `projects/ghost-60s/` | Chuyện ma "Luật ký túc xá" (63 s, 9:16) |
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
