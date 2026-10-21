# Sinh CR-002_ETA_vi.xlsx = ban NOI BO tieng Viet cua 見積書 CR-002 (S12):
#   sheet ETA_vi + Tiền đề · Lưu ý: estimate_core.build_workbook(estimate.json, lang vi, internal) — CUNG nguon voi
#   CR-002_見積書.xlsx (ban KH tieng Nhat, build-estimate.py), them cot Impact + can cu 実装 (ma function-rates x so luong).
#   sheet Schedule: so ngay lay tu tong theo phuong an cua estimate.json · sheet QnA: cau hoi cr.json (VI + JA).
# Chay: python3 gen_eta_vi.py
import copy, json, os, sys
import openpyxl
from openpyxl.styles import Alignment, Font, PatternFill, Border, Side

HERE = os.path.dirname(os.path.abspath(__file__))
VER = os.path.dirname(HERE)
KIT = os.path.abspath(os.path.join(VER, "..", ".."))
sys.path.insert(0, os.path.join(KIT, ".claude/skills/system-analyst/scripts"))
import estimate_core as E  # noqa: E402

cr = json.load(open(os.path.join(HERE, "cr.json")))
est = json.load(open(os.path.join(HERE, "estimate.json")))
rmeta, frates = E.load_rates(os.path.join(KIT, ".claude/config/function-rates.json"))
err = E.validate(est, frates, cr)
assert not err, err
wb0, pos, tm = E.build_workbook(est, frates, rmeta, os.path.join(KIT, "templates/template_mitsumori.xlsx"), "vi", internal=False)  # ban doc cho nguoi: khong cot Impact / ma don gia (da co o Impact.xlsx)
# 20/10/2026: sheet ETA_vi = ETA FINAL cua team (Google Sheet KIDO-B-Vedoan, tai ve inputs/) — giu nguyen, khong sinh lai
FINAL = os.path.join(KIT, "inputs/cr/es_danh_sach_doan_v2/KIDO-B-Vedoan_ETA_FINAL_201026.xlsx")
wb = openpyxl.load_workbook(FINAL)
ws = wb.worksheets[0]; ws.title = "ETA_vi"
def copy_sheet(a, title):  # chep gia tri + style tu workbook kit sang workbook FINAL
    b = wb.create_sheet(title)
    for row in a.iter_rows():
        for c in row:
            d = b.cell(row=c.row, column=c.column, value=c.value)
            if c.has_style: d.font, d.border, d.fill, d.alignment, d.number_format = copy.copy(c.font), copy.copy(c.border), copy.copy(c.fill), copy.copy(c.alignment), c.number_format
    for m in a.merged_cells.ranges: b.merge_cells(str(m))
    for k, v in a.column_dimensions.items(): b.column_dimensions[k].width = v.width
    for k, v in a.row_dimensions.items(): b.row_dimensions[k].height = v.height
for t in wb0.sheetnames[1:]: copy_sheet(wb0[t], t)
# cong so theo phuong an = dong tong cua FINAL (cot E nhan · J 要件 · K UI · L 実装 · M テスト · N 管理 · O 小計)
fw = openpyxl.load_workbook(FINAL, data_only=True).worksheets[0]
TOT = {}
for r in range(1, fw.max_row + 1):
    lab = str(fw.cell(r, 5).value or "").strip()
    if lab and isinstance(fw.cell(r, 15).value, (int, float)) and fw.cell(r, 4).value == "（人月）":
        v = [float(fw.cell(r, c).value or 0) for c in range(10, 16)]
        assert abs(sum(v[:5]) - v[5]) < 0.01, ("FINAL dong tong lech", lab, v)   # 小計 = 5 cong doan
        TOT[lab] = v
src = ws  # font cho sheet QnA
LAB = {"①-B": "① Phương án B", "①-A": "① Phương án A", "② cơ bản": "② Không Option", "② Option": "② Option"}  # phuong an lich trinh -> nhan dong tong FINAL

