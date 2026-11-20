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


const D = {"note": "Chỉ màn có dòng Impact + màn dẫn tới (AS-IS). Mỗi node đúng 1 badge; NG vẽ inline; case chưa chốt → panel Edge/Exceptional.", "sites": [{"site": "WEB-01", "label": "管理画面 (WEB-01)", "groups": [{"id": "G-CR1", "title": "Quản trị Coupon (admin)", "site": "WEB-01", "note": "CR-007.2 · nhân viên vận hành cấu hình coupon + xem lịch sử", "nodes": [{"key": "s", "type": "start", "badge": "AS-IS", "ref": "SC-001", "label": "Menu admin (ダッシュボード)"}, {"key": "n1", "type": "screen", "badge": "NEW", "ref": "IMP-001", "label": "[WEB-01] クーポン一覧", "stype": "List", "desc": "Danh sách + filter + bật/dừng tiếp nhận"}, {"key": "n2", "type": "screen", "badge": "NEW", "ref": "IMP-002", "label": "[WEB-01] クーポン作成 / 編集", "stype": "Form", "desc": "Nhập cấu hình coupon"}, {"key": "n3", "type": "screen", "badge": "NEW", "ref": "IMP-003", "label": "[WEB-01] クーポン詳細 + 履歴", "stype": "Detail", "desc": "Xem + sao chép mã + 2 tab lịch sử"}, {"key": "pop1", "type": "popup", "badge": "NEW", "ref": "IMP-002", "parent": "n2", "display": "Modal", "trigger": "Submit form có mã trùng", "msg": "このクーポンコードは既に存在します (đề xuất)", "next": "Giữ màn form, focus ô mã", "label": "Modal · Submit form có mã trùng"}, {"key": "pop2", "type": "popup", "badge": "NEW", "ref": "IMP-038", "parent": "n1", "display": "Popup", "trigger": "Bấm 「受付停止」", "msg": "受付を停止します。既に登録済みのクーポンは引き続き利用可能です。よろしいですか？ (đề xuất)", "next": "Xác nhận → gọi toggle-accept", "label": "Popup · Bấm 「受付停止」"}, {"key": "t", "type": "terminal", "badge": "NEW", "ref": "IMP-001", "label": "Coupon 公開 → user có thể đăng ký"}], "edges": [["s", "n1", "", ""], ["n1", "n2", "Tạo mới", ""], ["n1", "n3", "Xem chi tiết", ""], ["n1", "pop2", "Dừng tiếp nhận", ""], ["n2", "pop1", "Trùng mã", "ng"], ["n3", "t", "", ""]], "pos": {"s": [0, 0], "n1": [1, 0], "n2": [2, 0], "pop1": [3, 0], "n3": [2, 1], "t": [3, 1], "pop2": [2, 2]}}, {"id": "G-CR2", "title": "Admin barcode scanner — xem coupon trước khi ra POS", "site": "WEB-01", "note": "CR-007.4 R6 · nhân viên kiểm trạng thái coupon", "nodes": [{"key": "s", "type": "start", "badge": "AS-IS", "ref": "SC-001", "label": "Quầy vận hành"}, {"key": "n1", "type": "screen", "badge": "UPD", "ref": "IMP-009", "label": "[WEB-01] バーコード読み取り (SC-003)", "stype": "Dashboard", "desc": "Thêm badge coupon đã áp dụng", "base": "SC-003"}, {"key": "pop1", "type": "popup", "badge": "UPD", "ref": "IMP-009", "parent": "n1", "display": "Toast", "trigger": "Quét booking có coupon", "msg": "クーポン適用済み：500円引き (hiển thị thực tế)", "next": "Ẩn sau 3s", "label": "Toast · Quét booking có coupon"}, {"key": "t", "type": "terminal", "badge": "UPD", "ref": "IMP-032", "label": "Ra POS với subtotalDiscountPrice"}], "edges": [["s", "n1", "", ""], ["n1", "pop1", "Có coupon", ""], ["n1", "t", "", ""]], "pos": {"s": [0, 0], "n1": [1, 0], "pop1": [2, 0], "t": [2, 1]}}], "index": [["IMP-001", "[WEB-01] クーポン一覧", "List", "Danh sách + filter + bật/dừng tiếp nhận", "WEB-01", "NEW"], ["IMP-002", "[WEB-01] クーポン作成 / 編集", "Form", "Nhập cấu hình coupon", "WEB-01", "NEW"], ["IMP-003", "[WEB-01] クーポン詳細 + 履歴", "Detail", "Xem + sao chép mã + 2 tab lịch sử", "WEB-01", "NEW"], ["IMP-002", "Modal · Submit form có mã trùng", "Modal", "このクーポンコードは既に存在します (đề xuất)", "WEB-01", "NEW"], ["IMP-038", "Popup · Bấm 「受付停止」", "Popup", "受付を停止します。既に登録済みのクーポンは引き続き利用可能です。よろしいですか？ (đề xuất)", "WEB-01", "NEW"], ["IMP-009", "[WEB-01] バーコード読み取り (SC-003)", "Dashboard", "Thêm badge coupon đã áp dụng", "WEB-01", "UPD"], ["IMP-009", "Toast · Quét booking có coupon", "Toast", "クーポン適用済み：500円引き (hiển thị thực tế)", "WEB-01", "UPD"]], "errs": [["E-01", "n2", "Modal", "Submit form có mã trùng", "このクーポンコードは既に存在します (đề xuất)", "Giữ màn form, focus ô mã", "NEW", "IMP-002"], ["E-02", "n1", "Popup", "Bấm 「受付停止」", "受付を停止します。既に登録済みのクーポンは引き続き利用可能です。よろしいですか？ (đề xuất)", "Xác nhận → gọi toggle-accept", "NEW", "IMP-038"], ["E-03", "n1", "Toast", "Quét booking có coupon", "クーポン適用済み：500円引き (hiển thị thực tế)", "Ẩn sau 3s", "UPD", "IMP-009"]], "main": 4}, {"site": "WEB-02", "label": "予約サイト (WEB-02)", "groups": [{"id": "G-CR3", "title": "MyPage — xem + đăng ký + chọn coupon (user)", "site": "WEB-02", "note": "CR-007.1 · CR-007.3 · khách tự nhập mã + xem danh sách + chọn khi đặt chỗ", "nodes": [{"key": "s", "type": "start", "badge": "AS-IS", "ref": "SC-048", "label": "MyPage menu"}, {"key": "n1", "type": "screen", "badge": "NEW", "ref": "IMP-004", "label": "[WEB-02] MyPage — クーポン一覧", "stype": "List", "desc": "Danh sách + nút nhập mã mới"}, {"key": "n2", "type": "screen", "badge": "UPD", "ref": "IMP-007", "label": "[WEB-02] 予約履歴 (SC-048)", "stype": "List", "desc": "Thẻ booking có badge coupon", "base": "SC-048"}, {"key": "n3", "type": "screen", "badge": "UPD", "ref": "IMP-008", "label": "[WEB-02] 予約詳細 (SC-049)", "stype": "Detail", "desc": "Thêm section クーポン情報", "base": "SC-049"}, {"key": "pop1", "type": "popup", "badge": "NEW", "ref": "IMP-004", "parent": "n1", "display": "Modal", "trigger": "Bấm 「コードを入力」", "msg": "コードを入力してください (popup đăng ký mã)", "next": "Nhập mã → gọi API register", "label": "Modal · Bấm 「コードを入力」"}, {"key": "pop2", "type": "popup", "badge": "NEW", "ref": "IMP-013", "parent": "pop1", "display": "Inline", "trigger": "Mã không hợp lệ / hết số / hết hạn / đã đăng ký", "msg": "このコードはご利用いただけません：<lý do> (đề xuất)", "next": "Giữ popup, cho nhập lại", "label": "Inline · Mã không hợp lệ / hết số / hết hạn / đã "}], "edges": [["s", "n1", "", ""], ["s", "n2", "", ""], ["n2", "n3", "Vào chi tiết", ""], ["n1", "pop1", "Nhập mã", ""], ["pop1", "pop2", "Lỗi", "ng"]], "pos": {"s": [0, 0], "n1": [1, 0], "pop1": [2, 0], "pop2": [3, 0], "n2": [1, 1], "n3": [2, 1]}}, {"id": "G-CR4", "title": "Đặt chỗ — chọn coupon + thanh toán (user)", "site": "WEB-02", "note": "CR-007.4 · 2 chế độ nhập/chọn trên cả thanh toán online + đặt trong ngày", "nodes": [{"key": "s", "type": "start", "badge": "AS-IS", "ref": "SC-048", "label": "Mở trang đặt chỗ"}, {"key": "n1", "type": "screen", "badge": "UPD", "ref": "IMP-005", "label": "[WEB-02] オンライン決済 (SC-050)", "stype": "Form", "desc": "+ khối coupon 2 tab + 3 dòng giá", "base": "SC-050"}, {"key": "n2", "type": "screen", "badge": "UPD", "ref": "IMP-006", "label": "[WEB-02] 当日予約 (SC-032)", "stype": "Form", "desc": "+ khối coupon giống SC-050", "base": "SC-032"}, {"key": "d", "type": "decision", "badge": "UPD", "ref": "IMP-014", "label": "Validate coupon OK?"}, {"key": "sys", "type": "system", "badge": "UPD", "ref": "EXT-001", "label": "GMO 3DS + webhook"}, {"key": "pop1", "type": "popup", "badge": "UPD", "ref": "IMP-014", "parent": "n1", "display": "Inline", "trigger": "Coupon hết hạn / không áp dụng / đã dùng", "msg": "このクーポンは適用できません：<lý do> (đề xuất)", "next": "Huỷ áp dụng, tính lại tiền gốc", "label": "Inline · Coupon hết hạn / không áp dụng / đã dùng"}, {"key": "t", "type": "terminal", "badge": "UPD", "ref": "IMP-022", "label": "Đặt chỗ xong · coupon → 使用済み"}], "edges": [["s", "n1", "", ""], ["s", "n2", "", ""], ["n1", "d", "Chọn coupon", ""], ["n2", "d", "Chọn coupon", ""], ["d", "sys", "OK", ""], ["sys", "t", "Success", ""], ["d", "pop1", "Không áp dụng", "ng"]], "pos": {"s": [0, 0], "n1": [1, 0], "d": [2, 0], "sys": [3, 0], "t": [4, 0], "pop1": [3, 1], "n2": [1, 2]}}], "index": [["IMP-004", "[WEB-02] MyPage — クーポン一覧", "List", "Danh sách + nút nhập mã mới", "WEB-02", "NEW"], ["IMP-007", "[WEB-02] 予約履歴 (SC-048)", "List", "Thẻ booking có badge coupon", "WEB-02", "UPD"], ["IMP-008", "[WEB-02] 予約詳細 (SC-049)", "Detail", "Thêm section クーポン情報", "WEB-02", "UPD"], ["IMP-004", "Modal · Bấm 「コードを入力」", "Modal", "コードを入力してください (popup đăng ký mã)", "WEB-02", "NEW"], ["IMP-005", "[WEB-02] オンライン決済 (SC-050)", "Form", "+ khối coupon 2 tab + 3 dòng giá", "WEB-02", "UPD"], ["IMP-006", "[WEB-02] 当日予約 (SC-032)", "Form", "+ khối coupon giống SC-050", "WEB-02", "UPD"]], "errs": [["E-01", "n1", "Modal", "Bấm 「コードを入力」", "コードを入力してください (popup đăng ký mã)", "Nhập mã → gọi API register", "NEW", "IMP-004"], ["E-02", "pop1", "Inline", "Mã không hợp lệ / hết số / hết hạn / đã đăng ký", "このコードはご利用いただけません：<lý do> (đề xuất)", "Giữ popup, cho nhập lại", "NEW", "IMP-013"], ["E-03", "n1", "Inline", "Coupon hết hạn / không áp dụng / đã dùng", "このクーポンは適用できません：<lý do> (đề xuất)", "Huỷ áp dụng, tính lại tiền gốc", "UPD", "IMP-014"]], "main": 5}]};
const {page, s} = await section();
if (!s) return {error: "chua co section — chay 01 truoc"};
const created=[], frames=[];
const NW=230, NH=86, DX=280, DY=128;
for (const SD of D.sites) {
const y0 = bottom(s) + 120;
const sec = figma.createSection(); sec.name = "CR-2 Screen Flow · " + SD.label; s.appendChild(sec); sec.x = 40; sec.y = y0; sec.fills=[paint("#FFFFFF")];
sec.setSharedPluginData(NS,"kind","cr2-site"); sec.setSharedPluginData(NS,"site",SD.site);
T(sec, "CR-2 — Screen Flow · " + SD.label + " (site → flow / use case → section · Start ▶ · Screen · ◇ Decision · System · NG inline · ⚠ Popup / màn lỗi · Terminal · Edge/Exceptional)", 40, 30, 2600, 22, 700);
T(sec, D.note, 40, 62, 2600, 12, 400, "#57606A");
let sy = 110, maxW = 0;
for (const G of SD.groups) {
  // site -> flow / use case -> section: moi Group 1 Section con
  const gs = figma.createSection(); gs.name = "Flow " + G.id + " — " + G.title; sec.appendChild(gs); gs.x = 40; gs.y = sy; gs.fills=[paint("#F6F8FA")];
  gs.setSharedPluginData(NS,"kind","cr2-flow"); gs.setSharedPluginData(NS,"flow",G.id); gs.setSharedPluginData(NS,"site",SD.site);
  const fr = F(gs, "CR-2 Flow " + G.id + " — " + G.title, 40, 40, 2400, 400, "#FFFFFF");
  fr.strokes=[paint("#D0D7DE")]; fr.cornerRadius=12;
  let y = 24;
  T(fr, "Flow " + G.id + " — " + G.title, 40, y, 2200, 16, 700, "#0969DA");
  T(fr, (G.note||"") + (G.no_ng ? "   ·   Non-happy: N/A — " + G.no_ng : ""), 40, y+22, 2200, 12, 400, G.no_ng ? "#CF222E" : "#57606A");
  const top = y + 56; const nodes={}; let maxD=0, maxI=0;
  for (const n of G.nodes) { if (n.type==="edge") continue; n._grp = G.id;
    const [d,i] = G.pos[n.key]; maxD=Math.max(maxD,d); maxI=Math.max(maxI,i);
    const shape = n.type==="start" ? "pill" : (n.type==="decision" ? "decision" : (n.type==="ng" ? "ng" : (n.type==="popup" ? "popup" : null)));
    const w = n.type==="start" ? 200 : (n.type==="decision" ? 190 : NW), h = n.type==="decision" ? 64 : NH;
    const nn = (n.type==="screen" && n.stype) ? {...n, sub: "[" + n.stype + "] " + (n.desc || n.sub || "")} : ((n.type==="popup"||n.type==="ng") && n.msg ? {...n, sub: "「" + n.msg + "」" + (n.next ? " → " + n.next : "")} : n);
    const f = badgeBox(fr, nn, 40 + d*DX, top + i*DY, w, h, n.type==="screen"||n.type==="system"||n.type==="popup" ? "screen" : "flow-step", shape);
    if (n.type==="system") { f.fills=[paint("#E8F7EC")]; }
    nodes[n.key]=f; created.push(f.id); }
  for (const [a,b,lab,st] of G.edges) if (nodes[a] && nodes[b]) created.push(arrow(fr, nodes[a], nodes[b], lab, st).id);
  const ex = G.nodes.filter(n=>n.type==="edge");
  const px = 40 + (maxD+1)*DX + 40;
  if (ex.length) { T(fr, "EDGE / EXCEPTIONAL — chưa chốt, không vẽ inline", px, top-20, 420, 11, 700, "#6639BA");
    let ey = top; ex.forEach((n)=>{ n._grp = G.id; const f=badgeBox(fr, n, px, ey, 420, 74, "edge"); created.push(f.id); nodes["_e"+ey]=f; ey = f.y + f.height + 12; }); }
  let gb = top, gr = 0; for (const c of fr.children) { gb = Math.max(gb, c.y + c.height); gr = Math.max(gr, c.x + c.width); }
  fr.resize(Math.max(1200, gr + 40), gb + 40);
  gs.resizeWithoutConstraints(fr.width + 80, fr.height + 80);
  maxW = Math.max(maxW, gs.width); sy = gs.y + gs.height + 60;
}
// ④ / ⑦ cua site — frame rieng ben phai cac section flow
const IW = 980, ix0 = 40 + maxW + 60;
const fr = F(sec, "CR-2 Index — " + SD.label, ix0, 110, IW + 80, 400, "#FFFFFF"); fr.strokes=[paint("#D0D7DE")]; fr.cornerRadius=12;
const ix = 40;
T(fr, "④ SCREEN INDEX — " + SD.label + " (gồm cả popup / màn lỗi)", ix, 24, IW, 14, 700, "#0969DA");
const st = T(fr, "TỔNG = " + SD.main + " màn chính + " + (SD.index.length - SD.main) + " popup / màn lỗi = " + SD.index.length, ix, 46, IW, 12, 700, "#1F2328"); st.name = "IDX-TOTAL";
st.setSharedPluginData(NS,"kind","idx-total"); st.setSharedPluginData(NS,"value",String(SD.index.length));
let iy = 70;
const IC = [["#",28],["Ref",90],["Màn hình",230],["Loại",80],["Mô tả chức năng màn hình",370],["Site",62],["Badge",90]];
function hdrRow(cols, yy, fill){ const h=F(fr,"idx-header",ix,yy,IW,28,fill); let x=6; for(const [c,w] of cols){ T(h,c,x,7,w-6,11,700); x+=w; } return 28; }
iy += hdrRow(IC, iy, "#DAEEF3");
SD.index.forEach((r,k)=>{ const [ref,lab,typ,desc,site,b]=r; const vals=[String(k+1),ref,lab,typ,desc,site,b];
  const row=F(fr,"IDX · "+ref+" · "+typ, ix, iy, IW, 30, typ==="Modal"||typ==="Popup"||typ==="Toast"||typ==="Banner"||typ==="Full screen" ? "#FFF6F5" : BADGE[b].f);
  row.setSharedPluginData(NS,"kind","idx"); row.setSharedPluginData(NS,"type",typ); row.setSharedPluginData(NS,"ref",ref);
  let x=6, hmax=30; vals.forEach((v,c)=>{ const t=T(row,v,x,7,IC[c][1]-8,10,c===1||c===6||c===3?700:400, c===1||c===6?BADGE[b].s:(c===3&&row.fills[0].color.r>0.99?"#CF222E":"#1F2328")); hmax=Math.max(hmax,t.height+14); x+=IC[c][1]; });
  row.resize(IW,hmax); iy+=hmax; });
iy += 40;
T(fr, "⑦ ERROR / POPUP INDEX — " + SD.label + " (message thật hoặc đề xuất)", ix, iy, IW, 14, 700, "#CF222E"); iy += 26;
const EC = [["E-ID",50],["Màn cha",90],["Hiển thị",80],["Trigger",210],["Message",330],["Đi đâu sau đó",150],["Badge",70]];
iy += hdrRow(EC, iy, "#FFE3E3");
for (const e of SD.errs) { const [eid,par,disp,trg,msg,nxt,b,ref]=e; const vals=[eid,par,disp,trg,msg,nxt,b];
  const row=F(fr,"ERRIDX · "+eid+" · "+ref, ix, iy, IW, 30, "#FFFBFB"); row.strokes=[paint("#FFD7D5")];
  row.setSharedPluginData(NS,"kind","erridx");
  let x=6, hmax=30; vals.forEach((v,c)=>{ const t=T(row,v||"—",x,7,EC[c][1]-8,10,c===0||c===2?700:400, c===0?"#CF222E":"#1F2328"); hmax=Math.max(hmax,t.height+14); x+=EC[c][1]; });
  row.resize(IW,hmax); iy+=hmax; }
fr.resize(IW + 80, iy + 30);
sec.resizeWithoutConstraints(fr.x + fr.width + 80, Math.max(sy, fr.y + fr.height + 60));
frames.push(sec.id);
}
fit(s);
return {sections: frames, created: created.length};
