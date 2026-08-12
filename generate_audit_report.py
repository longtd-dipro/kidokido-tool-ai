#!/usr/bin/env python3
"""Generate API Audit Report XLSX"""
import openpyxl
from openpyxl.styles import (
    PatternFill, Font, Alignment, Border, Side, GradientFill
)
from openpyxl.utils import get_column_letter
from openpyxl.chart import BarChart, Reference
from openpyxl.chart.series import DataPoint

OUTPUT = "/Users/longtd/Desktop/WORK/AI_AGENTS/AI_AGENT_KIDOKIDO/API_Audit_Report_2026-07-28.xlsx"

# ── Color palette ──────────────────────────────────────────────
CLR = {
    "CRITICAL": "C0392B", "HIGH": "E67E22", "MEDIUM": "F1C40F",
    "LOW": "27AE60", "SAFE": "95A5A6",
    "header_bg": "1A252F", "header_fg": "FFFFFF",
    "section_bg": "2C3E50", "section_fg": "ECF0F1",
    "alt_row": "F8F9FA", "white": "FFFFFF",
    "border": "BDC3C7",
    "biz_HIGH": "E74C3C", "biz_MEDIUM": "E67E22",
    "biz_LOW": "27AE60", "biz_NONE": "95A5A6",
    "be_only": "2980B9", "be_fe": "8E44AD", "skip": "95A5A6",
}

def fill(hex_color):
    return PatternFill("solid", fgColor=hex_color)

def font(bold=False, color="000000", size=10, italic=False):
    return Font(bold=bold, color=color, size=size, name="Arial", italic=italic)

def align(h="left", v="center", wrap=True):
    return Alignment(horizontal=h, vertical=v, wrap_text=wrap)

def thin_border():
    s = Side(style="thin", color="BDC3C7")
    return Border(left=s, right=s, top=s, bottom=s)

def set_col_width(ws, col, width):
    ws.column_dimensions[get_column_letter(col)].width = width

def header_cell(ws, row, col, value, bg="1A252F", fg="FFFFFF", size=10, bold=True, h_align="center"):
    c = ws.cell(row=row, column=col, value=value)
    c.fill = fill(bg)
    c.font = font(bold=bold, color=fg, size=size)
    c.alignment = align(h=h_align, v="center", wrap=True)
    c.border = thin_border()
    return c

def data_cell(ws, row, col, value, bg="FFFFFF", fg="000000", bold=False, h_align="left", size=9):
    c = ws.cell(row=row, column=col, value=value)
    c.fill = fill(bg)
    c.font = font(bold=bold, color=fg, size=size)
    c.alignment = align(h=h_align, v="center", wrap=True)
    c.border = thin_border()
    return c

