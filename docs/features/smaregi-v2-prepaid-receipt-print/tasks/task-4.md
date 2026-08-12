# Task 4 — UI: nút "In lại receipt" trên màn admin

> **BLOCKED bởi task-3.** Cần API `POST /api/admin/bookings/:id/reprint-receipt` sẵn sàng.  
> **BLOCKED bởi Q1** (vị trí đặt nút). Nếu Q1 chưa chốt, task-4 KHÔNG được start.

## Mục tiêu
Thêm nút "領収書再発行" (In lại receipt) trên UI admin, chỉ hiển thị khi tenant bật Smaregi V2 và booking đã có `smaregiConfirmedTransactionHeadId`. Thỏa AC2 (UI), AC3 (ẩn khi chưa auto-register), AC5 (tenant chưa bật).

## Context (đọc trước khi code)
- SPEC.md: mục Screens ("[TBD Q1]" — đề xuất default màn `scan-management` hoặc admin booking-history).
- Vị trí ứng viên (BẮT BUỘC xác nhận Q1 trước khi chọn):
  - `reponsitories/tokiwagi/src/pages/admin/scan-management/index.tsx` (dashboard quét vé, real-time)
  - `reponsitories/tokiwagi/src/pages/admin/booking-history/*` (nếu có — cần dùng `tilth_files "src/pages/admin/booking-history/**"` để xác định)
  - Modal chi tiết booking đang có trong scan-management
- Feature gate hiện có: 
  - `reponsitories/tokiwagi/src/libs/hooks/useSmaregiEnabled.ts` (kiểm tra tenant version) — dùng để ẩn/hiện nút.
  - `reponsitools/tokiwagi/src/libs/hoc/withEnabledSmaregi.tsx` — dùng nếu wrap cả page.
- State management: `stack-conventions` skill → Redux Toolkit v2 + TanStack Query v5 (chọn TanStack cho mutation này vì đây là action một chiều).

## Yêu cầu implement

### 1. TanStack Query mutation
Tạo/append vào file query hooks phù hợp (VD `reponsitories/tokiwagi/src/libs/queries/admin/bookings.ts` — cần kiểm tra path chính xác bằng `tilth_search useMutation admin booking`):
```ts
export const useReprintReceiptMutation = () =>
  useMutation({
    mutationFn: (bookingId: number) =>
      axios.post(`/api/admin/bookings/${bookingId}/reprint-receipt`),
    // onError: toast.error(...); onSuccess: toast.success('領収書の再発行を送信しました');
  });
```

### 2. UI component
Trong file đã chốt sau Q1 (VD `src/pages/admin/scan-management/index.tsx` hoặc component chi tiết booking):
- Thêm button "領収書再発行" (Reprint Receipt).
- Điều kiện hiển thị:
  ```tsx
  const isSmaregiEnabled = useSmaregiEnabled();  // AC5
  const canReprint =
    isSmaregiEnabled &&
    booking?.smaregiConfirmedTransactionHeadId !== null;  // AC3
  ```
  Nếu `!canReprint` → không render button (không dùng `disabled`, ẩn hẳn).
- Trạng thái loading: disable button + spinner khi `mutation.isPending`.
- Confirm dialog trước khi bấm (optional theo Q7 — nếu Q7 chốt "chỉ bấm khi cần" thì cần confirm; nếu "in luôn" thì bỏ confirm).

### 3. i18n (nếu app có setup)
- Text button + toast dùng key i18n JP (đây là feature cho staff Nhật). Path key ví dụ: `admin.bookings.reprintReceipt`, `admin.bookings.reprintReceiptSuccess`, `admin.bookings.reprintReceiptFailed`.
- Kiểm tra convention hiện tại qua `tilth_search t\\(.*admin` để xem hệ thống i18n.

## Unit Tests (bắt buộc)
Test file: đặt cùng thư mục component (theo convention Jest hiện có).
- Cover UI:
  - **AC3:** booking không có `smaregiConfirmedTransactionHeadId` → button không render.
  - **AC5:** `useSmaregiEnabled()` return false → button không render.
  - **AC2 happy:** click button → mutation trigger, gọi `POST /api/admin/bookings/:id/reprint-receipt` với đúng id; success → toast success.
  - **AC2 error:** API trả 502/400 → toast error với detail.
  - **Loading state:** trong khi pending, button disabled + spinner.
- Mock: `useSmaregiEnabled`, axios/mutation.

## Non-Regression Table
| Tính năng hiện có | File liên quan | Cách verify |
|---|---|---|
| Màn scan-management hiện tại (nếu chọn đặt nút ở đây) | `src/pages/admin/scan-management/index.tsx` | Manual: tất cả feature cũ (real-time scan, update status, batch status) vẫn hoạt động; nút mới chỉ thêm chứ không thay layout critical. |
| Feature gate Smaregi (HOC + hook) | `useSmaregiEnabled.ts`, `withEnabledSmaregi.tsx` | Không sửa, chỉ consume. |
| Các query hooks admin bookings hiện có | `libs/queries/admin/bookings.ts` (path xác nhận qua tilth) | Chỉ ADD hook mới; không sửa hook cũ; query key mới không đụng cache cũ. |

## Không được làm
- Không đặt nút trên user my-page.
- Không tự làm confirm dialog phức tạp nếu team chưa có component chung — dùng lại toast/modal component sẵn.
- Không thay đổi API endpoint (task-3 đã chốt).
- Không viết CSS mới nếu design system đã có button variant phù hợp.

## Definition of Done
- [ ] Build/lint pass
- [ ] Unit test pass 5 cases
- [ ] Manual test (dev):
  - Tenant V2 + booking prepaid đã checkout → thấy nút, bấm → thấy toast success, verify receipt in ra.
  - Tenant V2 + booking chưa checkout / không phải prepaid → không thấy nút.
  - Tenant không phải V2 → không thấy nút.
- [ ] Non-Regression verify đủ

## Estimate
**M** (1–1.5 ngày dev + test).

## Assumptions blocked
- Task-3 merged (API sẵn sàng).
- **Q1 CRITICAL:** vị trí nút chưa chốt — KHÔNG start task này khi Q1 chưa có câu trả lời từ khách hàng.
- **Q2:** loại chứng từ (レシート vs 領収書) — text button phụ thuộc Q2. Default: "領収書再発行" như trong yêu cầu gốc của khách.
- **Q7:** cần confirm dialog trước khi in? Default: không (giảm friction cho staff).
