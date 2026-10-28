# Sinh _internal/cr.json cho CR-002 (法人向け商品販売). Chay: python3 gen_cr_v8.py
# Nguon: input/*.docx (yeu cau KH 2026-10-16) · baseline ver1 inventory + code inputs/tokiwagi (read-only).
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
DOC_VI = "input/Bán sản phẩm dành cho khách hàng doanh nghiệp.docx"
DOC_JP = "input/法人向け商品販売に伴う機能改修｜見積もり依頼_20261016.docx"
CODE = "inputs/tokiwagi"

meta = {
    "cr_id": "CR-002",
    "cr_title": "法人向け商品販売に伴う機能改修（① 商品購入画面のカレンダー折りたたみ · ② 限定公開ページ）",
    "baseline_version": "ver1_021026_khao-sat-lan-dau",
    "cr_version": "ver8_191026_CR-002-corporate-limited-page",
    "source_type": "FILE",
    "source_ref": "inputs/cr/es_danh_sach_doan_v2/ (見積もり依頼 docx JP 2026-10-16 + bản dịch VI)",
    "received_date": "2026-10-16",
    "requested_by": "Khách hàng TOKIWAGI (Bornelund) — phụ trách dự án phía KH",
    "customer": "株式会社TOKIWAGI",
    "overall_risk": "Low",
    "recommendation": (
        "Thu hẹp từ CR-001 (団体利用) — chỉ giữ việc bán 4 sản phẩm 法人向け (事前1DAY / 当日1DAY × 平日 / 休日). "
        "4 sản phẩm tạo bằng 商品管理 hiện có (giá, lịch bán, mã Smaregi / OBIC như vé thường) — không phát triển. "
        "Mua / đặt chỗ / thanh toán / huỷ dùng nguyên luồng hiện có. "
        "① Lịch: sửa 1 component dùng chung BookingVacancies (đã có chế độ 30 ngày + tham số bookingDays ở API-075) — rủi ro thấp. "
        "② 限定公開: thêm 1 cột tickets + điều kiện lọc ở API-107 / API-075 (KHÔNG sửa hàm getTenantTicketsForVacancy dùng chung cho đặt chỗ trong ngày, cron, POS, hàng chờ) + 1 trang mới dựng lại khối lịch / vé trong ngày của 店舗詳細. "
        "Cách đọc tổng MD: 最小改修案 (option = FALSE) = ①-B (KH chọn) + ② không Option; 拡張案 (option = TRUE) gồm ①-A (PHƯƠNG ÁN THAY THẾ ①-B, KHÔNG cộng dồn) và ② Option (cộng thêm vào ② cơ bản). "
        "Tổng theo từng tổ hợp ①-A/①-B × ② không / có Option: xem CR-002_ETA_vi.xlsx. "
        "Đề xuất rẻ hơn: ②-S = không tạo trang mới, dùng lại trang 店舗詳細 (SC-067) với URL có khoá — LỆCH yêu cầu '1 trang / 1 URL' (thành mỗi 施設 1 URL), chỉ dùng nếu KH chấp nhận → bảng đề xuất trong CR-002_ETA_vi.xlsx. "
        "Release: ① và ② độc lập, release tách được; ② không Option là phần bắt buộc để bán hàng."),
}

