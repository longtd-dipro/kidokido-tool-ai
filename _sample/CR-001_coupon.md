# CR-001 — Thêm mã giảm giá (coupon) khi đặt hàng

Người yêu cầu: PM phía khách hàng

1. Thêm ô nhập "Mã giảm giá" trên màn đơn hàng (màn Danh sách đơn / chi tiết đơn).
2. Tạo bảng mới `coupons` (code, discount_type, discount_value, valid_from, valid_to, usage_limit).
3. Bảng `orders` thêm cột `coupon_id` (FK → coupons.id).
4. Kiểm tra mã giảm giá qua dịch vụ coupon bên ngoài (External Coupon Service API) trước khi áp dụng.
5. Hiển thị badge "Đã áp dụng coupon" trên đơn đã dùng mã.
