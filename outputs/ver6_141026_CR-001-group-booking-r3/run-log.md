# Run log — ver6_141026_CR-001-group-booking-r3

version_type: CR
baseline: ver1_021026_khao-sat-lan-dau
run_mode: CR (Luồng 2) — chạy lại CR-001 sau feedback Figma ver3 (CR-1 thiếu NON-HAPPY · CR-2 thiếu màn lỗi / popup + Loại trong Screen Index · CR-3 thiếu mô tả / scenario lỗi / màn UPD). ver3 giữ nguyên.

## Điều kiện chạy
| Hạng mục | Giá trị |
|---|---|
| CR input | Kế thừa ver3 (`input/` copy nguyên) · S1 sạch (kế thừa) |
| cr.json | Copy ver3, chỉ đổi `meta.cr_version` |
| Nội dung view | `_internal/gen_view_v6.py` (NG từng lane CR-1, Loại + mô tả + popup CR-2) · `_internal/gen_screens_v6.py` (25 màn CR-3) → `cr-figma.json` |
| Design System | ver4_061026_ds-figma-update (đọc README + tokens.json + component README WEB-01 / WEB-02 trước khi vẽ — `screens.ds_read`) |
| Đơn giá MD | .claude/config/md-unit-rates.json v1 — DRAFT |
| Dữ liệu trên Figma | Dữ liệu mẫu DATA-PRIVACY §4 (Công ty ABC · 山田太郎 · user_a@example.com · 090-0000-0000 · SO-0001 · ¥1,000) |
| Figma | TOKIWAGI-PJ page FLOW · tài khoản dipro_pm2 |

## Sửa kit (trước khi vẽ)
| File | Thay đổi |
|---|---|
| `render-cr-figma.py` | CR-1: nhánh NG mỗi lane · CR-2: node popup / màn lỗi, Screen Index cột Loại + TỔNG, ⑦ Error / Popup Index · CR-3: khung CHG-ANN NEW/UPD/DEL đánh số ①…, panel mô tả phải (ITEMS + ERROR SCENARIOS), shell modal · validate input (thiếu NG / mô tả / lỗi → dừng) · `--ds-baseline` · readback chia PART (giới hạn 20 KB), lọc màu chỉ bỏ khung annotation |
| `verify-cr-figma.py` | check 11 (NG mỗi lane) · 12 (màn lỗi mỗi group, Loại, TỔNG, ⑦) · 13 (DESC + ITEMS + ERRORS, UPD có tô màu, đủ màn NEW + UPD) · `--nodes` nhận nhiều file · check 6 phân biệt theo shape |
| `selftest-cr-impact.py` | Fixture có NG / popup / Screen Index / DESC / màn UPD + 9 ca lỗi mới cho check 11–13 → 71 ca · 71 PASS · 0 FAIL |
| `sys-agent/figma/cr-view.md` · `flow-2-change-request.md` · `AGENTS.md` | Ghi yêu cầu mới, câu hỏi CR-3 mặc định NEW + UPD + popup, anti-pattern |

## Kết quả
| Bước | Kết quả |
|---|---|
| build-cr-impact.py | CR-001_Impact.xlsx — 7 sheet · 81 hạng mục · 実装 114.75 MD |
| V-CR | 27 checks · 26 PASS · 0 FAIL · 1 WARN (đơn giá DRAFT) |
| render-cr-figma.py | figma-js/ 01–03 + 04-screens-01..13 + 99-readback |
| Figma | section 16835:398 (y = 25426): CR-1 · CR-2 · Change Table · CR-3 25 màn |
| V-CR-FIGMA | 13 checks · 13 PASS · 0 FAIL · 0 WARN (162 node · 110 mũi tên · 65 ô thống kê · 25 màn) |
| PII scan | `detect-pii.js --scan` 30 file · 0 phát hiện |

## Sự cố / sửa trong lần chạy
- 04-screens per-file 2 > 45 KB → chỉ gửi token của site cần dùng; gộp 4 màn / lần gọi (6 lần + 1 lần đầu).
- Screen Index lọt popup hiển thị Inline (Loại không thuộc enum) → renderer chỉ đưa popup / màn lỗi có Loại màn hình vào Index.
- Đọc ngược > 20 KB → đọc 4 phần, ghép bằng `_internal/readback/assemble.py` → `cr-figma-nodes.json`.
- Readback cũ bỏ cả nội dung bên trong khung CHG-ANN khi kiểm màu (gần như không kiểm) → sửa chỉ bỏ chính khung; kiểm lại 25 màn vẫn PASS check 10.
- AS-IS của SC-071, SC-076, SC-005, SC-027 dựng từ nhãn trong code (ảnh baseline chụp nhầm / chưa quan sát) → ghi CQ-012 trên panel mô tả.

## Còn mở
- Section Figma ver3 (16803:398) chưa xoá — chờ user quyết.
- Đơn giá MD DRAFT — PM / Tech Lead duyệt.
- sidebar-width WEB-02 315px vẫn TBD (STATUS.md WEB-02 D7).
