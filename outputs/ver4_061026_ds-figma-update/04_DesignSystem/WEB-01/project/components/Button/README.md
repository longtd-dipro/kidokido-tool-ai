Nút MUI của Admin: 2 kiểu chính (contained gradient `primary-gradient-top` → `primary`, outlined viền `primary`) + 1 kiểu thêm dòng `add` × 2 cỡ (md 200×48 `control-md` / lg 230×56 `control-lg`), bo `radius-lg` 10px, bóng `shadow-button`, chữ 16/20.

- **Consumer cung cấp**: `children` (nhãn tiếng Nhật), `variant`, `size`, `onClick`, tuỳ chọn `startIcon` / `endIcon` (vd. 「CSVファイル出力」 dùng `save-alt` bên phải, 「新規商品追加」 dùng `add-circle` bên trái), `disabled`.
- Mỗi vùng hành động có tối đa 1 nút contained (hành động chính: 「検索する」「保存する」「登録する」「次へ」); nút phụ đặt bên trái là outlined (「リセット」「キャンセル」).
- Vùng tìm kiếm của màn danh sách dùng cỡ lg, 3 nút cạnh nhau: 「リセット」 · 「検索する」 · 「CSVファイル出力」 (SC-004, SC-025).
- Form đơn (SC-010, SC-011, SC-045) dùng cỡ md, 2 nút căn giữa: outlined trái, contained phải.
- `add` chỉ dùng cho dòng 「追加」 kéo hết chiều ngang trong form lặp (SC-013).
- Disabled: nền `surface-disabled`, viền + chữ `text-placeholder`, không bóng. Hover / nhấn chưa có token riêng.
