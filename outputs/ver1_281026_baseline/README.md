# KidoKido — ver1 (BASELINE)

- Thư mục: `ver1_281026_baseline`
- Ngày: 28/10/2026
- Loại: BASELINE

| # | Output | File | Số lượng | Gate | Trạng thái |
|---|---|---|---|---|---|
| O1 | Basic Design WEB-01 | `01_Screens/BasicDesign_WEB-01_ver1.xlsx` | 45 sheet màn hình | WARN | ⚠️ gate có cảnh báo |
| O1 | Basic Design WEB-02 | `01_Screens/BasicDesign_WEB-02_ver1.xlsx` | 48 sheet màn hình | WARN | ⚠️ gate có cảnh báo |
| O2 | API | `02_API/API_Doc_KidoKido_ver1.xlsx` | 143 API · 0 batch/khác | PASS | ✅ |
| O3 | Database | `03_DB/DB_Doc_KidoKido_ver1.xlsx`<br>`03_DB/ERD_KidoKido_ver1.png` | 25 bảng · 323 cột | PASS | ✅ |
| O4 | Design System WEB-01 | `04_DesignSystem/WEB-01/project/`<br>`04_DesignSystem/WEB-01/STATUS.md`<br>`https://claude.ai/artifact/L6VfhzcbZmpfo1wfpYoD2E` | 76 màu · 18 style chữ · 20 component · 61 icon · 12 TBD · DRAFT | WARN | ⚠️ gate có cảnh báo |
| O4 | Design System WEB-02 | `04_DesignSystem/WEB-02/project/`<br>`04_DesignSystem/WEB-02/STATUS.md`<br>`https://claude.ai/artifact/QubGWoAQ3dLzTbNSQxG9i3` | 43 màu · 19 style chữ · 15 component · 11 icon · 25 TBD · DRAFT | WARN | ⚠️ gate có cảnh báo |
| O5 | Figma | `05_Figma/figma-links.md` | 4 link | — | ⚠️ chưa chạy gate |
| O6 | Overview | `06_Overview/Overview_KidoKido_ver1.docx` | 1 tài liệu | PASS | ✅ |
| O7 | Bug List | `07_BugList/BugList_KidoKido_ver1.xlsx` | 0 bug | PASS | ✅ |
| O9 | Dev setup | `09_DevSetup/DevSetup_KidoKido_ver1.md` | 1 tài liệu | PASS | ✅ |

Kiểm chứng dữ liệu nguồn (V1/V2): WARN

## Cách dùng khi có yêu cầu mới

Chạy `/change-request <file | link | mô tả>` — agent đọc baseline mới nhất và sinh thư mục version mới (không sửa thư mục này).