justification = [
    {"item": "CR-002.1-B", "request": "① パターンB（希望）: カレンダー初期表示 1週間分のみ、展開ボタンで1か月分を表示。全事前購入商品が対象",
     "baseline_ref": "SC-067;SC-050",
     "baseline_quote": "components/BookingVacancies: mỗi vé 1 hàng lịch hiển thị toàn bộ bookingDays ngày (mặc định env NEXT_PUBLIC_ONLINE_BOOKING_ADVANCE_DAYS, .env.example = 7; chế độ thử next-month-booking = 30 ngày); không có nút thu gọn / mở rộng",
     "criteria": ["C2"], "why": "Đổi cách hiển thị lịch đang chạy (luôn hiện đủ số ngày) — khách đổi yêu cầu UI, không phải lỗi.",
     "not_feedback": "Lịch hiện hiển thị đủ số ngày đúng như thiết kế hiện tại."},
    {"item": "CR-002.1-A", "request": "① パターンA: カレンダー初期表示は閉じた状態、展開ボタンで1か月分を表示（パターンBの代替案）",
     "baseline_ref": "SC-067;SC-050",
     "baseline_quote": "components/BookingVacancies: lịch luôn mở, không có trạng thái đóng",
     "criteria": ["C2"], "why": "Đổi cách hiển thị lịch đang chạy — phương án thay thế của ①-B, báo giá riêng.",
     "not_feedback": "Lịch luôn mở đúng như thiết kế hiện tại."},
    {"item": "CR-002.2", "request": "② 基本機能: 限定公開URLのページを1つ設ける · 商品設定に「限定公開」ON/OFF · ONの商品は一般向け一覧に出さず限定公開ページにのみ表示",
     "baseline_ref": "API-107;API-075;column:tickets.visibility",
     "baseline_quote": "tickets.visibility boolean (公開 / 非公開); API-107 và utils/server/vacancy-status lọc visibility = true cho mọi danh sách phía user; không có trang chỉ hiển thị một nhóm vé",
     "criteria": ["C1", "C6"], "why": "Chưa có khái niệm vé chỉ hiện ở 1 trang riêng và chưa có trang đó; phải thêm cột tickets, đổi điều kiện lọc API, thêm màn.",
     "not_feedback": "Danh sách vé hiện hiển thị mọi vé 公開 đúng như thiết kế."},
    {"item": "CR-002.3", "request": "② 追加オプション: 限定公開ページをA・B・C…複数作成しURLを発行 · 商品ごとに通常公開／限定公開と掲載先ページを指定",
     "baseline_ref": "—",
     "baseline_quote": "Baseline không có bảng / màn quản lý trang; 25 bảng không có thực thể trang hiển thị",
     "criteria": ["C1", "C3", "C6"], "why": "Thêm thực thể mới (trang 限定公開) + màn quản trị + quan hệ vé–trang.",
     "not_feedback": "Không có chức năng tương đương trong hệ thống hiện tại."},
]

not_cr = [
    {"item": "企画: 4 sản phẩm 法人向け 事前1DAY / 当日1DAY × 平日 / 休日 (giá ~1/2)", "label": "QUESTION",
     "reason": "Đã có: 商品管理 (SC-035…038, API-050 / API-054) tạo vé loại ワンデー, đặt giá, lịch bán (ticket_booking_schedules), mã Smaregi / OBIC. Admin tự tạo 4 vé — không tính MD.",
     "baseline_ref": "SC-036"},
    {"item": "購入・予約などの販売フロー", "label": "QUESTION",
     "reason": "Đã có: mua trước online SC-050 → API-070 (GMO), mua trong ngày SC-054 → API-074; xác nhận mail, my page, huỷ. Vé 限定公開 đi qua nguyên luồng này (server không kiểm visibility khi tạo booking).",
     "baseline_ref": "API-070"},
]

Q = []
def q(i, text, why, axis, owner="KH"):
    Q.append({"id": i, "question": text, "why": why, "axis": axis, "owner": owner, "status": "Open"})

q("CQ-001", "Lịch đặt trước trên production đang hiển thị bao nhiêu ngày (biến NEXT_PUBLIC_ONLINE_BOOKING_ADVANCE_DAYS; bản mẫu = 7, có chế độ 30 ngày)? 「1か月分」 = 30 ngày tính từ hôm nay (như chế độ 30 ngày hiện có) hay đến hết tháng dương lịch?",
  "Quyết định ① có cần đổi số ngày tải từ API-075 không; nếu đang 7 ngày thì 'mở rộng 1 tháng' là tính năng mới cho người dùng", "Screen", "DEV / KH")
q("CQ-002", "①-B 「1週間分」 = 7 ngày đầu tính từ hôm nay (đúng 1 hàng lưới hiện tại) hay tuần lịch 月〜日?",
  "Lưới hiện tại bắt đầu từ hôm nay; tuần lịch cần thêm ô trống đầu hàng", "Screen")
q("CQ-003", "Nút mở rộng: riêng cho từng sản phẩm hay 1 nút cho tất cả? Có cần giữ trạng thái mở khi quay lại trang không?",
  "Ảnh hưởng nhỏ đến thiết kế; đề xuất: riêng từng sản phẩm, không giữ trạng thái", "Screen")
