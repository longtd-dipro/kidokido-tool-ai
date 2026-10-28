# Run log — ver1_281026_baseline

version_type: BASELINE
baseline: —
run_mode: FULL (lần chạy thứ 1 trên folder này — `version-tool.py next` trả `reuse: false`, không có snapshot)

Các version cũ (ver2, ver3, ver6, ver8, ver12) đã được người dùng dời vào `outputs/_backup/` trước lần chạy này → `version-tool.py context` không thấy baseline nào → tạo ver1. `_backup/` chỉ đọc, không sửa.

## Điều kiện chạy
| Hạng mục | Giá trị |
|---|---|
| Website | WEB-01 https://dhxkf93d45vp4.cloudfront.net/admin · WEB-02 https://dhxkf93d45vp4.cloudfront.net (dev) — **không đăng nhập / crawl lại**; dùng kết quả crawl 02/10/2026 kế thừa ver12 (26 ngày, ≤ 30 ngày) |
| T1–T3 (môi trường TEST) | Kế thừa ver12 (PM dự án cấp tài khoản TEST, môi trường dev, không dữ liệu thật). **Người dùng xác nhận lại 28/10/2026** trong phiên giao việc, câu "Thông tin chạy lấy lại dữ liệu cũ" — coi là xác nhận 4 câu an toàn (môi trường thử nghiệm · tài khoản được phép · mức thao tác · không dữ liệu thật). Không có lượt hỏi `AskUserQuestion` riêng |
| Source | REPO-01 `inputs/tokiwagi` (Next.js pages router + Prisma, FULLSTACK → WEB-01, WEB-02) · commit `33091a3fd3b50cbf8f5947f2298670035a0d3df3` |
| Database | MIGRATION — `read-orm-schema.py` (Prisma schema + 107 migration) là nguồn chính. Dump `inputs/db/kido_local_20270730.dump`: `read-schema.py` **từ chối** (dump có dòng dữ liệu, L1325) → không đọc |
| Figma | input: — · output: TOKIWAGI-PJ (kế thừa) — O5 vẽ ở lần chạy thứ 2 (28/10/2026), xem mục **O5 — Figma** |
| Budget crawl | Không crawl. Crawl kế thừa: WEB-01 269/200 URL (vượt, ghi ở ver12) · WEB-02 90/200 URL |
| Preflight | `outputs/_project/preflight-memory.json` nạp từ `00_Meta` / README / run-log ver12 (nguồn "kế thừa ver12", người dùng xác nhận 28/10/2026). Câu còn thiếu: 0 |

## Discovery Brief (kế thừa ver12 — người dùng xác nhận "lấy lại dữ liệu cũ")
| Quyết định | Giá trị | Ghi chú |
|---|---|---|
| B1 Số Design System | 2 bộ riêng (WEB-01 quản trị · WEB-02 người dùng) | `extract-design-tokens.py --code-only` ra `single` vì 2 site chung 1 repo CSS → không phân biệt được bằng code; giữ quyết định ver12 (dựa trên crawl) |
| B2 Output làm | O1–O4, O6–O9 · O5 bước sau | — |
| B3 Repo legacy | Không có | — |
| B4 Phạm vi | 2 website · role như ver12 | — |
| B5 Đưa sơ đồ lên Figma | Đồng ý — kế thừa ver12 | Output 1 / 2 đã vẽ; sơ đồ API / DB chờ chọn nhóm Figma |

## S1 — quét nhạy cảm
- `scan-sensitive.py` (repo + inputs/db): 975 file · 80 HIGH · 134 LOW/INFO · 1 bỏ qua → exit 3 (`_internal/gates/sensitive.md`).
- Áp phân loại người dùng trả lời 27/10/2026 (ghi bằng `preflight-memory.py set-sensitive`):
  - `tokiwagi/README.md` (L13/17/21) · `tokiwagi/prisma/seeds/users.ts` → tài khoản mẫu môi trường dev: được đọc repo, **không chép giá trị nào** vào output.
  - 36 file còn lại (tên route / hằng số / tên file chứa password·token·credential, câu thông báo lỗi) → báo nhầm.
  - `tokiwagi/.yarnrc.yml` → không mở (chỉ biết tên) · dump → chỉ qua `read-schema.py` (đã từ chối).

