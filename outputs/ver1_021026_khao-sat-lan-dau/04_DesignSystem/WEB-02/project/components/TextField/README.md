Ô nhập một dòng: nhãn 16px/24px `text-high` + 「[必須]」 `negative-600` + ô cao `field-height` 56px, nền `primary-subtle`, không viền, bo `radius-field` 10px, padding 16.5px 14px, chữ 16px/24px/300.

- **Consumer cung cấp**: `label`, `required`, `hint` (dòng 「※」 12px phía trên ô), `placeholder`, `type` (`password` thêm icon `visibility`, `date` thêm icon `calendar`), `error`, `onChange`.
- Placeholder dùng `text-low` (2.92:1 trên `surface`, 2.77:1 trên `primary-subtle`) với câu hướng dẫn định dạng: 「半角英数字8文字以上」「yyyy/mm/dd」「ハイフンなしで入力する」.
- Lỗi: viền 1.5px `negative-600`, câu lỗi 12px `negative-600` dưới ô.
- Hai ô ngang hàng (姓 / 名, セイ / メイ) chia đôi chiều rộng form, cách nhau `space-16`.