q("CQ-004", "① áp dụng cho: trang 店舗詳細 + form mua trước (SC-050) + trang 限定公開 — đúng không? (màn admin 空き状況 giữ nguyên)",
  "Component BookingVacancies dùng ở 3 nơi (2 phía user, 1 phía admin)", "Screen")
q("CQ-005", "KH đã chốt số trang / URL (見積依頼 ② 基本機能「限定公開URLのページを1つ設ける」; Option: mỗi trang A/B/C 1 URL riêng). Còn mở: trong 1 trang, sản phẩm 限定公開 của nhiều 施設 hiển thị thế nào — chọn 施設 trên trang (đề xuất) hay liệt kê mọi 施設 cùng lúc?",
  "Vé gắn theo 施設 (tenantCode), lịch / chỗ trống tính theo 施設; yêu cầu không nói cách hiển thị nhiều 施設. Ước tính đang theo: 1 URL, trên trang có ô chọn 施設", "Business")
q("CQ-006", "URL 限定公開 có cần đổi từ màn quản trị không? (không Option: khoá URL cấu hình trong hệ thống, đổi cần deploy)",
  "Nếu cần đổi từ admin → thêm 1 màn cài đặt (gần bằng Option)", "Business")
q("CQ-007", "限定公開 chỉ cần 'biết URL' (không đăng nhập / mật khẩu) — đồng ý rủi ro link bị chia sẻ? Có cần chặn đặt vé 限定公開 khi vào không qua trang này (người biết ticketId) không?",
  "Hiện API tạo booking không kiểm visibility; chặn thêm = sửa API-070 / API-074", "Business")
q("CQ-008", "Trang 限定公開 hiển thị cả 当日1DAY: cách mua 当日 giữ như vé thường hiện tại (luồng 今から利用する / 店頭)? 事前1DAY thanh toán thẻ online như hiện tại?",
  "Xác định màn mua nào phải nhận khoá 限定公開 (SC-050, SC-054)", "Business")
q("CQ-009", "Vé 限定公開 có ẩn ở 料金プラン (SC-059) và 待ち時間/販売状況 (SC-092) không? (đề xuất: ẩn)",
  "Hai màn này dùng chung API-107 / API-075 → ẩn mặc định", "Screen")
q("CQ-010", "Option: Dipro đề xuất 1 vé gán được NHIỀU trang (VD 1 vé dùng chung cho trang công ty X và công ty Y) — KH xác nhận được không?",
  "Quyết định bảng trang–vé (1-n hay n-n) và field thời hạn", "DB")
q("CQ-011", "Trang 限定公開 dùng bố cục 店舗詳細 hiện có (thông tin 施設 + lịch + vé trong ngày) với tiêu đề 法人向け — có cần thiết kế riêng / ảnh / mô tả không?",
  "Có thiết kế riêng → thêm công designer", "Mockup")
q("CQ-012", "Release: có môi trường staging để KH nghiệm thu không, lịch deploy production cố định không, ai test nghiệm thu? Ngày chốt đặc tả + 発注 dự kiến?",
  "Quyết định thời điểm release sớm nhất", "Business")
q("CQ-014", "Có cần xem doanh thu / số đặt chỗ của sản phẩm 法人向け tách riêng ở 売上管理 hoặc CSV không?",
  "Hiện 売上管理 thống kê theo sản phẩm (tên sản phẩm phân biệt được); cần lọc / cột 限定公開 riêng thì phát sinh thêm công", "Business")

WHY = {"CR-002.1-B": "CR-002.1-B: màn mua bị kéo dài khi nhiều sản phẩm 事前 — KH chọn mặc định 1 tuần, mở rộng 1 tháng",
       "CR-002.1-A": "CR-002.1-A: phương án thay thế — mặc định đóng lịch, mở ra 1 tháng",
       "CR-002.2": "CR-002.2: tách sản phẩm 法人向け khỏi danh sách thường, chỉ hiện ở trang 限定公開",
       "CR-002.3": "CR-002.3: nhiều trang 限定公開 A / B / C, mỗi sản phẩm chọn trang hiển thị"}