## Pha A — code (chạy mới)
| Bước | Kết quả |
|---|---|
| `scan-repo.py --commit-only --prev-inventory` ver12 | `commit_changed: null` (ver12 không ghi `repo_commit`) → chạy lại toàn bộ Pha A, không carry |
| `read-orm-schema.py` | 25 bảng · 323 cột · 25 model · 107 migration · 25 FK · lệch model ↔ migration: 0 |
| `scan-repo.py` (FULLSTACK) — lần 1 qua wrapper né lỗi; **chạy lại 28/10 bằng script chính thức, kết quả trùng khớp (xem mục Chạy lại 28/10)** | 143 API · 93 route FE · 158 lời gọi API từ FE · **283 cạnh màn → API (static 283, khớp API ID 283)** · 72 màn có gọi API · 6 API đọc được role · 0 batch |
| R10 token nháp | `dsLayout.mode = single` (1 repo cho 2 site) |
| Carry chữ từ ver12 | Chức năng / màn / Summary API / field API / mô tả bảng / câu hỏi mở / liên kết ngoài — mỗi dòng ghi `Carried from ver12`. EV / API ID của ver12 ánh xạ lại theo locator / path (`_internal/build/id-map-ver12.csv`): 1.634 EV ánh xạ, 0 bỏ |
| Loại khỏi AS-IS | CR-002 (trang giới hạn — SC-094, F-099, Q-037, Q-038, EV-1997): chưa có trong code đang khảo sát |

## Pha B — website (kế thừa, không chạy)
- Chép `recon/crawl/`, `recon/crawl-roles/`, `recon/design/` và 217 ảnh `evidence/EV-0492…EV-0708` từ ver12 (`recon/crawl/INHERITED.md`). EV ảnh giữ số cũ; EV code lần này bắt đầu từ EV-0709.
- Crawl 02/10 chạy trước khi `crawl-site.js` có nhãn `noise` → gắn lại nhãn `read-only-block` theo đúng quy tắc của `crawl-site.js` (`_internal/build/retag_noise.py`, bản gốc `console.orig.json`): 327 dòng console là nhiễu do chế độ chỉ xem chặn request.
- `02_Screen.Screenshot EV` ver12 ghi nhiều EV / ô → ver1 giữ 1 EV ảnh chính (đúng `inventory-spec.md`), ảnh role khác ghi ở `Note`.

## Kết quả gate (số chép từ script)
| Gate | Kết quả |
|---|---|
| S1 Sensitive | exit 3 — đã xử lý theo phân loại người dùng (trên) |
| V1 Evidence | 11 checks · 10 PASS · 0 FAIL · 1 WARN (EV mồ côi — EV code chưa được dòng nào trỏ tới) |
| V2 Inventory | 30 checks · 30 PASS · 0 FAIL · 0 WARN · coverage 236/236 route |
| V-BD WEB-01 | 19 checks · 17 PASS · 0 FAIL · 2 WARN (chưa chèn ảnh — đã khai NO IMAGE) |
| V-BD WEB-02 | 19 checks · 17 PASS · 0 FAIL · 2 WARN (như trên) |
| V-API | 13 checks · 13 PASS · 0 FAIL · 0 WARN |
| V-DB (check 10 `--code-schema`) | 10 checks · 10 PASS · 0 FAIL · 0 WARN |
| V-DS | 35 checks · 31 PASS · 0 FAIL · 4 WARN |
| V8 Bug list | 16 checks · 16 PASS · 0 FAIL · 0 WARN |
| V-DEV | 6 checks · 6 PASS · 0 FAIL · 0 WARN |
| V-BIZ | 10 checks · 10 PASS · 0 FAIL · 0 WARN |
| V5 flow (ảnh dự phòng) | 9 checks · 9 PASS · 0 FAIL · 0 WARN |
| V3 Overview | 16 checks · 16 PASS · 0 FAIL · 0 WARN (chạy lại sau O5: 16 checks · 16 PASS · 0 FAIL · 0 WARN) |
| V9 self-test | selftest-gates 70 ca · 70 PASS · 0 FAIL · selftest-docs / selftest-basic-design exit 0 |
| H06 PII scan | 230 file · 0 phát hiện (lần 1) · sau O5: 237 file · 0 phát hiện |

