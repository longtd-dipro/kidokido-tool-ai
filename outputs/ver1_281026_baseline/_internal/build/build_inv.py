#!/usr/bin/env python3
"""Dung inventory ver1 (28/10/2026): Pha A chay moi (recon/code, recon/db-code) + Pha B ke thua crawl ver12
+ chu da viet o ver12 (chuc nang, man, API, bang, cau hoi) carry co danh dau, EV / API ID duoc anh xa lai.
Chay: python3 build_inv.py  (tu thu muc goc du an)
"""
import csv, json, os, re, sys
import openpyxl

ROOT = os.getcwd()
V = "outputs/ver1_281026_baseline"
I = V + "/_internal"
OLD = "outputs/_backup/ver12_211026_baseline-chinh-thuc/_internal/inventory.xlsx"
REPO = "inputs/tokiwagi"
sys.path.insert(0, ".claude/skills/system-analyst/scripts")
import inv_schema as S  # noqa

CARRY = "Carried from ver12"
DROP_F, DROP_SC, DROP_Q, DROP_EV = {"F-099"}, {"SC-094"}, {"Q-037", "Q-038"}, {"EV-1997"}


def rows(wb, s):
    r = list(wb[s].iter_rows(values_only=True))
    return [{h: S.legacy("" if v is None else str(v).strip(), h) for h, v in zip(r[0], x)} for x in r[1:] if x and x[0]]


def rcsv(p):
    return list(csv.DictReader(open(p, encoding="utf8")))


old = openpyxl.load_workbook(OLD, read_only=True)
O = {s: rows(old, s) for s in S.SHEETS}
old_ev = {r["EV ID"]: r for r in O["05_Evidence"]}

# ---------- ledger moi: crawl (ke thua) + db-code + code
ledger, seen = [], set()
crawl_files = []
for d in ("crawl", "crawl-roles"):
    for site in sorted(os.listdir(f"{I}/recon/{d}")):
        p = f"{I}/recon/{d}/{site}/evidence.csv"
        if os.path.exists(p):
            crawl_files.append(p)
for p in crawl_files + [f"{I}/recon/db-code/REPO-01/evidence.csv", f"{I}/recon/code/REPO-01/evidence.csv"]:
    for r in rcsv(p):
        if r["EV ID"] in seen:
            continue
        seen.add(r["EV ID"])
        if r["Type"] == "screenshot":
            r["Note"] = ((r["Note"] + " · ") if r["Note"] else "") + "crawl 02/10/2026 kế thừa ver12"
        ledger.append(r)
crawl_ids = {r["EV ID"] for r in ledger if r["Type"] == "screenshot"}
by_loc = {}
for r in ledger:
    if r["Type"] == "code-ref":
        by_loc.setdefault(r["Locator"], r["EV ID"])
next_ev = max(int(r["EV ID"][3:]) for r in ledger) + 1
_lines = {}


def loc_ok(loc):
    m = re.match(r"^REPO-01:([^#]+)#L(\d+)(?:-L(\d+))?$", loc)
    if not m:
        return False
    fp = os.path.join(REPO, m.group(1))
    if not os.path.isfile(fp):
        return False
    if fp not in _lines:
        _lines[fp] = sum(1 for _ in open(fp, encoding="utf8", errors="ignore"))
    return int(m.group(3) or m.group(2)) <= _lines[fp]


ev_map, ev_dropped = {}, {}


def map_ev(e):
    global next_ev
    if e in ev_map:
        return ev_map[e]
    o = old_ev.get(e)
    new = None
    if e in DROP_EV or not o:
        ev_dropped[e] = "CR-002 / không có trong ledger ver12"
    elif o["Type"] == "screenshot":
        if e in crawl_ids:
            new = e
        else:
            ev_dropped[e] = "ảnh không có trong crawl kế thừa"
    elif o["Type"] == "code-ref":
        if o["Locator"] in by_loc:
            new = by_loc[o["Locator"]]
        elif loc_ok(o["Locator"]):
            new = "EV-%04d" % next_ev
            next_ev += 1
            ledger.append({"EV ID": new, "Type": "code-ref", "Locator": o["Locator"], "Captured At": "", "Actor/Role": "",
                           "Artifact": "", "Note": ("%s (%s) — file/dòng đã kiểm tồn tại 28/10/2026" % (CARRY, e))
                           + ((" · " + o["Note"]) if o["Note"] else "")})
            by_loc[o["Locator"]] = new
        else:
            ev_dropped[e] = "code-ref không phân giải được: " + o["Locator"]
    else:
        ev_dropped[e] = "loại %s" % o["Type"]
    ev_map[e] = new
    return new


