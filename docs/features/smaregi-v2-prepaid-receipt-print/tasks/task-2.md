# Task 2 — Auto-in receipt sau khi tạo 確定販売 cho prepaid checkout

> **BLOCKED bởi task-1.** Cần `printReceiptForTransaction()` đã có trong service layer.

## Mục tiêu
Sau khi hệ thống tạo 確定販売 thành công cho booking prepaid trong checkout flow, tự động gọi `printReceiptForTransaction()` để in receipt. Thỏa AC1, AC4, AC5.

## Context (đọc trước khi code)
- SPEC.md: AC1 (auto-in), AC4 (không rollback nếu in lỗi), AC5 (tenant chưa bật Smaregi V2 → ẩn toàn bộ).
- Điểm hook: `reponsitories/tokiwagi/src/utils/server/smaregiSync.ts:487-524` — vòng lặp trong `syncConfirmedTransactionsForPrepaidBookings()`, ngay sau khi `tx.smaregiTransaction.create(...)` thành công.
- Caller duy nhất của `syncConfirmedTransactionsForPrepaidBookings`: `src/pages/api/admin/bookings/scan.ts:693` (trong checkout POS flow). Không có caller nào khác.
- Feature gate hiện có: `enabledTenantSmaregiSetting(tenant)` — dùng lại (line 483 đã guard).

## Yêu cầu implement

### Sửa: `reponsitories/tokiwagi/src/utils/server/smaregiSync.ts`
- Import thêm `printReceiptForTransaction` từ `smaregi.service.ts` (line ~11).
- Trong `syncConfirmedTransactionsForPrepaidBookings()`, sau khi `tx.smaregiTransaction.create(...)` (line ~523) hoàn tất, thêm block:
  ```ts
  // AC1: auto-print receipt right after confirmed sale is registered.
  // AC4: DO NOT throw on print failure — the sale is already valid; log and continue so
  //      the checkout transaction still commits.
  try {
    await printReceiptForTransaction(tenant.smaregiContractId, result.transactionHeadId);
  } catch (error) {
    logger.warn(
      `[smaregi] receipt auto-print failed for booking ${bookingToUpdate.id} ` +
      `transaction ${result.transactionHeadId}: ` +
      `${((error as AxiosError)?.response?.data as { detail?: string })?.detail ?? (error as Error).message}`,
    );
  }
  ```
- KHÔNG thêm cột DB nào để track print status trong task này (SPEC Out of Scope). Nếu cần audit lưu vào `smaregiTransaction.rawPayload` là đủ cho phase 1.

### KHÔNG sửa
- `createSmaregiConfirmedTransaction()` — giữ nguyên contract "throws on failure".
- Signature của `syncConfirmedTransactionsForPrepaidBookings()` — caller `scan.ts:693` không cần đổi.
- Rollback path `cancelConfirmedTransactionForBooking` — không phải scope task này.

## Unit Tests (bắt buộc)
Test file: `reponsitories/tokiwagi/src/utils/server/smaregiSync.test.ts` (append hoặc tạo mới)
- Cover các case:
  - **AC1 happy path:** confirmed sale tạo thành công → `printReceiptForTransaction` được gọi với đúng `contractId` và `transactionHeadId`.
  - **AC4 print lỗi:** mock `printReceiptForTransaction` throw → `syncConfirmedTransactionsForPrepaidBookings` KHÔNG throw; `tx.booking.update` + `tx.smaregiTransaction.create` vẫn được gọi; `logger.warn` được gọi 1 lần.
  - **AC5 tenant không bật:** `enabledTenantSmaregiSetting(tenant) === false` → throws `MISSING_SMAREGI_CONFIG_FOR_TENANT` (behavior cũ, không đổi) → `printReceiptForTransaction` KHÔNG được gọi.
  - **Nhiều requests:** print gọi đúng số lần (mỗi booking trong `requests`).
  - **Idempotency:** nếu `createSmaregiConfirmedTransaction` return null (đã tạo trước) → `continue` giữ nguyên, print KHÔNG được gọi.
- Mock: `printReceiptForTransaction`, `createSmaregiConfirmedTransaction`, Prisma `tx`.

## Non-Regression Table
| Tính năng hiện có | File liên quan | Cách verify |
|---|---|---|
| Checkout POS tạo 確定販売 cho prepaid | `smaregiSync.ts::syncConfirmedTransactionsForPrepaidBookings`, `scan.ts:693` | Existing test / manual: checkout prepaid booking → row mới trong `smaregi_transactions` với `source=PrepaidBooking`, `booking.smaregiConfirmedTransactionHeadId` set. Không đổi. |
| Checkout DB transaction rollback trigger cancel Smaregi | `smaregiSync.ts::cancelConfirmedTransactionForBooking`, caller trong `scan.ts` | Manual: force DB error sau confirmed sale → confirmed transaction được cancel trên Smaregi. Print failure KHÔNG được trigger rollback (AC4). |
| Booking không prepaid vẫn qua 仮販売 bình thường | `scan.ts:705-715` (block `createSmaregiTemporaryTransaction`) | Manual: checkout booking thường → 仮販売 vẫn tạo, không có print gọi. |
| Tenant không bật Smaregi | `smaregiSync.ts:483`, `useSmaregiEnabled.ts` | Manual: tenant tắt Smaregi → checkout không call Smaregi API nào. |

## Không được làm
- Không đổi behavior của `createSmaregiConfirmedTransaction` (giữ throw-on-failure).
- Không đổi contract của `syncConfirmedTransactionsForPrepaidBookings` (caller `scan.ts` không đụng).
- Không thêm DB column (SPEC Out of Scope). Nếu cần persist print status, đó là follow-up task riêng.
- Không đụng luồng 仮販売 (`createSmaregiTemporaryTransaction`) — khác flow.

## Definition of Done
- [ ] Build/lint pass
- [ ] Unit test pass (5 cases ở trên)
- [ ] Manual test trên dev tenant: checkout prepaid booking → receipt in ra + log info; force API print lỗi (mock) → checkout vẫn thành công, có log warn.
- [ ] Non-Regression Table verify đủ

## Estimate
**S–M** (0.5–1 ngày dev + 0.5 ngày test).

## Assumptions blocked
- Task-0 confirm B khả thi.
- Task-1 đã merge (có `printReceiptForTransaction` để import).
- **Q7 (auto vs manual):** SPEC hiện assume "auto in ngay". Nếu Q7 chốt "chỉ in khi staff bấm" → task này bị hủy, chuyển sang task-3+task-4.
