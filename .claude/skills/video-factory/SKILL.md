---
name: video-factory
description: Xưởng video kể chuyện ngắn và dài (TikTok, Reels, Shorts, YouTube) bằng nhân vật 2D trong bối cảnh 3D viền mực, giọng Việt GenMax, phụ đề và âm thanh tự động. Dùng khi người dùng muốn làm video kể chuyện (chuyện ma, đời sống du học, truyện ngắn…), duyệt nhân vật hoặc bối cảnh, hoặc làm video hàng loạt trong repo này.
---

# Video Factory

Repo này biến một **kịch bản JSON** thành video hoàn chỉnh. Ảnh nền được dựng 3D **một lần** rồi dùng lại; mỗi video chỉ ghép 2D nên render nhanh (65 s video ≈ 6 phút trên 4 nhân CPU, không GPU).

Mọi video đi qua **6 cổng duyệt**. Ở mỗi cổng: làm xong phần của cổng đó, gửi kết quả cho người dùng (SendUserFile cho ảnh/video), **dừng lại chờ duyệt**. Chỉ bỏ qua cổng khi người dùng nói rõ ("cứ làm", "không cần duyệt", "dùng lại nhân vật/bối cảnh cũ").

```
① Kịch bản  →  ② Giọng đọc  →  ③ Nhân vật  →  ④ Bối cảnh  →  ⑤ Storyboard  →  ⑥ Render + giao
```

## ① Duyệt kịch bản

Viết `stories/<slug>.script.md` theo mẫu `stories/_template.script.md` (chưa phải JSON) rồi gửi người dùng. Gồm:

1. **Logline** một câu, **độ dài dự kiến** (≈ 3,3 từ tiếng Việt/giây với giọng kể 0,95x), nền tảng đích.
2. **3 phương án hook** khác kiểu nhau, mỗi cái ≤ 15 từ, nói trong 3 giây đầu. Ghi rõ kiểu của từng cái:
   - *Luật lạ / cấm đoán*: "Ký túc xá này có một luật: sau 2 giờ sáng không mở cửa."
   - *Nghịch lý nêu như sự thật*: "Cô ấy chết ba ngày trước, nhưng tối qua vẫn nhắn tin cho tôi."
   - *Câu hỏi trực diện người xem*: "Nếu nửa đêm có người gõ cửa gọi đúng tên bạn, bạn có mở không?"
   - *Vào thẳng khoảnh khắc căng nhất* (flash-forward) rồi quay lại: "3 giờ 02 phút. Tin nhắn đến. Và tôi hiểu mình vừa mắc sai lầm."
   - *Con số / chi tiết cụ thể*: "Phòng 305 đã đổi người ở 7 lần trong một năm."
3. **Dàn ý theo nhịp**, mỗi nhịp một dòng kèm thời điểm, đánh dấu kỹ thuật giữ chân đang dùng:
   - **Vòng mở (open loop)**: đặt câu hỏi ở đầu, chỉ trả lời ở cuối.
   - **Leo thang mỗi 6-10 giây**: mỗi nhịp phải lớn hơn nhịp trước (tiếng gõ → giọng quen → tin nhắn trái ngược → dấu chân).
   - **Đổi nhịp (pattern interrupt)** mỗi ~8 giây: cắt cảnh, im lặng đột ngột, tiếng động, cận mặt, tin nhắn hiện lên.
   - **Giả an toàn** trước cú cuối ("Minh thở phào") để cú lật mạnh hơn.
   - **Twist chơi lại hook**: câu cuối phải làm người xem hiểu lại câu đầu.
   - **Kết vòng**: câu chữ cuối / câu hỏi khiến người xem xem lại hoặc bình luận ("Bạn có dám nhìn ra sau không?"). Không chào, không "like và đăng ký" chen giữa.
   - Không mô tả lại điều hình đã cho thấy; câu ≤ 15 từ; một ý một câu.
4. **Danh sách cần có**: các vai có lời (cho cổng ②), nhân vật (mới / có sẵn trong `library/characters`), bối cảnh (mới / có sẵn trong `library/sets`), tiếng động.

