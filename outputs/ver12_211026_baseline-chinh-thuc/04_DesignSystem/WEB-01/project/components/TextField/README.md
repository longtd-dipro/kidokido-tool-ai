Ô nhập MUI outlined đã bỏ viền: nền `page-bg`, bo `radius-md` 8px, cao `control-md` 48px (padding 12.5px 15px), chữ 16/20 nhẹ (300); nhãn `label-14` màu `text-label` phía trên; biến thể pill cao `control-sm` bo `radius-pill` cho date picker dashboard.

- **Consumer cung cấp**: `label`, `required` (thêm 「[必須]」 màu `negative-600`), `value` hoặc `placeholder`, tuỳ chọn `endIcon` (`clock` cho giờ, lịch cho ngày), `helper`, `error`, `pill`, `disabled`.
- Placeholder ngày luôn là 「yyyy/mm/dd」; giờ dạng 「18:30」.
- Không có viền và không có vòng focus (`shadow-flat`): giữ đúng như hệ thống, đừng thêm viền.
- Lỗi hiển thị chữ `negative-600` 16px dưới ô (class nguồn `.ad-text-error`).
- Disabled (ô bị khoá): nền `divider-middle`.
- Form đăng ký dài (SC-032) dùng nhãn đậm `label-14-bold`.
