# Cẩm nang theo thể loại

Mọi kịch bản bắt đầu bằng **chọn thể loại** (ghi vào `genre` của `script.md` và kịch bản JSON). Đọc mục của thể loại đó + nguyên tắc chung trong `scriptwriting.md`. Mã thể loại dùng cho `script-lint`.

## Chọn nhanh

| Mã | Thể loại | Khi nào | Độ dài | Mục tiêu chính |
|---|---|---|---|---|
| `explainer` | Kiến thức / "Tại sao…" | Giải thích một hiện tượng, phong tục, con số | 30-60 s | Lưu, chia sẻ |
| `howto` | Mẹo / hướng dẫn | Giải quyết một việc cụ thể theo bước | 30-60 s | Lưu |
| `listicle` | Top / danh sách | "5 điều…", "3 sai lầm…" | 30-60 s | Xem hết, lưu |
| `storytime` | Kể chuyện trải nghiệm | Một chuyện đã xảy ra với "tôi"/nhân vật | 45-90 s | Xem hết, bình luận |
| `skit` | Hài / tình huống | Hiểu lầm, khác biệt văn hoá, đời sống | 20-45 s | Chia sẻ, tag bạn |
| `compare` | So sánh | Việt Nam vs Hàn, trước vs sau, kỳ vọng vs thực tế | 30-60 s | Bình luận (tranh luận nhẹ) |
| `language` | Học ngôn ngữ | Một từ / câu / lỗi sai mỗi video | 20-45 s | Lưu, follow để học tiếp |
| `myth` | Sự thật hay lời đồn | Lật một niềm tin phổ biến | 30-45 s | Bình luận, chia sẻ |
| `quiz` | Đố / thử thách người xem | Câu hỏi, người xem đoán trước đáp án | 20-40 s | Bình luận đáp án, xem lại |
| `news` | Tin / cập nhật | Chính sách, quy định, sự kiện mới | 30-60 s | Tin cậy, follow |
| `motivation` | Truyền cảm hứng / hành trình | Vượt khó, thành quả, lời khuyên | 45-90 s | Chia sẻ, follow |
| `drama` | Truyện ngắn cảm động | Một khoảnh khắc tình cảm có cú lật nhẹ | 45-90 s | Chia sẻ, bình luận cảm xúc |
| `ad` | Quảng cáo / bán dịch vụ | Giới thiệu dịch vụ (trung tâm du học, khoá tiếng…) | 15-45 s | Bấm liên hệ |
| `series-long` | Video dài YouTube | Tổng hợp, hành trình, tài liệu | 5-20 phút | Thời gian xem |

## Nguyên tắc dùng chung cho mọi thể loại

- **Một video = một ý.** Nếu tóm được trong một câu ("Người Hàn không rót rượu một tay vì…") thì đúng; tóm không được thì chia làm nhiều video.
- **Hook nói đúng điều video sẽ trả.** Hook hứa "5 điều" thì phải đủ 5 và cái mạnh nhất để cuối.
- **Cho thấy, đừng chỉ nói**: mỗi ý một hình (nhân vật diễn, chữ to, tin nhắn, cận vật). Engine có: nhân vật 2D + biểu cảm, bối cảnh, tiêu đề / số to (`title`), tin nhắn (`notify`), phụ đề hai ngôn ngữ, cảnh chữ trên nền đen.
- **Ngôn ngữ nói, không văn viết**: "bạn", "mình", câu ngắn, từ thường ngày. Không "kính thưa", không liệt kê dài trong một câu.
- **Thông tin thật phải đúng và có nguồn** (`sources` trong `script.md` và JSON) với `explainer`, `howto`, `news`, `myth`, `compare`, `language`, `ad`. Không chắc → không nói con số, hoặc nói "khoảng / tuỳ trường".

---

## `explainer` — Kiến thức / "Tại sao…"

**Khung 45 s:** Hook câu hỏi / nghịch lý (0-4) → Người xem nghĩ gì (sai) (4-10) → Câu trả lời thật, một ý (10-25) → Ví dụ đời thường có nhân vật diễn (25-38) → Câu chốt để nhớ + câu hỏi mở (38-45).

**Hook:** "Tại sao [điều lạ]?" · "Ở [nơi], [điều ngược với mình]." · "[Con số] — và lý do làm bạn bất ngờ."
- "Tại sao người Hàn không bao giờ viết tên người khác bằng mực đỏ?"
- "Ở Hàn, sinh nhật bạn có thể là hai ngày khác nhau."

