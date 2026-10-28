# Run log — ver8_191026_CR-002-corporate-limited-page

version_type: CR
baseline: ver1_021026_khao-sat-lan-dau
run_mode: CR (Luồng 2) — CR-002 法人向け商品販売 (① カレンダー折りたたみ A/B · ② 限定公開ページ không / có Option)

## Điều kiện chạy
| Hạng mục | Giá trị |
|---|---|
| CR input | inputs/cr/es_danh_sach_doan_v2/ 2 docx (JP 2026-10-16 + bản VI) → `input/` · S1: 3 file · 0 HIGH (`_internal/s1-cr-input.md`) |
| Mẫu báo giá | inputs/cr/es_danh_sach_doan_v2/【TOKIWAGI様】見積書_団体利用開発_v1_261013.xlsx sheet 提出版_ 詳細見積書_1015 — chỉ lấy bố cục / hệ số / logo, không lấy số liệu |
| Baseline | `version-tool context` gợi ý ver7 (delta, không có inventory) → đối chiếu bằng ver1 inventory + code `inputs/tokiwagi` (read-only) |
| Đơn giá MD | .claude/config/md-unit-rates.json v1 — DRAFT |
| Gate hỏi người | CR-0 / CR-1 / CR-2: user từ chối hộp câu hỏi, yêu cầu làm tiếp → mặc định: mã **CR-002**; điểm mơ hồ ghi CQ-001…012; **không vẽ Figma** |

## Bằng chứng chính (code baseline)
| Phát hiện | File |
|---|---|
| Lịch đặt trước = component dùng chung BookingVacancies (SC-067, SC-050, admin SC-044); số ngày = env NEXT_PUBLIC_ONLINE_BOOKING_ADVANCE_DAYS (mẫu 7), có chế độ 30 ngày + tham số bookingDays | src/components/BookingVacancies/index.tsx · src/constants/booking.ts · .env.example (chỉ đọc tên key) |
| Danh sách vé phía user lọc visibility = true ở API-107 và vacancy-status | src/pages/api/tickets/index.ts · src/utils/server/vacancy-status.ts |
| getTenantTicketsForVacancy dùng chung cho API-074 (đặt trong ngày), cron, POS, hàng chờ → KHÔNG được lọc 限定公開 ở đây | src/utils/server/vacancy-status.ts · src/pages/api/bookings/use-in-day.ts |
| Server tạo booking không kiểm visibility → vé 限定公開 mua được bằng luồng cũ | src/utils/booking-validation.ts |

## Kết quả
| Bước | Kết quả |
|---|---|
| gen_cr_v8.py | cr.json — 33 impact · 14 CQ · 2 not_cr |
| build-cr-impact.py | CR-002_Impact.xlsx — 7 sheet · 実装 26 MD (cộng cả ①-A và ①-B) |
| V-CR | 27 checks · 25 PASS · 0 FAIL · 2 WARN (đơn giá DRAFT · CR-vs-CR với CR-001 trên API-107 / API-050 / API-054 / SC-035…038) |
| gen_eta_vi.py | CR-002_ETA_vi.xlsx — 24 dòng; self-check 実装 theo phương án = cr.json |
| gen_eta_vi.py — sheet Schedule | Mẫu sheet スケジュール (見積書_団体利用_2609.xlsx), dịch VI. Ngày tính từ công số ETA_vi ÷ nhân sự giả định (① 1 dev + 1 test, ② 2 dev + 2 test), bỏ T7/CN, KH nghỉ 3/11. Release sớm nhất: ①-A 28/10 · ①-B 30/10 · ② 10/11 · Option 17/11; không phương án nào kịp 22/10 |
| gen_eta_vi.py — sheet QnA | 14 câu hỏi từ cr.json (thêm CQ-013 kết thúc chương trình, CQ-014 doanh thu riêng) · cột 日本語 để gửi KH · đề xuất Dipro + ảnh hưởng nếu chọn khác · hạn trả lời = mốc Schedule. Impact xlsx build lại: V-CR 25 PASS · 0 FAIL · 2 WARN |
| gen_view_v8.py → render-cr-figma.py | cr-figma.json: 4 lane · 4 group · 7 màn CR-3 · 4 skip → figma-js 01–03 + 04-screens-01..04 |
| Figma (user yêu cầu 'dùng page cũ') | page FLOW, section 16883:398 (y = 67250, dưới CR-001 ver6) · CR-3 vẽ 2 lần gọi (token DS lọc theo tên code dùng) |
| V-CR-FIGMA | 13 checks · 12 PASS · 0 FAIL · 1 WARN (cùng mã ở nhiều lane / group — có chủ đích) · 72 node · 53 mũi tên |

