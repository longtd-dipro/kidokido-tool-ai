"""
Tạo file ETA với 2 sheet: ETA_01 và ETA_02
Chỉ điền cột M (実装/Coding). Các cột còn lại dùng công thức.
"""
import openpyxl
from openpyxl.styles import (
    Font, PatternFill, Alignment, Border, Side, numbers
)
from openpyxl.utils import get_column_letter

# ── Colors ──────────────────────────────────────────────────────
C_HEADER    = "FF31859B"   # teal – header row
C_HEADER_EN = "FFF2DBDB"   # light pink – EN columns in header
C_CATROW    = "FFDAEEF3"   # light blue – category rows (要件定義, DB設計…)
C_TASK      = "FFF2F2F2"   # light gray – task rows
C_WHITE     = "FFFFFFFF"

def fill(hex_color):
    return PatternFill("solid", fgColor=hex_color)

def font(bold=False, color="FF000000", size=10):
    return Font(bold=bold, color=color, size=size, name="Calibri")

def align(h="left", v="center", wrap=True):
    return Alignment(horizontal=h, vertical=v, wrap_text=wrap)

def thin_border(color=C_WHITE):
    s = Side(border_style="thin", color=color)
    return Border(left=s, right=s, top=s, bottom=s)

# ── Column map ───────────────────────────────────────────────────
#  B=No, C=Cat JP, D=Cat EN, E=Item JP, F=Item EN,
#  G=Sub JP, H=Sub EN, I=Detail,
#  J=Analysis, K=Design, L=BasicDesign, M=Coding,
#  N=UnitTest, O=IntegTest, P=Sum, Q=Note
COLS = {
    "no":  "B", "cat_jp": "C", "cat_en": "D",
    "itm_jp": "E", "itm_en": "F",
    "sub_jp": "G", "sub_en": "H", "detail": "I",
    "J": "J", "K": "K", "L": "L", "M": "M",
    "N": "N", "O": "O", "P": "P", "note": "Q",
}
COL_WIDTHS = {
    "B": 6, "C": 36, "D": 30, "E": 22, "F": 22,
    "G": 32, "H": 28, "I": 48,
    "J": 12, "K": 12, "L": 12, "M": 12,
    "N": 12, "O": 12, "P": 12, "Q": 50,
}

# ── Task data ────────────────────────────────────────────────────
# Row type:
#   "header"   – 2 rows merged (rows 7+8), no data rows
#   "catrow"   – category-only row, J-O='-', P=fixed value
#   "task"     – actual task row with M value
#
# task tuple: (cat_jp, cat_en, itm_jp, itm_en, sub_jp, sub_en, detail, m_val, has_design, note)
#   has_design=True  → K formula included
#   has_design=False → K = 0

