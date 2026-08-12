# SPEC: Smaregi V2 — In hóa đơn (receipt) cho giao dịch prepaid auto-register

> **Trạng thái:** Draft. Còn Open Questions chưa được khách hàng trả lời — SPEC này viết theo **Kịch bản B là default (giả định Smaregi Platform API hỗ trợ trigger in receipt trên transaction đã tạo)**. Nếu Q4/Q5 xác nhận Smaregi không hỗ trợ endpoint print, SPEC phải chỉnh sang Kịch bản A (đổi terminalId) hoặc Kịch bản C (tokiwagi tự in). Không được implement production trước khi chốt.

## Mô tả nghiệp vụ

Với Smaregi V2, khi khách chỉ thanh toán **các sản phẩm đã được thanh toán trước** (prepaid — Daily Online, Monthly/Yearly first-use, HourlyTimesLimit/DailyTimesLimit first-use), hệ thống hiện tự động đăng ký doanh thu lên Smaregi qua `POST /transactions` (確定販売) với payment method `【事前決済】`.

**Vấn đề:** Nhân viên **không có cách in receipt** cho giao dịch prepaid auto-register:
- Trên UI Smaregi POS 取引履歴: nút "In lại hóa đơn" bị ẩn với các giao dịch tạo qua API (nghi vấn do `terminalId = "999999999"` là giả — xem Open Question Q5).
- Trên app tokiwagi: hiện chỉ có ghi chú *"領収書は店頭にて発行いたします"* — không có UI in receipt.

**Mục tiêu:** Cho phép nhân viên **chủ động phát hành/in receipt** cho giao dịch prepaid auto-register, đồng nhất trải nghiệm với giao dịch bình thường (nơi 取引履歴 vẫn cho reprint).

## Actors & Preconditions

- **Actor:** Nhân viên cơ sở (POS operator) — sau khi checkout booking prepaid.
- **Precondition:**
  - Tenant đã bật Smaregi V2 (`tenant.smaregiAllowedVersion = v2`, có `smaregiContractId`, `smaregiStoreId`).
  - Booking đã được checkout thành công → `Booking.smaregiConfirmedTransactionHeadId` có giá trị (transaction 確定販売 đã tạo).
  - Máy in receipt vật lý đang được kết nối với terminal Smaregi.
  - **[TBD sau Q1]** Nhân viên có quyền truy cập màn hình phát hành receipt (admin? staff?).

## Happy Path (theo Kịch bản B — assumption)

1. Nhân viên checkout booking prepaid tại POS → hệ thống auto tạo 確定販売 trên Smaregi (như hiện tại — không đổi).
2. **[MỚI]** Sau khi tạo 確定販売 thành công, hệ thống tự động gọi Smaregi Platform API endpoint in receipt (giả định endpoint tồn tại — cần Q4 verify), truyền `transactionHeadId` vừa tạo.
3. Máy in gắn với terminal Smaregi in ra receipt.
4. **[MỚI]** Nếu cần in lại: nhân viên vào màn `admin/scan-management` (hoặc màn tương đương — chốt sau Q1), tìm booking prepaid, bấm nút "In lại receipt" → gọi lại API in.
5. Log ghi nhận: `bookingId`, `transactionHeadId`, `timestamp`, `staffId`, kết quả.

## Alternative Flows & Edge Cases

- **AF1 — Booking chưa auto-register:** Nút "In lại receipt" ẩn (chỉ hiện khi `smaregiConfirmedTransactionHeadId != null`).
- **AF2 — Booking đã bị cancel/refund:** Nút "In lại receipt" vẫn hiện? **[TBD Q3]** — thông thường receipt gốc vẫn phát hành được kể cả sau khi refund; tuỳ business rule.
- **EC1 — Smaregi API in receipt trả lỗi:**
  - Trường hợp in tự động (step 2): **không rollback** 確定販売 (doanh thu đã đăng ký hợp lệ) — chỉ log lỗi + hiển thị toast "In receipt thất bại, vui lòng in lại từ màn quản lý".
  - Trường hợp in lại (step 4): trả về error message cụ thể cho staff.
- **EC2 — Máy in vật lý mất kết nối:** Smaregi API có thể trả success (nhận yêu cầu) nhưng receipt không ra giấy. **[TBD]** — không detect được từ phía app, cần Q hardware.
- **EC3 — Nhiều booking cùng barcode (Monthly/Yearly parent/child):** Chỉ **PARENT booking** giữ `smaregiConfirmedTransactionHeadId` (theo `bookingToUpdate` logic trong `smaregiSync.ts`). Nút in receipt chỉ hiển thị trên parent — child booking không có nút.
- **EC4 — Tenant không bật Smaregi V2:** Toàn bộ tính năng ẩn (dùng lại `useSmaregiEnabled` hook + version check).

## Acceptance Criteria

