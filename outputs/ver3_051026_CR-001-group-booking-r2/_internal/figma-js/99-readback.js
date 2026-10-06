const PAGE_ID = "16779:398";
const SECTION_NAME = "CR-001 — 団体利用登録・団体利用受付機能 (baseline ver1 → ver3)";

const page = await figma.getNodeByIdAsync(PAGE_ID); await figma.setCurrentPageAsync(page);
const s = page.children.find(c=>c.type==="SECTION" && c.name===SECTION_NAME);
if (!s) return {error:"khong thay section"};
const rx = /^(NEW|UPD|DEL|IMPACT|AS-IS) · ([^·]+?) · /;
const hex = c => "#"+[c.r,c.g,c.b].map(v=>Math.round(v*255).toString(16).padStart(2,"0")).join("");
const nodes = s.findAll(n => rx.test(n.name)).map(n => { const m = n.name.match(rx); const kind = n.getSharedPluginData("crkit","kind")||"other";
  const o = {id:n.id, name:n.name, badge:m[1], ref:m[2].trim(), kind};
  if (kind==="mockup") { o.ds = n.getSharedPluginData("crkit","ds"); o.site = n.getSharedPluginData("crkit","site");
    const cols = new Set(); for (const d of n.findAll(x => "fills" in x && Array.isArray(x.fills))) for (const p of d.fills) if (p.type==="SOLID") cols.add(hex(p.color));
    o.colors = [...cols]; }
  return o; });
const arrows = s.findAll(n => n.name.startsWith("ARROW · ")).map(n => ({id:n.id, from:n.getSharedPluginData("crkit","from"), to:n.getSharedPluginData("crkit","to")}));
const stats = s.findAll(n => n.name.startsWith("STAT · ")).map(n => ({name:n.name, value:n.getSharedPluginData("crkit","value")}));
const legend = s.findAll(n => n.name.startsWith("LEGEND")).length;
const unbadged = s.findAll(n => n.type==="FRAME" && n.parent && n.parent.name && (n.parent.name.startsWith("CR-1") || n.parent.name.startsWith("CR-2")) && !rx.test(n.name) && !/^(IDX|idx-|ARROW)/.test(n.name)).map(n=>n.name).slice(0,20);
const sb = s.absoluteBoundingBox; const others = page.children.filter(c=>c.id!==s.id).map(c=>({name:c.name, ...c.absoluteBoundingBox}));
const overlap = others.filter(b=>!(b.x+b.width<=sb.x||sb.x+sb.width<=b.x||b.y+b.height<=sb.y||sb.y+sb.height<=b.y)).map(b=>b.name);
return {section:{id:s.id, name:s.name, x:sb.x, y:sb.y, w:sb.width, h:sb.height}, nodes, arrows, stats, legend, unbadged, overlap};
