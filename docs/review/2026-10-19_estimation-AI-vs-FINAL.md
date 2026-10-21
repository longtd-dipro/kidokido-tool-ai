# Review — sheet Estimation do kit sinh (CR-001 ver6) so với bản 見積書 FINAL gửi KH

- Bản AI: `outputs/ver6_141026_CR-001-group-booking-r3/CR-001_Impact.xlsx` › sheet `Estimation`
- Bản FINAL: `inputs/cr/est_danh_sach_doan/final/ETA_FINAL_【TOKIWAGI様】見積書_団体利用開発_v1_261013.xlsx` › sheet `提出版_ 詳細見積書_1015` (+ `前提条件・留意事項`)
- Kết luận CEO: Estimation của AI **không dùng được**. Tài liệu này ghi lý do và đề xuất sửa kit (chờ xác nhận, chưa làm).

## 1. Số liệu so sánh

| | Bản AI (ver6) | Bản FINAL | Ghi chú |
|---|---|---|---|
| Đơn vị 1 dòng | 1 hạng mục kỹ thuật (API, cột DB, rule, "kiểm lại"…) | 1 chức năng nghiệp vụ (màn × thao tác) | |
| Số dòng có công số | 81 | 126 | |
| Nhóm (section) | 9 mục theo yêu cầu CR-001.1…9 | 4 nhóm theo **site / người dùng**: ユーザー予約サイト (54 dòng) · 運営管理サイト SUPER ADMIN (46) · 施設管理サイト ADMIN (22) · 全システム DB (4) | |
| 実装 tổng | 114.75 MD | 190.75 MD | FINAL ≈ 1.66 lần |
| 総工数 | 261.63 人日 | 428.91 人日 | tính lại theo công thức từng dòng |
| Chia giai đoạn | 最小改修案 / 拡張案 (cột option True/False), cột step **để trống** | **Step 1 / Step 2** + 必須◉ / オプション◯ (Step1 106.25 · Step2 84.5 MD) | |
| Cột 流用可否 | "Tái sử dụng / Phát triển mới" (tiếng Việt) | 新規開発 72 · 一部流用 50 · 要確認 4 | |
| Ngôn ngữ | Việt + Nhật lẫn; có mã nội bộ IMP-xxx, API-xxx, CQ-xxx, "Chờ CQ", "Xung đột UNKNOWN" | Nhật thuần, văn phong 見積書; câu hỏi viết dạng 【見積もり前提・確認事項】 | |
| Sheet đi kèm | Summary · Screen · API · Database · Figma · Q&A (nội bộ) | 前提条件・留意事項 (前提条件 · 既存システムへの影響 · クライアント側で事前に決定が必要な事項 · 想定されるリスク) | |

## 2. Lý do không dùng được