## Sửa trong lần chạy
- V-CR lần 1: 5 FAIL (mockup chưa trỏ DS-component · why_change ngắn · bảng mới dùng ref `—` · Screen UPD trên màn chưa có) → sửa generator, chạy lại 0 FAIL.

## Feedback đã xử lý
- (không có feedback chờ xử lý — version-tool `pending_feedback: []`)

## Sửa kit trong lần chạy
- render-cr-figma.py: tiêu đề Change Table bỏ chữ cứng 'CR-001_Impact.xlsx' → theo mã CR; thêm `change_note` từ cr-figma.json; dòng tiêu đề bảng tự tính theo chiều cao ghi chú (tránh đè). selftest-cr-impact 71 ca · 71 PASS.
- build-cr-impact.py: làm tròn số thực trước khi lưu (59.280000000000015 → 59.28) — H06 từng nhận nhầm chuỗi số dài là số thẻ; build lại xlsx, V-CR vẫn 25 PASS · 0 FAIL · 2 WARN; quét PII 26 file · 0 phát hiện.

- CR-3 chia 2 Section theo site (user 19/10): trên Figma di chuyển node sang `CR-3 Screens · Màn hình người dùng (WEB-02)` (16890:398) và `… quản trị (WEB-01)` (16890:401), xoá khung CR-3 cũ (đã rỗng); V-CR-FIGMA vẫn 12 PASS · 0 FAIL. Kit: render-cr-figma.py tự tạo Section theo site + sắp màn người dùng trước, dời section dưới khi section trên lớn ra; cr-view.md ghi quy tắc.

## Chưa làm
- Bảng đơn giá MD chưa APPROVED.

## Chạy lại 19/10 — áp giải pháp S1–S12 (review Estimation AI vs FINAL)
User yêu cầu sửa trực tiếp ver8 (không tạo version mới) cho `CR-002_ETA_vi.xlsx` + `CR-002_Impact.xlsx`.

| Bước | Kết quả |
|---|---|
| gen_estimate_v8.py | `_internal/estimate.json` — 20 dòng chức năng (user 9 · quản trị dùng chung SA / Admin 6 · common 5), song ngữ ja / vi, 7 pattern, 9 tổ hợp. Phương án thay thế thành dòng riêng: ①-A / ①-B, ② trang mới / ②-S. Mockup không thành dòng; IMPACT gom vào 2 dòng hồi quy |
| build-estimate.py | **mới** `CR-002_見積書.xlsx` (詳細見積書 + 前提条件・留意事項, tiếng Nhật) — Step 1 36.6 · Step 2 19.11 · toàn bộ 55.71 人日 (gồm cả phương án thay thế — tổng thật theo bảng phương án) |
| V-EST (ja) | 8 checks · 7 PASS · 0 FAIL · 1 WARN (function-rates DRAFT) |
| gen_eta_vi.py | `CR-002_ETA_vi.xlsx` dựng lại từ estimate.json (bản vi nội bộ + cột Impact / căn cứ) · Schedule tính lại: release ①-A / ①-B 28/10 · ② 13/11 · Option 19/11 · QnA giữ 14 câu |
| V-EST (vi) | 8 checks · 7 PASS · 0 FAIL · 1 WARN |
| build-cr-impact.py --estimate | `CR-002_Impact.xlsx` — sheet Estimation = 1 dòng / chức năng; Summary 実装 = 25.75 MD theo chức năng (đối chiếu theo impact 26 MD), 総工数 / 人月 / Step 1 / Step 2 link cột 小計 |
| V-CR --estimate | 27 checks · 25 PASS · 0 FAIL · 2 WARN (như cũ: đơn giá DRAFT · CR-vs-CR với CR-001) |

