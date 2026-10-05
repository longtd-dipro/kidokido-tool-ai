Thông báo Snackbar + Alert MUI ở góc trên phải: nền `surface`, bo `radius-lg`, bóng `shadow-popout`, tiêu đề theo loại 「成功」/「エラー」/「警告」 + nội dung; tự ẩn sau 6 giây.

- **Consumer cung cấp**: `type` (`success` | `error` | `warning`), tuỳ chọn `title`, `message`.
- Icon của từng loại là ảnh SVG riêng của hệ thống (chưa thu được) — preview chỉ hiện chữ.
- Dùng sau khi lưu / xoá / lỗi API; không dùng cho lỗi validate field (lỗi field nằm dưới ô).
