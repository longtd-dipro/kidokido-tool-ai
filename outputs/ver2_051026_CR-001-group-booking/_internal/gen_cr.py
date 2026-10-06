#!/usr/bin/env python3
"""Sinh <ver>/_internal/cr.json cho CR-001 (団体利用). Chay 1 lan, output la cr.json."""
import json
import sys

OUT = sys.argv[1]
DOC = "input/予約システム 団体利用登録・団体利用受付機能 開発・見積依頼書.docx"
EST = "input/【TOKIWAGI様】見積書_団体利用_2609.xlsx 見積書(VN)"
INV = "ver1/_internal/inventory.xlsx"
EXT = "拡張案"

meta = {
    "cr_id": "CR-001",
    "cr_title": "団体利用登録・団体利用受付機能（団体専用予約ページ・団体マスタ・団体決済・領収書発行）",
    "baseline_version": "ver1_021026_khao-sat-lan-dau",
    "cr_version": "ver2_051026_CR-001-group-booking",
    "source_type": "FILE",
    "source_ref": "inputs/cr/est_danh_sach_doan/ (見積依頼書 docx 作成日 2026-07-17 + 見積書 xlsx đã gửi KH)",
    "received_date": "2026-10-05",
    "requested_by": "Khách hàng TOKIWAGI — phụ trách dự án phía KH",
    "overall_risk": "High",
    "recommendation": (
        "Hướng triển khai đề xuất (theo yêu cầu 既存機能を可能な限り流用): giữ nguyên tickets / bookings / GMO; "
        "thêm cột 公開区分 cho tickets thay vì tách hệ thống vé; thêm bảng organizations + organization_members "
        "(giữ Role=User, không đổi enum Role để không động tới NextAuth của mọi màn); tạo endpoint đặt chỗ đoàn riêng "
        "dùng lại service của API-070 để không đụng luồng đặt chỗ cá nhân; 領収書 = bảng mới + PDF sinh từ DB. "
        "Chia giai đoạn: 最小改修案 = các dòng KHÔNG ghi '拡張案' trong Ghi chú MD; 拡張案 = các dòng có ghi '拡張案' "
        "(nhiều người phụ trách, phê duyệt, 2FA người phụ trách, 請求書払い, phí huỷ theo vé). "
        "3 rủi ro cần chốt trước khi báo giá cuối: (1) dùng chung sức chứa giữa vé cá nhân và vé đoàn (CQ-010), "
        "(2) phương thức thanh toán đang gắn theo vé, đoàn cần chọn theo booking (CQ-011), "
        "(3) phí huỷ qua GMO (CQ-005). MD ở file này = dev + unit test theo bảng đơn giá DRAFT, chưa gồm 要件定義・デザイン・"
        "結合テスト・管理 nên KHÔNG so trực tiếp với tổng 216.69 人日 của 見積書 đã gửi KH (bảng đó gồm đủ các công đoạn)."
    ),
}

justification = [
    {"item": "CR-001.1", "request": "3-1 団体専用予約ページ: URL đặt chỗ riêng cho đoàn; trang thường không hiện vé đoàn; thêm 公開区分 一般/団体/共通 cho 商品",
     "baseline_ref": "API-107;column:tickets.visibility",
     "baseline_quote": "API-107: 'GET: trả danh sách ticket visibility=true theo tenantCode/paymentType/canBookInAdvance/ticketTypes…' — tickets.visibility là boolean (mặc định true); không có thuộc tính phân loại đối tượng 一般/団体",
     "criteria": ["C1", "C3", "C6"],
     "why": "Hệ thống chỉ có cờ ẩn/hiện vé, chưa có khái niệm vé theo đối tượng và chưa có trang đặt chỗ cho đoàn; phải thêm cột cho tickets và đổi điều kiện lọc của API-107.",
     "not_feedback": "Trang đặt chỗ hiện hiển thị mọi vé visibility=true đúng như thiết kế hiện tại."},
    {"item": "CR-001.2", "request": "3-2 団体登録・団体マスタ: quản lý 団体名・法人名, địa chỉ, 請求先, 領収書宛名, nhiều 担当者 / 1 đoàn",
     "baseline_ref": "table:users;column:users.role",
     "baseline_quote": "users lưu người dùng cá nhân (first_name, last_name, phone, post_code, address…); enum Role = User / Admin / SuperAdmin / Staff; 25 bảng baseline không có bảng tổ chức / 団体",
     "criteria": ["C1", "C6"],
     "why": "Chưa có thực thể 団体 và quan hệ 団体–担当者; cần bảng mới và màn đăng ký / quản lý mới.",
     "not_feedback": "Đăng ký hiện tại dành cho cá nhân, chạy đúng với thiết kế hiện có."},
    {"item": "CR-001.3", "request": "3-3 団体予約: nhập 店舗, ngày giờ, vé đoàn, số trẻ / người lớn, theo nhóm tuổi, 当日責任者, 備考; dùng chung sức chứa; 即時確定 hoặc 承認制",
     "baseline_ref": "API-070;table:booking_child_age_infos",
     "baseline_quote": "API-070: 'POST: tạo booking online (kiểm tra lịch bán vé, validate, kiểm tra chỗ trống vé 1 ngày online), sinh barcode, lưu tuổi trẻ em…' — bookings không có cột tổ chức, 当日責任者, 備考; booking_child_age_infos chỉ lưu child_age_in_month từng trẻ",
     "criteria": ["C1", "C4", "C6"],
     "why": "Luồng đặt chỗ đoàn có dữ liệu và quy tắc (người phụ trách, nhóm tuổi, phê duyệt) chưa có trong luồng đặt chỗ cá nhân.",
     "not_feedback": "Luồng đặt chỗ cá nhân hiện chạy đúng như thiết kế."},
    {"item": "CR-001.4", "request": "3-4 決済: thẻ của đại diện, 店頭払い, 支払期限, キャンセル料, hoàn tiền một phần / toàn bộ, quản lý trạng thái thanh toán, (請求書払い chờ KH)",
     "baseline_ref": "column:tickets.payment_type;API-111;EXT-001",
     "baseline_quote": "tickets.payment_type (enum Online / Offline) gắn theo vé; API-111: 'huỷ booking — nếu thanh toán online thì tra cứu và huỷ giao dịch GMO; cập nhật status Cancelled (paymentStatus Refunded/Pending…)' — không có phí huỷ, không có hạn thanh toán",
     "criteria": ["C4", "C6"],
     "why": "Thêm quy tắc thu tiền mới (hạn thanh toán, phí huỷ, chọn cách trả theo booking) làm đổi logic huỷ / hoàn tiền và giao dịch GMO đang chạy.",
     "not_feedback": "Huỷ hiện hoàn toàn bộ tiền qua GMO đúng như thiết kế."},
    {"item": "CR-001.5", "request": "3-5 領収書発行: PDF từ マイページ, chỉ định 宛名, ghi '再発行' từ lần 2, cùng số 領収書, lưu lịch sử, vô hiệu khi huỷ / hoàn tiền, admin xem / phát hành lại",
     "baseline_ref": "SC-071",
     "baseline_quote": "SC-071 予約履歴 chi tiết hiển thị: '領収書は店頭にて発行いたします。サイト上では発行できません。' (REPO-01:src/pages/user/my-page/booking-history/[id].tsx#L730); baseline không có API / bảng 領収書",
     "criteria": ["C1", "C2", "C6"],
     "why": "Hệ thống đang quy định 領収書 chỉ phát hành tại quầy; yêu cầu phát hành trên web là đổi quy tắc đang chạy và cần bảng + API + PDF mới.",
     "not_feedback": "Màn đang thông báo đúng quy tắc hiện tại (phát hành tại quầy)."},
    {"item": "CR-001.6", "request": "3-6 団体用マイページ: xem / sửa 団体情報, 担当者, 請求先; đặt chỗ hiện tại + lịch sử; đổi / huỷ; trạng thái thanh toán; 領収書",
     "baseline_ref": "SC-069;SC-070;SC-081",
     "baseline_quote": "マイページ hiện dành cho cá nhân: 予約履歴 (SC-069 /user/my-page, SC-070 /user/my-page/booking-history) và アカウント情報の確認・編集 (SC-081) theo bản ghi users",
     "criteria": ["C1", "C3"],
     "why": "Cần khu マイページ cho đoàn với thông tin đoàn, người phụ trách và 領収書 — chưa có trong マイページ cá nhân.",
     "not_feedback": "マイページ cá nhân đang chạy đúng như thiết kế."},
    {"item": "CR-001.7", "request": "3-7 管理画面: đăng ký / sửa / dừng đoàn, xem người phụ trách, tìm đặt chỗ đoàn theo 店舗・利用日・団体名・担当者名, phân biệt 一般 / 団体, CSV, 操作履歴, 領収書 履歴",
     "baseline_ref": "SC-004;API-017",
     "baseline_quote": "API-017: 'Lấy danh sách booking (phân trang) theo bộ lọc; Admin bị giới hạn trong tenant của mình…' (màn SC-004 予約管理) — không có tiêu chí 団体 / 一般, tên đoàn, người phụ trách; không có màn quản lý đoàn hay xem 操作履歴",
     "criteria": ["C1", "C3"],
     "why": "Thêm chức năng quản trị đoàn và tiêu chí lọc mới cho màn quản lý đặt chỗ hiện có.",
     "not_feedback": "Màn 予約管理 đang lọc đúng theo tiêu chí hiện tại."},
    {"item": "CR-001.8", "request": "3-8 ログイン・セキュリティ (phần mới): 二要素認証 cho admin, xác thực bổ sung khi đăng nhập thiết bị mới / thao tác quan trọng cho người phụ trách, thông báo khi đổi thông tin quan trọng",
     "baseline_ref": "API-061;API-138",
     "baseline_quote": "API-061: 'đăng nhập bằng email+mật khẩu (provider credentials, có câu hỏi bảo mật tuỳ chọn), đăng nhập bằng token, đăng nhập LINE…'; API-138 kiểm tra email/mật khẩu admin, khoá tài khoản, loginAttempts — không có OTP / 二要素認証",
     "criteria": ["C5"],
     "why": "二要素認証 và xác thực bổ sung là yêu cầu bảo mật mới chưa có trong luồng đăng nhập hiện tại.",
     "not_feedback": "Đăng nhập hiện chạy đúng với cơ chế email + mật khẩu (+ câu hỏi bảo mật)."},
    {"item": "CR-001.9", "request": "3-9 メール通知: đăng ký đoàn hoàn tất, xác nhận email, nhận / xác nhận đặt chỗ, thanh toán xong, đổi đặt chỗ, huỷ / hoàn tiền, nhắc trước hạn thanh toán",
     "baseline_ref": "SC-014;table:email_settings",
     "baseline_quote": "SC-014 自動返信メール設定 quản lý mẫu theo email_settings.email_key; mẫu trong source: booking-successful, booking-update, booking-with-waiting-successful, remind-*, reset-password, unlock-account, verify-account, verify-successful — không có mẫu cho đoàn / hạn thanh toán",
     "criteria": ["C1"],
     "why": "Cần mẫu mail mới cho sự kiện đoàn và job nhắc hạn thanh toán — chưa có.",
     "not_feedback": "Mail hiện gửi đúng cho các sự kiện cá nhân đã có."},
]

