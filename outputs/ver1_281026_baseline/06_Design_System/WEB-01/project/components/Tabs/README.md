Tab dạng segmented (theo website SC-008): khung viền 2px `mui-primary` bo `radius-lg`, mỗi tab cao `tab-height` 48px, tab đang chọn nền `mui-primary` chữ trắng đậm, tab khác chữ `primary-text` 14px. Figma (node 1672:209336) vẽ kiểu khác (viền `primary`, bo 20, nút chọn gradient) — xem STATUS Mâu thuẫn #17; token `radius-segment`, `segment-height`, `nav-active-*` giữ để đối chiếu.

- **Consumer cung cấp**: `items` (nhãn), `value` (tab đang chọn).
- Chỉ thấy trên SC-008 順番待ち管理 (vai trò tenant / POSS / Smaregi): 「呼び出し中リスト」「順番待ち中リスト」「キャンセルリスト」.
- Dùng để đổi danh sách trong cùng màn, không dùng thay sidebar.