## Diff so với ver12 (tham khảo — ver12 nằm ở `_backup/`)
| Hạng mục | ver12 | ver1 |
|---|---|---|
| Màn | 94 (gồm SC-094 CR-002) | 93 (WEB-01 45 · WEB-02 48) |
| API | 143 (10 API thêm tay) | 143 (đọc từ code; ID đánh lại theo path — bảng đối chiếu `id-map-ver12.csv`) |
| Bảng / cột | 25 / 324 | 25 / 323 (đọc lại từ Prisma + migration) |
| Màn → API | suy từ chuỗi import (có thể dư) | đồ thị gọi FE → API: 283 cạnh |
| Ô chưa có căn cứ ở O1 | 37 ô ghi chữ cũ "chưa rõ" (18 + 19) — bản cũ không có cột "API gọi", không đối chiếu từng nút | 86 ô "Cần xác nhận — Q-xxx" (WEB-01 58 · WEB-02 28) trên 1.190 item, mỗi ô có câu hỏi Q-037…Q-122 (lần 1: 149 ô, Q-037…Q-185) |
| Bug | 0 Bugs · 0 Suspected · 296 Observations | 0 Bugs · 8 Suspected · 288 Observations (8 mục "trước đây là bug" trả về Suspected theo quy tắc mới 27/10) |

## Lỗi script gặp phải (KHÔNG sửa kit — đã né, cần sửa ở kit)

> Lần 3 (28/10): lỗi 1–3 và 6 kit đã sửa — chạy bằng script chính thức, không cần wrapper; lỗi 8 kit đã giảm một phần (xem mục Chạy lại 28/10).
| # | Script | Lỗi | Cách né lần này |
|---|---|---|---|
| 1 | `scan-repo.py` `resolve_js_import` | Không hiểu import kiểu `baseUrl: ./src` (`import … from "services/…"`) → **0 cạnh màn → API** | Wrapper ngoài kit (`_internal/build/scan_repo_wrap.py`) thay hàm lúc chạy: thử thêm `src/<spec>` |
| 2 | `scan-repo.py` `url_from_arg` | Template `` `${APIs.X}/${id}` `` bị bỏ phần đầu → path `/:id`; hằng số trùng tên giữa file bị loại khỏi bảng hằng | Wrapper: ưu tiên hằng số trong cùng file |
| 3 | `scan-repo.py` `sensitive_reason` | Không đọc phân loại S1 trong `preflight-memory.json` → bỏ 24 file src (10 API auth, 12 màn) dù người dùng đã phân loại báo nhầm | Wrapper: chỉ mở lại file có phân loại "[A] Báo nhầm" và lý do `name-keyword`; env / key / dump / config vẫn chặn |
| 4 | `build-basic-design.py` | Ghép ảnh crawl bằng `evId == Screenshot EV` nguyên chuỗi → ô nhiều EV không khớp, màn mất item web | Sửa dữ liệu inventory về đúng spec (1 EV / ô) |
| 5 | `build-basic-design.py` | Nhãn nút chứa giá trị ngày (`Choose date, selected date is …`) vào thẳng O1 | Spec đổi nhãn thành `Choose date` |
| 6 | `render-codemap.py` · `build-db-doc.py` · `render-flow.py` | Font DejaVu thiếu chữ Nhật → ô vuông trong PNG | Kit đã sửa — lần 3 vẽ lại PNG, chữ Nhật hiện đúng |
| 7 | `build-version-index.py` | `--skip "O5=…"` bị bỏ qua khi có `05_Figma/figma-links.md` → README ghi O5 "⚠️ chưa chạy gate" | Ghi chú thêm ở cuối README |
| 8 | `build-basic-design.py` | Nút không khớp nhãn với `fe-api-calls.csv` (icon `update` / `delete`, phân trang, chọn ngày…) đều thành "Cần xác nhận" | Spec `_internal/bd/<WEB>.json` sinh từ code (`_internal/build/build_bd_spec.py`, mọi mô tả có code-ref) → giảm từ 1.010 xuống 149 ô |