ETA_01 = {
    "title": "ETA_01 — Bổ sung OBIC cho Shop (Smaregi)  ※ Junior Lv.2",
    "rows": [
        # ── Requirements ──────────────────────────────────────────
        ("catrow", "要件定義", "Requirements definition",
         "業務フロー確認", "Confirm Flow nghiệp vụ",
         "", "", "", "-", False, "", 1.5),
        ("catrow", "", "Requirements definition",
         "ビジネス確認", "Confirm nội dung nghiệp vụ",
         "", "", "", "-", False, "", 1.5),

        # ── DB Design ─────────────────────────────────────────────
        ("catrow", "DB設計", "DB Design",
         "ShopObicMapping / DailySummary テーブル設計",
         "Thiết kế bảng ShopObicMapping và ShopObicDailySummary",
         "", "", "ShopObicMapping, ShopObicDailySummary, UnmappedShopTransaction — 3 bảng mới, quan hệ với Tenant và Smaregi product",
         "-", False, "", 4.0),

        # ── Admin side ────────────────────────────────────────────
        ("task", "WEBシステム（管理側)", "Web System for Admin",
         "Smaregi API 連携", "Smaregi API Integration",
         "商品情報API取得", "Get product list from Smaregi API",
         "Gọi Smaregi API lấy danh sách sản phẩm shop của tenant. Cache danh sách để tránh gọi lại liên tục.",
         3.5, False,
         "API Smaregi lần đầu tiếp cận: cần đọc doc kỹ, setup OAuth token, xử lý pagination, test response format với dữ liệu thực của từng tenant"),

        ("task", "", "",
         "Smaregi API 連携", "Smaregi API Integration",
         "取引・取引明細API取得", "Get transactions & details from Smaregi API",
         "Gọi Smaregi API lấy transactions hoàn tất trong ngày (completed sales). Xử lý pagination. Lọc theo store và business_date.",
         4.5, False,
         "Transaction API phức tạp hơn product: phân loại đúng sale/return/cancel, handle timezone theo giờ đóng cửa store, test với nhiều edge case"),

        ("task", "", "",
         "商品-OBICコードマッピング", "Product–OBIC Code Mapping",
         "マッピング管理画面", "Mapping management screen",
         "Màn hình Admin: bảng danh sách sản phẩm Smaregi | OBIC code (input field) | Last updated. Nút Save Changes. Filter tìm theo tên sản phẩm.",
         4.5, True,
         "Bảng có thể có hàng trăm sản phẩm: cần phân trang hoặc virtual scroll, inline edit nhiều dòng cùng lúc, save batch đảm bảo atomic"),

        ("task", "", "",
         "商品-OBICコードマッピング", "Product–OBIC Code Mapping",
         "CSVインポート", "CSV bulk import with validation",
         "Upload CSV. Validate từng row độc lập. Lỗi → trả danh sách lỗi kèm số dòng, không import một phần. Thành công → ghi đè mapping + log lịch sử.",
         3.5, False,
         "Xử lý encoding CSV (UTF-8/Shift-JIS), build error report rõ từng row, đảm bảo không import partial khi có dòng lỗi xen kẽ"),

        ("task", "", "",
         "商品-OBICコードマッピング", "Product–OBIC Code Mapping",
         "CSVテンプレートエクスポート", "CSV template download",
         "Download CSV template với header chuẩn kèm danh sách sản phẩm Smaregi hiện tại (product_id, tên). OBIC code cột để trống.",
         1.5, False,
         "Cần call Smaregi API thực tế tại thời điểm export để đảm bảo product list luôn mới nhất"),

        ("task", "", "",
         "日次集計クロンジョブ", "Daily Aggregation Cron Job",
         "クロンジョブ実装", "Cron job implementation",
         "Cron job chạy hàng ngày. Lấy transactions hôm trước. Group by store×date×obic_code → net sales (trừ return/cancel). Lưu DB. Idempotent khi re-run.",
         7.0, False,
         "Logic phức tạp nhất của ETA_01: groupby nhiều chiều, net sales sau return/discount, transaction atomicity khi ghi DB, retry khi Smaregi API lỗi, idempotent (chạy lại không tạo duplicate)"),

        ("task", "", "",
         "日次集計クロンジョブ", "Daily Aggregation Cron Job",
         "未マッピング商品ログ", "Unmapped products logging",
         "Sản phẩm chưa map OBIC → ghi UnmappedShopTransaction, không block job chính. Hiển thị số lượng unmapped trong admin.",
         2.5, False,
         "Phải chạy trong cùng transaction với cron job chính mà không block, cần UI admin hiển thị danh sách để xử lý sau"),

        ("task", "", "",
         "日次集計クロンジョブ", "Daily Aggregation Cron Job",
         "手動再集計機能", "Manual re-run for specific date",
         "Admin chọn date + store → trigger re-run. Ghi đè data cũ. Lưu run history (run_at, triggered_by, status, error_detail).",
         2.5, False,
         "Cần đảm bảo idempotent (xóa data cũ trước khi ghi mới), lưu history để audit, expose kết quả thành công/thất bại rõ ràng"),

        ("task", "", "",
         "集計結果・出力", "Summary View & Export",
         "日次サマリー画面", "Daily summary view screen",
         "Filter: date range + store. Bảng: Date | Store | OBIC Code | Qty | Amount. Highlight unmapped. Nút Export Excel, nút Re-run.",
         3.5, True,
         "Cần format số tiền đúng (JPY, no decimals), hiển thị rõ unmapped records riêng, filter nhiều chiều đồng thời với query performance tốt"),

        ("task", "", "",
         "集計結果・出力", "Summary View & Export",
         "OBIC形式Excelエクスポート", "Excel export in OBIC format",
         "Generate file Excel đúng format OBIC cho shop data. Admin download theo filter đã chọn.",
         5.0, False,
         "Format Excel OBIC có column order và data type nghiêm ngặt, encoding phải khớp yêu cầu phần mềm nhận file; cần test thực tế với OBIC trước khi sign-off"),
    ]
}

