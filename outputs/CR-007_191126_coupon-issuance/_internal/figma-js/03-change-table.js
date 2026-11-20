const PAGE_ID = "16779:398";
const SECTION_NAME = "CR-007 — クーポン発行機能 (Chức năng phát hành Coupon) (baseline ver2 → CR-007)";

const NS = "crkit";
const BADGE = {NEW:{f:"#EDFDF0",s:"#1A7F37",d:false}, UPD:{f:"#FFF9EB",s:"#F4860C",d:true},
  DEL:{f:"#FFF6F5",s:"#CF222E",d:true}, IMPACT:{f:"#FBEEFF",s:"#6639BA",d:true}, "AS-IS":{f:"#F6F8FA",s:"#D0D7DE",d:false,o:0.6}};
const W8 = {300:"Light",400:"Regular",500:"Medium",600:"Bold",700:"Bold"};
for (const st of ["Regular","Bold","Medium","Light"]) await figma.loadFontAsync({family:"Noto Sans JP", style:st});
function rgb(h){ h=h.replace("#",""); return {r:parseInt(h.slice(0,2),16)/255,g:parseInt(h.slice(2,4),16)/255,b:parseInt(h.slice(4,6),16)/255}; }
function paint(h){ h=String(h).trim(); let m=h.match(/^rgba?\(([^)]+)\)$/);
  if(m){ const p=m[1].split(",").map(x=>parseFloat(x)); return {type:"SOLID",color:{r:p[0]/255,g:p[1]/255,b:p[2]/255},opacity:p.length>3?p[3]:1}; }
  h=h.replace("#",""); const o = h.length===8 ? parseInt(h.slice(6,8),16)/255 : 1; return {type:"SOLID",color:rgb(h.slice(0,6)),opacity:o}; }
function T(parent, s, x, y, w, size, weight, color, align){
  const t=figma.createText(); t.fontName={family:"Noto Sans JP",style:W8[weight]||(weight===true?"Bold":"Regular")};
  t.characters=String(s); t.fontSize=size; t.fills=[paint(color||"#1F2328")]; t.name="t";
  if(align) t.textAlignHorizontal=align;
  if(w){ t.resize(w, t.height); t.textAutoResize="HEIGHT"; }
  parent.appendChild(t); t.x=x; t.y=y; return t; }
function F(parent, name, x, y, w, h, fill){ const f=figma.createFrame(); f.name=name; f.resize(w,h); f.fills=fill?[paint(fill)]:[]; f.clipsContent=false;
  if(parent) { parent.appendChild(f); f.x=x; f.y=y; } return f; }
function R(parent, x, y, w, h, fill){ const r=figma.createRectangle(); r.resize(Math.max(w,1),Math.max(h,1)); r.fills=[paint(fill)]; parent.appendChild(r); r.x=x; r.y=y; r.name="r"; return r; }
function badgeBox(parent, n, x, y, w, h, kind, shape){
  const b=BADGE[n.badge]; const f=F(parent, `${n.badge} · ${n.ref} · ${n.label}`, x, y, w, h, b.f);
  f.strokes=[paint(b.s)]; f.strokeWeight=2; if(b.d) f.dashPattern=[6,4]; if(b.o) f.opacity=b.o;
  f.cornerRadius = (shape==="pill"||shape==="end"||shape==="actor") ? h/2 : (shape==="decision" ? 20 : 8);
  if(shape==="ng"||shape==="popup"){ const bar=R(f,0,0,6,h,"#CF222E"); bar.name="ng-bar"; }
  const pre = shape==="decision" ? "◇ " : (shape==="ng" ? "NG · " : (shape==="popup" ? "⚠ "+(n.display||"Popup")+" · " : (shape==="pill" ? "▶ " : shape==="actor" ? "👤 " : (shape==="end" ? (n.result==="fail" ? "✗ KẾT THÚC · " : "✓ KẾT THÚC · ") : ""))));
  const t1=T(f, `${n.badge} · ${n.ref}`, 10, 6, w-20, 10, 700, b.s);
  const t2=T(f, pre+n.label+(n.badge==="DEL"?" (bỏ)":""), 10, t1.y+t1.height+2, w-20, 12, 700, "#1F2328");
  if(n.badge==="DEL") t2.textDecoration="STRIKETHROUGH";
  let bottomY = t2.y+t2.height;
  if(n.sub){ const t3=T(f, n.sub, 10, t2.y+t2.height+2, w-20, 10, 400, "#57606A"); bottomY = t3.y+t3.height; }
  if (bottomY+8 > h) { f.resize(w, bottomY+8); const bar=f.findOne(c=>c.name==="ng-bar"); if(bar) bar.resize(6, bottomY+8); }
  f.setSharedPluginData(NS,"kind",kind); f.setSharedPluginData(NS,"shape",shape||"box");
  if (n._grp) f.setSharedPluginData(NS,"grp",n._grp); return f; }
