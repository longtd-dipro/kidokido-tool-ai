Nút của site: 2 kiểu (solid nền `primary` chữ `on-primary` · outline nền `surface` viền 1px `primary` chữ `primary-text`) × 2 cỡ (md cao `control-md` 64px, chữ 20px/28px/700, bo `radius-button` 40px, padding 10px 25px · sm cao `control-sm` 38px, chữ 16px/20px/700, bo `radius-pill` 100px, padding 8px 24px); cả hai đổ bóng `shadow-button`.

- **Consumer cung cấp**: `children` (nhãn tiếng Nhật), `variant`, `size`, `onClick`, tuỳ chọn `trailingIcon` (vd. vòng tròn mũi tên ở CTA trang chủ), `disabled`, `width`.
- Solid md cho hành động chính của màn: 「ログイン」「次へ」「戻る」「今から利用する」. Mỗi màn 1 nút solid md ở cuối form, căn giữa.
- Outline md cho hành động phụ: 「前回と同じ内容で入力する」. Outline sm cho 「店舗詳細・事前予約をする」「お気に入り登録」「キャンセル」.
- Solid sm cho nút trong card cửa hàng: 「当日利用」.
- Disabled: nền `surface`, chữ + viền `text-low`, bỏ bóng (tương phản 2.92:1 — giá trị gốc của hệ thống).
- Nút đăng nhập bằng LINE / email có màu thương hiệu riêng của bên thứ ba, không thuộc component này.
