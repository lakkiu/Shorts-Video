# Kịch bản mẫu (dữ liệu huấn luyện)

Mỗi mẫu: thể loại, kịch bản theo giây, vì sao hiệu quả. Mẫu có ✅ đã chạy thành video / storyboard (JSON trong `stories/`). Viết thể loại nào thì đọc mẫu gần nhất trước.

> Kênh đã **ngừng làm chuyện ma** (xem `library/script-notes.md`). Hai mẫu chuyện ma ở cuối chỉ để tham khảo kỹ thuật (lặp ba lần, giả an toàn, twist công bằng) — không đề xuất chuyện ma nữa.

---

## 1. ✅ `listicle` + `language` — "3 câu tiếng Hàn khiến giáo viên nhíu mày" (`stories/3-cau-nhiu-may.json`, 30 s, lớp học)

| s | Hình | Lời | Vì sao |
|---|---|---|---|
| 0-4 | Banner đỏ "3 câu khiến giáo viên Hàn nhíu mày"; cô Kim + Minh | "Ba câu tiếng Hàn này, nói với giáo viên là bị nhíu mày ngay." | Hook cảnh báo + con số; banner nhắc lại hook bằng chữ cho người xem tắt tiếng |
| 4-11 | Số **3**; Minh hớn hở → cô Kim nhíu mày | Minh: 고마워! (Cảm ơn nha!) · "Câu này chỉ dùng với bạn bè. Với giáo viên, hãy nói:" · 감사합니다. (Em cảm ơn ạ.) | Mỗi mục 3 nhịp cố định: **sai (diễn) → giải thích 1 câu → đúng (giọng Hàn chuẩn)** |
| 11-19 | Số **2**; góc rộng (đổi nhịp mắt) | 너 내일 와? → "Gọi giáo viên là bạn là rất thất lễ…" → 선생님, 내일 오세요? | Phản ứng mặt cô Kim tăng dần: ngạc nhiên → lo |
| 19-27 | Số **1**; cô Kim hoảng | 응! (Ừ!) → "…giống như nói ừ trống không. Hãy nói:" → 네! (Vâng ạ!) | Mục 1 là lỗi phổ biến nhất; nối với series trước (네) |
| 27-30 | Màn đen, chữ Hàn to vàng | "감사합니다 · 선생님 · 네 — Lưu lại trước khi lên lớp. Bạn từng lỡ nói câu nào?" | Tóm 3 câu đúng để chụp màn hình / lưu; câu hỏi kéo bình luận |

Kỹ thuật dùng lại: đếm ngược với `title` style `number`; lời Việt do người kể, câu Hàn do giọng Hàn riêng (`ko`) — người kể không đọc chữ Hàn; `sources` bắt buộc.

## 2. `skit` — "Gọi gà rán bằng tiếng Hàn" (25 s, phòng trọ ban ngày `student-room-day`)

| s | Hình | Lời |
|---|---|---|
| 0-3 | Minh cầm điện thoại, tự tin | Minh: 치킨 한 마리… 아니, 다섯… 아니… (Một con gà… à không, năm… à không…) |
| 3-8 | Cận mặt Minh rối | Người kể: "Tiếng Hàn ba tháng, đếm số vẫn chưa xong." |
| 8-12 | Minh cười, gật | Minh: 네, 네! (Vâng, vâng!) |
| 12-16 | Chuông cửa (`sfx`), máy đẩy nhanh vào cửa | — (im lặng 0,5 s) |
| 16-22 | Tin nhắn (`notify`): "Đơn hàng: 5 gà rán · 95.000₩" | Minh (mặt `wow`): "…" |
| 22-25 | Màn đen | "Tag người bạn hay nói 네 cho xong." |

Vì sao: vào thẳng tình huống, không dẫn; câu chốt bằng **hình** (tin nhắn hoá đơn) thay vì lời; im lặng trước câu chốt; kết bằng tag bạn (chia sẻ). Giá trong tin nhắn là ví dụ — kiểm tra giá thật nếu muốn chính xác.

## 3. `explainer` — "Tại sao người Hàn rót rượu bằng hai tay?" (40 s)