## O5 — Figma (lần chạy thứ 2 trên version này, 28/10/2026)
- Snapshot trước khi ghi đè: `_internal/history/20261028-0855/` (figma-links.md · Overview docx · v3.md · index.json · README.md · run-log.md).
- File TOKIWAGI-PJ `jjyE9GhFfRZ5VDZU8HFIPv`, page FLOW `16779:398`. Khối mới đặt từ x = 21000 (bên phải mọi khối `_backup`); khối `_backup` không sửa.
- Cách làm: nhân bản Output 1 (ver9 `16965:6780`) và Output 2 (ver9 `16968:9158`) rồi cập nhật theo ver1:
  - Bỏ 17 chỗ chữ mã trạng thái thô trên Output 1 (viết "chưa quan sát được" / "Cần xác nhận — chưa quan sát").
  - Đổi mã API theo ver1 (đối chiếu `id-map-ver12.csv`): FL-05 API-004…008 · FL-08 API-084, API-080 · FL-10 API-105…109, API-110, API-086…092, API-097…103.
  - Nhóm FL-10 (Output 2) đổi tên cho khớp lane Output 1 "Quyết toán tại quầy qua Smaregi" + xử lý hệ thống không có màn; sửa 2 chỗ chữ đè chữ của bản cũ.
  - Bảng ⑦ dựng lại theo 12 mã thông báo của O1 ver1 (8 mã chung + E_SC041_S_001/002 + E_SC086_S_001/002); mã chung là mẫu định nghĩa, chưa thấy hiển thị thật → không tính thêm màn (B = 0).
  - Tên layer Sitemap gắn F-094…F-098 để kiểm phủ chức năng hệ thống.
- Kiểm phủ: Output 1 — 93/93 màn + 5/5 chức năng hệ thống = 98/98 · THIẾU []. Output 2 — WEB-01 45/45, WEB-02 48/48 nằm đúng section site.
- Recheck (script quét toạ độ, không bằng mắt): 12 frame · ngoài frame 0 · chồng lấn box 0 (Output 1: 15 box · Output 2: 156 box) · tràn chữ 0 · chữ đè chữ 0 (đã sửa 1 chỗ ở Bản đồ tổng) · mã trạng thái thô 0 · node màn rỗng 0/114.
- Gate A / B (hỏi người dùng giữa Output 1 và Output 2) không hỏi riêng: người giao việc yêu cầu vẽ cả hai trong một lượt.
- Sơ đồ API / DB: đã vẽ ở lần 3 trên file Figma design (xem mục Chạy lại 28/10); EDGE chưa gắn số Q-xxx cụ thể (giữ chữ "chưa quan sát được" như bản ver9).

## Không chạy / bị chặn
| Output | Lý do |
|---|---|
| O5 — gate trong README | README ghi O5 "⚠️ chưa chạy gate": `build-version-index.py` chờ file `gates/v-figma.md` nhưng Luồng 1 không có script nào sinh file này (recheck O5 chạy bằng script quét toạ độ trên Figma, kết quả ghi ở `05_Figma/figma-links.md`). Không ghi tay file gate |
| Ảnh màn trong O1 | Chưa đánh số ảnh (`annotate-ui-image.py` cần toạ độ item, crawl cũ không có) → `NO IMAGE — text only` |