# ================= Sheet "Schedule" — theo mau sheet スケジュール (見積書_団体利用_2609.xlsx), dich sang tieng Viet =========
import datetime as dt, math
from openpyxl.utils import get_column_letter as L_
PH = {p: TOT[l][:4] for p, l in LAB.items()}  # nguoi-ngay (要件 · UI · 実装 · テスト) theo ETA FINAL; "② Option" = tron goi ② co Option (thay ② co ban, khong cong them)
WEEKS = {"①-A": 1, "①-B": 1, "② cơ bản": 2, "② Option": 4}   # user 20/10: thoi gian Dipro lam (xac nhan → lap trinh → kiem thu) co dinh theo tuan
UAT_DAYS = {"①-A": 2, "①-B": 2, "② cơ bản": 3, "② Option": 3}   # ngay KH nghiem thu
START = dt.date(2026, 10, 19); JP_HOL = {dt.date(2026, 11, 3)}  # 文化の日 — KH nghi, Dipro (VN) van lam
def wd(d, n, kh=False):  # n ngay lam viec tinh tu d (gom d) -> list ngay
    out = []
    while len(out) < n:
        if d.weekday() < 5 and not (kh and d in JP_HOL): out.append(d)
        d += dt.timedelta(days=1)
    return out
def nxt(d, kh=False): return wd(d + dt.timedelta(days=1), 1, kh)[0]
def prv(d):  # ngay lam viec lien truoc
    d -= dt.timedelta(days=1)
    while d.weekday() >= 5 or d in JP_HOL: d -= dt.timedelta(days=1)  # dat hang = ngay KH lam viec
    return d
STAFF = {}
def plan_dates(p, start, dev_free=None):  # start = ngay Dipro bat dau (xac nhan yeu cau); dat hang = ngay lam viec truoc do
    J, K, Lm, M = PH[p]; order = prv(start); W = 5 * WEEKS[p]
    nr = max(1, round(W * J / (J + Lm + M))); nt = max(1, round(W * M / (J + Lm + M))); nd = W - nr - nt  # chia W ngay theo ti le cong
    span = wd(start, W); req, dev, test = span[:nr], span[nr:nr + nd], span[nr + nd:]
    ui = wd(req[-1], max(1, math.ceil(K))) if K else []   # UI lam song song tu ngay cuoi xac nhan yeu cau
    STAFF[p] = (math.ceil(Lm / nd), math.ceil(M / nt))   # so nguoi can de kip: dev, test
    uat = wd(nxt(test[-1], True), UAT_DAYS[p], True); rel = nxt(uat[-1], True)
    return dict(order=order, req=req, ui=ui, dev=dev, test=test, uat=uat, rel=rel)
# User 20/10: bat dau 26/10 (T2) · lam xong ① (Dipro het lap trinh + kiem thu) moi sang ② — ② co ban / ② Option la 2 phuong an thay the nhau
START1 = dt.date(2026, 10, 26)
S = {p: plan_dates(p, START1) for p in ("①-B", "①-A")}
START2 = nxt(S["①-B"]["test"][-1])
S.update({p: plan_dates(p, START2) for p in ("② cơ bản", "② Option")})
for p in S: assert len(S[p]["req"] + S[p]["dev"] + S[p]["test"]) == 5 * WEEKS[p], p
O1, O2 = S["①-B"]["order"], S["② cơ bản"]["order"]; O3 = O2
f = lambda d: "%d/%d (%s)" % (d.day, d.month, ["T2","T3","T4","T5","T6","T7","CN"][d.weekday()])

sc = wb.create_sheet("Schedule")
src2 = openpyxl.load_workbook(os.path.join(KIT, "inputs/cr/est_danh_sach_doan/【TOKIWAGI様】見積書_団体利用_2609.xlsx"))["スケジュール"]
def st(a, cell):  # copy style tu o mau
    s0 = src2[a]; cell.font, cell.border, cell.alignment = copy.copy(s0.font), copy.copy(s0.border), copy.copy(s0.alignment)
    if s0.fill.fill_type: cell.fill = copy.copy(s0.fill)
    return cell