Số cũ → mới (人日): ①-B 5.79 → 4.32 · ①-A 3.51 → 3.18 · ② 24.87 → 27.72 · Option 18.87 → 19.11 · ①-B + ② 30.66 → 32.04. Khác do đổi cách tính (theo chức năng, hệ số theo loại dòng, bỏ dòng Mockup, ② thêm dòng ẩn ở màn khách thường 3 MD theo FINAL dòng 28).
Figma (section 16883:398) **không vẽ lại** — Change Table vẫn ghi số theo impact.

Sửa kit: `extract-mitsumori-template.py` + `templates/template_mitsumori.xlsx` · `config/function-rates.json` (DRAFT, hiệu chỉnh từ FINAL CR-001; golden test bắt 1 dòng `from` sai → sửa) · `estimate_core.py` · `build-estimate.py` · `verify-estimate.py` · `selftest-estimate.py` (23/23 PASS) · `build-cr-impact.py` / `verify-cr-impact.py` thêm `--estimate` (selftest-cr-impact 71/71 PASS) · `build-version-index.py` thêm dòng 見積書 · `sys-agent/estimate-rules.md` · flow-2 / change-request / system-analyst / AGENTS.md (bước 5b, CR-4, V-EST).
`verify-estimate.py --scan-only` trên 見積書 FINAL CR-001: E3 FAIL — dòng 全ての機能 `SUM(J19:J106)` bỏ sót dòng 18 và 107–146 (báo PM).

## Chạy lại 20/10 — bổ sung màn CR-3 (feedback: chưa có màn mở đủ 1 tháng)
Feedback: mô tả màn ①-B ghi "もっと見る mở đủ 1 tháng · 閉じる thu lại · PC lưới + mobile danh sách · ngày chọn ngoài tuần đầu → tự mở" nhưng chưa có màn tương ứng; rà soát các case còn thiếu.

| Bước | Kết quả |
|---|---|
| gen_view_v8.py | +10 màn CR-3 (17 màn tổng) → `cr-figma.json`; phần bổ sung riêng `cr-figma-add-201026.json` |
| Màn người dùng (section 16890:398) | ①-B mở 1 tháng PC (16909:400) · ①-B tự mở khi ngày chọn ngoài tuần đầu (16909:708) · ①-B mobile 7 ngày (16909:957) · ①-B mobile mở 1 tháng (16909:1083) · ①-A lịch đã mở (16910:400) · 限定公開 khoá sai / trang dừng 404 (16910:660) · 限定公開 chưa có sản phẩm (16910:737) |
| Màn quản trị (section 16890:401) | 限定公開ページ 登録 / 編集 Option (16911:400) · lỗi nhập ページ名 (16911:526) · 商品管理 lỗi chưa chọn 掲載先ページ Option (16911:646) |
| V-CR-FIGMA | 13 checks · 12 PASS · 0 FAIL · 1 WARN (như cũ) · 82 node · 17 màn đề xuất |

Giả định cần xác nhận (ghi ở panel "Chờ xác nhận" từng màn): khung mobile 375px (Design System chỉ đo 1440px — chờ designer) · hành vi "tự mở khi ngày chọn ngoài tuần đầu" là đề xuất Dipro · message 404 / trạng thái rỗng là đề xuất (chưa thấy trang 404 chung của WEB-02).
Không vẽ: toast lỗi tải 30 ngày (ghi ở ERROR SCENARIOS) · màn 限定公開 mở 1 tháng (dùng chung component với 店舗詳細 — giống màn 16909:400).
Kit: render-cr-figma.py thêm shell `mobile` (khai `viewport_width` + `viewport_note` khi DS chưa có token `viewport-mobile`); tiêu đề card tự xuống dòng. Section Figma đã đổi tên (bỏ hậu tố "baseline ver1 → ver8") — JS bổ sung dùng tên mới.

