# Ghep readback Figma (chia nhieu lan vi gioi han 20 KB cua use_figma) -> ../cr-figma-nodes.json
# Du lieu ben duoi = ket qua tra ve nguyen van tu use_figma ngay 2026-10-14 (section 16835:398).
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))

# [id, badge, ref, kind, shape, grp]
FLOW = [
["16835:425","AS-IS","FL-07","flow","pill","FL-07"],["16835:429","IMPACT","SC-059","flow","box","FL-07"],["16835:433","UPD","API-107","flow","box","FL-07"],
["16835:437","IMPACT","API-070","flow","box","FL-07"],["16835:441","AS-IS","FL-07","flow","box","FL-07"],["16835:445","IMPACT","SC-067","flow","box","FL-07"],
["16835:449","UPD","API-107","flow","decision","FL-07"],["16835:453","NEW","IMP-032","flow","ng","FL-07"],
["16835:490","AS-IS","FL-03","flow","pill","FL-03"],["16835:494","UPD","SC-036","flow","box","FL-03"],["16835:498","UPD","API-050","flow","box","FL-03"],
["16835:502","NEW","column:tickets.audience","flow","box","FL-03"],["16835:506","NEW","IMP-032","flow","box","FL-03"],["16835:510","NEW","IMP-023","edge","box","FL-03"],
["16835:513","UPD","API-054","flow","decision","FL-03"],["16835:517","UPD","SC-036","flow","ng","FL-03"],
["16835:552","NEW","IMP-033","flow","pill","CR-NEW-1"],["16835:556","NEW","IMP-046","flow","box","CR-NEW-1"],["16835:560","NEW","IMP-003","flow","box","CR-NEW-1"],
["16835:564","IMPACT","table:users","flow","box","CR-NEW-1"],["16835:568","NEW","IMP-024","flow","box","CR-NEW-1"],["16835:572","NEW","IMP-049","flow","box","CR-NEW-1"],
["16835:576","NEW","IMP-005","edge","box","CR-NEW-1"],["16835:579","NEW","IMP-003","flow","decision","CR-NEW-1"],["16835:583","NEW","IMP-033","flow","ng","CR-NEW-1"],
["16835:622","UPD","SC-063","flow","pill","FL-08"],["16835:626","NEW","IMP-047","flow","box","FL-08"],["16835:630","NEW","IMP-006","flow","box","FL-08"],
["16835:634","IMPACT","table:ticket_booking_schedules","flow","decision","FL-08"],["16835:638","IMPACT","API-008","flow","ng","FL-08"],
["16835:643","UPD","column:tickets.payment_type","flow","box","FL-08"],["16835:647","UPD","EXT-001","flow","box","FL-08"],["16835:651","NEW","IMP-034","flow","box","FL-08"],
["16835:655","NEW","IMP-016","edge","box","FL-08"],["16835:658","NEW","IMP-038","edge","box","FL-08"],["16835:661","IMPACT","API-020","edge","box","FL-08"],
["16835:664","IMPACT","column:tickets.max_child_per_adult","flow","decision","FL-08"],["16835:668","UPD","EXT-001","flow","ng","FL-08"],
["16835:673","IMPACT","column:tickets.max_child_per_adult","flow","ng","FL-08"],
["16835:721","AS-IS","FL-09","flow","pill","FL-09"],["16835:725","UPD","SC-070","flow","box","FL-09"],["16835:729","NEW","IMP-011","flow","box","FL-09"],
["16835:733","UPD","API-111","flow","box","FL-09"],["16835:737","UPD","API-015","flow","box","FL-09"],["16835:741","NEW","IMP-027","flow","box","FL-09"],
["16835:745","NEW","IMP-041","flow","box","FL-09"],["16835:749","NEW","IMP-079","edge","box","FL-09"],["16835:752","NEW","IMP-041","flow","decision","FL-09"],
["16835:756","NEW","IMP-011","flow","ng","FL-09"],["16835:761","UPD","API-111","flow","ng","FL-09"],
["16835:806","AS-IS","FL-05","flow","pill","FL-05"],["16835:810","UPD","SC-004","flow","box","FL-05"],["16835:814","UPD","API-017","flow","box","FL-05"],
["16835:818","NEW","IMP-057","flow","box","FL-05"],["16835:822","NEW","IMP-012","flow","box","FL-05"],["16835:826","IMPACT","table:admin_activity_logs","flow","box","FL-05"],
["16835:830","NEW","IMP-015","flow","box","FL-05"],["16835:834","IMPACT","SC-009","edge","box","FL-05"],["16835:837","IMPACT","API-017","flow","decision","FL-05"],
["16835:841","IMPACT","API-017","flow","ng","FL-05"],
["16835:889","AS-IS","FL-01","flow","pill","FL-01"],["16835:893","UPD","SC-027","flow","box","FL-01"],["16835:897","UPD","API-061","flow","box","FL-01"],
["16835:901","NEW","IMP-018","flow","box","FL-01"],["16835:905","NEW","IMP-062","flow","box","FL-01"],["16835:909","NEW","IMP-080","edge","box","FL-01"],
["16835:912","NEW","IMP-018","flow","decision","FL-01"],["16835:916","NEW","IMP-062","flow","ng","FL-01"],
["16835:948","UPD","EXT-001","tech","box",""],["16835:952","IMPACT","EXT-002","tech","box",""],["16835:956","IMPACT","EXT-006","tech","box",""],
["16835:960","NEW","IMP-019","tech","box",""],["16835:964","NEW","IMP-073","tech","box",""],
["16836:403","AS-IS","FL-06","flow-step","pill","G-CR1"],["16836:406","UPD","SC-063","screen","box","G-CR1"],["16836:410","NEW","IMP-046","screen","box","G-CR1"],
["16836:414","NEW","IMP-033","flow-step","decision","G-CR1"],["16836:417","NEW","IMP-003","flow-step","ng","G-CR1"],["16836:422","NEW","IMP-049","screen","box","G-CR1"],
["16836:426","NEW","IMP-051","screen","box","G-CR1"],["16836:430","NEW","IMP-052","screen","box","G-CR1"],["16836:434","NEW","IMP-033","flow-step","ng","G-CR1"],
["16836:439","UPD","SC-063","flow-step","ng","G-CR1"],["16836:488","NEW","IMP-005","edge","box","G-CR1"],
["16836:494","AS-IS","SC-066","flow-step","pill","G-CR2"],["16836:497","NEW","IMP-047","screen","box","G-CR2"],
["16836:501","IMPACT","table:ticket_booking_schedules","flow-step","decision","G-CR2"],["16836:504","IMPACT","API-008","flow-step","ng","G-CR2"],
["16836:509","NEW","IMP-048","screen","box","G-CR2"],["16836:513","UPD","EXT-001","screen","box","G-CR2"],["16836:517","UPD","SC-070","screen","box","G-CR2"],
["16836:521","UPD","SC-071","screen","box","G-CR2"],["16836:525","NEW","IMP-050","screen","box","G-CR2"],["16836:529","UPD","SC-076","screen","box","G-CR2"],
["16836:533","NEW","IMP-038","screen","popup","G-CR2"],["16836:538","NEW","IMP-041","screen","popup","G-CR2"],["16836:543","UPD","EXT-001","flow-step","ng","G-CR2"],
["16836:548","UPD","SC-076","flow-step","ng","G-CR2"],["16836:615","NEW","IMP-038","edge","box","G-CR2"],["16836:618","NEW","IMP-016","edge","box","G-CR2"],
["16836:624","AS-IS","SC-046","flow-step","pill","G-CR3"],["16836:627","IMPACT","SC-059","screen","box","G-CR3"],["16836:631","IMPACT","SC-067","screen","box","G-CR3"],
["16836:635","IMPACT","SC-048","screen","box","G-CR3"],["16836:639","IMPACT","SC-049","screen","box","G-CR3"],["16836:643","IMPACT","SC-054","screen","box","G-CR3"],
["16836:647","UPD","API-107","flow-step","ng","G-CR3"],
["16836:682","AS-IS","FL-01","flow-step","pill","G-CR4"],["16836:685","UPD","SC-027","screen","box","G-CR4"],["16836:689","NEW","IMP-062","screen","box","G-CR4"],
["16836:693","NEW","IMP-018","flow-step","decision","G-CR4"],["16836:696","UPD","API-061","flow-step","ng","G-CR4"],["16836:701","AS-IS","SC-001","screen","box","G-CR4"],
["16836:704","UPD","SC-027","screen","popup","G-CR4"],
["16836:741","AS-IS","SC-001","flow-step","pill","G-CR5"],["16836:744","NEW","IMP-057","screen","box","G-CR5"],["16836:748","NEW","IMP-058","screen","box","G-CR5"],
["16836:752","NEW","IMP-059","screen","box","G-CR5"],["16836:756","NEW","IMP-060","screen","box","G-CR5"],["16836:760","NEW","IMP-061","screen","box","G-CR5"],
["16836:764","UPD","SC-004","screen","box","G-CR5"],["16836:768","UPD","SC-005","screen","box","G-CR5"],["16836:772","UPD","SC-007","screen","box","G-CR5"],
["16836:776","UPD","SC-035","screen","box","G-CR5"],["16836:780","UPD","SC-036","screen","box","G-CR5"],["16836:784","UPD","SC-037","screen","box","G-CR5"],
["16836:788","UPD","SC-038","screen","box","G-CR5"],["16836:792","IMPACT","SC-009","screen","box","G-CR5"],["16836:796","IMPACT","SC-044","screen","box","G-CR5"],
["16836:800","IMPACT","SC-003","screen","box","G-CR5"],["16836:804","IMPACT","SC-026","screen","box","G-CR5"],["16836:808","IMPACT","SC-012","screen","box","G-CR5"],
["16836:812","IMPACT","SC-025","screen","box","G-CR5"],["16836:816","IMPACT","SC-040","screen","box","G-CR5"],["16836:820","IMPACT","SC-014","screen","box","G-CR5"],
["16836:824","NEW","IMP-033","screen","popup","G-CR5"],["16836:829","UPD","SC-036","flow-step","ng","G-CR5"],
]

