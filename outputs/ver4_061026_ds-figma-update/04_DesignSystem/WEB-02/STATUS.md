# Design System — KidoKido — 予約・購入サイト (WEB-02)

- Trạng thái: DRAFT
- Artifact: https://claude.ai/artifact/QubGWoAQ3dLzTbNSQxG9i3 (ai có link đều xem được; ver1 publish 02/10/2026, ver4 cập nhật 06/10/2026)
- Nguồn: Figma TOKIWAGI-PJ file `jjyE9GhFfRZ5VDZU8HFIPv` — node 14487:209252 (1.2 TOP PAGE đã đăng nhập), 16816:177854 (U9.1 マンスリーパス購入 + 3 trạng thái 回数券当日予約) · website WEB-02 (https://dhxkf93d45vp4.cloudfront.net, 45 màn × 2 role: test_user EV-0537–EV-0581 + anonymous EV-0492–EV-0536, viewport 1440 × 900) · codebase REPO-01 `inputs/tokiwagi` (src/styles/_user-base.scss, _variables.scss, tailwind.config.js, MUI theme src/pages/_app.tsx) — chỉ đọc
- Ghi chú: Hệ thống có 2 website khác phong cách — DS riêng: WEB-01 (`../WEB-01/`).

## Platform

| Platform | Theme (`data-theme`) | Viewport | Khung màn | Screen prefix |
|---|---|---|---|---|
| Web desktop (WEB-02 予約・購入サイト) | `light` | 1440 × 900 (`viewport-web`) | header `header-height` 216px (top bar 64 + nav band 152) · sidebar マイページ (chỉ màn /user/my-page/*) | SC-046 … SC-093 |

## Thứ tự ưu tiên nguồn (khi mâu thuẫn)
1. Màu / size đo trên website đang chạy (computed style) · code
2. Variable / style trong Figma library (không có Figma input)
3. Tài liệu guideline (không có)

## Thiếu (TBD)

| D# | Token / component | Ghi chú |
|---|---|---|
| D1 | primary-50…900 | Source không khai thang màu primary (chỉ `$blue-color` #0068b7, `$blue-dark-color` #167bd1 không thấy dùng trên website) — không bịa thang |
| D1 | primary-hover | Crawl read-only không hover; `_user-base.scss` không khai hover cho nút user — cần designer xác nhận |
| D1 | primary-active | Crawl read-only không nhấn; source không khai — cần designer xác nhận |
| D1 | brand-* | Logo BørneLund là ảnh raster (next/image) không thu được file; màu logo chưa đo trên WEB-02 |
| D2 | neutral-50…900 | Source không có thang neutral; giá trị xám rời rạc đã gán vai trò (`text-low`, `divider-*`) |
| D2 | divider-high | Viền khi hover — crawl read-only không quan sát được |
| D3 | success-50 / success-100 / success-500 / success-700 | Site không có màu success; △ xanh lá ở legend chưa đo được (vẽ SVG/ký tự, crawl không thu màu) |
| D3 | info-50 / info-100 / info-500 / info-700 | Không thấy thông báo / badge tone info trên các màn đã quét (giá trị script gán info-700 = `primary`, đã bỏ vì trùng primary) |
| D3 | warning-50 / warning-100 / warning-400 / warning-800 | Không thấy tone warning trên các màn đã quét |
| D3 | negative-50 / negative-100 | Không thấy nền lỗi (alert box) — lỗi chỉ hiển thị bằng chữ + viền `negative-600` |
| D3 | focus-ring | Source tắt focus ring (`--tw-ring-shadow: none; box-shadow: none` trong `.user [type=…]:focus`); không có giá trị |
| D5 | radius-xs | Không có bậc nhỏ hơn 4px trên WEB-02 |
| D5 | shadow-stick | Header không sticky / không có bóng trên các màn đã quét |
| D5 | shadow-focus | Source tắt focus ring — không có giá trị |
| D7 | sidebar-width / tabbar-height | Sidebar マイページ không đo được bằng computed style (crawl không gắn role nav cho sidebar); screenshot ~315px ở 1425px — cần đo lại; site không có tab bar |
| D7 | table-header-height | Site không có `<table>` (lịch 販売状況 dựng bằng div) |
| D7 | table-row-height | Site không có `<table>` |
| D7 | modal-width | Không mở được dialog khi crawl read-only; source chỉ có `width:100%` cho `.MuiDialog-paper` (maxWidth false) |
| D6 | Switch | Không thấy trên các màn đã quét |
| D6 | Tabs | Không thấy trên các màn đã quét |
| D6 | Table | Không có `<table>`; lịch 販売状況 là lưới div — mô tả trong README mục Màu / Mẫu màn |
| D6 | Modal | Không quan sát được (read-only, không thao tác xoá / huỷ); source có style `.MuiDialog-paper` (viền 1px #9ae9ff, bo 10px, `shadow-popout`) và lớp phủ `overlay-scrim` — cần designer xác nhận trước khi dựng component |
| D6 | Toast | Không quan sát được; source có `components/common/Notification` và BasicDesign ghi lỗi 500 hiển thị Toast — style chưa đo |
| D6 | InlineMessage | Không thấy hộp thông báo; lỗi chỉ là chữ `negative-600` dưới field |
| — | Logo (assets/Logos) | 4 file "logo" thu được: 3 SVG placeholder rỗng của next/image (logo-cc19a752, logo-59e8121d, logo-c76e8117 — bỏ) + 1 icon cửa sổ mới (logo-295cfcff → `assets/Icons/NewWindow.svg`). Logo thật là raster — cần file gốc từ KH |

## Mâu thuẫn cần xác nhận

| # | Nội dung | Quyết định tạm |
|---|---|---|
| 1 | Tách 1 DS / website do dữ liệu quyết định (dsLayout per-site): WEB-01 ≠ WEB-02 ở type-scale (Jaccard 0.43), radius-scale (0.46), card radius 10 vs 12px, input cao 34 vs 56px, padding input, màu link #676767 vs #0068b7 | Tạm tách; designer xác nhận (gộp: `--force-mode themes`) |
| 2 | Script gán `negative-500` = #ffebeb; đối chiếu screenshot EV-0569/EV-0579: đây là nền ô Chủ nhật trong lịch 販売状況, không phải màu lỗi | Đổi tên thành `calendar-holiday-bg`; `negative-500` / `negative-600` = #dc0404 (`$red-color` _user-base.scss) |
| 3 | Script gán `shadow-flat` = bóng Tailwind shadow-lg của card trang chủ (có đổ bóng) | Đổi tên `shadow-raise`; `shadow-flat` = none |
| 4 | Script gán `control-sm` = 23px (ô input bên trong MUI) và `control-md` = 64px | `control-sm` = 38px (nút pill vừa), `control-md` = 64px (nút chính), thêm `field-height` 56px cho TextField / Select |
| 5 | Script gán `text-low` = #4b5563, nhưng giá trị này chỉ xuất hiện ở /error, /maintenance; placeholder / chữ mờ thực tế là #979797 (`$text-color-placeholder`) | `text-low` = #979797; #4b5563 → `text-system-page` |
| 6 | `_variables.scss` (chung) khai `$primary-color` #11065e, `$red-color` #ef4444, `$submit-color` #505050 — website WEB-02 dùng `_user-base.scss` (`$blue-color` #0068b7, `$red-color` #dc0404) | Theo website + `_user-base.scss`; các biến `_variables.scss` / `_admin-base.scss` không thấy trên WEB-02 → bỏ khỏi DS này |
| 7 | Màu chữ ô lịch / spinner / icon ♡ là #1976d2 (MUI default primary) khác `primary` #0068b7 của site — MUI theme (`_app.tsx`) không override palette | Giữ nguyên thành `accent-blue`; designer quyết có thống nhất về `primary` không |
| 8 | Checkbox: signup đo được #2563eb (@tailwindcss/forms) trong khi icon CheckBox MUI có trên trang anonymous | Giữ `checkbox-checked` #2563eb; component vẽ bằng icon `checkbox` tô màu đó |
| 9 | Radio label: source `.usr-radio-checkbox` khai 18px / lineHeight 20px; website đo 18px / 24px | Theo website (24px) |
| 10 | Một số kích thước chỉ đo từ screenshot (không có computed style): kẻ dưới `PageHeader` mypage 2px, padding Badge, logo cao ~85px | Ghi rõ trong component; cần đo lại khi có Figma / quyền DevTools |
| 11 | Font Hiragino Kaku Gothic Pro là font hệ thống macOS, không có file trong repo, không có trên Google Fonts — preview trên Windows / Linux sẽ rơi về メイリオ / Arial | Giữ đúng stack của site; `type.fonts` = [] |
| 12 | Khung 「商品選択」: Figma `primary-subtle` #f3faff (hoặc `panel-bg-alt` #e2f2fc + `panel-inner-bg` #f7fbff khi đã có vé); website `primary-tint` #dbf0ff | **Chọn website** (`primary-tint`); token Figma giữ |
| 13 | SearchBar: Figma ô phải không viền, nhãn 24/32, màn mua vé ô phải nền `primary-subtle` bo 40; website viền 1px `divider-middle`, nhãn 20/28 | **Chọn website** |
| 14 | `shadow-button`: Figma 1 3 4; website 0 2 2 | **Chọn website** (`shadow-button-inline` = giá trị Figma) |
| 15 | Figma Navi có logo vector 5 mảnh; website render ảnh raster | Logo vẫn TBD |
| 16 | Nút 「完了！」 `accent-orange-soft` trông như disabled; Figma không có spec tương tác | Giữ nhãn "chưa kích hoạt"; PM xác nhận |

## Changelog

| Ngày | Thay đổi |
|---|---|
| 2026-10-02 | Khởi tạo từ extract-design-tokens.py (45 trang) — DRAFT |
| 2026-10-02 | Agent kiểm vai trò bằng screenshot + `_user-base.scss`: 35 token màu (gán / đổi tên 57 obs-color, bỏ màu chỉ có trong `_variables.scss` / `_admin-base.scss` và màu nhiễu), 16 type style (bỏ obs-type không xác định được nhãn), 20 spacing (bỏ giá trị lẻ của trang văn bản), 11 radius, 7 shadow (thêm `shadow-float`, `shadow-popout`, `overlay-scrim` từ source), 10 size; 15 component; 11 icon; README brand book; Cover |
| 2026-10-06 | ver4 `ds-figma-update`: đối chiếu 2 node Figma User (TOKIWAGI-PJ). +14 thay đổi token (`accent-orange-soft`, `field-border-dark`, `card-border-soft`, `field-bg-readonly`, `shadow-button` 1 3 4, size CTA / search / stepper / row / date-bar / summary-bar / footer, `heading-40`, `text-18-loose`, `legend-16`); component: SearchBar 2 biến thể, Select `outlined`, Button `hero` — DRAFT |
