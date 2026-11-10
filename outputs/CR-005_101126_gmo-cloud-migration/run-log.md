# Run log — CR-005_101126_gmo-cloud-migration

version_type: CR (overlay trên baseline)
baseline: ver2_301026_baseline-cr002
cr_id: CR-005
run_mode: AUTO (agent system-analyst, phiên 2026-11-10)

## Nguồn

- File CR: `inputs/cr/GMO_thay_doi/request.md` → copy có che PII sang `input/CR-005_source.md`
- Nguồn gốc: thông báo của GMO Payment Gateway Inc. (mail 2026-11-05 「SSL証明書（ルート証明書）更新」 + re-send 2026-11-09 「弊社決済センターへの接続に関する変更案内」)
- Baseline: `outputs/ver2_301026_baseline-cr002/` (đã khoá bởi CR-004 — baseline dùng chung)
- CR khác đang mở: CR-004 (obic-smaregi) — không xung đột trục (CR-004 động vào Smaregi/OBIC, CR-005 động vào GMO)
- Feedback đã xử lý: không có

## Điều kiện chạy

| Hạng mục | Giá trị |
|---|---|
| Phạm vi | CR hạ tầng — rà cấu hình + test hồi quy, KHÔNG đổi màn / DB / nghiệp vụ |
| Credential | Không dùng (không mở website, không crawl) |
| Bảng đơn giá | `md-unit-rates.json` + `function-rates.json` status = **DRAFT v1** (V-CR / V-EST WARN) — PM Dipro phải duyệt trước khi gửi khách |
| Impl override | 6/7 dòng 見積書 dùng `impl_override` (V-EST E6 WARN) — tương tự CR-004, lý do: không có rate code chuyên cho hạ tầng, dùng REGRESSION làm base rồi điều chỉnh |
| 見積書 billable | Step 1 (chuẩn bị) 4.59 人日 · Step 2 (regression) 7.62 人日 · toàn bộ 12.21 人日 (0.61 人月) — DRAFT |
| Figma MCP | Đã kết nối (ensure-env flow 2 --figma OK) |
| PII scan | PASS — 9 file quét · 0 phát hiện (sau khi che email trong `input/CR-005_source.md`) |

## Giả định đã dùng khi không có AskUserQuestion

Phiên này có hỏi 4 câu AskUserQuestion:

| Câu hỏi | User chọn | Ghi chú |
|---|---|---|
| CR-0 baseline + mã CR | ver2_301026_baseline-cr002 · CR-005 · slug `gmo-cloud-migration` | ✅ |
| CR-1 phương thức GMO | Chưa rõ — agent tự grep code | Agent xác định: **Protocol Type** (`/payment/EntryTran.idPass` ... `kt01.mul-pay.jp`) + **Token Payment V2** (`window.Multipayment.getToken` trong `src/utils/gmo.ts`) |
| Scope output | Full pipeline 7-sheet + Figma + 見積書 | ✅ chạy đầy đủ |
| CR-4 見積書 | Step 1 chuẩn bị + Step 2 regression · PM Dipro duyệt | ✅ |
| CR-2 Figma sections | CR Change Table + CR-1 Flow (skip CR-2 Screen Flow + CR-3) | Lý do CR hạ tầng không đổi UI; không có màn NEW/UPD |
| CR-5 HTML viewer | — không hỏi | Skip vì không có CR-3 screens để chụp |

## Kết quả phân loại

- **CR**: 6 hạng mục (CR-005.1 trust R46 · .2 SNI verify · .3 Node/OpenSSL cipher · .4 IP allowlist · .5 管理画面 cutover · .6 regression toàn luồng)
- **BUG**: 0
- **QUESTION**: 0 (mọi câu hỏi nằm trong Q-A của Impact + 見積書)
- **CHƯA RÕ**: 6 CQ chờ KH / SRE / Tech Lead (CQ-001…CQ-006)

## Phân tích 6 trục

| Trục | NEW | UPD | DEL | IMPACT | 実装 MD |
|---|---|---|---|---|---|
| System | 0 | 0 | 0 | 14 | 3.5 |
| DB | 0 | 0 | 0 | 0 | 0 (no_impact — CR hạ tầng không đổi schema / dữ liệu) |
| Business | 0 | 0 | 0 | 0 | 0 (no_impact — luồng nghiệp vụ giữ nguyên) |
| Screen | 0 | 0 | 0 | 7 | 1.75 |
| ThirdParty | 0 | 1 | 0 | 0 | 1.0 |
| Mockup | 0 | 0 | 0 | 0 | 0 (no_impact — không có mockup mới) |
| **TỔNG** | **0** | **1** | **0** | **21** | **6.0 MD impact xlsx (nội bộ, DRAFT)** |

## Output đã tạo

- `CR-005_Impact.xlsx` — 7 sheet (Summary · Estimation · Screen · API · Database · Figma · Q&A); 21 impact; `verify-cr-impact.py`: 27 PASS · 0 FAIL · 1 WARN (E19 đơn giá DRAFT)
- `CR-005_見積書.xlsx` — 7 dòng chức năng; Step 1 4.59 / Step 2 7.62 / toàn bộ 12.21 人日 (0.61 人月); 前提条件・留意事項 đủ 4 khối; `verify-estimate.py`: 7 PASS · 0 FAIL · 1 WARN (E6 impl_override — DRAFT rates)
- `_internal/cr.json` · `_internal/estimate.json` · `_internal/cr-figma.json`
- `_internal/figma-js/01-shell-flow.js` + `03-change-table.js` + `99-readback.js` — CR-1 Flow + Change Table; **chờ user chạy `use_figma`** từng JS (PAGE_ID `16779:398`, Y 20000, section mới), rồi `verify-cr-figma.py` để đóng gate V-CR-FIGMA
- `input/CR-005_source.md` — bản CR đã che email + SĐT
- `README.md` + `_internal/index.json` (version index)

## Việc còn chờ KH / nội bộ

1. **Tech Lead Dipro / SRE KH** (CQ-001): xác nhận phiên bản Node.js + OpenSSL production — **BLOCKING** cho Step 1.3 (cipher)
2. **SRE KH TOKIWAGI** (CQ-002 + CQ-004): outbound firewall / proxy có strip SNI không; danh sách IP mới GMO
3. **KH TOKIWAGI** (CQ-003): chia sẻ file đính kèm `willap.jp/file/AAACrI2AKwGdCLQWiz.WbZhfLAlowAwcVdSuKg` để lấy lịch cutover API + IP
4. **KH TOKIWAGI** (CQ-005): shopId/shopPass test có sẵn trên Cloud trước 2026-11-18 không
5. **PM Dipro / KH** (CQ-006): ai quản task 2028 bỏ R3 khỏi trust store
6. **PM Dipro**: duyệt `function-rates.json` + `md-unit-rates.json` chuyển từ DRAFT sang APPROVED trước khi gửi 見積書 cho KH
7. **User chạy `use_figma`** từng JS trong `_internal/figma-js/` → sau đó agent chạy `verify-cr-figma.py` (gate V-CR-FIGMA)

## Rủi ro ưu tiên 1 (báo khách)

- Lịch GMO 管理画面 ngắn: test cutover 2026-11-18 (còn 8 ngày), prod 2026-12-07 — nếu không rà kịp runtime + firewall → thanh toán có thể fail
- Node.js production version chưa xác nhận — nếu < 16 phải nâng (ngoài scope CR này, cần ticket riêng)
- SNI bắt buộc chỉ có hiệu lực end-to-end — nếu có TLS terminator trung gian strip SNI → vẫn fail
