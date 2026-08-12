# Flow 6 — Check-in tại cơ sở

Luồng vận hành tại cơ sở: quét mã vạch, check-in/check-out, tích hợp POS Smaregi và rollback khi quét nhầm.

```mermaid
flowchart LR
    A([Khách đến cơ sở]) --> B[Xuất mã vạch booking\ntrên điện thoại]
    B --> C[Nhân viên mở máy quét\n/admin/barcode-scanner]
    C --> D[Quét mã vạch\n/api/admin/bookings/scan]
    D --> E{Booking\nhợp lệ?}
    E -- Không hợp lệ --> F[Thông báo lỗi\nyêu cầu kiểm tra]
    E -- Hợp lệ --> DUP{Đã quét gần đây?\nrecent check-ins}
    DUP -- Có --> CONF[ConfirmDuplicateDialog\nyêu cầu xác nhận lại]
    CONF -- Hủy --> C
    CONF -- Xác nhận --> G
    DUP -- Không --> G{Smaregi\nbật?}
    G -- Có --> H[Tạo Smaregi transaction\ntaxInclude + realistic deviceId\nprepaid + playground category]
    H --> I[Khách quét tại POS\nTính tiền thanh toán POS]
    G -- Không --> J[Check-in trực tiếp\n/api/pos/bookings/check-in\nghi nhận firstCheckinAt]
    I --> J
    J --> K([Khách vào cơ sở])
    K --> L[Sử dụng xong → Check-out\n/api/pos/bookings/check-out\nghi nhận firstCheckoutAt + stayDuration]
    L --> M{Quét nhầm?}
    M -- Có --> N[Rollback\n/api/admin/bookings/rollback-scan]
    N --> C
    M -- Không --> O([Hoàn tất])
```

## Ghi chú tính năng mới (2026-08)

- **ConfirmDuplicateDialog (KIDOKIDO-2095):** khi quét lại mã vạch đã check-in trong khoảng thời gian gần, dialog yêu cầu nhân viên xác nhận trước khi tiếp tục để tránh scan trùng.
- **Gray-out vé tháng/năm (KIDOKIDO-2098):** từ lần scan thứ 2 trở đi trong ngày, entry vé tháng / vé năm hiển thị mờ (gray) để phân biệt với scan mới.
- **Booking history mở rộng (KIDOKIDO-2085):** booking detail/history hiển thị `firstCheckinAt`, `firstCheckoutAt`, và `stayDuration` — hỗ trợ Admin xem thời gian lưu lại đầu tiên (không bị recheck-in ghi đè).
- **Smaregi transaction cải tiến (KIDOKIDO-2092, 2104, 2106):**
  - `taxInclude` áp dụng cho prepaid transaction (đảm bảo giá đã bao gồm thuế).
  - Sử dụng `deviceId` thật của terminal thay vì `terminalId` tạm.
  - Tự động chọn playground category mặc định cho mỗi transaction.
  - Recheck-in nhiều vé offline tính đúng tổng tiền (fix bug tính sai).
- **Timeout transaction tăng (KIDOKIDO-2082):** tránh crash khi fetch booking-by-user lớn ở giờ cao điểm.
