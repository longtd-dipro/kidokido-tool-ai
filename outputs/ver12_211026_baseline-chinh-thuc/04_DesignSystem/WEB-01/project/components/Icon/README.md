Icon MUI Material (filled / outlined, khung 24×24) vẽ bằng `currentColor`; mặc định màu `icon-default`, cỡ 24px trong bảng / input, 20px trong nút và phân trang.

- **Consumer cung cấp**: `name` (`visibility`, `edit`, `delete`, `arrow-drop-down`, `navigate-before`, `navigate-next`, `add`, `add-circle`, `save-alt`, `keyboard-arrow-down`, `keyboard-arrow-up`, `clock`, `circle`), `size`, `label`.
- Icon đứng một mình (icon button trong cột 「アクション」) phải có `label` → `aria-label` (hệ thống dùng 「details」「update」「delete」).
- Icon menu sidebar là SVG nét 1.5px riêng của hệ thống (nhóm asset **Icons**), không thay bằng icon MUI.