I = []
def imp(i, axis, ct, ref, item, change, why, impact, rate, qty, cr_item, option=False, q_="", risk="Low", note="", ev=""):
    if len(why) < 30: why = WHY[cr_item] + ("" if why == cr_item else " — " + why.split(": ", 1)[-1])
    I.append({"id": i, "axis": axis, "change_type": ct, "baseline_ref": ref, "item": item, "change": change,
              "why_change": why, "impact_on_current": impact, "conflict": "No", "conflict_detail": "", "risk": risk,
              "rate_code": rate, "qty": qty, "md_note": note, "evidence": ev or (DOC_JP + " · " + DOC_VI),
              "question": q_, "cr_item": cr_item, "option": option})

# ---- ①-B (KH chon) ----
EVB = DOC_JP + " ① パターンB · " + CODE + "/src/components/BookingVacancies/index.tsx"
imp("IMP-001", "Screen", "UPD", "SC-067", "Lịch đặt trước — component BookingVacancies (①-B)",
    "Mỗi sản phẩm hiển thị 7 ngày đầu; nút 「もっと見る」 mở đủ 1 tháng, 「閉じる」 thu lại; PC (lưới) + mobile (danh sách); ngày đang chọn nằm ngoài tuần đầu → tự mở",
    "CR-002.1-B: màn mua bị kéo dài khi nhiều sản phẩm 事前", "Component dùng chung SC-067 / SC-050 / SC-044 — thêm prop, mặc định giữ hành vi cũ cho admin",
    "SCR-UPD-M", 1, "CR-002.1-B", q_="CQ-002;CQ-003", ev=EVB)
imp("IMP-002", "Screen", "IMPACT", "SC-050", "Form mua trước (dùng BookingVacancies)",
    "Kiểm lại chọn ngày / giữ ngày đã chọn khi lịch thu gọn", "CR-002.1-B: component đổi hành vi", "Không đổi luồng thanh toán",
    "SCR-IMP", 1, "CR-002.1-B", q_="CQ-004", ev=EVB)
imp("IMP-003", "Screen", "IMPACT", "SC-044", "空き状況 (admin) dùng BookingVacancies",
    "Giữ lịch mở như cũ (không truyền prop thu gọn) — kiểm lại", "CR-002.1-B: component dùng chung", "Không đổi", "SCR-IMP", 1, "CR-002.1-B", ev=EVB)
imp("IMP-004", "System", "IMPACT", "API-075", "API trạng thái chỗ trống (bookingDays)",
    "Khi mở rộng tải 30 ngày (tham số bookingDays có sẵn, chặn ≤ 30); nếu production đang 7 ngày → kiểm thời gian phản hồi khi nhiều sản phẩm",
    "CR-002.1-B: hiển thị 1 tháng", "Không đổi contract", "API-IMP", 1, "CR-002.1-B", q_="CQ-001",
    ev=EVB + " · " + CODE + "/src/constants/booking.ts NEXT_MONTH_BOOKING_DAYS")
imp("IMP-005", "Business", "UPD", "SC-067", "Rule hiển thị lịch đặt trước",
    "Mặc định 1 tuần, mở rộng 1 tháng (áp dụng mọi sản phẩm 事前購入)", "CR-002.1-B", "Mọi sản phẩm 事前 trên trang user đổi cách hiển thị",
    "BIZ-UPD", 1, "CR-002.1-B", q_="CQ-001", ev=EVB)
imp("IMP-006", "Mockup", "UPD", "DS-component:WEB-02:Button", "Mockup khối lịch có nút mở rộng (①-B)",
    "Thêm nút 「もっと見る / 閉じる」 bằng Button có sẵn của Design System WEB-02", "CR-002.1-B", "Không thêm component mới",
    "UI-UPD", 1, "CR-002.1-B", ev=EVB)
# ---- ①-A (phuong an thay the) ----
EVA = DOC_JP + " ① パターンA · " + CODE + "/src/components/BookingVacancies/index.tsx"
imp("IMP-007", "Screen", "UPD", "SC-067", "Lịch đặt trước — component BookingVacancies (①-A, thay thế ①-B)",
    "Mỗi sản phẩm chỉ hiện tên + nút 「カレンダーを表示」; bấm → mở lịch 1 tháng; PC + mobile",
    "CR-002.1-A: phương án thay thế — KHÔNG cộng với IMP-001", "Như IMP-001 (dùng chung IMP-002…004 khi chọn A)",
    "SCR-UPD-S", 1, "CR-002.1-A", option=True, note="Thay thế IMP-001 / IMP-005 / IMP-006 khi KH chọn A", ev=EVA)