not_cr = [
    {"item": "CR-001.8 (ログイン試行回数の制限)", "label": "QUESTION",
     "reason": "Đã có: API-138 khoá tài khoản, tăng / reset loginAttempts (users.login_attempts, users.locked); API-067 mở khoá. Tài khoản người phụ trách đoàn là users → dùng lại, không tính MD riêng.",
     "baseline_ref": "API-138"},
    {"item": "CR-001.8 (パスワード再設定)", "label": "QUESTION",
     "reason": "Đã có: API-140 gửi mail RESET_PASSWORD, API-141 đặt lại mật khẩu (SC-057, SC-061). Dùng lại cho người phụ trách đoàn.",
     "baseline_ref": "API-140"},
    {"item": "CR-001.8 (メールアドレス変更時の再認証)", "label": "QUESTION",
     "reason": "Đã có: API-127 cập nhật email theo token, API-143 xác thực token email. Dùng lại cho người phụ trách đoàn.",
     "baseline_ref": "API-127"},
    {"item": "CR-001.8 (新規登録時のメール認証)", "label": "QUESTION",
     "reason": "Đã có: API-066 đăng ký user và gửi mail xác thực. Đăng ký đoàn dùng lại cơ chế này (phần đăng ký đoàn mới tính ở IMP của CR-001.2).",
     "baseline_ref": "API-066"},
    {"item": "CR-001.7 (店舗管理者は自店舗の予約のみ)", "label": "QUESTION",
     "reason": "Đã có cho đặt chỗ: API-017 giới hạn Admin trong tenant của mình. Màn đoàn mới sẽ áp cùng quy tắc (đã tính trong dòng nghiệp vụ IMPACT).",
     "baseline_ref": "API-017"},
]

no_impact_axes = []

Q = []
def q(qid, question, why, axis, owner):
    Q.append({"id": qid, "question": question, "why": why, "axis": axis, "owner": owner, "status": "Open"})

q("CQ-001", "団体利用の最低人数・対象となる団体の範囲 (幼稚園・保育園のみ? 法人一般?) là gì?", "Quyết định validate khi đặt chỗ đoàn và điều kiện đăng ký đoàn (mục 6 tài liệu KH: 未確定)", "Business", "KH")
q("CQ-002", "団体予約 xác nhận ngay (即時確定) hay chờ admin phê duyệt (承認制)?", "承認制 cần thêm trạng thái, màn phê duyệt và mail; mục 6: 未確定", "Business", "KH")
q("CQ-003", "Tuổi trẻ: nhập từng trẻ (như booking_child_age_infos hiện tại) hay chỉ số lượng theo nhóm tuổi? Điều kiện miễn phí / giảm giá cho 引率者?", "Quyết định cấu trúc dữ liệu đặt chỗ đoàn và cách tính tiền", "DB", "KH")
q("CQ-004", "予約可能期間 và hạn đổi / huỷ của đặt chỗ đoàn có khác vé cá nhân (ticket_booking_schedules.can_cancel_or_change_before_in_day) không?", "Nếu khác cần cấu hình riêng cho vé đoàn", "Business", "KH")
q("CQ-005", "キャンセル料: 1 mức chung toàn hệ thống hay theo vé / theo cơ sở? Mốc thời gian và tỷ lệ? Thu phí huỷ qua GMO (trừ vào tiền hoàn) có chấp nhận không?", "GMO không có thao tác 'phí huỷ' riêng (ghi chú trong 見積書); quyết định cách đổi số tiền giao dịch", "ThirdParty", "KH")
q("CQ-006", "Phương thức thanh toán đoàn được dùng: thẻ đại diện / 店頭払い / 請求書払い? Nếu 請求書払い thì dùng dịch vụ ngoài nào hay chỉ quản lý trạng thái thủ công?", "Quyết định có thêm liên kết bên thứ 3 mới hay không (mục 6: 未確定)", "ThirdParty", "KH")
q("CQ-007", "Người phụ trách đoàn: có dùng xác thực bổ sung khi đăng nhập thiết bị mới / thao tác quan trọng không? Thao tác nào là 'quan trọng'?", "Mục 6: 団体担当者への二要素認証ログインの可否 — 未確定", "System", "KH")
q("CQ-008", "Nội dung bắt buộc trên 領収書 theo yêu cầu kế toán (税区分, số đăng ký, mẫu đóng dấu…)? Cách đánh số 領収書?", "Mục 3-5 / 6: 領収書の記載内容・経理要件 — 未確定; quyết định layout PDF và cột lưu trữ", "Mockup", "KH")
q("CQ-009", "Có 商品 dùng chung 一般・団体 không?", "Nếu không có thì 公開区分 chỉ cần 2 giá trị", "DB", "KH")
q("CQ-010", "Sức chứa cơ sở phải dùng chung giữa vé cá nhân và vé đoàn: sức chứa hiện tính theo ticket_booking_schedules.max_booking_people của từng vé (cờ max_booking_people_accumulative). Vé đoàn là vé riêng thì có trừ chung sức chứa không?", "Nếu không trừ chung sẽ có nguy cơ vượt sức chứa thực tế — cần Dev DIPRO đọc logic API-008 / API-075 / API-007 và KH xác nhận quy tắc", "Business", "Dev DIPRO + KH")
q("CQ-011", "Hiện cách thanh toán (Online / Offline) cố định theo vé (tickets.payment_type). Đoàn được chọn thẻ hoặc 店頭払い khi đặt, hay mỗi vé đoàn cố định 1 cách?", "Chọn theo booking làm đổi mô hình dữ liệu và logic thanh toán / huỷ", "Business", "KH")
q("CQ-012", "Các màn SC-005 (chi tiết đặt chỗ admin), SC-037 / SC-038 (sửa / xem vé) chưa quan sát được trên UI ở baseline (To verify). Cần xác nhận UI hiện tại trước khi chốt mức sửa.", "Mức sửa đang ước theo route trong source", "Screen", "Dev DIPRO")
q("CQ-013", "二要素認証 admin dùng mã gửi qua email hay ứng dụng authenticator (TOTP)?", "Ảnh hưởng màn đăng ký thiết bị và luồng đăng nhập admin", "System", "KH")
q("CQ-014", "Design System chưa có: Badge cho WEB-01 (trạng thái 一般/団体, 発行済/再発行/無効, 承認待ち); Table và Modal cho WEB-02 (danh sách 領収書 / người phụ trách, popup nhập mã). Designer xác nhận dùng lại mẫu của site còn lại hay thiết kế mới?", "STATUS.md baseline ghi TBD — không tự chế màu / component", "Mockup", "Designer")
q("CQ-015", "最小改修案 có cần nhiều người phụ trách / 1 đoàn không, hay 1 tài khoản đại diện trước? Có phân quyền giữa các người phụ trách không?", "KH ghi 'cần cấu trúc nhiều người phụ trách' nhưng 拡張案 cũng liệt kê '複数担当者'", "Business", "KH")
q("CQ-016", "Danh sách màn người dùng đang hiển thị vé lấy từ API-107 (Called By suy từ import tĩnh, có thể dư) — Dev xác nhận màn nào phải ẩn vé đoàn.", "Liên kết baseline là suy luận → xung đột UNKNOWN", "Screen", "Dev DIPRO")
q("CQ-017", "Vé đoàn 店頭払い: cần mã Smaregi QR / OBIC riêng cho vé đoàn không (ticket_details.*_smaregi_qrcode_url, *_obic_code)?", "Thanh toán tại quầy và đối soát Smaregi / OBIC đang dựa trên mã gắn theo vé", "ThirdParty", "KH")