# [id, badge, ref, site, ds (prefix DS-component: da bo), chg]
MOCK = [
["16841:403","NEW","IMP-046","WEB-02","WEB-02:Breadcrumb;WEB-02:Button;WEB-02:Checkbox;WEB-02:PageHeader;WEB-02:TextField","AS-IS"],
["16841:696","NEW","IMP-047","WEB-02","WEB-02:AppHeader;WEB-02:Breadcrumb;WEB-02:Button;WEB-02:Card;WEB-02:PageHeader;WEB-02:Select;WEB-02:TextField","AS-IS"],
["16842:400","NEW","IMP-048","WEB-02","WEB-02:AppHeader;WEB-02:Breadcrumb;WEB-02:Button;WEB-02:Card;WEB-02:Checkbox;WEB-02:PageHeader;WEB-02:Radio","AS-IS"],
["16842:560","NEW","IMP-049","WEB-02","WEB-02:AppHeader;WEB-02:Button;WEB-02:Card;WEB-02:PageHeader;WEB-02:SideNav","AS-IS"],
["16842:667","NEW","IMP-050","WEB-02","WEB-01:Table;WEB-02:AppHeader;WEB-02:Button;WEB-02:PageHeader;WEB-02:SideNav;WEB-02:TextField","AS-IS"],
["16842:830","NEW","IMP-051","WEB-02","WEB-01:Table;WEB-02:AppHeader;WEB-02:Button;WEB-02:PageHeader;WEB-02:SideNav","AS-IS"],
["16843:400","NEW","IMP-052","WEB-02","WEB-01:Modal;WEB-02:PageHeader","AS-IS"],
["16843:489","NEW","IMP-057","WEB-01","WEB-01:Breadcrumb;WEB-01:Card;WEB-01:PageHeader;WEB-01:Pagination;WEB-01:SideNav;WEB-01:Table","AS-IS"],
["16843:659","NEW","IMP-058","WEB-01","WEB-01:Breadcrumb;WEB-01:Button;WEB-01:Card;WEB-01:PageHeader;WEB-01:SideNav;WEB-01:TextField","AS-IS"],
["16843:776","NEW","IMP-059","WEB-01","WEB-01:Breadcrumb;WEB-01:Button;WEB-01:Card;WEB-01:PageHeader;WEB-01:SideNav;WEB-01:Table;WEB-02:Badge","AS-IS"],
["16844:400","NEW","IMP-060","WEB-01","WEB-01:Breadcrumb;WEB-01:Card;WEB-01:PageHeader;WEB-01:Pagination;WEB-01:SideNav;WEB-01:Table","AS-IS"],
["16844:576","NEW","IMP-061","WEB-01","WEB-01:Breadcrumb;WEB-01:Card;WEB-01:PageHeader;WEB-01:Pagination;WEB-01:SideNav;WEB-01:Table","AS-IS"],
["16844:740","NEW","IMP-062","WEB-01","WEB-01:Button;WEB-01:Card;WEB-01:TextField;WEB-02:Checkbox","AS-IS"],
["16844:809","UPD","SC-063","WEB-02","WEB-02:Breadcrumb;WEB-02:Button;WEB-02:Checkbox;WEB-02:PageHeader;WEB-02:TextField","AS-IS,UPD,NEW"],
["16845:400","UPD","SC-070","WEB-02","WEB-02:AppHeader;WEB-02:Badge;WEB-02:Breadcrumb;WEB-02:Card;WEB-02:PageHeader;WEB-02:SideNav","AS-IS,NEW"],
["16845:529","UPD","SC-071","WEB-02","WEB-02:AppHeader;WEB-02:Breadcrumb;WEB-02:Button;WEB-02:Card;WEB-02:PageHeader;WEB-02:SideNav","AS-IS,NEW,DEL"],
["16845:680","UPD","SC-076","WEB-02","WEB-02:AppHeader;WEB-02:Breadcrumb;WEB-02:Button;WEB-02:Card;WEB-02:PageHeader;WEB-02:SideNav;WEB-02:TextField","AS-IS,UPD,NEW"],
["16845:877","UPD","SC-027","WEB-01","WEB-01:Button;WEB-01:Card;WEB-01:TextField","AS-IS,UPD"],
["16846:400","UPD","SC-004","WEB-01","WEB-01:Breadcrumb;WEB-01:Card;WEB-01:PageHeader;WEB-01:Pagination;WEB-01:SideNav;WEB-01:Table;WEB-01:TextField","AS-IS,UPD,NEW"],
["16846:606","UPD","SC-005","WEB-01","WEB-01:Breadcrumb;WEB-01:Button;WEB-01:Card;WEB-01:PageHeader;WEB-01:SideNav","AS-IS,NEW"],
["16846:755","UPD","SC-035","WEB-01","WEB-01:Breadcrumb;WEB-01:Button;WEB-01:PageHeader;WEB-01:Pagination;WEB-01:Select;WEB-01:SideNav;WEB-01:Table;WEB-01:TextField","AS-IS,NEW,UPD"],
["16846:945","UPD","SC-036","WEB-01","WEB-01:Breadcrumb;WEB-01:Button;WEB-01:Card;WEB-01:PageHeader;WEB-01:Radio;WEB-01:Select;WEB-01:SideNav;WEB-01:TextField","AS-IS,NEW"],
["16846:1106","NEW","IMP-038","WEB-02","WEB-01:Modal","AS-IS"],
["16846:1161","NEW","IMP-041","WEB-02","WEB-01:Modal","AS-IS"],
["16846:1216","NEW","IMP-033","WEB-01","WEB-01:Modal","AS-IS"],
]

