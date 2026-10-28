const PAGE_ID = "16779:398";
const SECTION_NAME = "CR-001 — 団体利用登録・団体利用受付機能 (baseline ver1 → ver3)";

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
  if(shape==="ng"){ const bar=R(f,0,0,6,h,"#CF222E"); bar.name="ng-bar"; }
  const pre = shape==="decision" ? "◇ " : (shape==="ng" ? "NG · " : (shape==="pill" ? "▶ " : ""));
  const t1=T(f, `${n.badge} · ${n.ref}`, 10, 6, w-20, 10, 700, b.s);
  const t2=T(f, pre+n.label+(n.badge==="DEL"?" (bỏ)":""), 10, t1.y+t1.height+2, w-20, 12, 700, "#1F2328");
  if(n.badge==="DEL") t2.textDecoration="STRIKETHROUGH";
  let bottomY = t2.y+t2.height;
  if(n.sub){ const t3=T(f, n.sub, 10, t2.y+t2.height+2, w-20, 10, 400, "#57606A"); bottomY = t3.y+t3.height; }
  if (bottomY+8 > h) { f.resize(w, bottomY+8); const bar=f.findOne(c=>c.name==="ng-bar"); if(bar) bar.resize(6, bottomY+8); }
  f.setSharedPluginData(NS,"kind",kind); return f; }
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