# ══════════════════════════════════════════════════════════════
# DATA
# ══════════════════════════════════════════════════════════════
FINDINGS = [
    # (stt, endpoint, file, severity, issues, fe_callers, fix_scope, biz_level, biz_note, deploy_risk, priority)
    (1, "GET /api/bookings", "src/pages/api/bookings/index.ts",
     "CRITICAL",
     "Không pagination; không tenant filter; không user filter → bất kỳ user đã login dump được toàn bộ booking cross-tenant",
     "10 nơi (CreateBooking forms, booking-history, AdminUpdateBookingForm) — tất cả fetch-all, không truyền page/limit",
     "BE + FE",
     "HIGH",
     "Form đặt vé (OneDayTicket, MonthlyTicket, TimesLimitTicket) sẽ chỉ thấy trang đầu nếu FE chưa cập nhật, user có thể không thấy vé cần đặt. Nút Check-in ở homepage phụ thuộc API này — booking hôm nay có thể bị paginate ra khỏi trang đầu, user đến cổng không check-in được.",
     "CRITICAL — user đến facility không check-in được; form đặt vé thiếu dữ liệu → có thể đặt trùng",
     "P0"),

    (2, "GET /api/admin/bookings/blacklist", "src/pages/api/admin/bookings/blacklist.ts",
     "CRITICAL",
     "Không có auth middleware; không tenant filter → dump PII (email, phone) cross-tenant; bất kỳ URL biết cũng lấy được",
     "Chưa xác định — có thể admin page",
     "BE only",
     "MEDIUM",
     "Thêm auth sẽ chặn truy cập nếu staff chưa có role đúng. Cần verify không có staff nào cần cross-tenant access hợp lệ trước khi thêm tenant filter.",
     "MEDIUM — staff có thể bị 401/403 đột ngột khi vào màn hình blacklist",
     "P0"),

    (3, "GET /api/admin/users", "src/pages/api/admin/users/index.ts",
     "CRITICAL",
     "Không tenant filter → dump user cross-tenant kèm password hash; pagination không bắt buộc; export CSV fetch-all",
     "user-management/index.tsx — list có page/limit ✓; export CSV không có pagination",
     "BE + FE (export)",
     "HIGH",
     "Export CSV toàn bộ user sẽ bị thiếu dữ liệu nếu BE áp limit mà FE không cập nhật luồng export, gây sai lệch dữ liệu support và báo cáo.",
     "HIGH — Export CSV bị cụt dữ liệu; admin có thể đưa ra quyết định sai dựa trên báo cáo thiếu",
     "P0"),

    (4, "GET /api/admin/tickets/obic-codes/export", "src/pages/api/admin/tickets/obic-codes/export.ts",
     "CRITICAL",
     "tenantCode là optional → ADMIN không truyền nhận data cross-tenant; không có date range bắt buộc",
     "Finance admin page",
     "BE only",
     "HIGH",
     "Dữ liệu đầu vào cho hệ thống kế toán OBIC — nếu export bị thiếu mã, báo cáo kế toán sai lệch, ảnh hưởng compliance và audit tài chính.",
     "HIGH — Finance nhận file export thiếu dữ liệu mà không có cảnh báo; lỗi chỉ phát hiện khi đối chiếu sổ sách",
     "P0"),

    (5, "GET /api/admin/bookings/export", "src/pages/api/admin/bookings/export.ts",
     "HIGH",
     "Không giới hạn record count; SUPER_ADMIN có thể export cross-tenant; timeout/OOM với dataset lớn",
     "Admin booking management — export button",
     "BE only",
     "HIGH",
     "Báo cáo doanh thu dựa hoàn toàn vào file export này. Nếu BE giới hạn cứng record mà không thông báo, file CSV thiếu booking, báo cáo doanh thu bị sai.",
     "HIGH — Admin xuất báo cáo doanh thu bị thiếu booking; quyết định kinh doanh dựa trên số liệu sai",
     "P1"),

    (6, "GET /api/admin/tenants", "src/pages/api/admin/tenants/index.ts",
     "HIGH",
     "Pagination không bắt buộc; response chứa credential admin mỗi tenant; ADMIN không nên list cross-tenant",
     "5 trang admin dùng dropdown (booking-management, scan-management, ticket-management, revenue-management, dashboard) — không truyền page/limit",
     "BE + FE",
     "HIGH",
     "Dropdown tenant được dùng ở 5 trang admin quan trọng. Nếu BE enforce limit mà FE không chuyển sang search/lazy-load, Super Admin không thể filter/quản lý các tenant bị thiếu trong dropdown.",
     "HIGH — 5 trang admin bị mất tenant options cùng lúc; Super Admin không thể thao tác trên tenant bị thiếu",
     "P1"),

    (7, "GET /api/admin/tickets", "src/pages/api/admin/tickets/index.ts",
     "HIGH",
     "tenantCode dùng contains thay vì equals (fuzzy match); SUPER_ADMIN không truyền tenantCode → cross-tenant dump; pagination không bắt buộc",
     "3 nơi fetch-all cho dropdown (vacancies-status, revenue-management, chart); ticket-management có page/limit ✓",
     "BE + FE",
     "MEDIUM",
     "Dropdown ticket ở 3 trang admin sẽ thiếu loại vé nếu BE limit số lượng; admin filter sai hoặc bỏ sót loại vé khi xem chart doanh thu.",
     "MEDIUM — Dropdown thiếu ticket type; admin filter sai hoặc bỏ sót loại vé khi xem chart",
     "P1"),

    (8, "GET /api/admin/gmo-settings", "src/pages/api/admin/gmo-settings/index.ts",
     "HIGH",
     "Dump toàn bộ GMO payment credentials (shopId, shopPass) của mọi tenant trong một request",
     "Admin payment settings page",
     "BE only",
     "LOW",
     "Trang cấu hình GMO ít được chỉnh sửa và số record nhỏ. Rủi ro chính là nếu auth check mới block admin hợp lệ thì không vào được trang config, nhưng không gây gián đoạn giao dịch đang chạy.",
     "LOW — Admin tạm thời không vào được trang config GMO nếu auth fail; payment flow hiện tại không bị ảnh hưởng",
     "P1"),

    (9, "GET /api/user/bookings", "src/pages/api/user/bookings/index.ts",
     "HIGH",
     "Không pagination; nested relation lớn (Ticket, Tenant, PartialCheckout); N+1 qua getLatestBarcodeByBookingBarCode",
     "booking-history/index.tsx, CheckInOutButtons/index.tsx, PaymentOfflineBookingForm — tất cả fetch-all từ fromDate",
     "BE + FE",
     "HIGH",
     "Nút Check-in/Check-out ở homepage phụ thuộc API này. Nếu BE paginate mà FE không có infinite scroll, booking hôm nay có thể không xuất hiện — user đến facility không thể check-in.",
     "CRITICAL — User đến facility nhưng nút Check-in không hiện do booking bị paginate ra ngoài trang đầu",
     "P1"),

    (10, "GET /api/cron-job/remind-booking-expired", "src/pages/api/cron-job/remind-booking-expired.ts",
     "HIGH",
     "Không auth; date <= now không có upper bound → theo thời gian query ngày càng lớn; N+1 query per booking",
     "Không có FE caller — nội bộ cron",
     "BE only",
     "MEDIUM",
     "Nếu fix date bound không chính xác, một số booking hợp lệ không được query → user không nhận email nhắc. Có thể gửi email trùng nếu range quá rộng.",
     "MEDIUM — Email nhắc bị bỏ sót; user không chuẩn bị cho booking sắp hết hạn",
     "P1"),

    (11, "GET /api/cron-job/remind-one-day-booking", "src/pages/api/cron-job/remind-one-day-booking.ts",
     "HIGH",
     "Không auth; date >= now không có upper bound → fetch tất cả booking tương lai; include 4 relation",
     "Không có FE caller — nội bộ cron",
     "BE only",
     "MEDIUM",
     "Nếu fix date bound không chính xác, user không nhận được email nhắc trước 1 ngày. Fix sai timezone có thể gửi email trùng hoặc bỏ sót.",
     "MEDIUM — User không nhận được nhắc nhở trước ngày đặt vé; missed appointment tại facility",
     "P1"),

    (12, "GET /api/cron-job/remind-using-booking", "src/pages/api/cron-job/remind-using-booking.ts",
     "HIGH",
     "Không auth; không có date upper bound; N+1 nghiêm trọng nhất (2 DB round-trip/booking trong vòng lặp)",
     "Không có FE caller — nội bộ cron",
     "BE only",
     "MEDIUM",
     "Email nhắc ngày sử dụng là trải nghiệm quan trọng. Fix date bound sai sẽ bỏ sót hoặc gửi trùng. N+1 query cần batch để tránh OOM khi scale.",
     "MEDIUM — Email nhắc ngày dùng vé bị bỏ sót; user quên đến facility hoặc đến sai ngày",
     "P1"),

    (13, "GET /api/admin/booking-queue/calling", "src/pages/api/admin/booking-queue/calling.ts",
     "MEDIUM",
     "Không có pagination; booking queue có thể lớn trong giờ cao điểm",
     "Màn hình queue realtime tại quầy — staff dùng",
     "BE only",
     "HIGH",
     "Màn hình queue realtime là công cụ vận hành tại quầy. Nếu thêm pagination mà FE không xử lý, staff chỉ thấy một phần queue và sẽ bỏ sót khách đang chờ trong giờ cao điểm.",
     "HIGH — Staff bỏ sót booking trong queue; khách chờ lâu không được gọi, gây ùn tắc tại cổng",
     "P1"),

    (14, "GET /api/admin/booking-queue/waiting", "src/pages/api/admin/booking-queue/waiting.ts",
     "MEDIUM",
     "Ba findMany không pagination; aggregation chậm dần theo scale; endpoint gọi realtime",
     "Màn hình queue realtime — realtime polling",
     "BE only",
     "HIGH",
     "Tương tự /calling — màn hình waiting queue realtime. Staff bỏ sót khách chờ nếu response bị cắt.",
     "HIGH — Tương tự /calling; operational impact trực tiếp tại quầy tiếp đón",
     "P1"),

    (15, "GET /api/admin/booking-queue/system-cancelled", "src/pages/api/admin/booking-queue/system-cancelled.ts",
     "MEDIUM",
     "Không có pagination; lịch sử cancel tích lũy theo thời gian",
     "Màn hình quản lý booking queue",
     "BE only",
     "LOW",
     "Danh sách system-cancelled ít được xem thường xuyên và ít nghiệp vụ phụ thuộc hơn calling/waiting. Thêm date filter là đủ.",
     "LOW — Admin xem thiếu một số cancelled booking cũ; không ảnh hưởng operation hiện tại",
     "P2"),

    (16, "GET /api/admin/booking-vacancies", "src/pages/api/admin/booking-vacancies/index.ts",
     "MEDIUM",
     "Không pagination; lấy toàn bộ booking 8 ngày không giới hạn; facility đông → response lớn",
     "Trang quản lý vacancy admin",
     "BE only",
     "LOW",
     "Data được aggregate trước khi trả về nên response nhỏ hơn raw booking. Rủi ro tăng dần khi facility scale.",
     "LOW — Trang vacancy admin load chậm dần; không ảnh hưởng nghiệp vụ ngay lập tức",
     "P2"),

    (17, "GET /api/admin/bookings (list)", "src/pages/api/admin/bookings/index.ts",
     "MEDIUM",
     "BE không enforce pagination — FE quên truyền limit → dump toàn bộ booking của tenant",
     "booking-management/index.tsx và scan-management/index.tsx — đã có page/limit ✓",
     "BE only",
     "LOW",
     "FE đã tích hợp pagination nên việc fix BE chỉ là align lại server-side. Không thay đổi contract API, tác động nghiệp vụ gần như không có.",
     "LOW — Chỉ cần verify response structure không đổi; pagination admin hoạt động bình thường",
     "P2"),

    (18, "GET /api/admin/news", "src/pages/api/admin/news/index.ts",
     "MEDIUM",
     "Không pagination; news tích lũy theo thời gian; DataGrid tự phân trang client-side",
     "news-management/index.tsx — fetch-all, DataGrid client pagination",
     "BE + FE",
     "MEDIUM",
     "Admin sẽ thấy ít tin tức hơn đột ngột khi BE thêm pagination mà FE chưa chuyển sang server-side — admin có thể tưởng dữ liệu bị mất. Sort/filter client bị sai nếu FE chưa cập nhật.",
     "MEDIUM — Admin thấy ít tin tức đột ngột; có thể lo lắng dữ liệu bị xóa; cần deploy BE+FE cùng lúc",
     "P2"),

    (19, "GET /api/admin/disclaimers", "src/pages/api/admin/disclaimers.ts",
     "MEDIUM",
     "Không pagination; nested include DisclaimerOption; chưa rõ có per-tenant hay không",
     "Admin disclaimer management",
     "BE only",
     "LOW",
     "Disclaimer thường ít record và ít thay đổi. Nếu là per-tenant mà thiếu filter thì nâng lên HIGH nhưng cần verify schema.",
     "LOW — Nếu là global config thì không ảnh hưởng; cần xác nhận schema trước khi fix",
     "P2"),

    (20, "GET /api/admin/email-settings", "src/pages/api/admin/email-settings/index.ts",
     "MEDIUM",
     "Không pagination; chưa rõ EmailSetting có per-tenant filter không",
     "Admin email template settings",
     "BE only",
     "LOW",
     "Email settings ít record, ít thay đổi. Cần verify schema có tenantCode field không để xác định fix priority.",
     "LOW — Trang cài đặt email ít được truy cập; không ảnh hưởng giao dịch đang chạy",
     "P2"),

    (21, "GET /api/tickets (public)", "src/pages/api/tickets/index.ts",
     "MEDIUM",
     "Public endpoint không auth; tenantCode từ query param do client kiểm soát; không pagination; thiếu rate limiting",
     "8 nơi — trang đặt vé, price-list, admin pages — đều filter theo tenantCode ✓",
     "BE only",
     "LOW",
     "FE đã filter tenantCode nên số lượng ticket trả về thường nhỏ. Rủi ro chính là nếu take-limit nhỏ hơn số ticket thực tế của tenant thì user không thấy đủ loại vé để đặt.",
     "LOW — Nếu default limit nhỏ hơn số ticket của tenant, user không thấy đủ vé; cần set limit >= max ticket per tenant",
     "P2"),

    (22, "GET /api/tenants (public)", "src/pages/api/tenants/index.ts",
     "MEDIUM",
     "Public endpoint; pagination không bắt buộc; có thể enumerate toàn bộ tenant; không tenant filter tự nhiên",
     "15+ nơi (tenant-list, price-list, vacancy-status, CreateBooking forms, chart components) — tất cả fetch-all",
     "BE only",
     "MEDIUM",
     "Trang danh sách facility public và form đặt vé phụ thuộc API này. Nếu limit quá nhỏ, user không thấy đủ facility và không thể đặt vé — ảnh hưởng trực tiếp đến doanh thu.",
     "MEDIUM — Một số facility biến mất khỏi trang chọn facility; user không đặt được vé và facility mất doanh thu",
     "P2"),

    (23, "GET /api/user/bookings/monthly-tickets", "src/pages/api/user/bookings/monthly-tickets/index.ts",
     "MEDIUM",
     "Pagination không bắt buộc; supportedTenantMonthlyBookings nằm ngoài paging logic",
     "monthly-ticket-status.tsx có page/limit ✓; PaymentOfflineBookingForm fetch-all không có pagination",
     "BE only",
     "HIGH",
     "Form đặt vé offline dùng API này để kiểm tra trạng thái vé tháng. Nếu BE paginate mà form không cập nhật, có thể không detect được vé active → cho phép đặt trùng hoặc từ chối nhầm tại quầy.",
     "HIGH — Form offline không detect được vé active dẫn đến đặt trùng hoặc từ chối nhầm tại quầy",
     "P2"),

    (24, "GET /api/user/bookings/times-limit-tickets", "src/pages/api/user/bookings/times-limit-tickets/index.ts",
     "MEDIUM",
     "Pagination không bắt buộc; flatMap theo childQuantity có thể tạo array lớn trong memory",
     "times-limit-ticket-status.tsx có page/limit ✓; PaymentOfflineBookingForm fetch-all",
     "BE only",
     "HIGH",
     "Tương tự monthly-tickets — form đặt vé offline có thể đặt trùng hoặc từ chối nhầm vé số lần tại quầy.",
     "HIGH — Tương tự monthly-tickets; operational impact tại quầy POS",
     "P2"),

    (25, "GET /api/admin/staffs", "src/pages/api/admin/staffs/index.ts",
     "MEDIUM",
     "Export CSV không có pagination giới hạn",
     "StaffManagement/index.tsx — list có page/limit ✓; export CSV không có pagination",
     "BE only",
     "LOW",
     "Export staff ít bị ảnh hưởng do số lượng staff thường nhỏ. Cần đảm bảo export vẫn lấy đủ dữ liệu khi thêm limit.",
     "LOW — Export staff bị thiếu nếu limit nhỏ; ít ảnh hưởng vì số staff thường nhỏ",
     "P2"),

    (26, "GET /api/news (public)", "src/pages/api/news/index.ts",
     "MEDIUM",
     "Public endpoint; pagination không bắt buộc; không tenant filter",
     "TopPage/News/index.tsx — hardcode page=1, limit=5 ✓; BE không enforce",
     "BE only",
     "LOW",
     "FE đã hardcode limit=5 nên rủi ro thực tế thấp. BE chỉ cần enforce để phòng trường hợp caller khác không truyền limit.",
     "LOW — FE đã tự giới hạn; fix BE là defensive measure; không ảnh hưởng nghiệp vụ",
     "P3"),

    (27, "GET /api/migration/* (5 files)", "src/pages/api/migration/",
     "LOW",
     "Không auth; load toàn bộ DB vào memory; N+1 per record; có thể chạy lại vô tình sau deploy",
     "Không có FE caller — nội bộ dev",
     "BE only",
     "NONE",
     "Script one-time dùng nội bộ dev để migrate dữ liệu. Không có FE hoặc user nào gọi trong production workflow.",
     "NONE — Chỉ chạy thủ công bởi dev; không có deploy risk với end-user",
     "P3"),
]

