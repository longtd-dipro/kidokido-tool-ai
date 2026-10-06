import sys, json
sys.path.insert(0, ".claude/skills/system-analyst/scripts")
import cr_common as C
V = "outputs/ver2_051026_CR-001-group-booking"
cr = C.load_json(V + "/_internal/cr.json")
_, rates = C.load_rates(".claude/config/md-unit-rates.json")
B = C.load_baseline("outputs/ver1_021026_khao-sat-lan-dau")
scr = {r["Screen ID"]: r for r in B["data"]["02_Screen"]}
def short(s, n=46): s = str(s); return s if len(s) <= n else s[:n-1] + "…"
flow, web02, web01 = [], [], []
for i in cr["impacts"]:
    refs = C.refs_of(i["baseline_ref"])
    if i["axis"] == "Business":
        ref = refs[0] if refs else i["id"]
        flow.append({"badge": i["change_type"], "ref": ref, "label": short(i["item"]), "sub": short(i["change"], 80), "kind": "flow", "imp": i["id"]})
    elif i["axis"] == "Screen":
        if not refs:
            site = "WEB-02" if i["item"].startswith("[WEB-02]") else "WEB-01"
            (web02 if site == "WEB-02" else web01).append({"badge": "NEW", "ref": i["id"], "label": short(i["item"].split("] ",1)[1]), "sub": short(i["change"], 80), "kind": "screen", "imp": i["id"]})
        else:
            for r in refs:
                s = scr[r]; nm = s["Screen Name"]
                if nm.startswith("UNKNOWN") or nm.startswith("["): nm = s["URL / Route"]
                (web02 if s["Site"] == "WEB-02" else web01).append({"badge": i["change_type"], "ref": r, "label": short(nm), "sub": short(i["change"], 80), "kind": "screen", "imp": i["id"]})
# AS-IS neighbours (1 hop)
for r, site in (("SC-046", web02), ("SC-066", web02), ("SC-001", web01)):
    s = scr[r]; site.append({"badge": "AS-IS", "ref": r, "label": short(s["Screen Name"]), "sub": "Hàng xóm 1 bước — không đổi", "kind": "screen", "imp": ""})
nodes = flow + web02 + web01
# simulate drawn set like verify-cr-figma check 2
def keys_of(imp):
    refs = C.refs_of(imp.get("baseline_ref"))
    return set(refs) if refs else {imp["id"], imp["item"]}
drawn = set()
for n in nodes:
    if n["badge"] == "AS-IS": continue
    drawn |= {i["id"] for i in cr["impacts"] if n["ref"] in keys_of(i) and i["change_type"] == n["badge"]}
rows = []
for i in cr["impacts"]:
    if i["id"] in drawn:
        refs = C.refs_of(i["baseline_ref"])
        rows.append({"badge": i["change_type"], "ref": refs[0] if refs else i["id"], "id": i["id"], "axis": i["axis"],
                     "bref": i["baseline_ref"], "item": short(i["item"], 60), "md": C.fmt_md(C.md_of(i, rates)), "kind": "table-row"})
near = set()
for i in cr["impacts"]: near |= set(C.refs_of(i["baseline_ref"]))
nn = set(near)
for r in near: nn |= B["links"].get(r, set())
bad = [n["ref"] for n in nodes if n["badge"] == "AS-IS" and n["ref"] not in nn]
print("flow", len(flow), "web02", len(web02), "web01", len(web01), "drawn", len(drawn), "rows", len(rows), "AS-IS out of scope", bad)
print("drawn not in Business/Screen:", sorted(x for x in drawn if [i for i in cr["impacts"] if i["id"]==x][0]["axis"] not in ("Business","Screen")))
json.dump({"flow": flow, "web02": web02, "web01": web01, "rows": rows}, open(sys.argv[1], "w"), ensure_ascii=False)
