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
async function section(){ const page=await figma.getNodeByIdAsync(PAGE_ID); await figma.setCurrentPageAsync(page);
  let s=page.children.find(c=>c.type==="SECTION" && c.name===SECTION_NAME); return {page, s}; }
function bottom(s){ let m=0; for(const c of s.children) m=Math.max(m,c.y+c.height); return m; }
function fit(s){ let w=0,h=0; for(const c of s.children){ w=Math.max(w,c.x+c.width); h=Math.max(h,c.y+c.height);} s.resizeWithoutConstraints(w+80,h+80); }


const D = {"note":"Dựng từ tokens.json + component README của Design System baseline (đã đọc: WEB-02/README.md, WEB-02/tokens.json, WEB-01/README.md, WEB-01/tokens.json, 04_DesignSystem/STATUS.md, 04_DesignSystem/STATUS.md, components/README.md, components/README.md). Dữ liệu mẫu theo DATA-PRIVACY §4. Viền khung = badge thay đổi.","items":[{"badge":"UPD","ref":"IMP-007","site":"WEB-02","shell":"public","label":"[WEB-02] 店舗詳細 — ①-A lịch đã mở (phương án thay thế)","stype":"Detail","entry":"IMP-007 bấm カレンダーを表示","purpose":"Phương án ①-A sau khi bấm 「カレンダーを表示」: lịch 1 tháng của sản phẩm đó mở ra, nút đổi thành 「カレンダーを閉じる」.","happy":["カレンダーを表示 → lịch 1 tháng","Bấm ○ → SC-050","カレンダーを閉じる → về trạng thái đóng"],"blocks":[{"t":"breadcrumb","items":["トップ","店舗一覧","店舗A"],"n":1,"_site":"WEB-02"},{"t":"title","text":"店舗A","n":2,"_site":"WEB-02"},{"t":"card","tone":"raised","title":"店舗情報","lines":["連絡先：090-0000-0000","住所：Số 1, Đường ABC, Quận 1, TP.HCM","営業時間：10:00～18:00 <最終受付17:00>"],"n":3,"_site":"WEB-02"},{"t":"card","tone":"tinted","title":"2026/10/22(木) 本日の空き状況","lines":["1DAYパス ○ 空きあり","時間制パス △ 入場制限中"],"n":4,"_site":"WEB-02"},{"t":"buttons","items":[{"text":"今から利用する","variant":"solid"}],"n":5,"_site":"WEB-02"},{"t":"section","text":"事前予約","n":6,"_site":"WEB-02"},{"t":"text","text":"1DAYパス（平日）　10/22〜11/20（1か月分）","chg":"UPD","n":7,"_site":"WEB-02"},{"t":"table","from":"WEB-01","cols":["週","木","金","土","日","月","火","水"],"widths":[92,114,114,114,114,114,114,114],"rows":[["第1週","10/22 ○","10/23 ○","10/24 —","10/25 —","10/26 ○","10/27 ○","10/28 ○"],["第2週","10/29 ○","10/30 ○","10/31 —","11/1 × 完売","11/2 ○","11/3 ○","11/4 ○"],["第3週","11/5 ○","11/6 ○","11/7 —","11/8 —","11/9 ○","11/10 ○","11/11 ○"],["第4週","11/12 ○","11/13 ○","11/14 —","11/15 —","11/16 ○","11/17 ○","11/18 ○"],["第5週","11/19 ○","11/20 ○","","","","",""]],"chg":"UPD","note":"mở 1 tháng","n":8,"_site":"WEB-01"},{"t":"buttons","items":[{"text":"カレンダーを閉じる","variant":"outline","size":"sm"}],"chg":"NEW","n":9,"_site":"WEB-02"},{"t":"card","tone":"raised","title":"1DAYパス（休日）","lines":["カレンダーは閉じています"],"chg":"UPD","n":10,"_site":"WEB-02"}],"errors":[{"trigger":"Tải lịch lỗi","display":"Toast","msg":"「システムエラーが発生しました。…」(thật) — giữ trạng thái đóng"},{"trigger":"Ngày đã 完売","display":"Inline","msg":"Ô hiện × 完売 (thật)"}],"base":"SC-067","changes":["⑦ ⑧ Lịch 1 tháng khi mở (UPD)","⑨ Nút カレンダーを閉じる (NEW)"],"ds":["DS-component:WEB-01:Table","DS-component:WEB-02:AppHeader","DS-component:WEB-02:Breadcrumb","DS-component:WEB-02:Button","DS-component:WEB-02:Card","DS-component:WEB-02:PageHeader"],"cq":"Chọn 1 trong ①-A / ①-B","items":[{"n":1,"title":"Breadcrumb","desc":"トップ › 店舗一覧 › 店舗A","action":"—","chg":null},{"n":2,"title":"Tiêu đề trang 「店舗A」","desc":"PageHeader","action":"—","chg":null},{"n":3,"title":"Khối thông tin 「店舗情報」","desc":"連絡先：090-0000-0000; 住所：Số 1, Đường ABC, Quận 1, TP.HCM; 営業時間：10:00～18:00 <最終受付17:00>","action":"—","chg":null},{"n":4,"title":"Khối thông tin 「2026/10/22(木) 本日の空き状況」","desc":"1DAYパス ○ 空きあり; 時間制パス △ 入場制限中","action":"—","chg":null},{"n":5,"title":"Nút 今から利用する","desc":"chính","action":"—","chg":null},{"n":6,"title":"Tiêu đề nhóm","desc":"事前予約","action":"—","chg":null},{"n":7,"title":"Câu hướng dẫn / ghi chú","desc":"1DAYパス（平日）　10/22〜11/20（1か月分）","action":"—","chg":"UPD"},{"n":8,"title":"Bảng","desc":"週 · 木 · 金 · 土 · 日 · 月 · 火 · 水 — mở 1 tháng","action":"TAP ○ → SC-050","chg":"UPD"},{"n":9,"title":"Nút カレンダーを閉じる","desc":"phụ","action":"TAP → đóng lịch","chg":"NEW"},{"n":10,"title":"Khối thông tin 「1DAYパス（休日）」","desc":"カレンダーは閉じています","action":"—","chg":"UPD"}],"borrow":["WEB-01"]},{"badge":"NEW","ref":"IMP-016","site":"WEB-02","shell":"public","label":"[WEB-02] 限定公開ページ — khoá sai / trang đã dừng (404)","stype":"Error","entry":"URL 限定公開 sai khoá / trang dừng (Option)","purpose":"Màn lỗi khi URL 限定公開 sai khoá hoặc trang đã dừng (Option): không tiết lộ là trang 限定公開, không hiện sản phẩm.","happy":["Hiện thông báo không tìm thấy trang","トップへ → TOP (SC-001)"],"blocks":[{"t":"title","text":"ページが見つかりません","n":1,"_site":"WEB-02"},{"t":"text","text":"お探しのページは見つかりませんでした。URLをご確認ください。","n":2,"_site":"WEB-02"},{"t":"buttons","items":[{"text":"トップへ戻る","variant":"solid"}],"n":3,"_site":"WEB-02"}],"errors":[{"trigger":"—","display":"Full screen","msg":"Chính màn này là trạng thái lỗi (đề xuất dùng trang 404 chung nếu hệ thống có)"}],"ds":["DS-component:WEB-02:AppHeader","DS-component:WEB-02:Button","DS-component:WEB-02:PageHeader"],"cq":"Có trang 404 chung của WEB-02 không? (chưa quan sát được) — nếu có thì dùng lại","items":[{"n":1,"title":"Tiêu đề trang 「ページが見つかりません」","desc":"PageHeader","action":"—","chg":"NEW"},{"n":2,"title":"Câu hướng dẫn / ghi chú","desc":"お探しのページは見つかりませんでした。URLをご確認ください。","action":"—","chg":"NEW"},{"n":3,"title":"Nút トップへ戻る","desc":"chính","action":"TAP → TOP","chg":"NEW"}],"borrow":[]},{"badge":"NEW","ref":"IMP-016","site":"WEB-02","shell":"public","label":"[WEB-02] 限定公開ページ — chưa có sản phẩm (empty)","stype":"List","entry":"URL 限定公開 (施設 chưa có sản phẩm 限定公開)","purpose":"Trang 限定公開 hợp lệ nhưng 施設 đang chọn không có sản phẩm 限定公開 đang bán (hết lịch / chưa tạo).","happy":["Đổi 施設 khác","Hoặc rời trang"],"blocks":[{"t":"title","text":"法人のお客様向け商品","n":1,"_site":"WEB-02"},{"t":"text","text":"このページは限定公開です。URLを社外の方に共有しないでください。","n":2,"_site":"WEB-02"},{"t":"select","label":"施設","placeholder":"店舗B","n":3,"_site":"WEB-02"},{"t":"card","tone":"tinted","title":"現在ご購入いただける商品はありません","lines":["別の施設を選択してください。"],"n":4,"_site":"WEB-02"}],"errors":[{"trigger":"—","display":"Inline","msg":"Chính màn này là trạng thái rỗng — message 「現在ご購入いただける商品はありません」(đề xuất)"}],"ds":["DS-component:WEB-02:AppHeader","DS-component:WEB-02:Card","DS-component:WEB-02:PageHeader","DS-component:WEB-02:Select"],"cq":"CQ-013 khi hết chương trình: ẩn trang hay hiện màn này?","items":[{"n":1,"title":"Tiêu đề trang 「法人のお客様向け商品」","desc":"PageHeader","action":"—","chg":"NEW"},{"n":2,"title":"Câu hướng dẫn / ghi chú","desc":"このページは限定公開です。URLを社外の方に共有しないでください。","action":"—","chg":"NEW"},{"n":3,"title":"施設","desc":"Select","action":"Đổi 施設 → tải lại sản phẩm","chg":"NEW"},{"n":4,"title":"Khối thông tin 「現在ご購入いただける商品はありません」","desc":"別の施設を選択してください。","action":"—","chg":"NEW"}],"borrow":[]},{"badge":"NEW","ref":"IMP-032","site":"WEB-01","shell":"admin","label":"[WEB-01] 限定公開ページ 登録 / 編集 (Option)","stype":"Form","entry":"IMP-034 新規作成 / ✎","purpose":"Tạo / sửa trang 限定公開 (Option CR-002.3): tên trang, tiêu đề hiển thị, URL hệ thống sinh, trạng thái. Sản phẩm gán trang ở form sản phẩm (SC-036).","happy":["Nhập ページ名 + タイトル","保存する → hệ thống sinh URL → Toast 「成功」 → về danh sách IMP-034","Sửa: đổi tên / tiêu đề / trạng thái (URL giữ nguyên)"],"blocks":[{"t":"title","text":"限定公開ページ管理","n":1,"_site":"WEB-01"},{"t":"breadcrumb","items":["ホーム","限定公開ページ管理","新規作成"],"n":2,"_site":"WEB-01"},{"t":"card","tone":"raised","title":"ページ情報","blocks":[{"t":"field","label":"ページ名","required":true,"placeholder":"法人向けページA","_site":"WEB-01"},{"t":"field","label":"ページタイトル（表示用）","placeholder":"法人のお客様向け商品","_site":"WEB-01"},{"t":"field","label":"URL（自動生成）","value":"https://example.com/limited/xxxx","hint":"保存時に自動生成されます","_site":"WEB-01"},{"t":"radio","label":"ステータス","options":["公開","停止"],"selected":0,"_site":"WEB-01"}],"n":3,"_site":"WEB-01"},{"t":"buttons","items":[{"text":"キャンセル","variant":"outline"},{"text":"保存する","variant":"solid"}],"n":4,"_site":"WEB-01"}],"errors":[{"trigger":"Bỏ trống ページ名","display":"Inline","msg":"「ページ名を入力してください」(đề xuất) — màn trạng thái lỗi vẽ bên dưới"},{"trigger":"Lỗi lưu","display":"Toast","msg":"Toast 「エラー」(thật — Toast WEB-01)"},{"trigger":"Đổi ステータス sang 停止 khi còn sản phẩm","display":"Modal","msg":"Popup IMP-037 (đề xuất)"}],"nav":["予約管理","空き状況","売上管理","商品管理","ユーザー管理","従業員管理","限定公開ページ管理"],"nav_active":"限定公開ページ管理","ds":["DS-component:WEB-01:Breadcrumb","DS-component:WEB-01:Button","DS-component:WEB-01:Card","DS-component:WEB-01:PageHeader","DS-component:WEB-01:Radio","DS-component:WEB-01:SideNav","DS-component:WEB-01:TextField"],"cq":"CQ-006 có cần đổi URL không · CQ-010 thời hạn trang","items":[{"n":1,"title":"Tiêu đề trang 「限定公開ページ管理」","desc":"PageHeader","action":"—","chg":"NEW"},{"n":2,"title":"Breadcrumb","desc":"ホーム › 限定公開ページ管理 › 新規作成","action":"—","chg":"NEW"},{"n":3,"title":"Khối thông tin 「ページ情報」","desc":"nhóm field","action":"—","chg":"NEW"},{"n":4,"title":"Nút キャンセル / 保存する","desc":"phụ · chính","action":"キャンセル → IMP-034; 保存する → lưu","chg":"NEW"}],"borrow":[]}],"tok":{"WEB-01":{"t":{"primary":"#006dc6","primary-gradient-top":"#5aa7f2","primary-text":"#006dc6","on-primary":"#ffffff","primary-subtle":"#9ae9ff","nav-active-light":"#68b5ff","on-nav-active":"#f5f5f5","page-bg":"#f4faff","surface":"#ffffff","surface-subtle":"#e9faff","surface-disabled":"#d9dde1","text-high":"#000000","text-middle":"#000000de","text-low":"#676767","text-label":"#262627","text-table-header":"#313035","text-placeholder":"#b4b2b7","icon-default":"#0000008a","control-border":"#00000099","control-checked":"#92e4cd","divider-low":"#e0e0e0","divider-middle":"#d9d9d9","negative-600":"#dc0404","space-4":"4px","space-20":"20px","radius-none":"0px","radius-sm":"4px","radius-md":"8px","radius-lg":"10px","viewport-web":"1440px","sidebar-width":"265px","nav-item-height":"58px","control-sm":"34.13px","control-md":"48px","table-header-height":"54px","table-row-height":"52px","modal-width":"607px"},"type":{"heading-20-semibold":{"size":20.0,"weight":600},"heading-20-bold":{"size":20.0,"weight":700},"heading-18-bold":{"size":18.0,"weight":700},"text-16":{"size":16.0,"weight":400},"text-16-light":{"size":16.0,"weight":300},"text-16-bold":{"size":16.0,"weight":700},"label-14":{"size":14.0,"weight":500},"nav-14":{"size":14.0,"weight":500},"text-14":{"size":14.0,"weight":400},"text-12":{"size":12.0,"weight":400}}},"WEB-02":{"t":{"primary":"#0068b7","primary-text":"#0068b7","on-primary":"#ffffff","primary-subtle":"#f3faff","accent-yellow":"#ffe732","page-bg":"#ffffff","surface":"#ffffff","surface-subtle":"#f4faff","sidebar-bg":"#fffbf8","surface-disabled":"#e6e1e1","text-high":"#313131","text-middle":"#313131","text-low":"#979797","text-black":"#000000","text-field":"#000000de","icon-default":"#0000008a","icon-muted":"#00000099","radio-checked":"#92e4cd","checkbox-checked":"#2563eb","checkbox-border":"#6b7280","divider-low":"#e5e7eb","divider-middle":"#d9d9d9","negative-600":"#dc0404","space-4":"4px","space-20":"20px","radius-none":"0px","radius-sm":"4px","radius-checkbox":"5px","radius-md":"8px","radius-field":"10px","radius-lg":"12px","radius-button":"40px","viewport-web":"1440px","nav-item-height":"48px","control-sm":"38px","control-md":"64px","field-height":"56px","content-max":"896px"},"type":{"title-36":{"size":36.0,"weight":500},"heading-32":{"size":32.0,"weight":500},"heading-24-semibold":{"size":24.0,"weight":600},"heading-20-bold":{"size":20.0,"weight":700},"heading-16-bold":{"size":16.0,"weight":700},"text-20":{"size":20.0,"weight":400},"text-18":{"size":18.0,"weight":500},"text-16":{"size":16.0,"weight":400},"text-16-bold":{"size":16.0,"weight":700},"text-16-light":{"size":16.0,"weight":300},"text-14":{"size":14.0,"weight":500},"text-12":{"size":12.0,"weight":400}}}}};
const {page, s} = await section();
if (!s) return {error: "chua co section"};
// CR-3 chia section theo site: man nguoi dung (WEB-02) va man quan tri (WEB-01) — moi nhom 1 Section rieng
const HOSTNAME = {"WEB-02": "CR-3 Screens · Màn hình người dùng (WEB-02)", "WEB-01": "CR-3 Screens · Màn hình quản trị (WEB-01)"};
function hostFor(site){ const name = HOSTNAME[site] || ("CR-3 Screens · " + site);
  let h = s.children.find(c=>c.name===name); if (h) return h;
  h = figma.createSection(); h.name = name; s.appendChild(h); h.x = 40; h.y = bottom(s) + 120; h.fills=[paint("#FFFFFF")];
  T(h, "CR-3 — " + name.split(" · ")[1] + " (format Output 3: mockup trái · mô tả + ITEMS + ERROR SCENARIOS phải · màn UPD tô màu phần đổi)", 40, 30, 3000, 22, 700, "#0969DA");
  T(h, D.note, 40, 66, 3000, 12, 400, "#57606A"); return h; }