# ---------- API map: path ver12 -> API ID moi
seed = rcsv(f"{I}/recon/code/REPO-01/api-seed.csv")
new_by_path = {r["Path / Schedule"]: r for r in seed}
api_map = {r["API ID"]: new_by_path[r["Path / Schedule"]]["API ID"] for r in O["07_API"] if r["Path / Schedule"] in new_by_path}
EVRX, APIRX = re.compile(r"\bEV-\d{4}\b"), re.compile(r"\bAPI-\d{3}\b")


def tx(s):
    """Doi EV / API ID trong 1 o chu (1 luot, khong doi day chuyen)."""
    if not s:
        return s
    s = APIRX.sub(lambda m: api_map.get(m.group(0), m.group(0)), s)
    return EVRX.sub(lambda m: map_ev(m.group(0)) or "Cần xác nhận", s)


def tx_list(s, sep=";"):
    out = []
    for x in S.split_ids(s):
        y = map_ev(x) if x.startswith("EV-") else api_map.get(x, x)
        if y and y not in out:
            out.append(y)
    return sep.join(out)


def strip_cr002(note):
    keep = [ln for ln in (note or "").split("\n") if "CR-002" not in ln]
    return "\n".join(keep).strip()


def add_note(n, extra):
    n = (n or "").strip()
    return (n + "\n" if n else "") + extra


# ---------- 02_Screen
screens = []
page_ev = {}
for site in ("WEB-01", "WEB-02"):
    page_ev[site] = {p.get("evId") for p in json.load(open(f"{I}/recon/crawl/{site}/pages.json")) if p.get("evId")}
for r in O["02_Screen"]:
    if r["Screen ID"] in DROP_SC:
        continue
    evs = S.split_ids(tx_list(r["Screenshot EV"]))
    if evs:   # inventory-spec: Screenshot EV = 1 EV (anh chinh, co trong pages.json cua site); anh role khac -> Note
        main = next((e for e in evs if e in page_ev[r["Site"]]), evs[0])
        r["Screenshot EV"] = main
        others = [e for e in evs if e != main]
        if others:
            r["Note"] = add_note(r["Note"], "Ảnh của role khác: " + ";".join(others))
    else:
        r["Screenshot EV"] = S.NO_IMAGE
    r["Function IDs"] = ",".join(x for x in S.split_ids(r["Function IDs"]) if x not in DROP_F)
    r["Entry From"] = ",".join(x for x in S.split_ids(r["Entry From"]) if x not in DROP_SC) or "—"
    r["Note"] = add_note(tx(strip_cr002(r["Note"])), CARRY)
    if r["Actor"] in ("", "Cần xác nhận"):
        r["Actor"] = "Cần xác nhận"
    screens.append(r)
route_sc = {}
for r in screens:
    route_sc.setdefault(r["URL / Route"], []).append(r["Screen ID"])

# ---------- 01_Function
funcs = []
for r in O["01_Function"]:
    if r["Function ID"] in DROP_F:
        continue
    r["Evidence"] = tx_list(r["Evidence"])
    r["Screen IDs"] = ",".join(x for x in S.split_ids(r["Screen IDs"]) if x not in DROP_SC) or r["Screen IDs"]
    for k in ("Description", "Function", "Entry / Trigger"):
        r[k] = tx(r[k])
    r["Note"] = add_note(tx(strip_cr002(r["Note"])), CARRY)
    if r["Status"] == "Confirmed" and not r["Evidence"]:
        r["Status"] = "To verify"
    funcs.append(r)

# ---------- 07_API: hang moi tu scan-repo + chu ver12 theo path
edges = rcsv(f"{I}/recon/code/REPO-01/fe-api-calls.csv")
called = {}
for e in edges:
    for sc in route_sc.get(e["Screen Route"], []):
        called.setdefault(e["API ID"], []).append(sc)
