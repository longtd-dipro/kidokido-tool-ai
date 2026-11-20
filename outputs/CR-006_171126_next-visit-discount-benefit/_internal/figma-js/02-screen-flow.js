const PAGE_ID = "16779:398";
const SECTION_NAME = "CR-006 — 次回利用割引特典機能 (Ưu đãi cho lần sử dụng tiếp theo) (baseline ver2 → CR-006)";

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


const D = {"note": "Chỉ màn có dòng Impact + màn dẫn tới (AS-IS). Mỗi node đúng 1 badge; NG vẽ inline; case chưa chốt → panel Edge/Exceptional.", "sites": [{"site": "WEB-01", "label": "管理画面 (WEB-01)", "groups": [{"id": "G-CR1", "title": "Quản trị chiến dịch ưu đãi (admin)", "site": "WEB-01", "note": "CR-006.2 · CR-006.7 · nhân viên vận hành cấu hình chiến dịch, kiểm tra ưu đãi đã cấp", "nodes": [{"key": "s", "type": "start", "badge": "AS-IS", "ref": "SC-001", "label": "Menu admin (ダッシュボード)"}, {"key": "n1", "type": "screen", "badge": "NEW", "ref": "IMP-001", "label": "割引特典キャンペーン一覧", "sub": "/admin/discount-campaigns", "stype": "List", "desc": "Danh sách chiến dịch · filter trạng thái / thời gian"}, {"key": "n2", "type": "screen", "badge": "NEW", "ref": "IMP-002", "label": "キャンペーン作成 / 編集", "sub": "/admin/discount-campaigns/create · /update/:id", "stype": "Form", "desc": "Form cấu hình điều kiện · nội dung · thời hạn · giới hạn"}, {"key": "n3", "type": "screen", "badge": "NEW", "ref": "IMP-003", "label": "特典付与履歴", "sub": "/admin/discount-campaigns/:id/usages", "stype": "List", "desc": "Danh sách ưu đãi đã cấp theo chiến dịch"}, {"key": "d", "type": "decision", "badge": "NEW", "ref": "IMP-002", "label": "Điều kiện hợp lệ?"}, {"key": "ng", "type": "ng", "badge": "NEW", "ref": "IMP-002", "label": "Thiếu trường / thời gian sai", "display": "Inline", "parent": "IMP-002", "trigger": "Lưu form thiếu hoặc sai", "msg": "「<項目名>を入力してください」(đề xuất, cùng mẫu baseline)", "next": "ở lại form"}, {"key": "p1", "type": "popup", "badge": "NEW", "ref": "IMP-002", "label": "Xác nhận dừng chiến dịch", "display": "Modal", "parent": "IMP-001", "trigger": "Bấm 停止 trên dòng chiến dịch", "msg": "「このキャンペーンを停止します。新規付与は止まります。よろしいですか？」(đề xuất)", "next": "OK → trạng thái Stopped"}, {"key": "e1", "type": "edge", "badge": "NEW", "ref": "IMP-002", "label": "Thời điểm cấp + thời hạn tính từ ngày nào — CQ-001 · CQ-002 · CQ-003"}], "edges": [["s", "n1", "", ""], ["n1", "n2", "新規 / 編集", ""], ["n1", "n3", "付与履歴", ""], ["n2", "d", "lưu", ""], ["d", "n1", "YES", ""], ["d", "ng", "NO", "ng"], ["n1", "p1", "停止", ""]], "pos": {"s": [0, 0], "n1": [1, 0], "n2": [2, 0], "d": [3, 0], "ng": [4, 0], "n3": [2, 1], "p1": [2, 2]}}, {"id": "G-CR2", "title": "Chi tiết đặt chỗ + báo cáo chiến dịch (admin)", "site": "WEB-01", "note": "CR-006.5 · CR-006.12 · nhân viên xem ưu đãi đã dùng trên booking + option báo cáo", "nodes": [{"key": "s", "type": "start", "badge": "AS-IS", "ref": "SC-004", "label": "Vào từ 予約管理"}, {"key": "n1", "type": "screen", "badge": "UPD", "ref": "SC-005", "label": "予約詳細", "sub": "+ khối ưu đãi đã dùng", "stype": "Detail", "desc": "予約詳細: + tên chiến dịch · số tiền giảm · trạng thái ưu đãi"}, {"key": "n2", "type": "screen", "badge": "NEW", "ref": "IMP-038", "label": "キャンペーン効果レポート (option)", "sub": "/admin/discount-campaigns/:id/report", "stype": "Dashboard", "desc": "Chỉ số khách quay lại · giá trị trung bình · xuất CSV"}, {"key": "ng", "type": "ng", "badge": "IMPACT", "ref": "SC-005", "label": "Khác tenant → 403", "display": "Full screen", "parent": "SC-005", "trigger": "Admin cố xem booking khác tenant", "msg": "giữ quy tắc baseline (đã có)", "next": "về 予約管理"}, {"key": "e1", "type": "edge", "badge": "NEW", "ref": "IMP-038", "label": "Mã OBIC cho ưu đãi — CQ-011"}], "edges": [["s", "n1", "", ""], ["n1", "n2", "レポート", ""], ["n1", "ng", "khác tenant", "ng"]], "pos": {"s": [0, 0], "n1": [1, 0], "n2": [2, 0], "ng": [2, 1]}}], "index": [["IMP-001", "割引特典キャンペーン一覧", "List", "Danh sách chiến dịch · filter trạng thái / thời gian", "WEB-01", "NEW"], ["IMP-002", "キャンペーン作成 / 編集", "Form", "Form cấu hình điều kiện · nội dung · thời hạn · giới hạn", "WEB-01", "NEW"], ["IMP-003", "特典付与履歴", "List", "Danh sách ưu đãi đã cấp theo chiến dịch", "WEB-01", "NEW"], ["IMP-002", "Xác nhận dừng chiến dịch", "Modal", "「このキャンペーンを停止します。新規付与は止まります。よろしいですか？」(đề xuất)", "WEB-01", "NEW"], ["SC-005", "予約詳細", "Detail", "予約詳細: + tên chiến dịch · số tiền giảm · trạng thái ưu đãi", "WEB-01", "UPD"], ["IMP-038", "キャンペーン効果レポート (option)", "Dashboard", "Chỉ số khách quay lại · giá trị trung bình · xuất CSV", "WEB-01", "NEW"], ["SC-005", "Khác tenant → 403", "Full screen", "giữ quy tắc baseline (đã có)", "WEB-01", "IMPACT"]], "errs": [["E-01", "IMP-002", "Inline", "Lưu form thiếu hoặc sai", "「<項目名>を入力してください」(đề xuất, cùng mẫu baseline)", "ở lại form", "NEW", "IMP-002"], ["E-02", "IMP-001", "Modal", "Bấm 停止 trên dòng chiến dịch", "「このキャンペーンを停止します。新規付与は止まります。よろしいですか？」(đề xuất)", "OK → trạng thái Stopped", "NEW", "IMP-002"], ["E-03", "SC-005", "Full screen", "Admin cố xem booking khác tenant", "giữ quy tắc baseline (đã có)", "về 予約管理", "IMPACT", "SC-005"]], "main": 5}, {"site": "WEB-02", "label": "予約サイト (WEB-02)", "groups": [{"id": "G-CR3", "title": "Xem ưu đãi trên MyPage (user)", "site": "WEB-02", "note": "CR-006.3 · khách xem ưu đãi đã nhận trên MyPage", "nodes": [{"key": "s", "type": "start", "badge": "AS-IS", "ref": "SC-069", "label": "Vào từ MyPage (SC-069)"}, {"key": "n1", "type": "screen", "badge": "NEW", "ref": "IMP-005", "label": "MyPage — 割引特典一覧", "sub": "/user/my-page/discounts", "stype": "List", "desc": "Danh sách ưu đãi của khách · trạng thái · thời hạn · cửa hàng + sản phẩm áp dụng"}, {"key": "d", "type": "decision", "badge": "NEW", "ref": "IMP-016", "label": "Ưu đãi còn hạn?"}, {"key": "ng", "type": "ng", "badge": "NEW", "ref": "IMP-016", "label": "Hết hạn → chuyển Expired", "display": "Inline", "parent": "IMP-005", "trigger": "expires_at < now AND Available", "msg": "「有効期限切れ」(đề xuất) · tô xám trong danh sách", "next": "ở lại MyPage"}, {"key": "e1", "type": "edge", "badge": "NEW", "ref": "IMP-005", "label": "Thông báo email / push khi cấp — CQ-012"}], "edges": [["s", "n1", "", ""], ["n1", "d", "", ""], ["d", "ng", "NO", "ng"]], "pos": {"s": [0, 0], "n1": [1, 0], "d": [2, 0], "ng": [3, 0]}}, {"id": "G-CR4", "title": "Mua vé & thanh toán — thông báo + áp dụng ưu đãi (user)", "site": "WEB-02", "note": "CR-006.3 · CR-006.4 · SC-048/049 thông báo ưu đãi; SC-050/054 áp dụng + checkbox 「このご予約では使わない」 (phương án ①-A, CQ-007)", "nodes": [{"key": "s", "type": "start", "badge": "AS-IS", "ref": "SC-067", "label": "Vào từ 店舗詳細 / 料金プラン"}, {"key": "n48", "type": "screen", "badge": "UPD", "ref": "SC-048", "label": "フリーパス購入", "sub": "+ khối thông báo ưu đãi sẽ nhận", "stype": "Form", "desc": "Mua free pass: + khối 「ご購入特典のお知らせ」 khi sản phẩm thuộc chiến dịch"}, {"key": "n49", "type": "screen", "badge": "UPD", "ref": "SC-049", "label": "回数券購入", "sub": "+ khối thông báo ưu đãi sẽ nhận", "stype": "Form", "desc": "Mua 回数券: + khối 「ご購入特典のお知らせ」"}, {"key": "n50", "type": "screen", "badge": "UPD", "ref": "SC-050", "label": "オンライン決済", "sub": "+ 3 dòng giá + checkbox 「このご予約では使わない」", "stype": "Form", "desc": "Màn thanh toán online: giá thông thường / 割引 / 支払金額 + checkbox bỏ áp dụng (phương án ①-A)"}, {"key": "n54", "type": "screen", "badge": "UPD", "ref": "SC-054", "label": "当日利用 (SC-054)", "sub": "+ khối hiển thị giảm giá", "stype": "Form", "desc": "Màn dùng trong ngày: khối 3 dòng giá nếu có ưu đãi; thanh toán tại quầy chuyển sang Smaregi"}, {"key": "sys", "type": "system", "badge": "UPD", "ref": "EXT-001", "label": "GMO — thanh toán + callback", "sub": "cập nhật trạng thái ưu đãi Holding → Used"}, {"key": "p1", "type": "ng", "badge": "UPD", "ref": "EXT-001", "label": "Thanh toán thẻ thất bại", "display": "Full screen", "parent": "SC-050", "trigger": "GMO 3DS / thẻ lỗi", "msg": "決済に失敗しました (dùng màn payment-online-failure hiện có) · ưu đãi khôi phục về Available", "next": "quay lại SC-050"}, {"key": "p2", "type": "popup", "badge": "NEW", "ref": "IMP-008", "label": "Xác nhận không dùng ưu đãi lần này", "display": "Modal", "parent": "SC-050", "trigger": "Bấm checkbox 「このご予約では使わない」", "msg": "「今回のご予約には特典を適用しません。特典は次回まで保持されます。よろしいですか？」(đề xuất)", "next": "OK → bỏ áp dụng, giữ ưu đãi"}, {"key": "e1", "type": "edge", "badge": "NEW", "ref": "IMP-008", "label": "CQ-007 chưa chốt — phương án ①-A (checkbox) làm mặc định, điều chỉnh sau khi KH xác nhận"}], "edges": [["s", "n48", "", ""], ["s", "n49", "", ""], ["n48", "n50", "thanh toán", ""], ["n49", "n50", "thanh toán", ""], ["s", "n54", "", ""], ["n50", "sys", "決済", ""], ["sys", "p1", "NG", "ng"], ["n50", "p2", "checkbox", ""]], "pos": {"s": [0, 0], "n48": [1, 0], "n50": [2, 0], "sys": [3, 0], "p1": [4, 0], "p2": [3, 1], "n49": [1, 2], "n54": [1, 3]}}], "index": [["IMP-005", "MyPage — 割引特典一覧", "List", "Danh sách ưu đãi của khách · trạng thái · thời hạn · cửa hàng + sản phẩm áp dụng", "WEB-02", "NEW"], ["SC-048", "フリーパス購入", "Form", "Mua free pass: + khối 「ご購入特典のお知らせ」 khi sản phẩm thuộc chiến dịch", "WEB-02", "UPD"], ["SC-049", "回数券購入", "Form", "Mua 回数券: + khối 「ご購入特典のお知らせ」", "WEB-02", "UPD"], ["SC-050", "オンライン決済", "Form", "Màn thanh toán online: giá thông thường / 割引 / 支払金額 + checkbox bỏ áp dụng (phương án ①-A)", "WEB-02", "UPD"], ["SC-054", "当日利用 (SC-054)", "Form", "Màn dùng trong ngày: khối 3 dòng giá nếu có ưu đãi; thanh toán tại quầy chuyển sang Smaregi", "WEB-02", "UPD"], ["EXT-001", "Thanh toán thẻ thất bại", "Full screen", "決済に失敗しました (dùng màn payment-online-failure hiện có) · ưu đãi khôi phục về Available", "WEB-02", "UPD"], ["IMP-008", "Xác nhận không dùng ưu đãi lần này", "Modal", "「今回のご予約には特典を適用しません。特典は次回まで保持されます。よろしいですか？」(đề xuất)", "WEB-02", "NEW"]], "errs": [["E-01", "IMP-005", "Inline", "expires_at < now AND Available", "「有効期限切れ」(đề xuất) · tô xám trong danh sách", "ở lại MyPage", "NEW", "IMP-016"], ["E-02", "SC-050", "Full screen", "GMO 3DS / thẻ lỗi", "決済に失敗しました (dùng màn payment-online-failure hiện có) · ưu đãi khôi phục về Available", "quay lại SC-050", "UPD", "EXT-001"], ["E-03", "SC-050", "Modal", "Bấm checkbox 「このご予約では使わない」", "「今回のご予約には特典を適用しません。特典は次回まで保持されます。よろしいですか？」(đề xuất)", "OK → bỏ áp dụng, giữ ưu đãi", "NEW", "IMP-008"]], "main": 5}]};
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
