# Them sheet SC-094 (trang gioi han — CR-002 da duyet, cho release) vao Basic Design WEB-02 ver12. Noi dung tu CR-3 (ver8 cr-figma.json), van phong moi.
import os, copy, openpyxl
H = os.path.dirname(os.path.abspath(__file__)); V = os.path.dirname(os.path.dirname(H))
p = os.path.join(V, "01_Screens/BasicDesign_WEB-02_ver12.xlsx"); wb = openpyxl.load_workbook(p)
if "SC-094" in wb.sheetnames: del wb["SC-094"]
ws = wb.copy_worksheet(wb["SC-067"]); ws.title = "SC-094"
for row in ws.iter_rows(min_row=9):
    for c in row[8:18]: c.value = None
ws["B1"] = "限定公開ページ（法人のお客様向け商品）"; ws["D1"] = "(chưa chốt — đề xuất /limited/{mã trang})"; ws["F1"] = "SC-094"
ws["F4"] = "DRAFT — CR-002 đã duyệt, chờ phát hành đợt 2 (19/11)"; ws["F5"] = "ver12 — baseline chính thức"
ws["B4"] = ("■目的 / Mục đích\n• Trang riêng cho khách doanh nghiệp: chỉ ai có link mới vào được, không cần đăng nhập.\n"
            "• Chỉ hiện các sản phẩm đã bật 「Hiển thị giới hạn」; trang thường không hiện các sản phẩm này.\n"
            "• Mua, thanh toán, huỷ dùng đúng luồng mua vé hiện có.")
ws["B5"] = ("• Link sai hoặc trang đã dừng → hiện trang 「ページが見つかりません」, không lộ sản phẩm.\n"
            "• Chưa có sản phẩm nào → hiện 「現在ご購入いただける商品はありません」.\n"
            "• Lịch đặt trước hiện 1 tuần, bấm 「もっと見る」 mở 1 tháng (giống trang chi tiết cửa hàng sau CR-002).")
ws["B6"] = ("1. Khách doanh nghiệp nhận link từ Bornelund.\n2. Mở link → chọn cửa hàng.\n"
            "3. Mua trước: bấm ô ○ trên lịch → màn mua trước.\n4. Dùng trong ngày: bấm 「今から利用する」 → màn mua trong ngày.")
ITEMS = [("法人のお客様向け商品", "Tiêu đề trang", "Tiêu đề", "Tiêu đề trang 「法人のお客様向け商品」."),
         ("このページは限定公開です。URLを社外の方に共有しないでください。", "Lưu ý không chia sẻ link ra ngoài công ty", "Vùng hiển thị", "Câu nhắc khách không gửi link cho người ngoài."),
         ("施設", "Cửa hàng", "Ô chọn", "Chọn cửa hàng → tải lại lịch và vé của cửa hàng đó."),
         ("事前予約", "Đặt trước", "Tiêu đề nhóm", "Nhóm sản phẩm mua trước."),
         ("カレンダー（商品 × 日付）", "Lịch theo sản phẩm", "Bảng", "Mỗi sản phẩm 1 hàng, 7 ngày; bấm ô ○ → màn mua trước (giữ link trang giới hạn)."),
         ("もっと見る（1か月）", "Xem thêm (1 tháng)", "Nút", "Mở lịch đủ 1 tháng; 「閉じる」 thu lại."),
         ("当日利用", "Dùng trong ngày", "Tiêu đề nhóm", "Nhóm sản phẩm dùng ngay hôm nay."),
         ("本日の空き状況", "Tình trạng chỗ hôm nay", "Vùng hiển thị", "Hiện tên sản phẩm và còn chỗ / hết chỗ."),
         ("今から利用する", "Dùng ngay bây giờ", "Nút", "Chuyển sang màn mua trong ngày (giữ link trang giới hạn).")]
src = wb["SC-067"]
for i, (jp, vi, t, d) in enumerate(ITEMS):
    r = 9 + i
    for col in range(9, 19):  # giu dinh dang hang mau
        ws.cell(r, col)._style = copy.copy(src.cell(9, col)._style)
    ws.cell(r, 8, i + 1); ws.cell(r, 9, jp); ws.cell(r, 10, vi); ws.cell(r, 11, t); ws.cell(r, 12, "Dùng được")
    ws.cell(r, 16, "・%s「%s」\n・CR-002で追加予定（リリース前のため未確認）" % (t, jp)); ws.cell(r, 17, "• %s\n• Thêm mới theo CR-002 — chưa phát hành, chưa kiểm tra trên hệ thống" % d)
    ws.cell(r, 18, "Bằng chứng: EV-1997 (CR-002 đã duyệt — màn đề xuất trên Figma, chưa phát hành)")
idx = wb["Screen Index"]; last = max(r for r in range(6, idx.max_row + 1) if idx.cell(r, 2).value)
for col in range(1, 13): idx.cell(last + 1, col)._style = copy.copy(idx.cell(last, col)._style)
for col, v in zip(range(1, 13), [idx.cell(last, 1).value + 1, "SC-094", "AS-IS-WEB-02", "限定公開ページ（法人のお客様向け商品）", "SC-094", "WORKING_SCREEN", 1,
                                 "DRAFT", "NO IMAGE — chưa phát hành (xem màn đề xuất CR-002 trên Figma)", "ver12 — baseline chính thức", "2026-10-21", "CR-002 đã duyệt"]):
    idx.cell(last + 1, col, v)
wb.save(p); print("SC-094 added at index row", last + 1)