let host = null; const touched = new Set();
const created=[];
function tok(site, name, dflt){ const v=D.tok[site].t[name]; if((v===undefined||v===null) && dflt===undefined) throw new Error("token '"+name+"' khong co trong Design System "+site+" — khong tu che (CR-3b)"); return v===undefined||v===null ? dflt : v; }
function ty(site, name){ const v=D.tok[site].type[name]; if(!v) throw new Error("type style '"+name+"' khong co trong Design System "+site); return v; }
function txt(parent, site, s, style, color, w){ const st=ty(site,style); const t=figma.createText();
  t.fontName={family:"Noto Sans JP",style:W8[st.weight]||"Regular"}; t.characters=String(s); t.fontSize=st.size;
  t.fills=[paint(tok(site,color))]; parent.appendChild(t); if(w){ t.layoutSizingHorizontal="FIXED"; t.resize(w,t.height); t.textAutoResize="HEIGHT"; } return t; }
function col(parent, gap, name){ const f=figma.createAutoLayout("VERTICAL",{itemSpacing:gap}); f.name=name||"col"; f.fills=[]; parent.appendChild(f); return f; }
function row(parent, gap, name){ const f=figma.createAutoLayout("HORIZONTAL",{itemSpacing:gap}); f.name=name||"row"; f.fills=[]; f.counterAxisAlignItems="CENTER"; parent.appendChild(f); return f; }
function boxv(parent, site, w, h, fill, radius, name){ const f=figma.createFrame(); f.name=name||"box"; f.resize(w,h); f.fills=[paint(tok(site,fill))]; f.cornerRadius=parseFloat(tok(site,radius))||0; parent.appendChild(f); return f; }
function field(parent, site, b, w){ const c=col(parent,6,"TextField");
  const lab=row(c,6,"label"); txt(lab,site,b.label, site==="WEB-01"?"label-14":"text-16", site==="WEB-01"?"text-label":"text-high");
  if(b.required) txt(lab,site,"[必須]", site==="WEB-01"?"label-14":"text-12","negative-600");
  if(b.hint) txt(c,site,b.hint,"text-12", site==="WEB-01"?"text-low":"text-high", w);
  const H = site==="WEB-01" ? parseFloat(tok(site,"control-md","48")) : parseFloat(tok(site,"field-height","56"));
  const bx=boxv(c,site,w,H, site==="WEB-01"?"page-bg":"primary-subtle", site==="WEB-01"?"radius-md":"radius-field","input");
  const p=txt(bx,site,b.value||b.placeholder||"", site==="WEB-01"?"text-16-light":"text-16-light", b.value ? (site==="WEB-01"?"text-middle":"text-field") : (site==="WEB-01"?"text-placeholder":"text-low"));
  p.x=15; p.y=(H-p.height)/2;
  if(b.select){ const a=txt(bx,site,"▼","text-14","icon-default"); a.x=w-30; a.y=(H-a.height)/2; }
  if(b.unit){ const u=txt(bx,site,b.unit,"text-16", site==="WEB-01"?"text-low":"text-high"); u.x=w-u.width-16; u.y=(H-u.height)/2; }
  return c; }