**Giữ chân:** treo câu trả lời tới giây 10-15 ("nhưng lý do thật thì không phải vậy"); một ví dụ diễn bằng nhân vật thay vì kể suông.
**Kết:** một câu dễ nhớ + "Ở Việt Nam có điều tương tự không?"
**Tránh:** nhiều lý do cùng lúc; giải thích lịch sử dài; khẳng định mê tín như sự thật.

## `howto` — Mẹo / hướng dẫn

**Khung 45 s:** Hook kết quả / nỗi đau (0-4) → Vì sao cần (4-8, ≤ 1 câu) → 3-5 bước, mỗi bước 1 câu + 1 hình (8-38) → Lỗi hay gặp (38-42) → "Lưu lại để làm theo" (42-45).

**Hook:** "Làm [việc] trong [thời gian] không cần [thứ khó]." · "Đừng [làm sai] nữa, làm thế này."
- "Gia hạn visa D-2 mà không phải xếp hàng: ba bước."
- "Đừng đổi tiền ở sân bay Incheon, làm thế này."

**Giữ chân:** đánh số bước bằng `title` ("Bước 1"); bước quan trọng nhất ở cuối; nói trước "bước 3 là cái nhiều người sai".
**Tránh:** bước mơ hồ ("chuẩn bị giấy tờ"); thông tin thủ tục không có nguồn / ngày cập nhật.

## `listicle` — Top / danh sách

**Khung 45 s (5 mục):** Hook số + lời hứa (0-3) → mục 5 → 4 → 3 → 2 (mỗi mục 6-7 s: `title` số to + 1 câu + 1 hình) → mục 1 mạnh nhất (8 s) → câu hỏi "Bạn thấy cái nào đúng nhất?".

**Hook:** "[Số] [điều] [người xem quan tâm] mà [không ai nói]." · "[Số] sai lầm khiến [hậu quả]."
- "5 điều không ai nói trước khi bạn sang Hàn du học."
- "3 câu tiếng Hàn khiến giáo viên nhíu mày ngay."

**Giữ chân:** đếm ngược, để mục bất ngờ nhất cuối; mỗi mục một bối cảnh / biểu cảm khác; nhịp nhanh (cảnh 4-7 s).
**Tránh:** mục trùng ý; mục 1 yếu; hơn 7 mục trong video ngắn.

## `storytime` — Kể chuyện trải nghiệm

**Khung 60 s:** Kết quả bất ngờ trước (0-4, "Tôi bị gọi lên phòng giáo vụ vì một hộp kim chi.") → Bối cảnh 1 câu (4-10) → Diễn biến 3 bước leo thang (10-40) → Cao trào (40-50) → Bài học / cú lật nhẹ (50-60).

**Giữ chân:** mở bằng câu kỳ lạ nhất của chuyện; giọng thật, có cảm xúc; thoại nhân vật ngắn; cắt cảnh mỗi bước.
**Kết:** câu hỏi đồng cảm "Bạn đã gặp chuyện này chưa?".
**Tránh:** kể theo thứ tự thời gian từ đầu ("Hôm đó tôi thức dậy…"); kết thúc không có ý nghĩa gì.

## `skit` — Hài / tình huống

**Khung 30 s:** Tình huống quen (0-5) → Hiểu lầm / khác biệt (5-15) → Leo thang ngớ ngẩn ×2 (15-25) → Câu chốt (punchline) + phản ứng mặt (25-30).

**Hook:** bắt đầu ngay giữa tình huống, không dẫn. Ví dụ: Minh gọi gà rán bằng tiếng Hàn — "한 마리… 아니, 다섯…" — chuông cửa, năm hộp gà.
**Giữ chân:** biểu cảm nhân vật (`mood` đổi theo nhịp), im lặng 0,5 s trước câu chốt, phụ đề hai ngôn ngữ cho câu hiểu lầm.
**Kết:** dừng ngay sau câu chốt; có thể "tag người bạn hay làm thế này".
**Tránh:** giải thích câu đùa; chế giễu ngoại hình, giọng nói, quốc tịch; đùa quá 2 lớp.

## `compare` — So sánh

**Khung 45 s:** Hook hai vế (0-4) → 3 cặp so sánh, mỗi cặp: bên A (hình + 1 câu) → bên B (hình + 1 câu) (4-38) → kết luận không phán xét + hỏi người xem (38-45).

**Hook:** "Ở Việt Nam [X]. Ở Hàn thì [ngược lại]." · "Kỳ vọng vs thực tế khi [làm gì]."
- "Ở Việt Nam ăn xong ai trả? Ở Hàn thì khác."
**Giữ chân:** `title` "🇻🇳 / 🇰🇷" hoặc "Kỳ vọng / Thực tế" đổi theo cặp; cặp bất ngờ nhất để cuối.
**Tránh:** khen chê một bên; khái quát quá ("người Hàn ai cũng…") — dùng "nhiều người", "thường".

