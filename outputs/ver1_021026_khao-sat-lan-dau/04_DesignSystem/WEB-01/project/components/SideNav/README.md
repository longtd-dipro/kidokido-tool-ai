Sidebar cố định trái rộng `sidebar-width` 265px trên nền `page-bg`: logo trên cùng, mục cao `nav-item-height` (icon 24px + nhãn `nav-14` màu `text-low`), mục đang chọn nền gradient `nav-active-light` → xanh đậm, chữ `on-nav-active`, bo `radius-md`; 「ログアウト」 màu `negative-600` ở cuối.

- **Consumer cung cấp**: `items` (tiêu đề, `children` cho menu có sub-menu), `active`, `activeChild`.
- Menu cha có sub-menu khi mở: nền `nav-open-bg` + mũi tên lên; sub-menu đang chọn dùng cùng gradient.
- Danh mục menu đổi theo vai trò: Super Admin thấy 「ダッシュボード」…「免責事項設定」; tenant / POSS / Smaregi thấy 「予約管理」「バーコード読み取り」「入場状況管理」「順番待ち・受付管理」…
- Vai trò tenant hiện 「<tên tenant>でログイン中」 phía trên 「ログアウト」.
- Icon trong preview là hình tròn thay thế; icon thật ở nhóm asset **Icons** (`dashboard-active`, `house-inactive`…).