SUMMARY_DATA = [
    ("CRITICAL", 4, "Đang gây down hoặc data leak nghiêm trọng — fix ngay hôm nay"),
    ("HIGH", 9, "Sẽ gây down khi scale — fix trong sprint này"),
    ("MEDIUM", 14, "Rủi ro tích lũy theo thời gian — lên kế hoạch"),
    ("LOW", 1, "Cron/migration nội bộ — refactor khi có thời gian"),
]

PRIORITY_DATA = [
    ("P0", "Fix ngay (đang down/security hole)", [1, 2, 3, 4]),
    ("P1", "Sprint này (HIGH — sẽ down khi scale)", [5, 6, 7, 8, 9, 10, 11, 12, 13, 14]),
    ("P2", "Sprint tiếp (MEDIUM — tích lũy theo thời gian)", [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]),
    ("P3", "Backlog (LOW — nội bộ dev)", [26, 27]),
]

# ══════════════════════════════════════════════════════════════
# BUILD WORKBOOK
# ══════════════════════════════════════════════════════════════
wb = openpyxl.Workbook()
wb.remove(wb.active)  # remove default sheet

# ── SHEET 1: Executive Summary ────────────────────────────────
ws1 = wb.create_sheet("📊 Executive Summary")
ws1.sheet_view.showGridLines = False

