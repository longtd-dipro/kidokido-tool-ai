# Task 1 — Service client: `printReceiptForTransaction` trong smaregi.service.ts

> **BLOCKED bởi task-0.** Chỉ start sau khi spike xác nhận Kịch bản B khả thi. Nếu spike ra Kịch bản A, task này bị hủy và thay bằng task đổi `terminalId`.

## Mục tiêu
Thêm 1 hàm client mới `printReceiptForTransaction(contractId, transactionHeadId)` trong `smaregi.service.ts` để trigger in receipt cho 1 confirmed transaction đã tạo. Đây là building block cho task-2 (auto-in) và task-3 (reprint API).

## Context (đọc trước khi code)
- SPEC.md: `docs/features/smaregi-v2-prepaid-receipt-print/SPEC.md` (AC1, AC2)
- Spike result: `docs/features/smaregi-v2-prepaid-receipt-print/spike-result.md` — **lấy path endpoint + payload shape từ đây, không tự đoán**.
- Các endpoint hiện có (dùng làm reference cho pattern):
  - `SMAREGI_API` object: `reponsitories/tokiwagi/src/services/smaregi/smaregi.const.ts:68-77`
  - `createTransaction()`, `cancelTransaction()`: `reponsitories/tokiwagi/src/services/smaregi/smaregi.service.ts:141-182`
  - Type `SmaregiConfirmedInput`: `reponsitories/tokiwagi/src/services/smaregi/smaregi.types.ts:39`
- Blast radius `--dependents smaregi.service.ts` → 0 direct (semantic index). Grep thực tế: chỉ `smaregiSync.ts`, `smaregiTransaction.ts`, `reconcile-smaregi-transactions.ts` gọi các hàm khác trong file này. Thêm 1 hàm mới **không phá dependents cũ**.

## Yêu cầu implement

### Sửa: `reponsitories/tokiwagi/src/services/smaregi/smaregi.const.ts`
- Thêm entry vào `SMAREGI_API`:
  ```ts
  printReceipt: (transactionHeadId: string) => `<PATH TỪ SPIKE-RESULT>`,
  ```
  Path chính xác lấy từ `spike-result.md` — VD `/transactions/${id}/receipts` hoặc endpoint khác.

### Sửa: `reponsitories/tokiwagi/src/services/smaregi/smaregi.types.ts`
- Thêm type cho payload (nếu có) và response:
  ```ts
  export type SmaregiPrintReceiptInput = { /* fields từ spike */ };
  export type SmaregiPrintReceiptResponse = { /* fields từ spike */ };
  ```

### Sửa: `reponsitories/tokiwagi/src/services/smaregi/smaregi.service.ts`
- Thêm hàm mới đặt sau `cancelTransaction` (line ~182), TRƯỚC section Payment methods:
  ```ts
  /**
   * Trigger receipt print for a confirmed transaction on Smaregi. Used by:
   * - smaregiSync.ts: auto-print right after createSmaregiConfirmedTransaction (AC1)
   * - src/pages/api/admin/bookings/[id]/reprint-receipt.ts: manual reprint (AC2)
   */
  export const printReceiptForTransaction = async (
    contractId: string,
    transactionHeadId: string,
    payload?: SmaregiPrintReceiptInput,
  ): Promise<SmaregiPrintReceiptResponse> => {
    return requestSmaregi<SmaregiPrintReceiptResponse>(
      contractId,
      "POST",
      SMAREGI_API.printReceipt(transactionHeadId),
      { data: payload ?? {} },
    );
  };
  ```
- KHÔNG sửa `createTransaction`, `cancelTransaction`, `resolvePrepaidPaymentMethodId` — task này chỉ thêm.

## Unit Tests (bắt buộc)
Test file: `reponsitories/tokiwagi/src/services/smaregi/smaregi.service.test.ts` (append vào file có sẵn hoặc tạo mới nếu chưa có)
- Cover:
  - `printReceiptForTransaction()` gọi đúng path `SMAREGI_API.printReceipt(transactionHeadId)`, method POST — mock `requestSmaregi` verify args.
  - Trả về đúng shape response — verify với response mẫu từ spike.
  - Truyền `contractId` xuống `requestSmaregi` (không cache/mix contract).
- Follow `jest-testing-conventions` skill (mock HTTP layer, không hit Smaregi thật).

## Non-Regression Table
| Tính năng hiện có | File liên quan | Cách verify |
|---|---|---|
| Tạo 確定販売 cho prepaid checkout | `smaregiSync.ts::createSmaregiConfirmedTransaction`, `smaregi.service.ts::createTransaction` | Test hiện có (nếu có) phải vẫn pass; không đổi signature `createTransaction` |
| Cancel 確定販売 khi rollback checkout | `smaregi.service.ts::cancelTransaction`, callers trong `smaregiSync.ts` | Test hiện có phải vẫn pass |
| Resolve prepaid payment method | `smaregi.service.ts::resolvePrepaidPaymentMethodId` (cache) | Không đụng cache logic, không đụng const `SMAREGI_PREPAID_PAYMENT_METHOD` |
| 6 endpoint hiện có trong `SMAREGI_API` | `smaregi.const.ts:68-77` | Chỉ ADD 1 entry mới, không sửa entry cũ |

## Không được làm
- Không sửa `createTransaction()` payload để nhồi flag print vào (nếu spike chỉ ra hướng này, đó là task-2 hoặc revise SPEC).
- Không đổi `SMAREGI_TEMPORARY_TERMINAL_ID` (đó là Kịch bản A — task khác nếu cần).
- Không call hàm mới từ bất kỳ chỗ nào khác (task-2, task-3 sẽ làm).

## Definition of Done
- [ ] Build/lint pass
- [ ] Unit test pass (coverage cho hàm mới ≥90%)
- [ ] Không có `createTransaction`, `cancelTransaction` test cũ nào fail
- [ ] Non-Regression Table verify đủ

## Estimate
**S** (0.5 ngày).

## Assumptions blocked
- A1 (Smaregi có endpoint print) — task-0 phải xác nhận trước.
- Không blocked bởi Q1/Q3/Q7 (task này chỉ là service layer, không đụng UX).
