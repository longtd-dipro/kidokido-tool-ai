# Design System — KidoKido — WEB-01 (Admin site 管理画面)

- Trạng thái: DRAFT
- Artifact: https://claude.ai/artifact/L6VfhzcbZmpfo1wfpYoD2E (private, publish 02/10/2026 — 63 asset)
- Nguồn: website WEB-01 (https://dhxkf93d45vp4.cloudfront.net/admin — 29 màn /admin crawl read-only bằng test_super_admin EV-0669–EV-0697, cộng crawl vai trò test_admin_tenant / test_admin_poss / test_smaregi_v1 EV-0582–EV-0667) · codebase REPO-01 (`src/styles/_variables.scss`, `_admin-base.scss`, `dashboard.module.scss`, `booking-queue.module.scss`, `components/common/AdminLayout/*`, `ConfirmationDialog`, `ConfirmationSignOut`, `Notification`) · đối chiếu pixel trên screenshot
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
| D3 | success-100 | Admin không có badge / inline message thành công; icon Toast success là ảnh SVG chưa thu được |
| D3 | success-700 | Như trên |
| D3 | info-100 | Không thấy trên các màn đã quét |
| D3 | info-700 | Không thấy trên các màn đã quét |
| D3 | warning-100 | Không thấy trên màn đã quét; SCSS có cặp `$ad-orange-color` / `$ad-orange-color-2`, `$ad-yellow-color` / `$ad-yellow-color-2` nhưng không tìm thấy chỗ dùng → không gán |
| D3 | warning-800 | Như trên |
| D3 | negative-100 | Không thấy nền lỗi; `$ad-pink-color-2` #ffd4d5 không tìm thấy chỗ dùng |
| D3 | negative-500 | Không thấy nút xoá nền đỏ trên Admin (xoá là icon button + Modal) |
| D3 | focus-ring | Hệ thống tắt viền / bóng focus của input (`:focus { box-shadow: none }`); focus bàn phím không quan sát được (read-only) |
| D5 | shadow-stick | Không có header / thanh dính |
| D5 | shadow-float | Menu thả xuống của Select chưa mở khi crawl read-only (bóng mặc định MUI, không có trong CSS) |
| D5 | shadow-focus | Như `focus-ring` |
| D7 | header-height | Ở 1440px không có app header; header tablet (`h-[80px]`, `mdup:hidden`) chỉ hiện dưới 1440px — chưa quan sát |
| D6 | Checkbox | Không thấy checkbox trên các màn Admin đã quét (「チェックボックス」 ở SC-013 là ô text); crawl vai trò thu được icon MUI `CheckBox` nhưng chưa xác định màn |
| D6 | Badge | Admin không có badge; trạng thái hiển thị bằng chữ thường trong ô bảng |
| D6 | InlineMessage | Không thấy khối thông báo inline; lỗi field là chữ đỏ `.ad-text-error` dưới ô |
| D6 | AppHeader | Không có header ở viewport desktop 1440px (xem `header-height`) |

## Mâu thuẫn cần xác nhận

| # | Nội dung | Quyết định tạm |
|---|---|---|
| 1 | Tách 1 DS / website do dữ liệu quyết định: WEB-01 ≠ WEB-02 về card radius (10px vs 12px), chiều cao input (34.13 vs 56), padding input, thang radius, thang chữ (`dsLayout` mode per-site) | Tạm tách 2 DS; designer xác nhận (gộp: chạy lại extract `--force-mode themes`) |
| 2 | Script khởi tạo gán `primary` = #0068b7 (màu nút đặc trên trang người dùng / logo). Trên Admin, nút chính là gradient #5aa7f2 → #006dc6 và nút outlined #006dc6 (`$ad-blue-color`) | `primary` = #006dc6; #0068b7 chuyển thành `brand-blue` (fill của admin-logo.svg) |
| 3 | SCSS `$primary-color` = #11065e và `$secondary-color` #17c1ce không xuất hiện trên website Admin | Không đưa vào DS (biến dư của source) |
| 4 | Gradient mục sidebar đang chọn trong source là `linear-gradient(270deg, #68B5FF 0%, #1A7DCE 100%)`; #1A7DCE không có trong dữ liệu màu quan sát (pixel đo được ≈ #1C7FCF) | Chỉ giữ `nav-active-light` #68b5ff; preview / bundle dùng `primary` làm điểm cuối gradient (gần đúng) — designer xác nhận có thêm token cho #1A7DCE không |
| 5 | Hai màu xanh song song: `primary` #006dc6 (Admin) và `mui-primary` #1976d2 (mặc định MUI cho Switch, tab segmented SC-008, spinner, nút 「追加」) | Giữ cả hai như hệ thống đang chạy |
| 6 | Script gán `overlay-scrim` = #0000003b — thực tế là viền outlined của nút phân trang MUI (rgba(0,0,0,0.23)) | Đổi tên thành `divider-outline`; `overlay-scrim` để TBD |
| 7 | Script gán `negative-500` = #ffebeb và `header-height` = 216px, `content-max` = 150px — các giá trị này lấy từ trang người dùng (EV-0703 vacancy-status) hoặc nhiễu | Bỏ; `header-height` để TBD |
| 8 | Script gán `radius-lg` = 4px; Admin dùng 10px cho card / nút / modal (`.ad-section-container`, `.MuiButton-root`) và 4px cho ô phân trang | `radius-lg` = 10px, `radius-sm` = 4px |
| 9 | Script gán `shadow-flat` = bóng card | Bóng card = `shadow-raise`; `shadow-flat` = none (ô nhập) |
| 10 | Disabled có 2 kiểu trong SCSS: `.ad-disable-button-bg` (#d9dde1) và `.ad-disable-button` (nền #f5f5f5, chữ / viền #b4b2b7); input khoá nền #d9d9d9 | `surface-disabled` = #d9dde1; README ghi cả hai kiểu |
| 11 | `modal-width` 607px, `shadow-popout` (Toast) và component Modal / Toast lấy từ source, chưa quan sát trên website | Giữ, ghi nguồn trong usage; designer xác nhận |
| 12 | `nav-item-height` đo 58px trên EV-0669 (padding 16px × 2 + icon 24px = 56px theo source; ảnh Next.js legacy làm cao thêm) | Lấy giá trị đo 58px |
| 13 | Nút cỡ lớn có 2 độ đậm: 「検索する」「リセット」 700 (SC-004, SC-028, SC-040) và 「保存する」 500 (mặc định `.MuiButton-root`) | Giữ cả hai trong README / `Button` |

## Changelog

| Ngày | Thay đổi |
|---|---|
| 2026-10-02 | Khởi tạo từ extract-design-tokens.py (40 trang) — DRAFT |
| 2026-10-02 | Agent hoàn thiện: kiểm vai trò token theo screenshot + SCSS (đổi `primary`, `radius-lg`, `shadow-*`, `overlay-scrim`…), gán / xoá toàn bộ `obs-*`, viết usage; README brand book; 16 component (bundle.js / bundle.css / index.d.ts); assets 2 logo + 61 icon; cover; design-system.json — DRAFT, chờ designer duyệt |