## Sửa 20/10 — CQ-005 hỏi lại điều KH đã chốt
User chỉ ra: 見積依頼 ② đã ghi rõ 基本機能「限定公開URLのページを1つ設ける」 và Option 「A・B・Cなど複数作成し、それぞれのURLを発行」 → câu "1 URL chung hay mỗi 施設 1 URL" là thừa.
- CQ-005 viết lại: số trang / URL đã chốt; chỉ còn hỏi cách hiển thị sản phẩm của nhiều 施設 trong 1 trang (chọn 施設 — đề xuất — hay liệt kê hết). Bản JA ở sheet QnA cũng đổi.
- ②-S (dùng lại 店舗詳細, mỗi 施設 1 URL) ghi rõ **lệch yêu cầu "1 trang"** — chỉ dùng nếu KH chấp nhận (cr.json recommendation, 見積書 / ETA_vi dòng 簡易案, tiền đề).
- Build lại: CR-002_Impact.xlsx (V-CR 25 PASS · 0 FAIL · 2 WARN) · CR-002_見積書.xlsx + CR-002_ETA_vi.xlsx (V-EST 7 PASS · 0 FAIL · 1 WARN mỗi bản) — công số không đổi.
- Figma: sửa chữ node Edge CR-2 (16884:531) + panel "Chờ xác nhận" màn 限定公開 (16886:960); archify HTML: dòng "Cần KH xác nhận".

## Bổ sung 20/10 — screen flow quản trị → trang giới hạn + sơ đồ quan hệ
- Figma section mới 16920:398 (page FLOW, x 20600, ngoài section CR-002): 3 làn (quản trị tạo trang · quản trị gán sản phẩm + gửi link · khách doanh nghiệp), 9 bước, 7 màn (ảnh thu nhỏ clone từ mockup CR-3, đã xoá plugin data `kind` để không lẫn vào readback CR-002). Chỉ luồng chính, bỏ kiểm tra hồi quy / màn lỗi theo yêu cầu. Tiếng Việt (font Inter).
- PNG `05_Figma/CR-002_quan-he-san-pham-trang-gioi-han.png`: mô hình dữ liệu · ví dụ · cây quyết định "sản phẩm hiện ở đâu" (đánh dấu đề xuất / chờ KH). Sửa theo feedback: bỏ bảng trường hợp, phóng to cây quyết định (full chiều ngang).
- Đề xuất format URL (trả lời trong chat, dựa trên route baseline WEB-02): `/limited/{khoá}` — chưa đưa vào cr.json.

## Sửa 20/10 — Option: 1 sản phẩm hiển thị được ở nhiều trang (quyết định của Dipro, chờ KH xác nhận CQ-010)
- cr.json: IMP-031 cột tickets.limited_page_id → bảng liên kết ticket_limited_pages (DB-TBL-NEW); IMP-035 chọn nhiều trang (SCR-UPD-M); IMP-033 / IMP-037 rule cập nhật; CQ-010 đổi thành câu xác nhận đề xuất.
- estimate.json: dòng 掲載先ページ選択 SETTING-FIELD-S → SETTING-FIELD (複数選択可); dòng DB ghi bảng liên kết; confirm form trang ghi 1 sản phẩm nhiều trang.
- Số: ② Option 19.11 → 20.25 人日 · ①-B + ② có Option 51.15 → 52.29 · lịch release không đổi (Option 19/11).
- Build lại Impact (V-CR 25 PASS · 0 FAIL · 2 WARN), 見積書 + ETA_vi (V-EST 7 PASS · 0 FAIL · 1 WARN mỗi bản); QnA CQ-010 VI + JA mới.
- Figma: ô 「掲載先ページ（Option・複数選択可）」 ở mockup SC-036 (2 màn) + ảnh thu nhỏ trong screen flow 16920:398, bước ⑤, panel mô tả; PNG quan hệ đổi sang nhiều – nhiều.
- 20/10: PNG đổi "Trạng thái công khai" → "Trạng thái đăng (ô có sẵn 公開ステータス, cột tickets.visibility): Đăng / Ẩn" để không lẫn với "Hiển thị giới hạn".

