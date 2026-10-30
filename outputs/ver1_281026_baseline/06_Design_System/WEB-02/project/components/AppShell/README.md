Khung màn: `AppHeader` + vùng nội dung nền `page-bg` (max-width `content-max` 896px, padding `space-40`) + footer (lưới link 4 cột 16px `text-high` có mũi tên `primary-text`, dải copyright 12px trên `surface-subtle`) + nút tròn 「トップ」 nền `primary` bo `radius-circle`.

- **Consumer cung cấp**: `children` (Breadcrumb + PageHeader + nội dung), `loggedIn`, tuỳ chọn `sideNav` (màn マイページ).
- Màn công khai: không sidebar, nội dung căn giữa. Màn マイページ: `SideNav` bên trái, nội dung bên phải.
