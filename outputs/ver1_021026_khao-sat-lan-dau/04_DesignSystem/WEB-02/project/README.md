Design system của site 「ボーネルンド あそび場 受付 事前購入サイト」 (予約・購入サイト) trong hệ thống KidoKido — mô tả đúng giao diện đang chạy (AS-IS): Next.js + MUI + Tailwind, phong cách trắng – xanh `primary` – điểm vàng `accent-yellow`, chữ Hiragino Kaku Gothic. Một bộ component phục vụ một site cho người dùng cuối (khách và hội viên đã đăng nhập); site quản trị có design system riêng.

## 1 portal = 1 theme

Đặt `data-theme="light"` trên `<html>`. Site chỉ có một theme; mọi token màu là giá trị chung.

| `data-theme` | Portal | Người dùng | `primary` | Nguồn |
| --- | --- | --- | --- | --- |
| `light` | 予約・購入サイト | Khách chưa đăng nhập, hội viên | `#0068B7` xanh BørneLund | website đang chạy, trùng `$blue-color` |

- Dùng token vai trò, không dùng mã màu: `primary` cho nền nút chính, nhãn segment của SearchBar, trang hiện tại của phân trang; `primary-text` cho link, breadcrumb, tiêu đề phụ, nút outline; `primary-subtle` cho nền ô nhập; `on-primary` cho chữ trên nền `primary`.
- `primary-text` đạt 5.73:1 trên `surface` và 5.45:1 trên `surface-subtle`.

## Màu