imp("IMP-008", "Business", "UPD", "SC-067", "Rule hiển thị lịch đặt trước (①-A)",
    "Mặc định đóng, mở → 1 tháng", "CR-002.1-A", "Như IMP-005", "BIZ-UPD", 1, "CR-002.1-A", option=True, note="Thay thế IMP-005", ev=EVA)
imp("IMP-009", "Mockup", "UPD", "DS-component:WEB-02:Button", "Mockup khối lịch đóng (①-A)",
    "Thêm nút mở lịch bằng Button có sẵn", "CR-002.1-A", "Không thêm component mới", "UI-UPD", 1, "CR-002.1-A", option=True, note="Thay thế IMP-006", ev=EVA)
# ---- ② co ban ----
EV2 = DOC_JP + " ② 基本機能 · " + CODE + "/src/pages/api/tickets/index.ts · src/utils/server/vacancy-status.ts"
imp("IMP-010", "DB", "NEW", "column:tickets.limited_public", "Cờ 限定公開 của sản phẩm",
    "Thêm cột tickets.limited_public boolean mặc định false", "CR-002.2: ON = chỉ hiện ở trang 限定公開",
    "Vé cũ = false → không đổi hành vi; visibility giữ nghĩa 公開 / 非公開", "DB-COL-NEW", 1, "CR-002.2", ev=EV2)
imp("IMP-011", "System", "UPD", "API-107", "API danh sách sản phẩm (user)",
    "Mặc định bỏ vé limited_public = true; có khoá 限定公開 hợp lệ → chỉ trả vé limited_public", "CR-002.2: tách vé thường / 法人向け",
    "Dùng bởi SC-050, SC-054, SC-059, SC-048, SC-049 — không truyền khoá thì kết quả như cũ trừ vé 限定公開", "API-UPD", 1, "CR-002.2", q_="CQ-009", ev=EV2)
imp("IMP-012", "System", "UPD", "API-075", "API trạng thái chỗ trống (user)",
    "Lọc vé limited_public ở tầng response theo khoá (KHÔNG sửa getTenantTicketsForVacancy dùng chung)", "CR-002.2",
    "Dùng bởi SC-067, SC-054, SC-092 — không truyền khoá thì ẩn vé 限定公開", "API-UPD", 1, "CR-002.2", risk="Medium", ev=EV2)
imp("IMP-013", "System", "IMPACT", "API-070;API-074", "API tạo đặt chỗ (trước / trong ngày)",
    "Kiểm lại: vé 限定公開 đặt được như vé thường (server không kiểm visibility)", "CR-002.2: dùng nguyên luồng mua", "Không sửa", "API-IMP", 2, "CR-002.2", q_="CQ-007", ev=EV2)
imp("IMP-014", "System", "IMPACT", "API-074", "Hàm dùng chung getTenantTicketsForVacancy / booking-queue",
    "Giữ nguyên (đặt chỗ trong ngày, hàng chờ, cron 077/078, POS check-out vẫn thấy vé 限定公開) — kiểm hồi quy", "CR-002.2",
    "Không sửa — nếu lọc ở đây sẽ chặn bán 当日 vé 限定公開", "SYS-IMP", 1, "CR-002.2", risk="Medium",
    ev=CODE + "/src/utils/server/vacancy-status.ts · src/utils/server/booking-queue.ts · src/pages/api/bookings/use-in-day.ts")
imp("IMP-015", "System", "UPD", "API-050;API-054", "API tạo / sửa sản phẩm (admin)",
    "Nhận và lưu limited_public; trả trong GET", "CR-002.2: thiết lập ON / OFF", "Vé cũ không gửi field → giữ false", "API-UPD", 2, "CR-002.2", ev=EV2)