# Title
ws1.merge_cells("A1:H1")
title = ws1["A1"]
title.value = "API AUDIT REPORT — TOKIWAGI SYSTEM"
title.fill = fill(CLR["section_bg"])
title.font = Font(bold=True, color="FFFFFF", size=16, name="Arial")
title.alignment = Alignment(horizontal="center", vertical="center")
ws1.row_dimensions[1].height = 36

ws1.merge_cells("A2:H2")
sub = ws1["A2"]
sub.value = "Ngày audit: 2026-07-28  |  Repo: tokiwagi  |  Người thực hiện: AI Audit Agent"
sub.fill = fill("34495E")
sub.font = Font(italic=True, color="BDC3C7", size=10, name="Arial")
sub.alignment = Alignment(horizontal="center", vertical="center")
ws1.row_dimensions[2].height = 22

ws1.row_dimensions[3].height = 12

# Root cause box
ws1.merge_cells("A4:H4")
rc = ws1["A4"]
rc.value = "Root Cause: findMany không có take bắt buộc ở BE + FE không truyền limit khi dùng cho dropdown/filter → dump không giới hạn. Thêm vào đó thiếu tenantCode filter server-side."
rc.fill = fill("FDEBD0")
rc.font = Font(color="784212", size=10, name="Arial", italic=True)
rc.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
rc.border = Border(
    left=Side(style="thick", color="E67E22"),
    right=Side(style="thin", color="BDC3C7"),
    top=Side(style="thin", color="BDC3C7"),
    bottom=Side(style="thin", color="BDC3C7"),
)
ws1.row_dimensions[4].height = 32

