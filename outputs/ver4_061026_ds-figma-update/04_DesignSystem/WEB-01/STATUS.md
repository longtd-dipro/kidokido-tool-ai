# Design System — KidoKido — WEB-01 (Admin site 管理画面)

- Trạng thái: DRAFT
- Artifact: https://claude.ai/artifact/L6VfhzcbZmpfo1wfpYoD2E (ai có link đều xem được; ver1 publish 02/10/2026, ver4 cập nhật 06/10/2026)
- Nguồn: Figma TOKIWAGI-PJ file `jjyE9GhFfRZ5VDZU8HFIPv` — node 2562:361522 (S6.6 商品編集), 2100:360305 (S5.1 自動返信メール), 1830:364257 (S7.1 ユーザー一覧), 1672:209122 (A2.4 順番待ち), 16190:446812 (バーコード読み取り_管理者向け) · website WEB-01 (https://dhxkf93d45vp4.cloudfront.net/admin — 29 màn /admin crawl read-only bằng test_super_admin EV-0669–EV-0697, cộng crawl vai trò test_admin_tenant / test_admin_poss / test_smaregi_v1 EV-0582–EV-0667) · codebase REPO-01 (`src/styles/_variables.scss`, `_admin-base.scss`, `dashboard.module.scss`, `booking-queue.module.scss`, `components/common/AdminLayout/*`, `ConfirmationDialog`, `ConfirmationSignOut`, `Notification`) · đối chiếu pixel trên screenshot
- Ghi chú: Hệ thống có 2 website khác phong cách — DS riêng: WEB-02 (`../WEB-02/`). Trang `/booking/*`, `/vacancy-status`, `/terms-of-use`, `/privacy-policy`, `/commercial-law`, `/price-list`, `/tenant-list` (EV-0698…EV-0708) lọt vào crawl WEB-01 nhưng thuộc giao diện người dùng → không lấy giá trị từ các trang này.

## Platform

| Platform | Theme (`data-theme`) | Viewport | Khung màn | Screen prefix |
|---|---|---|---|---|
| Web desktop (WEB-01 Admin) | `light` | 1440 × 900 (`viewport-web`) | sidebar `sidebar-width` 265px · không có header trên cùng · main lề 32/32/32/20px | `SC-001`…`SC-045` (Site = WEB-01) |

## Thứ tự ưu tiên nguồn (khi mâu thuẫn)
1. Màu / size đo trên website đang chạy (computed style + pixel screenshot) · code SCSS/TSX
2. Variable / style trong Figma library (không có Figma cho WEB-01)
3. Tài liệu guideline (không có)

## Thiếu (TBD)

| D# | Token / component | Ghi chú |
|---|---|---|
| D1 | primary-hover | Không quan sát được trên website (crawl read-only, không hover); SCSS không định nghĩa hover cho `.MuiButton-contained` — cần designer xác nhận |
| D1 | primary-active | Không quan sát được trạng thái nhấn (read-only); SCSS không định nghĩa |
| D2 | divider-high | Không có viền hover cho input (input bỏ viền `.MuiOutlinedInput-notchedOutline { border: none }`) — không quan sát được |
| D2 | overlay-scrim | Lớp phủ sau Dialog là mặc định MUI, không có trong CSS và không mở modal khi crawl read-only |
| D3 | info-100 | Không thấy trên các màn đã quét |
| D3 | info-700 | Không thấy trên các màn đã quét |
| D3 | focus-ring | Hệ thống tắt viền / bóng focus của input (`:focus { box-shadow: none }`); focus bàn phím không quan sát được (read-only) |
| D5 | shadow-stick | Không có header / thanh dính |
| D5 | shadow-float | Menu thả xuống của Select chưa mở khi crawl read-only (bóng mặc định MUI, không có trong CSS) |
| D5 | shadow-focus | Như `focus-ring` |
| D6 | Checkbox | Không thấy checkbox trên các màn Admin đã quét (「チェックボックス」 ở SC-013 là ô text); crawl vai trò thu được icon MUI `CheckBox` nhưng chưa xác định màn |
| D6 | Badge | Admin không có badge; trạng thái hiển thị bằng chữ thường trong ô bảng |
| D6 | AppHeader | Không có header ở viewport desktop 1440px (xem `header-height`) |

## Mâu thuẫn cần xác nhận

> Các mục #14–#20 do ver4 (đối chiếu Figma ↔ website). **Quy ước do user chốt: khi mâu thuẫn chọn website**; phần chỉ có trong Figma được thêm vào, ghi nguồn.


| # | Nội dung | Quyết định tạm |
|---|---|---|
| 1 | Tách 1 DS / website do dữ liệu quyết định: WEB-01 ≠ WEB-02 về card radius (10px vs 12px), chiều cao input (34.13 vs 56), padding input, thang radius, thang chữ (`dsLayout` mode per-site) | Tạm tách 2 DS; designer xác nhận (gộp: chạy lại extract `--force-mode themes`) |
| 2 | Script khởi tạo gán `primary` = #0068b7 (màu nút đặc trên trang người dùng / logo). Trên Admin, nút chính là gradient #5aa7f2 → #006dc6 và nút outlined #006dc6 (`$ad-blue-color`) | `primary` = #006dc6; #0068b7 chuyển thành `brand-blue` (fill của admin-logo.svg) |
| 3 | SCSS `$primary-color` = #11065e và `$secondary-color` #17c1ce không xuất hiện trên website Admin | Không đưa vào DS (biến dư của source) |
| 4 | Gradient mục sidebar đang chọn trong source là `linear-gradient(270deg, #68B5FF 0%, #1A7DCE 100%)`; #1A7DCE không có trong dữ liệu màu quan sát (pixel đo được ≈ #1C7FCF) | **Đã giải quyết ở ver4:** Figma node 1672:209123 xác nhận #1A7DCE → thêm token `nav-active-dark`; bundle dùng đúng gradient. |
| 5 | Hai màu xanh song song: `primary` #006dc6 (Admin) và `mui-primary` #1976d2 (mặc định MUI cho Switch, tab segmented SC-008, spinner, nút 「追加」) | Giữ cả hai như hệ thống đang chạy |
| 6 | Script gán `overlay-scrim` = #0000003b — thực tế là viền outlined của nút phân trang MUI (rgba(0,0,0,0.23)) | Đổi tên thành `divider-outline`; `overlay-scrim` để TBD |
| 7 | Script gán `negative-500` = #ffebeb và `header-height` = 216px, `content-max` = 150px — các giá trị này lấy từ trang người dùng (EV-0703 vacancy-status) hoặc nhiễu | Bỏ; `header-height` để TBD |
| 8 | Script gán `radius-lg` = 4px; Admin dùng 10px cho card / nút / modal (`.ad-section-container`, `.MuiButton-root`) và 4px cho ô phân trang | `radius-lg` = 10px, `radius-sm` = 4px |
| 9 | Script gán `shadow-flat` = bóng card | Bóng card = `shadow-raise`; `shadow-flat` = none (ô nhập) |
| 10 | Disabled có 2 kiểu trong SCSS: `.ad-disable-button-bg` (#d9dde1) và `.ad-disable-button` (nền #f5f5f5, chữ / viền #b4b2b7); input khoá nền #d9d9d9 | `surface-disabled` = #d9dde1; README ghi cả hai kiểu |
| 11 | `modal-width` 607px, `shadow-popout` (Toast) và component Modal / Toast lấy từ source, chưa quan sát trên website | Giữ, ghi nguồn trong usage; designer xác nhận |
| 12 | `nav-item-height` đo 58px trên EV-0669 (padding 16px × 2 + icon 24px = 56px theo source; ảnh Next.js legacy làm cao thêm) | Lấy giá trị đo 58px |
| 13 | Nút cỡ lớn có 2 độ đậm: 「検索する」「リセット」 700 (SC-004, SC-028, SC-040) và 「保存する」 500 (mặc định `.MuiButton-root`) | Giữ cả hai trong README / `Button` |
| 14 | Ô nhập: Figma có viền 1px (`field-border`, `field-border-form`), nền khoá `control-disabled`; mục sidebar bo 12 (`radius-nav`); website: ô nhập không viền, mục sidebar bo 8 | **Chọn website** — component mặc định theo website; token Figma giữ để đối chiếu / opt-in `kka-input--bordered` |
| 15 | `shadow-button`: Figma 1 3 4; website 0 2 2 | **Chọn website** |
| 16 | `table-row-height` Figma 50 / website 52; `nav-item-height` Figma 56 / website 58 | **Chọn website** |
| 17 | Tabs segmented: Figma viền `primary`, bo 20, nút chọn gradient; website `mui-primary` #1976d2, bo 10, nền đặc | **Chọn website**; token `radius-segment`, `segment-height` giữ để đối chiếu |
| 18 | Phân trang: Figma ô bo 2, thanh trắng `shadow-pager`, Roboto; website ô số trang bo 4 | **Chọn website** |
| 19 | Màn バーコード読み取り (ScanCard 2 chế độ, InlineMessage 3 tông), dải thống kê, chip trạng thái, thanh 開催/〆切 chỉ có trong Figma, website chưa quan sát | Thêm vào DS (không mâu thuẫn); nguồn Figma ghi trong `usage` |
| 20 | Toast: Figma rộng 400 / chữ 16; website (source) rộng 360 / chữ 14 | **Chọn website**; icon + nút đóng lấy từ Figma (website chưa thu được) |

## Changelog

| Ngày | Thay đổi |
|---|---|
| 2026-10-02 | Khởi tạo từ extract-design-tokens.py (40 trang) — DRAFT |
| 2026-10-02 | Agent hoàn thiện: kiểm vai trò token theo screenshot + SCSS (đổi `primary`, `radius-lg`, `shadow-*`, `overlay-scrim`…), gán / xoá toàn bộ `obs-*`, viết usage; README brand book; 16 component (bundle.js / bundle.css / index.d.ts); assets 2 logo + 61 icon; cover; design-system.json — DRAFT, chờ designer duyệt |
| 2026-10-06 | ver4 `ds-figma-update`: đối chiếu 5 node Figma Admin (TOKIWAGI-PJ). +43 thay đổi token (màu trạng thái success/warning/negative, `nav-active-dark`, `field-border*`, `stat-*`, `accent-orange`, radius nav/segment/scan, shadow button/pager/stat, size row/nav/toast/segment/scan, 4 style chữ Noto/Roboto); sửa component Tabs / Table / Pagination / SideNav / TextField / Toast / Breadcrumb; thêm 4 component `StatusChip`, `StatTile`, `InlineMessage`, `ScanCard` — DRAFT |