roles = {r["API ID"]: r for r in rcsv(f"{I}/recon/code/REPO-01/api-roles.csv")}
old_by_path = {r["Path / Schedule"]: r for r in O["07_API"]}
apis = []
for s in seed:
    o = old_by_path.get(s["Path / Schedule"])
    r = dict(s)
    cb = sorted(set(called.get(s["API ID"], [])))
    r["Called By Screens"] = ",".join(cb) if cb else "—"
    if o:
        for k in ("Group", "Kind", "Method", "Summary", "Auth", "Related Tables", "Status"):
            r[k] = tx(o[k]) if o[k] else r[k]
        h = o["Handler"]
        r["Handler"] = h if loc_ok(h) else s["Handler"]
        evs = [s["Evidence"]] + [x for x in tx_list(o["Evidence"]).split(";") if x]
        r["Evidence"] = ";".join(dict.fromkeys(evs))
        if r["Handler"] != s["Handler"] and r["Handler"] not in by_loc:
            nid = "EV-%04d" % next_ev
            next_ev += 1
            ledger.append({"EV ID": nid, "Type": "code-ref", "Locator": r["Handler"], "Captured At": "", "Actor/Role": "",
                           "Artifact": "", "Note": "Handler %s (khoảng dòng kế thừa ver12, đã kiểm tồn tại)" % s["API ID"]})
            by_loc[r["Handler"]] = nid
        if r["Handler"] in by_loc and by_loc[r["Handler"]] not in r["Evidence"]:
            r["Evidence"] += ";" + by_loc[r["Handler"]]
        note = [ln for ln in (o["Note"] or "").split("\n")
                if "Called By" not in ln and "Bổ sung tay" not in ln and "CR-002" not in ln]
        note.append("%s (%s) — Summary / Auth / Method đọc từ code ở ver12; màn gọi API lấy từ đồ thị gọi FE → API (fe-api-calls.csv) 28/10/2026" % (CARRY, o["API ID"]))
        r["Note"] = tx("\n".join(x for x in note if x.strip()))
        r["Open Q"] = tx(o["Open Q"]) or "—"
    rr = roles.get(s["API ID"])
    if rr and rr["Roles"] not in ("", "—") and rr["Roles"] not in r["Auth"]:
        r["Auth"] = add_note(r["Auth"], "Role đọc được trong code: %s (%s)" % (rr["Roles"], rr["Code Ref"]))
    apis.append(r)

# ---------- 08_API_Fields
fields = []
for r in O["08_API_Fields"]:
    if r["API ID"] not in api_map:
        continue
    r["API ID"] = api_map[r["API ID"]]
    r["Evidence"] = tx_list(r["Evidence"])
    r["Description"] = tx(r["Description"])
    if not r["Evidence"]:
        r["Evidence"] = next(a["Evidence"].split(";")[0] for a in apis if a["API ID"] == r["API ID"])
    fields.append(r)

# ---------- 03/04 DB: tu read-orm-schema + chu ver12
otab = {r["Table"]: r for r in O["03_DB_Tables"]}
ocol = {(r["Table"], r["Column"]): r for r in O["04_DB_Columns"]}
tables, cols = [], []
for r in rcsv(f"{I}/recon/db-code/REPO-01/tables.csv"):
    o = otab.get(r["Table"])
    if o:
        r["Purpose"] = tx(o["Purpose"])
        r["Related Function IDs"] = ",".join(x for x in S.split_ids(o["Related Function IDs"]) if x not in DROP_F) or r["Related Function IDs"]
        r["Confidence"] = o["Confidence"] or r["Confidence"]
        r["Note"] = add_note(tx(o["Note"]), "%s (chữ mô tả) · cấu trúc đọc lại từ Prisma schema + %s 28/10/2026" % (CARRY, "107 migration"))
    tables.append(r)
for r in rcsv(f"{I}/recon/db-code/REPO-01/columns.csv"):
    o = ocol.get((r["Table"], r["Column"]))
    if o:
        r["Meaning"] = tx(o["Meaning"]) or r["Meaning"]
        r["Used By"] = tx(o["Used By"]) or r["Used By"]
        ev = [r["Evidence"]] + [x for x in tx_list(o["Evidence"]).split(";") if x]
        r["Evidence"] = ";".join(dict.fromkeys(ev))
        r["Confidence"] = o["Confidence"] or r["Confidence"]
    cols.append(r)

