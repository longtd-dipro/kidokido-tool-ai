# Run log — ver12_211026_baseline-chinh-thuc

version_type: BASELINE
baseline: gộp ver1 (O1–O3, O6, O7) + ver10 (O4) + ver9 (O5) + CR-002 đã duyệt (ver8) — các folder baseline cũ đã xoá theo yêu cầu user 21/10/2026
run_mode: DELTA — không quét lại hệ thống; viết lại văn phong + gộp CR-002

## Yêu cầu (user 21/10/2026)
- CEO đánh giá: output bằng chữ phải theo văn phong mới (`.claude/sys-agent/writing-style.md` — vai PM / BrSE chuẩn Nhật, dễ hiểu, ngắn, không mã nội bộ trong câu cho người đọc).
- Áp cho mọi baseline + CR đã duyệt (CR-002). CR-001 chưa duyệt → không đụng.
- Tạo baseline chính thức mới đủ bộ; ghi đè, không backup; xoá folder baseline cũ (user chọn "Toàn bộ" + "Đủ bộ + xoá folder cũ").

## Các bước
| Bước | Kết quả |
|---|---|
| 1 Dựng ver12: copy ver1 (đổi tên file _ver12), 04_DesignSystem ver10, figma-links ver9, inventory ver11 (đã có CR-002) | — |
| 2 Trích chữ ra 15 gói JSON (`_internal/style/extract.py`) | 3.552 mục: chức năng 297 · API 251 · trường API 655 (đã gộp câu trùng) · DB 61 · câu hỏi mở 114 · màn 94 · nhãn 225 · bug list 1.204 · docx + thông báo lỗi 109 · CR-002 198 |
| 3 Viết lại song song theo `_internal/style/BRIEF.md` (15 agent) → `out/` | đủ key 15/15 gói, không còn chữ UNKNOWN |
| 4 Nạp lại (`_internal/style/apply.py`) + câu mẫu lặp trong Basic Design đổi bằng mẫu cố định (nhãn loại mục, trạng thái, mô tả, bằng chứng) | ≈ 5.900 ô; tên màn chưa có tiêu đề → tên tiếng Việt |
| 5 Thêm sheet SC-094 trang giới hạn (CR-002) vào Basic Design người dùng (`add_sc094.py`) | trạng thái: chờ phát hành |
| 6 Bug list: 10 mục sheet Suspected (phát hiện khi đọc code, mức Medium, gắn API) chuyển sang Observations theo quy tắc gate V8 hiện tại | Suspected = 0 |
| 7 11_Repo.Path → `inputs/tokiwagi` (repo đã chuyển chỗ) | — |
| 8 Sinh lại O2 · code map · O3 · O6 | — |
| 9 CR-002: nạp chữ mới vào `cr.json` → sinh lại `CR-002_Impact.xlsx`, `CR-002_見積書.xlsx`; README viết lại | — |
| 10 Xoá folder baseline cũ: ver1 · ver4 · ver5 · ver7 · ver9 · ver10 · ver11 | `version-tool context` → baseline mới nhất = ver12 |

## Gate (số chép từ script)
| Gate | Kết quả |
|---|---|
| V1 Evidence | 11 checks · 10 PASS · 0 FAIL · 1 WARN |
| V2 Inventory | 30 checks · 28 PASS · 0 FAIL · 2 WARN |
| V-BD WEB-01 / WEB-02 | 16 checks · 15 PASS · 0 FAIL · 1 WARN (mỗi file — màn chưa có ảnh đã khai) |
| V-API | 13 checks · 13 PASS · 0 FAIL · 0 WARN |
| V-DB | 9 checks · 9 PASS · 0 FAIL · 0 WARN |
| V-DS | 35 checks · 31 PASS · 0 FAIL · 4 WARN |
| V5 flow | 9 checks · 9 PASS · 0 FAIL · 0 WARN |
| V3 Overview | 14 checks · 14 PASS · 0 FAIL · 0 WARN |
| V8 Bug list | 15 checks · 15 PASS · 0 FAIL · 0 WARN |
| CR-002 V-CR · V-EST | 27 checks · 26 PASS · 0 FAIL · 1 WARN · 9 checks · 8 PASS · 0 FAIL · 1 WARN |
| H06 PII | 232 file · 0 phát hiện |

## Giới hạn / cần người rà
- Tên tiếng Việt của màn chưa mở được / chưa có tiêu đề và nhãn nghiệp vụ (VD 入場中, 割り当て数変更) do agent dịch — BrSE nên rà.
- Gate CR-002 sau này không chạy lại được với baseline ver1 (đã xoá); folder CR-001 (chưa duyệt) vẫn ghi baseline ver1.
- `CR-002_見積書.xlsx` (bảng tính của kit) chưa khớp ETA FINAL của team.

## Figma (21/10/2026)
| Bước | Kết quả |
|---|---|
| Viết lại chữ mô tả trên Figma (5 agent theo `_internal/style/BRIEF_FIGMA.md`) — không đụng chữ trong mockup UI thật, tên node, badge, số liệu gate đọc | Output 2 site 329 node · bảng tổng hợp 251 node · CR-002 CR-1/CR-2 123 node · CR-3 người dùng 185 · CR-3 quản trị 116 · bảng Technology Output 1 16 · nới 9 khung bị tràn · chữ UNKNOWN = 0 |
| Thống nhất thuật ngữ (施設 = cửa hàng · U·K = người dùng, khách chưa đăng nhập) | 27 node · sửa 1 chỗ thay nhầm "Cơ sở dữ liệu" |
| Bảng thay đổi CR-002 mất cột 「実装 MD」 + 5 dòng tổng sau lượt viết lại → vẽ lại đúng chỗ (frame 17006:6780) | 59 ô số đủ · V-CR-FIGMA 14 checks · 13 PASS · 0 FAIL · 1 WARN (đối chiếu baseline ver12) |