I = []
def imp(axis, ct, ref, item, change, why, impact, rate, qty, conflict="No", cdetail="", risk="Low",
        md_note="", ev="", question=""):
    I.append({"id": "IMP-%03d" % (len(I) + 1), "axis": axis, "change_type": ct, "baseline_ref": ref,
              "item": item, "change": change, "why_change": why, "impact_on_current": impact,
              "conflict": conflict, "conflict_detail": cdetail, "risk": risk, "rate_code": rate,
              "qty": qty, "md_note": md_note, "evidence": ev, "question": question})

# ================= System =================
imp("System", "UPD", "API-107", "API danh sách vé (user)",
    "Thêm điều kiện lọc theo 公開区分: trang thường chỉ trả vé 一般 (+共通); trang đoàn chỉ trả vé 団体 (+共通)",
    "CR-001.1: trang đặt chỗ thường không được hiện vé đoàn",
    "Mọi màn người dùng gọi API-107 đổi kết quả nếu thiếu tham số — mặc định phải trả như cũ (一般)",
    "API-UPD", 1, risk="Medium", ev="%s §3-1 · %s 07_API API-107" % (DOC, INV))
imp("System", "UPD", "API-050;API-054", "API tạo / sửa vé (admin)",
    "Nhận và lưu field 公開区分 khi tạo / sửa vé; trả field này trong GET",
    "CR-001.1: admin phải đặt được 公開区分 cho 商品",
    "Vé cũ nhận giá trị mặc định 一般 — không đổi hành vi hiện tại",
    "API-UPD", 2, ev="%s §3-1 · %s 07_API API-050, API-054" % (DOC, INV))
imp("System", "NEW", "—", "API đăng ký đoàn",
    "POST đăng ký đoàn + tài khoản người phụ trách đầu tiên (dùng lại hash mật khẩu + mail xác thực của API-066)",
    "CR-001.2: cần đăng ký 団体 và gắn người phụ trách",
    "Không đổi API-066; chỉ dùng lại hàm dùng chung",
    "API-NEW", 1, ev="%s §3-2, §3-8 · %s 1.0" % (DOC, EST))
imp("System", "NEW", "—", "API thông tin đoàn (user)",
    "GET / PUT thông tin đoàn, 請求先, 領収書宛名 cho người phụ trách đang đăng nhập",
    "CR-001.6: マイページ đoàn xem / sửa thông tin đoàn và 請求先",
    "Không ảnh hưởng API user hiện có",
    "API-NEW", 1, ev="%s §3-6 · %s 8.0, 17.0" % (DOC, EST))
imp("System", "NEW", "—", "API người phụ trách của đoàn (拡張案)",
    "Liệt kê / mời / gỡ người phụ trách; cập nhật thông tin người phụ trách",
    "CR-001.2: 1 đoàn có nhiều người phụ trách",
    "Không ảnh hưởng API hiện có",
    "API-NEW", 2, md_note=EXT + " — phụ thuộc CQ-015", ev="%s §3-2, §3-8 · %s 10.0" % (DOC, EST), question="CQ-015")
imp("System", "NEW", "—", "API đặt chỗ đoàn",
    "POST tạo đặt chỗ đoàn: kiểm lịch bán, sức chứa, số trẻ / người lớn / nhóm tuổi, 当日責任者, 備考, cách thanh toán; dùng lại service tạo booking + GMO của API-070",
    "CR-001.3: đặt chỗ đoàn có dữ liệu và quy tắc riêng; tách endpoint để không đổi luồng cá nhân",
    "API-070 chỉ bị tách hàm dùng chung (xem dòng IMPACT API-070)",
    "API-NEW", 1, conflict="UNKNOWN", cdetail="Quy tắc sức chứa dùng chung và nhóm tuổi chưa chốt", risk="Medium",
    md_note="Quy mô 1 API nhưng logic nặng — PM xem lại số lượng khi chốt CQ-003 / CQ-010",
    ev="%s §3-3 · %s 25.0" % (DOC, EST), question="CQ-003;CQ-010")
imp("System", "IMPACT", "API-070", "API tạo booking cá nhân",
    "Tách hàm kiểm chỗ trống / tạo giao dịch GMO / gửi mail để API đặt chỗ đoàn dùng lại",
    "CR-001.3: dùng lại logic sẵn có thay vì viết lại",
    "Luồng đặt chỗ cá nhân phải chạy lại hồi quy sau khi tách hàm",
    "API-IMP", 1, risk="Medium", ev="%s 07_API API-070" % INV)
imp("System", "UPD", "API-109;API-112", "API danh sách / chi tiết đặt chỗ của user",
    "Trả thêm đặt chỗ của đoàn mà người phụ trách thuộc về, kèm trạng thái thanh toán, hạn thanh toán, trạng thái 領収書",
    "CR-001.6: マイページ đoàn xem đặt chỗ hiện tại + lịch sử + trạng thái thanh toán",
    "Đặt chỗ cá nhân trả như cũ; cần kiểm quyền: người phụ trách chỉ thấy đặt chỗ của đoàn mình",
    "API-UPD", 2, risk="Medium", ev="%s §3-6 · %s 07_API API-109, API-112" % (DOC, INV))