function button(parent, site, it){ const solid = it.variant!=="outline"; const lg = it.size!=="sm";
  const H = site==="WEB-01" ? (lg?48:40) : parseFloat(tok(site, lg?"control-md":"control-sm","64"));
  const W = it.width || (site==="WEB-01" ? (lg?200:140) : (lg?320:180));
  const f=boxv(parent,site,W,H, solid?"primary":(site==="WEB-01"?"surface":"surface"), site==="WEB-01"?"radius-lg":"radius-button","Button");
  if(!solid){ f.strokes=[paint(tok(site,"primary"))]; f.strokeWeight=1; }
  if(solid && site==="WEB-01"){ const a=paint(tok(site,"primary-gradient-top")), z=paint(tok(site,"primary"));
    f.fills=[{type:"GRADIENT_LINEAR", gradientTransform:[[0,1,0],[-1,0,1]], gradientStops:[{position:0,color:{...a.color,a:1}},{position:1,color:{...z.color,a:1}}]}]; }
  const t=txt(f,site,it.text, site==="WEB-01"?"text-16-bold":(lg?"heading-20-bold":"heading-16-bold"), solid?"on-primary":"primary-text"); t.x=(W-t.width)/2; t.y=(H-t.height)/2; return f; }
function table(parent, site, b, w){ const s2=b._site; const c=col(parent,0,"Table"); c.cornerRadius=8; c.clipsContent=true;
  const ws=b.widths || b.cols.map(()=>Math.floor(w/b.cols.length));
  const hh=parseFloat(tok(s2,"table-header-height","54")), rh=parseFloat(tok(s2,"table-row-height","52"));
  const hr=row(c,0,"thead"); hr.fills=[paint(tok(s2,"surface-subtle"))];
  b.cols.forEach((h,k)=>{ const cell=boxv(hr,s2,ws[k],hh,"surface-subtle","radius-none","th"); const t=txt(cell,s2,h,"text-16-bold","text-table-header",ws[k]-20); t.x=10; t.y=(hh-t.height)/2; });
  for(const r of b.rows){ const tr=row(c,0,"tr"); r.forEach((v,k)=>{ const cell=boxv(tr,s2,ws[k],rh,"surface","radius-none","td");
     cell.strokes=[paint(tok(s2,"divider-low"))]; cell.strokeBottomWeight=1; cell.strokeTopWeight=0; cell.strokeLeftWeight=0; cell.strokeRightWeight=0;
     const t=txt(cell,s2,v,"text-16-light","text-middle",ws[k]-20); t.x=10; t.y=(rh-t.height)/2; }); }
  return c; }