ws1.row_dimensions[5].height = 12

# Severity summary table
sev_headers = ["Severity", "Số API", "% Tổng", "Mô tả hành động"]
for ci, h in enumerate(sev_headers, 1):
    header_cell(ws1, 6, ci, h, bg=CLR["header_bg"])
ws1.row_dimensions[6].height = 22

total_apis = sum(r[1] for r in SUMMARY_DATA) + 2  # +2 skip
for ri, (sev, count, desc) in enumerate(SUMMARY_DATA, 7):
    bg = CLR[sev]
    data_cell(ws1, ri, 1, sev, bg=bg, fg="FFFFFF", bold=True, h_align="center")
    data_cell(ws1, ri, 2, count, bg=CLR["alt_row"] if ri % 2 == 0 else "FFFFFF", h_align="center")
    pct = f"{count / 28 * 100:.0f}%"
    data_cell(ws1, ri, 3, pct, h_align="center")
    data_cell(ws1, ri, 4, desc)
    ws1.row_dimensions[ri].height = 20

ws1.row_dimensions[12].height = 12

# Fix scope breakdown
ws1.merge_cells("A13:D13")
scope_title = ws1["A13"]
scope_title.value = "Phân bố Fix Scope"
scope_title.fill = fill(CLR["section_bg"])
scope_title.font = Font(bold=True, color="FFFFFF", size=11, name="Arial")
scope_title.alignment = Alignment(horizontal="center", vertical="center")
ws1.row_dimensions[13].height = 22