## `language` — Học ngôn ngữ

**Khung 30 s:** Hook lỗi sai / tình huống (0-4) → Câu đúng hiện chữ to (Hàn + phiên âm gợi ý + nghĩa) (4-12) → Nhân vật dùng trong tình huống (12-24) → Nhắc lại câu + đố người xem một câu biến thể (24-30).

**Hook:** "90% du học sinh nói sai câu này." (chỉ dùng con số nếu có nguồn — nếu không: "Rất nhiều du học sinh…") · "Nói '[câu]' với người lớn là thất lễ."
**Kỹ thuật:** lặp câu đích 3 lần (nghe, thấy, dùng); một câu duy nhất mỗi video; phụ đề Hàn trên Việt dưới (`sub`), giọng Hàn đọc câu Hàn.
**Kết:** "Lưu lại, mai học câu tiếp theo" (series).
**Tránh:** nhồi nhiều từ; phiên âm sai; câu Hàn chưa kiểm tra nghĩa / mức lịch sự.

## `myth` — Sự thật hay lời đồn

**Khung 35 s:** Lời đồn phát biểu như thật (0-4) → "Nhiều người tin vì…" (4-10) → "Sự thật là…" + bằng chứng / nguồn (10-25) → điều thú vị hơn lời đồn (25-32) → hỏi người xem tin điều gì khác (32-35).

**Hook:** "Ở Hàn ngủ bật quạt có thể chết. Thật không?"
**Giữ chân:** chữ to "LỜI ĐỒN" / "SỰ THẬT" (`title`); đáp án sau giây 10.
**Tránh:** giữ lời đồn sai đến cuối không bác; nguồn mơ hồ.

## `quiz` — Đố người xem

**Khung 30 s:** Câu hỏi + 3 lựa chọn hiện chữ (0-6) → "Bạn có 3 giây" (6-10, đếm `title` 3-2-1) → đáp án + giải thích 1 câu (10-20) → câu hỏi khó hơn treo cho bình luận (20-30).

**Giữ chân:** người xem tự đoán → xem tới đáp án; câu cuối không đưa đáp án → bình luận.
**Tránh:** câu đố mơ hồ có nhiều đáp án đúng.

## `news` — Tin / cập nhật

**Khung 45 s:** Điều thay đổi + ai bị ảnh hưởng (0-5) → thay đổi cụ thể (5-20) → áp dụng từ khi nào / làm gì ngay (20-35) → nguồn + ngày (35-40) → "Theo dõi để cập nhật" (40-45).

**Bắt buộc:** nguồn chính thức + ngày công bố trong `sources`; câu cuối nhắc "kiểm tra lại với trường / cơ quan". Không đoán, không giật tít sai sự thật.

## `motivation` — Truyền cảm hứng / hành trình

**Khung 60 s:** Điểm thấp nhất (0-5, "Tôi trượt TOPIK ba lần.") → cố gắng cụ thể (5-30) → bước ngoặt nhỏ (30-45) → kết quả + một lời khuyên hành động được (45-60).
**Giữ chân:** chi tiết thật (số lần, giờ học, món ăn rẻ), không sáo rỗng ("đừng bỏ cuộc"). Kết bằng lời khuyên làm được ngay.

**Định dạng "ngụ ngôn không lời" (mono)** — rất hợp `motivation`: không lời kể, người que tối giản trong phòng tối, một vật nhấn màu (viên gạch vàng), đồng hồ / bộ đếm "NGÀY N" cho thời gian trôi, hai nhân vật đối lập (người làm đều đặn vs người trì hoãn), cú lật cuối trao hy vọng, **một câu chữ đánh máy duy nhất ở cuối**, nhạc phonk dồn theo nhịp. Mẫu: `projects/discipline/` (52 s). Quy tắc: mỗi hành động rơi đúng phách; đoạn "hụt hơi" của nhạc trùng khoảnh khắc nhân vật yếu lòng; drop trùng khoảnh khắc thành quả; câu cuối ≤ 2 dòng, viết như châm ngôn của chính kênh (không chép câu nổi tiếng).

