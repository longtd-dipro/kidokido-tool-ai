#!/usr/bin/env python3
"""O7 ver1: carry Observations ver12 (EV / API ID anh xa lai) + dua 8 muc 'truoc day la BUG-00x' ve sheet Suspected
theo quy tac D6 (27/10/2026: bug chi doc tu code -> Suspected, cho nguoi duyet chon). EV code-ref cu chua co trong
ledger ver1 -> them dong moi vao 05_Evidence (da kiem file / dong ton tai)."""
import csv, os, re, sys
import openpyxl
sys.path.insert(0, ".claude/skills/system-analyst/scripts")
import inv_schema as S  # noqa

V = "outputs/ver1_281026_baseline"
I = V + "/_internal"
OLD = "outputs/_backup/ver12_211026_baseline-chinh-thuc"
REPO = "inputs/tokiwagi"
OUT = V + "/07_BugList/BugList_KidoKido_ver1.xlsx"

old_led = {r[0]: r for r in list(openpyxl.load_workbook(OLD + "/_internal/inventory.xlsx", read_only=True)["05_Evidence"].iter_rows(values_only=True))[1:]}
inv = openpyxl.load_workbook(I + "/inventory.xlsx")
led = inv["05_Evidence"]
by_loc = {r[2]: r[0] for r in led.iter_rows(min_row=2, values_only=True) if r[1] == "code-ref"}
ids = {r[0] for r in led.iter_rows(min_row=2, values_only=True)}
nxt = max(int(x[3:]) for x in ids) + 1
api_map = {r["ver12 ID"]: r["ver1 ID"] for r in csv.DictReader(open(I + "/build/id-map-ver12.csv")) if r["Kind"] == "API"}
screens = {r[0]: r for r in list(inv["02_Screen"].iter_rows(values_only=True))[1:]}


def loc_ok(loc):
    m = re.match(r"^REPO-01:([^#]+)#L(\d+)(?:-L(\d+))?$", loc or "")
    fp = m and os.path.join(REPO, m.group(1))
    return bool(m and os.path.isfile(fp) and int(m.group(3) or m.group(2)) <= sum(1 for _ in open(fp, errors="ignore")))


def map_ev(e):
    global nxt
    if e in ids and old_led.get(e, (None, "screenshot"))[1] == "screenshot":
        return e                                    # anh crawl giu nguyen so
    o = old_led.get(e)
    if not o or o[1] != "code-ref" or not loc_ok(o[2]):
        return None
    if o[2] in by_loc:
        return by_loc[o[2]]
    new = "EV-%04d" % nxt
    nxt += 1
    led.append([new, "code-ref", o[2], "", "", "", "Carried from ver12 (%s) — bug list; file/dòng đã kiểm 28/10/2026" % e])
    by_loc[o[2]] = new
    ids.add(new)
    return new


def tx(s):
    s = re.sub(r"\bAPI-\d{3}\b", lambda m: api_map.get(m.group(0), m.group(0)), s or "")
    return re.sub(r"\bEV-\d{4}\b", lambda m: map_ev(m.group(0)) or "Cần xác nhận", s)


obs_old = list(openpyxl.load_workbook(OLD + "/07_BugList/BugList_KidoKido_ver12.xlsx", read_only=True)["Observations"].iter_rows(values_only=True))[1:]
TO_SUSP = {"OBS-287": "SC-025", "OBS-289": "SC-036", "OBS-290": "SC-036", "OBS-291": "SC-040",
           "OBS-292": "SC-071", "OBS-293": "SC-071", "OBS-295": "SC-011", "OBS-296": "SC-004"}
