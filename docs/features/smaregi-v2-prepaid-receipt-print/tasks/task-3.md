# Task 3 — API endpoint reprint receipt cho staff (admin)

> **BLOCKED bởi task-1.** Cần `printReceiptForTransaction()` có trong service layer.  
> **BLOCKED bởi Q1, Q3** (chờ clarify — assumption default nêu bên dưới).

## Mục tiêu
Tạo API cho staff/admin chủ động gọi in lại receipt cho 1 booking prepaid đã có `smaregiConfirmedTransactionHeadId`. Thỏa AC2, AC3, AC5.

## Context (đọc trước khi code)
- SPEC.md: AC2 (in lại), AC3 (ẩn khi chưa có `smaregiConfirmedTransactionHeadId`), AC5 (tenant không bật V2).
- File tham khảo pattern API admin booking:
  - `reponsitories/tokiwagi/src/pages/api/admin/bookings/[id]/status.ts` (permission, next-connect middleware)
  - `reponsitories/tokiwagi/src/pages/api/admin/bookings/scan.ts` (cách check `enabledTenantSmaregiSetting`)
- Model `Booking` — các field liên quan (đọc bằng `tilth_search Booking smaregiConfirmedTransactionHeadId` khi cần):
  - `smaregiConfirmedTransactionHeadId: string | null`
  - `smaregiConfirmedTransactionAt: Date | null`
  - `smaregiConfirmedTransactionCancelledAt: Date | null`
  - `tenantId`
- Blast radius: file mới (`reprint-receipt.ts`) — không dependents cũ. Callers: chỉ UI ở task-4.

## Yêu cầu implement

### Tạo mới: `reponsitories/tokiwagi/src/pages/api/admin/bookings/[id]/reprint-receipt.ts`
- Method: `POST` (idempotency không quan trọng vì mỗi lần in ra 1 receipt vật lý — POST đúng semantic).
- Middleware: admin auth (dùng lại pattern `status.ts` — check session, staff role).
- Handler:
  ```
  1. Parse `id` từ query, load booking (kèm tenant).
  2. Guard: booking tồn tại → 404 nếu không.
  3. Guard AC5: tenant.smaregiAllowedVersion === "v2" và enabledTenantSmaregiSetting(tenant) → 403 nếu không.
  4. Guard AC3: booking.smaregiConfirmedTransactionHeadId != null → 400 "NO_CONFIRMED_TRANSACTION" nếu null.
  5. Guard Q3 (default assumption — DỄ nới lỏng sau): nếu booking.smaregiConfirmedTransactionCancelledAt != null → 400 "TRANSACTION_ALREADY_CANCELLED".
     — Nếu Q3 chốt "vẫn in được sau cancel", xóa guard này.
  6. Try: gọi printReceiptForTransaction(tenant.smaregiContractId, booking.smaregiConfirmedTransactionHeadId).
     - Success → log info (bookingId, transactionHeadId, staffId, timestamp) → return 200 { status: 'ok' }.
     - Error → log warn + return 502 { error: 'PRINT_API_FAILED', detail: <smaregi detail> }.
  ```

### KHÔNG cần migration DB
- SPEC Out of Scope: không thêm bảng/cột. Audit trail dùng logger (đủ cho phase 1).
- Nếu sau này cần bảng `smaregi_receipt_prints`, tách task riêng.

## Unit Tests (bắt buộc)
Test file: `reponsitories/tokiwagi/src/pages/api/admin/bookings/[id]/reprint-receipt.test.ts`
- Cover AC:
  - **AC2 happy:** booking hợp lệ + service success → 200; `printReceiptForTransaction` gọi đúng args.
  - **AC3:** `smaregiConfirmedTransactionHeadId = null` → 400 "NO_CONFIRMED_TRANSACTION"; service KHÔNG được gọi.
  - **AC5:** tenant `smaregiAllowedVersion != v2` → 403; service KHÔNG được gọi.
  - **Q3 default:** `smaregiConfirmedTransactionCancelledAt != null` → 400 "TRANSACTION_ALREADY_CANCELLED".
  - **Booking not found:** id lạ → 404.
  - **Unauthorized:** không có session staff → 401/403 (theo middleware pattern).
  - **Service throw:** mock `printReceiptForTransaction` throw AxiosError → 502 với detail.
- Mock: Prisma `booking.findUnique`, `printReceiptForTransaction`, session/auth middleware.

## Non-Regression Table
| Tính năng hiện có | File liên quan | Cách verify |
|---|---|---|
| Admin update booking status (POS payment amount) | `src/pages/api/admin/bookings/[id]/status.ts` | Không đụng file này. Test cũ pass. |
| Admin cancel booking | `src/pages/api/admin/bookings/cancel/[id].ts` | Không đụng. |
| Auth middleware chung cho admin bookings | Middleware dùng lại | Không sửa middleware, chỉ apply. |

## Không được làm
- Không expose endpoint này cho user (my-page). Route phải nằm dưới `/api/admin/`.
- Không sửa `booking.smaregiConfirmedTransactionHeadId` từ API này (chỉ đọc).
- Không viết UI (task-4 làm).
- Không thay đổi behavior của print service (đó là task-1).

## Definition of Done
- [ ] Build/lint pass
- [ ] Unit test pass đủ 7 cases
- [ ] Manual test qua Postman/curl với admin session cookie
- [ ] Non-Regression Table verify đủ

## Estimate
**S–M** (0.5–1 ngày dev + test).

## Assumptions blocked
- Task-1 merged.
- **Q1:** Vị trí trigger nút in — task này chỉ làm API, không phụ thuộc Q1. UI (task-4) mới phụ thuộc.
- **Q3:** In lại sau khi cancel/refund — default guard "chặn". Nếu Q3 chốt cho phép → xóa 1 dòng guard trước merge.
- **Q7:** Nếu Q7 chốt "in tự động là đủ, không cần nút manual" → có thể hủy task-3 và task-4. Nhưng đa số case business cần cả 2 (in auto + fallback manual), giữ nguyên là an toàn.
