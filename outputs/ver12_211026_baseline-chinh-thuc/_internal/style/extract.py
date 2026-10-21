# Trich chu mo ta cua baseline ver12 + CR-002 ra cac goi JSON de viet lai theo .claude/sys-agent/writing-style.md.
# Moi goi: {"key": {"text": <chu hien tai>, "ctx": <boi canh ngan>}} — viet lai tra ve {"key": <chu moi>}.
import json, os, re, openpyxl
H = os.path.dirname(os.path.abspath(__file__)); V = os.path.dirname(os.path.dirname(H)); OUT = os.path.dirname(V)
IN = os.path.join(H, "in")
def dump(name, d):
    json.dump(d, open(os.path.join(IN, name + ".json"), "w", encoding="utf8"), ensure_ascii=False, indent=1); print(name, len(d))
def s(v): return isinstance(v, str) and len(v.strip()) > 3 and v.strip() not in ("UNKNOWN", "None", "—")
inv = openpyxl.load_workbook(os.path.join(V, "_internal/inventory.xlsx"))
def rows(t):
    ws = inv[t]; h = [c.value for c in ws[1]]
    return [dict(zip(h, [c.value for c in r])) for r in ws.iter_rows(min_row=2) if r[0].value], h
# 1 functions
fn, _ = rows("01_Function"); d = {}
for r in fn:
    for col in ("Function", "Description", "Entry / Trigger", "Note"):
        if s(r[col]): d["%s|%s" % (r["Function ID"], col)] = {"text": r[col], "ctx": "%s · màn %s · actor %s" % (r["Module"], r["Screen IDs"], r["Primary Actor"])}
dump("functions", d)
# 2 api
ap, _ = rows("07_API"); d = {}
for r in ap:
    for col in ("Summary", "Note"):
        if s(r[col]): d["%s|%s" % (r["API ID"], col)] = {"text": r[col], "ctx": "%s %s · group %s" % (r["Method"], r["Path / Schedule"], r["Group"])}
dump("api", d)
# 3 api fields (gop cau trung)
af, _ = rows("08_API_Fields"); uniq = {}
for r in af:
    if s(r["Description"]): uniq.setdefault(r["Description"], "%s %s.%s (%s)" % (r["API ID"], r["Direction"], r["Field"], r["Type"]))
items = list(uniq.items()); half = len(items) // 2
dump("api_fields_1", {"AF%04d" % i: {"text": t, "ctx": c} for i, (t, c) in enumerate(items[:half])})
dump("api_fields_2", {"AF%04d" % (i + half): {"text": t, "ctx": c} for i, (t, c) in enumerate(items[half:])})
json.dump({"AF%04d" % i: t for i, (t, c) in enumerate(items)}, open(os.path.join(H, "api_fields_map.json"), "w", encoding="utf8"), ensure_ascii=False)
# 4 db + integration + site + repo
d = {}
for t, key, cols in (("03_DB_Tables", "Table", ("Purpose", "Note")), ("04_DB_Columns", None, ("Meaning",)), ("09_Integration", "EXT ID", ("Purpose", "Note")),
                     ("10_Site", "Site ID", ("Note",)), ("11_Repo", "Repo ID", ("Note",))):
    rr, _ = rows(t)
    for i, r in enumerate(rr):
        k = r[key] if key else "%s.%s" % (r["Table"], r["Column"])
        for col in cols:
            if s(r[col]): d["%s|%s|%s" % (t, k, col)] = {"text": r[col], "ctx": t}
dump("db", d)
# 5 open questions
q, _ = rows("06_OpenQuestions"); d = {}
for r in q:
    for col in ("Item", "Reason / Evidence", "Required Action", "Note"):
        if s(r[col]): d["%s|%s" % (r["Q ID"], col)] = {"text": r[col], "ctx": "type %s · owner %s · %s" % (r["Type"], r["Owner"], r["Status"])}
