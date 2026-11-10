---
name: video-factory
description: Tự làm video từ A đến Z cho TikTok, Reels, Shorts và YouTube — AI tự nghĩ nội dung và viết kịch bản, rồi cho người dùng chọn khổ (short / YouTube), nhân vật (3 ảnh), bối cảnh (3 ảnh), giọng đọc (nghe thử), và render (video dài chia nhiều cửa sổ chạy song song). Dùng skill này bất cứ khi nào người dùng muốn làm video, làm clip, làm short, làm video YouTube, "làm 1 video về…", viết kịch bản video, hoặc làm video hàng loạt trong repo này — kể cả khi họ chỉ đưa một chủ đề rất ngắn.
---

# Video Factory

Quy trình 4 bước. AI (Claude, Codex…) **tự lo nội dung**; người dùng chỉ chọn ở các điểm đánh dấu 👉. Đừng hỏi sâu về nội dung — đề xuất luôn, người dùng sửa nếu muốn.

```
① Nội dung + khổ   → AI đề xuất; 👉 người dùng chọn Short hay YouTube
② Kịch bản         → AI viết, tự soát; 👉 người dùng OK (hoặc sửa nhanh)
③ Tạo video
   3.1 Nhân vật    → 👉 3 ảnh theo mô tả, chọn 1
   3.2 Bối cảnh    → 👉 3 ảnh, chọn 1
   3.3 Giọng đọc   → 👉 nghe thử, chọn 1
   3.4 Render      → video dài: chia đoạn, mỗi cửa sổ chạy 1 đoạn, rồi ghép
```

Mỗi điểm 👉: gửi kết quả (ảnh / âm thanh bằng SendUserFile nếu có), **dừng chờ chọn**. Người dùng nói "random", "tuỳ bạn", "cứ làm" → tự chọn phương án hợp nhất, nói ngắn gọn vì sao, đi tiếp. Nhân vật / bối cảnh / giọng đã có mà hợp thì đề xuất dùng lại thay vì tạo mới — nhanh hơn và giữ nhận diện kênh.

## ① Nội dung + khổ

- Có chủ đề → giữ đúng chủ đề. Chỉ có hướng chung ("làm video về kỷ luật") hoặc không có gì → tự chọn một ý cụ thể (gợi ý ở `library/ideas.md`; `library/script-notes.md` ghi định hướng kênh và những gì người dùng đã thích / chê).
- Gửi **2-3 dòng**: tiêu đề, một câu tóm nội dung, thể loại. Rồi hỏi khổ:

| Khổ | Khung | Độ dài | Ghi chú |
|---|---|---|---|
| **Short** (TikTok / Reels / Shorts) | 9:16 | 20-90 s | hook trong 1-3 giây đầu, nhịp nhanh |
| **YouTube** | 16:9 | 3-20 phút | chia chương 60-120 s, có lời kể xuyên suốt |

## ② Kịch bản

Viết `stories/<slug>.script.md` theo `stories/_template.script.md`: 3 phương án hook, dàn ý theo giây (hoặc theo chương nếu YouTube dài), câu kết. Khung nhịp từng thể loại và mẹo viết: `references/genres.md`, `references/scriptwriting.md` — đọc phần của thể loại đang làm, không cần đọc hết. Video có thông tin thật (thủ tục, luật, con số, tin tức) → ghi nguồn; không chắc thì không đưa con số, vì người xem làm theo và kênh mất uy tín nếu sai.

Tự chấm theo bảng ở `references/scriptwriting.md` mục 9 trước khi gửi. Gửi người dùng **bản tóm**: hook đề xuất + dàn ý ngắn (không dán cả file dài).

Khi người dùng OK → viết `stories/<slug>.json` (định dạng: `references/story-format.md`), chạy soát và sửa hết lỗi:

```bash
node tools/script-lint.mjs stories/<slug>.json
```

## ③ Tạo video

### 3.1 Nhân vật — 3 ảnh

Có sẵn: `ls library/characters` (mỗi file có `desc`). Cần nhân vật mới → viết `demos/<vai>.json` với **3 phương án** theo mô tả của người dùng (hoặc tự nghĩ, khác nhau rõ: kiểu tóc, trang phục, màu), rồi:

```bash
node tools/demo.cjs chars demos/<vai>.json          # -> demos/<vai>.png (3 phương án x 3 biểu cảm)
```

Người dùng chọn → lưu `library/characters/<id>.json` = `{ "id", "desc", "spec" }`. Trường của `spec`: `references/assets.md`.

### 3.2 Bối cảnh — 3 ảnh

Có sẵn: `ls library/sets` (`dorm`, `student-room`, `student-room-day`, `lop-hoc`…), ảnh nền ở `library/plates/<set>/`. Cần mới → `demos/<noi>.json` với **3 phương án** (khác bố cục / ánh sáng / đồ đạc), rồi:

```bash
node tools/demo.cjs sets demos/<noi>.json           # -> demos/<noi>.png
```

Người dùng chọn → lưu `library/sets/<id>.json` (`module: "kit.js"`, `spec`) và chụp ảnh nền theo khổ đã chọn:

```bash
node tools/bake-plates.cjs <id>                     # Short (9:16)
node tools/bake-plates.cjs <id> --landscape         # YouTube (16:9)
```

Đồ đạc, ánh sáng, góc máy, điểm đứng: `references/assets.md`.

### 3.3 Giọng đọc — nghe thử

Người dùng có thể gọi giọng bằng tên trong GenMax ("kể chuyện ma", "Nam Trầm", "George"…):

```bash
node scripts/voices.mjs find "<tên>"                # tra theo tên (bỏ qua dấu, hoa thường)
node scripts/voices.mjs list clone                  # giọng người dùng tự clone — ưu tiên khi họ nhắc tên
```

Viết `demos/voices-<slug>.json` (mỗi vai có lời: 3 giọng phù hợp, đọc đúng một câu thật trong kịch bản để nghe đúng ngữ cảnh), rồi:

```bash
node tools/voice-demo.mjs demos/voices-<slug>.json  # -> <vai>-1..3.mp3 + <vai>-tat-ca.mp3 (nghe liền, có đọc số)
```

Gửi `<vai>-tat-ca.mp3`. Giọng được chọn ghi vào `voices` của kịch bản JSON. Câu đã nghe thử được cache — lúc render không tạo lại, không tốn thêm credit.

### 3.4 Render

Xem trước bố cục (nhanh, không tốn thêm credit) và gửi người dùng nếu là bối cảnh / nhân vật mới:

```bash
node scripts/make.mjs stories/<slug>.json --no-render
node tools/storyboard.cjs out/<slug>                # -> out/<slug>/storyboard.png
```

**Short** — một lệnh:

```bash
node scripts/make.mjs stories/<slug>.json --jobs 2  # -> out/<slug>/<slug>.mp4 + sheet.png
```

**YouTube / video dài — chia cửa sổ.** Video được chia thành các chương (mặc định ≤ 90 s, đổi bằng `--chapter N`). `--no-render` ghi sẵn lệnh cho từng cửa sổ vào `out/<slug>/windows.txt`:

```bash
node scripts/make.mjs stories/<slug>.json --no-render      # chuẩn bị + windows.txt
node scripts/make.mjs stories/<slug>.json --only 1         # cửa sổ 1
node scripts/make.mjs stories/<slug>.json --only 2         # cửa sổ 2 … (chạy cùng lúc)
node scripts/make.mjs stories/<slug>.json --join           # khi tất cả xong: ghép + trộn âm nền + chuẩn hoá âm lượng
```

Mỗi cửa sổ là một terminal riêng mở ở thư mục repo (trên máy người dùng hoặc một phiên AI riêng); một cửa sổ nhận được nhiều chương (`--only 1,2`). Số cửa sổ nên khoảng bằng số nhân CPU / 2 — nhiều hơn thì các cửa sổ tranh CPU, không nhanh thêm. Nếu tự chạy được trong phiên hiện tại: chạy các `--only` dưới nền, chờ xong rồi `--join`. Lệnh `--only` / `--join` phải dùng cùng `--chapter` với lúc chuẩn bị (đã ghi sẵn trong `windows.txt`). Đo được: ~5,3 s render cho mỗi giây video mỗi cửa sổ (4 nhân, không GPU).

Giao: gửi `out/<slug>/<slug>.mp4` (âm lượng đã chuẩn -14 LUFS). Báo số credit GenMax đã dùng (in ở cuối lệnh). Gợi ý caption + hashtag + nhắc bật nhãn "nội dung AI" khi đăng.

## Sau khi giao

Ghi vào `library/script-notes.md` những gì người dùng chọn / sửa / chê — lần sau đề xuất trúng hơn; đánh dấu ✅ ý tưởng đã làm trong `library/ideas.md`. Người dùng gửi số liệu (view, % xem hết, bình luận) → ghi vào bảng "Hiệu quả video".

## Tham khảo (chỉ đọc khi cần)

| File | Khi nào đọc |
|---|---|
| `references/genres.md` | Khung nhịp, hook, kết cho 14 thể loại + định dạng "mono" (người que) và "aura edit" |
| `references/scriptwriting.md` | Nguyên tắc giữ chân, thư viện hook, twist, viết cho giọng AI, bảng tự chấm |
| `references/examples.md` | Kịch bản mẫu đã chạy, có phân tích |
| `references/story-format.md` | Định dạng kịch bản JSON cho `make.mjs` |
| `references/assets.md` | Trường nhân vật, đồ đạc / ánh sáng bối cảnh, góc máy, giọng, tiếng động, nhạc tự tổng hợp, lỗi hay gặp |
