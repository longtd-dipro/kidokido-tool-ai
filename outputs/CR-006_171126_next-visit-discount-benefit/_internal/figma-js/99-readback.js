const PAGE_ID = "16779:398";
const SECTION_NAME = "CR-006 — 次回利用割引特典機能 (Ưu đãi cho lần sử dụng tiếp theo) (baseline ver2 → CR-006)";

// Use_figma gioi han ket qua 20 KB -> chay nhieu lan: PART = 0 (meta: arrows/stats/idx/desc...), 1..N (nodes, 50 node / phan).
// Ghep: python3 verify-cr-figma.py --nodes part0.json,part1.json,...  (hoac tu ghep thanh 1 file {nodes:[...], ...}).
const PART = 0, PAGE = 50;
const page = await figma.getNodeByIdAsync(PAGE_ID); await figma.setCurrentPageAsync(page);
const s = page.children.find(c=>c.type==="SECTION" && c.name===SECTION_NAME);
if (!s) return {error:"khong thay section"};
// CR-3 co the dat ngoai section CR (canh Output 1 / 2) — section site mang plugin data crkit.cr = ten section CR
const hosts = [s, ...page.children.filter(c => c.type==="SECTION" && c.getSharedPluginData("crkit","cr")===SECTION_NAME)];
const FA = f => hosts.flatMap(h => (f(h) ? [h] : []).concat(h.findAll(f)));
const rx = /^(NEW|UPD|DEL|IMPACT|AS-IS) · ([^·]+?) · /;
const hex = c => "#"+[c.r,c.g,c.b].map(v=>Math.round(v*255).toString(16).padStart(2,"0")).join("");
const all = FA(n => rx.test(n.name));
if (PART > 0) {
  const nodes = all.slice((PART-1)*PAGE, PART*PAGE).map(n => { const m = n.name.match(rx); const kind = n.getSharedPluginData("crkit","kind")||"other";
    const o = {id:n.id, name:n.name.slice(0,48), badge:m[1], ref:m[2].trim(), kind};
    const sh = n.getSharedPluginData("crkit","shape"), g = n.getSharedPluginData("crkit","grp"); if (sh) o.shape = sh; if (g) o.grp = g;
    if (kind==="mockup") { o.ds = n.getSharedPluginData("crkit","ds"); o.site = n.getSharedPluginData("crkit","site"); const src = n.getSharedPluginData("crkit","src"); if (src) o.src = src;
      // chi bo chinh khung CHG-ANN / chg-label (mau badge), KHONG bo noi dung ben trong khung
      const cols = new Set(); for (const d of n.findAll(x => "fills" in x && Array.isArray(x.fills))) { if (d.name && (d.name.startsWith("CHG-ANN") || d.name==="chg-label")) continue; for (const p of d.fills) if (p.type==="SOLID") cols.add(hex(p.color)); }
      o.colors = [...cols];
      o.chg = [...new Set(n.findAll(x => x.name && x.name.startsWith("CHG-ANN · ")).map(x => x.name.split(" · ")[1]))]; }
    return o; });
  return {part: PART, of: Math.ceil(all.length/PAGE), nodes};
}
const arrows = FA(n => n.name.startsWith("ARROW · ")).map(n => ({id:n.id, from:n.getSharedPluginData("crkit","from"), to:n.getSharedPluginData("crkit","to")}));
const stats = FA(n => n.name.startsWith("STAT · ")).map(n => ({name:n.name, value:n.getSharedPluginData("crkit","value")}));
const legend = FA(n => n.name.startsWith("LEGEND")).length;
const idx = FA(n => n.name.startsWith("IDX · ")).map(n => ({ref:n.getSharedPluginData("crkit","ref"), type:n.getSharedPluginData("crkit","type")}));
const idxTotal = FA(n => n.name==="IDX-TOTAL").map(n => n.characters);
const erridx = FA(n => n.name.startsWith("ERRIDX · ")).length;
const desc = FA(n => n.name.startsWith("DESC · ")).map(n => ({ref:n.getSharedPluginData("crkit","ref"),
  items:n.findAll(x=>x.name && x.name.startsWith("ITEM · ")).length, errors:n.findAll(x=>x.name && x.name.startsWith("ERR · ")).length}));
const unbadged = FA(n => n.type==="FRAME" && n.parent && n.parent.name && (n.parent.name.startsWith("CR-1") || n.parent.name.startsWith("CR-2")) && !rx.test(n.name) && !/^(IDX|idx-|ARROW|ERRIDX|CR-2 Screen Flow —|CR-2 Index —|CR-2 Flow )/.test(n.name)).map(n=>n.name).slice(0,20);
const sb = s.absoluteBoundingBox; const others = page.children.filter(c=>!hosts.includes(c)).map(c=>({name:c.name, ...c.absoluteBoundingBox}));
const overlap = others.filter(b=>!(b.x+b.width<=sb.x||sb.x+sb.width<=b.x||b.y+b.height<=sb.y||sb.y+sb.height<=b.y)).map(b=>b.name);
const kindOf = n => n.getSharedPluginData("crkit","kind");
const cr2 = FA(n => n.type==="SECTION" && kindOf(n)==="cr2-site").map(h => ({name:h.name, site:h.getSharedPluginData("crkit","site"),
  groups:[...new Set(h.findAll(x => !!x.getSharedPluginData("crkit","grp")).map(x => x.getSharedPluginData("crkit","grp")))],
  flows: h.children.filter(c => c.type==="SECTION" && kindOf(c)==="cr2-flow").map(f => ({name:f.name, flow:f.getSharedPluginData("crkit","flow"),
    groups:[...new Set(f.findAll(x => !!x.getSharedPluginData("crkit","grp")).map(x => x.getSharedPluginData("crkit","grp")))]}))}));
const cr3 = FA(n => n.type==="SECTION" && kindOf(n)==="cr3-site").map(h => ({name:h.name, site:h.getSharedPluginData("crkit","site"),
  fill: h.fills.length && h.fills[0].type==="SOLID" ? hex(h.fills[0].color) : "",
  flows: h.children.filter(c => c.type==="SECTION" && kindOf(c)==="cr3-flow").map(f => ({name:f.name, flow:f.getSharedPluginData("crkit","flow"), mockups:f.findAll(x => kindOf(x)==="mockup").length})),
  loose: h.children.filter(c => kindOf(c)==="mockup").length}));
const mockups = FA(n => kindOf(n)==="mockup").length;
return {part: 0, parts: Math.ceil(all.length/PAGE), layout:{cr2, cr3, mockups}, section:{id:s.id, name:s.name, x:sb.x, y:sb.y, w:sb.width, h:sb.height}, arrows, stats, legend, unbadged, overlap, idx, idxTotal, erridx, desc};
