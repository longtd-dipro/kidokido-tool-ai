Hộp xác nhận MUI Dialog: rộng tối đa `modal-width` 607px, nền `surface`, bo `radius-lg`, nội dung căn giữa (icon trên, tiêu đề `heading-20-bold`, câu hỏi), 2 nút 145×48 (`modal-button-width`): outlined 「キャンセル」 trái + contained phải.

- **Consumer cung cấp**: `title`, `message`, `okLabel`, `cancelLabel`, `onAccept`, `onDismiss`.
- Xoá: tiêu đề mặc định 「Confirmation」, nút 「キャンセル」 + 「削除する」, icon thùng rác đỏ.
- Đăng xuất: 「ログアウトしますか？」, nút 「キャンセル」 + 「Ok」 (125×44), khung viền cam và icon cảnh báo vàng.
- Lớp phủ sau modal: chưa có token (mặc định MUI), preview không vẽ lớp phủ.
