# Cẩm nang viết kịch bản

Đọc hết file này trước khi viết `script.md` ở cổng ①. Sau đó đọc `library/script-notes.md` (bài học + số liệu các video đã đăng) và ưu tiên điều đã hiệu quả với kênh.

## 1. Nguyên tắc giữ chân trên video ngắn

- **Giây 0-1 quyết định người xem có lướt qua không.** Câu đầu và hình đầu phải cùng nói một điều lạ. Không chào, không giới thiệu kênh, không "hôm nay mình sẽ kể…".
- **Giây 1-3: câu hook trọn vẹn** (≤ 15 từ). Người xem phải có một câu hỏi trong đầu: *chuyện gì sẽ xảy ra? tại sao? rồi sao nữa?*
- **Giây 3-7: chứng minh lời hứa** — một chi tiết cụ thể làm hook đáng tin (tên, số phòng, giờ, con số).
- **Cứ 6-10 giây một thông tin mới hoặc một mức căng mới.** Không có câu nào chỉ để "nối".
- **Cứ ~8 giây một lần đổi nhịp** cho mắt: cắt cảnh, cận mặt, im lặng, tiếng động, chữ/tin nhắn hiện lên. Công cụ `script-lint` báo đoạn nào quá 8 s không đổi cảnh.
- **Trả lời câu hỏi của hook ở cuối, không sớm hơn.** Trả lời sớm = người xem rời đi.
- **Kết thúc ngay sau cú cuối.** Không giải thích thêm, không "vậy đó các bạn". Câu chữ cuối nên làm người xem muốn **xem lại** (twist đổi nghĩa câu đầu) hoặc **bình luận** (câu hỏi cho người xem).

## 2. Thư viện hook (luôn đưa 3 kiểu khác nhau)

| Kiểu | Công thức | Chuyện ma | Đời sống du học | Kiến thức / học tiếng |
|---|---|---|---|---|
| Câu hỏi trực diện | "Nếu bạn…, bạn có…?" | "Nửa đêm có người hỏi bạn bằng tiếng Hàn. Bạn có dám trả lời 'vâng'?" | "Nếu chỉ còn 50 nghìn won, bạn sống ở Seoul được mấy ngày?" | "Bạn có biết người Hàn không bao giờ rót rượu bằng một tay?" |
| Luật lạ / cấm đoán | "Ở X có một luật: …" | "Ký túc xá này có luật: sau 2 giờ sáng không mở cửa." | "Ở Hàn, đừng bao giờ viết tên người bằng mực đỏ." | "Ở Hàn có một chữ bạn không được nói với người lớn tuổi." |
| Nghịch lý | "A, nhưng B" (hai vế mâu thuẫn) | "Cô ấy mất ba ngày rồi, tối qua vẫn nhắn tin cho tôi." | "Tôi sang Hàn học tiếng, nhưng câu đầu tiên tôi học là tiếng Việt." | "Từ 'cảm ơn' tiếng Hàn dài 5 chữ, nhưng người Hàn chỉ nói 2." |
| Vào thẳng khoảnh khắc căng nhất | Câu từ cuối truyện, rồi lùi lại | "3 giờ 02. Tin nhắn đến. Và tôi hiểu mình vừa mở cửa cho ai." | "Lúc cảnh sát gõ cửa, tôi mới biết mình làm thêm sai luật." | — |
| Con số cụ thể | Số + điều bất thường | "Phòng 305 đổi người 7 lần trong một năm." | "Tháng đầu ở Seoul tôi tiêu 3 triệu chỉ vì một lỗi." | "90% du học sinh nói sai câu này." |
| Lời thú nhận | "Tôi đã…" | "Tôi đã nói dối bà cụ phòng bên. Và bà biết." | "Tôi trượt TOPIK 3 lần vì một thói quen." | — |
| Cảnh báo | "Đừng bao giờ…" | "Đừng bao giờ ngủ quay mặt vào tường ở phòng trọ cũ." | "Đừng ký hợp đồng thuê nhà ở Hàn khi chưa xem điều này." | "Đừng nói câu này với giáo viên Hàn." |
| Ngôi thứ hai (POV) | "Bạn là…, bạn vừa…" | "Bạn vừa chuyển vào phòng mới. Đêm đầu, có tiếng gõ từ bên trong tường." | "Bạn vừa hạ cánh Incheon, điện thoại hết pin." | — |

Hook tốt: **cụ thể** (số, giờ, tên), **có xung đột**, **hiểu ngay không cần bối cảnh**, đọc trong ≤ 3 giây. Hook dở: chung chung ("Đây là câu chuyện rất đáng sợ"), mở bằng tên kênh, câu dài hơn 15 từ, cần giải thích mới hiểu.

