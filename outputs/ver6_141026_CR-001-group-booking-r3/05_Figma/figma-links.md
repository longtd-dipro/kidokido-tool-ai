# Figma — CR-001 (ver6)

Link chính (section CR-001 ver6): https://www.figma.com/design/jjyE9GhFfRZ5VDZU8HFIPv/TOKIWAGI-PJ?node-id=16835-398

File TOKIWAGI-PJ · page FLOW · vẽ bằng tài khoản Figma dipro_pm2

| View | Node URL | Nội dung | Recheck |
|---|---|---|---|
| Section CR-001 (baseline ver1 → ver6) | https://www.figma.com/design/jjyE9GhFfRZ5VDZU8HFIPv/TOKIWAGI-PJ?node-id=16835-398 | 4 sub-view · y = 25426 (dưới section ver3) | overlap 0 · V-CR-FIGMA 13 PASS · 0 FAIL · 0 WARN |
| CR-1 Flow (format Output 1) | https://www.figma.com/design/jjyE9GhFfRZ5VDZU8HFIPv/TOKIWAGI-PJ?node-id=16835-413 | 7 lane (FL-07, FL-03, CR-NEW-1, FL-08, FL-09, FL-05, FL-01) — **mỗi lane có ◇ điều kiện + nhánh NG (non-happy)** · Technology 5 mục | check 7 mũi tên thật · check 11 NG mỗi lane |
| CR-2 Screen Flow (format Output 2) | https://www.figma.com/design/jjyE9GhFfRZ5VDZU8HFIPv/TOKIWAGI-PJ?node-id=16836-398 | 5 Group · **màn lỗi / popup (⚠) trong từng group** · ④ Screen Index có cột **Loại** (List / Detail / Form / Modal / Dashboard / Full screen) + dòng **TỔNG = 38 màn chính + 6 popup / màn lỗi = 44** · ⑦ Error / Popup Index 13 dòng | check 12 |
| CR Change Table (thống kê) | https://www.figma.com/design/jjyE9GhFfRZ5VDZU8HFIPv/TOKIWAGI-PJ?node-id=16837-398 | Số đối tượng NEW/UPD/DEL/IMPACT theo 9 nhóm + 実装 114.75 MD · 総工数 261.63 人日 · 13.08 人月 | khớp cr.json (check 5) |
| CR-3 Screens (màn đề xuất) | https://www.figma.com/design/jjyE9GhFfRZ5VDZU8HFIPv/TOKIWAGI-PJ?node-id=16841-398 | **25 màn**: 16 NEW (13 màn + 3 popup IMP-038 / IMP-041 / IMP-033) · **9 UPD** (SC-063, SC-070, SC-071, SC-076, SC-027, SC-004, SC-005, SC-035, SC-036) · mockup bên trái — **mô tả bên phải** (Mục đích · Thay đổi so với AS-IS · Happy case · bảng ITEMS ①… · bảng ERROR SCENARIOS) · màn UPD tô viền đứt màu từng phần NEW / UPD / DEL trên màn cũ | check 10 màu ⊆ token DS ver4 · check 13 |

Màn không vẽ riêng (ghi trong `cr-figma.json → screens.skip`): SC-007 dùng chung component với SC-005 · SC-037 / SC-038 dùng chung form với SC-036.

Section CR-001 ver3 (node 16803:398) **giữ nguyên, không xoá** — chờ user quyết định xoá sau khi duyệt bản ver6.
