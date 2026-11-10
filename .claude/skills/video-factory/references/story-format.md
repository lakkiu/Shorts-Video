# Định dạng kịch bản JSON (`stories/<slug>.json` → `scripts/make.mjs`)

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

- **Kịch bản**: `genre` (mã thể loại), `target` (giây mục tiêu), `sources` (bắt buộc với explainer / howto / news / myth / compare / language / ad), `cta` (bắt buộc với ad).
- **Chữ trên màn hình**: `title` trong cảnh — chuỗi hoặc `{ text, orig (chữ Hàn phía trên), style: "banner" | "number" | "label", color, at, dur }`; `number` = số to trong vòng tròn (danh sách), `label` = chữ to không nền ("LỜI ĐỒN", "🇻🇳 Việt Nam"…).
- **Cảnh (shot)**: `angle` (tên ảnh nền trong `library/plates/<set>/`), `set` (nếu khác bối cảnh mặc định), `move`: `hold drift push push-fast pull pan-left pan-right tilt-up tilt-down` hoặc `{ "zoom": [a, b], "pan": [[x, y], [x, y]] }` (zoom ≥ 1, pan -1..1), `lead` (giây trước nhịp đầu), `dim` 0-1, `tint`, `overlay: "peephole"`, `notify: { who, text, time, at, dur }`, `fx: [{ type: "flicker" | "blackout", at, dur, rate, threshold, depth }]`. Cảnh đen: `{ "black": true, "text", "hold" }`.
- **Nhịp (beat)** chạy nối tiếp: lời `{ say, text, gap }` (người nói = khoá trong `voices`), tiếng động `{ sfx, caption, hold, shake: [giây] }`, kèm tiếng động trong lời: `also: [{ sfx, at, volume, shake }]`.
- **Thời điểm** trong `keys`, `walk.at`, `fadeAt`, `fx.at`, `notify.at`: số giây từ đầu cảnh, `"bN"` (đầu nhịp N), `"eN"` (cuối nhịp N), cộng trừ: `"b2+0.6"`.
- **Nhân vật**: `id` (trùng tên người nói thì tự nhép miệng), `char` (file trong `library/characters`), `mark` (điểm đứng có trong `.json` của góc máy đó — kiểm tra bằng `cat library/plates/<set>/<angle>.json`), `mood`, `pose`, `look` (-1 trái … 1 phải), `keys` (đổi trạng thái theo thời gian; thêm `lookDown`, `tilt`, `lean`), `walk { to, at, dur }`, `height` (m, mặc định 1.6; ma 2.0), ma: `fadeAt`, `fadeDur`.
- `mood`: `neutral calm happy excited surprised wow scared worried relieved sleepy`. `pose`: `idle wave arms-up reach phone phone-off cower point`.
- `voices.<vai>`: `{ name }` (tên giọng GenMax), `{ preset }` (trong `library/voices.json`) hoặc `{ voice, provider (minimax|capcut|elevenlabs) }`, cộng `speed, model, fx, color (màu phụ đề), quote (phụ đề trong ngoặc kép)` — lấy từ cổng ②.
- Bối cảnh có sẵn: `dorm` (ký túc xá đêm), `student-room` (phòng trọ đêm), `student-room-day` (phòng trọ ban ngày), `lop-hoc` (lớp học tiếng Hàn ban ngày). Thể loại không phải truyện ma dùng bối cảnh ban ngày, không `tint` tối, `ambience` rỗng hoặc nhẹ.
- Tiếng động có sẵn (`library/sfx`): `knocks creak sting buzz heart drips drone hum` (đa số hợp không khí căng; video vui cần thêm tiếng động / nhạc vui — chưa có, báo người dùng). Nền (`ambience`) được lặp liên tục và trộn ở bước cuối, tắt khi `blackout`.