| # | Vấn đề | Bằng chứng | Nguyên nhân trong kit |
|---|---|---|---|
| L1 | **Sai đơn vị dòng** — KH đọc theo chức năng / màn hình, AI liệt kê đối tượng kỹ thuật | AI: "IMP-001 · Hệ thống (UPD) · API-107 · API danh sách vé (user)". FINAL: "団体予約 › 既存の一般予約ページの更新 › 団体向け商品を表示しない…" | `build-cr-impact.py` sinh Estimation trực tiếp từ `impacts` (1 dòng / impact) |
| L2 | **Sai cách nhóm** — không tách site người dùng / Super Admin / Admin; cùng một thao tác ở SA và Admin là 2 dòng công số riêng trong FINAL | FINAL có 予約変更・キャンセル ở cả SA (rows 96–105, 10.75 MD) và Admin (rows 129–138, 6.5 MD); AI gộp 1 dòng "API-111;API-013" | Section = `cr_item` (mục yêu cầu), không có khái niệm site / role |
| L3 | **Thiếu chức năng** — nhiều nhóm việc FINAL có mà AI không có dòng tương ứng | メール通知 9 mẫu (12 MD) · quản lý thẻ tín dụng 1 / nhiều tài khoản (14 MD) · キャンセル料 共通 / 商品別 (10 MD) · CSV 団体 / 予約 · リマインド通知 · 領収書 一覧 / 無効化 | Phân tích theo trục kỹ thuật, không phân rã yêu cầu thành chức năng × thao tác (一覧 / 詳細 / 登録 / 編集 / 削除 / CSV / mail) |
| L4 | **Phương án thay thế không hiện ra** — FINAL viết mỗi phương án 1 dòng (1団体1アカウント ◉ vs 複数アカウント ◯; 即時確定 ◉ vs 管理者承認 ◯; キャンセル料 共通 vs 商品別) để KH chọn | AI chỉ có cờ option True/False + câu hỏi CQ, KH không thấy chênh lệch từng phương án | cr.json không có cấu trúc "phương án A/B" |
| L5 | **Cách tính công không giống người làm** — đơn giá theo đối tượng (API-NEW 1 MD bất kể độ khó, cột DB 0.25…) cho số quá thấp với chức năng phức tạp | 領収書 PDF: FINAL 4 + 1.5 + 1 + 3 MD; AI tính rải theo API / bảng / màn | `md-unit-rates.json` (DRAFT) theo đối tượng kỹ thuật, chưa hiệu chỉnh theo dữ liệu thật |
| L6 | **Tính đôi / tính sai chỗ** — dòng Mockup (11.5 MD) nằm trong 実装 trong khi cột UI/UX đã nhân hệ số; dòng "IMPACT – kiểm lại" (9.25 MD) đứng như việc lập trình | AI: "Thiết kế giao diện (NEW) … UI-NEW × 6 = 3 MD" ở cột 実装 | Mọi trục (kể cả Mockup, IMPACT) đều thành dòng Estimation |
| L7 | **Hệ số công đoạn áp đều** | FINAL: UI/UX ×0.3 cho màn mới lớn (3 dòng), ×0.2 sửa màn, "-" cho DB / mail / CSV (23 dòng); 要件定義 "-" cho DB; dòng chức năng có sẵn (L=0) ghi cố định 0.5. AI: mọi dòng ×0.2 / 0.2 / 0.5 / 0.2 | Template chỉ có 1 bộ hệ số |
| L8 | **Không gửi KH được** — mã nội bộ, tiếng Việt, ghi chú "Chờ CQ-0xx", "Xung đột UNKNOWN", cột "Căn cứ 実装 (mã đơn giá × số lượng)"; 有効期限 "—" | Cột G/Q của sheet AI | Estimation vừa làm báo cáo nội bộ vừa định làm 見積書 |
| L9 | **Thiếu sheet tiền đề** — FINAL có 前提条件・留意事項 4 khối; AI không có | — | Kit không sinh sheet này |
| L10 | **Template cũ** — kit bóc từ 見積書(VN) bản 26/09 (cột QA/Note, option); bản FINAL 13/10 đổi layout (流用可否 · 必須/オプション · STEP, tổng theo Step) | `templates/template_estimation.xlsx` _meta: source `…_2609.xlsx` | Chưa bóc lại template khi mẫu công ty đổi |

**Phát hiện thêm trên bản FINAL (để kiểm, không phải lỗi của AI):** dòng 「全ての機能」 dùng `=SUM(J19:J106)` — bỏ sót dòng 18 và dòng 107–146 (メール通知, ADMIN, DB). Tổng "全ての機能" trong file đã gửi **thấp hơn thực tế**. Gate mới nên bắt lỗi dải công thức kiểu này.

## 3. Đề xuất bổ sung kit (chờ xác nhận)