imp("System", "UPD", "API-111;API-013", "API huỷ đặt chỗ (user / admin)",
    "Tính キャンセル料 theo quy tắc; hoàn tiền = tiền đã trả − phí huỷ; vô hiệu 領収書 đã phát hành",
    "CR-001.4, CR-001.5: キャンセル料, hoàn tiền một phần, 領収書 vô hiệu khi huỷ",
    "Huỷ booking cá nhân hiện hoàn toàn bộ — phải giữ nguyên khi vé không có quy tắc phí huỷ",
    "API-UPD", 2, conflict="UNKNOWN", cdetail="Quy tắc phí huỷ chưa chốt; GMO không có thao tác phí huỷ riêng", risk="High",
    md_note="Giải pháp: đổi số tiền giao dịch GMO (như API-015 đang làm) rồi hoàn phần còn lại — chờ CQ-005",
    ev="%s §3-4 · %s 31.0 · %s 07_API API-111, API-013" % (DOC, EST, INV), question="CQ-005")
imp("System", "IMPACT", "API-015;API-073", "API giảm số người / tra giao dịch GMO",
    "Dùng lại cho đổi số người của đoàn và hoàn tiền một phần; kiểm lại khi số tiền có phí huỷ",
    "CR-001.4: hoàn tiền một phần khi đoàn giảm người",
    "API-015 đang đổi số tiền giao dịch GMO — cần kiểm với booking đoàn",
    "API-IMP", 2, ev="%s 07_API API-015, API-073" % INV)
imp("System", "NEW", "—", "API 領収書 (user)",
    "POST phát hành / phát hành lại 領収書 PDF (cùng số, ghi 再発行 từ lần 2, lưu người thao tác + thời điểm); GET lịch sử phát hành",
    "CR-001.5: 領収書 phát hành trên web",
    "Không ảnh hưởng API hiện có; cần thư viện sinh PDF phía server",
    "API-NEW", 2, risk="Medium", md_note="Gồm thư viện sinh PDF (font tiếng Nhật)",
    ev="%s §3-5 · %s 18.0–22.0" % (DOC, EST), question="CQ-008")
imp("System", "NEW", "—", "API quản lý đoàn (admin)",
    "Danh sách + đếm (tìm theo tên đoàn / người phụ trách), chi tiết, tạo, sửa, dừng sử dụng đoàn",
    "CR-001.7: admin đăng ký / sửa / dừng đoàn",
    "Không ảnh hưởng API admin hiện có",
    "API-NEW", 4, ev="%s §3-7 · %s 45.0–49.0" % (DOC, EST))
imp("System", "UPD", "API-017;API-016;API-014", "API danh sách / xuất CSV / đếm đặt chỗ (admin)",
    "Thêm lọc 一般 / 団体, tên đoàn, tên người phụ trách; thêm cột đoàn vào CSV",
    "CR-001.7: tìm đặt chỗ đoàn và phân biệt với đặt chỗ cá nhân, xuất CSV",
    "Bộ lọc cũ giữ nguyên; giới hạn tenant của Admin áp như cũ",
    "API-UPD", 3, ev="%s §3-7 · %s 07_API API-014, API-016, API-017" % (DOC, INV))
imp("System", "NEW", "—", "API 領収書 (admin)",
    "Danh sách / lịch sử phát hành 領収書 của đoàn; admin phát hành lại",
    "CR-001.5, CR-001.7: admin xem lịch sử và phát hành lại",
    "Không ảnh hưởng API admin hiện có",
    "API-NEW", 2, ev="%s §3-5, §3-7 · %s 52.0, 53.0" % (DOC, EST))
imp("System", "NEW", "—", "API xem 操作履歴 (admin)",
    "Danh sách admin_activity_logs có lọc theo đối tượng (đoàn / đặt chỗ / 領収書)",
    "CR-001.7: 操作履歴の確認",
    "Đọc bảng log đang có; cần ghi log thêm ở các API đoàn",
    "API-NEW", 1, ev="%s §3-7 · %s 55.0" % (DOC, EST))
imp("System", "NEW", "—", "API phê duyệt đặt chỗ đoàn (拡張案)",
    "Admin duyệt / từ chối đặt chỗ đoàn ở trạng thái chờ duyệt",
    "CR-001.3: phương án 承認制",
    "Chỉ cần nếu KH chọn 承認制",
    "API-NEW", 1, conflict="UNKNOWN", cdetail="Chưa chốt 即時確定 / 承認制", risk="Medium",
    md_note=EXT + " — bỏ nếu CQ-002 = 即時確定", ev="%s §3-3 · %s 27.0" % (DOC, EST), question="CQ-002")
imp("System", "UPD", "API-061;API-138", "Đăng nhập NextAuth / kiểm tra thông tin admin",
    "Phiên đăng nhập mang thêm organizationId cho người phụ trách đoàn; admin sau khi đúng mật khẩu phải qua bước 二要素認証",
    "CR-001.2, CR-001.8: phân biệt tài khoản đoàn và thêm 二要素認証 cho admin",
    "Mọi màn có đăng nhập đọc session — field thêm không đổi field cũ; luồng đăng nhập admin thêm 1 bước",
    "API-UPD", 2, risk="High", md_note="Có giải pháp: thêm field vào JWT, không đổi enum Role — chờ CQ-013 chọn cách 2FA",
    ev="%s §3-8 · %s 07_API API-061, API-138" % (DOC, INV), question="CQ-013")
imp("System", "NEW", "—", "API 二要素認証 (admin) + xác thực bổ sung người phụ trách (拡張案)",
    "Gửi / kiểm mã xác thực; ghi nhớ thiết bị đã xác thực",
    "CR-001.8: 管理者アカウントの二要素認証, xác thực bổ sung cho người phụ trách",
    "Không ảnh hưởng API hiện có",
    "API-NEW", 2, conflict="UNKNOWN", cdetail="Cách 2FA và phạm vi cho người phụ trách chưa chốt", risk="Medium",
    md_note="1 API admin (最小) + 1 API người phụ trách (" + EXT + ", phụ thuộc CQ-007)",
    ev="%s §3-8 · %s 23.0" % (DOC, EST), question="CQ-007;CQ-013")
imp("System", "NEW", "—", "Job nhắc / quá hạn thanh toán",
    "Job định kỳ: gửi mail trước 支払期限; đánh dấu quá hạn để admin xử lý",
    "CR-001.4, CR-001.9: 支払期限 và mail nhắc trước hạn",
    "Chạy song song các cron hiện có (API-080…API-082) — không đổi chúng",
    "BATCH-NEW", 1, conflict="UNKNOWN", cdetail="Hành động khi quá hạn (tự huỷ hay chỉ báo) chưa chốt", risk="Medium",
    md_note="Phụ thuộc CQ-006", ev="%s §3-4, §3-9 · %s 30.0, 62.0" % (DOC, EST), question="CQ-006")
imp("System", "IMPACT", "API-008;API-075;API-007", "API tính chỗ trống / hàng đợi",
    "Kiểm lại cách tính chỗ trống khi có vé đoàn dùng chung sức chứa",
    "CR-001.3: KH yêu cầu dùng chung sức chứa giữa đặt chỗ thường và đoàn",
    "Nếu vé đoàn không trừ vào sức chứa chung → hiển thị chỗ trống sai, có thể nhận vượt sức chứa",
    "API-IMP", 3, conflict="UNKNOWN", cdetail="Sức chứa đang tính theo lịch của từng vé (max_booking_people, cờ accumulative)", risk="High",
    md_note="Nếu phải đổi logic thành sức chứa theo cơ sở → chuyển thành dòng UPD, PM cộng thêm",
    ev="%s §3-3 · %s 07_API API-007, API-008, API-075" % (DOC, INV), question="CQ-010")
imp("System", "IMPACT", "API-020;API-096;API-097", "Quét barcode / check-in / check-out tại quầy (POS)",
    "Kiểm lại check-in / check-out cho đặt chỗ đoàn đông người và đoàn 店頭払い",
    "CR-001.3, CR-001.4: đoàn đến cơ sở và có thể trả tại quầy",
    "Logic tính tiền tại quầy dựa trên mã theo vé — vé đoàn phải có mã",
    "API-IMP", 3, ev="%s 07_API API-020, API-096, API-097" % INV, question="CQ-017")
