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


const D = {"note": "Chỉ màn có dòng Impact + màn dẫn tới (AS-IS). ①-A / ①-B chọn 1. Option = CR-002.3. Message (thật) = có trong hệ thống; (đề xuất) = chờ chốt.", "groups": [{"id": "G-CR1", "title": "Mua trước — lịch thu gọn ①", "site": "WEB-02", "note": "CR-002.1 (①-B; ①-A ở panel EDGE)", "nodes": [{"key": "s", "type": "start", "badge": "AS-IS", "ref": "SC-066", "label": "Vào từ 店舗一覧"}, {"key": "n67", "type": "screen", "badge": "UPD", "ref": "SC-067", "label": "店舗詳細", "sub": "lịch 7 ngày / sản phẩm", "stype": "Detail", "desc": "Lịch đặt trước: mặc định 7 ngày, もっと見る → 1 tháng"}, {"key": "d", "type": "decision", "badge": "IMPACT", "ref": "API-075", "label": "Tải 30 ngày OK?"}, {"key": "n50", "type": "screen", "badge": "UPD", "ref": "SC-050", "label": "1DAYパス事前購入 (form mua trước)", "sub": "giữ ngày đã chọn", "stype": "Form", "desc": "Chọn ngày từ lịch đã thu gọn / mở rộng"}, {"key": "ng", "type": "ng", "badge": "IMPACT", "ref": "API-075", "label": "Lỗi tải lịch 1 tháng", "display": "Toast", "parent": "SC-067", "trigger": "API-075 lỗi khi bookingDays = 30", "msg": "「システムエラーが発生しました。…」(thật)", "next": "giữ lịch 7 ngày"}, {"key": "p1", "type": "ng", "badge": "UPD", "ref": "SC-050", "label": "Ngày đã 完売", "display": "Inline", "parent": "SC-050", "trigger": "Chọn ngày đã hết chỗ", "msg": "「完売しましたので、他の日程を選択してください」(thật)", "next": "chọn ngày khác"}, {"key": "e1", "type": "edge", "badge": "UPD", "ref": "IMP-007", "label": "①-A: mặc định đóng lịch — chọn 1 trong ①-A / ①-B"}, {"key": "n44", "type": "screen", "badge": "IMPACT", "ref": "SC-044", "label": "空き状況 (admin)", "sub": "không thu gọn", "stype": "List", "desc": "Dùng chung component — giữ lịch mở"}], "edges": [["s", "n67", "", ""], ["n67", "d", "もっと見る", ""], ["d", "n50", "YES · chọn ngày", ""], ["d", "ng", "NO", "ng"], ["n50", "p1", "完売", "ng"], ["n67", "n44", "component dùng chung", ""]], "pos": {"s": [0, 0], "n67": [1, 0], "d": [2, 0], "n50": [3, 0], "p1": [4, 0], "ng": [3, 1], "n44": [2, 2]}}, {"id": "G-CR2", "title": "Trang 限定公開 → mua sản phẩm 法人向け", "site": "WEB-02", "note": "CR-002.2 · Option: hiển thị theo trang", "nodes": [{"key": "s", "type": "start", "badge": "NEW", "ref": "IMP-022", "label": "Mở URL 限定公開 (khách doanh nghiệp)"}, {"key": "d", "type": "decision", "badge": "NEW", "ref": "IMP-022", "label": "Khoá URL hợp lệ?"}, {"key": "n16", "type": "screen", "badge": "NEW", "ref": "IMP-016", "label": "限定公開ページ", "sub": "法人向け商品", "stype": "List", "desc": "Chọn 施設 → lịch 事前 (áp dụng ①) + vé 当日 của sản phẩm 限定公開"}, {"key": "n50", "type": "screen", "badge": "UPD", "ref": "SC-050", "label": "1DAYパス事前購入", "sub": "mua trước · GMO", "stype": "Form", "desc": "Nhận khoá → API-107 trả sản phẩm 限定公開"}, {"key": "n54", "type": "screen", "badge": "UPD", "ref": "SC-054", "label": "当日利用 (今から利用する)", "sub": "mua trong ngày", "stype": "Form", "desc": "Nhận khoá → API-107 / 075 trả sản phẩm 限定公開"}, {"key": "ng", "type": "ng", "badge": "NEW", "ref": "IMP-016", "label": "Khoá sai → 404", "display": "Full screen", "parent": "IMP-016", "trigger": "Khoá URL sai / trang đã dừng (Option)", "msg": "「ページが見つかりません」(đề xuất)", "next": "không hiện sản phẩm"}, {"key": "p1", "type": "ng", "badge": "NEW", "ref": "IMP-016", "label": "Không có sản phẩm 限定公開", "display": "Inline", "parent": "IMP-016", "trigger": "Chưa có sản phẩm nào bật 限定公開", "msg": "「現在ご購入いただける商品はありません」(đề xuất)", "next": "ở lại trang"}, {"key": "e1", "type": "edge", "badge": "NEW", "ref": "IMP-022", "label": "1 URL chung hay 1 URL / 施設? — CQ-005"}], "edges": [["s", "d", "", ""], ["d", "n16", "YES", ""], ["d", "ng", "NO", "ng"], ["n16", "n50", "事前", ""], ["n16", "n54", "当日", ""], ["n16", "p1", "trống", "ng"]], "pos": {"s": [0, 0], "d": [1, 0], "n16": [2, 0], "n50": [3, 0], "n54": [3, 1], "p1": [3, 2], "ng": [2, 3]}}, {"id": "G-CR3", "title": "Trang thường — ẩn sản phẩm 限定公開", "site": "WEB-02", "note": "CR-002.2", "no_ng": "Không có màn lỗi mới: các màn chỉ bớt sản phẩm 限定公開 khỏi danh sách", "nodes": [{"key": "s", "type": "start", "badge": "AS-IS", "ref": "SC-066", "label": "Vào từ TOP / menu"}, {"key": "n67", "type": "screen", "badge": "IMPACT", "ref": "SC-067", "label": "店舗詳細", "sub": "", "stype": "Detail", "desc": "Không hiện sản phẩm 限定公開"}, {"key": "n59", "type": "screen", "badge": "IMPACT", "ref": "SC-059", "label": "料金プラン", "sub": "", "stype": "List", "desc": "Không hiện sản phẩm 限定公開"}, {"key": "n92", "type": "screen", "badge": "IMPACT", "ref": "SC-092", "label": "待ち時間/販売状況", "sub": "", "stype": "List", "desc": "Không hiện sản phẩm 限定公開"}, {"key": "n48", "type": "screen", "badge": "IMPACT", "ref": "SC-048", "label": "フリーパス購入", "sub": "", "stype": "Form", "desc": "Danh sách sản phẩm không có 限定公開"}, {"key": "n49", "type": "screen", "badge": "IMPACT", "ref": "SC-049", "label": "回数券購入", "sub": "", "stype": "Form", "desc": "Danh sách sản phẩm không có 限定公開"}], "edges": [["s", "n67", "", ""], ["s", "n59", "", ""], ["s", "n92", "", ""], ["s", "n48", "", ""], ["s", "n49", "", ""]], "pos": {"s": [0, 0], "n67": [1, 0], "n59": [1, 1], "n92": [1, 2], "n48": [1, 3], "n49": [1, 4]}}, {"id": "G-CR4", "title": "Thiết lập sản phẩm 限定公開 (admin)", "site": "WEB-01", "note": "CR-002.2 · Option CR-002.3", "nodes": [{"key": "s", "type": "start", "badge": "AS-IS", "ref": "SC-001", "label": "Menu admin › 商品管理"}, {"key": "n35", "type": "screen", "badge": "UPD", "ref": "SC-035", "label": "商品管理 — 一覧", "sub": "", "stype": "List", "desc": "Cột 公開設定: 通常公開 / 限定公開"}, {"key": "n36", "type": "screen", "badge": "UPD", "ref": "SC-036", "label": "商品管理 — 登録", "sub": "", "stype": "Form", "desc": "Radio 限定公開 ON / OFF (Option: chọn 掲載先ページ)"}, {"key": "n37", "type": "screen", "badge": "UPD", "ref": "SC-037", "label": "商品管理 — 編集", "sub": "", "stype": "Form", "desc": "Cùng form SC-036"}, {"key": "n38", "type": "screen", "badge": "UPD", "ref": "SC-038", "label": "商品管理 — 詳細", "sub": "", "stype": "Detail", "desc": "Hiện 公開設定"}, {"key": "n34", "type": "screen", "badge": "NEW", "ref": "IMP-034", "label": "限定公開ページ管理 (Option)", "sub": "", "stype": "List", "desc": "Danh sách / tạo / sửa / dừng trang, copy URL"}, {"key": "ng", "type": "ng", "badge": "UPD", "ref": "SC-036", "label": "Chưa chọn 掲載先ページ (Option)", "display": "Inline", "parent": "SC-036", "trigger": "限定公開 nhưng không chọn trang", "msg": "「掲載先ページを選択してください」(đề xuất)", "next": "ở lại form"}, {"key": "p1", "type": "popup", "badge": "NEW", "ref": "IMP-037", "label": "Dừng trang đang có sản phẩm", "display": "Modal", "parent": "IMP-034", "trigger": "Bấm 公開停止 trên trang còn sản phẩm", "msg": "「このページを停止すると掲載中の商品は表示されなくなります。よろしいですか？」(đề xuất)", "next": "OK → dừng / キャンセル"}], "edges": [["s", "n35", "", ""], ["n35", "n36", "新規作成", ""], ["n35", "n37", "✎", ""], ["n35", "n38", "👁", ""], ["s", "n34", "Option", ""], ["n36", "ng", "thiếu trang", "ng"], ["n34", "p1", "公開停止", "ng"]], "pos": {"s": [0, 0], "n35": [1, 0], "n36": [2, 0], "ng": [3, 0], "n37": [2, 1], "n38": [2, 2], "n34": [1, 3], "p1": [2, 3]}}], "index": [["SC-067", "店舗詳細", "Detail", "Lịch đặt trước: mặc định 7 ngày, もっと見る → 1 tháng", "WEB-02", "UPD"], ["SC-050", "1DAYパス事前購入 (form mua trước)", "Form", "Chọn ngày từ lịch đã thu gọn / mở rộng", "WEB-02", "UPD"], ["API-075", "Lỗi tải lịch 1 tháng", "Toast", "「システムエラーが発生しました。…」(thật)", "WEB-02", "IMPACT"], ["SC-044", "空き状況 (admin)", "List", "Dùng chung component — giữ lịch mở", "WEB-02", "IMPACT"], ["IMP-016", "限定公開ページ", "List", "Chọn 施設 → lịch 事前 (áp dụng ①) + vé 当日 của sản phẩm 限定公開", "WEB-02", "NEW"], ["SC-050", "1DAYパス事前購入", "Form", "Nhận khoá → API-107 trả sản phẩm 限定公開", "WEB-02", "UPD"], ["SC-054", "当日利用 (今から利用する)", "Form", "Nhận khoá → API-107 / 075 trả sản phẩm 限定公開", "WEB-02", "UPD"], ["IMP-016", "Khoá sai → 404", "Full screen", "「ページが見つかりません」(đề xuất)", "WEB-02", "NEW"], ["SC-059", "料金プラン", "List", "Không hiện sản phẩm 限定公開", "WEB-02", "IMPACT"], ["SC-092", "待ち時間/販売状況", "List", "Không hiện sản phẩm 限定公開", "WEB-02", "IMPACT"], ["SC-048", "フリーパス購入", "Form", "Danh sách sản phẩm không có 限定公開", "WEB-02", "IMPACT"], ["SC-049", "回数券購入", "Form", "Danh sách sản phẩm không có 限定公開", "WEB-02", "IMPACT"], ["SC-035", "商品管理 — 一覧", "List", "Cột 公開設定: 通常公開 / 限定公開", "WEB-01", "UPD"], ["SC-036", "商品管理 — 登録", "Form", "Radio 限定公開 ON / OFF (Option: chọn 掲載先ページ)", "WEB-01", "UPD"], ["SC-037", "商品管理 — 編集", "Form", "Cùng form SC-036", "WEB-01", "UPD"], ["SC-038", "商品管理 — 詳細", "Detail", "Hiện 公開設定", "WEB-01", "UPD"], ["IMP-034", "限定公開ページ管理 (Option)", "List", "Danh sách / tạo / sửa / dừng trang, copy URL", "WEB-01", "NEW"], ["IMP-037", "Dừng trang đang có sản phẩm", "Modal", "「このページを停止すると掲載中の商品は表示されなくなります。よろしいですか？」(đề xuất)", "WEB-01", "NEW"]], "errs": [["E-01", "SC-067", "Toast", "API-075 lỗi khi bookingDays = 30", "「システムエラーが発生しました。…」(thật)", "giữ lịch 7 ngày", "IMPACT", "API-075"], ["E-02", "SC-050", "Inline", "Chọn ngày đã hết chỗ", "「完売しましたので、他の日程を選択してください」(thật)", "chọn ngày khác", "UPD", "SC-050"], ["E-03", "IMP-016", "Full screen", "Khoá URL sai / trang đã dừng (Option)", "「ページが見つかりません」(đề xuất)", "không hiện sản phẩm", "NEW", "IMP-016"], ["E-04", "IMP-016", "Inline", "Chưa có sản phẩm nào bật 限定公開", "「現在ご購入いただける商品はありません」(đề xuất)", "ở lại trang", "NEW", "IMP-016"], ["E-05", "SC-036", "Inline", "限定公開 nhưng không chọn trang", "「掲載先ページを選択してください」(đề xuất)", "ở lại form", "UPD", "SC-036"], ["E-06", "IMP-034", "Modal", "Bấm 公開停止 trên trang còn sản phẩm", "「このページを停止すると掲載中の商品は表示されなくなります。よろしいですか？」(đề xuất)", "OK → dừng / キャンセル", "NEW", "IMP-037"]], "main": 15};
const {page, s} = await section();
if (!s) return {error: "chua co section — chay 01 truoc"};
const created=[];
const y0 = bottom(s) + 120;
const fr = F(s, "CR-2 Screen Flow — màn bị CR chạm (format Output 2)", 40, y0, 3000, 400, "#FFFFFF");
fr.strokes=[paint("#D0D7DE")]; fr.cornerRadius=12;
T(fr, "CR-2 — Screen Flow thay đổi (Output 2 · Group · Start ▶ · Screen · ◇ Decision · System · NG inline · ⚠ Popup / màn lỗi · Terminal · Edge/Exceptional)", 40, 24, 2300, 22, 700);
T(fr, D.note, 40, 54, 2300, 12, 400, "#57606A");
const NW=230, NH=86, DX=280, DY=128;
let y = 100;
for (const G of D.groups) {
  T(fr, "Group " + G.id + " — " + G.title + "  (" + G.site + ")", 40, y, 2200, 16, 700, "#0969DA");
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
  let gb = top; for (const k in nodes) gb = Math.max(gb, nodes[k].y + nodes[k].height);
  y = gb + 70; R(fr, 40, y, 2300, 1, "#D0D7DE"); y += 60;
}
let maxR = 0; for (const c of fr.children) maxR = Math.max(maxR, c.x + c.width);
const ix = Math.max(2420, maxR + 60), IW = 980;
// ④ Screen Index
T(fr, "④ SCREEN INDEX — phạm vi CR (gồm cả popup / màn lỗi)", ix, 100, IW, 14, 700, "#0969DA");
const st = T(fr, "TỔNG = " + D.main + " màn chính + " + (D.index.length - D.main) + " popup / màn lỗi = " + D.index.length, ix, 122, IW, 12, 700, "#1F2328"); st.name = "IDX-TOTAL";
st.setSharedPluginData(NS,"kind","idx-total"); st.setSharedPluginData(NS,"value",String(D.index.length));
let iy = 146;
const IC = [["#",28],["Ref",90],["Màn hình",230],["Loại",80],["Mô tả chức năng màn hình",370],["Site",62],["Badge",90]];
function hdrRow(cols, yy, fill){ const h=F(fr,"idx-header",ix,yy,IW,28,fill); let x=6; for(const [c,w] of cols){ T(h,c,x,7,w-6,11,700); x+=w; } return 28; }
iy += hdrRow(IC, iy, "#DAEEF3");
D.index.forEach((r,k)=>{ const [ref,lab,typ,desc,site,b]=r; const vals=[String(k+1),ref,lab,typ,desc,site,b];
  const row=F(fr,"IDX · "+ref+" · "+typ, ix, iy, IW, 30, typ==="Modal"||typ==="Popup"||typ==="Toast"||typ==="Banner"||typ==="Full screen" ? "#FFF6F5" : BADGE[b].f);
  row.setSharedPluginData(NS,"kind","idx"); row.setSharedPluginData(NS,"type",typ); row.setSharedPluginData(NS,"ref",ref);
  let x=6, hmax=30; vals.forEach((v,c)=>{ const t=T(row,v,x,7,IC[c][1]-8,10,c===1||c===6||c===3?700:400, c===1||c===6?BADGE[b].s:(c===3&&row.fills[0].color.r>0.99?"#CF222E":"#1F2328")); hmax=Math.max(hmax,t.height+14); x+=IC[c][1]; });
  row.resize(IW,hmax); iy+=hmax; });