| # | Giải pháp | Sửa ở đâu | Giải quyết |
|---|---|---|---|
| S1 | Tách 2 lớp: giữ `CR-<id>_Impact.xlsx` (nội bộ, gate V-CR như hiện tại) + **deliverable mới `CR-<id>_見積書.xlsx`** cho KH, sinh từ file trung gian mới `_internal/estimate.json` (dòng = chức năng), mỗi dòng giữ link sang impact ID ở bản nội bộ | flow-2 · `build-estimate.py` (mới) · inventory schema | L1 L8 |
| S2 | Bóc lại template từ bản FINAL (sheet 提出版_詳細見積書 + 前提条件・留意事項): cột 流用可否 · 必須◉/オプション◯ · STEP; tổng Step1 / Step2 / 全体 / 人月; cho phép bóc template từ bất kỳ 見積書 mới (dò cột theo header, không cố định vị trí) | `extract-estimation-template.py` · `templates/` | L10 |
| S3 | Quy tắc phân rã chức năng (tài liệu + check): nhóm theo **site / role** (ユーザー予約サイト / 運営管理サイト SA / 施設管理サイト ADMIN / 全システム) · mỗi màn × thao tác (一覧 / 詳細 / 登録 / 編集 / 削除 / CSV / 承認) · mail template mỗi loại 1 dòng · cùng thao tác ở 2 site = 2 dòng | `sys-agent/estimate-rules.md` (mới) | L2 L3 |
| S4 | Phương án thay thế thành dòng riêng: `variant_of` + `◉ / ◯` + Step, bảng tổng theo tổ hợp (như CR-002 ETA_vi) | estimate.json schema · builder | L4 |
| S5 | Bảng công số theo **chức năng** (`function-rates.json`) hiệu chỉnh từ 126 dòng FINAL CR-001 (vd. màn list có tìm kiếm, form đăng ký, CSV, mail template, PDF, tích hợp GMO…), có khoảng min–max; giữ `md-unit-rates.json` cho phân tích impact nội bộ. PM duyệt trước khi dùng | `config/function-rates.json` (mới) | L5 |
| S6 | Không đưa Mockup / IMPACT thành dòng 実装: Mockup → cột UI/UX; IMPACT → 1 dòng 「既存機能への影響調査・回帰テスト」 hoặc vào テスト | builder | L6 |
| S7 | Hệ số theo loại dòng: UI ×0.3 màn mới lớn / ×0.2 sửa / "-" không có UI; 要件定義 "-" cho DB; dòng dùng lại chức năng có sẵn = giá trị cố định nhỏ | template _meta + builder | L7 |
| S8 | File KH tiếng Nhật thuần: không mã nội bộ; câu hỏi CQ → 【見積もり前提・確認事項】 trong 改修内容 + sheet 前提条件・留意事項 (4 khối) sinh từ cr.json (questions · not_cr · risk · recommendation) | builder | L8 L9 |
| S9 | Gate mới **V-EST**: (a) không còn chữ Việt / mã IMP-, API-, CQ- trong file KH · (b) mỗi dòng đủ 流用可否 · ◉◯ · STEP · (c) mọi công thức tổng phủ hết dải dòng (bắt lỗi kiểu `SUM(J19:J106)`) · (d) Step1 + Step2 = 全体 · (e) mỗi impact NEW / UPD thuộc ≥ 1 dòng chức năng | `verify-estimate.py` (mới) | L1–L10 |
| S10 | Golden sample: dùng bản FINAL CR-001 làm mẫu hồi quy cho self-test (số nhóm, phân bố 流用可否 / Step, tổng trong ngưỡng ±X%) | `selftest-estimate.py` (mới) | chống lặp lại |
| S11 | Cập nhật quy trình Luồng 2: thêm bước "Lập 見積書 cho KH" + câu hỏi người (CR-4): chia Step thế nào, phương án nào đưa vào, ai duyệt bảng công số | `flow-2-change-request.md` · `change-request.md` · AGENTS.md | quy trình |
| S12 | Áp lại cho CR-002: `CR-002_ETA_vi.xlsx` hiện cũng sinh từ impact (24 dòng) → làm lại theo S1–S9 (bản tiếng Nhật gửi KH + bản Việt nội bộ) | ver mới cho CR-002 | |
