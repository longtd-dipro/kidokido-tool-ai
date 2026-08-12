# Screen Flow — Index

> Toàn bộ ảnh chụp được sinh tự động bằng Playwright (`tools/crawl-admin.js` + `tools/crawl-user.js`).
> Mỗi role admin có folder + `flow.md` riêng, click vào để xem chi tiết + ảnh.

## Admin (theo role)

| Role | Account | Sections | Screens | Detail |
|---|---|---:|---:|---|
| `poss` | `nguyetntm+3@dipro.vn` | 9 | 11 | [flow.md](admin/poss/flow.md) |
| `smaregi-v1` | `nguyetntm+200@dipro.vn` | 9 | 11 | [flow.md](admin/smaregi-v1/flow.md) |
| `smaregi-v2` | `nguyetntm+300@dipro.vn` | 9 | 23 | [flow.md](admin/smaregi-v2/flow.md) |
| `super-admin` | `supper@example.com` | 14 | 38 | [flow.md](admin/super-admin/flow.md) |

## User site

- Screens: **19** — [flow.md](user/flow.md)

## SMAREGI_V2 coverage

- `barcode-scanner` + `scan-management` chỉ hiển thị khi tenant bật smaregi (xem `src/contexts/SmaregiEnabledContext.tsx:44-52`).
- Kết quả thực tế:
  - `super-admin` (supper@example.com) → thấy được cả 2 (sidebar Super Admin có `MENU_LIST_SUPER_ADMIN`, extra paths bypass gate).
  - `smaregi-v2` (nguyetntm+300) → thấy được cả 2 + `scan-management` có luồng detail/edit.
  - `smaregi-v1` (nguyetntm+200) → tenant cũng bật smaregi → thấy được cả 2.
  - `poss` (nguyetntm+3) → tenant KHÔNG bật smaregi → server trả `/403` cho cả 2 (xác nhận role gate hoạt động).
