const PAGE_ID = "16779:398";
const SECTION_NAME = "CR-002 — 法人向け商品販売（カレンダー折りたたみ · 限定公開ページ） (baseline ver1 → ver8)";

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
  f.cornerRadius = shape==="pill" ? h/2 : (shape==="decision" ? 20 : 8);
  if(shape==="ng"||shape==="popup"){ const bar=R(f,0,0,6,h,"#CF222E"); bar.name="ng-bar"; }
  const pre = shape==="decision" ? "◇ " : (shape==="ng" ? "NG · " : (shape==="popup" ? "⚠ "+(n.display||"Popup")+" · " : (shape==="pill" ? "▶ " : "")));
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


const D = {"subtitle": "Baseline ver1_021026_khao-sat-lan-dau → ver8_191026_CR-002-corporate-limited-page · 33 hạng mục · 実装 26 MD (đơn giá DRAFT) · Không sửa Output 1/2 baseline — chỉ vẽ phần CR chạm + hàng xóm 1 bước", "flow_note": "Chỉ các lane FL-xx của baseline bị CR chạm (+ lane nghiệp vụ mới). Node AS-IS = giữ nguyên làm ngữ cảnh.", "flows": [{"lane": "FL-08", "title": "Mua vé trước (事前) — lịch thu gọn ① (lane baseline)", "note": "CR-002.1 · ①-B (KH chọn): mặc định 7 ngày → もっと見る → 1 tháng · ①-A (thay thế): mặc định đóng · áp dụng mọi sản phẩm 事前購入", "nodes": [{"key": "a", "col": "actor", "badge": "AS-IS", "ref": "FL-08", "label": "Khách / User", "sub": "không đổi"}, {"key": "t", "col": "trigger", "badge": "UPD", "ref": "SC-067", "label": "Mở 店舗詳細 — lịch 7 ngày / sản phẩm", "sub": "BookingVacancies (①-B)"}, {"key": "f", "col": "function", "badge": "UPD", "ref": "SC-067", "label": "Bấm もっと見る → lịch 1 tháng", "sub": "閉じる thu lại · ngày đã chọn ngoài tuần đầu → tự mở"}, {"key": "x", "col": "technology", "badge": "IMPACT", "ref": "API-075", "label": "API-075 bookingDays = 30", "sub": "tham số có sẵn, chặn ≤ 30 — kiểm tốc độ"}, {"key": "o", "col": "outcome", "badge": "IMPACT", "ref": "SC-050", "label": "Chọn ngày → form mua trước", "sub": "luồng mua giữ nguyên"}, {"key": "d", "col": "technology", "badge": "IMPACT", "ref": "API-075", "label": "Tải 30 ngày OK?", "sub": "", "row": 1, "type": "decision"}, {"key": "ng", "col": "outcome", "badge": "IMPACT", "ref": "API-075", "label": "Lỗi tải → giữ lịch 7 ngày + Toast", "sub": "「システムエラーが発生しました。…」(thật)", "row": 1, "type": "ng"}, {"key": "e1", "col": "outcome", "badge": "UPD", "ref": "IMP-007", "label": "①-A thay thế: mặc định đóng lịch, mở → 1 tháng", "sub": "", "type": "edge"}, {"key": "e2", "col": "outcome", "badge": "IMPACT", "ref": "SC-044", "label": "Admin 空き状況 dùng chung component — giữ lịch mở", "sub": "", "type": "edge"}], "edges": [["a", "t", "", ""], ["t", "f", "もっと見る", ""], ["f", "x", "gọi", ""], ["x", "o", "chọn ngày", ""], ["x", "d", "", ""], ["d", "ng", "NO", "ng"], ["t", "e1", "①-A", ""], ["t", "e2", "dùng chung", ""]]}, {"lane": "CR-NEW-1", "title": "Mua sản phẩm 法人向け qua trang 限定公開 (nghiệp vụ mới)", "note": "CR-002.2 · truy cập = biết URL (không đăng nhập) · mua / thanh toán / huỷ dùng luồng cũ", "nodes": [{"key": "a", "col": "actor", "badge": "NEW", "ref": "IMP-022", "label": "Khách doanh nghiệp (có URL)", "sub": "nhận URL từ Bornelund"}, {"key": "t", "col": "trigger", "badge": "NEW", "ref": "IMP-016", "label": "Mở URL 限定公開", "sub": "chọn 施設 → lịch 事前 + vé 当日"}, {"key": "f", "col": "function", "badge": "UPD", "ref": "API-107", "label": "Lấy sản phẩm limited_public theo khoá", "sub": "không khoá → như cũ"}, {"key": "f1", "col": "function", "badge": "UPD", "ref": "SC-050", "label": "Mua trước → thanh toán thẻ (GMO)", "sub": "truyền khoá xuống form", "row": 2}, {"key": "f2", "col": "function", "badge": "UPD", "ref": "SC-054", "label": "Mua trong ngày (今から利用する)", "sub": "truyền khoá xuống form", "row": 3}, {"key": "x", "col": "technology", "badge": "UPD", "ref": "API-075", "label": "Lọc ở tầng response API-075", "sub": "KHÔNG sửa hàm dùng chung"}, {"key": "o", "col": "outcome", "badge": "IMPACT", "ref": "API-070", "label": "Booking tạo bằng luồng cũ", "sub": "mail · my page · huỷ như vé thường"}, {"key": "d", "col": "technology", "badge": "NEW", "ref": "IMP-022", "label": "Khoá URL hợp lệ?", "sub": "", "row": 1, "type": "decision"}, {"key": "ng", "col": "outcome", "badge": "NEW", "ref": "IMP-016", "label": "Khoá sai → 404, không lộ sản phẩm", "sub": "「ページが見つかりません」(đề xuất)", "row": 1, "type": "ng"}, {"key": "e1", "col": "outcome", "badge": "IMPACT", "ref": "API-074", "label": "Hàm getTenantTicketsForVacancy dùng chung (đặt trong ngày, cron, POS) — giữ nguyên", "sub": "", "type": "edge"}, {"key": "e2", "col": "outcome", "badge": "NEW", "ref": "IMP-022", "label": "Người biết ticketId vẫn đặt được — có chặn? CQ-007", "sub": "", "type": "edge"}], "edges": [["a", "t", "", ""], ["t", "d", "mở", ""], ["d", "f", "YES", ""], ["d", "ng", "NO", "ng"], ["f", "x", "dùng", ""], ["x", "o", "kết quả", ""], ["f", "f1", "事前", ""], ["f", "f2", "当日", ""], ["x", "e1", "dùng chung", ""], ["d", "e2", "rủi ro", ""]]}, {"lane": "FL-07", "title": "Tra cứu công khai — ẩn sản phẩm 限定公開 (lane baseline)", "note": "CR-002.2 · 料金プラン / 販売状況 / 店舗詳細 / mua vé thường không hiện sản phẩm 限定公開", "no_ng": "Không có nhánh lỗi mới: danh sách chỉ bớt sản phẩm 限定公開; lỗi tải giữ như hiện tại", "nodes": [{"key": "a", "col": "actor", "badge": "AS-IS", "ref": "FL-07", "label": "Khách / User", "sub": "không đổi"}, {"key": "t", "col": "trigger", "badge": "IMPACT", "ref": "SC-059", "label": "Mở 料金プラン / 販売状況 / 店舗詳細", "sub": "SC-059 · SC-092 · SC-067 · SC-048 · SC-049"}, {"key": "f", "col": "function", "badge": "UPD", "ref": "API-107", "label": "Bỏ sản phẩm limited_public = true", "sub": "mặc định khi không có khoá"}, {"key": "x", "col": "technology", "badge": "UPD", "ref": "API-075", "label": "API-075 cũng bỏ sản phẩm 限定公開", "sub": ""}, {"key": "o", "col": "outcome", "badge": "IMPACT", "ref": "SC-092", "label": "Trang thường không thấy sản phẩm 法人向け", "sub": "sản phẩm thường giữ nguyên"}], "edges": [["a", "t", "", ""], ["t", "f", "gọi", ""], ["f", "x", "dùng", ""], ["x", "o", "kết quả", ""]]}, {"lane": "FL-03", "title": "Thiết lập sản phẩm 法人向け (lane baseline)", "note": "CR-002.2 / CR-002.3 · 4 sản phẩm tạo bằng 商品管理 hiện có (giá, lịch bán, mã Smaregi / OBIC) — chỉ thêm 限定公開", "nodes": [{"key": "a", "col": "actor", "badge": "AS-IS", "ref": "FL-03", "label": "Super Admin / Admin", "sub": "không đổi"}, {"key": "t", "col": "trigger", "badge": "UPD", "ref": "SC-036", "label": "Tạo / sửa sản phẩm — 限定公開 ON / OFF", "sub": "Option: chọn 掲載先ページ"}, {"key": "f", "col": "function", "badge": "UPD", "ref": "API-050", "label": "Lưu limited_public (API-050 / 054)", "sub": ""}, {"key": "x", "col": "technology", "badge": "NEW", "ref": "column:tickets.limited_public", "label": "tickets.limited_public", "sub": "boolean, mặc định false"}, {"key": "o", "col": "outcome", "badge": "UPD", "ref": "SC-035", "label": "商品一覧 hiện nhãn 限定公開", "sub": ""}, {"key": "d", "col": "technology", "badge": "UPD", "ref": "SC-036", "label": "Option: đã chọn 掲載先ページ?", "sub": "", "row": 1, "type": "decision"}, {"key": "ng", "col": "outcome", "badge": "UPD", "ref": "SC-036", "label": "Chưa chọn trang → lỗi dưới field", "sub": "「掲載先ページを選択してください」(đề xuất)", "row": 1, "type": "ng"}, {"key": "e1", "col": "outcome", "badge": "NEW", "ref": "IMP-034", "label": "Option: quản lý nhiều trang A / B / C (IMP-030…038)", "sub": "", "type": "edge"}], "edges": [["a", "t", "", ""], ["t", "f", "lưu", ""], ["f", "x", "dùng", ""], ["x", "o", "kết quả", ""], ["t", "d", "Option", ""], ["d", "ng", "NO", "ng"], ["t", "e1", "Option", ""]]}], "tech": [{"badge": "IMPACT", "ref": "EXT-001", "label": "GMO Payment Gateway", "sub": "sản phẩm 限定公開 thanh toán như vé thường — kiểm lại"}, {"badge": "IMPACT", "ref": "EXT-006", "label": "Smaregi POS", "sub": "mã Smaregi / OBIC nhập ở 商品管理 như vé thường"}]};
const {page, s:old} = await section();
if (old) return {error: "section da ton tai — xoa section cu (cua chinh lan chay nay) hoac doi ten truoc khi ve lai"};
const s = figma.createSection(); s.name = SECTION_NAME; s.x = 0; s.y = 67250; page.appendChild(s);
const created=[];
T(s, SECTION_NAME, 40, 30, 2200, 32, 700);
T(s, D.subtitle, 40, 80, 2200, 14, 400, "#57606A");
// Legend
const lg = F(s, "LEGEND · badge", 40, 120, 1180, 64, "#FFFFFF"); lg.strokes=[paint("#D0D7DE")]; lg.cornerRadius=8;
lg.setSharedPluginData(NS,"kind","legend");
let lx=16; for (const [b,txt] of [["NEW","Tạo mới"],["UPD","Sửa cái đang có"],["DEL","Bỏ"],["IMPACT","Không sửa — bị kéo theo, kiểm lại"],["AS-IS","Giữ nguyên, ngữ cảnh"]]) {
  const sw=F(lg,"sw-"+b,lx,18,28,28,BADGE[b].f); sw.strokes=[paint(BADGE[b].s)]; sw.strokeWeight=2; if(BADGE[b].d) sw.dashPattern=[4,3]; if(BADGE[b].o) sw.opacity=BADGE[b].o; sw.cornerRadius=6;
  T(lg, b+" — "+txt, lx+36, 22, null, 12, 700, BADGE[b].s); lx += 36 + (b==="IMPACT"?300:180); }
