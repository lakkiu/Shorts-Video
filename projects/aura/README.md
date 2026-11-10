# Kỷ luật — aura edit (định dạng "aura")

Nhân vật đen tuyền với viền aura phát sáng + mắt sáng, cắt cảnh mỗi ô nhịp, zoom giật theo kick, rung theo downbeat, tách màu RGB đầu mỗi ô nhịp, chớp trắng ở drop, chữ đập theo phách, nhạc phonk nặng (130 BPM, drop ở 3,7 s).

- Nhạc: `python3 ../../tools/phonk.py assets/audio/phonk.wav --bpm 130 --heavy --intro heartbeat --key D --seed 3 --sections "intro:2 drop:8 break:1 drop:4 outro:1"`
- Cảnh, chữ, hiệu ứng: `index.html` (dùng `assets/mono.js`)
- Render: `npx hyperframes render -o renders/aura.mp4 --crf 18`