# mau SOLID trong mockup (chi bo khung CHG-ANN / chg-label)
COLORS = {
"16841:403":"ffffff,0068b7,f4faff,313131,ffe732,dc0404,f3faff,979797,000000",
"16841:696":"ffffff,0068b7,f4faff,313131,ffe732,e6e1e1,979797,dc0404,f3faff,000000",
"16842:400":"ffffff,0068b7,f4faff,313131,ffe732,e6e1e1,979797,2563eb",
"16842:560":"ffffff,0068b7,f4faff,fffbf8,000000,313131",
"16842:667":"ffffff,0068b7,f4faff,fffbf8,000000,313131,e9faff,313035,dc0404,f3faff",
"16842:830":"ffffff,0068b7,f4faff,fffbf8,000000,e9faff,313035,313131",
"16843:400":"ffffff,0068b7,f4faff,313131,ffe732,000000,262627,dc0404,b4b2b7,006dc6",
"16843:489":"f4faff,006dc6,676767,68b5ff,f5f5f5,000000,ffffff,262627,b4b2b7,e9faff,313035",
"16843:659":"f4faff,006dc6,676767,68b5ff,f5f5f5,000000,ffffff,262627,dc0404,b4b2b7",
"16843:776":"f4faff,006dc6,676767,68b5ff,f5f5f5,000000,ffffff,d9d9d9,979797,e9faff,313035",
"16844:400":"f4faff,006dc6,676767,68b5ff,f5f5f5,000000,ffffff,262627,b4b2b7,e9faff,313035",
"16844:576":"f4faff,006dc6,676767,68b5ff,f5f5f5,000000,ffffff,262627,b4b2b7,e9faff,313035",
"16844:740":"ffffff,000000,262627,dc0404,f4faff,b4b2b7,313131,006dc6",
"16844:809":"ffffff,0068b7,f4faff,313131,ffe732,f3faff,979797,2563eb",
"16845:400":"ffffff,0068b7,f4faff,fffbf8,000000,313131,d9d9d9,979797",
"16845:529":"ffffff,0068b7,f4faff,fffbf8,000000,313131",
"16845:680":"ffffff,0068b7,f4faff,fffbf8,000000,313131,f3faff",
"16845:877":"ffffff,000000,262627,f4faff,b4b2b7",
"16846:400":"f4faff,006dc6,676767,68b5ff,f5f5f5,000000,ffffff,262627,b4b2b7,e9faff,313035",
"16846:606":"f4faff,006dc6,676767,68b5ff,f5f5f5,000000,ffffff",
"16846:755":"f4faff,006dc6,676767,68b5ff,f5f5f5,000000,262627,b4b2b7,ffffff,e9faff,313035",
"16846:945":"f4faff,006dc6,676767,68b5ff,f5f5f5,000000,ffffff,262627,dc0404,b4b2b7",
"16846:1106":"b4b4b4,ffffff,000000,006dc6",
"16846:1161":"b4b4b4,ffffff,000000,006dc6",
"16846:1216":"f4faff,ffffff,000000,006dc6",
}

