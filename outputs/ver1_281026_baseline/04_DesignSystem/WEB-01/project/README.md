Design system của **Admin site (管理画面)** hệ thống KidoKido — trang quản trị 「ボーネルンドあそび場予約・購入サイト」 dựng bằng MUI 5 + Tailwind, mô tả đúng giao diện đang chạy. Một bộ component phục vụ mọi vai trò quản trị (Super Admin, Admin Tenant, Admin POSS, Admin Smaregi); vai trò chỉ đổi danh mục menu, không đổi màu.

## 1 portal = 1 theme

Chỉ có 1 theme `light` (`data-theme="light"`); không có dark mode.

| `data-theme` | Portal | Người dùng | `primary` | Nguồn |
| --- | --- | --- | --- | --- |
| `light` | Admin site 管理画面 | Super Admin, Admin Tenant, Admin POSS, Admin Smaregi | `#006DC6` xanh đậm | website + SCSS admin |

- Dùng token vai trò, không dùng mã màu: `primary` cho nút chính (điểm cuối gradient), viền nút outlined; `primary-text` cho chữ nút outlined và tab chưa chọn; `primary-subtle` cho trang / option đang chọn; `on-primary` cho chữ trên nút contained.
- Hệ thống trộn 2 màu xanh: `primary` (#006DC6, của Admin) và `mui-primary` (#1976D2, mặc định MUI cho Switch, tab segmented, spinner). Giữ đúng chỗ đang dùng, không gộp.
- Chữ trắng trên phần sáng của gradient (`primary-gradient-top`, `nav-active-light`) không đạt 4.5:1 — đây là thiết kế gốc, giữ nguyên.

## Màu

- Nền ứng dụng và sidebar `page-bg` (#F4FAFF). Mọi nội dung nằm trong card `surface` trắng. Header bảng dùng `surface-subtle` (#E9FAFF).
- Ô nhập, Select, date picker cũng nền `page-bg` (không viền) — kể cả khi đặt trong card trắng (website). Figma vẽ thêm viền 1px `field-border` / `field-border-form` và nền khoá `control-disabled` — chỉ dùng khi designer xác nhận (STATUS Mâu thuẫn #14). Riêng ô nhập barcode: `field-reader-bg` + `field-reader-border`.
- Chữ: `text-high` (đen) cho tiêu đề trang, tiêu đề card, breadcrumb; `text-middle` cho giá trị input và ô bảng; `text-label` cho nhãn field; `text-table-header` cho chữ header bảng; `text-low` cho nhãn menu sidebar chưa chọn; `neutral-600` cho 「全て N 件」 và mục breadcrumb hiện tại.
- Đường kẻ: `divider-low` giữa các hàng bảng; `divider-middle` cho khung section của form đăng ký dài; `divider-outline` cho nút phân trang dạng outlined.
- Đỏ `negative-600` dành cho nhãn 「[必須]」, lỗi dưới field và mục 「ログアウト」. Không dùng đỏ cho nền.
- Màu nhấn riêng: `highlight` cho dải ngày trên màn 空き状況, `action-add-bg` cho dòng 「追加」, `control-checked` cho radio đã chọn.
- `brand-blue` và `brand-yellow` chỉ nằm trong logo.
- Trạng thái trong bảng: chip `StatusChip` viền `accent-orange` (「順番待ち中」, Figma 1672:209264); các trạng thái còn lại (「入場中」「設定済み」「事前予約可能」「当日利用のみ」) vẫn là chữ thường.
- Thông báo kết quả quét dùng `InlineMessage` 3 tông: `success-*` (チェックイン完了), `warning-*` (チェックアウト完了), `negative-*` (エラー) — chỉ có trong Figma (node 16190:447040…).
- Dải thống kê SC-008: 4 ô icon `stat-purple` / `stat-green` / `stat-magenta` / `stat-amber`, chữ `text-stat-label` / `text-stat-value`.
- Gradient mục sidebar đang chọn: `nav-active-light` → `nav-active-dark` (hết thiếu #1A7DCE). Thanh 「開催 / 〆切」 trong form 商品編集: nền `surface-subtle` + viền `schedule-bar-border`; dòng 「予約枠を追加」: `action-add-bg` (Figma viền `primary`).

## Chữ

- Font hệ thống Nhật: **ヒラギノ角ゴ Pro W3 / Hiragino Kaku Gothic Pro** → メイリオ / Meiryo → Helvetica / Arial (`families.sans`); không tải web font. Không có font mono.
- Tiêu đề trang: `heading-20-semibold` (20/28, 600) — 1 / màn, kèm breadcrumb `caption-14`. Figma dùng màu `text-table-header` + Roboto cho phân trang (`caption-14-roboto`) — website giữ `text-high`; nhãn số liệu dùng Noto Sans JP (`stat-16-medium`).
- Tiêu đề card form đơn: `heading-20-bold`; tiêu đề section của form đăng ký dài: `heading-30-bold`; tiêu đề khung đăng nhập: `heading-18-bold`.
- Nhãn field: `label-14` (form tìm kiếm) hoặc `label-14-bold` (form đăng ký). Helper: `text-12`.
- Ô bảng và giá trị input: `text-16-light` (16/20, 300). Header bảng và nhãn nút đậm: `text-16-bold`. Nút thường: `text-16-medium`. Câu hướng dẫn: `text-16`.
- Ngày viết 「2026/10/02」 hoặc 「2026年10月02日」, placeholder 「yyyy/mm/dd」; giờ 「18:30」; đếm bản ghi 「全て 293 件」, 「10 / ページ」. Cột số / mã căn phải, `font-variant-numeric: tabular-nums`.

## Khoảng cách, bố cục

- Hệ thống không theo lưới 4px chặt: các bước dùng nhiều là `space-8`, `space-16`, `space-20`, `space-25`, `space-32`, `space-40`; ô nhập dùng `space-12.5` / `space-15` để cao 48px.
- Khung màn (`viewport-web` 1440px): sidebar cố định `sidebar-width` 265px bên trái; vùng main lề trái `space-20`, trên / phải / dưới `space-32`; không có header trên cùng.
- Main = `PageHeader` (tiêu đề + breadcrumb, cách nội dung `space-32`) rồi các card `surface` + `shadow-raise`, cách nhau 24–40px.
- Form tìm kiếm: lưới 3 cột trong card, mỗi field = nhãn + ô `control-md`; hàng nút căn giữa bên dưới.
- Form đăng ký dài: nhãn trái cố định, ô phải; nhóm field bọc trong khung `divider-middle` có tiêu đề `heading-30-bold`.
- Bảng: header `table-header-height` 54, hàng `table-row-height` 52; phân trang căn phải dưới card bảng. Khối tiêu đề trang (Figma) cao `header-height` 99, padding trái 30, trên 24.
- Màn quét バーコード読み取り: `ScanCard` rộng `scan-card-width` 646 đặt giữa vùng main; 2 nút 「入場・退場・決済」/「入場取り消し・退場取り消し」 nằm ngay trên thẻ, cách `space-32`.

## Mẫu màn hình CRUD

- 一覧 (SC-004 予約管理, SC-025 売上管理, SC-028 従業員管理, SC-040 ユーザー管理): card tìm kiếm (「リセット」「検索する」「CSVファイル出力」 cỡ lg) → card `Table` với cột 「アクション」 đầu (icon xem / sửa) → `Pagination`. Màn có thêm mới đặt nút contained 「新規登録」/「新規商品追加」/「新しいお知らせ追加」 phía trên phải bảng (SC-017, SC-021, SC-035).
- 新規登録 / 編集 (SC-032, SC-036, SC-041): 1 card chứa các khung section; cuối card 2 nút căn giữa 「キャンセル」 (outlined) + 「登録する」/「保存する」/「次へ」 (contained). Màn nhiều bước (SC-036) có stepper số tròn 「1」 + tiêu đề bước 「商品の基本設定」.
- Cài đặt đơn (SC-010, SC-011, SC-013, SC-045): 1 card căn giữa, tiêu đề `heading-20-bold`, cặp nút 「リセット」/「キャンセル」 + 「保存する」.
- Xoá: `Modal` 「Confirmation」 với 「キャンセル」 + 「削除する」. Đăng xuất: `Modal` 「ログアウトしますか？」 với 「キャンセル」 + 「Ok」.
- Sau khi lưu / xoá / gửi thông báo: `Toast` góc trên phải rộng 360 (「成功」+ 「ユーザーに通知を送りました」 — Figma 1672:209928 vẽ rộng 400; 「エラー」 / 「警告」).

## Viền, bo góc, đổ bóng

- `radius-lg` (10px) cho nút, card, bảng, modal, toast; `radius-md` (8px) cho ô nhập, Select, mục con sidebar; `radius-nav` (12px) và `radius-segment` (20px) chỉ có trong Figma (website dùng 8 / 10); `radius-scan` / `radius-scan-control` cho thẻ quét; `radius-sm` cho ô số trang; `radius-xs` cho ô 「10 / ページ」; `radius-pill` cho date picker dashboard; `radius-xl` cho card biểu đồ dashboard; `radius-circle` cho icon button.
- Bóng: card `shadow-raise`; nút `shadow-button` (website 0 2 2; Figma 1 3 4); thanh phân trang Figma `shadow-pager`; ô icon số liệu `shadow-stat-icon`; ô nhập `shadow-flat`; toast `shadow-popout`; card biểu đồ dashboard `shadow-md`.
- Không có vòng focus hiển thị: ô nhập bỏ viền và bỏ bóng khi focus. Không tự thêm focus ring khi chưa có quyết định của designer.

## Trạng thái tương tác

- Nút contained: gradient `primary-gradient-top` → `primary`, chữ `on-primary`. Nút outlined: nền `surface`, viền `primary`, chữ `primary-text`. Màu hover / nhấn riêng của nút chưa được định nghĩa — không tự đặt.
- Disabled: nút nền `surface-disabled` (hoặc `surface-menu`) với chữ + viền `text-placeholder`; icon button `icon-disabled`; ô nhập bị khoá nền `divider-middle`.
- Mục sidebar: hover và đang chọn cùng nền gradient `nav-active-light` → `nav-active-dark`, chữ `on-nav-active`; menu cha đang mở nền `nav-open-bg`.
- Loading: spinner tròn `mui-primary` ở giữa vùng main.
- Không có quyền: hành động bị ẩn hoặc icon chuyển `icon-disabled` (vd. nút sửa / 「返金」 mờ trong bảng 予約管理); menu không có quyền không hiển thị.

## Nội dung và giọng văn

- Toàn bộ nhãn UI bằng tiếng Nhật, kiểu danh từ ngắn cho menu (「施設管理」「予約管理」「売上管理」) và động từ 「〜する」 cho nút (「検索する」「保存する」「登録する」).
- Field bắt buộc: thêm 「[必須]」 đỏ sau nhãn.
- Câu hướng dẫn rỗng: 「日付を選択してください」「日付と店舗を選択してください」.
- Xác nhận: 「ログアウトしますか？」; xoá: 「Confirmation」 / 「Are you sure to delete this item ?」 (tiếng Anh, giữ nguyên văn).
- Toast: tiêu đề 「成功」「エラー」「警告」.
- Thuật ngữ thống nhất: 施設 (cơ sở), 商品 (vé / sản phẩm), 予約 (đặt chỗ). Không dùng emoji.

## Icon

- Icon thao tác là **MUI Material** filled / outlined, 24px trong bảng và ô nhập, 20px trong nút và phân trang, màu `icon-default`; vẽ bằng component `Icon` (`currentColor`).
- Icon menu sidebar là bộ SVG nét 1.5px riêng (nhóm asset **Icons**, cặp `-active` / `-inactive`), 24px, cách nhãn `space-16`.
- Icon button đứng một mình phải có `aria-label` (hệ thống dùng 「details」「update」「delete」「Choose date」).

## Logo

- Logo **BørneLund** + 「ボーネルンド あそび場 / 受付 / 事前購入サイト」 (nhóm asset **Logos**, SVG) dùng `brand-blue` và `brand-yellow`.
- Đặt đầu sidebar, căn giữa, rộng 134px; trên màn đăng nhập / quên mật khẩu đặt giữa card, rộng 244px.
- Chỉ đặt trên `page-bg` hoặc `surface`. Không đổi màu, không kéo giãn, không đặt lên nền `primary`.

## Màn nghiệp vụ

| Mục đích | Component |
| --- | --- |
| Dashboard thống kê (SC-001 ダッシュボード) | `Card` (bo `radius-xl`, `shadow-md`) + `TextField` pill 「開始期間」「終了期間」 + `Select` 「店舗名」 + biểu đồ |
| Hàng đợi (SC-008 順番待ち管理) | `Tabs` 「呼び出し中リスト」「順番待ち中リスト」「キャンセルリスト」 + dải `StatTile` ×4 + `Button` 「予約枠数変更」 + `Table` có cột `StatusChip` + `Pagination` |
| Quét mã (バーコード読み取り) | `ScanCard` + `InlineMessage` (チェックイン完了 / チェックアウト完了 / エラー) |
| Tình trạng chỗ (SC-044 空き状況) | `Card` 「当日利用」/「事前予約」 với dải ngày `highlight`, ký hiệu ○ (một phần còn chỗ) / × (hết chỗ) |
| Mail tự động (SC-014 自動返信メール設定) | `Table` có cột `Switch` 「送信のON/OFF」 |
| Miễn trừ (SC-013 免責事項設定) | Khối lặp có nút thêm / bớt dòng + `Button` variant `add` 「追加」 |
| Tin tức (SC-022 お知らせの設定) | `TextField` + khung soạn thảo rich text viền `text-label` |
