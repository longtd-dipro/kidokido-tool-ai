Thông báo Snackbar + Alert MUI ở góc trên phải: rộng `toast-width` 360, nền `surface`, bo `radius-lg`, bóng `shadow-popout`, tiêu đề theo loại 「成功」/「エラー」/「警告」; tự ẩn sau 6 giây. Bố cục [icon 24] [tiêu đề + nội dung] [nút đóng 24] lấy từ Figma node 1672:209928 (Figma rộng 400, chữ 16/20 — chọn website 360 / 14).

- **Consumer cung cấp**: `type` (`success` | `error` | `warning`), tuỳ chọn `title`, `message`.
- Icon của từng loại: Figma có `ep-success` (xanh lá) và `ep-close`; preview dùng icon MUI tương đương. Icon `error` / `warning` chưa có trong Figma.
- Dùng sau khi lưu / xoá / lỗi API; không dùng cho lỗi validate field (lỗi field nằm dưới ô).