META = json.load(open(os.path.join(HERE, "part0-meta.json")))

nodes = []
for i, b, r, k, sh, g in FLOW:
    o = {"id": i, "name": "%s · %s · node" % (b, r), "badge": b, "ref": r, "kind": k, "shape": sh, "grp": g}
    nodes.append(o)
for i, b, r, site, ds, chg in MOCK:
    nodes.append({"id": i, "name": "%s · %s · mockup" % (b, r), "badge": b, "ref": r, "kind": "mockup", "shape": "", "grp": "",
                  "site": site, "ds": ";".join("DS-component:" + x for x in ds.split(";")),
                  "colors": ["#" + c for c in COLORS[i].split(",") if c], "chg": chg.split(",")})
assert len(nodes) == META["n"], (len(nodes), META["n"])
out = {"section": META["section"], "nodes": nodes,
       "arrows": [{"from": a, "to": b} for a, b in META["arrows"]],
       "stats": META["stats"], "legend": META["legend"], "unbadged": META["unbadged"], "overlap": META["overlap"],
       "idx": [{"ref": r, "type": t} for r, t in META["idx"]], "idxTotal": META["idxTotal"], "erridx": META["erridx"],
       "desc": [{"ref": r, "items": a, "errors": b} for r, a, b in META["desc"]]}
json.dump(out, open(os.path.join(HERE, "..", "cr-figma-nodes.json"), "w"), ensure_ascii=False, indent=1)
print("nodes", len(nodes), "arrows", len(out["arrows"]), "desc", len(out["desc"]))
