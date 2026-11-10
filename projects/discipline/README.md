# Kỷ luật — ngụ ngôn không lời (định dạng "mono")

Người que tối giản, một vật nhấn màu, đồng hồ quay = thời gian, chữ đánh máy ở cuối, nhạc phonk. 2D thuần (Canvas2D) nên render nhanh (~2,5 phút cho 52 s trên 4 nhân CPU).

- `timing.json` — mọi mốc thời gian (khớp nhịp nhạc 128 BPM: phách 0,469 s, ô nhịp 1,875 s)
- `index.html` — cảnh (dùng `assets/mono.js`, bản sao của `engine/mono/mono.js`)
- `sfx.py` — tiếng động từ `timing.json` → `assets/audio/sfx.wav` (đổi sang mp3 để commit)
- Nhạc: `python3 ../../tools/phonk.py assets/audio/phonk.wav --bpm 128 --sections "intro:4 groove:7 break:1 groove:4 build:2 drop:4 outro:6"`

```bash
npx hyperframes render -o renders/ky-luat.mp4 --crf 20
```