**Định dạng "aura edit"** — khi người dùng muốn video "ngầu", "tỏa aura", "sigma", "main character": nhân vật **đen tuyền + viền aura phát sáng + mắt sáng**, nhạc phonk nặng, **drop trong 4 giây đầu**, mỗi ô nhịp một cảnh hành động (tập, nâng, chạy, học, từ chối cám dỗ), **chữ 1-2 từ đập vào theo phách** ("DẬY." "TẬP." "KHÔNG."), zoom giật theo kick, rung, tách màu RGB, chớp trắng ở drop, một đoạn lặng (break) có câu nhỏ đánh máy, drop 2 nhân vật tiến về phía máy + câu chốt to ("KỶ LUẬT > ĐỘNG LỰC"). Dài 25-35 s để xem lại nhiều lần. Mẫu: `projects/aura/` (montage thuần) và **`projects/glowup/`** (có cung cảm xúc: flash-forward thành công → nỗi đau, màu lạnh, nhạc buồn `sad` → khoảnh khắc "NOOOO" (`stop`) → drop + lột xác, aura đổi màu, cơ thể to dần → cám dỗ cũ quay lại, "Đã xem" → thành công + câu nối hook). Người dùng thích có **câu chuyện cảm xúc** hơn montage thuần. Người dùng đã chê bản ngụ ngôn hiền là "chán, chưa tỏa aura" → nội dung động lực ưu tiên định dạng này.

## `drama` — Truyện ngắn cảm động

**Khung 60 s:** Một khoảnh khắc nhỏ khác thường (0-5) → hai nhân vật, một hiểu lầm / khoảng cách (5-30) → manh mối (30-45) → cú lật cảm xúc (45-55) → hình cuối im lặng + một câu (55-60).
Ví dụ: Bà chủ quán cơm Hàn hay "cho nhầm" thêm trứng cho Minh. Ngày về nước, Minh mới biết bà có con trai đang du học ở Việt Nam.
**Tránh:** ép khóc bằng lời; nhạc buồn quá to; kết dài.

## `ad` — Quảng cáo / bán dịch vụ

Công thức **PAS** (vấn đề – khuấy – giải pháp) hoặc **trước/sau**. **Khung 30 s:** Nỗi đau cụ thể của khách (0-4) → hậu quả nếu không giải quyết (4-10) → dịch vụ giải quyết thế nào, 2-3 lợi ích có số (10-22) → bằng chứng (học viên, kết quả) (22-26) → lời kêu gọi cụ thể + cách liên hệ (26-30).
**Hook:** "Hồ sơ du học Hàn bị trả về vì một tờ giấy." · "3 tháng từ con số 0 lên TOPIK 2."
**Bắt buộc:** `cta` (hành động + kênh liên hệ); không hứa chắc chắn kết quả ("100% đậu visa"); lời chứng thực phải thật / có sự đồng ý; tuân thủ quy định quảng cáo nền tảng.

## `series-long` — Video dài (5-20 phút)

Cold open 30 s (khoảnh khắc hay nhất) → lời hứa ("cuối video…") → chương 60-120 s (`make.mjs --chapter`), mỗi chương: mini-hook, nội dung, câu treo → nhắc lại lời hứa ở 25%, 50%, 75% → điều giá trị nhất ở 85-90% → kết nhanh + gợi ý video tiếp.
Thể loại con: tổng hợp nhiều `listicle`/`language`; hành trình (`motivation` dài); "một ngày của du học sinh"; giải thích sâu (`explainer` dài, nhiều nguồn).

---

## Bảng chấm theo thể loại

Dùng bảng 8 mục chung (`scriptwriting.md` mục 9), nhưng **mục "Twist / tiết lộ" đổi theo thể loại**:

| Thể loại | Mục thay "Twist" (5 điểm khi) |
|---|---|
| explainer, myth | **Tiết lộ**: câu trả lời bất ngờ, đúng, có nguồn |
| howto | **Dùng được**: người xem làm theo được ngay, bước rõ |
| listicle | **Mục cuối**: mạnh nhất, đáng chờ |
| storytime, drama | **Cú lật / cảm xúc**: bất ngờ nhưng công bằng |
| skit | **Câu chốt**: buồn cười, không cần giải thích |
| compare | **Cặp cuối**: bất ngờ nhất, không phán xét |
| language | **Nhớ được**: câu đích lặp 3 lần, có tình huống dùng |
| quiz | **Đáp án**: bất ngờ, giải thích một câu |
| news | **Chính xác**: nguồn chính thức, ngày, ai bị ảnh hưởng |
| motivation | **Hành động được**: lời khuyên cụ thể |
| ad | **Lời kêu gọi**: rõ, một hành động, có kênh liên hệ |

Thể loại cần nguồn (`explainer howto news myth compare language ad`): mục "Cụ thể" chỉ được ≥ 4 khi mọi con số / quy định có nguồn.
