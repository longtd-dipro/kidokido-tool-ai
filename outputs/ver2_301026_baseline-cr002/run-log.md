# Run log — ver2_301026_baseline-cr002

version_type: BASELINE (DELTA)
baseline: ver1_281026_baseline
run_mode: OVERLAY (copy ver1 → đổi tên ver2, thêm sheet CR-002_Pending trong O2/O3/O5)

## Nguồn
- Baseline gốc: `outputs/ver1_281026_baseline/` (AS-IS tại repo commit `33091a3f`)
- CR gộp vào: CR-002 — 法人向け商品販売, báo giá đã duyệt theo `inputs/cr/es_danh_sach_doan_v2/final_eta.xlsx`
- Lịch dev: 09/11 bắt đầu · UAT khách 24/11—09/12 · release 26/11 (①) · 27/11 (③) · 10/12 (②)

## Điều kiện chạy
| Hạng mục | Giá trị |
|---|---|
| Code release | ❌ Chưa — mọi dòng CR-002 đánh dấu "Cần xác nhận — chờ release" |
| Nguồn CR được dùng | `final_eta.xlsx` (sheet 詳細見積書 + sheet "Trả lời khách (vi)") · 「【TOKIWAGI様】見積書_スマレジ切り替えの追加…」 cho hạng mục ③ |
| Impact bản 15/10 | tham khảo `_backup/ver8_191026_CR-002-corporate-limited-page/CR-002_Impact.xlsx` cho ngữ cảnh (không copy nguyên vào ver2 — đã lọc theo scope final 30/10) |
| Figma | 2 section bản gửi KH JP đã có từ phiên trước (17075:6780 / 17075:7686) — ver2 trỏ cùng link |

## Policy ghi chú
Policy `AGENTS.md`: ver<N+1> chỉ tạo khi CR đã duyệt **AND** code xong. Hiện CR-002 chỉ mới duyệt báo giá. Ver2 được tạo theo yêu cầu rõ ràng của người dùng (phiên 30/10) → mọi dòng CR-002 trong output bắt buộc mang nhãn pending; khi code release phải quét lại và xoá nhãn.

## Overlay files (so với ver1)
- Thêm: `00_CR-002_Pending.xlsx` (overlay root, 20 dòng đầy đủ)
- `02_API/API_Doc_KidoKido_ver2.xlsx`: thêm sheet `CR-002_Pending` (8 API) · ô Version → ver2
- `03_DB/DB_Doc_KidoKido_ver2.xlsx`: thêm sheet `CR-002_Pending` (3 DB) · ô Version → ver2
- `05_Basic_Design/BasicDesign_WEB-01_ver2.xlsx`: thêm sheet `CR-002_Pending` (7 màn admin)
- `05_Basic_Design/BasicDesign_WEB-02_ver2.xlsx`: thêm sheet `CR-002_Pending` (2 màn người dùng)
- Đổi tên tất cả file `*_ver1*` → `*_ver2*`
- Giữ nguyên nội dung O1 docx, O6 Design System, O7 Bug list, O8 Dev setup

## Chưa làm
- O1 Overview docx chưa chèn mục CR-002 (overlay xlsx đủ dùng; cần thì chạy `build-overview-docx.py` khi code release)
- Figma: chưa vẽ view CR cho CR-002 trong ver2 (đã có 2 section bản gửi khách JP từ CR-002 cũ)
- Chưa chạy gate máy (V1/V2/V3/V-API/V-DB/V-BD) cho ver2 — vì phần CR-002 là pending không có evidence code, các gate đó sẽ FAIL cho đến khi release

## Khi code CR-002 release (sau 10/12)
1. `scan-repo.py --prev-inventory` → inventory mới
2. `read-orm-schema.py` → kiểm migration (tickets.limited_public, limited_pages?)
3. Đối chiếu 20 dòng pending → chuyển `Confirmed` kèm commit SHA
4. Chạy đủ gate (V1-V-BD) · cập nhật O1 Overview docx
5. Có thể gọi `version-tool.py promote` nếu muốn tạo ver3 formal