## Chạy lại 28/10/2026 (lần 3) — script chính thức của kit thay script tạm
Snapshot trước khi ghi đè: `_internal/history/20261028-0904/` (55 file: recon/code, O1–O3, O6, O8, gates, bd, inventory, figma-links, README, run-log) · `20261028-0916/` (2 script tạm trước khi xoá).

| Bước | Lệnh | Trước (lần 1) | Sau (lần 3) |
|---|---|---|---|
| Quét code | `scan-repo.py inputs/tokiwagi --repo-id REPO-01 --kind FULLSTACK --ev-start 734 --api-start 1 --sensitive-memory outputs/_project/preflight-memory.json --site-url <WEB-02 URL>` — bỏ `scan_repo_wrap.py` | 283 cạnh màn → API · 24 file mở lại (qua wrapper) | 283 cạnh (static 283, khớp API ID 283) · 24 file mở lại (`reopened_sensitive`) · next_ev 1128 · next_api 144. `api-seed` / `evidence` / `fe-api-calls.csv` / `api-roles` **trùng từng byte** với lần 1 → EV / API ID giữ nguyên |
| Nạp inventory | Kit không có lệnh / flag chính thức để nạp kết quả quét vào inventory (`build-inventory.py` chỉ tạo khung / `--carry-from`) → **giữ `_internal/build/build_inv.py`**. Vì dữ liệu quét trùng khớp, không chạy lại; inventory chỉ đổi ở `06_OpenQuestions` | — | — |
| O1 | `build-basic-design.py --repo REPO-01=inputs/tokiwagi` (tra nút → handler trong code) · bỏ `build_bd_spec.py` | 149 ô "Cần xác nhận" (115 + 34) · spec 17 + 30 màn | Không spec: 122 ô (60 + 62), code_matched 83 (68 + 15). **Thu gọn spec** — chỉ giữ màn mà spec cũ cho ít ô hơn: WEB-01 2 màn (SC-002, SC-040), WEB-02 28 màn → **86 ô (58 + 28)**, code_matched 61 (57 + 4), 1.190 item |
| Câu hỏi | Xoá Q-037…Q-185 (149 câu O1 cũ, không còn ô nào trỏ tới), dán `questions-WEB-01.csv` (Q-037…Q-094) + `questions-WEB-02.csv` (Q-095…Q-122). Giữ Q-001…Q-036, Q-186…Q-188 | 185 câu | 125 câu |
| PNG | `render-codemap.py` · `build-db-doc.py --erd-png` · `render-flow.py` | chữ Nhật thành ô vuông | chữ Nhật hiện đúng (đã mở `flow.png` kiểm tra) |

Gate (số chép từ script): V-BD WEB-01 19 · 17 PASS · 0 FAIL · 2 WARN · V-BD WEB-02 19 · 17 · 0 · 2 · V-API 13 · 13 · 0 · 0 · V-DB (check 10 `--code-schema`) 10 · 10 · 0 · 0 · V5 9 · 9 · 0 · 0 · V1 11 · 10 · 0 · 1 (EV mồ côi) · V2 30 · 30 · 0 · 0 · V8 16 · 16 · 0 · 0 · V3 16 · 16 · 0 · 0 · V-BIZ 10 · 10 · 0 · 0 (O8 không đổi số, không render lại) · selftest-gates 77 ca · 77 PASS · selftest-docs / selftest-basic-design exit 0 · H06 PII 290 file · 0 phát hiện.

