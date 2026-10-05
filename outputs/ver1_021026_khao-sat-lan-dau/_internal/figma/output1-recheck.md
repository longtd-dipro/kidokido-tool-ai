# O5 Output 1 — Recheck (script, không chấm bằng mắt)

- Figma file: `jjyE9GhFfRZ5VDZU8HFIPv` (TOKIWAGI-PJ) · page node `16779:398`
- Frame: `KidoKido ver1 — Output 1 Flow tổng quan (AS-IS)` · node `16779:399` · 2280 × 4356 · đặt tại x=4000, y=0 (bên phải nội dung có sẵn, maxRight trang = 3600; không sửa node cũ)
- URL: https://www.figma.com/design/jjyE9GhFfRZ5VDZU8HFIPv/TOKIWAGI-PJ?node-id=16779-399&t=Mu53XNLlnffZ7qWH-4
- Ngày chạy: 2026-10-02 · Cả 3 tiêu chí đều chạy bằng 1 lệnh `use_figma` chỉ đọc, ngay sau khi vẽ (chưa phải sửa vòng nào)

| Thứ tự | Tiêu chí | Kết quả script | Verdict |
|---|---|---|---|
| 1 | **9 — Node nằm trong biên frame** (đủ 4 phía, TEXT + RECTANGLE) | `soNodeNgoaiFrame: 0` | ✅ PASS |
| 2 | **7 — Overlap bbox** (RECTANGLE w>100 & h>30, ngưỡng >2px) | `boxChecked: 117 · overlapCount: 0` | ✅ PASS |
| 3 | **8 — F Coverage** (regex `#\d+(,\d+)*`, TOTAL = 97 dòng 01_Function, SYSTEM_ONLY = ∅) | `soFRxuatHien: 97 · FRthieu: []` | ✅ PASS — đủ 97 F |
| + | 6 — Text rỗng | `emptyText: 0` / 327 text node | ✅ |
| + | Kiểm tra quyền riêng tư (text có `@` / `cloudfront` / `http`) | `0` node | ✅ |

```
Overlap check: 0 chồng đè / 117 box
FR COVERAGE — Sitemap: 36 mục · phủ 97/97 F (Sitemap Confirmed 64/64 · Edge panel To verify 33) · THIẾU: []
```

Kiểm tra bằng ảnh (bổ sung, sau khi script đã PASS): get_screenshot 2280×4356 = đúng kích thước frame (không có node văng ra ngoài); text không bị cắt; mỗi band có đủ 5 cột Actor → Trigger → Function → Technology → Outcome; decision + nhánh NG/ALT ở FL-01, FL-05, FL-08, FL-10; F To verify chỉ nằm ở cột EDGE (tím, nét đứt), không có trong luồng chính.

Kết quả: **PASS** → chờ Gate A (user duyệt Output 1 trước khi vẽ Output 2).

---

## Rerun sau Gate A — 2026-10-02 (inventory rebuild: 01_Function = 98 F, thêm F-098 cron-job)

Thay đổi trên frame `16779:399` (chỉ sửa nội dung text, không dời node nào):
- `33584:50513` "✔ Chạy cron nhắc lịch / quá hạn  (cron — không có F)" → "✔ Chạy cron nhắc lịch / quá hạn  #98"
- `33584:50178` header FL-10 "3 F (3 Confirmed…)" → "4 F (4 Confirmed · 0 To verify)"
- `33584:49854` subtitle "01_Function 97 F" → "01_Function 98 F"

| Thứ tự | Tiêu chí | Kết quả script | Verdict |
|---|---|---|---|
| 1 | 9 — Node trong biên frame | `outside: 0` | ✅ PASS |
| 2 | 7 — Overlap bbox | `boxChecked: 117 · overlapCount: 0` | ✅ PASS |
| 3 | 8 — F Coverage (TOTAL = 98) | `soFRxuatHien: 98 · FRthieu: []` | ✅ PASS — đủ 98 F |

```
Overlap check: 0 chồng đè / 117 box
FR COVERAGE — Sitemap: 36 mục · phủ 98/98 F (Sitemap Confirmed 65/65 · Edge panel To verify 33) · THIẾU: []
```
Gate A: user đã APPROVE Output 1 (qua session chính).