# ---------- 06 / 09 / 10 / 11
qs = []
for r in O["06_OpenQuestions"]:
    if r["Q ID"] in DROP_Q:
        continue
    for k in ("Item", "Reason / Evidence", "Required Action", "Note"):
        r[k] = tx(r[k])
    r["Note"] = add_note(r["Note"], CARRY)
    qs.append(r)
integ = []
for r in O["09_Integration"]:
    r["Used By"] = tx_list(r["Used By"], ",")
    r["Evidence"] = tx_list(r["Evidence"])
    r["Note"] = add_note(r["Note"], CARRY)
    integ.append(r)
sites = []
for r in O["10_Site"]:
    r["Screen Count"] = str(sum(1 for s in screens if s["Site"] == r["Site ID"]))
    r["Note"] = add_note(r["Note"], "Crawl 02/10/2026 kế thừa ver12 — lần chạy 28/10/2026 không crawl lại")
    sites.append(r)
stack = json.load(open(f"{I}/recon/code/REPO-01/stack.json"))
repos = [{"Repo ID": "REPO-01", "Path": os.path.abspath(REPO), "Kind": "FULLSTACK",
          "Stack": "Next.js (pages router) · React · Prisma · PostgreSQL · Express",
          "For Site": "WEB-01,WEB-02", "Note": "Tên package trong code: next-app-starter. Commit %s" % stack.get("commit", "")}]

meta = {k: "" for k in S.META_KEYS}
om = {r["Key"]: r["Value"] for r in O["00_Meta"]}
meta.update({k: om.get(k, "") for k in S.META_KEYS})
meta.update({
    "customer": "Cần xác nhận", "version_label": "ver1", "version_folder": "ver1_281026_baseline",
    "version_type": "BASELINE", "generated_date": "2026-10-28", "previous_version": "—", "run_mode": "FULL",
    "baseline": "—",
    "scope": "Toàn bộ hệ thống (2 website quản trị + người dùng) — AS-IS theo code commit hiện tại; CR-002 chưa có trong code nên không đưa vào",
    "source_repos": "REPO-01=inputs/tokiwagi(FULLSTACK→WEB-01,WEB-02)",
    "repo_commit": "REPO-01=%s" % stack.get("commit", ""),
    "crawl_mode": "SUBMIT_STAGING",
    "sensitive_scan": "stopped: 80 HIGH (đã xử lý theo phân loại người dùng 27/10/2026: README/seed = tài khoản mẫu dev, đọc nhưng không chép giá trị; tên route/hằng số = báo nhầm; .yarnrc.yml không mở; dump có dữ liệu → read-schema.py từ chối, O3 từ Prisma)",
    "env_observed": "Chromium (Playwright) · 2026-10-02 (crawl kế thừa ver12)",
    "crawl_budget_used": "Không crawl lần này — kế thừa ver12: " + om.get("crawl_budget_used", ""),
})

wb = openpyxl.Workbook()
wb.remove(wb.active)
data = {"00_Meta": [{"Key": k, "Value": v} for k, v in meta.items()], "01_Function": funcs, "02_Screen": screens,
        "03_DB_Tables": tables, "04_DB_Columns": cols, "05_Evidence": sorted(ledger, key=lambda r: r["EV ID"]),
        "06_OpenQuestions": qs, "07_API": apis, "08_API_Fields": fields, "09_Integration": integ,
        "10_Site": sites, "11_Repo": repos}
for s, hdr in S.SHEETS.items():
    ws = wb.create_sheet(s)
    ws.append(hdr)
    for r in data[s]:
        ws.append([r.get(h, "") for h in hdr])
wb.save(f"{I}/inventory.xlsx")
with open(f"{I}/build/id-map-ver12.csv", "w", newline="", encoding="utf8") as fh:
    w = csv.writer(fh)
    w.writerow(["Kind", "ver12 ID", "ver1 ID"])
    for k, v in sorted(api_map.items()):
        w.writerow(["API", k, v])
    for k, v in sorted(ev_map.items()):
        w.writerow(["EV", k, v or "(bỏ: %s)" % ev_dropped.get(k, "")])
print(json.dumps({s: len(v) for s, v in data.items()}, ensure_ascii=False))
print("ev mapped", sum(1 for v in ev_map.values() if v), "dropped", len(ev_dropped), "next_ev", next_ev)
print("dropped sample", list(ev_dropped.items())[:8])
