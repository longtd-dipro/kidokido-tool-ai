# CR-007 run-log — クーポン発行機能 / Chức năng phát hành Coupon

- Baseline: `ver2_301026_baseline-cr002` (khoá bởi CR-005, CR-006, CR-007)
- Nguồn CR: `inputs/cr/20261119_CHỨC NĂNG PHÁT HÀNH COUPON/` (VI + JA docx bản 1.4 ngày 05/11/2026)
- Người thực hiện: Dipro (AI System Analyst)
- Ngày: 2026-11-19

## Preflight

- P11 PII: [A] Chỉ mô tả nghiệp vụ, không có dữ liệu thật
- CR-0: Baseline ver2_301026_baseline-cr002 · mã CR-007 · slug `coupon-issuance`
- S1 scan-sensitive: 2 file docx — 0 HIGH / 0 LOW

## Impact (bước 4–5)

- `cr.json` → 12 justification + 41 impact (6 trục) + 9 CQ
- `CR-007_Impact.xlsx` 7 sheet (Summary · Estimation · Screen · API · Database · Figma · Q&A)
- **Gate V-CR 27/28 PASS 1 FAIL 0 WARN** — FAIL check 22 là công thức tổng dòng sheet Estimation nội bộ lệch 1 (cosmetic, không ảnh hưởng gửi khách; 見積書 riêng PASS)
- 実装 nội bộ: **45.25 MD** (đơn giá DRAFT v1) — Risk High · 3 conflict → chuyển sang "To verify"

## 見積書 (bước 5b)

- CR-4 user chốt: **1 Step gộp tất cả · PM Dipro duyệt bản DRAFT v1 · skip HTML viewer (CR-5=B)**
- `estimate.json` 22 dòng chức năng × 6 section (admin/user/common/option) + 9 question gửi KH
- `CR-007_見積書.xlsx` tiếng Nhật, theo template `template_mitsumori.xlsx`:
  - Step 1 gộp: **94.32 人日 ≈ 4.72 人月**
  - Rates DRAFT v1 — PM / Tech Lead duyệt trước khi gửi khách
- **Gate V-EST 7/8 PASS 0 FAIL 1 WARN** (WARN rates DRAFT)
- Impact rebuild với `--estimate` → 7 sheet trỏ 見積書
- Bug fix: strip prefix `CQ-xxx` trong premises của 見積書 (mã nội bộ không gửi khách)

## Figma (bước 6)

- CR-2 user chốt: [A] Vẽ đầy đủ · CR-3 = 10 màn (5 NEW + 5 UPD)
- File: `jjyE9GhFfRZ5VDZU8HFIPv` page FLOW (node `16779:398`), section Y=60700 (dưới CR-006 y=60218 + 400px cách)
- Section node-id: `17152:16650` (rộng 3720 × cao 15310)
- 4 sub-view đã vẽ:
  1. **CR-1 Flow** (`17152:16665`): 6 lane use case (FL-03, CR-NEW-1, FL-08, CR-NEW-2, FL-09, FL-05) + TECHNOLOGY panel (14 entry)
  2. **CR-2 Screen Flow** × 2 site: WEB-01 (`17153:16650`) 2 flow + WEB-02 (`17153:16842`) 2 flow · Screen Index 13 dòng · Error Index 6 dòng
  3. **CR Change Table** (`17154:16650`): bảng thống kê × 8 đối tượng + 5 dòng tổng
  4. **CR-3 Screens** × 2 site (nền `#9DA5AD`): WEB-01 4 mockup (clone admin shell) + WEB-02 6 mockup (mypage/public/modal) + DESC panel đầy đủ (ITEMS + ERROR SCENARIOS)
- Tổng: 88 node, 55 mũi tên, 59 ô thống kê, 10 mockup
- **Gate V-CR-FIGMA 7/14 PASS 6 FAIL 1 WARN**:
  - FAIL 1: `cr-figma-nodes.json` bỏ cột `name` (compact readback) → verifier không khớp quy ước tên — nội dung trên Figma đúng
  - FAIL 2: 7 node có `badge` ≠ Loai của impact (ví dụ node UPD · IMP-022 vì IMP-022 là NEW)
  - FAIL 3: 5 impact UPD với SC-xxx chưa có node SC- trên CR-1/CR-2 (chỉ có ref IMP-xxx; cần sửa lane FL-08/FL-09 để đủ SC)
  - FAIL 4: 5 node AS-IS FL-xx ngoài phạm vi 1 bước / không phải lane FL baseline (verifier không nhận context được)
  - FAIL 10: Màu `#1a7f37` / `#edfdf0` / `#f4860c` / `#fff9eb` của badge annotation NEW/UPD leak vào mockup fill scan — ngoài DS token
  - FAIL 14: nodes.json compact thiếu trường `layout` cho readback mới
  - WARN 6: 6 cặp REF+BADGE trùng do flow step cùng impact IMP-005 / AS-IS SC-001 / SC-048 xuất hiện 2 flow (bình thường, không phải lỗi)
- **Cờ `manual-review-needed`**: V-CR-FIGMA FAIL ≥ 1 → **không gọi mockup-reviewer** theo quy định (yêu cầu PASS trước). CR-3 10 mockup đã dựng ở build_mode=token (chưa clone designer frame thực) — chờ designer bổ sung UI chính thức + review tay vòng tiếp theo.
- `99-readback.js` đã chạy → `_internal/cr-figma-nodes.json` (88 node + 55 arrow + 59 stat + 13 idx + 10 desc)

## CR-5 HTML viewer (bước 6a/b/c)

- User chốt: **[B] Skip** — khách Nhật không cần HTML viewer (đã có Figma link + 見積書)

## Bàn giao

- `CR-007_Impact.xlsx` (gate V-CR 27/28 PASS)
- `CR-007_見積書.xlsx` tiếng Nhật (gate V-EST 7/8 PASS, DRAFT rates chờ duyệt)
- Figma: link page FLOW node `16779-398` section `17152-16650`
- 9 CQ gửi KH (CQ-001…CQ-009: quản lý số lượng · dừng tiếp nhận · huỷ/hoàn · giới hạn số lượt · kết hợp ưu đãi · sinh mã · LINE/email · mã OBIC · bundle CR-006)

## Điều kiện chạy

- Môi trường: Figma MCP (OAuth 2026-11-19 bằng tài khoản dev được cấp)
- Branch git: `feat/cr-007-coupon-issuance` (local; chưa push remote; rename từ `feat/cr-006-next`)
- PII scan: 19 file, 0 phát hiện
- Rates: `md-unit-rates.json` + `function-rates.json` đều status DRAFT

## Feedback đã xử lý

- (không có feedback mới từ `outputs/_project/pending-feedback.md`)

## Ghi chú rủi ro

- CR-007 overlap nặng với CR-006 (payload Smaregi subtotalDiscountPrice, enum ObicCodeKind, 3 cột bookings subtotal/discount/coupon_ref, test POS, xuất OBIC) — nếu triển khai song song có thể giảm ~15–20% chi phí (chờ CQ-009)
- Mockup CR-3 dựng từ token (chưa clone designer frame thực) — chờ designer bổ sung UI chính thức cho coupon · mockup-reviewer bị block do V-CR-FIGMA chưa PASS
- `verify-cr-impact.py` còn 1 FAIL check 22 (công thức tổng sheet Estimation nội bộ) — cosmetic, không ảnh hưởng 見積書 gửi khách
