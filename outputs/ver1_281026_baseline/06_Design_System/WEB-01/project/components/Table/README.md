Bảng MUI DataGrid: header cao `table-header-height` 54px nền `surface-subtle`, chữ `text-16-bold` màu `text-table-header`, vạch ngăn cột; hàng cao `table-row-height` 52px, chữ `text-16-light` `text-middle`, kẻ `divider-low` (Figma vẽ hàng 50, kẻ 0.5px `divider-middle`, vạch cột 2×20 — chọn website); khung `surface` bo `radius-lg` + `shadow-raise`.

- **Consumer cung cấp**: `columns` (`key`, `title`, `numeric`), `rows`; cột 「アクション」 đứng đầu chứa icon button xem / sửa (`icon-default`, disabled `icon-disabled`).
- Cột đầu tiên luôn là 「アクション」, tiếp theo 「No」; cột số / mã căn phải với `tabular-nums`.
- Bảng rộng hơn khung → cuộn ngang (thanh cuộn `divider-middle`), không xuống dòng ô (chữ dài cắt bằng …).
- Phía dưới bảng luôn có `Pagination`.