imp("IMP-016", "Screen", "NEW", "—", "[WEB-02] 限定公開ページ (法人向け商品)",
    "URL có khoá khó đoán (cấu hình hệ thống); liệt kê 施設 có vé 限定公開 → mỗi 施設: lịch đặt trước (BookingVacancies, áp dụng ①) + vé trong ngày (như khối 本日 của 店舗詳細) → nút mua chuyển SC-050 / SC-054 kèm khoá; khoá sai → 404",
    "CR-002.2: trang riêng cho 法人", "Không đổi trang hiện có", "SCR-NEW-M", 1, "CR-002.2", q_="CQ-005;CQ-006;CQ-011", ev=EV2)
imp("IMP-017", "Screen", "UPD", "SC-050", "Form mua trước — nhận khoá 限定公開",
    "Truyền khoá từ URL xuống PaymentOnlineBookingForm → API-107 trả vé 限定公開", "CR-002.2: mua bằng luồng cũ", "Không có khoá → như cũ",
    "SCR-UPD-S", 1, "CR-002.2", q_="CQ-008", ev=CODE + "/src/components/CreateBooking/PaymentOnlineBookingForm/index.tsx")
imp("IMP-018", "Screen", "UPD", "SC-054", "Mua trong ngày — nhận khoá 限定公開",
    "Truyền khoá xuống PaymentOfflineBookingForm → API-107 / API-075 trả vé 限定公開", "CR-002.2", "Không có khoá → như cũ",
    "SCR-UPD-S", 1, "CR-002.2", q_="CQ-008", ev=CODE + "/src/components/CreateBooking/PaymentOfflineBookingForm/index.tsx")
imp("IMP-019", "Screen", "UPD", "SC-036;SC-037", "Form tạo / sửa sản phẩm — 限定公開 ON / OFF",
    "Thêm radio 限定公開 ON / OFF (mặc định OFF) cạnh 公開ステータス", "CR-002.2", "Form dùng chung create / edit", "SCR-UPD-S", 1, "CR-002.2",
    ev=CODE + "/src/components/Ticket/CreateOrEditTicketStepper/CreateOrEditTicketForm/index.tsx")
imp("IMP-020", "Screen", "UPD", "SC-035;SC-038", "Danh sách / xem sản phẩm — hiện 限定公開",
    "Thêm cột / nhãn 限定公開 ở 商品一覧 và màn xem", "CR-002.2: admin nhận biết vé 法人向け", "Không đổi chức năng khác", "SCR-UPD-S", 2, "CR-002.2",
    ev=CODE + "/src/pages/admin/ticket-management/index.tsx")
imp("IMP-021", "Screen", "IMPACT", "SC-067;SC-059;SC-092;SC-048;SC-049", "Màn user đang liệt kê sản phẩm",
    "Kiểm lại: vé 限定公開 không xuất hiện", "CR-002.2", "Kết quả API đổi (ẩn vé 限定公開)", "SCR-IMP", 5, "CR-002.2", q_="CQ-009", ev=EV2)
imp("IMP-022", "Business", "NEW", "—", "Rule 限定公開",
    "ON → ẩn mọi danh sách thường, chỉ hiện ở trang 限定公開; mua / đặt / thanh toán / huỷ / my page dùng luồng cũ; truy cập = biết URL (không đăng nhập)",
    "CR-002.2", "Không đổi rule hiện có", "BIZ-NEW", 1, "CR-002.2", q_="CQ-007", ev=EV2)
imp("IMP-023", "Mockup", "NEW", "DS-component:WEB-02:PageHeader;DS-component:WEB-02:Card;DS-component:WEB-02:Button", "Mockup 限定公開ページ",
    "Dựng từ bố cục 店舗詳細 + token / component Design System WEB-02", "CR-002.2", "Không thêm component mới", "UI-NEW", 1, "CR-002.2", q_="CQ-011", ev=EV2)
imp("IMP-024", "Mockup", "UPD", "DS-component:WEB-01:Radio", "Mockup form sản phẩm — radio 限定公開",
    "Thêm 1 radio bằng component Radio có sẵn WEB-01", "CR-002.2", "Không thêm component", "UI-UPD", 1, "CR-002.2", ev=EV2)