ETA_02 = {
    "title": "ETA_02 — Đặt chỗ theo Đoàn (Group Booking)  ※ Junior Lv.2",
    "rows": [
        # ── Requirements ──────────────────────────────────────────
        ("catrow", "要件定義", "Requirements definition",
         "業務フロー確認", "Confirm Flow nghiệp vụ",
         "", "", "", "-", False, "", 3.0),
        ("catrow", "", "Requirements definition",
         "ビジネス確認", "Confirm nội dung nghiệp vụ",
         "", "", "", "-", False, "", 3.0),

        # ── DB Design ─────────────────────────────────────────────
        ("catrow", "DB設計", "DB Design",
         "団体マスタ・担当者テーブル設計",
         "Thiết kế bảng Group master & contacts",
         "", "",
         "Group, GroupContact, GroupAccount (nhiều account / 1 group), quan hệ với Booking hiện có",
         "-", False, "", 5.0),
        ("catrow", "", "DB Design",
         "団体予約・領収書テーブル設計",
         "Thiết kế bảng Group booking & receipt",
         "", "",
         "GroupBooking, ReceiptRecord (receipt_no, issued_at, reissued_at, status, issued_by), ReceiptHistory",
         "-", False, "", 3.0),

        # ── User side ─────────────────────────────────────────────
        ("task", "WEBシステム（ユーザー側)", "Web System for Group Users",
         "商品管理拡張", "Product management extension",
         "公開区分追加（一般・団体・共通）",
         "Add publication category (General / Group / Common)",
         "Thêm field 公開区分 vào Ticket: 一般向け | 団体向け | 一般・団体共通. Lọc đúng sản phẩm theo loại trang booking.",
         4.0, False,
         "Cần DB migration, sửa admin UI ticket-management, sửa filtering logic ở 2 trang booking khác nhau (cá nhân + đoàn); dễ sót nếu không test kỹ"),

        ("task", "", "",
         "団体登録", "Group Registration",
         "団体登録フォーム", "Group registration form",
         "Form /group/register: tên đoàn, địa chỉ, SĐT, người phụ trách, người chịu trách nhiệm ngày sử dụng, địa chỉ thanh toán, tên receipt. Submit → tạo Group + GroupAccount.",
         5.5, True,
         "Form 10+ field với validate phức tạp, tạo 3 entity liên quan trong 1 DB transaction, rollback đúng khi lỗi bất kỳ bước nào"),

        ("task", "", "",
         "団体登録", "Group Registration",
         "メール認証", "Email verification for group account",
         "Gửi email xác nhận sau đăng ký. Link verify có TTL. Click link → activate GroupAccount. Cho phép gửi lại email.",
         2.0, False,
         "Token riêng cho GroupAccount, cần xử lý TTL, resend limit, invalidate token cũ khi resend; test toàn bộ flow end-to-end"),

        ("task", "", "",
         "団体ログイン・セキュリティ", "Group Login & Security",
         "ログイン画面", "Login page for group accounts",
         "Trang /group/login: email + password. Auth system riêng cho GroupAccount.",
         3.0, True,
         "Không dùng NextAuth của user cá nhân → phải implement session management độc lập; cần đảm bảo không lẫn session giữa user cá nhân và tài khoản đoàn"),

        ("task", "", "",
         "団体ログイン・セキュリティ", "Group Login & Security",
         "ログイン失敗制限・一時ロック", "Login attempt limit & temporary lock",
         "Giới hạn số lần đăng nhập sai. Tạm khóa sau khi vượt ngưỡng. Gửi email thông báo.",
         2.5, False,
         "Rate limiting cần lưu counter trong DB hoặc cache, xử lý race condition khi nhiều request cùng lúc, logic tự mở khóa sau X phút"),

        ("task", "", "",
         "団体ログイン・セキュリティ", "Group Login & Security",
         "パスワード再設定", "Password reset",
         "Flow quên mật khẩu: nhập email → link reset (TTL) → đặt mật khẩu mới.",
         2.0, False,
         "Token single-use (vô hiệu ngay sau dùng), TTL kiểm tra server-side, test flow đầy đủ từ email đến confirm reset thành công"),

        ("task", "", "",
         "団体専用予約", "Group Booking",
         "専用予約ページ（団体向け商品のみ）",
         "Dedicated booking page – group products only",
         "URL /group/booking. Hiển thị sản phẩm đoàn. Store list, calendar, time slot. Layout riêng.",
         5.5, True,
         "Trang mới hoàn toàn (không tái sử dụng được booking cá nhân): filter product theo 公開区分, calendar + capacity display, layout phù hợp input số đông"),

        ("task", "", "",
         "団体専用予約", "Group Booking",
         "人数・年齢区分入力", "Quantity & age group input form",
         "Nhập số lượng trẻ em theo nhóm tuổi, người lớn/người đi kèm, người phụ trách ngày, ghi chú.",
         4.5, True,
         "Số nhóm tuổi TBD (chưa confirm client) → phải thiết kế dynamic field linh hoạt; logic validate và tính giá theo nhóm tuổi phức tạp"),

        ("task", "", "",
         "団体専用予約", "Group Booking",
         "共有在庫チェック", "Shared inventory check with individual bookings",
         "Capacity dùng chung cá nhân + đoàn. Tổng ≤ capacity ngày. Thông báo số chỗ còn lại.",
         3.5, False,
         "Race condition khi 2 đoàn cùng đặt slot cuối cùng: cần optimistic lock hoặc SELECT FOR UPDATE; test concurrent booking scenario"),

        ("task", "", "",
         "団体専用予約", "Group Booking",
         "予約確認・確定", "Booking confirmation",
         "Trang xác nhận trước khi submit. Tạo booking, gửi email xác nhận.",
         2.5, False,
         "State machine booking (pending → confirmed), phải rollback inventory nếu bước tạo booking fail sau khi đã check capacity"),

        ("task", "", "",
         "決済", "Payment",
         "クレジットカード決済（elepay）",
         "Credit card payment via elepay",
         "Tích hợp elepay cho thanh toán đoàn (entity khác với User cá nhân). Xử lý callback, timeout.",
         5.5, False,
         "Adapt elepay flow cho Group entity (payer không phải User), test kỹ với sandbox, amount validation đúng với booking, handle callback async và timeout scenario"),

        ("task", "", "",
         "決済", "Payment",
         "現地払い対応", "On-site payment flow",
         "Booking với status=pending_payment. Admin xác nhận thanh toán tại quầy → đổi status.",
         2.5, False,
         "Cần UI admin riêng để xác nhận, không auto-cancel như online payment, status transition rõ ràng và log đầy đủ"),

        ("task", "", "",
         "領収書発行", "Receipt Issuance",
         "初回PDF生成・領収書番号発行",
         "First PDF generation & unique receipt numbering",
         "Generate PDF lần đầu: receipt_no duy nhất, thông tin đoàn, amount, store, ngày, tax. Lưu ReceiptRecord.",
         8.0, False,
         "Item phức tạp nhất ETA_02: chọn và setup PDF library (puppeteer/pdfkit), thiết kế layout đạt chuẩn kế toán Nhật, unique numbering scheme chống trùng, lưu file lên S3, test in thực tế"),

        ("task", "", "",
         "領収書発行", "Receipt Issuance",
         "再発行処理・「再発行」表示",
         "Re-issue with 再発行 watermark",
         "Lần 2+: PDF thêm「再発行」và ngày tái phát hành. Receipt number giữ nguyên. Lưu history.",
         3.5, False,
         "Watermark phải đúng vị trí và rõ ràng trên PDF, lưu đủ metadata (who, when, reason), UI hiển thị history phát hành theo timeline"),

        ("task", "", "",
         "領収書発行", "Receipt Issuance",
         "キャンセル後の領収書無効化",
         "Receipt invalidation after cancellation",
         "Full cancel → receipt「取消」. Partial refund → issue receipt mới với amount sau refund.",
         3.0, False,
         "2 scenario xử lý khác nhau (full vs partial), watermark「取消」phải xuất hiện khi PDF cũ được download lại; cần test nhiều trường hợp"),

        ("task", "", "",
         "団体マイページ", "Group My Page",
         "団体情報確認・変更", "Group info view & edit",
         "Xem và chỉnh sửa: thông tin đoàn, người phụ trách, địa chỉ thanh toán, tên receipt. Lưu audit log khi đổi billing/receipt name.",
         3.5, True,
         "Thay đổi receipt name sau khi đã phát hành receipt ảnh hưởng đến re-issue: cần audit trail rõ ràng và logic xử lý đúng"),

        ("task", "", "",
         "団体マイページ", "Group My Page",
         "予約履歴・詳細", "Booking history & detail",
         "Danh sách booking hiện tại + lịch sử. Chi tiết + status thanh toán. Tất cả accounts trong đoàn đều thấy.",
         3.5, True,
         "Query booking theo group_id cross account (không theo user_id như cá nhân), cần pagination, filter, và đảm bảo không lộ booking của đoàn khác"),

        ("task", "", "",
         "団体マイページ", "Group My Page",
         "予約変更・キャンセル", "Booking modification & cancellation",
         "Thay đổi số lượng hoặc hủy trong deadline. Hủy → cancellation fee → refund.",
         5.0, False,
         "Nhiều edge case: deadline enforcement, partial refund calculation chính xác, inventory rollback atomic, cascade status update, email notification theo scenario"),

        ("task", "", "",
         "団体マイページ", "Group My Page",
         "領収書発行・ダウンロード", "Receipt issuance & download",
         "Nút phát hành receipt. Hiển thị trạng thái (未発行/発行済/再発行). Download PDF. Lịch sử phát hành.",
         2.5, True,
         "UI state machine 3 trạng thái, secure download URL cần có expiry để tránh link bị share, hiển thị history rõ theo timeline"),

        ("task", "", "",
         "メール通知", "Email Notifications",
         "各種通知メール送信", "Various notification emails",
         "Email: đăng ký, xác nhận email, booking confirmed, thanh toán, thay đổi, hủy. Template riêng cho đoàn.",
         3.5, False,
         "6+ template mới bằng tiếng Nhật, test deliverability và render trên nhiều email client (Gmail/Outlook/mobile), trigger đúng thời điểm từ nhiều flow khác nhau"),

        # ── Admin side ────────────────────────────────────────────
        ("task", "WEBシステム（管理側)", "Web System for Admin",
         "団体管理", "Group Management",
         "団体登録・編集・停止", "Group CRUD & suspension",
         "Admin xem danh sách đoàn, tìm kiếm, chi tiết, tạo mới, chỉnh sửa, duyệt, tạm dừng tài khoản.",
         5.5, True,
         "Admin UI phức tạp: list + search + detail view + edit form nhiều section + approval/suspension workflow; mỗi action cần quyền khác nhau"),

        ("task", "", "",
         "団体管理", "Group Management",
         "団体担当者・アカウント確認", "Group contacts & accounts view",
         "Admin xem danh sách accounts thuộc đoàn, thông tin người phụ trách, lịch sử đăng nhập.",
         1.5, False,
         "Join query giữa Group, GroupContact, GroupAccount; hiển thị login history cần index đúng"),

        ("task", "", "",
         "団体予約管理", "Group Booking Management",
         "予約検索", "Group booking search",
         "Tìm kiếm theo: store, ngày, tên đoàn, tên người phụ trách. Phân biệt với booking cá nhân.",
         4.5, True,
         "Search nhiều điều kiện đồng thời cần index DB, query join 4-5 bảng, kết quả phải rõ ràng phân biệt với booking cá nhân trong cùng admin panel"),

        ("task", "", "",
         "団体予約管理", "Group Booking Management",
         "予約内容変更・キャンセル（管理者）", "Admin booking modification & cancellation",
         "Admin thay đổi hoặc hủy đặt chỗ. Ghi lý do. Xử lý refund. Lưu audit log.",
         3.5, False,
         "Admin có thể override deadline của user; cần ghi reason bắt buộc, trigger refund API, update inventory, write audit trail đầy đủ"),

        ("task", "", "",
         "団体予約管理", "Group Booking Management",
         "決済・領収書発行状況確認", "Payment & receipt status view",
         "Trạng thái thanh toán từng booking. Lịch sử phát hành receipt. Admin có thể re-issue.",
         2.5, True,
         "Join nhiều bảng (GroupBooking + Payment + ReceiptRecord), hiển thị timeline, nút re-issue cần confirm + ghi log; cần test quyền không cho store manager re-issue"),

        ("task", "", "",
         "団体予約管理", "Group Booking Management",
         "操作履歴確認", "Operation history / audit trail view",
         "Lịch sử thao tác admin: ai làm gì, khi nào. Audit trail cho booking và receipt.",
         2.0, False,
         "Generic audit log cần query linh hoạt theo entity type, filter theo user/thời gian, phân quyền ai được xem log gì"),

        ("task", "", "",
         "権限制御", "Permission Control",
         "店舗管理者は自店舗の団体予約のみ表示",
         "Store manager sees own store's group bookings only",
         "Store manager chỉ thấy booking đoàn tại store mình. Super admin thấy tất cả.",
         4.0, False,
         "Permission middleware phải apply ở nhiều API endpoint khác nhau; nếu bỏ sót 1 endpoint → data leak giữa stores; cần test kỹ từng API"),

        ("task", "", "",
         "データ出力", "Data Export",
         "団体予約CSVエクスポート", "Group booking CSV export",
         "Export CSV: tên đoàn, store, ngày, số lượng, status thanh toán, trạng thái receipt.",
         2.5, False,
         "Streaming download khi dataset lớn (hàng nghìn rows), encoding UTF-8 BOM để Excel Windows mở đúng, test với file lớn không bị timeout"),
    ]
}

