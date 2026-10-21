# Nap chu da viet lai (out/*.json) vao ver12 (inventory, Basic Design, bug list, narrative) + CR-002 (cr.json).
# Cau mau lap trong Basic Design (P/Q/R, nhan J) doi bang mau co dinh ben duoi — khong qua agent.
import json, os, re, glob, openpyxl
H = os.path.dirname(os.path.abspath(__file__)); V = os.path.dirname(os.path.dirname(H)); OUT = os.path.dirname(V)
O = {}
for f in glob.glob(os.path.join(H, "out", "*.json")):
    O.update({(os.path.basename(f)[:-5].rsplit("_", 1)[0] if re.search(r"_\d$", f[:-5]) else os.path.basename(f)[:-5], k): v
              for k, v in json.load(open(f, encoding="utf8")).items()})
def get(pkg, key):
    return O.get((pkg, key))
need = {os.path.basename(f)[:-5] for f in glob.glob(os.path.join(H, "in", "*.json"))}
have = {os.path.basename(f)[:-5] for f in glob.glob(os.path.join(H, "out", "*.json"))}
assert need == have, ("thieu goi out/", sorted(need - have))
def chk(s):  # khong de lot chu UNKNOWN trong chu da viet lai
    assert "UNKNOWN" not in str(s), s
    return s
stat = {}
def put(cell, v, tag):
    if v is not None and v != cell.value:
        cell.value = chk(v); stat[tag] = stat.get(tag, 0) + 1
# ---------- inventory
inv_p = os.path.join(V, "_internal/inventory.xlsx"); inv = openpyxl.load_workbook(inv_p)
def sheet(t):
    ws = inv[t]; h = [c.value for c in ws[1]]; return ws, h
def apply_rows(t, idcol, pkg, cols, keyfn=None):
    ws, h = sheet(t)
    for r in ws.iter_rows(min_row=2):
        if not r[0].value: continue
        rid = keyfn(r, h) if keyfn else r[h.index(idcol)].value
        for col in cols:
            put(r[h.index(col)], get(pkg, "%s|%s" % (rid, col)), t)
apply_rows("01_Function", "Function ID", "functions", ("Function", "Description", "Entry / Trigger", "Note"))
apply_rows("07_API", "API ID", "api", ("Summary", "Note"))
apply_rows("06_OpenQuestions", "Q ID", "questions", ("Item", "Reason / Evidence", "Required Action", "Note"))
for t, key, cols in (("03_DB_Tables", "Table", ("Purpose", "Note")), ("09_Integration", "EXT ID", ("Purpose", "Note")),
                     ("10_Site", "Site ID", ("Note",)), ("11_Repo", "Repo ID", ("Note",))):
    apply_rows(t, key, "db", cols, lambda r, h, t=t, key=key: "%s|%s" % (t, r[h.index(key)].value))
apply_rows("04_DB_Columns", None, "db", ("Meaning",), lambda r, h: "04_DB_Columns|%s.%s" % (r[h.index("Table")].value, r[h.index("Column")].value))
afmap = json.load(open(os.path.join(H, "api_fields_map.json"), encoding="utf8")); af = {t: get("api_fields", k) for k, t in afmap.items()}
ws, h = sheet("08_API_Fields")
for r in ws.iter_rows(min_row=2):
    c = r[h.index("Description")]
    if c.value in af: put(c, af[c.value], "08_API_Fields")
# ten man: ten JP giu nguyen; man khong co tieu de -> ten tieng Viet
names = {}
for site in ("WEB-01", "WEB-02"):
    for k in json.load(open(os.path.join(H, "in", "screens_%s.json" % site), encoding="utf8")):
        names[k] = (get("screens_" + site, k) or {}).get("name_vi")
ws, h = sheet("02_Screen")
for r in ws.iter_rows(min_row=2):
    c = r[h.index("Screen Name")]
    if isinstance(c.value, str) and c.value.startswith("UNKNOWN") and names.get(r[0].value):
        put(c, names[r[0].value] + " (màn chưa có tiêu đề)", "02_Screen")