Video dài (5-20 phút): chia **chương** 60-120 s, mỗi chương có hook nhỏ riêng và kết bằng một câu hỏi treo; 30 s đầu vẫn phải có hook mạnh nhất.

Nội dung: cốt truyện, nhân vật, câu chữ luôn là của mình, không chép phim/truyện có bản quyền. Thông tin thật (visa, học phí, luật) phải đúng và ghi nguồn trong `script.md`. Video có giọng AI: nhắc người dùng bật nhãn "nội dung AI" khi đăng.

## ② Duyệt giọng đọc

Mỗi vai có lời (người kể + từng nhân vật nói + ma) nghe **5 giọng**, đọc **đúng câu thật của vai đó trong kịch bản** (chọn câu đặc trưng nhất: câu hook cho người kể, câu thoại quan trọng nhất cho nhân vật), có sẵn hiệu ứng của vai (`muffled`, `ghost`…) để nghe đúng như trong video.

**Người dùng gọi giọng bằng tên** như trong GenMax ("kể chuyện ma", "Nam Trầm", "George"…): tra bằng

```bash
node scripts/voices.mjs find "kể chuyện ma"     # bỏ qua dấu/hoa thường; không có thì tìm trong thư viện chia sẻ ElevenLabs
node scripts/voices.mjs list clone             # giọng người dùng tự clone (ưu tiên khi họ nhắc tên)
node scripts/voices.mjs sync                   # cập nhật library/voice-catalog.json khi họ vừa clone giọng mới
```

và dùng thẳng tên trong JSON: `{ "name": "kể chuyện ma", "speed": 0.95 }` (thêm `"provider"` nếu tên trùng ở nhiều nguồn). Nếu tên không khớp chính xác, đưa người dùng các tên gần nhất để chọn, đừng tự đoán.

Danh sách giọng:

```bash
node scripts/genmax-tts.mjs --voices                       # MiniMax tiếng Việt (uniq_id | tên | tag)
node scripts/genmax-tts.mjs --voices --provider capcut     # CapCut tiếng Việt (voice_id số)
node scripts/genmax-tts.mjs --voices --provider elevenlabs # ElevenLabs (đọc tiếng Việt bằng model eleven_v3)
node scripts/genmax-tts.mjs --credits
```

Chọn 5 ứng viên khác nhau rõ (giới tính / tuổi / chất giọng / nhà cung cấp) hợp với vai, viết `demos/voices-<slug>.json`:

```json
{ "roles": [
  { "role": "narrator", "text": "Câu hook thật của kịch bản…",
    "candidates": [ { "label": "Nam trầm điện ảnh", "voice": "Vietnamese_Serene_Man", "speed": 0.95 },
                    { "label": "Nam trầm (CapCut)", "voice": "7493478233703191041", "provider": "capcut", "speed": 0.95 },
                    { "label": "George (ElevenLabs)", "voice": "JBFqnCBsd6RMkjVDRZzb", "provider": "elevenlabs" } ] },
  { "role": "ghost", "text": "Câu thoại của ma…", "fx": "ghost", "candidates": [ … ] }
] }
```

```bash
node tools/voice-demo.mjs demos/voices-<slug>.json   # -> demos/voices-<slug>/<role>-1..5.mp3 + <role>-tat-ca.mp3
```

Gửi người dùng các file `<role>-tat-ca.mp3` (nghe lần lượt, có đọc "Giọng số một…") và bảng số → tên giọng (in ra cuối lệnh, lưu ở `README.txt`); gửi thêm file lẻ nếu họ muốn nghe lại một giọng. Người dùng có thể đổi tốc độ (`speed`: MiniMax/CapCut 0.5-2, ElevenLabs 0.7-1.2) hoặc hiệu ứng → chạy lại (giọng đã tạo được cache, chỉ phần mới tốn credit). Giọng được chọn ghi vào `voices` của kịch bản JSON (giữ nguyên `voice`, `provider`, `speed`, `model`, `fx`) — cache dùng chung nên khi render không tạo lại câu đã nghe thử. Giọng hay dùng lại cho kênh: lưu vào `library/voices.json` (tên preset → cấu hình giọng) rồi trong kịch bản chỉ cần `{ "preset": "horror-narrator" }` (có thể ghi đè thêm `speed`, `fx`…).