FILL = lambda rgb: PatternFill("solid", fgColor=rgb)
DIPRO, KH, OFF, HDR = "FFDAEEF3", "FFEAF1DD", "FFB7B7B7", "FFB0D7E3"
days = [START + dt.timedelta(days=i) for i in range((S["② Option"]["rel"] - START).days + 4)]
C0 = 6  # cot F = ngay dau
for k, w in {"A": 2.1, "B": 6.9, "C": 8.1, "D": 9, "E": 30}.items(): sc.column_dimensions[k].width = w
for i in range(len(days)): sc.column_dimensions[L_(C0 + i)].width = 5.4
st("B2", sc.cell(row=2, column=2, value="Lịch trình triển khai — CR-002 Bán sản phẩm cho khách doanh nghiệp"))
st("B5", sc.cell(row=4, column=2, value="Giả định: bắt đầu 26/10 (T2), làm xong ① rồi mới sang ② · thời gian Dipro làm (xác nhận → lập trình → kiểm thử): ① 1 tuần, ② không Option 2 tuần, ② có Option 4 tuần — chia ngày theo tỉ lệ công từng công đoạn ở sheet ETA_vi; để kịp cần %s · KH trả lời Q&A trong 1 ngày · KH nghiệm thu (UAT) ①: %d ngày, ②: %d ngày · thứ 7 / CN nghỉ · 3/11 (ngày lễ Văn hoá của Nhật) KH nghỉ, Dipro làm."
    % (" · ".join("%s %d dev + %d test" % (p, *STAFF[p]) for p in ("①-B", "② cơ bản", "② Option")), UAT_DAYS["①-B"], UAT_DAYS["② cơ bản"]))).font = Font(name="Meiryo", size=10)
# ---- ◆ 1. Tra loi cau hoi release
r = 6
st("B5", sc.cell(row=r, column=2, value="◆ 1. Trả lời câu hỏi về thời gian release")); r += 1
QCOL = [("Phương án", 2, 5), ("Hoàn thành trước 22/10?", 6, 11), ("Release sớm nhất", 12, 16), ("Điều kiện để bắt đầu phát triển", 17, 28),
        ("Hạn chốt đặc tả", 29, 33), ("Hạn đặt hàng", 34, 38)]
def mrow(rr, vals, style="B8", fill=None, h=None):
    for (t, a, b), v in zip(QCOL, vals):
        sc.merge_cells(start_row=rr, start_column=a, end_row=rr, end_column=b)
        for c in range(a, b + 1):
            x = st(style, sc.cell(row=rr, column=c))
            if fill: x.fill = FILL(fill)
        x = sc.cell(row=rr, column=a, value=v); x.alignment = Alignment(wrap_text=True, vertical="center", horizontal="center" if a in (6, 12, 29, 34) else "left")
    if h: sc.row_dimensions[rr].height = h