imp("IMP-025", "ThirdParty", "IMPACT", "EXT-001;EXT-006", "GMO (thanh toán online) · Smaregi / POS",
    "Kiểm lại: vé 限定公開 thanh toán / quyết toán như vé thường (mã Smaregi / OBIC nhập ở 商品管理)", "CR-002.2", "Không sửa liên kết", "EXT-IMP", 2, "CR-002.2",
    ev=EV2 + " · ver7 Output 1 FL-08 / FL-10")
# ---- ② Option ----
EV3 = DOC_JP + " ② 追加オプション"
imp("IMP-030", "DB", "NEW", "—", "Bảng trang 限定公開",
    "limited_pages: id, tên trang, khoá URL (sinh ngẫu nhiên), trạng thái, ghi chú", "CR-002.3: nhiều trang A / B / C", "Bảng mới", "DB-TBL-NEW", 1, "CR-002.3", option=True, q_="CQ-010", ev=EV3)
imp("IMP-031", "DB", "NEW", "—", "Bảng liên kết sản phẩm ↔ trang 限定公開",
    "Bảng mới ticket_limited_pages (ticket_id, limited_page_id) — 1 vé gắn được nhiều trang (đề xuất Dipro, chờ CQ-010); vé 限定公開 không có dòng nào = không hiện ở đâu", "CR-002.3: chỉ định 掲載先 (nhiều trang)", "Thay vai trò cờ limited_public của bản cơ bản", "DB-TBL-NEW", 1, "CR-002.3", option=True, q_="CQ-010", ev=EV3)
imp("IMP-032", "System", "NEW", "—", "API quản trị trang 限定公開",
    "Danh sách / tạo / sửa / dừng trang; sinh khoá URL", "CR-002.3", "API mới", "API-NEW", 2, "CR-002.3", option=True, ev=EV3)
imp("IMP-033", "System", "UPD", "API-107;API-075", "Lọc sản phẩm theo trang",
    "Khoá URL → trang → các vé gắn với trang (qua bảng liên kết); trang dừng / khoá sai → 404; trang 限定公開 (IMP-016) hiện tên trang + vé của trang", "CR-002.3", "Thêm vào logic IMP-011 / IMP-012 / màn IMP-016", "API-UPD", 3, "CR-002.3", option=True, ev=EV3)
imp("IMP-034", "Screen", "NEW", "—", "[WEB-01] 限定公開ページ管理",
    "Danh sách trang + form tạo / sửa (tên, trạng thái), hiện URL để copy; thêm mục menu Super Admin / Admin", "CR-002.3", "Màn mới", "SCR-NEW-M", 1, "CR-002.3", option=True, q_="CQ-010", ev=EV3)
imp("IMP-035", "Screen", "UPD", "SC-036;SC-037", "Form sản phẩm — chọn 掲載先ページ",
    "Khi 限定公開: chọn 1 hoặc nhiều trang (multi-select) từ danh sách đã tạo", "CR-002.3", "Thay radio ON / OFF của IMP-019", "SCR-UPD-M", 1, "CR-002.3", option=True, ev=EV3)
imp("IMP-037", "Business", "NEW", "—", "Rule nhiều trang",
    "1 vé hiển thị được trên nhiều trang (đề xuất Dipro — chờ KH xác nhận CQ-010); vé chỉ hiện trên các trang đang công khai; mọi trang của vé đều dừng → vé không hiện ở đâu", "CR-002.3", "Rule mới", "BIZ-NEW", 1, "CR-002.3", option=True, q_="CQ-010", ev=EV3)
imp("IMP-038", "Mockup", "NEW", "DS-component:WEB-01:Table;DS-component:WEB-01:TextField;DS-component:WEB-01:Button", "Mockup màn quản lý trang 限定公開",
    "Dựng từ Table / TextField / Button có sẵn của Design System WEB-01", "CR-002.3", "Không thêm component", "UI-NEW", 1, "CR-002.3", option=True, ev=EV3)

cr = {"meta": meta, "justification": justification, "not_cr": not_cr, "no_impact_axes": [], "questions": Q, "impacts": I}
json.dump(cr, open(os.path.join(HERE, "cr.json"), "w"), ensure_ascii=False, indent=1)
print("cr.json:", len(I), "impacts ·", len(Q), "questions")