## Sửa 20/10 — CR-002_ETA_vi.xlsx viết lại cho dễ đọc (feedback: khó hiểu, lẫn tiếng Nhật)
- Sheet ETA_vi: viết lại toàn bộ tiếng Việt theo kiểu bản FINAL (Hạng mục lớn / vừa / nhỏ + "Nội dung dự kiến:" gạch đầu dòng + tiền đề cần xác nhận); bỏ chữ Nhật (限定公開 → "giới hạn", 店舗詳細 → "chi tiết cửa hàng", 公開区分 → "loại bán"…); bỏ 2 cột nội bộ Impact / căn cứ mã đơn giá (vẫn có ở sheet Estimation của Impact.xlsx); nhãn phương án đọc được ("① Phương án B", "② Dùng chung"…); tên section không còn mã WEB-xx.
- Sheet Tiền đề · Lưu ý, Schedule: dịch hết (thứ trong tuần T2…CN, tên công đoạn, ghi chú).
- Sheet QnA: chỉ còn 11 câu nghiệp vụ, tiếng Việt, không mã kỹ thuật (bỏ cột tiếng Nhật). CQ-003 (giao diện nút), CQ-011 (thiết kế), CQ-012 (môi trường / lịch nghiệm thu) chuyển ra — vẫn ở sheet Q&A của CR-002_Impact.xlsx.
- Bản tiếng Nhật CR-002_見積書.xlsx không đổi nội dung. Số công không đổi. Gate: V-EST vi/ja 7 PASS · 0 FAIL · 1 WARN; V-CR 25 PASS · 0 FAIL · 2 WARN.
- Kit: estimate_core.py — ghi chú cuối bảng bản vi dịch hết tên công đoạn; header "Thiết kế UI / UX". selftest-estimate 20/20 PASS.
- 20/10: PNG bỏ bước "Đã chọn ít nhất 1 trang?" (feedback: tạo sản phẩm trước, rồi gán sản phẩm vào trang từ màn trang giới hạn — không có case sản phẩm chưa gán). Mô hình A ghi thứ tự làm. Chưa đổi xlsx / Figma (vẫn ghi chọn trang ở form sản phẩm) — chờ user quyết.

## Sửa 20/10 — văn phong cho khách (feedback: chữ trong output khó hiểu, trừu tượng)
- Kit: thêm `sys-agent/writing-style.md` (10 quy tắc theo 見積書 FINAL: viết theo điều người dùng thấy, nhãn 【想定する対応内容】 / 【提案する対応方法】 / 【見積もり前提・確認事項】 + gạch đầu dòng, không mã nội bộ, bản Việt dịch đầy đủ, câu hỏi khách chỉ nghiệp vụ). estimate_core: `estimate.json → questions` → kit tự sinh sheet 確認事項 / Câu hỏi nghiệp vụ; gate V-EST thêm E9 (chữ Nhật sót trong bản Việt, WARN), E10 (nội dung quá ngắn / không cấu trúc, WARN), E4 áp cả bản Việt không nội bộ (mã nội bộ = FAIL). selftest-estimate 24/24 · selftest-cr-impact 77/77. Đã đồng bộ kit gốc.
- ver8: cột 改修内容 bản Nhật viết lại theo kiểu FINAL (20 dòng); câu hỏi gửi khách chuyển vào estimate.json (10 câu, bỏ mã CQ khỏi file gửi); Schedule bỏ mã CQ.
- CQ-013 (kết thúc chương trình) bỏ khỏi câu hỏi khách theo feedback user → ghi thành tiền đề: dùng lịch bán (ngày kết thúc) / trạng thái đăng có sẵn, không làm tự ẩn theo ngày; cr.json CQ-013 = Closed.
- Gate: V-EST ja 8 PASS · 0 FAIL · 1 WARN; vi 9 PASS · 0 FAIL · 1 WARN; V-CR 25 PASS · 0 FAIL · 2 WARN.
- Làm lại UI output #3 (clone UI thật FINAL UI User / Admin): đang tạm dừng — lần chạy thử bị lỗi và đã được Figma huỷ, chưa thay đổi gì trên file.
- 20/10: CQ-013 xoá hẳn khỏi cr.json (Impact Q&A còn 13 câu); CQ-010 bỏ ý "thời hạn trang" (cùng lý do: dùng lịch bán / trạng thái đăng có sẵn). Figma: sửa 3 panel "Chờ xác nhận". Gate: V-CR 25 PASS · 0 FAIL · 2 WARN; V-EST ja 8/0/1, vi 9/0/1.

