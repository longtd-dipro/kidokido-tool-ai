# Flow 7 — Hủy vé & Hoàn tiền

Luồng khách hủy đặt vé, hoàn tiền qua GMO, và thanh toán bổ sung (partial checkout).

```mermaid
flowchart LR
    A([Khách muốn hủy]) --> B[Vào lịch sử đặt vé\n/user/my-page/booking-history]
    B --> C[Chọn booking cần hủy]
    C --> D{Trong thời hạn\ncho phép hủy?}
    D -- Không --> E[Thông báo không thể hủy]
    D -- Có --> F[Xác nhận hủy\ncancel bookings API]
    F --> G[Cập nhật status\n→ cancelled]
    G --> H{Đã thanh toán\nonline?}
    H -- Không --> I([Hủy hoàn tất\nkhông hoàn tiền])
    H -- Có --> J[Hoàn tiền qua GMO\ngmo.service refund]
    J --> K[Thông báo hoàn tiền]
    K --> L([Hủy + hoàn tiền hoàn tất])

    A --> M{Cần thanh toán\nbổ sung?}
    M -- Có --> N[Partial Checkout\n/booking-history/partial-checkout/id]
    N --> O[Thanh toán bổ sung\npartial-checkout API]
    O --> P([Thanh toán bổ sung hoàn tất])
```

## Ghi chú tính năng mới (2026-08)

- **Booking history mở rộng (KIDOKIDO-2085):** trang lịch sử đặt vé và chi tiết booking hiển thị thêm `firstCheckinAt`, `firstCheckoutAt`, và `stayDuration` — Admin xem được thời gian lưu lại đầu tiên của khách kể cả khi có recheck-in/recheck-out sau đó (migration `20260807000000_add_first_checkout_at_to_bookings`).
- **Fix crash fetch bookings (KIDOKIDO-2082):** trước đây API fetch bookings by user có thể crash khi dữ liệu lớn — đã fix + tăng timeout transaction để trang lịch sử load ổn định hơn.
- **Recheck-in offline multi-tickets đúng số tiền (KIDOKIDO-2104):** khi recheck-in nhiều vé offline cùng lúc, tổng tiền được tính lại chính xác (fix bug cộng dồn sai).