function badge(parent, site, text){ const s2=site; const f=figma.createAutoLayout("HORIZONTAL"); f.name="Badge"; f.paddingLeft=f.paddingRight=parseFloat(tok(s2,"space-20","20")); f.paddingTop=f.paddingBottom=parseFloat(tok(s2,"space-4","4"));
  f.fills=[paint(tok(s2,"divider-middle"))]; f.cornerRadius=999; parent.appendChild(f); txt(f,s2,text,"text-14","text-low"); return f; }
function card(parent, site, w, tone, name){ const f=figma.createAutoLayout("VERTICAL",{itemSpacing:16}); f.name=name||"Card"; parent.appendChild(f);
  f.fills=[paint(tok(site, tone==="tinted"?"surface-subtle":"surface"))]; f.cornerRadius=parseFloat(tok(site,"radius-lg","10"))||10;
  const pad = site==="WEB-01" ? [32,40] : [40,40]; f.paddingTop=f.paddingBottom=pad[0]; f.paddingLeft=f.paddingRight=pad[1];
  f.layoutSizingHorizontal="FIXED"; f.resize(w, f.height); if(tone!=="tinted"){ f.effects=[{type:"DROP_SHADOW",color:{r:0,g:0,b:0,a:0.12},offset:{x:0,y:2},radius:6,spread:0,visible:true,blendMode:"NORMAL"}]; } return f; }
