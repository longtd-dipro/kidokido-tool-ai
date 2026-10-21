# Brief viết lại văn phong — baseline KidoKido ver12

Bạn viết lại chữ trong 1 gói JSON theo **văn phong mới** của dự án. Đọc trước:
1. `/Users/longtd/Desktop/WORK/Project Kidokido/KIDO_system-to-doc/.claude/sys-agent/writing-style.md` (bắt buộc — §0, §1b, §2)
2. `/Users/longtd/Desktop/WORK/Project Kidokido/KIDO_system-to-doc/.claude/rules/RELIABILITY.md` (không bịa)

## Input / output
- Input: `in/<gói>.json` dạng `{"key": {"text": "<chữ hiện tại>", "ctx": "<bối cảnh>"}}`.
- Output: ghi `out/<gói>.json` dạng `{"key": "<chữ mới>"}` — **đủ mọi key của input, không thêm key**. JSON hợp lệ (dùng python để ghi, kiểm `json.load` lại).
- Gói `screens_*`: output mỗi key là object `{"B4": ..., "B5": ..., "B6": ..., "B7": ...}` (chỉ các ô có trong text hiện tại; ô null giữ null) + `"name_vi"` (tên màn tiếng Việt dễ hiểu, VD "Quản lý đặt chỗ"). B4 bắt đầu bằng dòng `■目的 / Mục đích`.
- Gói `labels`: output = bản dịch tiếng Việt ngắn của nhãn tiếng Nhật trên màn (VD 「検索する」 → "Tìm kiếm"); nhãn đã là tiếng Anh / số / ký hiệu → dịch nghĩa hoặc giữ nguyên nếu không có nghĩa (VD "N/N").

## Quy tắc chung
- Người đọc: PM / BA / BrSE / khách hàng (functions, screens, questions, misc, bugs, cr002) · dev (api, api_fields, db). Viết tiếng Việt dễ hiểu, câu đầy đủ, động từ rõ, gạch đầu dòng `•` khi > 1 ý, tối đa 3–5 dòng.
- Gói cho dev (api, api_fields, db): **được giữ** tên API / bảng / cột / field / mã (API-, F-, SC-, EV-) vì dev cần tra; nhưng câu mô tả phải bình dân, nói rõ "dùng để làm gì".
- Gói còn lại: hạn chế mã nội bộ; giữ mã chỉ khi là khoá tra cứu bắt buộc (VD "Bằng chứng: EV-0672"). Viết tắt nội bộ (KH, MD, BrSE, UPD, NEW, SA, AD…) → viết đủ ("khách hàng", "ngày công", "Super Admin").
- **Không bịa**: chỉ diễn đạt lại thông tin có trong text + ctx. Không thêm hành vi, con số, quy tắc mới. Điều chưa rõ → viết rõ "chưa xác định" / "chưa quan sát được" / "chờ khách hàng xác nhận" (không dùng chữ UNKNOWN). Suy luận có sẵn trong text → giữ nhãn "(suy luận, cần kiểm chứng)".
- Giữ nguyên: tên màn / nút / mục tiếng Nhật trên màn hình (đặt trong 「」), URL, đường dẫn code `REPO-01:...#Lxx`, tên biến môi trường, số liệu.
- Chữ tiếng Nhật (cột JP, thông báo lỗi JP): giữ tiếng Nhật, です・ます, dễ hiểu; không pha tiếng Việt.
- Không chào hỏi, không tóm tắt cuối. Ngắn hơn hoặc bằng bản cũ trừ khi cần thêm 1 câu giải thích.

Xong: in số key đã ghi và tự kiểm `set(out) == set(in)`.
