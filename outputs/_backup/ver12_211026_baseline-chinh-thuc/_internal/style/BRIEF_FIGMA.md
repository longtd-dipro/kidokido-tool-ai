# Brief viết lại chữ trên Figma — văn phong mới (KidoKido)

File Figma `jjyE9GhFfRZ5VDZU8HFIPv`, page FLOW `16779:398`. Bạn chỉ làm trong **vùng được giao** (node id trong prompt).

## Trước khi làm
1. Gọi Skill `figma:figma-use` (bắt buộc trước mọi `use_figma`; truyền `skillNames: "figma-use"`).
2. Đọc `/Users/longtd/Desktop/WORK/Project Kidokido/KIDO_system-to-doc/.claude/sys-agent/writing-style.md` (§0, §1b, §2) và `.claude/rules/RELIABILITY.md` (không bịa).

## Cách làm
1. `use_figma` đọc chữ trong vùng (theo trang ≤ 250 câu / lần vì kết quả tối đa 20 KB): lấy `TEXT` node, **bỏ qua**:
   - chữ nằm trong node con của frame có `getSharedPluginData("crkit","kind") === "mockup"` (UI thật của designer — không sửa);
   - dòng badge dạng `NEW · SC-067` / `UPD · IMP-007` (regex `^(NEW|UPD|DEL|IMPACT|AS-IS) · \S+$`), dòng bắt đầu `TỔNG =`, chữ chỉ là mã (`SC-027`, `F-027`, `E-01`) hoặc số / ký hiệu;
   - chữ < 4 ký tự.
2. Viết lại từng câu khác nhau theo văn phong mới:
   - Tiếng Việt dễ hiểu, câu ngắn, động từ rõ; viết đủ chữ viết tắt nội bộ (SA → Super Admin, AT → Admin cửa hàng, AP → Admin POSS, V1 → Admin Smaregi V1, KH → khách hàng, MD → ngày công, crawl → khảo sát tự động, route → đường dẫn, DOM → giao diện).
   - Bỏ mã nội bộ trong câu mô tả (API-xxx, EV-xxx, F-xxx, IMP-xxx, CQ-xxx) **trừ** khi mã là thứ duy nhất để tra (VD dòng chỉ ghi mã màn đi kèm tên) — khi đó giữ ngắn.
   - Giữ nguyên: tên màn / nút tiếng Nhật trong 「」, URL / đường dẫn, số liệu, ký hiệu ◇ ▶ ⚠ ✓ ✗, thông báo lỗi tiếng Nhật.
   - Không chữ `UNKNOWN`; chưa rõ → "chưa xác định" / "chưa quan sát được".
   - **Độ dài ≤ 1,3 × bản cũ** (khung có kích thước cố định). Không bịa thông tin mới.
3. `use_figma` ghi lại: với mỗi TEXT node trong vùng có `characters === câu cũ` → load font của node (`getRangeAllFontNames`) rồi gán câu mới. **Không** đổi tên node, vị trí, màu, plugin data.
4. Kiểm tràn: chữ vượt đáy khung chứa (frame cha, hoặc rectangle cùng cấp bao quanh) → nới chiều cao khung đó cho vừa; báo số khung đã nới. Kiểm `UNKNOWN` còn lại = 0.
5. Trả về: số câu đã viết lại · số node đã sửa · số khung đã nới · 3 ví dụ trước/sau.