## 3. Cấu trúc theo độ dài

**Truyện ma 45-70 s (7 nhịp)** — mẫu đã chạy: `stories/luat-ktx.json`, `stories/dung-noi-ne.json`
1. Hook (0-4 s) 2. Bối cảnh + nhân vật bằng 1 chi tiết (4-10 s) 3. Sự kiện lạ lần 1 (10-20 s) 4. Lặp lại / leo thang (20-30 s) 5. Đổi nhịp: im lặng, phát hiện, tin nhắn (30-40 s) 6. Giả an toàn (40-48 s) 7. Twist + cú hù + câu kết (48-65 s).

**Lặp ba lần (rule of three)**: sự kiện 1 (lạ), 2 (lạ hơn, người xem bắt đầu đoán), 3 (khác đi một chút — chỗ sai nằm ở đây). Đã dùng trong "Đừng nói 네": 거기 있어? → 추워 → 들어가도 돼?

**Đời sống du học / hài 30-60 s**: hook đồng cảm → tình huống quen → leo thang ngớ ngẩn → cú lật hài → câu chốt mời bình luận ("Bạn đã từng…?").

**Kiến thức / học tiếng 30-45 s**: hook nghịch lý hoặc cảnh báo → 1 sự thật duy nhất → ví dụ đời thường có nhân vật diễn → câu để học thuộc (hiện chữ to) → câu hỏi kiểm tra người xem.

**3-5 phút**: mở bằng khoảnh khắc căng nhất (cold open) → 3 hồi, mỗi hồi 60-90 s, mỗi hồi kết bằng một câu hỏi treo → điểm giữa (midpoint) đổi hướng → twist cuối nối lại cold open.

**10-20 phút**: chương 60-120 s (đúng chương của `make.mjs --chapter`). 30 s đầu là hook mạnh nhất + lời hứa ("cuối video bạn sẽ biết vì sao phòng 305 bị khoá"). Mỗi chương: một mini-hook mở, một tiết lộ, một câu treo cuối. Cứ 3-4 phút một sự kiện lớn. Nhắc lại câu hỏi chính ở phút 5, 10, 15 cho người mới vào giữa. Twist lớn nhất ở 85-90% thời lượng, kết nhanh.

## 4. Bộ công cụ twist

| Loại twist | Ý | Ví dụ |
|---|---|---|
| Người đặt luật là thủ phạm | Người hướng dẫn / cảnh báo chính là ma | Cô gái đưa chìa khoá chính là người đã mất |
| Đã ở bên trong từ trước | Nỗi sợ "ngoài cửa" thật ra đã vào | "Cậu không mở cửa… nhưng tớ vào lâu rồi." |
| Ngôn ngữ / hiểu lầm | Nhân vật vô tình đồng ý / cho phép | Trả lời "네" cho câu "vào được không?" |
| Thời gian | Sự việc xảy ra trước/sau người ta nghĩ | Tin nhắn gửi từ một ngày trước khi cô ấy mất |
| Đổi vai | Người kể / nhân vật chính mới là ma | "…và không ai trong phòng nhìn thấy tôi." |
| Bằng chứng nhỏ | Một chi tiết đầu truyện đổi nghĩa ở cuối | Đôi dép ướt ngay từ cảnh đầu hành lang |

Twist phải **công bằng**: manh mối có trên hình hoặc trong lời từ trước (để người xem xem lại thấy). Không dùng "tất cả chỉ là giấc mơ".

## 5. Viết cho giọng AI đọc (GenMax)

- Câu ≤ 15 từ; mỗi câu một ý. Câu dài làm giọng đọc đều, mất kịch tính.
- `...` = ngắt nghỉ có chủ ý (giọng sẽ dừng). `.` = dừng ngắn. Dùng `...` trước chữ quan trọng: "Và dừng lại... ngay sau lưng cậu."
- **Viết số bằng chữ** khi cần đọc tự nhiên ("ba giờ sáng", không "3h"). Giờ hiện trên hình (đồng hồ, tin nhắn) thì viết số trong `notify`/hình, không trong lời.
- Tránh từ viết tắt, tiếng Anh, ký hiệu (%, &, /) trong lời đọc. Tên riêng nước ngoài: viết phiên âm nếu giọng đọc sai.
- Thoại nhân vật ngắn hơn lời kể; mỗi nhân vật một cách nói (bà cụ: "cháu"; bạn bè: "tớ/cậu"; giáo viên: "em").
- Câu tiếng Hàn: viết đúng chữ Hàn trong `text`, nghĩa tiếng Việt trong `sub`, giọng tiếng Hàn (`lang: "Korean"`). Câu Hàn ngắn, phổ thông, kiểm tra nghĩa; ghi bảng nghĩa trong `script.md`.
- Khi nghe thử ở cổng ② thấy chữ nào đọc sai: sửa chữ viết (đổi từ, thêm dấu phẩy), không sửa giọng.

