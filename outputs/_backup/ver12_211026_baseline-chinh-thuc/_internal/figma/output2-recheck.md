# O5 Output 2 — Recheck (script, không chấm bằng mắt)

- Figma file: `jjyE9GhFfRZ5VDZU8HFIPv` (TOKIWAGI-PJ) · page node `16779:398`
- Frame: `KidoKido ver1 — Output 2 Screen flow (AS-IS)` · node `16779:1064` · 3680 × 8753 · đặt tại x=6600, y=0 (bên phải Output 1 x=4000..6280; `pageOverlap: []` — không chồng lên node nào trên page)
- URL: https://www.figma.com/design/jjyE9GhFfRZ5VDZU8HFIPv/TOKIWAGI-PJ?node-id=16779-1064&t=Mu53XNLlnffZ7qWH-4
- Vẽ bằng 3 lần gọi `use_figma` (A: FL-01…05 · B: FL-06…10 · C: Master Map + bảng ④⑥⑤⑦⑧); recheck = 1 lệnh chỉ đọc chạy sau cùng. Gate ảnh mẫu `final_output_2.png` đã mở và tả lại bằng lời trước khi vẽ.

| Thứ tự | Tiêu chí | Kết quả script | Verdict |
|---|---|---|---|
| 1 | **9 — Node nằm trong biên frame** (TEXT + RECTANGLE, đủ 4 phía) | `outside: 0` | ✅ PASS |
| 2 | **7 — Overlap bbox** (RECTANGLE w>100 & h>30, ngưỡng >2px) | `boxChecked: 159 · overlapCount: 0` | ✅ PASS |
| 3 | **6 — Không node rỗng** (mỗi box node có ≥ 2 text bên trong và tổng ký tự > 0) | `nodeBoxes: 151 · empty: 0 · emptyTextNodes: 0 / 1634 text` | ✅ PASS |
| + | **Đếm screen node = số SC** | `flowScreenNodes: 60 · edgeScreenNodes: 33 · distinct: 93 · dup: [] · missing: []` → **93 / 93** | ✅ PASS |
| + | Badge liên tục toàn cục | 60 badge (1–60), không reset giữa các Group | ✅ |
| + | Kiểm tra quyền riêng tư (`@` / `cloudfront` / `http` trong text) | `0` | ✅ |

Phân loại 151 box node: SCREEN 60 · EDGE 33 · Decision 8 · System 11 · NG 7 · Alt 1 · TERMINAL 21 · MAP (Master Map) 10.

Đối chiếu số học (Quality Gate O2):
- Số Group = 10 = số flow Output 1 (không có shared cluster).
- Số terminal box = 21 = số dòng bảng ⑥.
- Mỗi NG box (7) ↔ 1 dòng Exception Matrix `FACT` (EX-01…07); mỗi box EDGE (33) ↔ 1 dòng `UNKNOWN` (EX-08…40); thêm EX-41 = message / validation UNKNOWN → `Tổng: 41 exceptions (FACT: 7 · PROPOSAL: 0 · INFERENCE: 0 · UNKNOWN: 34 · CONFLICT: 0)`.
- Bảng ④ Screen Index = 93 dòng (WEB-01 45 · WEB-02 48).
- Bảng ⑦ = 1 dòng "Chưa có message code — chưa quan sát được (crawl không submit)" (O1 không có message code); ⑧ strip = 1 dòng / Group, không có badge ⚠N.
- Mũi tên: nét liền chỉ khi có bằng chứng (`pages.json` link menu nav, `02_Screen.Entry From`, `07_API.Called By Screens`); còn lại là nét đứt + nhãn "Inferred".

```
Overlap check: 0 chồng đè / 159 box
Empty check: 151/151 box node có nội dung
Screen node: 93 / 93 SC (60 flow + 33 EDGE) · THIẾU: []
```

**Lệch so với rule — cần BRSE xác nhận:** chưa vẽ Combined Detail (L1). Vẽ thêm Master Map (L0) vì có hơn 80 node. Lý do bỏ Combined Detail: không Group nào dùng chung screen, vì mỗi SC thuộc đúng 1 F và 1 flow; các Group chỉ nối với nhau qua menu nav và link SC-027→SC-001, và Master Map đã thể hiện những liên kết này. Vẽ Combined Detail sẽ phải lặp lại 60 screen node, khi đó phép đếm "1 node / 1 SC" = 93 không còn đúng. Ghi chú này cũng có trên frame (box "COMBINED DETAIL (L1) — không vẽ").

Kết quả: **PASS** → chờ Gate B2 (user duyệt Output 2).
