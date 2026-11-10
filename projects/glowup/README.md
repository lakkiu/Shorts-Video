# Glow-up aura edit — "6 tháng"

Cú lật cảm xúc: flash-forward thành công (hook) → bị phản bội, buồn, uống rượu (màu lạnh, nhạc buồn) → NOOOO (màn hình nứt, chai vỡ) → drop phonk, tập gym / học / bỏ rượu, aura tím → vàng, cơ thể to dần → người yêu cũ nhắn, "Đã xem", úp điện thoại → sân khấu thành công, vest, aura vàng → "6 THÁNG." / "NỖI ĐAU LÀ NHIÊN LIỆU."

- Nhạc: `python3 ../../tools/phonk.py assets/audio/music.wav --bpm 130 --heavy --intro heartbeat --key D --seed 5 --sections "sad:5 stop:1 drop:8 break:1 drop:4 outro:1"`
- Cảnh: `index.html` (dùng `assets/mono.js`: thêm `bulk`, `hair`, `dress`, `tie`, tư thế drink / headDown / lie / scream / confident)
- Render: `npx hyperframes render -o renders/raw.mp4 --crf 18` (~12-15 phút trên 4 nhân CPU do hiệu ứng tỏa sáng nhiều lớp)