Hiệu ứng giọng (`fx`): `muffled` (qua cửa), `ghost` (trầm, vọng), `whisper`, `phone`, `radio`, `cave`.

## ③ Duyệt nhân vật

Nhân vật có sẵn: `ls library/characters` (mỗi file có `desc`). Dùng lại nếu hợp.

Nhân vật mới: viết `demos/<vai>.json` với **ít nhất 5 phương án khác hẳn nhau** (khác kiểu tóc, trang phục, màu, tính cách) — hoặc 5 biến thể sát mô tả nếu người dùng đã tả cụ thể — rồi:

```bash
node tools/demo.cjs chars demos/<vai>.json        # -> demos/<vai>.png, gửi người dùng
```

```json
{ "role": "Bạn cùng phòng", "candidates": [
  { "name": "Tuấn", "desc": "Năng động, mũ lưỡi trai đỏ, áo sọc", "spec": { "skin": "#f3c9a5", "hair": "#1d1a1a", "hairStyle": "cap", "cap": "#e5484d", "top": "#f4f1ea", "stripes": "#2f6fdb", "pants": "#3b3f52", "shoes": "#ffffff", "headR": 146 } }
] }
```

Trường của `spec` (engine/toon/characters.js):
- `skin`, `hair`, `hairStyle`: `ponytail | spiky | bob | long | bun | twintails | short | curly | cap | bald`; `cap` (màu mũ), `accent` (màu buộc tóc).
- Thân: `top` (áo), `pants` hoặc `skirt` hoặc `dress` (kèm `legs` = màu da), `shoes`.
- Chi tiết: `hood`, `zip`, `cardigan`, `stripes` (màu sọc), `tie` (màu cà vạt), `scarf`, `glasses`, `mustache`, `bag` (balo), `book`.
- `headR` 138-150 (to = trẻ con hơn). Con ma: `{ "ghost": true }`.

Người dùng chọn số nào → lưu `library/characters/<id>.json` = `{ "id", "desc", "spec" }`. Muốn chỉnh → sửa spec, chạy lại demo với 1-3 biến thể.

## ④ Duyệt bối cảnh

Bối cảnh có sẵn: `ls library/sets` (mỗi file có `description`), ảnh nền đã chụp: `library/plates/<set>/*.jpg` + `.json` (góc máy và điểm đứng).

Bối cảnh mới: viết `demos/<noi>.json` với **5 phương án** (khác bố cục, màu, ánh sáng, đồ đạc), mỗi cái là một spec lắp ghép:

```bash
node tools/demo.cjs sets demos/<noi>.json         # -> demos/<noi>.png
```

```json
{ "name": "Phòng thờ nhà cổ", "desc": "Ánh nến đỏ, bàn thờ, đèn lồng", "spec": {
  "size": [4.4, 4.6, 3.0], "wall": "#c9a98a", "wainscot": "#6b3a2a", "floor": "tile", "floorColor": "#9a6a5a", "light": "red-candle",
  "props": [ { "kind": "altar", "wall": "back", "along": 0, "offset": 0.3 }, { "kind": "lantern", "at": [-1.3, -0.8] } ] } }
```

- `size` [rộng x, sâu z, cao] mét; phòng nằm giữa gốc toạ độ, tường sau ở z = -sâu/2, máy quay mặc định ở phía trước (z dương).
- `floor`: `wood | tile | linoleum | tatami | carpet`; `light`: `night-cold | warm-lamp | day | sunset | red-candle`.
- Đồ đạc (`engine/toon/kit.js`, PROPS): `bed desk chair wardrobe shelf lamp floor-lamp ceiling-light window door mirror sink toilet bathtub sofa tv table rug plant fridge altar candle lantern frame poster clock stool`. Đặt bằng `"at": [x, z]` (+ `rot` độ) hoặc sát tường `"wall": "back|left|right|front", "along": m, "offset": m`. Tuỳ chọn hay dùng: `color`, `light`, `intensity`, `text`/`lines` (chữ trên tranh, poster, đồng hồ), `y`, `curtain`, `on`.