function head(parent, x, y, dir){ const v=figma.createVector(); const P={r:"M 0 0 L 10 5 L 0 10 Z",l:"M 10 0 L 0 5 L 10 10 Z",d:"M 0 0 L 10 0 L 5 10 Z",u:"M 0 10 L 10 10 L 5 0 Z"};
  v.vectorPaths=[{windingRule:"NONZERO",data:P[dir]}]; parent.appendChild(v); v.name="head";
  const o={r:[-10,-5],l:[0,-5],d:[-5,-10],u:[-5,0]}[dir]; v.x=x+o[0]; v.y=y+o[1]; return v; }
function arrow(parent, A, B, label, style){
  // A,B = node frame; noi tu canh phai A -> canh trai B (khac cot) hoac day A -> dinh B (cung cot)
  const col = style==="ng" ? "#CF222E" : (style==="cross" ? "#1A7F37" : "#0969DA");
  const g=[]; const seg=(x1,y1,x2,y2)=>{ const r=R(parent,Math.min(x1,x2)-1,Math.min(y1,y2)-1,Math.abs(x2-x1)+2,Math.abs(y2-y1)+2,col);
     if(style==="ng"){ r.opacity=0.85; } g.push(r); };
  const ax=A.x, ay=A.y, aw=A.width, ah=A.height, bx=B.x, by=B.y, bw=B.width, bh=B.height;
  let end, dir;
  if (bx >= ax+aw-2) {            // B ben phai
    const x1=ax+aw, y1=ay+ah/2, x2=bx, y2=by+bh/2, xm=Math.round((x1+x2)/2);
    if (Math.abs(y1-y2)<2) seg(x1,y1,x2-10,y2); else { seg(x1,y1,xm,y1); seg(xm,y1,xm,y2); seg(xm,y2,x2-10,y2); }
    end=[x2,y2]; dir="r";
  } else if (by >= ay+ah-2) {     // B ben duoi
    const x1=ax+aw/2, y1=ay+ah, x2=bx+bw/2, y2=by, ym=Math.round((y1+y2)/2);
    if (Math.abs(x1-x2)<2) seg(x1,y1,x2,y2-10); else { seg(x1,y1,x1,ym); seg(x1,ym,x2,ym); seg(x2,ym,x2,y2-10); }
    end=[x2,y2]; dir="d";
  } else {                         // B ben trai / tren -> vong duoi
    const x1=ax+aw/2, y1=ay+ah, x2=bx+bw/2, y2=by+bh, yb=Math.max(y1,y2)+24;
    seg(x1,y1,x1,yb); seg(x1,yb,x2,yb); seg(x2,yb,x2,y2+10); end=[x2,y2]; dir="u";
  }
  const h=head(parent,end[0],end[1],dir); h.fills=[paint(col)]; g.push(h);
  if (label) { const t=T(parent,label,(g[0].x+6),(g[0].y-14),null,10,500,col); g.push(t); }
  const grp=figma.group(g,parent); grp.name=`ARROW · ${A.name.split(" · ")[1]} → ${B.name.split(" · ")[1]}`;
  grp.setSharedPluginData(NS,"kind","arrow"); grp.setSharedPluginData(NS,"from",A.id); grp.setSharedPluginData(NS,"to",B.id);
  return grp; }
async function section(){ const page=await figma.getNodeByIdAsync(PAGE_ID); await figma.setCurrentPageAsync(page);
  let s=page.children.find(c=>c.type==="SECTION" && c.name===SECTION_NAME); return {page, s}; }