imp("System", "IMPACT", "API-023;API-025;API-026;API-027", "API biểu đồ dashboard",
    "Kiểm lại số liệu thống kê khi bookings có thêm đặt chỗ đoàn (1 booking nhiều người)",
    "CR-001.3: đặt chỗ đoàn ghi vào bảng bookings",
    "Số 'booking / user' trên dashboard có thể lệch nếu không tách đoàn",
    "API-IMP", 4, ev="%s 07_API API-023…API-027" % INV)

# ================= DB =================
imp("DB", "NEW", "column:tickets.audience", "公開区分 của vé",
    "Thêm cột tickets.audience (一般 / 団体 / 共通), mặc định 一般",
    "CR-001.1: phân loại vé theo đối tượng",
    "Vé cũ nhận mặc định 一般 → không đổi hành vi; tickets.visibility giữ nguyên nghĩa ẩn / hiện",
    "DB-COL-NEW", 1, ev="%s §3-1 · %s 04_DB_Columns tickets" % (DOC, INV), question="CQ-009")
imp("DB", "NEW", "—", "Bảng organizations + organization_members",
    "organizations: tên đoàn / pháp nhân, địa chỉ, SĐT đại diện, 請求先, 領収書宛名, trạng thái (đang dùng / dừng). organization_members: user_id ↔ organization_id, vai trò trong đoàn",
    "CR-001.2: 団体マスタ và quan hệ 団体–担当者 (nhiều người / đoàn)",
    "Không đổi bảng users; người phụ trách vẫn là users role User",
    "DB-TBL-NEW", 2, ev="%s §3-2 · %s 64.0" % (DOC, EST))
imp("DB", "NEW", "column:bookings.organization_id;column:bookings.responsible_person;column:bookings.note;column:bookings.payment_method;column:bookings.payment_due_at;column:bookings.cancellation_fee",
    "Cột mới của bookings",
    "organization_id (FK organizations), responsible_person (当日責任者), note (備考), payment_method (thẻ / 店頭 / 請求書), payment_due_at (支払期限), cancellation_fee",
    "CR-001.3, CR-001.4: lưu thông tin đặt chỗ đoàn và thanh toán đoàn",
    "Cột nullable — booking cá nhân để trống; không trùng cột hiện có",
    "DB-COL-NEW", 6, risk="Medium", ev="%s §3-3, §3-4 · %s 65.0–67.0" % (DOC, EST), question="CQ-011")
imp("DB", "NEW", "column:bookings.approval_status", "Trạng thái phê duyệt (拡張案)",
    "Thêm cột approval_status cho đặt chỗ đoàn chờ duyệt",
    "CR-001.3: phương án 承認制",
    "Cột nullable; không đổi enum BookingStatus đang dùng ở hàng đợi / quét mã",
    "DB-COL-NEW", 1, conflict="UNKNOWN", cdetail="Chưa chốt 承認制", md_note=EXT + " — bỏ nếu CQ-002 = 即時確定",
    ev="%s §3-3" % DOC, question="CQ-002")
imp("DB", "NEW", "—", "Bảng receipts + receipt_histories",
    "receipts: receipt_no (duy nhất, dùng lại khi phát hành lại), booking_id, 宛名, số tiền, trạng thái (有効 / 無効), first_issued_at; receipt_histories: lần phát hành, người thao tác, thời điểm, 宛名 trước / sau",
    "CR-001.5: lưu trạng thái phát hành, 再発行, lịch sử đổi 宛名, vô hiệu khi huỷ",
    "Không ảnh hưởng bảng hiện có",
    "DB-TBL-NEW", 2, ev="%s §3-5 · %s 65.0" % (DOC, EST), question="CQ-008")
imp("DB", "IMPACT", "table:ticket_booking_schedules", "Sức chứa theo lịch vé",
    "Kiểm lại max_booking_people / max_booking_people_accumulative khi vé đoàn và vé cá nhân phải dùng chung sức chứa",
    "CR-001.3: dùng chung sức chứa cơ sở",
    "Nếu sức chứa đang theo từng vé → có thể phải đổi cách lưu (khi đó thêm dòng UPD)",
    "DB-IMP", 1, conflict="UNKNOWN", cdetail="Cấu trúc sức chứa hiện theo vé, yêu cầu theo cơ sở", risk="High",
    md_note="Giải pháp tạm: vé đoàn dùng chung lịch với vé cá nhân qua cờ accumulative — chờ CQ-010",
    ev="%s 04_DB_Columns ticket_booking_schedules" % INV, question="CQ-010")
imp("DB", "IMPACT", "table:users", "Bảng users",
    "Người phụ trách đoàn là bản ghi users (role User) gắn với organization_members",
    "CR-001.2: tài khoản riêng cho từng người phụ trách",
    "Màn ユーザー管理 (SC-040) và thống kê user sẽ đếm cả người phụ trách đoàn",
    "DB-IMP", 1, ev="%s 03_DB_Tables users" % INV)
imp("DB", "IMPACT", "table:admin_activity_logs", "Bảng log thao tác admin",
    "Ghi thêm activity_type mới (đoàn, 領収書, phê duyệt); activity_type là text nên không cần migration",
    "CR-001.7: 操作履歴の確認 và lưu người thao tác phát hành lại 領収書",
    "Không đổi log hiện có",
    "DB-IMP", 1, ev="inputs/tokiwagi/prisma/schema.prisma model AdminActivityLog (activityType String)")
imp("DB", "IMPACT", "table:email_settings", "Bảng mẫu email",
    "Thêm bản ghi mẫu mail mới (email_key mới) qua migration dữ liệu",
    "CR-001.9: mail cho sự kiện đoàn",
    "Mẫu cũ giữ nguyên",
    "DB-IMP", 1, ev="%s 03_DB_Tables email_settings" % INV)

# ================= Business =================
imp("Business", "NEW", "—", "Quy tắc 公開区分",
    "Vé 一般 chỉ hiện ở trang thường; vé 団体 chỉ hiện ở trang đoàn; vé 共通 hiện cả hai",
    "CR-001.1: KH yêu cầu trang thường không hiện vé đoàn và ngược lại", "Không đổi quy tắc ẩn / hiện bằng visibility",
    "BIZ-NEW", 1, ev="%s §3-1" % DOC, question="CQ-009")
imp("Business", "NEW", "—", "Đăng ký và trạng thái đoàn",
    "Đăng ký đoàn + người phụ trách đầu tiên, xác thực email; admin dừng đoàn → người phụ trách không đặt mới được",
    "CR-001.2, CR-001.7: cần quy trình đăng ký đoàn và quyền dừng đoàn của admin", "Không đổi đăng ký cá nhân",
    "BIZ-NEW", 1, conflict="UNKNOWN", cdetail="Phạm vi đoàn được đăng ký chưa chốt",
    ev="%s §3-2, §3-7" % DOC, question="CQ-001")
imp("Business", "NEW", "—", "Quy tắc đặt chỗ đoàn",
    "Số người tối thiểu, số trẻ / người lớn, nhóm tuổi, 当日責任者 bắt buộc, 備考",
    "CR-001.3: đặt chỗ đoàn có dữ liệu bắt buộc khác đặt chỗ cá nhân", "Đặt chỗ cá nhân không đổi",
    "BIZ-NEW", 1, conflict="UNKNOWN", cdetail="Số người tối thiểu, cách nhập tuổi, điều kiện 引率者 chưa chốt",
    ev="%s §3-3, §6" % DOC, question="CQ-001;CQ-003")
imp("Business", "NEW", "—", "Phê duyệt đặt chỗ đoàn (拡張案)",
    "Đặt chỗ đoàn ở trạng thái chờ duyệt cho tới khi admin duyệt; giữ chỗ trong lúc chờ",
    "CR-001.3: KH xin phương án xác nhận sau khi admin phê duyệt", "Chỉ áp dụng khi chọn 承認制",
    "BIZ-NEW", 1, conflict="UNKNOWN", cdetail="Chưa chốt 承認制", md_note=EXT + " — bỏ nếu CQ-002 = 即時確定",
    ev="%s §3-3" % DOC, question="CQ-002")
