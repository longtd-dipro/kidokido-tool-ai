# Run log — ver3_051026_CR-001-group-booking-r2

version_type: CR
baseline: ver1_021026_khao-sat-lan-dau
run_mode: CR (Luồng 2) — chạy lại CR-001 sau feedback 1–5 (thay thế ver2_051026_CR-001-group-booking; ver2 giữ nguyên, không sửa)

## Điều kiện chạy
| Hạng mục | Giá trị |
|---|---|
| CR input | inputs/cr/est_danh_sach_doan/ (見積依頼書 .docx + 見積書 .xlsx đã gửi KH) → input/ · S1 sạch (kế thừa ver2) |
| cr.json | từ ver2 + `cr_item` / `option` (kit mới) + tách 2 dòng chỉ một phần là 拡張案: IMP-018 → +IMP-080, IMP-074 → +IMP-081 (`_internal/gen_cr_v3.py`) |
| Template Estimation | templates/template_estimation.xlsx — bóc từ 見積書(VN) bằng extract-estimation-template.py (要件定義 ×0.2 · UI ×0.2 · テスト ×0.5 · 管理 ×0.2 · 人月 = 人日/20) |
| Đơn giá MD | .claude/config/md-unit-rates.json v1 — DRAFT |
| Design System | đã đọc README + tokens.json + STATUS.md + component README của WEB-01, WEB-02 (cr-figma.json → screens.ds_read) trước khi vẽ CR-3 |
| Figma | file baseline TOKIWAGI-PJ page FLOW · tài khoản dipro_pm2 |

## Gate hỏi người
| Gate | Câu trả lời |
|---|---|
| Feedback 4 bố cục sheet | Summary · Estimation · Screen · API · Database · Figma · Q&A |
| Feedback 5 hệ số | Dùng đúng hệ số template |
| Section Figma cũ | Vẽ mới xong, PASS gate thì xoá section cũ (16795:398) — đã xoá |
| Thứ tự | Cập nhật kit trước → sau đó mới vẽ; đọc Design System trước khi vẽ |
| CR-3 | Màn NEW — 13 màn |
| CR-3b component TBD | Mượn site kia, ghi "MƯỢN — chờ designer" |
| CR-3b sidebar-width WEB-02 | 315px theo STATUS.md (TBD) |

## Kết quả
| Bước | Kết quả |
|---|---|
| build-cr-impact.py | CR-001_Impact.xlsx — 7 sheet · 81 hạng mục · 実装 114.75 MD |
| V-CR | 27 checks · 26 PASS · 0 FAIL · 1 WARN (đơn giá DRAFT) |
| render-cr-figma.py | figma-js/ 01–04 + 99-readback |
| Figma | section 16803:398: CR-1 Flow (Output 1) · CR-2 Screen Flow (Output 2) · CR Change Table thống kê · CR-3 13 màn |
| V-CR-FIGMA | 10 checks · 9 PASS · 0 FAIL · 1 WARN (2 node AS-IS cùng lane FL-07: actor + technology ngữ cảnh) |

## Sự cố / sửa trong lần chạy
- 02 Screen Flow: panel Edge của G-CR2 chồng bảng ④ Screen Index → dời bảng sang phải (node của lần chạy này); renderer đã sửa tự tính vị trí.
- 04 màn admin (IMP-057/058/059) bị khoá chiều cao khi đổi khung sang HORIZONTAL → đặt lại chiều cao tự co + sắp lại lưới CR-3; renderer đã sửa.
- 01 Flow: nhãn đè dòng ref 2 dòng ở 57 node → dời nhãn theo chiều cao dòng ref; renderer đã sửa.
- Đọc ngược > 20 KB bị cắt → đọc 2 đoạn rồi ghép cr-figma-nodes.json (124 node · 84 mũi tên · 65 ô thống kê).
- Section mới vẽ ở y = 13352 (dưới section cũ), sau khi xoá section cũ dời lên y = 9153 (cách đáy Output 2 baseline 400 px).
