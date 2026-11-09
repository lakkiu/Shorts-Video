# Kế hoạch xưởng video: 2.5D

## Vấn đề

Bản 3D trực tiếp (`projects/ghost-60s`) đẹp nhưng render 63 s video mất 52 phút trên máy 4 nhân không có card đồ họa.

Số đo mỗi khung hình (1080x1920, SwiftShader):

| Cấu hình | ms/khung |
|---|---|
| 3D đầy đủ (kèm làm mờ hậu cảnh) | 744 |
| 3D, bỏ làm mờ | 492 |
| 3D nửa độ phân giải | 208 |
| Chụp khung hình | ~370 |
| Video 2D thuần (DOM + GSAP) | ~54 |

Dựng 2D nhanh hơn khoảng 30 lần.

## Hướng làm

**Kho tài sản (làm một lần):**
- Bối cảnh: render các cảnh 3D thành ảnh nền chất lượng cao, mỗi bối cảnh vài góc máy, tách lớp xa / giữa / gần để tạo parallax.
- Nhân vật: xuất ảnh sprite cho từng biểu cảm và tư thế.
- Âm thanh: thư viện tiếng động và nền.
- Mục tiêu đầu: khoảng 15 bối cảnh cho kênh chuyện ma.

**Mỗi video (tự động, ~5 phút):**
1. Kịch bản kèm danh sách cảnh (JSON): câu thoại, bối cảnh, góc, biểu cảm, tiếng động.
2. Giọng GenMax song song.
3. Ghép HyperFrames 2D: lia / đẩy máy có parallax, nhân vật chớp mắt và nhép miệng, đèn chớp, phụ đề.
4. Check, render (~2-3 phút), chuẩn hóa âm lượng.
5. Ảnh tóm tắt để duyệt.

## Các hướng khác

| Phương án | 60 s video | Ghi chú |
|---|---|---|
| 2.5D (đề xuất) | ~2-3 phút | Chạy trên VPS không cần GPU |
| 3D trên máy có GPU | ~3-5 phút | Cần phần cứng hoặc thuê GPU |
| 3D chia nhỏ trên AWS Lambda / Cloud Run | ~2-5 phút | HyperFrames hỗ trợ sẵn, cần tài khoản cloud |
| 3D giảm chất lượng | ~15-20 phút | Vẫn chậm |

## Kết quả

Đã làm: `stories/luat-ktx.json` qua `scripts/make.mjs` → 65 s video, render 5 phút 42 giây (bản 3D: 52 phút), cùng nội dung và phong cách.
Ảnh nền ký túc xá: 16 góc, chụp trong 25 giây.

## Việc tiếp

- Thêm bối cảnh: nhà vệ sinh, cầu thang, sân thượng, phố đêm, cửa hàng tiện lợi, tàu điện.
- Tách ảnh nền thành lớp xa / gần để có parallax thật.
- Render song song nhiều chương trên máy nhiều nhân; đo video 20 phút.