imp("Business", "UPD", "column:tickets.payment_type", "Cách thanh toán",
    "Đoàn chọn thẻ đại diện hoặc 店頭払い khi đặt (theo booking), thay vì cố định theo vé",
    "CR-001.4: 決済 đoàn hỗ trợ thẻ và 店頭払い",
    "Hiện tickets.payment_type (Online / Offline) quyết định luồng thanh toán của mọi booking theo vé",
    "BIZ-UPD", 1, conflict="Yes",
    cdetail="Quy tắc hiện tại: cách thanh toán cố định theo vé (tickets.payment_type). Yêu cầu: chọn theo booking. Hai mô hình mâu thuẫn nếu dùng chung vé.",
    risk="High", md_note="Hướng xử lý: vé đoàn tách 2 vé (Online / Offline) để giữ mô hình cũ, hoặc thêm bookings.payment_method — chờ CQ-011",
    ev="%s §3-4 · %s 04_DB_Columns tickets.payment_type" % (DOC, INV), question="CQ-011")
imp("Business", "NEW", "—", "支払期限",
    "Đặt chỗ đoàn chưa trả có hạn thanh toán; quá hạn → báo admin (hoặc tự huỷ tuỳ quyết định)",
    "CR-001.4: KH yêu cầu 支払期限の設定 cho thanh toán đoàn", "Đặt chỗ cá nhân không có hạn thanh toán",
    "BIZ-NEW", 1, conflict="UNKNOWN", cdetail="Ai đặt hạn (người dùng / hệ thống) và xử lý quá hạn chưa chốt",
    ev="%s §3-4 · %s 30.0" % (DOC, EST), question="CQ-006")
imp("Business", "NEW", "—", "キャンセル料",
    "Tính phí huỷ theo mốc thời gian; hoàn tiền = đã trả − phí huỷ",
    "CR-001.4: KH yêu cầu キャンセル料の計算 khi đoàn huỷ", "Huỷ hiện hoàn toàn bộ",
    "BIZ-NEW", 1, conflict="UNKNOWN", cdetail="Mức phí chung hay theo vé / cơ sở chưa chốt", risk="Medium",
    md_note="Mức chung toàn hệ thống = 1 rule; theo vé / cơ sở là " + EXT,
    ev="%s §3-4 · %s 31.0" % (DOC, EST), question="CQ-005")
imp("Business", "UPD", "API-015", "Đổi số người / hoàn tiền một phần",
    "Người phụ trách đoàn được đổi số người / ngày từ マイページ trong hạn; hoàn phần chênh lệch",
    "CR-001.4, CR-001.6: 人数変更・一部返金",
    "Hiện giảm số người (API-015) chỉ có ở phía admin",
    "BIZ-UPD", 1, risk="Medium", ev="%s §3-3, §3-4 · %s 07_API API-015" % (DOC, INV), question="CQ-004")
imp("Business", "NEW", "—", "請求書払い (拡張案)",
    "Đặt chỗ đoàn trả bằng hoá đơn: phát hành 請求書, theo dõi trạng thái đã trả",
    "CR-001.4: 請求書払い — KH đang xác nhận",
    "Không ảnh hưởng thanh toán hiện tại",
    "BIZ-NEW", 1, conflict="UNKNOWN", cdetail="KH chưa quyết có dùng 請求書払い", md_note=EXT + " — chỉ tính khi CQ-006 = có",
    ev="%s §3-4, §6" % DOC, question="CQ-006")
imp("Business", "NEW", "—", "Quy tắc 領収書",
    "Phát hành lần đầu / phát hành lại cùng số + ghi 再発行; đổi 宛名 lưu lịch sử; huỷ / hoàn tiền → 領収書 vô hiệu hoặc hiển thị 取消",
    "CR-001.5: KH yêu cầu phát hành / phát hành lại / vô hiệu 領収書 trên web", "Thay quy tắc 'chỉ phát hành tại quầy' bằng phát hành trên web cho đoàn",
    "BIZ-NEW", 3, conflict="UNKNOWN", cdetail="Nội dung bắt buộc theo kế toán chưa chốt",
    ev="%s §3-5 · SC-071 REPO-01:src/pages/user/my-page/booking-history/[id].tsx#L730" % DOC, question="CQ-008")
imp("Business", "NEW", "—", "二要素認証 và thông báo đổi thông tin quan trọng",
    "Admin luôn 2FA; người phụ trách xác thực bổ sung khi thiết bị mới / thao tác quan trọng (拡張案); mail thông báo khi đổi email / 請求先 / thông tin đoàn",
    "CR-001.8: KH yêu cầu 二要素認証 admin, xác thực bổ sung và thông báo đổi thông tin", "Đăng nhập cá nhân không đổi",
    "BIZ-NEW", 2, conflict="UNKNOWN", cdetail="Phạm vi xác thực bổ sung cho người phụ trách chưa chốt",
    md_note="1 rule admin 2FA + 1 rule thông báo; xác thực bổ sung người phụ trách là " + EXT,
    ev="%s §3-8" % DOC, question="CQ-007;CQ-013")
imp("Business", "IMPACT", "API-017", "Giới hạn tenant của Admin",
    "Áp quy tắc 'Admin chỉ thấy dữ liệu tenant mình' cho màn / API đoàn và 領収書 mới",
    "CR-001.7: 店舗管理者 chỉ thấy đặt chỗ đoàn của cơ sở mình",
    "Quy tắc đang có — chỉ phải áp thêm vào chức năng mới",
    "BIZ-IMP", 1, ev="%s 07_API API-017" % INV)
imp("Business", "IMPACT", "column:tickets.max_child_per_adult", "Tỷ lệ trẻ / người lớn",
    "Kiểm quy tắc giới hạn số trẻ trên 1 người lớn cho vé đoàn (đoàn mẫu giáo: nhiều trẻ, ít người lớn)",
    "CR-001.3: đoàn nhập số trẻ và số 引率者",
    "Cột theo vé → vé đoàn đặt giá trị riêng được, không đổi vé cũ",
    "BIZ-IMP", 1, ev="%s 04_DB_Columns tickets.max_child_per_adult" % INV, question="CQ-003")
imp("Business", "IMPACT", "table:ticket_booking_schedules", "Sức chứa dùng chung",
    "Đặt chỗ thường và đoàn phải trừ cùng sức chứa cơ sở",
    "CR-001.3: 一般予約と団体予約で施設定員を共有",
    "Nếu không xử lý: vượt sức chứa thực tế",
    "BIZ-IMP", 1, conflict="UNKNOWN", cdetail="Sức chứa đang theo lịch từng vé", risk="High",
    md_note="Xem CQ-010; nếu phải đổi mô hình sức chứa → chuyển thành BIZ-UPD",
    ev="%s §3-3" % DOC, question="CQ-010")

# ================= Screen =================
WEB02_NEW = [
    ("Đăng ký đoàn (団体登録)", "Form thông tin đoàn + người phụ trách đầu tiên + mật khẩu", "SCR-NEW-M", "CR-001.2", "1.0"),
    ("Trang đặt chỗ đoàn (団体専用予約)", "URL riêng: chọn 店舗, ngày giờ, vé đoàn, số trẻ / người lớn / nhóm tuổi, 当日責任者, 備考", "SCR-NEW-L", "CR-001.1, CR-001.3", "25.0"),
    ("Xác nhận đặt chỗ đoàn + chọn cách thanh toán", "Xác nhận nội dung, chọn thẻ / 店頭払い, đồng ý 免責事項", "SCR-NEW-M", "CR-001.3, CR-001.4", "28.0"),
    ("マイページ đoàn — thông tin đoàn / 請求先", "Xem + sửa thông tin đoàn, 請求先, 領収書宛名", "SCR-NEW-M", "CR-001.6", "7.0, 8.0, 17.0"),
    ("マイページ đoàn — 領収書", "Danh sách 領収書 theo đặt chỗ, chỉ định 宛名, tải PDF, ghi 再発行", "SCR-NEW-M", "CR-001.5", "18.0–21.0"),
]
for name, ch, rate, cr, est in WEB02_NEW:
    imp("Screen", "NEW", "—", "[WEB-02] " + name, ch, "%s: màn chưa có ở WEB-02" % cr,
        "Màn mới — không đổi màn hiện có", rate, 1, ev="%s · %s %s" % (DOC, EST, est))
