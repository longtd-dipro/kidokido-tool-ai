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


const D = {"note": "Dựng từ tokens.json + component README của Design System baseline (đã đọc: WEB-02/README.md, WEB-02/tokens.json, WEB-01/README.md, WEB-01/tokens.json, 04_DesignSystem/STATUS.md, 04_DesignSystem/STATUS.md, components/README.md, components/README.md). Dữ liệu mẫu theo DATA-PRIVACY §4. Viền khung = badge thay đổi.", "items": [{"badge": "UPD", "ref": "SC-067", "site": "WEB-02", "shell": "public", "label": "[WEB-02] 店舗詳細 — ①-B đã mở 1 tháng (PC)", "stype": "Detail", "entry": "SC-067 bấm もっと見る", "purpose": "Trạng thái sau khi bấm 「もっと見る（1か月）」 ở 1 sản phẩm: lưới mở đủ 30 ngày (mỗi hàng 1 tuần tính từ hôm nay), nút đổi thành 「閉じる」. Sản phẩm khác giữ 7 ngày.", "happy": ["もっと見る → tải 30 ngày (API-075 bookingDays=30) → lưới 5 hàng", "Bấm ○ → SC-050 (luồng cũ)", "閉じる → thu về 7 ngày, cuộn về đầu khối sản phẩm"], "blocks": [{"t": "breadcrumb", "items": ["トップ", "店舗一覧", "店舗A"], "n": 1, "_site": "WEB-02"}, {"t": "title", "text": "店舗A", "n": 2, "_site": "WEB-02"}, {"t": "card", "tone": "raised", "title": "店舗情報", "lines": ["連絡先：090-0000-0000", "住所：Số 1, Đường ABC, Quận 1, TP.HCM", "営業時間：10:00～18:00 <最終受付17:00>"], "n": 3, "_site": "WEB-02"}, {"t": "card", "tone": "tinted", "title": "2026/10/22(木) 本日の空き状況", "lines": ["1DAYパス ○ 空きあり", "時間制パス △ 入場制限中"], "n": 4, "_site": "WEB-02"}, {"t": "buttons", "items": [{"text": "今から利用する", "variant": "solid"}], "n": 5, "_site": "WEB-02"}, {"t": "section", "text": "事前予約", "n": 6, "_site": "WEB-02"}, {"t": "text", "text": "1DAYパス（平日）　10/22〜11/20（1か月分）", "chg": "UPD", "note": "tiêu đề khối + khoảng ngày", "n": 7, "_site": "WEB-02"}, {"t": "table", "from": "WEB-01", "cols": ["週", "木", "金", "土", "日", "月", "火", "水"], "widths": [92, 114, 114, 114, 114, 114, 114, 114], "rows": [["第1週", "10/22 ○", "10/23 ○", "10/24 —", "10/25 —", "10/26 ○", "10/27 ○", "10/28 ○"], ["第2週", "10/29 ○", "10/30 ○", "10/31 —", "11/1 × 完売", "11/2 ○", "11/3 ○", "11/4 ○"], ["第3週", "11/5 ○", "11/6 ○", "11/7 —", "11/8 —", "11/9 ○", "11/10 ○", "11/11 ○"], ["第4週", "11/12 ○", "11/13 ○", "11/14 —", "11/15 —", "11/16 ○", "11/17 ○", "11/18 ○"], ["第5週", "11/19 ○", "11/20 ○", "", "", "", "", ""]], "chg": "UPD", "note": "mở 1 tháng — 30 ngày, mỗi hàng 1 tuần", "n": 8, "_site": "WEB-01"}, {"t": "buttons", "items": [{"text": "閉じる", "variant": "outline", "size": "sm"}], "chg": "NEW", "note": "thay cho もっと見る khi đang mở", "n": 9, "_site": "WEB-02"}, {"t": "table", "from": "WEB-01", "cols": ["商品", "10/22 木", "10/23 金", "10/24 土", "10/25 日", "10/26 月", "10/27 火", "10/28 水"], "widths": [208, 96, 96, 96, 96, 96, 96, 96], "rows": [["1DAYパス（休日）", "—", "—", "○", "×", "—", "—", "—"]], "chg": "UPD", "note": "sản phẩm khác vẫn 7 ngày", "n": 10, "_site": "WEB-01"}, {"t": "buttons", "items": [{"text": "もっと見る（1か月）", "variant": "outline", "size": "sm"}], "chg": "NEW", "n": 11, "_site": "WEB-02"}], "errors": [{"trigger": "Tải 30 ngày lỗi", "display": "Toast", "msg": "「システムエラーが発生しました。…」(thật) — giữ lịch 7 ngày, nút vẫn là もっと見る"}, {"trigger": "Ngày đã 完売", "display": "Inline", "msg": "Ô hiện × 完売 (thật) — không chọn được"}, {"trigger": "Sau 30 ngày không có lịch bán", "display": "Inline", "msg": "Ô hiện — (thật)"}], "base": "SC-067", "changes": ["⑦ ⑧ Lưới mở 30 ngày (UPD)", "⑨ Nút 閉じる (NEW)", "⑩ ⑪ Sản phẩm khác giữ 7 ngày + もっと見る"], "ds": ["DS-component:WEB-01:Table", "DS-component:WEB-02:AppHeader", "DS-component:WEB-02:Breadcrumb", "DS-component:WEB-02:Button", "DS-component:WEB-02:Card", "DS-component:WEB-02:PageHeader"], "cq": "CQ-001 / CQ-002 (1 tháng = 30 ngày từ hôm nay; tuần = 7 ngày từ hôm nay) · CQ-003", "items": [{"n": 1, "title": "Breadcrumb", "desc": "トップ › 店舗一覧 › 店舗A", "action": "—", "chg": null}, {"n": 2, "title": "Tiêu đề trang 「店舗A」", "desc": "PageHeader", "action": "—", "chg": null}, {"n": 3, "title": "Khối thông tin 「店舗情報」", "desc": "連絡先：090-0000-0000; 住所：Số 1, Đường ABC, Quận 1, TP.HCM; 営業時間：10:00～18:00 <最終受付17:00>", "action": "—", "chg": null}, {"n": 4, "title": "Khối thông tin 「2026/10/22(木) 本日の空き状況」", "desc": "1DAYパス ○ 空きあり; 時間制パス △ 入場制限中", "action": "—", "chg": null}, {"n": 5, "title": "Nút 今から利用する", "desc": "chính", "action": "—", "chg": null}, {"n": 6, "title": "Tiêu đề nhóm", "desc": "事前予約", "action": "—", "chg": null}, {"n": 7, "title": "Câu hướng dẫn / ghi chú", "desc": "1DAYパス（平日）　10/22〜11/20（1か月分） — tiêu đề khối + khoảng ngày", "action": "—", "chg": "UPD"}, {"n": 8, "title": "Bảng", "desc": "週 · 木 · 金 · 土 · 日 · 月 · 火 · 水 — mở 1 tháng — 30 ngày, mỗi hàng 1 tuần", "action": "TAP ○ → SC-050", "chg": "UPD"}, {"n": 9, "title": "Nút 閉じる", "desc": "phụ — thay cho もっと見る khi đang mở", "action": "TAP → thu về 7 ngày", "chg": "NEW"}, {"n": 10, "title": "Bảng", "desc": "商品 · 10/22 木 · 10/23 金 · 10/24 土 · 10/25 日 · 10/26 月 · 10/27 火 · 10/28 水 — sản phẩm khác vẫn 7 ngày", "action": "—", "chg": "UPD"}, {"n": 11, "title": "Nút もっと見る（1か月）", "desc": "phụ", "action": "TAP → mở 1 tháng sản phẩm này (độc lập)", "chg": "NEW"}], "borrow": ["WEB-01"]}], "tok": {"WEB-02": {"t": {"primary": "#0068b7", "primary-text": "#0068b7", "on-primary": "#ffffff", "primary-subtle": "#f3faff", "primary-tint": "#dbf0ff", "panel-bg-alt": "#e2f2fc", "panel-inner-bg": "#f7fbff", "accent-yellow": "#ffe732", "accent-orange-soft": "#ffc086", "accent-blue": "#1976d2", "white": "#ffffff", "page-bg": "#ffffff", "surface": "#ffffff", "surface-subtle": "#f4faff", "surface-gray": "#fafafa", "surface-cream": "#f8f7e1", "sidebar-bg": "#fffbf8", "calendar-cell-bg": "#fffaf5", "calendar-holiday-bg": "#ffebeb", "surface-disabled": "#e6e1e1", "text-high": "#313131", "text-middle": "#313131", "text-low": "#979797", "text-black": "#000000", "text-field": "#000000de", "text-dark": "#262627", "text-system-page": "#4b5563", "link-legal": "#0000ff", "icon-default": "#0000008a", "icon-muted": "#00000099", "radio-checked": "#92e4cd", "checkbox-checked": "#2563eb", "checkbox-border": "#6b7280", "field-border-dark": "#313131", "card-border-soft": "#efefef", "field-bg-readonly": "#d9d9d94d", "divider-low": "#e5e7eb", "divider-middle": "#d9d9d9", "negative-600": "#dc0404", "negative-500": "#dc0404", "overlay-scrim": "rgba(180, 180, 180, 0.2)", "space-4": "4px", "space-6": "6px", "space-8": "8px", "space-10": "10px", "space-12": "12px", "space-14": "14px", "space-16": "16px", "space-16.5": "16.5px", "space-20": "20px", "space-21": "21px", "space-24": "24px", "space-25": "25px", "space-28": "28px", "space-30": "30px", "space-32": "32px", "space-40": "40px", "space-48": "48px", "space-64": "64px", "space-80": "80px", "space-96": "96px", "radius-none": "0px", "radius-sm": "4px", "radius-checkbox": "5px", "radius-md": "8px", "radius-field": "10px", "radius-lg": "12px", "radius-xl": "20px", "radius-button": "40px", "radius-pill": "100px", "radius-full": "9999px", "radius-circle": "50%", "shadow-flat": "none", "shadow-raise": "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px", "shadow-card-sm": "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.1) 0px 2px 4px -2px", "shadow-button": "rgba(38, 36, 44, 0.18) 0px 2px 2px 0px", "shadow-button-inline": "rgba(38, 36, 44, 0.18) 1px 3px 4px 0px", "shadow-float": "rgba(76, 78, 100, 0.22) 0px 2px 10px 0px", "shadow-popout": "0px 30px 84px rgba(19, 10, 46, 0.08), 0px 8px 32px rgba(19, 10, 46, 0.07), 0px 3px 14px rgba(19, 10, 46, 0.03), 0px 1px 3px rgba(19, 10, 46, 0.13)", "viewport-web": "1440px", "header-height": "216px", "topbar-height": "64px", "nav-band-height": "152px", "nav-item-height": "48px", "control-sm": "38px", "control-md": "64px", "control-lg": "72px", "field-height": "56px", "content-max": "896px", "cta-height": "80px", "search-height": "72px", "stepper-button-size": "40px", "product-row-height": "108px", "date-bar-height": "72px", "summary-bar-height": "6px", "footer-height": "282px"}, "type": {"title-36": {"size": 36.0, "weight": 500}, "heading-32": {"size": 32.0, "weight": 500}, "heading-24-semibold": {"size": 24.0, "weight": 600}, "heading-24-bold": {"size": 24.0, "weight": 700}, "heading-20-bold": {"size": 20.0, "weight": 700}, "heading-16-bold": {"size": 16.0, "weight": 700}, "heading-40": {"size": 40.0, "weight": 600}, "text-20": {"size": 20.0, "weight": 400}, "text-18": {"size": 18.0, "weight": 500}, "text-16": {"size": 16.0, "weight": 400}, "text-16-medium": {"size": 16.0, "weight": 500}, "text-16-bold": {"size": 16.0, "weight": 700}, "text-16-light": {"size": 16.0, "weight": 300}, "text-14": {"size": 14.0, "weight": 500}, "text-14-light": {"size": 14.0, "weight": 300}, "text-14-ui": {"size": 14.0, "weight": 400}, "text-12": {"size": 12.0, "weight": 400}, "text-18-loose": {"size": 18.0, "weight": 400}, "legend-16": {"size": 16.0, "weight": 400}}}, "WEB-01": {"t": {"brand-blue": "#0068b7", "brand-yellow": "#ffe100", "primary": "#006dc6", "primary-gradient-top": "#5aa7f2", "primary-text": "#006dc6", "on-primary": "#ffffff", "primary-subtle": "#9ae9ff", "nav-active-light": "#68b5ff", "nav-active-dark": "#1a7dce", "on-nav-active": "#f5f5f5", "nav-open-bg": "#2422200a", "scan-header-end": "#a6c8e1", "scan-tab-bg": "#ecf6fe", "mui-primary": "#1976d2", "mui-primary-track": "#1976d280", "white": "#ffffff", "page-bg": "#f4faff", "surface": "#ffffff", "surface-subtle": "#e9faff", "surface-menu": "#f5f5f5", "surface-disabled": "#d9dde1", "highlight": "#caf0f8", "accent-orange": "#ff8100", "stat-purple": "#9155fd", "stat-green": "#03a477", "stat-magenta": "#b83392", "stat-amber": "#ffb400", "action-add-bg": "#e0f4cb", "text-high": "#000000", "text-middle": "#000000de", "text-low": "#676767", "text-label": "#262627", "text-table-header": "#313035", "text-placeholder": "#b4b2b7", "text-stat-label": "#3a3541ad", "text-stat-value": "#3a3541de", "text-hint": "#00000073", "text-disabled": "#00000061", "text-link": "#2cabf3", "icon-default": "#0000008a", "icon-disabled": "#00000042", "editor-icon": "#444444", "neutral-600": "#4b5563", "control-border": "#00000099", "field-border": "#979797", "field-border-form": "#d9d9d9", "field-reader-bg": "#f8faff", "field-reader-border": "#a0d6ff", "text-reader-placeholder": "#8b849b", "schedule-bar-border": "#5aa7f2", "control-disabled": "#bababa", "control-checked": "#92e4cd", "divider-low": "#e0e0e0", "divider-middle": "#d9d9d9", "divider-outline": "#0000003b", "negative-600": "#dc0404", "success-500": "#22c55e", "success-100": "#b8f2dc", "success-header": "#bdf3de", "success-border": "#44e3b0", "success-700": "#0f926a", "warning-100": "#fff1e0", "warning-header": "#ffe0c8", "warning-border": "#ffb06f", "warning-800": "#f54d1d", "negative-100": "#ffe5e5", "negative-header": "#ffd5d6", "negative-border": "#ff9b9c", "negative-500": "#e82429", "negative-700": "#e52127", "space-2": "2px", "space-4": "4px", "space-6": "6px", "space-7": "7px", "space-8": "8px", "space-10": "10px", "space-12": "12px", "space-12.5": "12.5px", "space-15": "15px", "space-16": "16px", "space-20": "20px", "space-24": "24px", "space-25": "25px", "space-32": "32px", "space-40": "40px", "space-48": "48px", "radius-none": "0px", "radius-xs": "2px", "radius-sm": "4px", "radius-md": "8px", "radius-nav": "12px", "radius-lg": "10px", "radius-xl": "24px", "radius-segment": "20px", "radius-scan": "16px", "radius-scan-control": "7px", "radius-pill": "30px", "radius-full": "9999px", "radius-circle": "50%", "shadow-flat": "none", "shadow-raise": "rgba(76, 78, 100, 0.22) 0px 2px 10px 0px", "shadow-button": "rgba(38, 36, 44, 0.18) 0px 2px 2px 0px", "shadow-paper": "rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px", "shadow-md": "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.1) 0px 2px 4px -2px", "shadow-popout": "rgba(0, 0, 0, 0.3) 0px 4px 8px 0px, rgba(0, 0, 0, 0.2) 0px 12px 24px 0px", "shadow-pager": "rgba(0, 0, 0, 0.16) 0px 4px 7px 0px", "shadow-stat-icon": "rgba(58, 53, 65, 0.2) 0px 2px 0.5px 0px, rgba(58, 53, 65, 0.14) 0px 1px 0.5px 0px, rgba(58, 53, 65, 0.12) 0px 1px 1.5px 0px", "viewport-web": "1440px", "sidebar-width": "265px", "nav-item-height": "58px", "control-sm": "34.13px", "control-md": "48px", "control-lg": "56px", "icon-button-size": "40px", "pagination-item-size": "32px", "tab-height": "48px", "table-header-height": "54px", "table-row-height": "52px", "modal-width": "607px", "modal-button-width": "145px", "toast-width": "360px", "segment-height": "64px", "scan-camera-size": "270px", "scan-card-width": "646px", "stat-icon-size": "40px", "header-height": "99px"}, "type": {"heading-30-bold": {"size": 30.0, "weight": 700}, "heading-20-semibold": {"size": 20.0, "weight": 600}, "heading-20-bold": {"size": 20.0, "weight": 700}, "heading-18-bold": {"size": 18.0, "weight": 700}, "text-16": {"size": 16.0, "weight": 400}, "text-16-light": {"size": 16.0, "weight": 300}, "text-16-medium": {"size": 16.0, "weight": 500}, "text-16-bold": {"size": 16.0, "weight": 700}, "label-14": {"size": 14.0, "weight": 500}, "label-14-bold": {"size": 14.0, "weight": 700}, "nav-14": {"size": 14.0, "weight": 500}, "text-14": {"size": 14.0, "weight": 400}, "caption-14": {"size": 14.0, "weight": 400}, "text-12": {"size": 12.0, "weight": 400}, "stat-16-medium": {"size": 16.0, "weight": 500}, "caption-14-roboto": {"size": 14.0, "weight": 400}, "text-18-semibold": {"size": 18.0, "weight": 600}, "text-12-hint": {"size": 12.0, "weight": 300}}}}};
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