scope_headers = ["Fix Scope", "Số API", "Mô tả"]
for ci, h in enumerate(scope_headers, 1):
    header_cell(ws1, 14, ci, h, bg=CLR["header_bg"])
ws1.row_dimensions[14].height = 20

be_only = sum(1 for f in FINDINGS if f[6] == "BE only")
be_fe = sum(1 for f in FINDINGS if f[6] == "BE + FE")
be_fe_export = sum(1 for f in FINDINGS if f[6] == "BE + FE (export)")

scope_rows = [
    ("BE only", be_only + be_fe_export, "Chỉ sửa backend — FE không cần thay đổi hoặc thay đổi tối thiểu"),
    ("BE + FE", be_fe, "Phải sửa đồng thời BE và FE — deploy không đồng bộ gây lỗi nghiệp vụ"),
]
for ri, (scope, count, desc) in enumerate(scope_rows, 15):
    bg = CLR["be_only"] if scope == "BE only" else CLR["be_fe"]
    data_cell(ws1, ri, 1, scope, bg=bg, fg="FFFFFF", bold=True, h_align="center")
    data_cell(ws1, ri, 2, count, h_align="center")
    data_cell(ws1, ri, 3, desc)
    ws1.row_dimensions[ri].height = 20

ws1.row_dimensions[18].height = 12

# Key risk note
ws1.merge_cells("A19:H19")
risk_note = ws1["A19"]
risk_note.value = "⚠️  QUAN TRỌNG: Các API có Fix Scope = BE + FE PHẢI được deploy đồng thời. Deploy BE trước khi FE sẵn sàng sẽ gây gián đoạn nghiệp vụ ngay lập tức."
risk_note.fill = fill("FADBD8")
risk_note.font = Font(bold=True, color=CLR["CRITICAL"], size=10, name="Arial")
risk_note.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
risk_note.border = Border(left=Side(style="thick", color=CLR["CRITICAL"]))
ws1.row_dimensions[19].height = 30

# Column widths sheet1
for col, w in [(1,12),(2,8),(3,8),(4,60),(5,12),(6,12),(7,12),(8,12)]:
    set_col_width(ws1, col, w)

# ── SHEET 2: Full Audit List ──────────────────────────────────
ws2 = wb.create_sheet("📋 Danh sách API cần sửa")
ws2.sheet_view.showGridLines = False
ws2.freeze_panes = "A3"

# Title row
ws2.merge_cells("A1:K1")
t = ws2["A1"]
t.value = "DANH SÁCH API CẦN SỬA — CHI TIẾT"
t.fill = fill(CLR["section_bg"])
t.font = Font(bold=True, color="FFFFFF", size=14, name="Arial")
t.alignment = Alignment(horizontal="center", vertical="center")
ws2.row_dimensions[1].height = 30

# Column headers
cols = [
    "STT", "Endpoint", "File", "Severity",
    "Vấn đề (BE)", "FE Callers", "Fix Scope",
    "Business Impact\n(Level)",
    "Ảnh hưởng nghiệp vụ nếu sửa",
    "Deploy Risk nếu không đồng bộ",
    "Priority"
]
for ci, h in enumerate(cols, 1):
    header_cell(ws2, 2, ci, h, bg=CLR["header_bg"], size=9)
ws2.row_dimensions[2].height = 30