imp("Screen", "NEW", "—", "[WEB-02] マイページ đoàn — người phụ trách (拡張案)",
    "Danh sách người phụ trách, mời / gỡ, sửa thông tin", "CR-001.2, CR-001.6: nhiều người phụ trách",
    "Màn mới", "SCR-NEW-M", 1, md_note=EXT + " — phụ thuộc CQ-015", ev="%s §3-6 · %s 10.0" % (DOC, EST), question="CQ-015")
imp("Screen", "NEW", "—", "[WEB-02] Nhập mã xác thực bổ sung (拡張案)",
    "Màn / popup nhập mã khi thiết bị mới hoặc thao tác quan trọng", "CR-001.8: xác thực bổ sung cho người phụ trách khi thiết bị mới / thao tác quan trọng",
    "Màn mới", "SCR-NEW-S", 1, conflict="UNKNOWN", cdetail="Chưa chốt có dùng", md_note=EXT + " — phụ thuộc CQ-007",
    ev="%s §3-8 · %s 23.0" % (DOC, EST), question="CQ-007")
imp("Screen", "UPD", "SC-070;SC-071", "予約履歴 list / chi tiết",
    "Hiện đặt chỗ đoàn, trạng thái thanh toán, hạn thanh toán, nút 領収書; bỏ câu '領収書は店頭にて発行…' với đặt chỗ đoàn",
    "CR-001.5, CR-001.6: người phụ trách xem đặt chỗ đoàn và phát hành 領収書",
    "Đặt chỗ cá nhân hiển thị như cũ", "SCR-UPD-M", 2,
    ev="%s §3-6 · REPO-01:src/pages/user/my-page/booking-history/[id].tsx#L730" % DOC)
imp("Screen", "UPD", "SC-076", "予約変更",
    "Đặt chỗ đoàn: đổi số người theo nhóm tuổi, đổi ngày, 当日責任者, hiện phí / hoàn tiền dự kiến",
    "CR-001.3, CR-001.6: 人数変更・日程変更", "Đổi đặt chỗ cá nhân giữ nguyên",
    "SCR-UPD-M", 1, ev="%s §3-3 · %s 14.0" % (DOC, EST), question="CQ-004")
imp("Screen", "UPD", "SC-063", "ログイン",
    "Sau đăng nhập, người phụ trách đoàn chuyển tới マイページ đoàn; thêm link đăng ký đoàn",
    "CR-001.2: đăng nhập bằng tài khoản người phụ trách", "Đăng nhập cá nhân giữ nguyên",
    "SCR-UPD-S", 1, ev="%s §3-8 · %s 4.0" % (DOC, EST))
imp("Screen", "IMPACT", "SC-067;SC-048;SC-049;SC-054;SC-059", "Màn người dùng hiển thị vé",
    "Kiểm không còn hiện vé 団体 sau khi API-107 lọc 公開区分",
    "CR-001.1: 一般予約画面に団体向け商品を表示しない",
    "Màn gọi API-107 (liên kết suy từ import tĩnh)", "SCR-IMP", 5,
    conflict="UNKNOWN", cdetail="Danh sách màn gọi API-107 là suy luận, có thể dư / thiếu",
    ev="%s 07_API API-107 Called By" % INV, question="CQ-016")
WEB01_NEW = [
    ("Admin — danh sách đoàn", "Tìm theo tên đoàn / người phụ trách, trạng thái", "SCR-NEW-M", "CR-001.7", "45.0"),
    ("Admin — tạo / sửa đoàn", "Form thông tin đoàn, 請求先, 領収書宛名", "SCR-NEW-M", "CR-001.7", "46.0, 48.0"),
    ("Admin — chi tiết đoàn", "Thông tin đoàn, danh sách người phụ trách, đặt chỗ, dừng sử dụng", "SCR-NEW-M", "CR-001.7", "47.0, 49.0"),
    ("Admin — lịch sử 領収書", "Trạng thái phát hành, lịch sử, phát hành lại", "SCR-NEW-M", "CR-001.5, CR-001.7", "52.0, 53.0"),
    ("Admin — 操作履歴", "Danh sách log thao tác có lọc", "SCR-NEW-S", "CR-001.7", "55.0"),
    ("Admin — nhập mã 二要素認証", "Bước nhập mã sau đăng nhập", "SCR-NEW-S", "CR-001.8", "23.0"),
]
for name, ch, rate, cr, est in WEB01_NEW:
    imp("Screen", "NEW", "—", "[WEB-01] " + name, ch, "%s: màn chưa có ở WEB-01" % cr,
        "Màn mới — không đổi màn hiện có", rate, 1, ev="%s · %s %s" % (DOC, EST, est),
        question="CQ-013" if "二要素" in name else "")
imp("Screen", "UPD", "SC-004", "予約管理",
    "Thêm lọc 一般 / 団体, tên đoàn, người phụ trách; cột đoàn; CSV có cột đoàn; (拡張案) lọc chờ duyệt",
    "CR-001.7: tìm và phân biệt đặt chỗ đoàn", "Bộ lọc cũ giữ nguyên", "SCR-UPD-M", 1,
    ev="%s §3-7 · %s 50.0" % (DOC, EST))
imp("Screen", "UPD", "SC-005;SC-007", "Chi tiết / sửa đặt chỗ (admin)",
    "Hiện thông tin đoàn, 当日責任者, cách / hạn thanh toán, 領収書; (拡張案) nút duyệt / từ chối",
    "CR-001.7: admin xem / đổi / huỷ đặt chỗ đoàn", "Đặt chỗ cá nhân hiển thị như cũ", "SCR-UPD-M", 2,
    conflict="UNKNOWN", cdetail="SC-005 / SC-007 chưa quan sát được UI ở baseline (To verify)",
    ev="%s §3-7 · %s 02_Screen SC-005, SC-007" % (DOC, INV), question="CQ-012")
imp("Screen", "UPD", "SC-035;SC-036;SC-037;SC-038", "商品管理 list / tạo / sửa / xem",
    "Thêm field 公開区分 (form) và cột / bộ lọc 公開区分 (list)",
    "CR-001.1: admin đặt 公開区分 cho 商品", "Vé cũ hiển thị mặc định 一般", "SCR-UPD-S", 4,
    conflict="UNKNOWN", cdetail="SC-037 / SC-038 chưa quan sát được UI ở baseline (To verify)",
    ev="%s §3-1 · %s 40.0–44.0 · %s 02_Screen" % (DOC, EST, INV), question="CQ-012")
imp("Screen", "UPD", "SC-027", "Đăng nhập admin",
    "Sau khi đúng mật khẩu chuyển sang bước nhập mã 二要素認証",
    "CR-001.8: 管理者アカウントの二要素認証", "Mọi role admin bị thêm 1 bước đăng nhập", "SCR-UPD-S", 1,
    risk="Medium", ev="%s §3-8 · %s 02_Screen SC-027" % (DOC, INV), question="CQ-013")
imp("Screen", "IMPACT", "SC-009;SC-044", "在庫調整 / 空き状況",
    "Kiểm số chỗ trống khi có đặt chỗ đoàn", "CR-001.3: dùng chung sức chứa",
    "Có thể hiển thị sai chỗ trống nếu vé đoàn không trừ chung", "SCR-IMP", 2,
    conflict="UNKNOWN", cdetail="Phụ thuộc quyết định sức chứa", risk="High",
    md_note="Xử lý cùng CQ-010", ev="%s 02_Screen SC-009, SC-044" % INV, question="CQ-010")