| s | Lời | Hình |
|---|---|---|
| 0-4 | "Rót rượu một tay trước mặt thầy giáo Hàn, bạn sẽ thấy không khí đổi ngay." | Bàn ăn, Minh rót một tay, thầy giáo khựng lại |
| 4-10 | "Nhiều người nghĩ đó chỉ là phép lịch sự cho đẹp." | Minh nhún vai |
| 10-24 | "Thật ra, ở Hàn, dùng hai tay với người lớn tuổi là cách thể hiện sự tôn trọng. Đỡ cổ tay hoặc đặt tay lên ngực khi rót và khi nhận." | `title` "2 tay = tôn trọng"; Minh làm lại đúng |
| 24-34 | "Và khi uống trước mặt người lớn, người ta thường quay mặt sang một bên." | Minh quay mặt uống, thầy gật |
| 34-40 | "Ở Việt Nam, bạn có thói quen nào giống vậy không?" | Hai người cụng ly |

Vì sao: hook là một tình huống đã có hậu quả; "nhiều người nghĩ…" tạo khoảng cách để lật; một ý chính + một ý phụ; câu hỏi so sánh với Việt Nam kéo bình luận. Cần nguồn về phép tắc bàn rượu Hàn trong `sources`.

## 4. `compare` — "Ăn xong ai trả tiền? Việt Nam vs Hàn" (40 s)

Cặp 1: Việt Nam — giành nhau trả / Hàn — thường người lớn tuổi hơn hoặc người mời trả. Cặp 2: Việt Nam — "để em trả lần sau" / Hàn — lần sau người kia mời lại (cà phê sau bữa ăn). Cặp 3 (bất ngờ nhất): nhóm bạn trẻ ở cả hai nơi ngày càng chia đều. Kết: "Ở nhóm bạn của bạn, ai hay trả?"
Vì sao: `title` 🇻🇳/🇰🇷 đổi theo cặp; không phán xét; dùng "thường", "nhiều người" thay vì "người Hàn ai cũng".

## 5. `ad` — Dịch vụ hồ sơ du học (30 s, PAS)

| s | Lời |
|---|---|
| 0-4 | "Hồ sơ du học Hàn bị trả về chỉ vì thiếu một tờ giấy." |
| 4-10 | "Mất thêm hai tháng, lỡ kỳ nhập học, tiền cọc ký túc xá cũng mất." |
| 10-22 | "Trung tâm [tên] kiểm tra hồ sơ theo danh sách của từng trường, nhắc bạn từng mốc nộp, và hỗ trợ dịch thuật công chứng." |
| 22-26 | "Năm nay đã có [số] học viên nhập học đúng kỳ." (số thật, có sự đồng ý của trung tâm) |
| 26-30 | "Nhắn tin trang [tên] để được kiểm tra hồ sơ miễn phí." |

Vì sao: nỗi đau cụ thể → hậu quả đo được → lợi ích cụ thể → bằng chứng → **một** lời kêu gọi. Không hứa "100% đậu visa". JSON cần `cta` và `sources` (số liệu do trung tâm cung cấp).

## 6. `storytime` — "Tôi bị gọi lên phòng giáo vụ vì một hộp kim chi" (60 s)

Mở bằng kết quả lạ (giây 0) → bối cảnh: hộp kim chi mẹ bạn cùng phòng gửi để trong tủ lạnh chung (4-10) → cả tầng ngửi thấy, tờ thông báo dán cửa (10-25) → tôi bị nghi (25-40) → giáo vụ gọi lên… để xin công thức (40-55) → "Bạn đã bao giờ bị hiểu lầm vì đồ ăn chưa?" (55-60).
Vì sao: mở bằng câu lạ nhất; leo thang có hình (tờ thông báo, mặt nhân vật); cú lật nhẹ, tích cực.

---

## Tham khảo kỹ thuật (chuyện ma — đã ngừng làm)

- ✅ "Đừng bao giờ nói 네 lúc 3 giờ sáng" (`stories/dung-noi-ne.json`): hook câu hỏi trực diện; **lặp ba lần** (거기 있어? → 추워 → 들어가도 돼?); tiết lộ qua nhân vật thứ hai dịch lại; twist đổi ngôn ngữ; kết bằng câu học tiếng.
- ✅ "Luật ký túc xá" (`stories/luat-ktx.json`): hook luật lạ; cám dỗ bằng giọng quen; thông tin mới qua hình (tin nhắn); manh mối công bằng (dép ướt) trả lời ở twist; **giả an toàn** trước cú cuối.