for ri, row in enumerate(FINDINGS, 3):
    stt, endpoint, file_, sev, issues, fe_callers, fix_scope, biz_level, biz_note, deploy_risk, priority = row
    bg = CLR["alt_row"] if ri % 2 == 0 else "FFFFFF"

    data_cell(ws2, ri, 1, stt, h_align="center", bold=True)
    data_cell(ws2, ri, 2, endpoint, bg=bg, bold=True, size=9)
    data_cell(ws2, ri, 3, file_, bg=bg, size=8)
    # Severity with color
    sev_c = ws2.cell(row=ri, column=4, value=sev)
    sev_c.fill = fill(CLR.get(sev, "FFFFFF"))
    sev_c.font = Font(bold=True, color="FFFFFF", size=9, name="Arial")
    sev_c.alignment = align(h="center")
    sev_c.border = thin_border()

    data_cell(ws2, ri, 5, issues, bg=bg, size=8)
    data_cell(ws2, ri, 6, fe_callers, bg=bg, size=8)

    # Fix scope with color
    scope_bg = CLR["be_only"] if fix_scope == "BE only" else (CLR["be_fe"] if "FE" in fix_scope else CLR["skip"])
    scope_fg = "FFFFFF"
    sc = ws2.cell(row=ri, column=7, value=fix_scope)
    sc.fill = fill(scope_bg)
    sc.font = Font(bold=True, color=scope_fg, size=8, name="Arial")
    sc.alignment = align(h="center")
    sc.border = thin_border()

    # Business impact level with color
    biz_bg = CLR.get("biz_" + biz_level, "FFFFFF")
    biz_fg = "FFFFFF" if biz_level != "LOW" and biz_level != "NONE" else "FFFFFF"
    bc = ws2.cell(row=ri, column=8, value=biz_level)
    bc.fill = fill(biz_bg)
    bc.font = Font(bold=True, color="FFFFFF", size=9, name="Arial")
    bc.alignment = align(h="center")
    bc.border = thin_border()

    data_cell(ws2, ri, 9, biz_note, bg=bg, size=8)
    data_cell(ws2, ri, 10, deploy_risk, bg=bg, size=8)

    # Priority with color
    pri_bg = {"P0": CLR["CRITICAL"], "P1": CLR["HIGH"], "P2": CLR["MEDIUM"], "P3": CLR["LOW"]}.get(priority, "FFFFFF")
    pc = ws2.cell(row=ri, column=11, value=priority)
    pc.fill = fill(pri_bg)
    pc.font = Font(bold=True, color="FFFFFF", size=9, name="Arial")
    pc.alignment = align(h="center")
    pc.border = thin_border()

    ws2.row_dimensions[ri].height = 60

# Column widths sheet2
for col, w in [(1,5),(2,30),(3,38),(4,10),(5,40),(6,38),(7,13),(8,11),(9,45),(10,40),(11,9)]:
    set_col_width(ws2, col, w)

# ── SHEET 3: Fix Priority Plan ────────────────────────────────
ws3 = wb.create_sheet("🔧 Fix Priority Plan")
ws3.sheet_view.showGridLines = False
ws3.freeze_panes = "A3"

ws3.merge_cells("A1:G1")
t3 = ws3["A1"]
t3.value = "KẾ HOẠCH SỬA LỖI THEO ƯU TIÊN"
t3.fill = fill(CLR["section_bg"])
t3.font = Font(bold=True, color="FFFFFF", size=14, name="Arial")
t3.alignment = Alignment(horizontal="center", vertical="center")
ws3.row_dimensions[1].height = 30

headers3 = ["Priority", "Timeline", "Endpoint", "Fix Scope", "Business Impact", "Ảnh hưởng nghiệp vụ", "Deploy Risk"]
for ci, h in enumerate(headers3, 1):
    header_cell(ws3, 2, ci, h, bg=CLR["header_bg"], size=9)
ws3.row_dimensions[2].height = 22