imp("Screen", "IMPACT", "SC-003;SC-026", "バーコード読み取り / 入場状況管理",
    "Kiểm check-in / check-out đặt chỗ đoàn đông người", "CR-001.3: đoàn đến cơ sở",
    "Thao tác tại quầy với 1 barcode nhiều người", "SCR-IMP", 2, ev="%s 02_Screen SC-003, SC-026" % INV)
imp("Screen", "IMPACT", "SC-012;SC-025;SC-040;SC-014", "Dashboard / 売上管理 / ユーザー管理 / 自動返信メール設定",
    "Kiểm số liệu và danh sách khi có đặt chỗ, người dùng và mẫu mail của đoàn",
    "CR-001.2, CR-001.3, CR-001.9: dữ liệu đoàn ghi vào bảng chung",
    "Thống kê / danh sách có thể lẫn dữ liệu đoàn", "SCR-IMP", 4,
    ev="%s 02_Screen SC-012, SC-014, SC-025, SC-040" % INV)

# ================= ThirdParty =================
imp("ThirdParty", "UPD", "EXT-001", "GMO Payment Gateway",
    "Thanh toán thẻ đại diện (dùng lại), đổi số tiền giao dịch để thu phí huỷ / hoàn một phần",
    "CR-001.4: キャンセル料, 一部返金 qua giao dịch thẻ",
    "Không thêm config key; dùng GMO_API_URL, GMO_SHOP_PASS, GMO_SITE_ID, GMO_SITE_PASS đang có",
    "EXT-UPD", 1, conflict="UNKNOWN", cdetail="GMO không có thao tác phí huỷ riêng (ghi chú 見積書 31.0) — cần cách đổi số tiền / huỷ 1 phần", risk="High",
    md_note="Cần test kết nối GMO môi trường test", ev="%s §3-4 · %s 31.0 · %s 09_Integration EXT-001" % (DOC, EST, INV), question="CQ-005")
imp("ThirdParty", "IMPACT", "EXT-002;EXT-003", "Gửi email (AWS SES / SMTP)",
    "Gửi thêm loại mail đoàn, mail nhắc hạn thanh toán, mail mã xác thực",
    "CR-001.8, CR-001.9", "Tăng số mail gửi; không thêm config key", "EXT-IMP", 1,
    ev="%s 09_Integration EXT-002, EXT-003" % INV)
imp("ThirdParty", "IMPACT", "EXT-006", "Smaregi (POS)",
    "Vé đoàn trả tại quầy cần mã Smaregi QR / OBIC để tính tiền và đối soát",
    "CR-001.4: 店頭払い", "Đối soát cuối ngày (API-079) có thêm giao dịch đoàn", "EXT-IMP", 1,
    conflict="UNKNOWN", cdetail="Chưa rõ vé đoàn có mã riêng", ev="%s 09_Integration EXT-006" % INV, question="CQ-017")
imp("ThirdParty", "NEW", "—", "Dịch vụ 請求書払い (拡張案)",
    "Liên kết dịch vụ thanh toán bằng hoá đơn (OUTBOUND); config key dự kiến: tên key theo nhà cung cấp — chưa xác định",
    "CR-001.4: 請求書払い — KH đang xác nhận",
    "Không ảnh hưởng liên kết hiện có", "EXT-NEW", 1, conflict="UNKNOWN", cdetail="Chưa chọn nhà cung cấp / chưa quyết có dùng",
    md_note=EXT + " — bỏ nếu CQ-006 chỉ quản lý trạng thái thủ công", ev="%s §3-4, §6 · %s 33.0" % (DOC, EST), question="CQ-006")

# ================= Mockup =================
imp("Mockup", "NEW", "DS:WEB-02:primary;DS:WEB-02:text-16;DS-component:WEB-02:TextField;DS-component:WEB-02:Button;DS-component:WEB-02:Card;DS-component:WEB-02:Radio;DS-component:WEB-02:Select;DS-component:WEB-02:Checkbox",
    "Mockup màn mới WEB-02",
    "7 màn mới (đăng ký đoàn, trang đặt chỗ đoàn, xác nhận + thanh toán, thông tin đoàn, 領収書, người phụ trách, nhập mã) theo Design System WEB-02",
    "CR-001.1–CR-001.8: màn mới phía người dùng", "Dùng lại token / component đang có", "UI-NEW", 7,
    md_note="2 màn thuộc " + EXT + " (người phụ trách, nhập mã)", ev="ver1/04_DesignSystem/WEB-02/project/README.md")
imp("Mockup", "NEW", "DS:WEB-01:primary;DS:WEB-01:text-14;DS-component:WEB-01:Table;DS-component:WEB-01:TextField;DS-component:WEB-01:Button;DS-component:WEB-01:PageHeader;DS-component:WEB-01:Pagination",
    "Mockup màn mới WEB-01",
    "6 màn admin mới (danh sách / form / chi tiết đoàn, lịch sử 領収書, 操作履歴, nhập mã 2FA) theo Design System WEB-01",
    "CR-001.7, CR-001.8: màn quản trị mới", "Dùng lại token / component đang có", "UI-NEW", 6,
    ev="ver1/04_DesignSystem/WEB-01/project/README.md")
imp("Mockup", "UPD", "DS-component:WEB-02:Card;DS-component:WEB-02:Button;DS-component:WEB-01:Table;DS-component:WEB-01:Select",
    "Sửa mockup màn hiện có",
    "WEB-02: SC-070, SC-071, SC-076, SC-063; WEB-01: SC-004, SC-005, SC-007, SC-035, SC-036, SC-037, SC-038, SC-027",
    "Các màn UPD ở trục Screen", "Giữ bố cục cũ, thêm khối / field", "UI-UPD", 12,
    ev="ver1/01_Screens/BasicDesign_WEB-01_ver1.xlsx · BasicDesign_WEB-02_ver1.xlsx")
imp("Mockup", "NEW", "DS-component:WEB-02:Badge", "Badge cho WEB-01",
    "Badge trạng thái 一般 / 団体, 発行済 / 再発行 / 無効, 承認待ち trên admin — WEB-01 chưa có Badge (TBD)",
    "CR-001.5, CR-001.7: phân biệt trạng thái trên danh sách admin",
    "Không đổi component cũ", "UI-TOKEN-NEW", 1, conflict="UNKNOWN", cdetail="STATUS.md WEB-01: Badge = TBD",
    md_note="Đề xuất lấy mẫu Badge của WEB-02 — designer xác nhận", ev="ver1/04_DesignSystem/WEB-01/STATUS.md D6 Badge", question="CQ-014")
imp("Mockup", "NEW", "DS-component:WEB-01:Table;DS-component:WEB-01:Modal", "Table + Modal cho WEB-02",
    "Danh sách 領収書 / người phụ trách cần Table; nhập mã / xác nhận huỷ cần Modal — WEB-02 chưa có (TBD)",
    "CR-001.5, CR-001.6, CR-001.8", "Không đổi component cũ", "UI-TOKEN-NEW", 2, conflict="UNKNOWN",
    cdetail="STATUS.md WEB-02: Table, Modal = TBD", md_note="Đề xuất lấy mẫu của WEB-01 — designer xác nhận",
    ev="ver1/04_DesignSystem/WEB-02/STATUS.md D6 Table, Modal", question="CQ-014")
imp("Mockup", "NEW", "DS:WEB-02:text-14;DS:WEB-02:text-high", "Mẫu PDF 領収書",
    "Layout 領収書 PDF (宛名, số tiền, ngày thanh toán, cơ sở, ngày dùng, tên vé, 税区分, dấu 再発行 / 取消)",
    "CR-001.5: 領収書 PDF là tài liệu mới cần thiết kế layout", "Tài liệu in mới, không thuộc màn hiện có", "UI-NEW", 1, conflict="UNKNOWN",
    cdetail="Nội dung theo kế toán chưa chốt", ev="%s §3-5" % DOC, question="CQ-008")

cr = {"meta": meta, "justification": justification, "not_cr": not_cr, "no_impact_axes": no_impact_axes,
      "questions": Q, "impacts": I}
with open(OUT, "w", encoding="utf8") as fh:
    json.dump(cr, fh, ensure_ascii=False, indent=1)
print("impacts", len(I), "questions", len(Q))
