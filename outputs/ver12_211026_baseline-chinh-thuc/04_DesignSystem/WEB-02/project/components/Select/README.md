Ô chọn (MUI Select): cao `field-height` 56px, nền `primary-subtle`, bo `radius-md` 8px, chữ 16px/24px/300, icon `arrow-drop-down` 24px màu `icon-default` bên phải.

- **Consumer cung cấp**: `label`, `required`, `placeholder` (「選択してください」), `value`, `error`, `outlined`.
- Biến thể `outlined` (Figma 14487:210812 — 「商品選択」, 「12歳」 trong khung `primary-subtle`): nền `surface`, viền 0.5px `field-border-dark`, bo `radius-field`, cao `control-sm`, chữ 16/20.
- Dùng cho 都道府県, 「ご利用店舗」, 「商品選択」. Danh sách mở ra trên nền `surface`, bóng `shadow-float`, bo `radius-field`; mục hover nền `primary-subtle`.
- Chọn cửa hàng ở đầu màn 当日利用 / 料金プラン dùng `SearchBar` (kind `select`), không dùng component này.
