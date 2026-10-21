const PAGE_ID = "16779:398";
const SECTION_NAME = "CR-002 — 法人向け商品販売（カレンダー折りたたみ · 限定公開ページ） (baseline ver1 → ver8)";

// Use_figma gioi han ket qua 20 KB -> chay nhieu lan: PART = 0 (meta: arrows/stats/idx/desc...), 1..N (nodes, 50 node / phan).
// Ghep: python3 verify-cr-figma.py --nodes part0.json,part1.json,...  (hoac tu ghep thanh 1 file {nodes:[...], ...}).
const PART = 0, PAGE = 50;
const page = await figma.getNodeByIdAsync(PAGE_ID); await figma.setCurrentPageAsync(page);
const s = page.children.find(c=>c.type==="SECTION" && c.name===SECTION_NAME);
if (!s) return {error:"khong thay section"};
const rx = /^(NEW|UPD|DEL|IMPACT|AS-IS) · ([^·]+?) · /;
const hex = c => "#"+[c.r,c.g,c.b].map(v=>Math.round(v*255).toString(16).padStart(2,"0")).join("");
const all = s.findAll(n => rx.test(n.name));
if (PART > 0) {
  const nodes = all.slice((PART-1)*PAGE, PART*PAGE).map(n => { const m = n.name.match(rx); const kind = n.getSharedPluginData("crkit","kind")||"other";
    const o = {id:n.id, name:n.name.slice(0,48), badge:m[1], ref:m[2].trim(), kind};
    const sh = n.getSharedPluginData("crkit","shape"), g = n.getSharedPluginData("crkit","grp"); if (sh) o.shape = sh; if (g) o.grp = g;
    if (kind==="mockup") { o.ds = n.getSharedPluginData("crkit","ds"); o.site = n.getSharedPluginData("crkit","site");
      // chi bo chinh khung CHG-ANN / chg-label (mau badge), KHONG bo noi dung ben trong khung
      const cols = new Set(); for (const d of n.findAll(x => "fills" in x && Array.isArray(x.fills))) { if (d.name && (d.name.startsWith("CHG-ANN") || d.name==="chg-label")) continue; for (const p of d.fills) if (p.type==="SOLID") cols.add(hex(p.color)); }
      o.colors = [...cols];
      o.chg = [...new Set(n.findAll(x => x.name && x.name.startsWith("CHG-ANN · ")).map(x => x.name.split(" · ")[1]))]; }
    return o; });
  return {part: PART, of: Math.ceil(all.length/PAGE), nodes};
}
const arrows = s.findAll(n => n.name.startsWith("ARROW · ")).map(n => ({id:n.id, from:n.getSharedPluginData("crkit","from"), to:n.getSharedPluginData("crkit","to")}));
const stats = s.findAll(n => n.name.startsWith("STAT · ")).map(n => ({name:n.name, value:n.getSharedPluginData("crkit","value")}));
const legend = s.findAll(n => n.name.startsWith("LEGEND")).length;
const idx = s.findAll(n => n.name.startsWith("IDX · ")).map(n => ({ref:n.getSharedPluginData("crkit","ref"), type:n.getSharedPluginData("crkit","type")}));
const idxTotal = s.findAll(n => n.name==="IDX-TOTAL").map(n => n.characters);
const erridx = s.findAll(n => n.name.startsWith("ERRIDX · ")).length;
const desc = s.findAll(n => n.name.startsWith("DESC · ")).map(n => ({ref:n.getSharedPluginData("crkit","ref"),
  items:n.findAll(x=>x.name && x.name.startsWith("ITEM · ")).length, errors:n.findAll(x=>x.name && x.name.startsWith("ERR · ")).length}));
const unbadged = s.findAll(n => n.type==="FRAME" && n.parent && n.parent.name && (n.parent.name.startsWith("CR-1") || n.parent.name.startsWith("CR-2")) && !rx.test(n.name) && !/^(IDX|idx-|ARROW|ERRIDX)/.test(n.name)).map(n=>n.name).slice(0,20);
const sb = s.absoluteBoundingBox; const others = page.children.filter(c=>c.id!==s.id).map(c=>({name:c.name, ...c.absoluteBoundingBox}));
const overlap = others.filter(b=>!(b.x+b.width<=sb.x||sb.x+sb.width<=b.x||b.y+b.height<=sb.y||sb.y+sb.height<=b.y)).map(b=>b.name);
return {part: 0, parts: Math.ceil(all.length/PAGE), section:{id:s.id, name:s.name, x:sb.x, y:sb.y, w:sb.width, h:sb.height}, arrows, stats, legend, unbadged, overlap, idx, idxTotal, erridx, desc};
