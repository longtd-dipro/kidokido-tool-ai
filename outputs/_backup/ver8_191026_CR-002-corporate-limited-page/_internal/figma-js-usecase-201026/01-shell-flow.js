const PAGE_ID = "16779:398";
const SECTION_NAME = "CR-002 — 法人向け商品販売（カレンダー折りたたみ · 限定公開ページ）";

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


const D = {"subtitle": "Baseline ver1_021026_khao-sat-lan-dau → ver8_191026_CR-002-corporate-limited-page · 33 hạng mục · 実装 27.25 MD (đơn giá DRAFT) · Không sửa Output 1/2 baseline — chỉ vẽ phần CR chạm + hàng xóm 1 bước", "flow_note": "Chỉ các lane FL-xx của baseline bị CR chạm (+ lane nghiệp vụ mới). Node AS-IS = giữ nguyên làm ngữ cảnh.", "flows": [{"lane": "FL-08", "title": "Mua vé trước — lịch thu gọn (use case có sẵn)", "note": "CR-002.1 · Phương án B (khách hàng chọn): mặc định 7 ngày → 「もっと見る」 → 1 tháng · áp dụng mọi sản phẩm mua trước", "nodes": [{"key": "a", "type": "actor", "badge": "AS-IS", "ref": "FL-08", "label": "Khách", "sub": "không đổi", "pos": null, "row": 0}, {"key": "s", "type": "start", "badge": "UPD", "ref": "SC-067", "label": "Mở trang chi tiết cửa hàng", "sub": "lịch hiện 7 ngày cho mỗi sản phẩm", "pos": 1, "row": 0}, {"key": "s1", "type": "step", "badge": "UPD", "ref": "SC-067", "label": "Bấm 「もっと見る」", "sub": "lịch mở rộng 1 tháng · 「閉じる」 thu lại", "pos": 2, "row": 0}, {"key": "d", "type": "decision", "badge": "IMPACT", "ref": "SC-067", "label": "Tải được lịch 1 tháng?", "sub": "", "pos": 3, "row": 0}, {"key": "s2", "type": "step", "badge": "IMPACT", "ref": "SC-050", "label": "Chọn ngày → màn mua trước", "sub": "luồng mua giữ nguyên", "pos": 4, "row": 0}, {"key": "e1", "type": "end", "badge": "IMPACT", "ref": "SC-050", "label": "Mua vé như hiện tại", "sub": "", "pos": 5, "row": 0, "result": "ok"}, {"key": "ng", "type": "ng", "badge": "IMPACT", "ref": "SC-067", "label": "Lỗi tải → giữ lịch 7 ngày + thông báo", "sub": "「システムエラーが発生しました。…」(có sẵn)", "pos": 3, "row": 1}, {"key": "e2", "type": "end", "badge": "IMPACT", "ref": "SC-067", "label": "Vẫn ở trang, chọn ngày trong 7 ngày", "sub": "", "pos": 4, "row": 1, "result": "fail"}, {"key": "x1", "type": "edge", "badge": "UPD", "ref": "IMP-007", "label": "Phương án A (thay thế): mặc định đóng lịch, mở ra → 1 tháng", "sub": "", "pos": null, "row": 0}, {"key": "x2", "type": "edge", "badge": "IMPACT", "ref": "SC-044", "label": "Màn chỗ trống của quản trị dùng chung lịch — giữ lịch mở", "sub": "", "pos": null, "row": 0}], "edges": [["a", "s", "", ""], ["s", "s1", "", ""], ["s1", "d", "", ""], ["d", "s2", "Được", ""], ["s2", "e1", "", ""], ["d", "ng", "Lỗi", "ng"], ["ng", "e2", "", "ng"]]}, {"lane": "CR-NEW-1", "title": "Mua sản phẩm doanh nghiệp qua trang giới hạn (use case mới)", "note": "CR-002.2 · vào bằng link (không cần đăng nhập) · mua / thanh toán / huỷ dùng luồng hiện có", "nodes": [{"key": "a", "type": "actor", "badge": "NEW", "ref": "IMP-022", "label": "Khách doanh nghiệp (có link)", "sub": "nhận link từ Bornelund", "pos": null, "row": 0}, {"key": "s", "type": "start", "badge": "NEW", "ref": "IMP-016", "label": "Mở link trang giới hạn", "sub": "", "pos": 1, "row": 0}, {"key": "d", "type": "decision", "badge": "NEW", "ref": "IMP-022", "label": "Link đúng, trang đang công khai?", "sub": "", "pos": 2, "row": 0}, {"key": "s1", "type": "step", "badge": "NEW", "ref": "IMP-016", "label": "Chọn cửa hàng → xem lịch và sản phẩm giới hạn", "sub": "", "pos": 3, "row": 0}, {"key": "s2", "type": "step", "badge": "UPD", "ref": "SC-050", "label": "Mua trước (thẻ) hoặc dùng trong ngày", "sub": "dùng màn mua hiện có", "pos": 4, "row": 0}, {"key": "e1", "type": "end", "badge": "IMPACT", "ref": "SC-050", "label": "Đặt chỗ xong — mail, My page, huỷ như vé thường", "sub": "", "pos": 5, "row": 0, "result": "ok"}, {"key": "ng", "type": "ng", "badge": "NEW", "ref": "IMP-016", "label": "Link sai / trang đã dừng → trang không tìm thấy", "sub": "「ページが見つかりません」(đề xuất)", "pos": 2, "row": 1}, {"key": "e2", "type": "end", "badge": "NEW", "ref": "IMP-016", "label": "Không thấy sản phẩm nào", "sub": "", "pos": 3, "row": 1, "result": "fail"}, {"key": "x1", "type": "edge", "badge": "NEW", "ref": "IMP-022", "label": "Người biết mã sản phẩm có mua được ngoài trang giới hạn không? — chờ khách hàng xác nhận", "sub": "", "pos": null, "row": 0}], "edges": [["a", "s", "", ""], ["s", "d", "", ""], ["d", "s1", "Đúng", ""], ["s1", "s2", "", ""], ["s2", "e1", "", ""], ["d", "ng", "Sai", "ng"], ["ng", "e2", "", "ng"]]}, {"lane": "FL-07", "title": "Tra cứu thông tin công khai — ẩn sản phẩm giới hạn (use case có sẵn)", "note": "CR-002.2 · bảng giá / tình trạng bán / chi tiết cửa hàng / mua vé thường không hiện sản phẩm giới hạn", "no_ng": "Không có nhánh lỗi mới: danh sách chỉ bớt sản phẩm giới hạn; lỗi tải giữ như hiện tại", "nodes": [{"key": "a", "type": "actor", "badge": "AS-IS", "ref": "FL-07", "label": "Khách", "sub": "không đổi", "pos": null, "row": 0}, {"key": "s", "type": "start", "badge": "IMPACT", "ref": "SC-059", "label": "Mở bảng giá / tình trạng bán / chi tiết cửa hàng", "sub": "", "pos": 1, "row": 0}, {"key": "s1", "type": "step", "badge": "IMPACT", "ref": "SC-092", "label": "Xem danh sách sản phẩm", "sub": "không hiện sản phẩm đang bật hiển thị giới hạn", "pos": 2, "row": 0}, {"key": "e1", "type": "end", "badge": "IMPACT", "ref": "SC-092", "label": "Chỉ thấy sản phẩm thường — như hiện tại", "sub": "", "pos": 3, "row": 0, "result": "ok"}], "edges": [["a", "s", "", ""], ["s", "s1", "", ""], ["s1", "e1", "", ""]]}, {"lane": "FL-03", "title": "Thiết lập sản phẩm cho doanh nghiệp (use case có sẵn, quản trị)", "note": "CR-002.2 / CR-002.3 · sản phẩm tạo bằng 「商品管理」 hiện có (giá, lịch bán, mã Smaregi / OBIC) — chỉ thêm mục hiển thị giới hạn", "nodes": [{"key": "a", "type": "actor", "badge": "AS-IS", "ref": "FL-03", "label": "Super Admin / Admin", "sub": "không đổi", "pos": null, "row": 0}, {"key": "s", "type": "start", "badge": "UPD", "ref": "SC-035", "label": "Mở 「商品管理」 → tạo / sửa sản phẩm", "sub": "", "pos": 1, "row": 0}, {"key": "s1", "type": "step", "badge": "UPD", "ref": "SC-036", "label": "Bật 「Hiển thị giới hạn」 và lưu", "sub": "Option: chọn trang hiển thị", "pos": 2, "row": 0}, {"key": "d", "type": "decision", "badge": "UPD", "ref": "SC-036", "label": "Option: đã chọn trang?", "sub": "", "pos": 3, "row": 0}, {"key": "e1", "type": "end", "badge": "UPD", "ref": "SC-035", "label": "Danh sách sản phẩm hiện nhãn giới hạn", "sub": "", "pos": 4, "row": 0, "result": "ok"}, {"key": "ng", "type": "ng", "badge": "UPD", "ref": "SC-036", "label": "Chưa chọn trang → báo lỗi dưới mục", "sub": "「掲載先ページを選択してください」(đề xuất)", "pos": 3, "row": 1}, {"key": "e2", "type": "end", "badge": "UPD", "ref": "SC-036", "label": "Không lưu được, ở lại form", "sub": "", "pos": 4, "row": 1, "result": "fail"}, {"key": "x1", "type": "edge", "badge": "NEW", "ref": "IMP-034", "label": "Option: quản lý nhiều trang giới hạn A / B / C", "sub": "", "pos": null, "row": 0}], "edges": [["a", "s", "", ""], ["s", "s1", "", ""], ["s1", "d", "", ""], ["d", "e1", "Đã chọn", ""], ["d", "ng", "Chưa", "ng"], ["ng", "e2", "", "ng"]]}], "tech": [{"badge": "UPD", "ref": "API-107", "label": "Danh sách sản phẩm", "sub": "lọc sản phẩm giới hạn theo trang"}, {"badge": "UPD", "ref": "API-075", "label": "Lịch chỗ trống", "sub": "lấy 30 ngày · bỏ sản phẩm giới hạn ở kết quả trả về"}, {"badge": "UPD", "ref": "API-050", "label": "Lưu sản phẩm (tạo / sửa)", "sub": "lưu thêm mục hiển thị giới hạn"}, {"badge": "IMPACT", "ref": "API-074", "label": "Hàm lấy vé theo chỗ trống (dùng chung)", "sub": "đặt trong ngày, tác vụ tự động, POS dùng chung — giữ nguyên"}, {"badge": "NEW", "ref": "column:tickets.limited_public", "label": "Cột hiển thị giới hạn", "sub": "đúng / sai, mặc định sai"}, {"badge": "IMPACT", "ref": "EXT-001", "label": "GMO Payment Gateway", "sub": "sản phẩm giới hạn thanh toán như vé thường — kiểm lại"}, {"badge": "IMPACT", "ref": "EXT-006", "label": "Smaregi POS", "sub": "mã Smaregi / OBIC nhập ở 「商品管理」 như vé thường"}], "redraw": true, "only_cr2": false};
const {page, s:old} = await section();
if (old && !D.redraw) return {error: "section da ton tai — xoa section cu (cua chinh lan chay nay) hoac doi ten truoc khi ve lai (hoac --redraw cr1,cr2)"};
const created=[];
let s = old;
if (!s) {
s = figma.createSection(); s.name = SECTION_NAME; s.x = 16640; s.y = 0; page.appendChild(s);
T(s, SECTION_NAME, 40, 30, 2200, 32, 700);
T(s, D.subtitle, 40, 80, 2200, 14, 400, "#57606A");
// Legend
const lg = F(s, "LEGEND · badge", 40, 120, 1180, 64, "#FFFFFF"); lg.strokes=[paint("#D0D7DE")]; lg.cornerRadius=8;
lg.setSharedPluginData(NS,"kind","legend");
let lx=16; for (const [b,txt] of [["NEW","Tạo mới"],["UPD","Sửa cái đang có"],["DEL","Bỏ"],["IMPACT","Không sửa — bị kéo theo, kiểm lại"],["AS-IS","Giữ nguyên, ngữ cảnh"]]) {
  const sw=F(lg,"sw-"+b,lx,18,28,28,BADGE[b].f); sw.strokes=[paint(BADGE[b].s)]; sw.strokeWeight=2; if(BADGE[b].d) sw.dashPattern=[4,3]; if(BADGE[b].o) sw.opacity=BADGE[b].o; sw.cornerRadius=6;
  T(lg, b+" — "+txt, lx+36, 22, null, 12, 700, BADGE[b].s); lx += 36 + (b==="IMPACT"?300:180); }
T(lg, "NG / ⚠ popup lỗi = vạch đỏ bên trái · ◇ = rẽ nhánh · ▶ = điểm vào", lx, 22, null, 12, 500, "#CF222E");
}
if (D.only_cr2) return {section: s.id, created: 0, skipped: "CR-1"};
// CR-1 Flow — dang USE CASE: 1 lane = 1 use case (Actor → duong di happy → ket thuc; non-happy hang duoi)
const fr = F(s, "CR-1 Flow — use case bị CR chạm (format Output 1)", 40, 220, 2280, 400, "#FFFFFF");
fr.strokes=[paint("#D0D7DE")]; fr.cornerRadius=12;
T(fr, "CR-1 — Use case thay đổi (Output 1 · mỗi lane = 1 use case: Actor → đường đi → kết thúc · non-happy ở hàng dưới) + TECHNOLOGY bên phải", 40, 24, 1700, 22, 700);
T(fr, D.flow_note, 40, 54, 1700, 12, 400, "#57606A");
const X0 = 230, DXP = 250, NWP = 210, RH = 112;
T(fr, "ACTOR", 42, 90, null, 12, 700, "#57606A");
T(fr, "ĐƯỜNG ĐI — HAPPY CASE (trái → phải) → ✓ KẾT THÚC  ·  hàng dưới: NON-HAPPY CASE → ✗ KẾT THÚC", X0, 90, 1500, 12, 700, "#57606A");
R(fr, 40, 109, 1730, 2, "#1F2328");
let y = 130;
for (const L of D.flows) {
  T(fr, L.lane + " · " + L.title, 40, y, 1700, 16, 700, "#0969DA");
  T(fr, L.note + (L.no_ng ? "   ·   Non-happy: N/A — " + L.no_ng : ""), 40, y+22, 1700, 12, 400, L.no_ng ? "#CF222E" : "#57606A");
  const top = y + 56; const nodes = {}; let maxRow = 0;
  for (const n of L.nodes) { if (n.type==="edge") continue; n._grp = L.lane;
    const row = n.row || 0; maxRow = Math.max(maxRow, row);
    let f;
    if (n.type === "actor") f = badgeBox(fr, n, 40, top, 160, 84, "flow", "actor");
    else f = badgeBox(fr, n, X0 + (n.pos-1)*DXP, top + row*RH, NWP, 84, "flow",
      n.type==="decision" ? "decision" : (n.type==="ng" ? "ng" : (n.type==="end" ? "end" : (n.type==="start" ? "pill" : null))));
    if (n.type==="end") { f.strokeWeight = 3; if (n.result==="fail") f.strokes=[paint("#CF222E")]; }
    nodes[n.key] = f; created.push(f.id);
  }
  for (let r=1; r<=maxRow; r++) { const t=T(fr, "Non-happy", 40, top + r*RH + 34, 160, 11, 700, "#CF222E"); t.name="row-label"; }
  for (const [a,b,lab,st] of L.edges) if (nodes[a] && nodes[b]) created.push(arrow(fr, nodes[a], nodes[b], lab, st).id);
  let lb = 0; for (const k in nodes) lb = Math.max(lb, nodes[k].y + nodes[k].height);
  const ex = L.nodes.filter(n=>n.type==="edge");
  if (ex.length) { const ey = lb + 46; T(fr, "CHƯA CHỐT (To verify) — không vẽ vào đường đi", X0, ey - 20, 600, 11, 700, "#6639BA");
    ex.forEach((n,i)=>{ n._grp = L.lane; const f = badgeBox(fr, n, X0 + i*(NWP+40)*1.5, ey, NWP*1.5, 64, "edge"); created.push(f.id); lb = Math.max(lb, f.y+f.height); }); }
  y = lb + 50;
  R(fr, 40, y, 1730, 1, "#D0D7DE"); y += 50;
}
// Phan B Technology (chi cong nghe bi cham)
T(fr, "TECHNOLOGY — thay đổi / bị ảnh hưởng", 1800, 90, 460, 13, 700, "#F4860C");
let ty = 120;
for (const n of D.tech) { const f = badgeBox(fr, n, 1800, ty, 460, 64, "tech"); created.push(f.id); ty = f.y + f.height + 12; }
fr.resize(2280, Math.max(y, ty) + 20);
fit(s);
return {section: s.id, flow: fr.id, created: created.length, bottom: fr.y + fr.height};