ws, h = sheet("00_Meta")
for r in ws.iter_rows(min_row=2):
    v = {"version_label": "ver12", "version_folder": os.path.basename(V), "generated_date": "2026-10-21", "run_mode": "DELTA",
         "previous_version": "ver11_201026_baseline-cr002 (gộp ver1 + O4 ver10 + O5 ver9 + CR-002)",
         "scope": "Baseline chính thức: toàn hệ thống + CR-002 đã duyệt (Phương án B + trang giới hạn cơ bản, chờ release) · văn phong mới (writing-style.md)"}.get(r[0].value)
    if v: r[1].value = v
inv.save(inv_p)
# ---------- Basic Design
TYPE = {"Button": ("ボタン", "Nút"), "Textbox": ("入力欄", "Ô nhập"), "Textbox (tel)": ("入力欄（数字・電話）", "Ô nhập số"), "Textbox (password)": ("パスワード入力欄", "Ô nhập mật khẩu"),
        "Textbox (number)": ("数値入力欄", "Ô nhập số"), "Textarea": ("複数行入力欄", "Ô nhập nhiều dòng"), "Hyperlink": ("リンク", "Liên kết"),
        "Other (div)": ("表示エリア", "Vùng hiển thị"), "Checkbox": ("チェックボックス", "Ô đánh dấu")}
ROLE = {"test_super_admin": "Super Admin", "anonymous": "khách chưa đăng nhập", "test_user": "người dùng", "test_admin_tenant": "Admin cửa hàng"}
lab = {json.load(open(os.path.join(H, "in", "labels.json"), encoding="utf8"))[k]["text"]: v for (p, k), v in O.items() if p == "labels"}
PQ = re.compile(r"^・(?P<t>[^「]+)「(?P<x>[^」]*)」\n・(初期表示：|Trạng thái ban đầu: )(?P<s>\S+)")
RR = re.compile(r"^(?P<ev>EV-\d+) \(DOM, (?P<r>[^)]+)\)\n⚠ Hành vi khi nhấn / validation: UNKNOWN — chưa quan sát được$")
for site in ("WEB-01", "WEB-02"):
    p = os.path.join(V, "01_Screens/BasicDesign_%s_ver12.xlsx" % site); wb = openpyxl.load_workbook(p)
    for ws in wb:
        if ws.title.startswith("SC-"):
            o = get("screens_" + site, ws.title) or {}
            for a in ("B4", "B5", "B6", "B7"):
                if o.get(a) is not None: put(ws[a], o[a], "BD.text")
            for row in ws.iter_rows(min_row=9):
                J, P, Q, R = row[9], row[15], row[16], row[17]
                if isinstance(J.value, str) and J.value.startswith("(nhãn JP"):
                    x = J.value.split(") ", 1)[1]; put(J, lab.get(x, x), "BD.label")
                for c, jp in ((P, True), (Q, False)):
                    m = PQ.match(c.value or "")
                    if m:
                        t = TYPE.get(m["t"], (m["t"], m["t"])); on = m["s"].startswith(("活性", "Enable"))
                        put(c, ("・%s「%s」\n・画面を開いた時：%s\n・操作した時の動き：未確認（調査ツールでは操作していません）" % (t[0], m["x"], "操作できます" if on else "操作できません（グレー表示）")) if jp else
                               ("• %s 「%s」\n• Khi mở màn: %s\n• Bấm / nhập vào: chưa kiểm tra (công cụ khảo sát không thao tác)" % (t[1], m["x"], "dùng được" if on else "bị khoá (màu xám)")), "BD.item")
                m = RR.match(R.value or "")
                if m: put(R, "Bằng chứng: %s (đọc giao diện bằng tài khoản thử %s)\n⚠ Bấm / kiểm tra dữ liệu nhập: chưa quan sát được" % (m["ev"], ROLE.get(m["r"], m["r"])), "BD.item")
                if row[11].value in ("Enable", "Disable"): put(row[11], "Dùng được" if row[11].value == "Enable" else "Bị khoá", "BD.item")
            for a in ("F5",):
                if ws[a].value == "ver1 — AS-IS baseline": ws[a].value = "ver12 — baseline chính thức"
        elif ws.title == "Screen Index":
            for row in ws.iter_rows(min_row=6):
                if isinstance(row[3].value, str) and row[3].value.startswith("UNKNOWN") and names.get(row[1].value):
                    put(row[3], names[row[1].value] + " (màn chưa có tiêu đề)", "BD.index")
                if row[9].value == "ver1 — AS-IS baseline": row[9].value = "ver12 — baseline chính thức"
            ws["B3"].value = (ws["B3"].value or "").replace("ver1", "ver12")
        elif ws.title in ("Common mesage", "Screen Error message"):
            for row in ws.iter_rows(min_row=4):
                for c in row: put(c, get("misc", "bd|%s|%s|%s" % (site, ws.title, c.coordinate)), "BD.msg")
    wb.save(p)
