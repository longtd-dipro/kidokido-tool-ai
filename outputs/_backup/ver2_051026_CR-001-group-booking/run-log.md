# Run log — ver2_051026_CR-001-group-booking

version_type: CR
baseline: ver1_021026_khao-sat-lan-dau
run_mode: CR (Luồng 2)

## Điều kiện chạy
| Hạng mục | Giá trị |
|---|---|
| CR input | FILE — inputs/cr/est_danh_sach_doan/ (見積依頼書 .docx 作成日 2026-07-17 · 見積書 .xlsx đã gửi KH) → copy vào input/ |
| S1 | scan-sensitive: xlsx 0 HIGH; docx trích text → 0 HIGH. Không có PII cá nhân trong CR |
| Baseline | ver1_021026_khao-sat-lan-dau — inventory có, O1–O7 có. Không có CR khác đang mở |
| Source đọc thêm | REPO-01 prisma/schema.prisma (enum) · src/pages/user/my-page/booking-history/[id].tsx#L730 — chỉ đọc, không đọc .env |
| Đơn giá MD | .claude/config/md-unit-rates.json v1 — DRAFT (chưa PM/Tech Lead duyệt) |
| Figma | output: file baseline TOKIWAGI-PJ page FLOW — section mới node 16795:398 (tài khoản dipro_pm2; dipro_pm4 chỉ có quyền View) |

## Gate hỏi người
| Gate | Câu trả lời |
|---|---|
| CR-0 | Đúng baseline ver1, mã CR-001 |
| CR-1 phạm vi | Đủ mọi mục; mục 拡張案 ghi rõ trong Ghi chú MD |
| CR-1 điểm KH chưa chốt | Chưa có câu trả lời → ghi CQ (17 câu), dòng liên quan Xung đột = UNKNOWN |
| CR-1 file 見積書 | Đã gửi KH — được đối chiếu |
| CR-2 | Có — vẽ vào file baseline |

## Kết quả
| Bước | Kết quả |
|---|---|
| build-cr-impact.py | CR-001_Impact.xlsx — 79 hạng mục · 114.75 MD (DRAFT) |
| V-CR | 24 checks · 23 PASS · 0 FAIL · 1 WARN (đơn giá DRAFT) |
| Figma view CR | Lần 1 (pm4): read-only, 0 node tạo. Lần 2 (pm2): lỗi namespace "cr" < 3 ký tự → Figma rollback, canvas kiểm lại sạch. Lần 3: tạo section 16795:398 — 94 node, overlap 0, cách đáy cũ 400 px |
| V-CR-FIGMA | 6 checks · 6 PASS · 0 FAIL · 0 WARN |
| detect-pii --scan | 10 file · 0 phát hiện |

## Lịch sử sửa trong lần chạy
- V-CR lần 1–2: FAIL check 9 (why_change < 10 ký tự ở 9 dòng Business + 1 dòng Screen) → viết đầy đủ lý do → PASS.
- Đổi baseline_ref của 13 màn NEW từ WEB-0x sang "—" (site ghi trong tên hạng mục) để node Figma dùng Impact ID theo luật vẽ → V-CR chạy lại PASS.