Sơ đồ API / DB trên Figma design (o5-figma §3b — không FigJam, không `generate_diagram`), page FLOW `16779:398`, bên phải Output 2:
- `Sơ đồ DB (ERD) · ver1` https://www.figma.com/design/jjyE9GhFfRZ5VDZU8HFIPv/TOKIWAGI-PJ?node-id=17023-6780 — 25 thẻ bảng (5 nhóm), 323 cột, 22 mũi tên FK.
- `Sơ đồ API (code map) · ver1` https://www.figma.com/design/jjyE9GhFfRZ5VDZU8HFIPv/TOKIWAGI-PJ?node-id=17024-6780 — 17 nhóm màn + 5 nguồn ngoài → 20 nhóm API → 25 bảng; 43 đường màn → API (283 lời gọi), 49 đường API → bảng (lọc ≥ 3 API, ghi chú trên sơ đồ), 5 đường nguồn ngoài.
- Recheck (script quét toạ độ): ngoài section 0 · chồng lấn 0 (ERD 33 khối · code map 167 khối) · tràn chữ 0 · chữ đè chữ 0 · chồng với khối khác trên page 0. Lần vẽ ERD đầu bị thẻ cao cố định → đã xoá section vừa tạo và vẽ lại.
- Output 1 / 2 ver1 không sửa: mã API không đổi số sau khi quét lại.
- O6 render lại với `--figma-links` (chương 4 / 5 / 7 có link; Phụ lục C dùng PNG mới).

Script tạm đã xoá: `_internal/build/scan_repo_wrap.py`, `_internal/build/build_bd_spec.py`. Giữ: `build_inv.py` (không có lệnh chính thức tương đương), `retag_noise.py`, `build_bugs.py`, `add_biz_refs.py`, `append_q.py` (đã tạo dữ liệu đang dùng, giữ để truy vết).

Lỗi kit còn lại sau bản sửa: (a) `build-basic-design.py` chưa tra được nút đầu trang tên tài khoản (WEB-02, hầu hết màn), nút phân trang (SC-066 …), 「戻る」「リセット」「キャンセル」「検索する」「保存する」… → vẫn "Cần xác nhận"; (b) `render-flow.py` để chữ dài tràn ra ngoài khung node trong `flow.png`; (c) không có script gate O5 cho Luồng 1 (README O5 "chưa chạy gate").

## Feedback đã xử lý
| Từ | Nội dung | Đã làm |
|---|---|---|
| chat 28/10/2026 | Chạy lại output, lưu thành v1, lấy lại thông tin chạy cũ, không crawl lại | Như trên |
| chat 28/10/2026 | Vẽ O5 Figma cho ver1 (Output 1, Output 2, sơ đồ API, sơ đồ DB) | Output 1 / 2 xong; API / DB vẽ trên file Figma design 28/10 (lần 3) |
| chat 28/10/2026 | Chạy lại bằng script chính thức của kit, bỏ script tạm; vẽ sơ đồ API / DB vào TOKIWAGI-PJ page FLOW | Mục "Chạy lại 28/10/2026 (lần 3)" |

## Feedback của user

## Chạy lại 28/10/2026 — theo feedback output v1 (6 điểm)

- Snapshot trước khi ghi đè: `_internal/history/20261028-1036/` (11 file).
- O6 Overview: bỏ "Danh sách output", "Luồng tổng quan", Phụ lục A–C; chương 2 = "Nghiệp vụ chính" (hệ thống làm gì · luồng · trạng thái, từ `business.json`); màn hình / API chỉ 1 bảng tổng. Gate V3 14/14 PASS.
- Bỏ chữ cũ triệt để: 123 ô loại câu hỏi → "Thiếu thông tin"; 1 mô tả trường API trích chuỗi code → viết lại bằng lời. Gate mới kiểm mọi kiểu viết hoa / thường.
- Bỏ O8 `08_Business/` (nội dung nghiệp vụ đã nằm ở chương 2 của O6).
- O7 Bug list: 1 sheet `Bug List`, chỉ High / Urgent. 8 lỗi ứng viên cũ (BUG-001…008) đều mức Medium → không đưa vào; sheet chỉ có tiêu đề. Bỏ 288 dòng quan sát kỹ thuật nội bộ (vẫn còn trong `_internal/history/20261028-1036/`). Gate V8 12/12 PASS.
- Bỏ sơ đồ API (code map): xoá `02_API/CodeMap_*`, dòng trong `figma-links.md`, section Figma node 17024:6780.
- O4 Design System giữ nguyên (dùng lại từ ver12); từ nay O4 là tuỳ chọn.