# ---------- bug list
p = os.path.join(V, "07_BugList/BugList_KidoKido_ver12.xlsx"); wb = openpyxl.load_workbook(p)
for t in ("Observations", "Suspected"):
    ws = wb[t]; h = [c.value for c in ws[1]]
    for r in ws.iter_rows(min_row=2):
        if not r[0].value: continue
        for i, c in enumerate(r): put(c, get("bugs", "%s|%s|%s" % (t, r[0].value, h[i])), "bugs")
wb.save(p)
# ---------- narrative
np_ = os.path.join(V, "_internal/narrative.json"); nar = json.load(open(np_, encoding="utf8"))
def walk(o, path):
    if isinstance(o, dict): return {k: walk(v, path + "/" + k) for k, v in o.items()}
    if isinstance(o, list): return [walk(v, path + "/%d" % i) for i, v in enumerate(o)]
    v = get("misc", "narrative" + path)
    if v is not None: stat["narrative"] = stat.get("narrative", 0) + 1; return chk(v)
    return o
json.dump(walk(nar, ""), open(np_, "w", encoding="utf8"), ensure_ascii=False, indent=1)
# ---------- CR-002 cr.json
cp = os.path.join(OUT, "ver8_191026_CR-002-corporate-limited-page/_internal/cr.json"); cr = json.load(open(cp, encoding="utf8"))
TXT = {"item", "change", "why_change", "impact_on_current", "conflict_detail", "md_note", "reason", "text", "question", "why", "detail", "action"}  # chi o chu; o ma giu nguyen
for i in cr["impacts"]:
    for col in [c for c in i if c in TXT - {"question"}]:  # impact.question = danh sach ma CQ
        v = get("cr002", "imp|%s|%s" % (i["id"], col))
        if v is not None: i[col] = v; stat["cr002"] = stat.get("cr002", 0) + 1
for k in ("not_cr", "recommendation", "risk"):
    for j, x in enumerate(cr.get(k) or []):
        if isinstance(x, dict):
            for col in [c for c in x if c in TXT]:
                v = get("cr002", "%s|%d|%s" % (k, j, col))
                if v is not None: x[col] = v; stat["cr002"] += 1
        else:
            v = get("cr002", "%s|%d|text" % (k, j))
            if v is not None: cr[k][j] = v; stat["cr002"] += 1
for x in cr.get("questions") or []:
    for col in [c for c in x if c in ("question", "why")]:
        v = get("cr002", "q|%s|%s" % (x["id"], col))
        if v is not None: x[col] = v; stat["cr002"] += 1
json.dump(cr, open(cp, "w", encoding="utf8"), ensure_ascii=False, indent=1)
print(stat)