mrow(r, [t for t, _, _ in QCOL], "B6", HDR, 30); r += 1
COND1 = "Khách hàng trả lời các câu hỏi nhóm Lịch (sheet Câu hỏi nghiệp vụ) · đặt hàng · có môi trường thử để nghiệm thu"
COND2 = "Khách hàng trả lời các câu hỏi nhóm Trang giới hạn (sheet Câu hỏi nghiệp vụ) · đặt hàng · có môi trường thử và người nghiệm thu"
COND3 = "Như ② + trả lời câu hỏi nhóm Option (1 sản phẩm hiển thị ở nhiều trang, thời hạn trang)"
NO = "Không — cần tối thiểu %d ngày làm việc (xác nhận → lập trình → test → nghiệm thu)"
ans = [
    ("①-A  Lịch mặc định đóng", NO % len(set(S["①-A"]["req"] + S["①-A"]["dev"] + S["①-A"]["test"] + S["①-A"]["uat"])), f(S["①-A"]["rel"]), COND1, f(O1), f(O1)),
    ("①-B  Lịch mặc định 1 tuần (KH ưu tiên)", NO % len(set(S["①-B"]["req"] + S["①-B"]["dev"] + S["①-B"]["test"] + S["①-B"]["uat"])), f(S["①-B"]["rel"]), COND1, f(O1), f(O1)),
    ("②  Không Option (1 trang giới hạn)", "Không", f(S["② cơ bản"]["rel"]), COND2, f(O2), f(O2)),
    ("②  Có Option (nhiều trang)", "Không", f(S["② Option"]["rel"]), COND3, f(O2), f(O2)),
    ("①-B + ② không Option", "Không", "Chia release: ① " + f(S["①-B"]["rel"]) + " · ② " + f(S["② cơ bản"]["rel"]), COND1 + " / " + COND2, "① " + f(O1) + " · ② " + f(O2), "① " + f(O1) + " · ② " + f(O2)),
    ("①-B + ② có Option", "Không", "Chia release: ① " + f(S["①-B"]["rel"]) + " · ② có Option " + f(S["② Option"]["rel"]), COND1 + " / " + COND3, "① " + f(O1) + " · ② " + f(O2), "① " + f(O1) + " · ② " + f(O2)),
    ("①-A + ② (không / có Option)", "Không", "Như ①-B + ②, riêng ① release " + f(S["①-A"]["rel"]), COND1 + " / " + COND2, "như trên", "như trên"),
]
for a in ans: mrow(r, list(a), "B8", None, 62); r += 1
r += 1
for t in ["※ Không phương án nào kịp release trước 22/10 nếu giữ đủ bước kiểm thử và nghiệm thu. Lịch: bắt đầu 26/10 (T2), làm xong ① (lập trình + kiểm thử) mới sang ②; ① khách nghiệm thu trong lúc Dipro làm ②. Chọn Option thì R2' thay cho R2. Công số lấy từ sheet ETA_vi (bản FINAL).",
          "※ Muốn bắt đầu bán từ 22/10 khi chưa có ②: KH có thể tạo 4 sản phẩm bằng chức năng Quản lý sản phẩm hiện có và tạm để công khai (tên ghi rõ “dành cho doanh nghiệp”) — sản phẩm sẽ hiện lẫn với sản phẩm thường cho đến khi release ②. Cần KH quyết định.",
          "※ Ngày dưới đây là sớm nhất, với điều kiện KH trả lời câu hỏi + đặt hàng đúng hạn chốt. Trễ hạn chốt N ngày làm việc → release lùi tương ứng."]:
    x = sc.cell(row=r, column=2, value=t); st("B20", x); r += 1
# ---- ◆ 2. Gantt
r += 1
st("B5", sc.cell(row=r, column=2, value="◆ 2. Lịch đề xuất — release từng phần")); r += 1
h1, h2 = r, r + 1
for rr in (h1, h2):
    st("B6", sc.cell(row=rr, column=2)); [st("B6", sc.cell(row=rr, column=c)) for c in (3, 4, 5)]
sc.merge_cells(start_row=h1, start_column=2, end_row=h2, end_column=2); sc.cell(row=h1, column=2, value="No.")
sc.merge_cells(start_row=h1, start_column=3, end_row=h2, end_column=5); sc.cell(row=h1, column=3, value="Công đoạn")
i = 0
while i < len(days):  # header tuan (T2–CN)
    j = i
    while j + 1 < len(days) and days[j + 1].weekday() != 0: j += 1
    for c in range(C0 + i, C0 + j + 1): st("F6", sc.cell(row=h1, column=c))
    sc.merge_cells(start_row=h1, start_column=C0 + i, end_row=h1, end_column=C0 + j)
    sc.cell(row=h1, column=C0 + i, value="Tuần %s–%s" % (days[i].strftime("%d/%m"), days[j].strftime("%d/%m")))
    i = j + 1