const CHGC = {NEW:["#1A7F37","#EDFDF0"], UPD:["#F4860C","#FFF9EB"], DEL:["#CF222E","#FFF6F5"], "AS-IS":["#57606A",null]};
const CIRC = "⓪①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳";
function ann(parent, b, w){   // lop chu thich (khong phai UI): vien + nhan badge thay doi / so item
  if (!b.chg && !b.n) return [parent, w];
  const c = CHGC[b.chg||"AS-IS"]; const f=figma.createAutoLayout("VERTICAL",{itemSpacing:4});
  f.name = "CHG-ANN · " + (b.chg||"AS-IS") + " · " + (b.n||""); parent.appendChild(f);
  f.fills = c[1] ? [{...paint(c[1]), opacity:0.55}] : []; f.paddingLeft=f.paddingRight=8; f.paddingTop=f.paddingBottom=6; f.cornerRadius=6;
  if (b.chg && b.chg!=="AS-IS") { f.strokes=[paint(c[0])]; f.strokeWeight=2; f.dashPattern=[6,4]; }
  f.layoutSizingHorizontal="FIXED"; f.resize(w, f.height);
  const lab = T(f, (b.n ? (CIRC[b.n]||("("+b.n+")"))+" " : "") + (b.chg && b.chg!=="AS-IS" ? b.chg + (b.note ? " — " + b.note : "") : ""), 0, 0, null, 11, 700, c[0]);
  lab.name = "chg-label";
  return [f, w-16]; }
function blocks(parent, site, list, w){
  for (const b0 of list) { const [parent2, w2] = ann(parent, b0, w); const b = b0;
    if (parent2 !== parent) { blocks1(parent2, site, b, w2); continue; } blocks1(parent, site, b, w); } }
