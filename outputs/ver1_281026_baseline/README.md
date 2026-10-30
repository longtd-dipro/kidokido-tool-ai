# KidoKido — ver1 (BASELINE)

- Thư mục: `ver1_281026_baseline`
- Ngày: 28/10/2026
- Loại: BASELINE

| # | Output | File | Số lượng | Gate | Trạng thái |
|---|---|---|---|---|---|
| O1 | Overview | `01_Overview/Overview_KidoKido_ver1.docx` | 1 tài liệu | PASS | ✅ |
| O2 | API | `02_API/API_Doc_KidoKido_ver1.xlsx` | 143 API · 0 batch/khác | PASS | ✅ |
| O3 | Database | `03_DB/DB_Doc_KidoKido_ver1.xlsx`<br>`03_DB/ERD_KidoKido_ver1.png` | 25 bảng · 323 cột | PASS | ✅ |
| O4 | Figma | `04_Figma/figma-links.md` | 4 link | — | ⚠️ chưa chạy gate |
| O5 | Basic Design WEB-01 | `05_Basic_Design/BasicDesign_WEB-01_ver1.xlsx` | 42 sheet màn hình | PASS | ✅ |
| O5 | Basic Design WEB-02 | `05_Basic_Design/BasicDesign_WEB-02_ver1.xlsx` | 42 sheet màn hình | PASS | ✅ |
| O6 | Design System WEB-01 | — | — | — | ⬜ Không chạy — chờ giai đoạn 2 — bản hiện có lấy từ lần quét website trước |
| O6 | Design System WEB-02 | — | — | — | ⬜ Không chạy — chờ giai đoạn 2 — bản hiện có lấy từ lần quét website trước |
| O7 | Bug List | — | — | — | ⬜ Không chạy — chờ giai đoạn 2 — bản hiện có lấy từ lần quét website trước |
| O8 | Dev setup | `08_Huong_dan_chay_local/DevSetup_KidoKido_ver1.md` | 1 tài liệu | PASS | ✅ |

Kiểm chứng dữ liệu nguồn (V1/V2): WARN

## Giai đoạn 2 — chưa chạy

Đã xong giai đoạn 1 (đọc source code). Chạy lại `/analyze-system` và chọn chạy tiếp để làm giai đoạn 2. AI Playwright sẽ mở website thật và:

1. Đăng nhập bằng tài khoản thử nghiệm bạn cung cấp — hỏi lại 4 câu an toàn (môi trường thử nghiệm hay thật · tài khoản có được phép quét · mức thao tác · có dữ liệu thật không).
2. Đi qua từng màn, đối chiếu với kết quả giai đoạn 1; chỗ màn hình khác code → ghi thành câu hỏi, không tự sửa.
3. Chụp ảnh từng màn, đánh số các mục trên ảnh, chèn vào Basic Design (O5).
4. Bổ sung phần code không đọc được (nhãn nút, thông báo lỗi, màn chỉ thấy khi đăng nhập) → giảm ô "Cần xác nhận".
5. Lập Design System (O6) từ giao diện thật: màu, chữ, khoảng cách, component.
6. Lập Bug list (O7): thao tác thử, ghi lỗi mức High trở lên kèm bước tái hiện và ảnh.
7. Cập nhật Tài liệu tổng hợp (O1) và README với số liệu mới.

Chạy lâu (tuỳ số màn) nhưng ít token; bạn xem được AI thao tác trên màn hình. Phần mềm là app → không có giai đoạn 2.

## Cách dùng khi có yêu cầu mới

Chạy `/change-request <file | link | mô tả>` — agent đọc baseline mới nhất và sinh thư mục version mới (không sửa thư mục này).