for k, d in enumerate(days):
    x = st("F7", sc.cell(row=h2, column=C0 + k, value="%d\n%s" % (d.day, ["T2","T3","T4","T5","T6","T7","CN"][d.weekday()])))
    x.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    if d.weekday() >= 5: x.fill = FILL(OFF)
sc.row_dimensions[h2].height = 32
r = h2 + 1
def bar(rr, no, label, ds, who, mark=None):
    st("B8", sc.cell(row=rr, column=2, value=no)); sc.merge_cells(start_row=rr, start_column=3, end_row=rr, end_column=5)
    for c in (3, 4, 5): st("C8", sc.cell(row=rr, column=c))
    sc.cell(row=rr, column=3, value=label).alignment = Alignment(vertical="center", wrap_text=True)
    for k, d in enumerate(days):
        x = st("N12", sc.cell(row=rr, column=C0 + k)); x.fill = PatternFill(fill_type=None)
        if d.weekday() >= 5: x.fill = FILL(OFF)
        elif d in JP_HOL and who == "KH": x.fill = FILL(OFF)
        elif d in ds: x.fill = FILL(DIPRO if who == "DIPRO" else KH)
    if mark:
        k = days.index(mark); c = sc.cell(row=rr, column=C0 + k, value="★"); c.font = Font(name="Meiryo", size=12, bold=True, color="FFCF222E"); c.alignment = Alignment(horizontal="center")
        t = sc.cell(row=rr, column=C0 + k + 1, value="Release " + f(mark)); t.font = Font(name="Meiryo", size=10, bold=True, color="FFCF222E")
    sc.row_dimensions[rr].height = 24
def block(title, p, order_label):
    global r
    c = sc.cell(row=r, column=2, value=title); st("B5", c); r += 1
    D = S[p]
    bar(r, 1, order_label, [D["order"]], "KH"); r += 1
    bar(r, 2, "Xác nhận yêu cầu / hỏi đáp", D["req"], "DIPRO"); r += 1
    if D["ui"]: bar(r, 3, "Thiết kế giao diện", D["ui"], "DIPRO"); r += 1
    bar(r, 4, "Lập trình + kiểm thử đơn vị", D["dev"], "DIPRO"); r += 1
    bar(r, 5, "Kiểm thử tích hợp", D["test"], "DIPRO"); r += 1
    bar(r, 6, "Khách hàng nghiệm thu (UAT)", D["uat"], "KH"); r += 1
    bar(r, 7, "Sửa theo phản hồi + release", [D["rel"]], "DIPRO", D["rel"]); r += 1
block("R1 — ①-B Lịch mặc định 1 tuần (nếu chọn ①-A: release " + f(S["①-A"]["rel"]) + ")", "①-B", "Trả lời CQ + đặt hàng (KH)")
block("R2 — ② Trang giới hạn (không Option)", "② cơ bản", "Trả lời CQ + đặt hàng (KH)")
block("R2' — ② có Option nhiều trang (thay cho R2 nếu chọn Option)", "② Option", "Trả lời CQ + chọn Option + đặt hàng (KH)")
r += 1
st("B17", sc.cell(row=r, column=2)); st("C17", sc.cell(row=r, column=3, value="Phạm vi công việc của Dipro")); r += 1
st("B18", sc.cell(row=r, column=2)); st("C17", sc.cell(row=r, column=3, value="Phạm vi công việc của khách hàng")); r += 1
x = sc.cell(row=r, column=2); x.fill = FILL(OFF); st("C17", sc.cell(row=r, column=3, value="Ngày nghỉ (thứ 7 / CN · 3/11 ngày lễ phía khách hàng)")); r += 2
for t in ["※1 Khi bắt đầu phát triển, hai bên tổ chức họp kick-off ngắn (online).",
          "※2 Hạn chốt đặc tả là mốc quan trọng: sau khi bắt đầu lập trình, thay đổi yêu cầu / thiết kế có thể làm phát sinh công số và lùi lịch.",
          "※3 Lịch có thể thay đổi theo thời điểm đặt hàng thực tế và lịch deploy production của KH."]:
    st("B20", sc.cell(row=r, column=2, value=t)); r += 1