TIMELINE = {"P0": "Hôm nay", "P1": "Sprint này (1-2 tuần)", "P2": "Sprint tiếp (3-4 tuần)", "P3": "Backlog"}
ri = 3
for priority, _, stts in PRIORITY_DATA:
    pri_findings = [f for f in FINDINGS if f[0] in stts]
    pri_bg = {"P0": CLR["CRITICAL"], "P1": CLR["HIGH"], "P2": CLR["MEDIUM"], "P3": CLR["LOW"]}.get(priority, "FFFFFF")

    for f in pri_findings:
        stt, endpoint, file_, sev, issues, fe_callers, fix_scope, biz_level, biz_note, deploy_risk, _ = f
        row_bg = CLR["alt_row"] if ri % 2 == 0 else "FFFFFF"

        # Priority
        pc = ws3.cell(row=ri, column=1, value=priority)
        pc.fill = fill(pri_bg)
        pc.font = Font(bold=True, color="FFFFFF", size=9, name="Arial")
        pc.alignment = align(h="center")
        pc.border = thin_border()

        data_cell(ws3, ri, 2, TIMELINE.get(priority, ""), bg=row_bg, bold=True, size=8, h_align="center")
        data_cell(ws3, ri, 3, endpoint, bg=row_bg, bold=True, size=9)

        scope_bg = CLR["be_only"] if fix_scope == "BE only" else (CLR["be_fe"] if "FE" in fix_scope else CLR["skip"])
        sc = ws3.cell(row=ri, column=4, value=fix_scope)
        sc.fill = fill(scope_bg)
        sc.font = Font(bold=True, color="FFFFFF", size=8, name="Arial")
        sc.alignment = align(h="center")
        sc.border = thin_border()

        biz_bg = CLR.get("biz_" + biz_level, "FFFFFF")
        bc = ws3.cell(row=ri, column=5, value=biz_level)
        bc.fill = fill(biz_bg)
        bc.font = Font(bold=True, color="FFFFFF", size=9, name="Arial")
        bc.alignment = align(h="center")
        bc.border = thin_border()

        data_cell(ws3, ri, 6, biz_note, bg=row_bg, size=8)
        data_cell(ws3, ri, 7, deploy_risk, bg=row_bg, size=8)
        ws3.row_dimensions[ri].height = 55
        ri += 1

    # separator row
    for ci in range(1, 8):
        sep = ws3.cell(row=ri, column=ci, value="")
        sep.fill = fill("ECF0F1")
        sep.border = thin_border()
    ws3.row_dimensions[ri].height = 6
    ri += 1

for col, w in [(1,9),(2,20),(3,32),(4,14),(5,13),(6,50),(7,45)]:
    set_col_width(ws3, col, w)

# ── SHEET 4: Legend ───────────────────────────────────────────
ws4 = wb.create_sheet("ℹ️ Ghi chú")
ws4.sheet_view.showGridLines = False

ws4.merge_cells("A1:D1")
lt = ws4["A1"]
lt.value = "GHI CHÚ — BẢNG MÃ MÀU VÀ THUẬT NGỮ"
lt.fill = fill(CLR["section_bg"])
lt.font = Font(bold=True, color="FFFFFF", size=13, name="Arial")
lt.alignment = Alignment(horizontal="center", vertical="center")
ws4.row_dimensions[1].height = 28

legends = [
    ("SEVERITY", [
        ("CRITICAL", CLR["CRITICAL"], "Đang gây down hoặc data leak — fix ngay hôm nay"),
        ("HIGH", CLR["HIGH"], "Sẽ gây down khi scale — fix trong sprint này"),
        ("MEDIUM", CLR["MEDIUM"], "Rủi ro tích lũy theo thời gian — lên kế hoạch"),
        ("LOW", CLR["LOW"], "Nội bộ dev / ít tác động"),
    ]),
    ("FIX SCOPE", [
        ("BE only", CLR["be_only"], "Chỉ sửa backend. FE không cần thay đổi hoặc thay đổi tối thiểu."),
        ("BE + FE", CLR["be_fe"], "PHẢI sửa đồng thời BE và FE. Deploy không đồng bộ = lỗi nghiệp vụ ngay lập tức."),
    ]),
    ("BUSINESS IMPACT", [
        ("HIGH", CLR["biz_HIGH"], "Ảnh hưởng trực tiếp đến revenue hoặc operational workflow tại facility"),
        ("MEDIUM", CLR["biz_MEDIUM"], "Ảnh hưởng một phần; cần kiểm tra nhưng không block ngay"),
        ("LOW", CLR["biz_LOW"], "Tác động nhỏ hoặc chỉ ảnh hưởng admin nội bộ"),
        ("NONE", CLR["biz_NONE"], "Script nội bộ dev; không ảnh hưởng user"),
    ]),
]

row = 3
for section, items in legends:
    ws4.merge_cells(f"A{row}:D{row}")
    sec = ws4[f"A{row}"]
    sec.value = section
    sec.fill = fill("2C3E50")
    sec.font = Font(bold=True, color="FFFFFF", size=10, name="Arial")
    sec.alignment = Alignment(horizontal="left", vertical="center")
    ws4.row_dimensions[row].height = 22
    row += 1
    for label, bg, desc in items:
        c1 = ws4.cell(row=row, column=1, value=label)
        c1.fill = fill(bg)
        c1.font = Font(bold=True, color="FFFFFF", size=9, name="Arial")
        c1.alignment = Alignment(horizontal="center", vertical="center")
        c1.border = thin_border()
        ws4.cell(row=row, column=2).value = ""
        c3 = ws4.cell(row=row, column=3, value=desc)
        c3.font = Font(size=9, name="Arial")
        c3.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
        c3.border = thin_border()
        ws4.merge_cells(f"C{row}:D{row}")
        ws4.row_dimensions[row].height = 25
        row += 1
    row += 1

for col, w in [(1,16),(2,4),(3,55),(4,20)]:
    set_col_width(ws4, col, w)

wb.save(OUTPUT)
print(f"✅ File saved: {OUTPUT}")