## 6. Viết để hình làm được

- Mỗi nhịp phải chỉ ra được **góc máy có sẵn** (`library/plates/<set>/`), **điểm đứng**, **biểu cảm** (`mood`/`pose`). Nhịp nào không có hình phù hợp → đổi nhịp hoặc ghi rõ cần góc mới ở cổng ④.
- **Không kể điều hình đã cho thấy**: hình là đồng hồ 03:00 thì lời nói "Đêm đầu tiên" chứ không "Đồng hồ chỉ ba giờ".
- Tối đa 3 nhân vật trên hình trong video ngắn, 2 trong một cảnh.
- Mỗi cảnh 3-8 s; cảnh dài hơn phải có chuyển động (`walk`, đổi `mood`, `fx`).
- Đánh dấu tiếng động ngay trong dàn ý (cốc cốc, điện thoại rung, im lặng, tim đập) — âm thanh là một nửa nỗi sợ.

## 7. Kết thúc và lời mời

- Câu hỏi cho người xem gắn với nội dung: "Bạn có dám nhìn ra sau không?", "Bạn đã từng nói 네 mà không hiểu chưa?".
- Kiến thức kèm theo (học tiếng): một câu hiện chữ to để người xem lưu video.
- Series: câu treo cho tập sau ("Phòng 306 thì sao? Phần 2.") — chỉ khi đã định làm tập tiếp.
- Không xin like/follow giữa video. Không mồi bình luận gây chia rẽ.

## 8. Tránh

- Mở chậm, giới thiệu dài, giải thích luật chơi quá 2 câu.
- Quá nhiều nhân vật, tên khó nhớ, tên trùng âm.
- Twist không có manh mối, hoặc twist đoán được từ giây 10.
- Máu me, tự hại, bạo lực chi tiết (nền tảng hạn chế phân phối); doạ trẻ em.
- Nói xấu / rập khuôn người Hàn, trường, địa điểm có thật; dùng tên trường thật trong truyện ma.
- Thông tin thật sai (visa, luật, giá cả) — kiểm tra và ghi nguồn.
- Chép cốt truyện phim, truyện, creepypasta có bản quyền; dùng lại câu thoại nổi tiếng.

## 9. Tự chấm trước khi gửi (bắt buộc)

Chấm từng mục 1-5, ghi bảng điểm cuối `script.md`. **Tổng ≥ 32/40 và không mục nào < 3** mới gửi người dùng; thấp hơn thì tự viết lại phần yếu (tối đa 2 vòng), nói rõ đã sửa gì.

| Mục | 5 điểm khi |
|---|---|
| Hook | Cụ thể, có xung đột, ≤ 15 từ, hiểu ngay, khác hẳn 2 phương án còn lại |
| Rõ ràng | Người xem hiểu ai, ở đâu, chuyện gì trong 10 s đầu |
| Leo thang | Mỗi nhịp căng hơn nhịp trước, không nhịp nào lặp vô ích |
| Cụ thể | Có ít nhất 3 chi tiết riêng (số, tên, vật, câu nói) |
| Twist / tiết lộ | Bất ngờ nhưng công bằng, đổi nghĩa phần đầu |
| Kết | Dừng đúng lúc, có lý do để xem lại hoặc bình luận |
| Đọc tự nhiên | Câu ngắn, ngắt nghỉ đúng, không chữ khó đọc |
| Làm được | Mọi nhịp có góc máy / nhân vật / tiếng động có sẵn hoặc đã ghi cần làm |

Sau khi viết JSON (cổng ⑤), chạy `node tools/script-lint.mjs stories/<slug>.json` (và `out/<slug>/timeline.json` nếu đã chạy `make --no-render`) và sửa mọi cảnh báo trước khi làm storyboard.

## 10. Học từ kết quả

- Sau khi người dùng chọn hook / sửa kịch bản: ghi vào `library/script-notes.md` mục "Lựa chọn của người dùng" (chọn gì, bỏ gì, lý do nếu có).
- Khi người dùng gửi số liệu sau khi đăng (view, thời gian xem trung bình, % xem hết, bình luận nổi bật): ghi vào bảng "Hiệu quả video" và rút ra 1-2 bài học.
- Trước mỗi kịch bản mới: đọc lại file đó; ưu tiên kiểu hook, độ dài, chủ đề đã có số liệu tốt; tránh điều người dùng đã bỏ.