function blocks1(parent, site, b, w){
  {
    if (b.t==="title") { if(site==="WEB-01"){ txt(parent,site,b.text,"heading-20-semibold","text-high"); }
       else { const c=col(parent,8,"PageHeader"); c.counterAxisAlignItems = b.variant==="mypage"?"MIN":"CENTER"; c.layoutSizingHorizontal="FIXED"; c.resize(w,c.height);
         txt(c,site,b.text, b.variant==="mypage"?"title-36":"heading-32", b.variant==="mypage"?"text-black":"text-high");
         const u=boxv(c,site, b.variant==="mypage"?w:120, b.variant==="mypage"?2:5, b.variant==="mypage"?"primary":"accent-yellow","radius-field","underline"); } }
    else if (b.t==="breadcrumb") txt(parent,site,b.items.join("  ›  "),"text-14", site==="WEB-01"?"text-low":"primary-text");
    else if (b.t==="section") txt(parent,site,b.text, site==="WEB-01"?"heading-20-bold":"heading-24-semibold", site==="WEB-01"?"text-high":"primary-text");
    else if (b.t==="text") txt(parent,site,b.text, b.tone==="note"?"text-12":"text-16", b.tone==="error"?"negative-600":(site==="WEB-01"?"text-middle":"text-high"), w);
    else if (b.t==="field") field(parent,site,b,w);
    else if (b.t==="select") field(parent,site,{...b,select:true},w);
    else if (b.t==="field2") { const r=row(parent,16,"field2"); r.counterAxisAlignItems="MIN"; for(const f of b.fields) field(r,site,f,(w-16*(b.fields.length-1))/b.fields.length); }
    else if (b.t==="radio") { const c=col(parent,8,"Radio"); txt(c,site,b.label, site==="WEB-01"?"label-14":"text-16", site==="WEB-01"?"text-label":"text-high");
       const r=row(c, site==="WEB-01"?16:32, "options"); b.options.forEach((o,k)=>{ const it=row(r,8,"opt"); const d=figma.createEllipse(); d.resize(20,20);
         d.fills=[paint(tok(site,"surface","#ffffff"))]; d.strokes=[paint(tok(site, k===(b.selected||0)?(site==="WEB-01"?"control-checked":"radio-checked"):(site==="WEB-01"?"control-border":"icon-muted")))]; d.strokeWeight= k===(b.selected||0)?6:2; it.appendChild(d);
         txt(it,site,o, site==="WEB-01"?"text-16":"text-18","text-high"); }); }
    else if (b.t==="checkbox") { const s2=b._site||site; const r=row(parent,8,"Checkbox"); const bx=boxv(r,s2,20,20, b.checked?"checkbox-checked":"surface","radius-checkbox","box"); if(!b.checked){ bx.strokes=[paint(tok(s2,"checkbox-border"))]; bx.strokeWeight=2; } txt(r,s2,b.label,"text-16","text-high"); }
    else if (b.t==="buttons") { const r=row(parent,16,"actions"); r.primaryAxisAlignItems="CENTER"; r.layoutSizingHorizontal="FIXED"; r.resize(w,r.height); for(const it of b.items) button(r,site,it); }
    else if (b.t==="table") table(parent,site,b,w);
    else if (b.t==="badge") badge(parent, b._site, b.text);
    else if (b.t==="card") { const c=card(parent, b._site, w, b.tone); if(b.title) txt(c,b._site,b.title, b._site==="WEB-01"?"heading-20-bold":"heading-20-bold","text-high");
       if(b.badge) badge(c, b.badge_from||b._site, b.badge); for(const l of (b.lines||[])) txt(c,b._site,l,"text-16", b._site==="WEB-01"?"text-middle":"text-high", w-80);
       if(b.blocks) blocks(c, b._site, b.blocks, w-80); }
    else if (b.t==="search") { const c=card(parent, site, w, "raised", "SearchCard"); const r=row(c,24,"grid"); r.counterAxisAlignItems="MIN";
       const fw=Math.floor((w-80-48)/3); for(const f of b.fields) field(r,site,{...f, select:!!f.select},fw); blocks(c,site,[{t:"buttons",items:b.buttons}],w-80); }
    else if (b.t==="steps") { const r=row(parent,24,"Steps"); b.items.forEach((s2,k)=>{ const it=row(r,8,"step"); const d=figma.createEllipse(); d.resize(32,32);
       d.fills=[paint(tok(site, k===b.active?"primary":"surface-disabled"))]; it.appendChild(d); txt(it,site,(k+1)+". "+s2, k===b.active?"text-16-bold":"text-16", k===b.active?"primary-text":"text-low"); }); }
    else if (b.t==="modal") { const s2=b._site; const m=card(parent, s2, Math.min(parseFloat(tok(s2,"modal-width","607")), w), "raised", "Modal"); m.counterAxisAlignItems="CENTER";
       txt(m,s2,b.title,"heading-20-bold","text-high"); if(b.message) txt(m,s2,b.message,"text-16","text-middle", 520);
       if(b.field) field(m,s2,b.field,520); blocks(m,s2,[{t:"buttons",items:b.buttons.map(x=>({...x,size:"sm"})),_site:s2}],520); }
    else if (b.t==="pagination") { const r=row(parent,8,"Pagination"); r.layoutSizingHorizontal="FIXED"; r.resize(w,r.height); r.primaryAxisAlignItems="MAX";
       ["‹","1","2","3","›"].forEach((p,k)=>{ const c=boxv(r,site,32,32, k===1?"primary":"surface","radius-sm","pg"); const t=txt(c,site,p,"text-14", k===1?"on-primary":"text-middle"); t.x=(32-t.width)/2; t.y=(32-t.height)/2; }); }
  } }
