# Run log — ver4_061026_ds-figma-update

version_type: BASELINE
baseline: ver1_021026_khao-sat-lan-dau
run_mode: DELTA (chỉ O4 Design System)

## Điều kiện chạy
| Hạng mục | Giá trị |
|---|---|
| Figma input | file TOKIWAGI-PJ `jjyE9GhFfRZ5VDZU8HFIPv` — Admin: 2562:361522, 2100:360305, 1830:364257, 1672:209122; User: 14487:209252, 16816:177854, 16190:446812 |
| Cách đọc | Figma MCP `get_metadata` · `get_screenshot` · `get_variable_defs` · `get_design_context` (read-only) |
| Dữ liệu nhạy cảm | Figma chứa dữ liệu mẫu (tên `ユーザー名`, `aaaa@x.y`…); không copy vào output; scan PII: 0 phát hiện |

## Kết quả gate
| Gate | Kết quả |
|---|---|
| V-DS | 33 checks · 29 PASS · 0 FAIL · 4 WARN |
| selftest-design-system | 46 ca · 46 PASS |
| PII scan | 89 file · 0 file có phát hiện |

## Diff so với ver1 (O4)
Xem `04_DesignSystem/WEB-0x/STATUS.md` → Changelog 2026-10-06 + Mâu thuẫn (WEB-01 #14–#20, WEB-02 #12–#16).

## Không chạy / bị chặn
| Output | Lý do |
|---|---|
| Scanner 16190:446812 — đọc 7/12 trạng thái (camera, reader, checkin, checkout, checkout nhiều vé, lỗi camera) | Các khung còn lại cùng cấu trúc |
| Logo WEB-02 (vector 5 mảnh trong Figma Navi) | Chưa export |
| Asset icon Figma (vuesax…) | Chưa tải vào `assets/` |

## Feedback đã xử lý
| Từ | Nội dung | Đã làm |
|---|---|---|
| chat | DS ver1 không sát sản phẩm + Figma | Đối chiếu 9 node Figma, vá token / component / README / STATUS |

## Quyết định của user
- Mâu thuẫn Figma ↔ website: **chọn website** (06/10/2026). Phần chỉ có trong Figma vẫn thêm vào, ghi nguồn.
- Cho phép cập nhật 2 link Artifact (đang editable): WEB-01 → version 6, WEB-02 → version 5.