// ⑦ Error / Popup Index
iy += 40;
T(fr, "⑦ ERROR / POPUP INDEX — mọi NG + popup lỗi trong CR-2 (message thật hoặc đề xuất)", ix, iy, IW, 14, 700, "#CF222E"); iy += 26;
const EC = [["E-ID",50],["Màn cha",90],["Hiển thị",80],["Trigger",210],["Message",330],["Đi đâu sau đó",150],["Badge",70]];
iy += hdrRow(EC, iy, "#FFE3E3");
for (const e of D.errs) { const [eid,par,disp,trg,msg,nxt,b,ref]=e; const vals=[eid,par,disp,trg,msg,nxt,b];
  const row=F(fr,"ERRIDX · "+eid+" · "+ref, ix, iy, IW, 30, "#FFFBFB"); row.strokes=[paint("#FFD7D5")];
  row.setSharedPluginData(NS,"kind","erridx");
  let x=6, hmax=30; vals.forEach((v,c)=>{ const t=T(row,v||"—",x,7,EC[c][1]-8,10,c===0||c===2?700:400, c===0?"#CF222E":"#1F2328"); hmax=Math.max(hmax,t.height+14); x+=EC[c][1]; });
  row.resize(IW,hmax); iy+=hmax; }
fr.resize(ix + IW + 40, Math.max(y, iy) + 20);
fit(s);
return {frame: fr.id, created: created.length, bottom: fr.y + fr.height};