STEPS = {
    "OBS-287": "1. Đăng nhập quản trị, mở màn 「売上管理」\n2. Bấm 「CSVファイル出力」 (xuất doanh thu) — lời gọi xuất không kèm số trang\n3. Xem file tải về / thông báo lỗi",
    "OBS-289": "1. Mở màn 「商品管理」 → tạo / sửa sản phẩm\n2. Màn tự kiểm tra \"vé đã có người đặt chưa\" (has-booking) khi chưa có mã vé\n3. Xem màn có chặn sửa / xoá không",
    "OBS-290": "1. Mở màn 「商品管理」 → tạo / sửa sản phẩm, phần khung lịch đặt vé\n2. Màn kiểm tra \"lịch đã có người đặt chưa\" khi chưa có mã lịch\n3. Xem màn có chặn chỉnh lịch không",
    "OBS-291": "1. Mở màn 「ユーザー管理」\n2. Lọc theo khoảng ngày có người dùng đã bị xoá\n3. So tổng số hiển thị với số dòng trong danh sách",
    "OBS-292": "1. Người dùng mở 「予約履歴」 → chi tiết 1 lượt đặt\n2. Đổi trạng thái thanh toán cho lượt đặt không còn tồn tại\n3. Xem thông báo lỗi trên màn",
    "OBS-293": "1. Người dùng mở 「予約履歴」 → chi tiết với mã lượt đặt không tồn tại (sửa đường link)\n2. Xem thông báo trên màn",
    "OBS-295": "1. Quản trị mở màn 「パスワード変更」\n2. Để hết phiên đăng nhập rồi bấm gửi đổi mật khẩu\n3. Xem thông báo lỗi",
    "OBS-296": "1. Đăng nhập bằng vai trò Admin Smageri V1\n2. Mở màn 「予約管理」 (/admin/booking-management)\n3. Đo thời gian tải trang",
}
susp, obs = [], []
n = 0
for r in obs_old:
    oid, title, scm, why, ev, sugg, note = [("" if x is None else str(x)) for x in r]
    if oid in TO_SUSP:
        n += 1
        sid = TO_SUSP[oid]
        evs = [x for x in (map_ev(e) for e in S.split_ids(ev)) if x]
        why_t = tx(why)
        impact = next((ln.split(":", 1)[1].strip() for ln in why_t.split("\n") if "Ảnh hưởng" in ln), "Cần xác nhận")
        actual = "\n".join(ln for ln in why_t.split("\n") if "Ảnh hưởng" not in ln and "Trước đây" not in ln).strip()
        expected = next((ln.split(":", 1)[1].strip() for ln in tx(sugg).split("\n") if "Kết quả mong đợi" in ln), "Cần xác nhận")
        play = oid == "OBS-296"
        susp.append({"Bug ID": "BUG-%03d" % n, "Title": title, "Screen / Module": sid, "URL / Route": screens[sid][2],
                     "Category": "Performance" if play else "Functional", "Severity": "Medium",
                     "Repro Steps": STEPS[oid], "Expected": expected, "Actual": actual, "Evidence": ";".join(evs),
                     "Reproduced": "Intermittent" if play else S.BUG_CODE_ONLY,
                     "Detected By": "Playwright" if play else "Code review", "Business Impact": impact,
                     "Env": "dev — crawl 02/10/2026 kế thừa ver12" if play else "Đọc code REPO-01 commit 33091a3 (chưa chạy thử)",
                     "Pre-existing": "Unknown", "Report To Customer": "Internal only", "Status": "Open",
                     "Note": "Carried from ver12 (%s — trước đó là bug đọc từ code); chờ người duyệt chọn" % oid, "Reviewer Pick": ""})
    else:
        evs = [x for x in (map_ev(e) for e in S.split_ids(ev)) if x]
        obs.append({"Obs ID": oid, "Title": tx(title), "Screen / Module": scm, "Why suspicious": tx(why),
                    "Evidence": ";".join(evs) or ("Cần xác nhận" if ev else ""), "Suggested investigation": tx(sugg),
                    "Note": ((tx(note) + " · ") if note else "") + "Carried from ver12"})
inv.save(I + "/inventory.xlsx")

meta = {r[0]: r[1] for r in list(inv["00_Meta"].iter_rows(values_only=True))[1:]}
meta.update({"bug_list": "YES", "bug_recipient": "Nội bộ review trước",
             "bug_scan_scope": "Code review + Playwright (crawl 02/10/2026 kế thừa ver12)"})
os.makedirs(os.path.dirname(OUT), exist_ok=True)
wb = openpyxl.Workbook()
wb.remove(wb.active)
data = {"00_Meta": [{"Key": k, "Value": v} for k, v in meta.items()], "Bugs": [], "Suspected": susp, "Observations": obs}
for s in ("00_Meta", "Bugs", "Suspected", "Observations"):
    ws = wb.create_sheet(s)
    hdr = S.BUG_SHEETS[s]
    ws.append(hdr)
    for r in data[s]:
        ws.append([r.get(h, "") for h in hdr])
wb.save(OUT)
print({"Bugs": 0, "Suspected": len(susp), "Observations": len(obs), "next_ev": nxt})