sc.sheet_view.showGridLines = False

# ================= Sheet "QnA" — cau hoi nghiep vu / yeu cau chua ro (nguon: cr.json questions, cung voi sheet Q&A cua Impact xlsx)
# [phan loai, hang muc, phuong an Dipro de xuat neu KH khong co y kien, anh huong neu KH chon khac, han tra loi, cau hoi tieng Nhat]
QM = {
 "CQ-001": ("Đặc tả màn hình", "①", "Mặc định 7 ngày; mở rộng = 30 ngày tính từ hôm nay (dùng chế độ 30 ngày đã có)", "Tháng dương lịch → thêm xử lý ngày, phát sinh công nhỏ", O1,
            "現在、本番環境の事前予約カレンダーは何日分表示されていますか。「1か月分」は本日から30日間でよろしいでしょうか、それとも暦月（月末まで）でしょうか。"),
 "CQ-002": ("Đặc tả màn hình", "①-B", "7 ngày tính từ hôm nay (đúng 1 hàng lưới hiện tại)", "Tuần 月〜日 → thêm ô trống đầu hàng, phát sinh công nhỏ", O1,
            "パターンBの「1週間分」は本日から7日間でよろしいでしょうか、それとも月曜〜日曜の暦週でしょうか。"),
 "CQ-003": ("Đặc tả màn hình", "①", "Mỗi sản phẩm 1 nút; không nhớ trạng thái mở khi quay lại trang", "Nhớ trạng thái → phát sinh công nhỏ", O1,
            "展開ボタンは商品ごとに設置する想定でよろしいでしょうか。ページを再表示した際に展開状態を保持する必要はありますか。"),
 "CQ-004": ("Phạm vi", "①", "Áp dụng: 店舗詳細 + màn mua trước + trang 限定公開; màn admin 空き状況 giữ nguyên", "Thêm màn khác → thêm kiểm thử", O1,
            "カレンダー折りたたみの対象は、店舗詳細・事前購入画面・限定公開ページでよろしいでしょうか（管理画面の空き状況は変更なし）。"),
 "CQ-005": ("Đặc tả màn hình", "②", "Đúng yêu cầu: 1 trang / 1 URL (Option: mỗi trang 1 URL); trên trang có ô chọn 施設", "Liệt kê mọi 施設 cùng lúc → trang dài, thêm công nhỏ. (②-S mỗi 施設 1 URL là lệch yêu cầu — chỉ khi KH chấp nhận)", O2,
            "限定公開ページは、ご依頼どおりURL1つのページ（オプション時はページごとにURL）とする想定です。複数店舗の商品は、ページ内で店舗を選択して表示する形でよろしいでしょうか。全店舗分を同時に一覧表示する必要はありますか。"),
 "CQ-006": ("Nghiệp vụ", "②", "URL cố định do hệ thống cấp; muốn đổi URL thì nhờ Dipro (cần deploy)", "Đổi URL từ màn quản trị → thêm 1 màn cài đặt (tương đương một phần Option)", O2,
            "限定公開URLを管理画面から変更する必要はありますか（オプションなしの場合、URLはシステム設定で固定し、変更時は弊社で対応します）。"),
 "CQ-007": ("Nghiệp vụ / bảo mật", "②", "Đồng ý 'ai biết URL đều xem và mua được' như yêu cầu; không thêm đăng nhập / mật khẩu", "Chặn mua sản phẩm 限定公開 ngoài trang → sửa API tạo đặt chỗ, thêm công", O2,
            "限定公開は「URLを知っている方のみ閲覧・購入可能」（ログイン・パスワードなし）でよろしいでしょうか。URLが共有されるリスクについてご了承いただけますか。"),
 "CQ-008": ("Nghiệp vụ", "②", "事前1DAY: thanh toán thẻ online như hiện tại · 当日1DAY: mua như vé trong ngày hiện tại", "Cách thanh toán khác (請求書, chuyển khoản…) → phát sinh lớn", O2,
            "法人向け商品の決済方法は、事前1DAYはクレジットカード（現行どおり）、当日1DAYは現行の当日利用と同じ方法でよろしいでしょうか。"),
 "CQ-009": ("Đặc tả màn hình", "②", "Ẩn sản phẩm 限定公開 ở 料金プラン và 待ち時間/販売状況", "Muốn hiện ở các màn này → giữ nguyên, giảm kiểm thử", O2,
            "限定公開商品は料金プラン・待ち時間/販売状況ページにも表示しない想定でよろしいでしょうか。"),
 "CQ-010": ("Nghiệp vụ", "② Option", "Đề xuất Dipro: 1 sản phẩm gắn được nhiều trang (đã tính trong ước tính); trang không có thời hạn (tạm dừng bằng tay)", "Chỉ cần 1 sản phẩm = 1 trang → giảm nhẹ công; cần thời hạn hiển thị → thêm field + điều kiện lọc", O3,
            "オプションでは、1つの商品を複数の限定公開ページに掲載できる仕様（例：同じ商品をA社用・B社用の両ページに掲載）をご提案します。この仕様でよろしいでしょうか。また、ページに公開期間（開始日・終了日）の設定は必要ですか。"),
 "CQ-011": ("Thiết kế", "②", "Dùng bố cục 店舗詳細 hiện có + tiêu đề 法人のお客様向け商品; không cần designer", "Thiết kế riêng (ảnh, mô tả, bố cục) → thêm công UI/UX", O2,
            "限定公開ページは既存の店舗詳細ページのレイアウトを流用し、タイトルのみ「法人のお客様向け商品」とする想定でよろしいでしょうか。専用デザインは必要ですか。"),
 "CQ-012": ("Vận hành / lịch", "Tất cả", "Có môi trường staging để KH nghiệm thu (① 2 ngày, ② 3 ngày); deploy production ngay sau nghiệm thu", "Không có staging / deploy theo lịch cố định → lùi ngày release", O1,
            "受入試験用のステージング環境はございますか。本番リリースの日程に制約（定期リリース日など）はありますか。受入試験のご担当者様と、仕様確定・発注の予定日を教えてください。"),
 "CQ-014": ("Nghiệp vụ", "②", "Phân biệt bằng tên sản phẩm trong 売上管理 / CSV hiện có", "Cần lọc / cột 限定公開 riêng ở 売上管理, CSV → thêm công", O2,
            "法人向け商品の売上・予約件数を売上管理やCSVで区別して確認する必要はありますか（現状は商品名で区別可能です）。"),
}
assert set(QM) == {x["id"] for x in cr["questions"]}, "QnA thieu / thua cau hoi so voi cr.json"
# Cau hoi nghiep vu: kit sinh sheet "Câu hỏi nghiệp vụ" tu estimate.json → questions (writing-style.md)

# 20/10/2026: team chot Schedule tren Google Sheet (sheet "Schedule") -> dung ban cua team thay ban sinh o tren
# shortcut: van sinh Schedule o tren (de con O1/O2 cho QM + doi chieu ngay), roi thay bang ban team; bo phan sinh khi khong can doi chieu
mine = {p: S[p]["rel"] for p in S}
team = wb["Schedule"]; wb.remove(sc); wb.move_sheet(team, len(wb.sheetnames) - 1 - wb.sheetnames.index("Schedule"))  # FINAL da co sheet Schedule cua team
out = os.path.join(VER, "CR-002_ETA_vi.xlsx"); wb.save(out)
print("Schedule (ban tu sinh, chi doi chieu):", {p: f(S[p]["rel"]) for p in S}, {p: [round(x, 2) for x in PH[p]] for p in PH})

# self-check: tong theo phuong an cua sheet = tinh lai tu function-rates (khong go tay)
print("Da ghi", out, "· tong theo phuong an (FINAL):", {l: TOT[l][5] for l in TOT})