Người dùng chọn → lưu `library/sets/<id>.json` = `{ "name", "description", "module": "kit.js", "spec": {...} }`. Thêm `angles` / `marks` riêng nếu góc mặc định (`wide front left-wall right-wall low`; điểm đứng `center left right back front`) chưa đủ cho kịch bản — mẫu chi tiết: `library/sets/dorm.json`. Rồi chụp và xem:

```bash
node tools/bake-plates.cjs <id>                   # khung dọc 9:16  -> library/plates/<id>/*.jpg + *.json
node tools/bake-plates.cjs <id> --landscape       # khung ngang 16:9 -> library/plates/<id>@16x9/
```

Kịch bản `"format": "16:9"` dùng ảnh nền `<set>@16x9` — chụp bản ngang trước khi làm video YouTube. Màu ám nhân vật (`charTint`) lấy theo ánh sáng của bối cảnh, tự áp khi kịch bản không ghi `tint`.

Gửi ảnh nền cho người dùng nếu bối cảnh mới. Bối cảnh không lắp ghép được (hành lang, phố…) thì viết module riêng như `engine/toon/dorm.js`.

## ⑤ Duyệt storyboard

Chuyển `script.md` đã duyệt thành `stories/<slug>.json`, rồi:

```bash
node scripts/make.mjs stories/<slug>.json --no-render   # giọng (GenMax, có cache) + project từng chương
node tools/storyboard.cjs out/<slug>                    # out/<slug>/storyboard.png: mỗi cảnh một ảnh
```

Xem storyboard.png **trước khi gửi**: nhân vật đứng đúng chỗ, không che chữ, không bị cắt mặt, phụ đề không đè vào mặt. Sửa JSON và chạy lại (giọng đã cache nên nhanh). Gửi storyboard cho người dùng.

### Định dạng kịch bản JSON

```json
{
  "title": "Luật ký túc xá", "slug": "luat-ktx", "format": "9:16", "set": "dorm",
  "tint": "rgba(30,40,90,0.22)",
  "voices": {
    "narrator": { "voice": "Vietnamese_Serene_Man", "speed": 0.95 },
    "linh": { "voice": "Vietnamese_Cute_Girl_v1", "fx": "muffled", "color": "#ffb3c7", "quote": true }
  },
  "ambience": [{ "sfx": "drone", "volume": 0.55 }, { "sfx": "hum", "volume": 0.45 }],
  "shots": [
    { "angle": "room-door", "move": "push",
      "chars": [{ "id": "minh", "char": "minhPJ", "mark": "room-center", "mood": "surprised", "look": -0.8,
                  "keys": [{ "at": "b2", "mood": "excited" }], "walk": { "to": "door-inside", "at": "b2+0.6", "dur": 3.4 } }],
      "beats": [
        { "sfx": "knocks", "caption": "Cốc… cốc… cốc…", "shake": [0, 0.55, 1.1] },
        { "say": "narrator", "text": "Một giọng nói quen thuộc vang lên ngoài cửa." },
        { "say": "linh", "text": "Minh ơi, tớ Linh đây!" }
      ] },
    { "black": true, "text": "Bạn có dám nhìn ra sau không?", "hold": 2.6 }
  ]
}
```

