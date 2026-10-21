# KidoKido — Baseline chính thức (ver12)

**Đây là baseline chính thức duy nhất của dự án** (21/10/2026). Mọi yêu cầu thay đổi sau này phân tích dựa trên folder này.

- **Gồm:** toàn bộ hệ thống hiện tại + CR-002 đã duyệt (lịch mua trước Phương án B, trang giới hạn bản cơ bản — chờ phát hành 5/11 và 19/11). Bản nhiều trang (Option) chưa đưa vào vì khách hàng chưa chọn.
- **Văn phong:** toàn bộ chữ đã viết lại theo `.claude/sys-agent/writing-style.md` (dễ hiểu, câu ngắn, hạn chế mã nội bộ trong câu cho người đọc).
- **Folder baseline cũ** (ver1, ver4, ver5, ver7, ver9, ver10, ver11) đã xoá theo yêu cầu; nội dung đã gộp vào đây.
- **Cần người rà:** tên màn tiếng Việt của các màn chưa mở được / chưa có tiêu đề và vài nhãn nghiệp vụ do AI dịch — xem `run-log.md` mục Giới hạn.

| # | Output | File | Số lượng | Gate | Trạng thái |
|---|---|---|---|---|---|
| O1 | Basic Design WEB-01 | `01_Screens/BasicDesign_WEB-01_ver12.xlsx` | 45 sheet màn hình | WARN | ⚠️ gate có cảnh báo |
| O1 | Basic Design WEB-02 | `01_Screens/BasicDesign_WEB-02_ver12.xlsx` | 49 sheet màn hình | WARN | ⚠️ gate có cảnh báo |
| O2 | API & Code map | `02_API/API_Doc_KidoKido_ver12.xlsx`<br>`02_API/CodeMap_KidoKido_ver12.png` | 143 API · 0 batch/khác | PASS | ✅ |
| O3 | Database | `03_DB/DB_Doc_KidoKido_ver12.xlsx`<br>`03_DB/ERD_KidoKido_ver12.png` | 25 bảng · 324 cột | PASS | ✅ |
| O4 | Design System WEB-01 | `04_DesignSystem/WEB-01/project/`<br>`04_DesignSystem/WEB-01/STATUS.md`<br>`https://claude.ai/artifact/L6VfhzcbZmpfo1wfpYoD2E` | 76 màu · 18 style chữ · 20 component · 61 icon · 12 TBD · DRAFT | WARN | ⚠️ gate có cảnh báo |
| O4 | Design System WEB-02 | `04_DesignSystem/WEB-02/project/`<br>`04_DesignSystem/WEB-02/STATUS.md`<br>`https://claude.ai/artifact/QubGWoAQ3dLzTbNSQxG9i3` | 43 màu · 19 style chữ · 15 component · 11 icon · 25 TBD · DRAFT | WARN | ⚠️ gate có cảnh báo |
| O5 | Figma | `05_Figma/figma-links.md` | 6 link | — | ⚠️ chưa chạy gate |
| O6 | Overview | `06_Overview/Overview_KidoKido_ver12.docx` | 1 tài liệu | PASS | ✅ |
| O7 | Bug List | `07_BugList/BugList_KidoKido_ver12.xlsx` | 0 bug | PASS | ✅ |

Kiểm chứng dữ liệu nguồn (V1/V2): WARN

## Cách dùng khi có yêu cầu mới

Chạy `/change-request <file | link | mô tả>` — agent đọc baseline mới nhất và sinh thư mục version mới (không sửa thư mục này).
