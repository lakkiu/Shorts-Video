# Tài sản: nhân vật, bối cảnh, giọng, âm thanh

## Nhân vật (`library/characters/<id>.json` → `spec`)

Trường của `spec` (engine/toon/characters.js):
- `skin`, `hair`, `hairStyle`: `ponytail | spiky | bob | long | bun | twintails | short | curly | cap | bald`; `cap` (màu mũ), `accent` (màu buộc tóc).
- Thân: `top` (áo), `pants` hoặc `skirt` hoặc `dress` (kèm `legs` = màu da), `shoes`.
- Chi tiết: `hood`, `zip`, `cardigan`, `stripes` (màu sọc), `tie` (màu cà vạt), `scarf`, `glasses`, `mustache`, `bag` (balo), `book`.
- `headR` 138-150 (to = trẻ con hơn). Con ma: `{ "ghost": true }`.
- Nhân vật "hồn ma" vẽ thường nhưng mờ / chập chờn: thêm `"ghostly": true`; mắt kiểu `eyesStyle: "hollow" | "smile-closed"`, miệng `mouthStyle: "grin"`, `old: true` (nếp nhăn), `hanbok: true` (+ `chima`, `ribbon`).

## Bối cảnh lắp ghép (`library/sets/<id>.json`, `module: "kit.js"`)

- `size` [rộng x, sâu z, cao] mét; phòng nằm giữa gốc toạ độ, tường sau ở z = -sâu/2, máy quay mặc định ở phía trước (z dương).
- `floor`: `wood | tile | linoleum | tatami | carpet`; `light`: `night-cold | warm-lamp | day | sunset | red-candle`.
- Đồ đạc (`engine/toon/kit.js`, PROPS): `bed desk chair wardrobe shelf lamp floor-lamp ceiling-light window door mirror sink toilet bathtub sofa tv table rug plant fridge altar candle lantern frame poster clock stool`. Đặt bằng `"at": [x, z]` (+ `rot` độ) hoặc sát tường `"wall": "back|left|right|front", "along": m, "offset": m`. Tuỳ chọn hay dùng: `color`, `light`, `intensity`, `text`/`lines` (chữ trên tranh, poster, đồng hồ), `y`, `curtain`, `on`.
- Thêm: `board` (bảng lớp có chữ: `lines`), `ceiling-light`.
- Điểm đứng riêng: `"marks": { "teacher": [x, z], … }` — mọi điểm nhìn thấy từ góc máy được ghi vào `.json` của ảnh nền. Góc mặc định: `wide front left-wall right-wall low`. Góc riêng: `"angles": { "<tên>": { "pos", "look", "fov", "focus", "state" } }` (mẫu chi tiết: `library/sets/dorm.json`).
- Màu ám nhân vật tự theo ánh sáng bối cảnh (`charTint`).

## Giọng

- Hiệu ứng (`fx`): `muffled` (qua cửa), `ghost` (trầm, vọng), `whisper`, `phone`, `radio`, `cave`.
- Câu tiếng Hàn: giọng Hàn (`lang: "Korean"`), nghĩa tiếng Việt ở `sub`. Người kể (giọng Việt) không đọc chữ Hàn.
- Tốc độ `speed`: MiniMax / CapCut 0.5-2, ElevenLabs 0.7-1.2. Preset giọng của kênh: `library/voices.json` → `{ "preset": "…" }`.

## Âm thanh

- Tiếng động `library/sfx`: `knocks creak sting buzz heart drips drone hum` (đa số hợp không khí căng; video vui còn thiếu tiếng động vui — báo người dùng).
- Nhạc tự tổng hợp (không bản quyền): `tools/phonk.py` — phong cách phonk / buồn (`--sections "sad:… stop:1 drop:…"`, `--heavy`, `--intro heartbeat`). Luôn xuất thêm bản không nhạc để người dùng ghép nhạc trend trên nền tảng.

## Định dạng ngoài make.mjs

## Định dạng "mono" (ngụ ngôn không lời, người que) và nhạc tự tổng hợp

- Khi người dùng muốn video kiểu người que tối giản / không lời / động lực: dùng `engine/mono/mono.js` (người que có tư thế keyframe `trackAt`, phòng tối, bóng đèn, đồng hồ, sàn phản chiếu, viên gạch phát sáng) — dự án mẫu `projects/discipline/` (cảnh + `timing.json` + `sfx.py`). 2D thuần: ~2,5 phút render cho 52 s.
- Không làm lại y hệt video / kênh người dùng gửi làm mẫu: giữ thể loại, đổi câu chuyện, màu nhấn, bố cục, câu kết.
- Nhạc: `python3 tools/phonk.py <out.wav> --bpm 128 --sections "intro:4 groove:8 build:2 drop:4 outro:4"` tạo nhạc kiểu phonk (cowbell, 808, kick, clap, hats) tự tổng hợp — dùng thoải mái, in ra mốc từng đoạn để canh hình theo nhịp. Luôn xuất thêm bản **không nhạc** (chỉ tiếng động) để người dùng ghép nhạc trend trên TikTok/Reels (nhạc trend giúp phân phối).

## Lỗi hay gặp

- `angle X has no mark "Y"`: góc máy đó không có điểm đứng này — xem `.json` của góc, hoặc thêm mark vào `library/sets/<set>.json` rồi chụp lại.
- `character "X" is not in library/characters`: chưa qua cổng ③ — duyệt và lưu nhân vật trước.
- Nhân vật quá to / bị cắt: chọn góc rộng hơn, đổi `mark` xa hơn, hoặc giảm `height`.
- Khung đen khi render: kiểm tra `render.log` trong thư mục chương; chạy `npx hyperframes check --json` trong thư mục đó.
- GenMax lỗi 401: `.env` thiếu `GENMAX_API_KEY`.
- `no plate <set>@16x9/...`: chưa chụp ảnh nền khung ngang — `node tools/bake-plates.cjs <set> --landscape`.
- Phụ đề đè lên nhân vật: đổi `mark` lên cao/xa hơn, hoặc dùng góc rộng hơn — phụ đề luôn ở 75% chiều cao khung.
