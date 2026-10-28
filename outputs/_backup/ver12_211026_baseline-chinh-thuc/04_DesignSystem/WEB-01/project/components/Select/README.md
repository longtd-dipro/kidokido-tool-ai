Select / Autocomplete MUI cùng khung với `TextField`: nền `page-bg`, bo `radius-md`, cao `control-md`, mũi tên `arrow-drop-down` màu `icon-default` bên phải; danh sách thả xuống nền `surface-menu`, option đang chọn nền `primary-subtle`.

- **Consumer cung cấp**: `label`, `required`, `value` hoặc `placeholder`, danh sách option (ở hệ thống thật), `disabled`.
- Dùng cho 「施設名」「商品名」「ステータス」 ở vùng tìm kiếm (SC-004, SC-025) và 「連携のGMOアカウント設定」 (SC-032).
- Ô chọn đơn vị nhỏ đi kèm ô số (「ヶ月」「歳」 trên SC-036) dùng cùng component, rộng ~125px.
- Disabled: mũi tên và chữ `text-disabled` (vd. 「商品名」 khi chưa chọn 施設名).