- **Cảnh (shot)**: `angle` (tên ảnh nền trong `library/plates/<set>/`), `set` (nếu khác bối cảnh mặc định), `move`: `hold drift push push-fast pull pan-left pan-right tilt-up tilt-down` hoặc `{ "zoom": [a, b], "pan": [[x, y], [x, y]] }` (zoom ≥ 1, pan -1..1), `lead` (giây trước nhịp đầu), `dim` 0-1, `tint`, `overlay: "peephole"`, `notify: { who, text, time, at, dur }`, `fx: [{ type: "flicker" | "blackout", at, dur, rate, threshold, depth }]`. Cảnh đen: `{ "black": true, "text", "hold" }`.
- **Nhịp (beat)** chạy nối tiếp: lời `{ say, text, gap }` (người nói = khoá trong `voices`), tiếng động `{ sfx, caption, hold, shake: [giây] }`, kèm tiếng động trong lời: `also: [{ sfx, at, volume, shake }]`.
- **Thời điểm** trong `keys`, `walk.at`, `fadeAt`, `fx.at`, `notify.at`: số giây từ đầu cảnh, `"bN"` (đầu nhịp N), `"eN"` (cuối nhịp N), cộng trừ: `"b2+0.6"`.
- **Nhân vật**: `id` (trùng tên người nói thì tự nhép miệng), `char` (file trong `library/characters`), `mark` (điểm đứng có trong `.json` của góc máy đó — kiểm tra bằng `cat library/plates/<set>/<angle>.json`), `mood`, `pose`, `look` (-1 trái … 1 phải), `keys` (đổi trạng thái theo thời gian; thêm `lookDown`, `tilt`, `lean`), `walk { to, at, dur }`, `height` (m, mặc định 1.6; ma 2.0), ma: `fadeAt`, `fadeDur`.
- `mood`: `neutral calm happy excited surprised wow scared worried relieved sleepy`. `pose`: `idle wave arms-up reach phone phone-off cower point`.
- `voices.<vai>`: `{ name }` (tên giọng GenMax), `{ preset }` (trong `library/voices.json`) hoặc `{ voice, provider (minimax|capcut|elevenlabs) }`, cộng `speed, model, fx, color (màu phụ đề), quote (phụ đề trong ngoặc kép)` — lấy từ cổng ②.
- Tiếng động có sẵn (`library/sfx`): `knocks creak sting buzz heart drips drone hum`. Nền (`ambience`) được lặp liên tục và trộn ở bước cuối, tắt khi `blackout`.

## ⑥ Render và giao

```bash
node scripts/make.mjs stories/<slug>.json --jobs 2       # -> out/<slug>/<slug>.mp4 + sheet.png
```

- Tự chia chương ≤ 90 s (`--chapter N`), render song song `--jobs` chương, ghép không nén lại, trộn nền, chuẩn hoá -14 LUFS (mức TikTok/Reels/Shorts).
- Thời gian trên 4 nhân CPU không GPU: ~5,3 giây render cho mỗi giây video với 1 job; `--jobs 2` gần gấp đôi tốc độ (đã đo). Video 20 phút ≈ 1,5-2 giờ với 1 job; máy nhiều nhân + `--jobs` nhanh hơn tương ứng.
- Cuối lệnh in số credit GenMax đã dùng / còn lại — báo cho người dùng.
- Mỗi lần chạy `make` xoá chương cũ trong `out/<slug>/` rồi dựng lại.
- Xem `out/<slug>/sheet.png` (một ảnh mỗi cảnh từ video thật) trước khi giao. Gửi video bằng SendUserFile. File > 100 MB: nói với người dùng có thể nén thêm.

## Lỗi hay gặp

- `angle X has no mark "Y"`: góc máy đó không có điểm đứng này — xem `.json` của góc, hoặc thêm mark vào `library/sets/<set>.json` rồi chụp lại.
- `character "X" is not in library/characters`: chưa qua cổng ③ — duyệt và lưu nhân vật trước.
- Nhân vật quá to / bị cắt: chọn góc rộng hơn, đổi `mark` xa hơn, hoặc giảm `height`.
- Khung đen khi render: kiểm tra `render.log` trong thư mục chương; chạy `npx hyperframes check --json` trong thư mục đó.
- GenMax lỗi 401: `.env` thiếu `GENMAX_API_KEY`.
- `no plate <set>@16x9/...`: chưa chụp ảnh nền khung ngang — `node tools/bake-plates.cjs <set> --landscape`.
- Phụ đề đè lên nhân vật: đổi `mark` lên cao/xa hơn, hoặc dùng góc rộng hơn — phụ đề luôn ở 75% chiều cao khung.