function shell(item){ const site=item.site; const W=parseFloat(tok(site,"viewport-web","1440"));
  const fr=figma.createAutoLayout("VERTICAL",{itemSpacing:0}); fr.name=`${item.badge} · ${item.ref} · ${item.label}`;
  fr.fills=[paint(tok(site,"page-bg","#ffffff"))]; fr.layoutSizingHorizontal="FIXED"; fr.resize(W, fr.height);
  if (item.shell==="admin") { fr.layoutMode="HORIZONTAL"; fr.primaryAxisSizingMode="FIXED"; fr.counterAxisSizingMode="AUTO"; const sw=parseFloat(tok(site,"sidebar-width","265"));
     const nav=col(fr,0,"SideNav"); nav.fills=[paint(tok(site,"page-bg"))]; nav.layoutSizingHorizontal="FIXED"; nav.resize(sw,nav.height); nav.layoutAlign="STRETCH"; nav.paddingTop=24;
     txt(nav,site,"KidoKido 管理画面","heading-18-bold","primary-text").name="logo";
     for (const m of item.nav||[]) { const it=boxv(nav,site,sw,parseFloat(tok(site,"nav-item-height","58")), m===item.nav_active?"nav-active-light":"page-bg","radius-md","nav-item");
        const t=txt(it,site,m,"nav-14", m===item.nav_active?"on-nav-active":"text-low"); t.x=24; t.y=(it.height-t.height)/2; }
     const main=col(fr,32,"main"); main.paddingLeft=20; main.paddingTop=main.paddingRight=main.paddingBottom=32; main.layoutSizingHorizontal="FIXED"; main.resize(W-sw, main.height);
     blocks(main, site, item.blocks, W-sw-52); }
  else if (item.shell==="modal") { // popup / man loi: nen mo + Modal giua
     const body=row(fr,0,"backdrop"); body.layoutSizingHorizontal="FILL"; body.primaryAxisAlignItems="CENTER"; body.paddingTop=body.paddingBottom=90;
     body.fills=[paint(tok(item.scrim_site||site, item.scrim||"page-bg"))];
     const main=col(body,0,"content"); main.layoutSizingHorizontal="FIXED"; main.resize(700, main.height); main.counterAxisAlignItems="CENTER";
     blocks(main, site, item.blocks, 680); }
  else if (item.shell==="auth" && site==="WEB-01") { // man dang nhap admin: khong sidebar, khong header — card giua page-bg
     const body=row(fr,0,"body"); body.layoutSizingHorizontal="FILL"; body.primaryAxisAlignItems="CENTER"; body.paddingTop=body.paddingBottom=120;
     const main=col(body,24,"content"); main.layoutSizingHorizontal="FIXED"; main.resize(560, main.height);
     blocks(main, site, item.blocks, 560); }
  else if (item.shell==="mobile") { // man SP: header thu gon + noi dung 1 cot (rong theo token viewport-mobile hoac viewport_width da khai)
     const MW=parseFloat(tok(site,"viewport-mobile", item.viewport_width)); fr.resize(MW, fr.height);
     const tb=row(fr,0,"AppHeader-SP"); tb.fills=[paint(tok(site,"surface-subtle"))]; tb.layoutSizingHorizontal="FILL"; tb.paddingLeft=tb.paddingRight=16; tb.paddingTop=tb.paddingBottom=16; tb.primaryAxisAlignItems="SPACE_BETWEEN";
     txt(tb,site,"ボーネルンド あそび場","heading-16-bold","primary-text"); txt(tb,site,"☰","heading-20-bold","primary-text");
     const main=col(fr,16,"content"); main.layoutSizingHorizontal="FILL"; main.paddingLeft=main.paddingRight=16; main.paddingTop=24; main.paddingBottom=40;
     blocks(main, site, item.blocks, MW-32);
     const ft=row(fr,0,"footer"); ft.fills=[paint(tok(site,"surface-subtle"))]; ft.layoutSizingHorizontal="FILL"; ft.paddingTop=ft.paddingBottom=16; ft.primaryAxisAlignItems="CENTER";
     txt(ft,site,"© BørneLund","text-12","text-high"); }
  else { // WEB-02: AppHeader 2 tang + noi dung giua + footer
     const hdr=col(fr,0,"AppHeader"); hdr.layoutSizingHorizontal="FILL";
     const tb=row(hdr,24,"topbar"); tb.fills=[paint(tok(site,"surface"))]; tb.layoutSizingHorizontal="FILL"; tb.paddingLeft=tb.paddingRight=40; tb.paddingTop=tb.paddingBottom=18; tb.primaryAxisAlignItems="MAX";
     txt(tb,site, item.shell==="auth" ? "新規利用登録 · ログイン" : "マイページ · ログアウト","text-20","primary-text");
     const band=row(hdr,48,"nav-band"); band.fills=[paint(tok(site,"surface-subtle"))]; band.layoutSizingHorizontal="FILL"; band.paddingLeft=40; band.paddingTop=band.paddingBottom=56;
     txt(band,site,"ボーネルンド あそび場","heading-16-bold","primary-text"); for(const m of ["当日利用","回数券購入","1DAYパス事前購入","年間・マンスリーパス購入","待ち時間/販売状況"]) txt(band,site,m,"heading-20-bold","primary-text");
     const body=row(fr,40,"body"); body.counterAxisAlignItems="MIN"; body.layoutSizingHorizontal="FILL"; body.paddingTop=40; body.paddingBottom=64; body.paddingLeft=40; body.paddingRight=40;
     let cw=parseFloat(tok(site,"content-max","896"));
     if (item.shell==="mypage") { const nav=col(body,0,"SideNav"); nav.fills=[paint(tok(site,"sidebar-bg"))]; nav.paddingTop=nav.paddingBottom=16;
        const sbw = parseFloat(tok(site,"sidebar-width", item.sidebar_width));
        for(const m of item.nav||[]){ const it=boxv(nav,site,sbw,parseFloat(tok(site,"nav-item-height","48")), m===item.nav_active?"surface":"sidebar-bg","radius-none","nav-item");
          const t=txt(it,site,m,"text-16", m===item.nav_active?"primary-text":"text-black"); t.x=20; t.y=(it.height-t.height)/2; } cw = W-80-sbw-40; }
     else { body.primaryAxisAlignItems="CENTER"; }
     const main=col(body,24,"content"); main.layoutSizingHorizontal="FIXED"; main.resize(cw, main.height);
     blocks(main, site, item.blocks, cw);
     const ft=row(fr,0,"footer"); ft.fills=[paint(tok(site,"surface-subtle"))]; ft.layoutSizingHorizontal="FILL"; ft.paddingTop=ft.paddingBottom=24; ft.primaryAxisAlignItems="CENTER";
     txt(ft,site,"© BørneLund","text-12","text-high"); }
  return fr; }