- Nền trang `page-bg` (trắng). Card trang chủ, ô SearchBar, item phân trang dùng `surface`. Dải header (logo + nav), footer copyright và card cửa hàng dùng `surface-subtle` (#F4FAFF).
- Nền đặc thù theo khu vực: `surface-cream` cho section 2 card ở trang chủ; `sidebar-bg` cho sidebar マイページ; `surface-gray` cho thanh ngày phía trên danh sách sản phẩm và khối form アカウント情報; `primary-tint` cho khung 「商品選択」/「さらに商品を追加する」; `surface-disabled` cho card vé đã hết hạn.
- Chữ: `text-high` (#313131) cho tiêu đề, nội dung và nhãn — hệ thống không tách heading / body nên `text-middle` trỏ cùng giá trị. `text-black` cho tiêu đề trang マイページ và chữ sidebar. `text-low` (#979797) chỉ cho placeholder và chip trạng thái — 2.92:1 trên `surface`, dưới 4.5:1, đây là màu gốc của hệ thống; không dùng cho nội dung phải đọc.
- `text-field` cho giá trị đã nhập trong ô MUI, `text-dark` cho nhãn form ở アカウント情報の編集, `text-system-page` cho nội dung màn /error, /maintenance, `link-legal` cho link trong văn bản 「プライバシーポリシー」.
- Đường kẻ: `divider-low` cho khung văn bản điều khoản, `divider-middle` cho viền ô SearchBar và ô lịch.
- Lỗi: `negative-600` (#DC0404) cho 「[必須]」, câu lỗi dưới field và viền field lỗi 1.5px (`negative-500` cùng giá trị). Site không có màu success / info / warning riêng.
- `accent-yellow` chỉ để nhấn: gạch chân tiêu đề, nút 「新規利用登録」. Không dùng làm màu trạng thái.
- Lịch 販売状況: ô ngày thường `calendar-cell-bg`, ô Chủ nhật `calendar-holiday-bg`, ô thứ Bảy `primary-subtle`; chữ ngày `accent-blue` (4.44:1 / 4.02:1 — màu gốc, chữ 16px/500).
- Control: radio đã chọn `radio-checked` (1.48:1, luôn kèm nhãn), checkbox đã tick `checkbox-checked`, viền checkbox `checkbox-border`, icon MUI `icon-default` / `icon-muted`.

### Badge trạng thái vé

| Nhãn | Tone | Ghi chú |
| --- | --- | --- |
| 期限終了 | neutral (`divider-middle` + `text-low`) | Card vé đổi sang `surface-disabled` |
| 返金済み | neutral (`divider-middle` + `text-low`) | Card vé đổi sang `surface-disabled` |

### Ký hiệu tình trạng nhận khách / bán

| Ký hiệu | Nhãn | Màu |
| --- | --- | --- |
| ○ | 「すぐにご入場できます」 / 「販売中」 / 「空きあり」 | xanh (giá trị chưa đo) |
| △ | 「入場制限中。お待ちいただきます」 | xanh lá (giá trị chưa đo) |
| ✕ | 「完売」 / 「空きなし」 | đỏ (giá trị chưa đo) |

## Chữ

- Font: **ヒラギノ角ゴ Pro W3 / Hiragino Kaku Gothic Pro**, dự phòng メイリオ, Helvetica Neue, Arial (`font-sans`) cho mọi chữ. Không dùng font mono.
- Thang chữ theo px (không theo rem), các bậc dùng thật:
  - Tiêu đề trang công khai: `heading-32` (32/48/500) căn giữa, gạch chân vàng. Một cái mỗi màn.
  - Tiêu đề trang マイページ: `title-36` (36/54/500, `text-black`), kẻ dưới `primary`.
  - Tiêu đề khối 待ち時間/販売状況: `heading-24-semibold` màu `primary-text`. Nhãn CTA lớn trong card trang chủ: `heading-24-bold`.
  - Mục nav và nhãn nút chính: `heading-20-bold`. Nhãn nút pill vừa, tên site, 「STEP 01」: `heading-16-bold`.
  - Link top bar, chữ SearchBar: `text-20`. Nhãn radio: `text-18`.
  - Body, nhãn field, link footer: `text-16`. Nhấn mạnh trong body / thông báo rỗng: `text-16-bold`. Placeholder và giá trị ô nhập: `text-16-light`.
  - Ô ngày lịch: `text-16-medium`; chip ngày: `text-14`. Dòng chi tiết card vé: `text-14-light`. Số trang: `text-14-ui`. Chú thích 「※」 và legend trạng thái: `text-12`.
- Ngày hiển thị dạng 「2026年10月02日 (金)」 trên thanh ngày, 「10/05」 trong ô lịch, 「2025.06.18」 ở danh sách お知らせ. Số lượng kèm đơn vị: 「1枚」「0日」「7ヶ月」.

## Khoảng cách, bố cục

- Lưới không đều — giữ đúng giá trị hệ thống: `space-4`, `space-8`, `space-16`, `space-24`, `space-40` là các bước dùng nhiều; padding nút dùng `space-10` × `space-25`, ô nhập MUI dùng 16.5px × `space-14`.
- Khung màn (thiết kế ở `viewport-web` 1440px): `AppHeader` cao `header-height` 216px (top bar `topbar-height` 64px + dải nav `nav-band-height` 152px) · breadcrumb · `PageHeader` · nội dung căn giữa, rộng tối đa `content-max` 896px · footer link + copyright.
- Màn マイページ: `SideNav` nền `sidebar-bg` bên trái, nội dung bên phải với `PageHeader` kiểu `mypage`.
- Form: 1 cột rộng ~600px căn giữa; mỗi field = nhãn + 「[必須]」 + dòng 「※」 (nếu có) + ô `field-height` 56px; cặp field ngắn (姓 / 名) chia đôi hàng, cách nhau `space-16`. Nhóm field ngăn bằng kẻ chấm ngang và tiêu đề `heading-32`.
- Danh sách: card xếp dọc cách nhau `space-24`, `Pagination` căn giữa ở cuối.

## Mẫu màn hình

- Màn form mua / đặt (当日利用, フリーパス購入, 回数券購入): breadcrumb → `PageHeader` → `SearchBar` 「店舗選択」 → thanh ngày `surface-gray` + danh sách sản phẩm kẻ dòng → khung `primary-tint` chọn sản phẩm → nút solid md 「次へ」 căn giữa.
- Màn danh sách (店舗一覧): 2 `SearchBar` 「キーワードから探す」/「店舗から探す」 → `PageHeader` → card `tinted` mỗi cửa hàng (ảnh, tên, 「現在の受付状況」, nút sm 「当日利用」, nút outline sm 「店舗詳細・事前予約をする」) → `Pagination`.
- Màn マイページ (予約履歴, フリーパスの確認): `SideNav` + `PageHeader` kiểu `mypage` + section có tiêu đề gạch vàng 「ただいまの予約」「過去の予約」; rỗng hiển thị 「ご予約はございません」 bằng `text-16-bold`.
- Màn hoàn tất (仮登録を受付けました, パスワードを変更しました): `PageHeader` + 1 đoạn giải thích + nút solid md quay lại.

## Viền, bo góc, đổ bóng

- Bo góc theo vai trò: `radius-button` (40px) cho nút MUI md, `radius-pill` (100px) cho nút pill vừa / lớn, `radius-full` cho SearchBar, `radius-field` (10px) cho TextField và menu thả xuống, `radius-md` (8px) cho Select và ô lịch, `radius-lg` (12px) cho card trang chủ, `radius-sm` (4px) cho phân trang, `radius-checkbox` cho checkbox, `radius-circle` cho nút icon và nút 「トップ」, `radius-xl` cho dropdown 「店舗選択」 ở 料金プラン.
- Bóng: nút dùng `shadow-button` (nút inline ở アカウント情報 dùng `shadow-button-inline`); card trang chủ `shadow-raise`; card cửa hàng phẳng `shadow-flat`; menu thả xuống `shadow-float`; dialog `shadow-popout` trên lớp phủ `overlay-scrim`.
- Đặc trưng: gạch chân vàng 5px `accent-yellow` dưới mọi tiêu đề trang công khai; kẻ chấm dọc giữa các mục nav và kẻ chấm ngang ngăn các khối form.
- Ô nhập không có viền và không có focus ring (site tắt ring khi focus).

## Trạng thái tương tác

- Nút solid: nền `primary`, chữ `on-primary`, viền trắng 1px. Nút outline: nền `surface`, viền `primary`, chữ `primary-text`.
- Disabled: nền `surface`, chữ + viền `text-low`, bỏ bóng.
- Field lỗi: viền 1.5px `negative-600` + câu lỗi `negative-600` dưới ô.
- Mục menu thả xuống khi hover / focus: nền `primary-subtle`.
- Loading: spinner `circular-progress` màu `accent-blue` ở giữa vùng nội dung.
- Mục nav sidebar đang chọn: nền `surface`, chữ `primary-text`.
- Khách chưa đăng nhập vẫn thấy toàn bộ nav; top bar đổi sang 「新規利用登録」 + 「ログイン」.

## Nội dung và giọng văn

- Nhãn UI bằng tiếng Nhật, lịch sự (です・ます / ください), danh từ ngắn trên nút: 「ログイン」「次へ」「戻る」「キャンセル」「今から利用する」.
- Hướng dẫn: 「ご希望のログイン方法を選択してください。」「店舗を選択してください」. Ghi chú bắt đầu bằng 「※」: 「※手続き完了後、30分以内にお越しください。」.
- Bắt buộc nhập: 「[必須]」 màu `negative-600` sau nhãn.
- Danh sách rỗng: 「ご予約はございません」.
- Hoàn tất: 「仮登録を受付けました」「パスワードを変更しました」.
- Lỗi chung: 「システムエラーが発生しました。しばらく時間をおいて再度お試しください。」「セッションが切れました。再度ログインしてください。」「ネットワーク接続を確認してください。接続が回復したら「更新」ボタンを押してください。」.
- Thuật ngữ thống nhất: 「当日利用」「回数券」「1DAYパス」「フリーパス」「年間・マンスリーパス」「店舗」. Không dùng emoji.

## Icon

- Bộ **Material Icons** (MUI, tô đặc, khung 24px) + icon lịch nét 1.5px + icon cửa sổ mới. 11 icon trong nhóm asset **Icons**; trong code dùng component `Icon` (vẽ bằng `currentColor`).
- Kích thước: 20px trong breadcrumb, phân trang, ô nhập; 24px mặc định; 25px cho radio. Màu `icon-default` trong ô nhập, `primary-text` cạnh link.
- Icon đứng một mình (con mắt hiện mật khẩu, mũi tên phân trang) phải có `aria-label`, vd. 「パスワードを表示」「次のページ」.

## Logo

- Logo vuông BørneLund (nền xanh, chữ và hình mặt cười vàng) đặt đầu dải nav, cao khoảng 85px, cạnh tên site 「ボーネルンド あそび場 / 受付 / 事前購入サイト」 màu `primary-text`; bản lớn kèm 「あそびと教育」「ボーネルンド」 ở footer trái. Logo là ảnh raster nên chưa có trong nhóm asset — khi cần, dùng tên bằng chữ 「ボーネルンド あそび場」 màu `primary-text`.
- Không đổi màu, không kéo giãn, chỉ đặt trên `surface-subtle` hoặc `surface`.

## Màn đặt chỗ và mua vé

| Mục đích | Component |
| --- | --- |
| Chọn cửa hàng | `SearchBar` (kind `select`) |
| Xem tình trạng theo ngày | thanh ngày `surface-gray` + danh sách kẻ `divider-low` + ký hiệu ○ △ ✕ |
| Chọn sản phẩm | `Select` trong khung `primary-tint`, nút outline sm 「キャンセル」 |
| Sang bước tiếp | `Button` solid md 「次へ」 |
| Đăng ký hội viên | `TextField`, `Select`, `Radio`, `Checkbox` + `Button` 「次へ」 |
| Xem vé đã mua | `Card` (`disabled` khi hết hạn) + `Badge` + `Pagination` |