function bottom(s){ let m=0; for(const c of s.children) m=Math.max(m,c.y+c.height); return m; }
function fit(s){ let w=0,h=0; for(const c of s.children){ w=Math.max(w,c.x+c.width); h=Math.max(h,c.y+c.height);} s.resizeWithoutConstraints(w+80,h+80); }


const D = {"note": "Số lượng = số đối tượng (màn / API / bảng / cột / rule …) theo đơn vị của bảng đơn giá. 総工数 = 実装 × hệ số công đoạn của template Estimation.", "rows": [["Màn hình", 5, 5, 0, 0, 10, "21.5"], ["API", 5, 5, 0, 0, 10, "7.5"], ["Batch / job", 1, 1, 0, 0, 2, "2.25"], ["Bảng DB", 5, 0, 0, 0, 5, "2.5"], ["Cột DB", 4, 1, 0, 0, 5, "1.75"], ["Rule nghiệp vụ", 4, 0, 0, 1, 5, "4.25"], ["Liên kết bên thứ 3", 0, 1, 0, 2, 3, "2"], ["Mockup màn", 5, 4, 0, 0, 9, "3.5"], ["Tổng", 29, 17, 0, 3, 49, "45.25"]], "totals": [["実装 — MD theo bảng đơn giá", "45.25", "MD"], ["総工数 — 人日 (要件定義 + UI/UX + 実装 + テスト + 管理)", "103.17", "人日"], ["人月 (人日 / 20)", "5.16", "人月"], ["trong đó 最小改修案 — 実装", "39.75", "MD"], ["trong đó 拡張案 — 実装", "5.5", "MD"]], "xlsx": "CR-007_Impact.xlsx"};
const {page, s} = await section();
if (!s) return {error: "chua co section"};
const y0 = bottom(s) + 120;
const fr = F(s, "CR Change Table — thống kê thay đổi", 40, y0, 1180, 200, "#FFFFFF");
fr.strokes=[paint("#D0D7DE")]; fr.cornerRadius=12;
T(fr, "CR Change Table — thống kê (chi tiết từng hạng mục: " + D.xlsx + ")", 32, 24, 1100, 20, 700);
const nt = T(fr, D.note, 32, 54, 1100, 12, 400, "#57606A");
const cols = [["Đối tượng",300],["NEW",110],["UPD",110],["DEL",110],["IMPACT",110],["Tổng",110],["実装 MD",160]];
const fills = {NEW:"#EDFDF0",UPD:"#FFF9EB",DEL:"#FFF6F5",IMPACT:"#FBEEFF"};
let y = Math.max(90, nt.y + nt.height + 14), x = 32;
for (const [c,w] of cols) { const h=F(fr,"hdr-"+c,x,y,w,32,fills[c]||"#DAEEF3"); h.strokes=[paint("#D0D7DE")]; T(h,c,8,8,w-16,12,700,"#1F2328", c==="Đối tượng"?null:"CENTER"); x+=w; }
y += 32;
for (const row of D.rows) { x = 32; const tot = row[0]==="Tổng";
  row.forEach((v,k)=>{ const w=cols[k][1]; const c=F(fr, k===0 ? "STATROW · "+v : "STAT · "+row[0]+" · "+cols[k][0], x, y, w, 30, tot?"#F6F8FA":(k>0&&k<5&&Number(v)>0?fills[cols[k][0]]:"#FFFFFF"));
    c.strokes=[paint("#D0D7DE")]; if(k>0){ c.setSharedPluginData(NS,"kind","stat"); c.setSharedPluginData(NS,"value",String(v)); }
    T(c, String(v), 8, 7, w-16, 12, tot||k===0?700:400, "#1F2328", k===0?null:"CENTER"); x+=w; }); y+=30; }
y += 16;
for (const [lab,val,unit] of D.totals) { const c=F(fr,"STAT · TOTAL · "+lab,32,y,1010,34,"#DAEEF3"); c.strokes=[paint("#D0D7DE")];
  c.setSharedPluginData(NS,"kind","stat"); c.setSharedPluginData(NS,"value",String(val));
  T(c, lab, 10, 8, 640, 13, 700); T(c, String(val)+" "+unit, 660, 8, 340, 14, 700, "#0969DA", "RIGHT"); y+=38; }
fr.resize(1180, y + 24);
fit(s);
return {frame: fr.id, bottom: fr.y + fr.height};
