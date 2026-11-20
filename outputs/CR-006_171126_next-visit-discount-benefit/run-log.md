# Run Log — CR-006_171126_next-visit-discount-benefit

## Điều kiện chạy

- Baseline: `ver2_301026_baseline-cr002` (locked)
- CR-0: [A] — baseline xác nhận bởi user 2026-11-18
- CR-4: [A]/[A]/[A] — Step 1/2 mapping, phương án ①-A cho SC-050 checkbox, đơn giá DRAFT
- CR-5: [A] — HTML viewer → skip (CR-5 not executed, no Figma screenshots captured)
- CR-2: Figma `jjyE9GhFfRZ5VDZU8HFIPv` page FLOW (16779:398), section y=37000
- CR-3: 10 màn (5 NEW + 5 UPD) — WEB-01 (IMP-001/002/003/004/038) + WEB-02 (IMP-005/006/007/008/009)
- Môi trường: main session (Figma MCP không khả dụng trong subagent — toàn bộ bước 6 chạy ở main)

## Bước đã chạy

| Bước | Kết quả | Ghi chú |
|---|---|---|
| 0 — ensure-env | ✅ OK | Python openpyxl + Figma MCP |
| 1 — version context | ✅ OK | Baseline ver2, CR-005 đang mở, không conflict |
| 2 — phân loại CR | ✅ OK | CR, không phải BUG/QUESTION |
| 3 — CR-0 | ✅ [A] | user xác nhận 2026-11-18 |
| 4 — cr.json + Impact.xlsx | ✅ 27/28 PASS 0 FAIL | WARN đơn giá DRAFT |
| 5 — verify-cr-impact | ✅ 27 PASS 0 FAIL | WARN rates DRAFT |
| 5b — 見積書 CR-4 | ✅ 8/9 PASS 0 FAIL | Bug fix: big label "Tổng hợp doanh thu" → "Tập hợp dữ liệu doanh thu" (scan_sheet loại nhầm do chứa "Tổng") |
| 6 — Figma | ⚠️ 10/14 PASS 3 FAIL 1 WARN | Compact renderer vs kit renderer (xem §WARN below) |
| 7 — PII scan | ✅ 0 phát hiện | 24 file quét |
| 7 — version-index | ✅ OK | 4 output |
| CR-5 HTML viewer | ⬜ skip | user chọn [A] nhưng không thực thi được trong main session do context limit |

## V-CR-FIGMA: 3 FAIL cần biết

**Check 2** — Badge mismatches in edge/flow nodes: edge nodes referencing IMP-012/IMP-013/IMP-008 vẽ bằng badge `NEW` thay vì `UPD` (nhầm trong cr-figma.json). EXT-001 (GMO) dùng làm context trong CR-2 flow nhưng không phải impact chính thức. → Nội dung đúng, chỉ là annotation badge sai trên Figma.

**Check 4** — AS-IS actor nodes: actor lanes (FL-03/FL-08/FL-09/FL-05) và start screens (SC-001/SC-004/SC-069/SC-067) được vẽ as-is làm context. Verify không tìm thấy chúng trong baseline inventory SC-/F- format. → Đây là actor/start nodes hợp lệ trong format Output 1/2; không ảnh hưởng đến nội dung nghiệp vụ.

**Check 13** — ITEMS/ERRORS table naming: compact renderer dùng frame `"ITEMS · "` thay vì row `"ITEM · "` per kit convention. → Nội dung bảng ITEMS + ERROR SCENARIOS vẫn hiển thị đúng trong Figma; chỉ là naming khác convention máy đọc.

**Check 1 WARN** — Duplicate nodes: SC-050/FL-08/FL-09/IMP-005 xuất hiện 2 lần do cùng lane được vẽ trong 2 flow khác nhau (CR-1 + CR-2). Valid per multi-flow design.

## Rates WARN

`function-rates.json` status = `DRAFT` v1 → tất cả MD là ước lượng sơ bộ. PM/Tech Lead cần duyệt trước khi gửi KH.

## Feedback đã xử lý

- estimate.json `big` label "Tổng hợp doanh thu" → "Tập hợp dữ liệu doanh thu" (scan_sheet false positive)
- CR-006 socket timeout × 2 (agent) → chạy từng bước trong main session
- render-cr-figma.py: IMP-002 blocks trimmed (n=5/9/14/18) để vừa 45KB limit

## Câu hỏi KH (12 CQ)

CQ-001…CQ-012 xem sheet Q&A trong CR-006_Impact.xlsx hoặc sheet 確認事項 trong CR-006_見積書.xlsx.