# ── Build workbook ───────────────────────────────────────────────
def build_sheet(wb, sheet_name, eta_data):
    ws = wb.create_sheet(sheet_name)

    # Column widths
    for col, w in COL_WIDTHS.items():
        ws.column_dimensions[col].width = w

    # ── Row 1-6: title rows ──────────────────────────────────────
    ws.row_dimensions[1].height = 24
    ws.merge_cells("B1:Q1")
    c = ws["B1"]
    c.value = eta_data["title"]
    c.font = Font(bold=True, size=13, name="Calibri")
    c.fill = fill(C_HEADER)
    c.font = Font(bold=True, size=13, color="FFFFFFFF", name="Calibri")
    c.alignment = align("center", "center")

    # ── Row 7: column header row ─────────────────────────────────
    ws.row_dimensions[7].height = 39
    header_data = [
        ("B", "No.",              C_HEADER, True),
        ("C", "カテゴリ",          C_HEADER, True),
        ("D", "Category",         C_HEADER_EN, True),
        ("E", "機能・画面\n（Function/Screen）", C_HEADER, True),
        ("F", "Item",             C_HEADER_EN, True),
        ("G", "中項目",            C_HEADER, True),
        ("H", "Sub Item",         C_HEADER_EN, True),
        ("I", "小項目\n（Detail）", C_HEADER, True),
        ("J", "工数(人日)\nEffort (MD)", C_HEADER, True),
        ("Q", "備考 / Note",       C_HEADER, True),
    ]
    for col, val, bg, bold in header_data:
        c = ws[f"{col}7"]
        c.value = val
        c.fill = fill(bg)
        c.font = Font(bold=bold, color="FFFFFFFF" if bg == C_HEADER else "FF000000",
                      size=10, name="Calibri")
        c.alignment = align("center", "center")
        c.border = thin_border("FF000000")

    # Merge J7:P7 for effort header
    ws.merge_cells("J7:P7")

    # ── Row 8: sub-header ────────────────────────────────────────
    ws.row_dimensions[8].height = 42
    sub_headers = [
        ("E", "大項目\n（Item）",          C_HEADER),
        ("F", "Item",                     C_HEADER_EN),
        ("G", "中項目\n（Sub Item）",      C_HEADER),
        ("H", "Sub Item",                 C_HEADER_EN),
        ("I", "小項目\n（Sub-sub item）",  C_HEADER),
        ("J", "要件定義\nAnalysis",        C_HEADER),
        ("K", "UI・UXデザイン\nDesign",    C_HEADER),
        ("L", "基本設計\nBasic Design",    C_HEADER),
        ("M", "実装\nCoding",             C_HEADER),
        ("N", "単体テスト\nUnit Test",     C_HEADER),
        ("O", "結合テスト\nIntegration Test", C_HEADER),
        ("P", "小計\n（Sum）",             C_HEADER),
    ]
    for col, val, bg in sub_headers:
        c = ws[f"{col}8"]
        c.value = val
        c.fill = fill(bg)
        c.font = Font(bold=True, color="FFFFFFFF", size=10, name="Calibri")
        c.alignment = align("center", "center")
        c.border = thin_border("FF000000")

    # ── Data rows (start row 9) ───────────────────────────────────
    row = 9
    prev_cat_jp = None

    for entry in eta_data["rows"]:
        row_type = entry[0]
        ws.row_dimensions[row].height = 21.75

        if row_type == "catrow":
            # entry: (type, cat_jp, cat_en, itm_jp, itm_en, sub_jp, sub_en, detail, m_marker, has_design, note, p_fixed)
            _, cat_jp, cat_en, itm_jp, itm_en, sub_jp, sub_en, detail, _, _, note, p_fixed = entry
            bg = C_CATROW
            txt_color = "FF000000"

            fields = {
                "B": "=ROW()-8", "C": cat_jp, "D": cat_en,
                "E": itm_jp, "F": itm_en, "G": sub_jp, "H": sub_en, "I": detail,
                "J": "-", "K": "-", "L": "-", "M": "-",
                "N": "-", "O": "-", "P": p_fixed, "Q": note,
            }
            bold_cols = {"C", "D", "P"}
            for col, val in fields.items():
                c = ws[f"{col}{row}"]
                c.value = val
                c.fill = fill(bg)
                c.font = Font(bold=(col in bold_cols), color=txt_color,
                              size=10, name="Calibri")
                c.alignment = align("left" if col not in ("B","J","K","L","M","N","O","P") else "center")
                c.border = thin_border(C_WHITE)
                if col == "P" and isinstance(val, (int, float)):
                    c.number_format = "0.0"
            prev_cat_jp = cat_jp

        else:  # task row
            # entry: (type, cat_jp, cat_en, itm_jp, itm_en, sub_jp, sub_en, detail, m_val, has_design, note)
            _, cat_jp, cat_en, itm_jp, itm_en, sub_jp, sub_en, detail, m_val, has_design, note = entry
            bg = C_TASK

            # Build formula strings for this row
            j_f  = f"=ROUND(0.15*M{row},1)"
            k_f  = f"=ROUND(0.1*M{row},1)" if has_design else 0
            l_f  = f"=0.3*M{row}"
            n_f  = f"=0.2*M{row}"
            o_f  = f"=ROUND(0.5*M{row},1)"
            p_f  = f"=SUM(J{row}:O{row})"

            fields = {
                "B": "=ROW()-8",
                "C": cat_jp, "D": cat_en,
                "E": itm_jp, "F": itm_en,
                "G": sub_jp, "H": sub_en,
                "I": detail,
                "J": j_f, "K": k_f, "L": l_f,
                "M": m_val,
                "N": n_f, "O": o_f, "P": p_f,
                "Q": note,
            }
            bold_cols = {"C", "D", "P"}
            for col, val in fields.items():
                c = ws[f"{col}{row}"]
                c.value = val
                c.fill = fill(bg)
                c.font = Font(bold=(col in bold_cols), color="FF000000",
                              size=10, name="Calibri")
                c.alignment = align("left" if col not in ("B","J","K","L","M","N","O","P") else "center")
                c.border = thin_border(C_WHITE)
                if col in ("J","K","L","M","N","O","P"):
                    c.number_format = "0.0"

        row += 1

    # ── Total row ────────────────────────────────────────────────
    ws.row_dimensions[row].height = 24
    ws.merge_cells(f"B{row}:I{row}")
    c = ws[f"B{row}"]
    c.value = "合計 / TOTAL"
    c.font = Font(bold=True, size=10, name="Calibri")
    c.fill = fill(C_HEADER)
    c.font = Font(bold=True, color="FFFFFFFF", size=10, name="Calibri")
    c.alignment = align("center", "center")
    c.border = thin_border("FF000000")

    for col in ["J","K","L","M","N","O","P"]:
        c = ws[f"{col}{row}"]
        c.value = f"=SUM({col}9:{col}{row-1})"
        c.fill = fill(C_HEADER)
        c.font = Font(bold=True, color="FFFFFFFF", size=11, name="Calibri")
        c.alignment = align("center", "center")
        c.border = thin_border("FF000000")
        c.number_format = "0.0"

    # Freeze panes at row 9
    ws.freeze_panes = "B9"

# ── Create workbook ──────────────────────────────────────────────
wb = openpyxl.Workbook()
wb.remove(wb.active)

build_sheet(wb, "ETA_01", ETA_01)
build_sheet(wb, "ETA_02", ETA_02)

out_path = "eta_072026/【TOKIWAGI】ETA_01_02_260727.xlsx"
wb.save(out_path)
print(f"Saved: {out_path}")