# Sổ kịch bản: bài học và hiệu quả

Claude đọc file này trước mỗi kịch bản mới (cổng ①) và cập nhật sau mỗi lần người dùng chọn / sửa / gửi số liệu.

## Định hướng kênh (từ người dùng)

- Kênh tiếng Việt về **du học / đời sống ở Hàn Quốc**, thể loại chính hiện tại: **chuyện ma ngắn** có yếu tố Hàn.
- Nền tảng: TikTok, Reels, Shorts (9:16, ~60 s); YouTube 16:9 khi cần.
- Người dùng thích: yếu tố **ngôn ngữ Hàn** trong truyện (ma nói tiếng Hàn, phụ đề Hàn–Việt), giá trị **học được một câu tiếng Hàn**.
- Người dùng muốn **truyện khác lạ**, không lặp mô-típ (đã từ chối "Phòng trọ giá rẻ và 3 điều luật" vì muốn chuyện khác).
- Người dùng thường giao quyền chọn ("random") ở các cổng giọng / nhân vật: khi đó chọn theo độ khớp với truyện và giải thích ngắn lý do.

## Lựa chọn của người dùng

| Ngày | Video | Đề xuất | Người dùng chọn / sửa |
|---|---|---|---|
| 2026-11-08 | Luật ký túc xá | Bản 24 s → yêu cầu dài 60 s | Thích bản có cú lừa giọng quen + tin nhắn + dấu chân |
| 2026-11-09 | (bỏ) Phòng trọ 3 điều luật | Rules-horror | Từ chối: "chuyện khác đi" |
| 2026-11-09 | Đừng nói 네 lúc 3 giờ sáng | 3 hook A/B/C | Chọn **A – câu hỏi trực diện người xem**; gợi ý ma nói tiếng Hàn |

## Hiệu quả video (điền khi có số liệu)

| Video | Ngày đăng | Nền tảng | Hook (kiểu) | Độ dài | View | Xem TB | % xem hết | Bình luận nổi bật | Bài học |
|---|---|---|---|---|---|---|---|---|---|
| Luật ký túc xá | | | Luật lạ | 65 s | | | | | |
| Đừng nói 네 lúc 3 giờ sáng | | | Câu hỏi trực diện | 65 s | | | | | |

## Bài học sản xuất (từ storyboard / video đã làm)

- Cảnh cận mặt (`phone-cu`) dễ cắt đầu nhân vật: dùng `peek` hoặc góc rộng hơn cho cảnh không cần cận sát.
- Ma đứng ngay sau nhân vật chính bị che: dùng điểm đứng lệch sang bên (`behind-right`) và cho máy lia về phía ma.
- Hai nhân vật cùng cảnh phải cách nhau đủ xa trên màn hình (≥ 350 px tâm) để không chồng nhau.
- Câu tiếng Hàn đọc chậm (0.8) + hiệu ứng ma rất ổn; câu cuối "ma nói tiếng Việt" dùng cùng giọng Hàn đọc tiếng Việt để giữ cùng một nhân vật.
- Chữ cần học (아니요) phải to, màu riêng, ở cảnh đen cuối.
