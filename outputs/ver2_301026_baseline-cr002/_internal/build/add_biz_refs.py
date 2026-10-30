"""Them EV code-ref cho enum trang thai (Prisma) + cau hoi nghiep vu O8 vao inventory (khong trung)."""
import openpyxl
I = "outputs/ver1_281026_baseline/_internal"
wb = openpyxl.load_workbook(I + "/inventory.xlsx")
led, qs = wb["05_Evidence"], wb["06_OpenQuestions"]
have = {r[2]: r[0] for r in led.iter_rows(min_row=2, values_only=True)}
nxt = max(int(r[0][3:]) for r in led.iter_rows(min_row=2, values_only=True)) + 1
out = {}
for loc, note in [("REPO-01:prisma/schema.prisma#L553-L561", "enum BookingStatus — trạng thái lượt đặt"),
                  ("REPO-01:prisma/schema.prisma#L563-L568", "enum PaymentStatus — trạng thái thanh toán"),
                  ("REPO-01:prisma/schema.prisma#L587-L594", "enum TicketType — loại vé"),
                  ("REPO-01:prisma/schema.prisma#L546-L551", "enum Role — vai trò người dùng")]:
    if loc not in have:
        led.append(["EV-%04d" % nxt, "code-ref", loc, "", "", "", note + " (O8, 28/10/2026)"]); have[loc] = "EV-%04d" % nxt; nxt += 1
    out[loc] = have[loc]
qids = {r[0] for r in qs.iter_rows(min_row=2, values_only=True)}
NEW = [("Q-186", "Inference", "Hàng chờ: khách được gọi mà không tới trong thời gian quy định thì bị huỷ tự động",
        "Tác vụ chạy mỗi phút chuyển lượt đang được gọi quá thời gian giới hạn sang huỷ bởi hệ thống và gửi mail (REPO-01:src/pages/api/cron-job/process-overdue-calling-booking.ts#L25-L40). Thời gian giới hạn lấy từ cài đặt, giá trị thật trên môi trường đang chạy chưa biết.",
        "Khách hàng xác nhận: quá bao nhiêu phút thì huỷ, và có đúng là huỷ luôn (A) hay chỉ chuyển về chờ (B)?"),
       ("Q-187", "Unknown", "Lịch chạy các tác vụ tự động (nhắc lịch, huỷ quá hạn, đối soát máy bán hàng Smaregi)",
        "Code ghi chú 'chạy mỗi phút' nhưng repo không có bộ hẹn giờ; các tác vụ là đường dẫn chờ bên ngoài gọi, chỉ chạy khi bật cấu hình (REPO-01:src/config.ts#L67-L68).",
        "Khách hàng / bên vận hành cho biết: ai gọi các tác vụ này và theo lịch nào."),
       ("Q-188", "Inference", "Khách tự huỷ vé đã thanh toán online — tiền được hoàn thế nào",
        "Khi khách tự huỷ, code huỷ giao dịch trên cổng thanh toán GMO rồi ghi trạng thái hoàn tiền (xem API huỷ đặt chỗ của người dùng). Code không cho biết có phí huỷ / hoàn một phần hay không.",
        "Khách hàng xác nhận: huỷ là hoàn toàn bộ (A) hay có quy định phí huỷ / thời hạn huỷ (B)?")]
for q in NEW:
    if q[0] not in qids:
        qs.append([q[0], q[1], q[2], q[3], q[4], "Khách hàng / PM", "Open", "O8 Hướng dẫn nghiệp vụ"])
wb.save(I + "/inventory.xlsx")
print(out)