```
[AC1 — Auto-in sau checkout prepaid]
Given: tenant bật Smaregi V2, booking prepaid đang được checkout
When: hệ thống tạo 確定販売 thành công (smaregiConfirmedTransactionHeadId được set)
Then: hệ thống gọi Smaregi API in receipt với transactionHeadId đó
And: log ghi lại {bookingId, transactionHeadId, printApiCalledAt, printApiStatus}

[AC2 — In lại từ UI admin]
Given: booking prepaid đã có smaregiConfirmedTransactionHeadId
When: staff bấm nút "In lại receipt" trên màn [TBD Q1]
Then: hệ thống gọi Smaregi API in receipt với transactionHeadId của booking
And: hiển thị toast "Đã gửi yêu cầu in" nếu API 2xx, hoặc toast lỗi cụ thể nếu API !=2xx
And: log ghi lại {bookingId, transactionHeadId, reprintedAt, staffId, apiStatus}

[AC3 — Ẩn nút khi chưa auto-register]
Given: booking prepaid nhưng smaregiConfirmedTransactionHeadId = null
Then: nút "In lại receipt" KHÔNG hiển thị

[AC4 — Không rollback nếu in lỗi trong flow auto]
Given: 確定販売 tạo thành công, nhưng API in receipt trả lỗi
Then: 確定販売 vẫn giữ (không cancel), booking.smaregiConfirmedTransactionHeadId vẫn set
And: log warning, không throw exception phá luồng checkout

[AC5 — Tenant chưa bật Smaregi V2]
Given: tenant.smaregiAllowedVersion != v2
Then: toàn bộ luồng in receipt ẩn (không call API, không hiển thị nút)
```

## Screens

**[TBD Q1 — vị trí nút "In lại receipt"]** Đề xuất mặc định (nếu khách chưa chỉ định):
- Thêm nút "領収書再発行" (In lại receipt) vào chi tiết booking trên màn admin `scan-management` hoặc `booking-history` (admin view), chỉ hiển thị khi có `smaregiConfirmedTransactionHeadId`.
- Không thêm vào user my-page (giữ nguyên chính sách "phát hành tại quầy").

## Out of Scope

- Không đổi format receipt (giữ template của Smaregi in ra).
- Không tự làm PDF/HTML receipt trong tokiwagi (đó là Kịch bản C, chỉ dùng khi B/A không khả thi — quyết định sau).
- Không sửa luồng in receipt cho giao dịch bình thường (仮販売 → thanh toán tại quầy) — đã hoạt động qua UI Smaregi.
- Không mở endpoint in receipt cho user cuối (my-page).
- Không thay đổi bảng DB (giả định Smaregi API in receipt là stateless call). **Nếu Q4 kết luận cần track state → phải revise Out of Scope.**

## Assumptions (BẮT BUỘC verify trước khi Dev implement)

- **A1 (critical):** Smaregi Platform API có endpoint/parameter trigger in receipt trên transaction đã tạo (VD: `POST /transactions/{id}/receipts` hoặc field `printReceiptFlag` trong body của `POST /transactions`).  
  → Nếu **KHÔNG có**: SPEC này vô hiệu, phải pivot sang Kịch bản A hoặc C.
- **A2:** `terminalId = "999999999"` không phải nguyên nhân duy nhất khiến nút reprint bị ẩn trên UI Smaregi — nghĩa là sửa terminalId một mình không giải quyết được vấn đề (nếu sửa được thì Kịch bản A rẻ hơn B).
- **A3:** Nút "In lại receipt" chỉ dành cho admin/staff, không phải user.

## Open Questions

- **Q1:** Vị trí nút "In lại receipt" mong muốn: (a) UI Smaregi POS 取引履歴, (b) admin tokiwagi, (c) cả hai? **[assumption hiện tại: (b)]**
- **Q2:** Loại chứng từ mong muốn: receipt (レシート) hay 領収書 (biên lai có tên)? **[assumption hiện tại: レシート]**
- **Q3:** In lại nhiều lần được không? Sau khi refund có in được không?
- **Q4 (CRITICAL):** Khách đã hỏi Smaregi lý do nút reprint bị ẩn với transaction API chưa? Smaregi Platform API có endpoint print receipt không? → Xem Assumption A1.
- **Q5:** `terminalId` của máy POS + máy in vật lý tại các cửa hàng hiện tại là gì? Có thể cấu hình per-tenant/per-store không?
- **Q6:** Nếu phải đổi từ `terminalId = "999999999"` sang terminalId thật, tenant chấp nhận thay đổi cả luồng 仮販売 không?
- **Q7:** Định nghĩa "chủ động in": auto in ngay tại thời điểm auto-register, hay chỉ hiện nút để staff bấm khi cần?

## References

- Semantic query đã chạy: `smaregi` (15 hits), `prepaid` (1 hit), `確定販売` (1 hit), `transaction` (15 hits), `--dependents src/services/smaregi/smaregi.const.ts` (2 hits).
- File chính liên quan:
  - `reponsitories/tokiwagi/src/services/smaregi/smaregi.service.ts` (`createTransaction`, `resolvePrepaidPaymentMethodId`)
  - `reponsitories/tokiwagi/src/services/smaregi/smaregi.const.ts` (`SMAREGI_API`, `SMAREGI_TEMPORARY_TERMINAL_ID`, `SMAREGI_PREPAID_PAYMENT_METHOD`)
  - `reponsitories/tokiwagi/src/services/smaregi/smaregi.types.ts` (`SmaregiConfirmedInput`)
  - `reponsitories/tokiwagi/src/utils/server/smaregiSync.ts` (`createSmaregiConfirmedTransaction`, `buildConfirmedPayload`)
  - `reponsitories/tokiwagi/src/libs/hooks/useSmaregiEnabled.ts` (feature gate)
- Yêu cầu gốc: khách hàng ngày 2026-08-04 — Smaregi V2 prepaid auto-register receipt printing.
