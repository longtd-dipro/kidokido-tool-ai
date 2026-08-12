# Task 0 — SPIKE: Verify Smaregi Platform API hỗ trợ in receipt

> **BLOCKER cho toàn bộ feature.** Task 1–4 KHÔNG được start trước khi task này chốt Kịch bản A/B/C với Product Owner.

## Mục tiêu
Xác minh giả định A1 trong SPEC: "Smaregi Platform API có endpoint/parameter trigger in receipt trên transaction đã tạo". Trả lời **rõ ràng** một trong 3 kết luận:
- **B khả thi** → giữ SPEC hiện tại, mở task 1–4.
- **B không khả thi, A khả thi** (chỉ cần đổi `terminalId` là Smaregi UI hiện nút reprint) → BA revise SPEC sang Kịch bản A; task 1–4 phải re-plan.
- **Cả B và A đều không khả thi** → BA + PO quyết định có làm Kịch bản C (tokiwagi tự in) hay đóng feature.

## Context (đọc trước khi làm)
- SPEC.md: `docs/features/smaregi-v2-prepaid-receipt-print/SPEC.md` — mục Assumptions A1, Open Questions Q4/Q5/Q6.
- File hiện tại đã có luồng auto-register 確定販売:
  - `reponsitories/tokiwagi/src/services/smaregi/smaregi.service.ts:141` — `createTransaction()` gọi `POST /transactions`
  - `reponsitories/tokiwagi/src/services/smaregi/smaregi.const.ts:68` — const `SMAREGI_API` liệt kê 6 endpoint hiện dùng (không có endpoint print/receipt)
  - `reponsitories/tokiwagi/src/utils/server/smaregiSync.ts:333` — `createSmaregiConfirmedTransaction()` là nơi task 2 sẽ hook vào
- `terminalId` hiện đang hard-code `"999999999"` trong `smaregi.const.ts:92` (`SMAREGI_TEMPORARY_TERMINAL_ID`) — nghi vấn nguyên nhân Smaregi UI ẩn nút reprint.
- Blast radius `--dependents smaregi.const.ts` → chỉ `smaregi.service.ts` + `smaregi.types.ts`. Nhưng grep callers thực tế: `smaregiSync.ts`, `smaregiTransaction.ts`, `scan.ts`, `status.ts`, `cancel/[id].ts`, `rollback-scan.ts`, `reconcile-smaregi-transactions.ts` đều gián tiếp phụ thuộc.

## Yêu cầu implement
Đây là **spike documentation**, không viết code production. Deliverable:

### 1. Nghiên cứu Smaregi Platform API docs
Tìm & trích dẫn (kèm URL/tên section) trong docs Smaregi Platform API:
- Có endpoint `POST /transactions/{id}/receipts` (hoặc tương đương) không?
- `POST /transactions` có nhận field `printReceiptFlag` / `receiptPrint` / `deliveryFlag` không?
- Điều kiện `terminalId` phải là ID thật (đăng ký trên tenant) để nút reprint hiện trên UI POS?

### 2. Test call trên môi trường sandbox Smaregi
- Dùng contractId + storeId của môi trường dev/sandbox (không phải production).
- Thử cả 2 hướng: (a) endpoint print độc lập nếu có; (b) tạo lại 確定販売 với `terminalId` thật xem UI có hiện nút reprint không.
- Ghi lại request/response mẫu.

### 3. Confirm với Q4/Q5/Q6 (nếu khách/PO có phản hồi)
- Xác nhận với PO: khách đã đối thoại với Smaregi chưa? Có văn bản trả lời không?
- Xác nhận: cửa hàng có terminalId vật lý nào? Có thể cấu hình per-tenant không?

## Output — GHI VÀO
`docs/features/smaregi-v2-prepaid-receipt-print/spike-result.md` với cấu trúc:
```
# Spike Result — Smaregi Print Receipt API

## Kết luận
- [ ] Kịch bản B khả thi (endpoint print có)
- [ ] Kịch bản A khả thi (đổi terminalId đủ)
- [ ] Cả hai không khả thi → chuyển C hoặc đóng

## Bằng chứng
- API endpoint reference: <URL / section name>
- Request/response mẫu: <paste>
- Test call log: <paste hoặc link>

## Đề xuất
<kịch bản chọn + estimate revise cho task 1–4>
```

## Unit Tests
Không áp dụng (đây là spike, không có code production).

## Non-Regression Table
| Tính năng hiện có | File liên quan | Cách verify |
|---|---|---|
| (không đụng code) | N/A | N/A |

## Không được làm
- Không sửa bất kỳ file production nào.
- Không call API in receipt trên môi trường production.
- Không đóng feature một mình — kết luận phải review với BA + PO.

## Definition of Done
- [ ] File `spike-result.md` được ghi với kết luận rõ ràng (chọn 1 trong 3 checkbox).
- [ ] BA cập nhật SPEC + Open Questions Q4/Q5 dựa trên kết luận.
- [ ] Techlead (task này) hoặc BA update `status.md` chuyển stage sang Dev nếu B/A khả thi.

## Estimate
**S** (0.5–1 ngày dev — chủ yếu đọc docs + test call sandbox).

## Assumptions blocked
- Q4 (đã hỏi Smaregi chưa) — nếu chưa, cần PO liên hệ trước khi spike có thể kết luận.
- Q5 (terminalId hiện tại) — cần Ops/PO cung cấp.