## Làm lại UI output #3 (CR-3) — 20/10 (feedback khách: flow đúng, UI xấu)
- 17 màn CR-3 dựng lại bằng **clone UI thật của designer** trong file Figma (FINAL UI User U8.2 店舗一覧詳細 PC 2224:384746 + SP 3395:429743; FINAL UI Admin S6.1 商品管理, S6.3 新規商品登録, S9.1 / S9.2 お知らせ管理 làm mẫu cho màn quản lý trang giới hạn, popup S6.8), chỉ sửa phần CR đổi; khoanh thay đổi bằng khung nét đứt + nhãn số khớp bảng ITEMS (không phủ lên UI). Lịch mở 1 tháng theo bố cục mẫu ES-Kitchen (user gửi): lưới 7 cột, ngày tháng sau tô xám, ngày đang chọn viền xanh.
- Phát hiện: lịch mobile thật là **lưới 7 ngày** như PC (mockup cũ đoán dạng danh sách) → sửa mô tả + cr-figma.json; khung 375px là thiết kế thật, không còn là giả định.
- Bố cục theo quy định mới: CR-3 = site (nền #9DA5AD) → flow (G-CR1 / G-CR2 / G-CR4) → màn; **CR-2 Screen Flow vẽ lại tách 2 section theo site** (16958:6780 người dùng · 16958:7114 quản trị). Xoá 2 section CR-3 cũ (16890:398 / 401) và khung CR-2 cũ. Bảng thống kê cập nhật số theo cr.json mới (実装 27.25 MD).
- V-CR-FIGMA: 14 checks · 12 PASS · 0 FAIL · 2 WARN (6: trùng REF có chủ đích; 10: màu thật của designer chưa có token DS — #dbdbdb, #ffe100 (WEB-02), #4c4e64, #676a6c, #ebebeb, #595959, #eed200… → nên bổ sung Design System).
- Kit: verify-cr-figma check 10 — mockup clone UI thật (`crkit:src`) có màu ngoài DS → WARN; renderer readback đọc `src`, bỏ khung CR-2 khỏi danh sách "thiếu badge"; cr-view.md ghi quy tắc ưu tiên clone UI thật. selftest-cr-impact 78/78.

## 20/10/2026 — CR-1 / CR-2 vẽ lại theo feedback Output 1 / Output 2 (use case · site → use case → section)
- `gen_view_v8.py`: CR-1 viết lại dạng use case (node `type` actor / start / step / decision / ng / end, `pos`, `row`, `result`), API / cột DB / hệ thống ngoài chuyển sang `tech` (7 mục); tên group CR-2 = tên use case. Bản cr-figma.json trước: `_internal/cr-figma.before-usecase-201026.json`.
- `render-cr-figma.py --redraw cr1,cr2` → `_internal/figma-js-usecase-201026/` (SECTION_NAME sửa tay khớp tên section hiện có, như các lần trước).
- Figma: bản cũ CR-1 (`16883:413`) + CR-2 (`16958:6780`, `16958:7114`) clone sang section LƯU TRỮ `16962:6780` rồi gỡ khỏi section CR · CR-1 mới `16963:6780` (4 lane, 61 node) · CR-2 mới `16964:6780` (người dùng, 3 Section use case) + `16964:7117` (quản trị, 1 Section use case) · xếp lại thứ tự CR-1 → CR-2 → Change Table → CR-3 · đổi tên Section flow CR-3 theo tên use case.
- Readback (`_internal/readback/usecase-201026-part0..2.json` → `cr-figma-nodes.json`, bản trước: `readback/cr-figma-nodes-201026-before-usecase.json`): 85 node · 47 mũi tên.
- V-CR-FIGMA: **14 checks · 12 PASS · 0 FAIL · 2 WARN** (6 trùng ref — màn biến thể; 10 màu thật chưa có token DS — có từ trước).
- 20/10: PNG quan hệ sản phẩm ↔ trang — bỏ nhánh «Trạng thái đăng = Ẩn» và dòng «Trạng thái đăng» trong khối Sản phẩm (user: không có trường này). Cây quyết định bắt đầu từ «Hiển thị giới hạn = OFF?».
- 20/10 (user yêu cầu): xoá trên Figma Output 1 ver7 (16779:399), Output 2 ver1 (16779:1064), section lưu trữ CR-1/CR-2 (16962:6780). Tách 2 section CR-3 ra khỏi section CR-002, đặt cạnh Output 1 / 2 mới (tên `CR-002 · CR-3 Screens · …`, plugin data `crkit.cr`); readback gom thêm section mang `crkit.cr` → 85 node / 47 mũi tên (giống trước) · V-CR-FIGMA 14 checks · 12 PASS · 0 FAIL · 2 WARN.

## 20/10/2026 — ETA FINAL + Schedule mới
- Nguồn: Google Sheet "KIDO-B-Vedoan" (sửa lúc 2026-10-20 03:30 UTC) tải bằng gws-drive → `inputs/cr/es_danh_sach_doan_v2/KIDO-B-Vedoan_ETA_FINAL_201026.xlsx` (S1 sạch).
- `CR-002_ETA_vi.xlsx`: sheet `ETA_vi` = nguyên bản FINAL (giữ công thức, style); `Tiền đề · Lưu ý` · `Câu hỏi nghiệp vụ` giữ như cũ; `Schedule` sinh lại từ dòng tổng FINAL (`gen_eta_vi.py`, kiểm 小計 = 5 công đoạn). Bản trước: `_internal/CR-002_ETA_vi.before-final-201026.xlsx`.
- Công số FINAL (人日): ①-A / ①-B 8.4 · ② không Option 21.87 · ② có Option 59.28 (trọn gói, thay ② không Option) · ①-B + ② không Option 30.27 · ①-B + ② có Option 67.68.
- Schedule: đặt hàng ① 21/10 · ② 22/10 → release ① 4/11 · ② không Option 10/11 · ② có Option 1/12 (chưa phương án nào kịp 22/10).
- Chưa đồng bộ: `CR-002_見積書.xlsx` và sheet Estimation của `CR-002_Impact.xlsx` vẫn theo `estimate.json` cũ (Option 20.25 cộng thêm) — lệch với FINAL.
- 20/10 (sửa theo user): Schedule bắt đầu 26/10 (T2), làm xong ① (lập trình + kiểm thử) mới sang ②. Đặt hàng ① 23/10 · ② 2/11 → release ① 6/11 · ② không Option 23/11 · ② có Option 14/12.
- 20/10 (sửa theo user): thời gian Dipro làm cố định ① 1 tuần · ② không Option 2 tuần · ② có Option 4 tuần (chia ngày theo tỉ lệ công từng công đoạn) · bắt đầu 26/10, ① xong mới tới ② (② bắt đầu 2/11). Release ① 5/11 · ② không Option 19/11 · ② có Option 3/12. Để kịp: ① 2 dev + 2 test · ② không Option 2 + 2 · ② có Option 3 + 3.
- 20/10: user báo CR-002 đã duyệt → baseline mới ver11_201026_baseline-cr002 (①-B + ② cơ bản; Option chờ xác nhận). Sheet Schedule của ETA_vi = bản team trên Google Sheet (release ① 5/11 · ② 19/11 · ② có Option 30/11); công số ETA không đổi so với bản tải lúc trước.