function descPanel(it, x, y){
  const PW = 1100; const p = F(host, "DESC · " + it.ref, x, y, PW, 200, "#FFFFFF"); p.strokes=[paint("#D0D7DE")]; p.cornerRadius=10;
  p.setSharedPluginData(NS,"kind","desc"); p.setSharedPluginData(NS,"ref",it.ref);
  let yy = 20; const b = BADGE[it.badge];
  T(p, `${it.badge} · ${it.ref} · ${it.label}`, 24, yy, PW-48, 18, 700, b.s); yy += 30;
  T(p, "Loại: " + it.stype + "   ·   Site: " + it.site + "   ·   Vào từ: " + (it.entry||"—") + (it.base ? "   ·   Màn AS-IS: " + it.base : ""), 24, yy, PW-48, 12, 500, "#57606A"); yy += 26;
  const sec = (title, color) => { const t=T(p, title, 24, yy, PW-48, 13, 700, color||"#0969DA"); yy = t.y + t.height + 6; };
  const para = (s2) => { const t=T(p, s2, 24, yy, PW-48, 12, 400, "#1F2328"); yy = t.y + t.height + 12; };
  sec("■ Mục đích màn hình"); para(it.purpose);
  if (it.changes && it.changes.length) { sec("■ Thay đổi so với AS-IS (tô màu trên mockup)", "#F4860C"); para(it.changes.map(c=>"• "+c).join("\n")); }
  sec("■ Logic màn hình — Happy case"); para(it.happy.map((h,k)=>(k+1)+". "+h).join("\n"));
  function table(name, cols, rows, fillH, fillR, strokeC, kindRow){
    const t = F(p, name, 24, yy, PW-48, 30, fillR); t.strokes=[paint(strokeC)]; t.cornerRadius=8;
    let ty2 = 0; const hdr = F(t, "hdr", 0, 0, PW-48, 30, fillH); let x=8; for (const [c,w] of cols) { T(hdr,c,x,8,w-8,11,700); x+=w; } ty2 = 30;
    rows.forEach((r,k)=>{ const rr = F(t, kindRow + " · " + it.ref + " · " + (k+1), 0, ty2, PW-48, 30, (r._chg && CHGC[r._chg][1]) || fillR);
      rr.setSharedPluginData(NS,"kind",kindRow.toLowerCase()); let x2=8, hm=30;
      r.v.forEach((v,c)=>{ const tt=T(rr, String(v||"—"), x2, 8, cols[c][1]-10, 11, c===0||(r._chg&&c===cols.length-1)?700:400, (r._chg && c===cols.length-1) ? CHGC[r._chg][0] : "#1F2328"); hm=Math.max(hm, tt.height+16); x2+=cols[c][1]; });
      rr.resize(PW-48, hm); ty2 += hm; });
    t.resize(PW-48, ty2); yy = t.y + ty2 + 18; return t; }
  sec("■ Bảng ITEMS (số ① trên mockup)");
  table("ITEMS · " + it.ref, [["#",36],["Item",190],["Mô tả",290],["Action / Behavior",420],["Thay đổi",116]],
        it.items.map(r=>({v:[CIRC[r.n]||r.n, r.title, r.desc, r.action, r.chg||it.badge], _chg:r.chg||(it.badge==="NEW"?"NEW":null)})), "#DAEEF3", "#FFFFFF", "#D0D7DE", "ITEM");
  sec("■ ERROR SCENARIOS — nếu lỗi thì hiển thị gì", "#CF222E");
  table("ERRORS · " + it.ref, [["#",36],["Trigger (nguyên nhân)",250],["Hiển thị",110],["Message + Action tiếp theo",656]],
        it.errors.map((r,k)=>({v:[String(k+1), r.trigger, r.display, r.msg]})), "#FFE3E3", "#FFFBFB", "#CF222E", "ERR");
  if (it.cq) { sec("■ Chờ xác nhận", "#6639BA"); para(it.cq); }
  p.resize(PW, yy + 10); return p; }
for (const it of D.items) {
  host = hostFor(it.site); touched.add(host);
  let yStart = 120; for (const c of host.children) if (c.name.startsWith("cap ·") || c.name.startsWith("DESC ·") || /^(NEW|UPD|DEL) · /.test(c.name)) yStart = Math.max(yStart, c.y + c.height + 200);
  const x = 40;
  const cap = T(host, `${it.badge} · ${it.ref} · ${it.label}`, x, yStart, 1440, 18, 700, BADGE[it.badge].s); cap.name = "cap · " + it.ref;
  const note = T(host, "DS: " + it.ds.join(", ") + (it.borrow.length ? "  ·  MƯỢN: " + it.borrow.join(", ") + " (chờ designer)" : "") + (it.sidebar_note ? "  ·  sidebar " + it.sidebar_width + "px: " + it.sidebar_note : "") + (it.viewport_note ? "  ·  viewport SP " + it.viewport_width + "px: " + it.viewport_note : "") + "  ·  Font Hiragino Kaku Gothic Pro → hiển thị Noto Sans JP (Figma không có font gốc)", x, yStart+28, 1440, 11, 400, "#57606A"); note.name="cap-note";
  const fr = shell(it); host.appendChild(fr); fr.x = x; fr.y = yStart + 70;
  const b = BADGE[it.badge]; fr.strokes=[paint(b.s)]; fr.strokeWeight=4; if (b.d) fr.dashPattern=[10,6];
  fr.setSharedPluginData(NS,"kind","mockup"); fr.setSharedPluginData(NS,"ds",it.ds.join(";")); fr.setSharedPluginData(NS,"site",it.site);
  created.push(fr.id);
  const dp = descPanel(it, x + fr.width + 60, yStart + 70);
}
for (const h of touched) { let hh=0, ww=0; for (const c of h.children){ hh=Math.max(hh,c.y+c.height); ww=Math.max(ww,c.x+c.width);} h.resizeWithoutConstraints(Math.max(3120,ww+60), hh+60); }
// section CR-3 lon len -> day section ben duoi xuong, khong chong nhau
const secs = s.children.filter(c=>c.name.startsWith("CR-3 Screens")).sort((a,b)=>a.y-b.y);
for (let i=1;i<secs.length;i++) if (secs[i].y < secs[i-1].y + secs[i-1].height + 120) secs[i].y = secs[i-1].y + secs[i-1].height + 120;
fit(s);
return {hosts: [...touched].map(h=>h.id), created};
