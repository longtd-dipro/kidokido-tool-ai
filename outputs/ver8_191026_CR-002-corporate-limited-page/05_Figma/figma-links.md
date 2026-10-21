# Figma — CR-002 (ver8)

Link chính (section CR-002): https://www.figma.com/design/jjyE9GhFfRZ5VDZU8HFIPv/TOKIWAGI-PJ?node-id=16883-398

File TOKIWAGI-PJ · page FLOW (page cũ, section mới đặt dưới section CR-001 ver6, y = 67250) · vẽ bằng tài khoản Figma dipro_pm2

| View | Node URL | Nội dung | Recheck |
|---|---|---|---|
| Section CR-002 | https://www.figma.com/design/jjyE9GhFfRZ5VDZU8HFIPv/TOKIWAGI-PJ?node-id=16883-398 | 4 sub-view | overlap 0 · V-CR-FIGMA 13 checks · 12 PASS · 0 FAIL · 1 WARN |
| CR-1 Flow (format Output 1) | https://www.figma.com/design/jjyE9GhFfRZ5VDZU8HFIPv/TOKIWAGI-PJ?node-id=16883-413 | 4 lane: FL-08 (lịch ①) · CR-NEW-1 (mua qua trang 限定公開) · FL-07 (ẩn ở trang thường) · FL-03 (thiết lập sản phẩm); mỗi lane có NG hoặc lý do N/A · Technology 2 mục | mũi tên thật (check 7) · NG (check 11) |
| CR-2 Screen Flow (format Output 2) | https://www.figma.com/design/jjyE9GhFfRZ5VDZU8HFIPv/TOKIWAGI-PJ?node-id=16884-398 | 4 Group · ④ Screen Index: TỔNG = 15 màn chính + 3 popup / màn lỗi = 18 · ⑦ Error / Popup Index 6 dòng | check 12 |
| CR Change Table (thống kê) | https://www.figma.com/design/jjyE9GhFfRZ5VDZU8HFIPv/TOKIWAGI-PJ?node-id=16885-398 | Số đối tượng NEW/UPD/DEL/IMPACT · 実装 26 MD (cộng cả ①-A và ①-B — có ghi chú, giá theo CR-002_ETA_vi.xlsx) | khớp cr.json (check 5) |
| CR-3 · Màn hình người dùng (WEB-02) | https://www.figma.com/design/jjyE9GhFfRZ5VDZU8HFIPv/TOKIWAGI-PJ?node-id=16890-398 | 3 màn: SC-067 ①-B · ①-A thay thế · 限定公開ページ | check 10 · 13 |
| CR-3 · Màn hình quản trị (WEB-01) | https://www.figma.com/design/jjyE9GhFfRZ5VDZU8HFIPv/TOKIWAGI-PJ?node-id=16890-401 | 4 màn: SC-036 · SC-035 · 限定公開ページ管理 · popup 公開停止 | check 10 · 13 |
| (chi tiết 7 màn CR-3) | — | 7 màn: SC-067 ①-B (UPD) · ①-A thay thế (UPD) · 限定公開ページ (NEW) · SC-036 form sản phẩm (UPD) · SC-035 danh sách sản phẩm (UPD) · 限定公開ページ管理 (NEW, Option) · popup 公開停止 (NEW, Option) — mockup trái, mô tả + ITEMS + ERROR SCENARIOS phải | màu ⊆ token DS ver4 (check 10) · check 13 |

Không vẽ mockup riêng (ghi trong `cr-figma.json → screens.skip`): SC-037 / SC-038 dùng chung form / field với SC-036 / SC-035 · SC-050 / SC-054 chỉ nhận thêm khoá 限定公開, giao diện không đổi.

WARN check 6: cùng mã xuất hiện ở nhiều lane / group (API-107, API-075, SC-050, SC-066) và 2 nhánh lỗi khác nhau của cùng màn IMP-016 — có chủ đích.
- Flow archify (workflow): `05_Figma/CR-002_flow_archify.html` — bản gốc + candidate.json ở `.archify/workflow-cr002-corporate-20261019-133536/`; finalize 4 gate PASS

## Bổ sung 20/10
- Screen flow (VI) Quản trị → Trang giới hạn (Option): https://www.figma.com/design/jjyE9GhFfRZ5VDZU8HFIPv/TOKIWAGI-PJ?node-id=16920-398
- Sơ đồ quan hệ Sản phẩm ↔ Trang giới hạn (PNG): `05_Figma/CR-002_quan-he-san-pham-trang-gioi-han.png` (nguồn HTML: `_internal/relationship/quan-he-san-pham-trang.html`)
