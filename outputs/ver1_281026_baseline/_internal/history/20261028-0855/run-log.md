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
| Figma | input: — · output: TOKIWAGI-PJ (kế thừa) — **O5 chưa vẽ lần này** |
| Budget crawl | Không crawl. Crawl kế thừa: WEB-01 269/200 URL (vượt, ghi ở ver12) · WEB-02 90/200 URL |
| Preflight | `outputs/_project/preflight-memory.json` nạp từ `00_Meta` / README / run-log ver12 (nguồn "kế thừa ver12", người dùng xác nhận 28/10/2026). Câu còn thiếu: 0 |

## Discovery Brief (kế thừa ver12 — người dùng xác nhận "lấy lại dữ liệu cũ")
| Quyết định | Giá trị | Ghi chú |
|---|---|---|
| B1 Số Design System | 2 bộ riêng (WEB-01 quản trị · WEB-02 người dùng) | `extract-design-tokens.py --code-only` ra `single` vì 2 site chung 1 repo CSS → không phân biệt được bằng code; giữ quyết định ver12 (dựa trên crawl) |
| B2 Output làm | O1–O4, O6–O9 · O5 bước sau | — |
| B3 Repo legacy | Không có | — |
| B4 Phạm vi | 2 website · role như ver12 | — |
| B5 Đưa sơ đồ lên Figma | Đồng ý — kế thừa ver12 | Chưa vẽ ở lần này |

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
| `scan-repo.py` (FULLSTACK) — **qua wrapper né lỗi, xem mục Lỗi script** | 143 API · 93 route FE · 158 lời gọi API từ FE · **283 cạnh màn → API (static 283, khớp API ID 283)** · 72 màn có gọi API · 6 API đọc được role · 0 batch |
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
| V3 Overview | 16 checks · 16 PASS · 0 FAIL · 0 WARN |
| V9 self-test | selftest-gates 70 ca · 70 PASS · 0 FAIL · selftest-docs / selftest-basic-design exit 0 |
| H06 PII scan | 230 file · 0 phát hiện (lần cuối, sau khi ghi run-log + README) |

## Diff so với ver12 (tham khảo — ver12 nằm ở `_backup/`)
| Hạng mục | ver12 | ver1 |
|---|---|---|
| Màn | 94 (gồm SC-094 CR-002) | 93 (WEB-01 45 · WEB-02 48) |
| API | 143 (10 API thêm tay) | 143 (đọc từ code; ID đánh lại theo path — bảng đối chiếu `id-map-ver12.csv`) |
| Bảng / cột | 25 / 324 | 25 / 323 (đọc lại từ Prisma + migration) |
| Màn → API | suy từ chuỗi import (có thể dư) | đồ thị gọi FE → API: 283 cạnh |
| Ô chưa có căn cứ ở O1 | 37 ô "UNKNOWN" (18 + 19) — bản cũ không có cột "API gọi", không đối chiếu từng nút | 149 ô "Cần xác nhận — Q-xxx" (WEB-01 115 · WEB-02 34) trên 1.472 item, mỗi ô có câu hỏi Q-037…Q-185 |
| Bug | 0 Bugs · 0 Suspected · 296 Observations | 0 Bugs · 8 Suspected · 288 Observations (8 mục "trước đây là bug" trả về Suspected theo quy tắc mới 27/10) |

## Lỗi script gặp phải (KHÔNG sửa kit — đã né, cần sửa ở kit)
| # | Script | Lỗi | Cách né lần này |
|---|---|---|---|
| 1 | `scan-repo.py` `resolve_js_import` | Không hiểu import kiểu `baseUrl: ./src` (`import … from "services/…"`) → **0 cạnh màn → API** | Wrapper ngoài kit (`_internal/build/scan_repo_wrap.py`) thay hàm lúc chạy: thử thêm `src/<spec>` |
| 2 | `scan-repo.py` `url_from_arg` | Template `` `${APIs.X}/${id}` `` bị bỏ phần đầu → path `/:id`; hằng số trùng tên giữa file bị loại khỏi bảng hằng | Wrapper: ưu tiên hằng số trong cùng file |
| 3 | `scan-repo.py` `sensitive_reason` | Không đọc phân loại S1 trong `preflight-memory.json` → bỏ 24 file src (10 API auth, 12 màn) dù người dùng đã phân loại báo nhầm | Wrapper: chỉ mở lại file có phân loại "[A] Báo nhầm" và lý do `name-keyword`; env / key / dump / config vẫn chặn |
| 4 | `build-basic-design.py` | Ghép ảnh crawl bằng `evId == Screenshot EV` nguyên chuỗi → ô nhiều EV không khớp, màn mất item web | Sửa dữ liệu inventory về đúng spec (1 EV / ô) |
| 5 | `build-basic-design.py` | Nhãn nút chứa giá trị ngày (`Choose date, selected date is …`) vào thẳng O1 | Spec đổi nhãn thành `Choose date` |
| 6 | `render-codemap.py` · `build-db-doc.py` · `render-flow.py` | Font DejaVu thiếu chữ Nhật → ô vuông trong PNG | Chưa né — PNG dự phòng có thể mất chữ Nhật |
| 7 | `build-version-index.py` | `--skip "O5=…"` bị bỏ qua khi có `05_Figma/figma-links.md` → README ghi O5 "⚠️ chưa chạy gate" | Ghi chú thêm ở cuối README |
| 8 | `build-basic-design.py` | Nút không khớp nhãn với `fe-api-calls.csv` (icon `update` / `delete`, phân trang, chọn ngày…) đều thành "Cần xác nhận" | Spec `_internal/bd/<WEB>.json` sinh từ code (`_internal/build/build_bd_spec.py`, mọi mô tả có code-ref) → giảm từ 1.010 xuống 149 ô |

## Không chạy / bị chặn
| Output | Lý do |
|---|---|
| O5 Figma | Người dùng chỉ định làm ở bước sau. `05_Figma/figma-links.md` đã liệt kê sơ đồ cần vẽ (chưa có link) |
| Ảnh màn trong O1 | Chưa đánh số ảnh (`annotate-ui-image.py` cần toạ độ item, crawl cũ không có) → `NO IMAGE — text only` |

## Feedback đã xử lý
| Từ | Nội dung | Đã làm |
|---|---|---|
| chat 28/10/2026 | Chạy lại output, lưu thành v1, lấy lại thông tin chạy cũ, không crawl lại | Như trên |

## Feedback của user