const D = {"note": "Chỉ màn có dòng Impact + màn dẫn tới (AS-IS). Mỗi node đúng 1 badge; NG vẽ inline; case chưa chốt → panel Edge/Exceptional.", "groups": [{"id": "G-CR1", "title": "Đăng ký đoàn & マイページ đoàn", "site": "WEB-02", "note": "CR-001.2 · CR-001.6 · CR-001.8", "nodes": [{"key": "s", "type": "start", "badge": "AS-IS", "ref": "FL-06", "label": "Vào từ ログイン / link đăng ký đoàn"}, {"key": "n63", "type": "screen", "badge": "UPD", "ref": "SC-063", "label": "ログイン方法を選択", "sub": "+ link 団体登録; người phụ trách → マイページ đoàn"}, {"key": "n46", "type": "screen", "badge": "NEW", "ref": "IMP-046", "label": "団体登録", "sub": "団体情報 · 申込担当者 · 請求先"}, {"key": "d", "type": "decision", "badge": "NEW", "ref": "IMP-033", "label": "Xác thực email OK?"}, {"key": "ng", "type": "ng", "badge": "NEW", "ref": "IMP-003", "label": "Link hết hạn → gửi lại mail xác thực"}, {"key": "n49", "type": "screen", "badge": "NEW", "ref": "IMP-049", "label": "マイページ — 団体情報 / 請求先", "sub": "xem + sửa"}, {"key": "n51", "type": "screen", "badge": "NEW", "ref": "IMP-051", "label": "マイページ — 担当者 (拡張案)", "sub": "mời / gỡ người phụ trách"}, {"key": "n52", "type": "screen", "badge": "NEW", "ref": "IMP-052", "label": "追加認証 — nhập mã (拡張案)", "sub": "thiết bị mới / thao tác quan trọng"}, {"key": "e1", "type": "edge", "badge": "NEW", "ref": "IMP-005", "label": "Phân quyền giữa các người phụ trách — CQ-015"}], "edges": [["s", "n63", "", ""], ["n63", "n46", "đăng ký đoàn", ""], ["n46", "d", "", ""], ["d", "n49", "YES", ""], ["d", "ng", "NO", "ng"], ["n49", "n51", "", ""], ["n51", "n52", "thao tác quan trọng", ""]], "pos": {"s": [0, 0], "n63": [1, 0], "n46": [2, 0], "d": [3, 0], "n49": [4, 0], "n51": [5, 0], "n52": [6, 0], "ng": [4, 1]}}, {"id": "G-CR2", "title": "Đặt chỗ & thanh toán đoàn, 領収書", "site": "WEB-02", "note": "CR-001.1 · CR-001.3 · CR-001.4 · CR-001.5", "nodes": [{"key": "s", "type": "start", "badge": "AS-IS", "ref": "SC-066", "label": "Vào từ 店舗一覧 / URL đặt chỗ đoàn"}, {"key": "n47", "type": "screen", "badge": "NEW", "ref": "IMP-047", "label": "団体予約", "sub": "店舗 · 日時 · 商品 · 子ども / 大人 · 当日責任者"}, {"key": "d", "type": "decision", "badge": "IMPACT", "ref": "table:ticket_booking_schedules", "label": "Còn chỗ (sức chứa chung)?"}, {"key": "ng", "type": "ng", "badge": "IMPACT", "ref": "API-008", "label": "Hết chỗ → báo lỗi, chọn ngày khác"}, {"key": "n48", "type": "screen", "badge": "NEW", "ref": "IMP-048", "label": "予約内容確認 + お支払い方法", "sub": "thẻ đại diện / 店頭払い"}, {"key": "sys", "type": "system", "badge": "UPD", "ref": "EXT-001", "label": "GMO — thanh toán thẻ", "sub": "3DS như hiện tại"}, {"key": "n70", "type": "screen", "badge": "UPD", "ref": "SC-070", "label": "予約履歴", "sub": "+ đặt chỗ đoàn, hạn thanh toán"}, {"key": "n71", "type": "screen", "badge": "UPD", "ref": "SC-071", "label": "予約履歴 chi tiết", "sub": "bỏ '領収書は店頭にて…' với đoàn → nút 領収書"}, {"key": "n50", "type": "screen", "badge": "NEW", "ref": "IMP-050", "label": "マイページ — 領収書", "sub": "宛名 · PDF · 再発行"}, {"key": "n76", "type": "screen", "badge": "UPD", "ref": "SC-076", "label": "予約変更", "sub": "đổi số người theo nhóm tuổi · ngày"}, {"key": "e1", "type": "edge", "badge": "NEW", "ref": "IMP-038", "label": "Phí huỷ khi đổi / huỷ — CQ-005"}, {"key": "e2", "type": "edge", "badge": "NEW", "ref": "IMP-016", "label": "Chờ admin duyệt (拡張案) — CQ-002"}], "edges": [["s", "n47", "", ""], ["n47", "d", "", ""], ["d", "n48", "YES", ""], ["d", "ng", "NO", "ng"], ["n48", "sys", "thẻ", ""], ["sys", "n70", "完了", ""], ["n70", "n71", "", ""], ["n71", "n50", "領収書", ""], ["n71", "n76", "変更", ""]], "pos": {"s": [0, 0], "n47": [1, 0], "d": [2, 0], "n48": [3, 0], "sys": [4, 0], "n70": [5, 0], "n71": [6, 0], "n50": [7, 0], "n76": [7, 1], "ng": [3, 2]}}, {"id": "G-CR3", "title": "Mua vé cá nhân — không hiện vé đoàn", "site": "WEB-02", "note": "CR-001.1 · màn không sửa nhưng phải kiểm lại (API-107 lọc 公開区分) — CQ-016", "nodes": [{"key": "s", "type": "start", "badge": "AS-IS", "ref": "SC-046", "label": "Vào từ お知らせ / nav"}, {"key": "n59", "type": "screen", "badge": "IMPACT", "ref": "SC-059", "label": "料金プラン"}, {"key": "n67", "type": "screen", "badge": "IMPACT", "ref": "SC-067", "label": "店舗詳細 /tenant/:code"}, {"key": "n48", "type": "screen", "badge": "IMPACT", "ref": "SC-048", "label": "フリーパス購入"}, {"key": "n49", "type": "screen", "badge": "IMPACT", "ref": "SC-049", "label": "回数券購入"}, {"key": "n54", "type": "screen", "badge": "IMPACT", "ref": "SC-054", "label": "当日利用 /booking/use-in-day"}], "edges": [["s", "n59", "", ""], ["s", "n67", "", ""], ["s", "n48", "", ""], ["s", "n49", "", ""], ["s", "n54", "", ""]], "pos": {"s": [0, 0], "n59": [1, 0], "n67": [1, 1], "n48": [1, 2], "n49": [1, 3], "n54": [1, 4]}}, {"id": "G-CR4", "title": "Đăng nhập admin + 二要素認証", "site": "WEB-01", "note": "CR-001.8", "nodes": [{"key": "s", "type": "start", "badge": "AS-IS", "ref": "FL-01", "label": "Mở admin site"}, {"key": "n27", "type": "screen", "badge": "UPD", "ref": "SC-027", "label": "ログイン (admin)", "sub": "+ chuyển sang bước nhập mã"}, {"key": "n62", "type": "screen", "badge": "NEW", "ref": "IMP-062", "label": "二要素認証 — nhập mã"}, {"key": "d", "type": "decision", "badge": "NEW", "ref": "IMP-018", "label": "Mã đúng?"}, {"key": "ng", "type": "ng", "badge": "UPD", "ref": "API-061", "label": "Sai mã → nhập lại / khoá như loginAttempts"}, {"key": "n01", "type": "screen", "badge": "AS-IS", "ref": "SC-001", "label": "ダッシュボード"}], "edges": [["s", "n27", "", ""], ["n27", "n62", "", ""], ["n62", "d", "", ""], ["d", "n01", "YES", ""], ["d", "ng", "NO", "ng"]], "pos": {"s": [0, 0], "n27": [1, 0], "n62": [2, 0], "d": [3, 0], "n01": [4, 0], "ng": [4, 1]}}, {"id": "G-CR5", "title": "Quản trị đoàn · đặt chỗ · vé", "site": "WEB-01", "note": "CR-001.1 · CR-001.3 · CR-001.5 · CR-001.7 · CR-001.9", "nodes": [{"key": "s", "type": "start", "badge": "AS-IS", "ref": "SC-001", "label": "Menu admin (ダッシュボード)"}, {"key": "n57", "type": "screen", "badge": "NEW", "ref": "IMP-057", "label": "団体管理 — danh sách"}, {"key": "n58", "type": "screen", "badge": "NEW", "ref": "IMP-058", "label": "団体登録 / 編集"}, {"key": "n59", "type": "screen", "badge": "NEW", "ref": "IMP-059", "label": "団体詳細", "sub": "担当者 · 予約 · 利用停止"}, {"key": "n60", "type": "screen", "badge": "NEW", "ref": "IMP-060", "label": "領収書発行履歴", "sub": "再発行"}, {"key": "n61", "type": "screen", "badge": "NEW", "ref": "IMP-061", "label": "操作履歴"}, {"key": "n04", "type": "screen", "badge": "UPD", "ref": "SC-004", "label": "予約管理", "sub": "lọc 一般 / 団体 · tên đoàn · CSV"}, {"key": "n05", "type": "screen", "badge": "UPD", "ref": "SC-005", "label": "予約詳細", "sub": "+ thông tin đoàn, 領収書 (UI chưa quan sát — CQ-012)"}, {"key": "n07", "type": "screen", "badge": "UPD", "ref": "SC-007", "label": "予約編集", "sub": "đổi / huỷ đặt chỗ đoàn"}, {"key": "n35", "type": "screen", "badge": "UPD", "ref": "SC-035", "label": "商品管理 — danh sách", "sub": "+ cột / lọc 公開区分"}, {"key": "n36", "type": "screen", "badge": "UPD", "ref": "SC-036", "label": "商品管理 — tạo", "sub": "+ field 公開区分"}, {"key": "n37", "type": "screen", "badge": "UPD", "ref": "SC-037", "label": "商品管理 — sửa"}, {"key": "n38", "type": "screen", "badge": "UPD", "ref": "SC-038", "label": "商品管理 — xem"}, {"key": "n09", "type": "screen", "badge": "IMPACT", "ref": "SC-009", "label": "在庫調整", "sub": "sức chứa dùng chung"}, {"key": "n44", "type": "screen", "badge": "IMPACT", "ref": "SC-044", "label": "空き状況"}, {"key": "n03", "type": "screen", "badge": "IMPACT", "ref": "SC-003", "label": "バーコード読み取り", "sub": "check-in đoàn đông người"}, {"key": "n26", "type": "screen", "badge": "IMPACT", "ref": "SC-026", "label": "入場状況管理"}, {"key": "n12", "type": "screen", "badge": "IMPACT", "ref": "SC-012", "label": "ダッシュボード (thống kê)"}, {"key": "n25", "type": "screen", "badge": "IMPACT", "ref": "SC-025", "label": "売上管理"}, {"key": "n40", "type": "screen", "badge": "IMPACT", "ref": "SC-040", "label": "ユーザー管理", "sub": "người phụ trách là users"}, {"key": "n14", "type": "screen", "badge": "IMPACT", "ref": "SC-014", "label": "自動返信メール設定", "sub": "+ mẫu mail đoàn"}], "edges": [["s", "n57", "団体管理", ""], ["n57", "n58", "", ""], ["n57", "n59", "", ""], ["n59", "n60", "", ""], ["n59", "n61", "", ""], ["s", "n04", "予約管理", ""], ["n04", "n05", "", ""], ["n05", "n07", "", ""], ["s", "n35", "商品管理", ""], ["n35", "n36", "", ""], ["n35", "n37", "", ""], ["n35", "n38", "", ""], ["s", "n09", "", ""], ["n09", "n44", "", ""], ["s", "n03", "", ""], ["n03", "n26", "", ""], ["s", "n12", "", ""], ["n12", "n25", "", ""], ["s", "n40", "", ""], ["s", "n14", "", ""]], "pos": {"s": [0, 0], "n57": [1, 0], "n58": [2, 0], "n59": [2, 1], "n60": [3, 1], "n61": [3, 2], "n04": [1, 3], "n05": [2, 3], "n07": [3, 3], "n35": [1, 4], "n36": [2, 4], "n37": [2, 5], "n38": [2, 6], "n09": [1, 7], "n44": [2, 7], "n03": [1, 8], "n26": [2, 8], "n12": [1, 9], "n25": [2, 9], "n40": [1, 10], "n14": [1, 11]}}], "index": [["SC-063", "ログイン方法を選択", "WEB-02", "UPD"], ["IMP-046", "団体登録", "WEB-02", "NEW"], ["IMP-049", "マイページ — 団体情報 / 請求先", "WEB-02", "NEW"], ["IMP-051", "マイページ — 担当者 (拡張案)", "WEB-02", "NEW"], ["IMP-052", "追加認証 — nhập mã (拡張案)", "WEB-02", "NEW"], ["IMP-047", "団体予約", "WEB-02", "NEW"], ["IMP-048", "予約内容確認 + お支払い方法", "WEB-02", "NEW"], ["EXT-001", "GMO — thanh toán thẻ", "WEB-02", "UPD"], ["SC-070", "予約履歴", "WEB-02", "UPD"], ["SC-071", "予約履歴 chi tiết", "WEB-02", "UPD"], ["IMP-050", "マイページ — 領収書", "WEB-02", "NEW"], ["SC-076", "予約変更", "WEB-02", "UPD"], ["SC-059", "料金プラン", "WEB-02", "IMPACT"], ["SC-067", "店舗詳細 /tenant/:code", "WEB-02", "IMPACT"], ["SC-048", "フリーパス購入", "WEB-02", "IMPACT"], ["SC-049", "回数券購入", "WEB-02", "IMPACT"], ["SC-054", "当日利用 /booking/use-in-day", "WEB-02", "IMPACT"], ["SC-027", "ログイン (admin)", "WEB-01", "UPD"], ["IMP-062", "二要素認証 — nhập mã", "WEB-01", "NEW"], ["IMP-057", "団体管理 — danh sách", "WEB-01", "NEW"], ["IMP-058", "団体登録 / 編集", "WEB-01", "NEW"], ["IMP-059", "団体詳細", "WEB-01", "NEW"], ["IMP-060", "領収書発行履歴", "WEB-01", "NEW"], ["IMP-061", "操作履歴", "WEB-01", "NEW"], ["SC-004", "予約管理", "WEB-01", "UPD"], ["SC-005", "予約詳細", "WEB-01", "UPD"], ["SC-007", "予約編集", "WEB-01", "UPD"], ["SC-035", "商品管理 — danh sách", "WEB-01", "UPD"], ["SC-036", "商品管理 — tạo", "WEB-01", "UPD"], ["SC-037", "商品管理 — sửa", "WEB-01", "UPD"], ["SC-038", "商品管理 — xem", "WEB-01", "UPD"], ["SC-009", "在庫調整", "WEB-01", "IMPACT"], ["SC-044", "空き状況", "WEB-01", "IMPACT"], ["SC-003", "バーコード読み取り", "WEB-01", "IMPACT"], ["SC-026", "入場状況管理", "WEB-01", "IMPACT"], ["SC-012", "ダッシュボード (thống kê)", "WEB-01", "IMPACT"], ["SC-025", "売上管理", "WEB-01", "IMPACT"], ["SC-040", "ユーザー管理", "WEB-01", "IMPACT"], ["SC-014", "自動返信メール設定", "WEB-01", "IMPACT"]]};
const {page, s} = await section();
if (!s) return {error: "chua co section — chay 01 truoc"};
const created=[];
const y0 = bottom(s) + 120;
const fr = F(s, "CR-2 Screen Flow — màn bị CR chạm (format Output 2)", 40, y0, 3000, 400, "#FFFFFF");
fr.strokes=[paint("#D0D7DE")]; fr.cornerRadius=12;
T(fr, "CR-2 — Screen Flow thay đổi (Output 2 · Group · Start ▶ · Screen · ◇ Decision · System · NG inline · Terminal · Edge/Exceptional)", 40, 24, 2300, 22, 700);
T(fr, D.note, 40, 54, 2300, 12, 400, "#57606A");
const NW=220, NH=78, DX=270, DY=118;
let y = 100;
for (const G of D.groups) {
  T(fr, "Group " + G.id + " — " + G.title + "  (" + G.site + ")", 40, y, 2200, 16, 700, "#0969DA");
  if (G.note) T(fr, G.note, 40, y+22, 2200, 12, 400, "#57606A");
  const top = y + 56; const nodes={}; let maxD=0, maxI=0;
  for (const n of G.nodes) { if (n.type==="edge") continue;
    const [d,i] = G.pos[n.key]; maxD=Math.max(maxD,d); maxI=Math.max(maxI,i);
    const shape = n.type==="start" ? "pill" : (n.type==="decision" ? "decision" : (n.type==="ng" ? "ng" : null));
    const w = n.type==="start" ? 200 : (n.type==="decision" ? 180 : NW), h = n.type==="decision" ? 64 : NH;
    const f = badgeBox(fr, n, 40 + d*DX, top + i*DY, w, h, n.type==="screen"||n.type==="system" ? "screen" : "flow-step", shape);
    if (n.type==="system") { f.fills=[paint("#E8F7EC")]; }
    nodes[n.key]=f; created.push(f.id); }
  for (const [a,b,lab,st] of G.edges) if (nodes[a] && nodes[b]) created.push(arrow(fr, nodes[a], nodes[b], lab, st).id);
  // Edge / Exceptional panel
  const ex = G.nodes.filter(n=>n.type==="edge");
  const px = 40 + (maxD+1)*DX + 40;
  if (ex.length) { T(fr, "EDGE / EXCEPTIONAL — chưa chốt, không vẽ inline", px, top-20, 420, 11, 700, "#6639BA");
    let ey = top; ex.forEach((n)=>{ const f=badgeBox(fr, n, px, ey, 420, 74, "edge"); created.push(f.id); nodes["_e"+ey]=f; ey = f.y + f.height + 12; }); }
  let gb = top; for (const k in nodes) gb = Math.max(gb, nodes[k].y + nodes[k].height);
  y = gb + 70; R(fr, 40, y, 2300, 1, "#D0D7DE"); y += 60;
}
// ④ Screen Index (pham vi CR)
let maxR = 0; for (const c of fr.children) maxR = Math.max(maxR, c.x + c.width);
const ix = Math.max(2420, maxR + 60); T(fr, "④ SCREEN INDEX — phạm vi CR", ix, 100, 540, 14, 700, "#0969DA");
let iy = 130;
const hdr = F(fr, "idx-header", ix, iy, 540, 28, "#DAEEF3"); T(hdr,"Ref",8,6,90,11,700); T(hdr,"Màn hình",100,6,300,11,700); T(hdr,"Site",400,6,60,11,700); T(hdr,"Badge",465,6,70,11,700);
iy += 28;
for (const [ref,lab,site,b] of D.index) { const r=F(fr,"IDX · "+ref, ix, iy, 540, 26, BADGE[b].f); T(r,ref,8,6,90,10,700,BADGE[b].s); T(r,lab,100,6,295,10,400); T(r,site,400,6,60,10,400); T(r,b,465,6,70,10,700,BADGE[b].s); iy+=26; }
fr.resize(ix + 580, Math.max(y, iy) + 20);
fit(s);
return {frame: fr.id, created: created.length, bottom: fr.y + fr.height};
