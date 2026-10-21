# KidoKido — CR-002 Bán sản phẩm cho khách doanh nghiệp (ver8)

**Kết luận:** CR-002 đã được duyệt ngày 20/10/2026 và đã gộp vào baseline chính thức `ver12_211026_baseline-chinh-thuc`. Phạm vi đưa vào: lịch mua trước Phương án B + trang giới hạn bản cơ bản. Bản có nhiều trang (Option) đang chờ khách hàng chọn.

## Yêu cầu của khách hàng
- **① Thu gọn lịch** trên màn mua sản phẩm. Khách hàng ưu tiên Phương án B: mặc định hiện 1 tuần, bấm 「もっと見る」 mở 1 tháng.
- **② Trang giới hạn:** một trang riêng, chỉ ai có link mới vào được, bán các sản phẩm dành cho doanh nghiệp. Bản Option cho phép tạo nhiều trang (A, B, C…).

## File trong thư mục

| File | Dùng để làm gì | Người đọc |
|---|---|---|
| `CR-002_ETA_vi.xlsx` | **Công số và lịch đã chốt** (bản FINAL của team trên Google Sheet "KIDO-B-Vedoan") + tiền đề + câu hỏi nghiệp vụ | PM, BrSE |
| `CR-002_見積書.xlsx` | Báo giá tiếng Nhật theo từng chức năng, do kit sinh ra | Khách hàng (sau khi PM duyệt) |
| `CR-002_Impact.xlsx` | Phân tích ảnh hưởng: màn, API, dữ liệu, Figma bị chạm + giải thích vì sao là CR | Dev, PM |
| `05_Figma/` | Link view CR trên Figma, sơ đồ quan hệ sản phẩm ↔ trang giới hạn | Cả team |
| `input/` | Yêu cầu gốc của khách hàng (tiếng Nhật + tiếng Việt) | — |

## Công số và lịch (theo ETA FINAL)
- **Công số:** ① 8.4 ngày công · ② không Option 21.87 · ② có Option 59.28 (thay cho ② không Option, không cộng thêm).
- **Lịch:** bắt đầu 26/10. Làm xong ① mới sang ②.
- **Phát hành:** ① ngày 5/11 · ② không Option ngày 19/11 · ② có Option ngày 30/11.

## Cần biết
- **Hai bộ số chưa khớp:** `CR-002_見積書.xlsx` vẫn theo bảng tính của kit (toàn bộ 56.85 ngày công), chưa theo ETA FINAL. Trước khi gửi khách cần PM chọn bộ số.
- **Gate:** V-CR 27 checks · 26 PASS · 0 FAIL · 1 WARN · V-EST 9 checks · 8 PASS · 0 FAIL · 1 WARN · V-CR-FIGMA 14 checks · 13 PASS · 0 FAIL · 1 WARN (lần chạy 20/10).
- **Đơn giá** trong kit vẫn ở trạng thái nháp (DRAFT), chờ PM / Tech Lead duyệt.
- Văn phong viết lại ngày 21/10/2026 theo `.claude/sys-agent/writing-style.md`.
