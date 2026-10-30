# KidoKido — ver2 (BASELINE + CR-002 approved)

- Thư mục: `ver2_301026_baseline-cr002`
- Ngày: 30/10/2026
- Loại: BASELINE (DELTA — gộp ver1 + CR-002 đã duyệt báo giá)
- Dựa trên: `ver1_281026_baseline`
- Nguồn CR: `inputs/cr/es_danh_sach_doan_v2/final_eta.xlsx` (đã duyệt báo giá 30/10/2026)

> ⚠️ **CR-002 code CHƯA release.** Dev bắt đầu 09/11, bàn giao khách UAT 26/11 — 10/12. Mọi dòng CR-002 trong các output đều mang nhãn **"Cần xác nhận — chờ release"**. Khi release xong, chạy `scan-repo.py` + rà lại trong folder này.

## Nội dung CR-002

| ID | Phạm vi | Trạng thái |
|---|---|---|
| ① | Lịch mua trước — mặc định 7 ngày, bấm 「もっと見る」 → 1 tháng (chỉ trang 事前購入) | Chờ release ~26/11 |
| ② | Trang limited công khai (1 trang cố định — basic) | Chờ release ~10/12 |
| ③ | Smaregi ↔ Booking tích hợp + tổng hợp OBIC | Chờ release ~27/11 |
| ②-Option | Trang limited nhiều URL (A/B/C) + QR | **Chưa quyết** — chờ KH xác nhận |

## Overlay file

| File | Nội dung thêm |
|---|---|
| `00_CR-002_Pending.xlsx` | Overlay root — 20 dòng pending đầy đủ |
| `02_API/API_Doc_KidoKido_ver2.xlsx` | Thêm sheet `CR-002_Pending` (8 API) |
| `03_DB/DB_Doc_KidoKido_ver2.xlsx` | Thêm sheet `CR-002_Pending` (3 bảng/cột) |
| `05_Basic_Design/BasicDesign_WEB-01_ver2.xlsx` | Thêm sheet `CR-002_Pending` (7 màn admin) |
| `05_Basic_Design/BasicDesign_WEB-02_ver2.xlsx` | Thêm sheet `CR-002_Pending` (2 màn người dùng) |

## Output kế thừa từ ver1 (chưa đổi)

| # | Output | File | Số lượng | Trạng thái |
|---|---|---|---|---|
| O1 | Overview | `01_Overview/Overview_KidoKido_ver2.docx` | 1 tài liệu | ⚠️ chưa cập nhật CR-002 (xem overlay file) |
| O2 | API | `02_API/API_Doc_KidoKido_ver2.xlsx` | 143 API + 8 pending | ✅ kèm sheet CR-002_Pending |
| O3 | Database | `03_DB/DB_Doc_KidoKido_ver2.xlsx` + ERD | 25 bảng · 323 cột + 3 pending | ✅ kèm sheet CR-002_Pending |
| O4 | Figma | `04_Figma/figma-links.md` | 4 link + bản gửi KH JP (17075:6780 / 17075:7686) | ⚠️ chưa thêm Figma CR-002 cho ver2 |
| O5 | Basic Design WEB-01 | `05_Basic_Design/BasicDesign_WEB-01_ver2.xlsx` | 42 màn + 7 pending | ✅ |
| O5 | Basic Design WEB-02 | `05_Basic_Design/BasicDesign_WEB-02_ver2.xlsx` | 42 màn + 2 pending | ✅ |
| O6 | Design System | `06_Design_System/` | WEB-01 + WEB-02 | ⬜ không thay đổi |
| O7 | Bug List | `07_Bug_List/BugList_KidoKido_ver2.xlsx` | — | ⬜ không thay đổi |
| O8 | Dev setup | `08_Huong_dan_chay_local/DevSetup_KidoKido_ver2.md` | 1 tài liệu | ⬜ không thay đổi |

## Khi code CR-002 release

1. `scan-repo.py --prev-inventory ../ver1_281026_baseline/_internal/inventory.xlsx` — kiểm commit đổi.
2. `read-orm-schema.py` — kiểm bảng/cột mới (`tickets.limited_public`).
3. Đối chiếu từng dòng trong `00_CR-002_Pending.xlsx` → đổi nhãn `Cần xác nhận — chờ release` thành `Confirmed` kèm evidence (số commit / migration ID).
4. Khi tất cả 20 dòng Confirmed → chạy `version-tool.py promote --cr CR-002 --approved --coded` nếu kit yêu cầu, hoặc cập nhật trực tiếp folder này + xoá nhãn pending.

## Cách dùng khi có yêu cầu mới sau ver2

Chạy `/change-request <file | link | mô tả>` — agent đọc baseline này và sinh thư mục version mới (không sửa thư mục này).