dump("questions", d)
# 6 screens (2 goi theo site) + 7 nhan JP
sc, _ = rows("02_Screen"); fd = {r["Function ID"]: r["Description"] for r in fn}
labels = {}
for site in ("WEB-01", "WEB-02"):
    wb = openpyxl.load_workbook(os.path.join(V, "01_Screens/BasicDesign_%s_ver12.xlsx" % site)); d = {}
    for r in sc:
        if r["Site"] != site: continue
        ws = wb[r["Screen ID"]] if r["Screen ID"] in wb.sheetnames else None
        items = []
        if ws:
            for row in ws.iter_rows(min_row=9):
                i_, j_ = row[8].value, row[9].value
                if isinstance(j_, str) and j_.startswith("(nhãn JP"):
                    lab = j_.split(") ", 1)[1]; labels.setdefault(lab, r["Screen Name"]); items.append("%s [%s]" % (lab, row[10].value))
        cur = {a: ws[a].value for a in ("B4", "B5", "B6", "B7")} if ws else {}
        d[r["Screen ID"]] = {"text": json.dumps(cur, ensure_ascii=False), "ctx": json.dumps({"name": r["Screen Name"], "route": r["URL / Route"], "type": r["Type"],
            "actor": r["Actor"], "status": r["Status"], "note": r["Note"], "function": [fd.get(x.strip()) for x in str(r["Function IDs"]).split(",") if x.strip() in fd],
            "items": items[:40]}, ensure_ascii=False)}
    dump("screens_" + site, d)
dump("labels", {"L%03d" % i: {"text": k, "ctx": "nhãn trên màn " + v} for i, (k, v) in enumerate(sorted(labels.items()))})
# 8 bug list
b = openpyxl.load_workbook(os.path.join(V, "07_BugList/BugList_KidoKido_ver12.xlsx")); d = {}
for t, cols in (("Observations", ("Title", "Why suspicious", "Suggested investigation", "Note")), ("Suspected", ("Title", "Repro Steps", "Expected", "Actual", "Business Impact", "Note"))):
    ws = b[t]; h = [c.value for c in ws[1]]
    for r in ws.iter_rows(min_row=2):
        if not r[0].value: continue
        for col in cols:
            v = r[h.index(col)].value
            if s(v): d["%s|%s|%s" % (t, r[0].value, col)] = {"text": v, "ctx": "%s · %s" % (t, r[h.index("Screen / Module")].value)}
dump("bugs", d)
# 9 misc: narrative + message sheets
d = {}
def walk(o, p):
    if isinstance(o, dict): [walk(v, p + "/" + k) for k, v in o.items()]
    elif isinstance(o, list): [walk(v, p + "/%d" % i) for i, v in enumerate(o)]
    elif s(o): d["narrative" + p] = {"text": o, "ctx": "docx tổng hợp (O6)"}
walk(json.load(open(os.path.join(V, "_internal/narrative.json"), encoding="utf8")), "")
for site in ("WEB-01", "WEB-02"):
    wb = openpyxl.load_workbook(os.path.join(V, "01_Screens/BasicDesign_%s_ver12.xlsx" % site))
    for t in ("Common mesage", "Screen Error message"):
        for row in wb[t].iter_rows(min_row=4):
            for c in row:
                if s(c.value) and re.search(r"[a-zA-ZÀ-ỹ]{3}", c.value) and not re.match(r"^[A-Z_0-9]+$", c.value):
                    d["bd|%s|%s|%s" % (site, t, c.coordinate)] = {"text": c.value, "ctx": "Basic Design sheet %s cột %s" % (t, wb[t].cell(3, c.column).value)}
dump("misc", d)
# 10 CR-002
V8 = os.path.join(OUT, "ver8_191026_CR-002-corporate-limited-page"); cr = json.load(open(os.path.join(V8, "_internal/cr.json"), encoding="utf8")); d = {}
for i in cr["impacts"]:
    for col in ("item", "change", "why_change", "impact_on_current", "conflict_detail", "md_note", "question"):
        if s(i.get(col)): d["imp|%s|%s" % (i["id"], col)] = {"text": i[col], "ctx": "%s %s %s" % (i["axis"], i["change_type"], i["baseline_ref"])}
for k in ("not_cr", "recommendation", "risk"):
    for j, x in enumerate(cr.get(k) or []):
        for col, v in (x.items() if isinstance(x, dict) else [("text", x)]):
            if s(v): d["%s|%d|%s" % (k, j, col)] = {"text": v, "ctx": k}
for x in cr.get("questions") or []:
    for col, v in x.items():
        if s(v) and col not in ("id", "status"): d["q|%s|%s" % (x["id"], col)] = {"text": v, "ctx": "câu hỏi khách"}
dump("cr002", d)