T(lg, "NG / ⚠ popup lỗi = vạch đỏ bên trái · ◇ = rẽ nhánh · ▶ = điểm vào", lx, 22, null, 12, 500, "#CF222E");
// CR-1 Flow (format Output 1 Phan A + Phan B)
const fr = F(s, "CR-1 Flow — luồng nghiệp vụ bị CR chạm (format Output 1)", 40, 220, 2280, 400, "#FFFFFF");
fr.strokes=[paint("#D0D7DE")]; fr.cornerRadius=12;
T(fr, "CR-1 — Flow thay đổi (Output 1 · Phần A Business & Logic Flow + Phần B Technology)", 40, 24, 1700, 22, 700);
T(fr, D.flow_note, 40, 54, 1700, 12, 400, "#57606A");
const CX = {actor:98, trigger:250, function:500, technology:770, outcome:1040, edge:1320};
const CW = {actor:150, trigger:200, function:220, technology:220, outcome:220, edge:440};
for (const [k,lab] of [["actor","ACTOR"],["trigger","TRIGGER"],["function","FUNCTION"],["technology","TECHNOLOGY"],["outcome","OUTCOME"],["edge","EDGE / EXCEPTIONAL — chưa chốt"]]) T(fr, lab, CX[k]+(k==="actor"?2:0), 90, null, 12, 700, "#57606A");
R(fr, 40, 109, 1730, 2, "#1F2328");
let y = 130;
for (const L of D.flows) {
  T(fr, L.lane + " · " + L.title, 40, y, 1700, 16, 700, "#0969DA");
  T(fr, L.note + (L.no_ng ? "   ·   Non-happy: N/A — " + L.no_ng : ""), 40, y+22, 1700, 12, 400, L.no_ng ? "#CF222E" : "#57606A");
  const top = y + 56; const nodes = {}; let maxRow = 0; let edgeIdx = 0;
  for (const n of L.nodes) { n._grp = L.lane;
    const row = n.col==="edge" ? edgeIdx++ : (n.row || 0); maxRow = Math.max(maxRow, row);
    const yy = top + row*120;
    let f;
    if (n.col === "actor") { f = badgeBox(fr, n, CX.actor-40, yy, 150, 84, "flow", "pill"); }
    else f = badgeBox(fr, n, CX[n.col], yy, CW[n.col], n.col==="edge"?70:84, n.col==="edge"?"edge":"flow", n.type==="decision"?"decision":(n.type==="ng"?"ng":null));
    nodes[n.key] = f; created.push(f.id);
  }
  for (const [a,b,lab,st] of L.edges) created.push(arrow(fr, nodes[a], nodes[b], lab, st).id);
  let lb = 0; for (const k in nodes) lb = Math.max(lb, nodes[k].y + nodes[k].height);
  y = Math.max(top + (maxRow+1)*120, lb + 30) + 40;
  R(fr, 40, y, 1730, 1, "#D0D7DE"); y += 60;
}
// Phan B Technology (chi cong nghe bi cham)
T(fr, "TECHNOLOGY — thay đổi / bị ảnh hưởng", 1800, 90, 460, 13, 700, "#F4860C");
let ty = 120;
for (const n of D.tech) { const f = badgeBox(fr, n, 1800, ty, 460, 64, "tech"); created.push(f.id); ty = f.y + f.height + 12; }
fr.resize(2280, Math.max(y, ty) + 20);
fit(s);
return {section: s.id, flow: fr.id, created: created.length, bottom: fr.y + fr.height};
