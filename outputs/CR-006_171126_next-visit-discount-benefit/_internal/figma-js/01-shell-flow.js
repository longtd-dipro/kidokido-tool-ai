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


const D = {"subtitle": "Baseline ver2_301026_baseline-cr002 → CR-006_171126_next-visit-discount-benefit · 39 hạng mục · 実装 52 MD (đơn giá DRAFT) · Không sửa Output 1/2 baseline — chỉ vẽ phần CR chạm + hàng xóm 1 bước", "flow_note": "Chỉ các lane FL-xx của baseline bị CR chạm (+ lane nghiệp vụ mới). Node AS-IS = giữ nguyên làm ngữ cảnh.", "flows": [{"lane": "FL-03", "title": "Thiết lập vé & cấu hình — thêm chiến dịch ưu đãi (lane baseline + màn admin mới)", "note": "CR-006.2 · nhân viên vận hành cấu hình chiến dịch cấp ưu đãi · NG = lỗi đã chốt / đề xuất; chưa chốt → panel EDGE", "nodes": [{"key": "a", "type": "actor", "pos": 1, "badge": "AS-IS", "ref": "FL-03", "label": "Admin / Super Admin", "sub": "không đổi"}, {"key": "s", "type": "start", "pos": 2, "badge": "NEW", "ref": "IMP-001", "label": "Mở màn 割引特典キャンペーン", "sub": "/admin/discount-campaigns"}, {"key": "f", "type": "step", "pos": 3, "badge": "NEW", "ref": "IMP-002", "label": "Tạo / sửa chiến dịch", "sub": "điều kiện cấp · nội dung ưu đãi · thời hạn"}, {"key": "d", "type": "decision", "pos": 4, "badge": "NEW", "ref": "IMP-002", "label": "Điều kiện hợp lệ?", "sub": "validate thời gian · đối tượng · nội dung"}, {"key": "e1", "type": "end", "pos": 5, "result": "ok", "badge": "NEW", "ref": "IMP-001", "label": "Chiến dịch được lưu", "sub": "trạng thái Active / Draft"}, {"key": "ng", "type": "ng", "pos": 4, "row": 1, "badge": "NEW", "ref": "IMP-002", "label": "Thiếu trường / thời gian sai → inline error", "sub": "「<項目名>を入力してください」(đề xuất, cùng mẫu baseline) · ở lại form"}, {"key": "e2", "type": "end", "pos": 5, "row": 1, "result": "fail", "badge": "NEW", "ref": "IMP-002", "label": "Người soạn sửa lại", "sub": "nhập lại điều kiện"}, {"key": "e", "type": "edge", "pos": 6, "badge": "NEW", "ref": "IMP-002", "label": "Thời điểm cấp (checkout / check-in / mua hàng) — CQ-001"}], "edges": [["a", "s", "", ""], ["s", "f", "mở form", ""], ["f", "d", "lưu", ""], ["d", "e1", "YES", ""], ["d", "ng", "NO", "ng"], ["ng", "e2", "", "ng"]]}, {"lane": "CR-NEW-1", "title": "Cấp ưu đãi tự động + xem ưu đãi trên MyPage (nghiệp vụ mới)", "note": "CR-006.1 · CR-006.3 · batch cấp sau khi khách hoàn tất lượt khu vui chơi + section MyPage · NG = lỗi đã chốt / đề xuất; chưa chốt → panel EDGE", "nodes": [{"key": "a", "type": "actor", "pos": 1, "badge": "AS-IS", "ref": "FL-09", "label": "Khách hàng (user)", "sub": "đã đăng nhập"}, {"key": "s", "type": "start", "pos": 2, "badge": "NEW", "ref": "IMP-015", "label": "Hoàn tất lượt khu vui chơi", "sub": "booking.checked_out_at ≠ null"}, {"key": "f", "type": "step", "pos": 3, "badge": "NEW", "ref": "IMP-015", "label": "Batch quét + cấp ưu đãi", "sub": "idempotent · cron 10 phút"}, {"key": "d", "type": "decision", "pos": 4, "badge": "NEW", "ref": "IMP-015", "label": "Thuộc chiến dịch Active?", "sub": "đối chiếu discount_campaigns"}, {"key": "f2", "type": "step", "pos": 5, "badge": "NEW", "ref": "IMP-005", "label": "Khách xem ưu đãi trên MyPage", "sub": "/user/my-page/discounts"}, {"key": "e1", "type": "end", "pos": 6, "result": "ok", "badge": "NEW", "ref": "IMP-005", "label": "Ưu đãi ở trạng thái Available", "sub": "sẵn sàng dùng lần sau"}, {"key": "ng", "type": "ng", "pos": 4, "row": 1, "badge": "NEW", "ref": "IMP-015", "label": "Không thuộc chiến dịch → không cấp", "sub": "log + bỏ qua (đề xuất)"}, {"key": "e2", "type": "end", "pos": 5, "row": 1, "result": "fail", "badge": "NEW", "ref": "IMP-015", "label": "Khách không nhận ưu đãi lần này", "sub": "giữ trạng thái cũ"}, {"key": "e", "type": "edge", "pos": 6, "badge": "NEW", "ref": "IMP-015", "label": "Thời điểm cấp + thời hạn — CQ-001 · CQ-002 · CQ-003"}], "edges": [["a", "s", "", ""], ["s", "f", "trigger batch", ""], ["f", "d", "kiểm", ""], ["d", "f2", "YES", ""], ["f2", "e1", "xem", ""], ["d", "ng", "NO", "ng"], ["ng", "e2", "", "ng"]]}, {"lane": "FL-08", "title": "Mua vé & thanh toán — thông báo ưu đãi + áp dụng khi thanh toán (lane baseline)", "note": "CR-006.3 · CR-006.4 · SC-048/049 hiển thị thông báo ưu đãi · SC-050/054 áp dụng + checkbox 「このご予約では使わない」 · NG = lỗi đã chốt / đề xuất; chưa chốt → panel EDGE", "nodes": [{"key": "a", "type": "actor", "pos": 1, "badge": "AS-IS", "ref": "FL-08", "label": "Khách hàng", "sub": "đã đăng nhập"}, {"key": "t", "type": "start", "pos": 2, "badge": "UPD", "ref": "SC-048", "label": "Chọn vé (SC-048 / SC-049)", "sub": "+ khối thông báo ưu đãi sẽ nhận"}, {"key": "f", "type": "step", "pos": 3, "badge": "UPD", "ref": "SC-050", "label": "Màn thanh toán (SC-050 / SC-054)", "sub": "+ 3 dòng giá · checkbox 「このご予約では使わない」"}, {"key": "d", "type": "decision", "pos": 4, "badge": "NEW", "ref": "IMP-012", "label": "Có ưu đãi hợp lệ cho đơn?", "sub": "query user_discounts"}, {"key": "f2", "type": "step", "pos": 5, "badge": "UPD", "ref": "SC-050", "label": "Tự tick áp dụng + tính lại tổng", "sub": "Holding + applied_user_discount_id"}, {"key": "e1", "type": "end", "pos": 6, "result": "ok", "badge": "UPD", "ref": "SC-050", "label": "Thanh toán xong, ưu đãi → Used", "sub": "callback GMO cập nhật"}, {"key": "ng", "type": "ng", "pos": 4, "row": 1, "badge": "NEW", "ref": "IMP-012", "label": "Không có ưu đãi → bố cục 3 dòng ẩn", "sub": "hiển thị 1 dòng tổng tiền như cũ"}, {"key": "e2", "type": "end", "pos": 5, "row": 1, "result": "fail", "badge": "UPD", "ref": "SC-050", "label": "Thanh toán như baseline", "sub": "không có khối giảm giá"}, {"key": "e", "type": "edge", "pos": 6, "badge": "NEW", "ref": "IMP-008", "label": "Checkbox 「このご予約では使わない」 (phương án ①-A) — CQ-007"}], "edges": [["a", "t", "", ""], ["t", "f", "tiếp tục", ""], ["f", "d", "kiểm", ""], ["d", "f2", "YES", ""], ["f2", "e1", "thanh toán", ""], ["d", "ng", "NO", "ng"], ["ng", "e2", "", "ng"]]}, {"lane": "CR-NEW-2", "title": "Liên kết giảm giá sang Smaregi + tổng hợp OBIC (nghiệp vụ mới)", "note": "CR-006.6 · CR-006.7 · gửi 「subtotalDiscountPrice」 + xuất OBIC mã Discount riêng · NG = lỗi đã chốt / đề xuất; chưa chốt → panel EDGE", "nodes": [{"key": "a", "type": "actor", "pos": 1, "badge": "AS-IS", "ref": "FL-08", "label": "Hệ thống (webhook)", "sub": "sau khi callback GMO OK"}, {"key": "s", "type": "start", "pos": 2, "badge": "UPD", "ref": "IMP-013", "label": "Gửi 仮販売登録 sang Smaregi", "sub": "payload có booking + giảm giá"}, {"key": "f", "type": "step", "pos": 3, "badge": "UPD", "ref": "IMP-013", "label": "Thêm subtotalDiscountPrice + tên ưu đãi", "sub": "remark lưu tên chiến dịch"}, {"key": "d", "type": "decision", "pos": 4, "badge": "UPD", "ref": "IMP-013", "label": "Smaregi phản hồi OK?", "sub": "webhook response"}, {"key": "f2", "type": "step", "pos": 5, "badge": "UPD", "ref": "IMP-018", "label": "Sinh dòng OBIC Discount", "sub": "kind = Discount · user_discount_usage_id"}, {"key": "e1", "type": "end", "pos": 6, "result": "ok", "badge": "UPD", "ref": "IMP-018", "label": "OBIC CSV có dòng giảm giá", "sub": "không chênh lệch với Receipt"}, {"key": "ng", "type": "ng", "pos": 4, "row": 1, "badge": "UPD", "ref": "IMP-013", "label": "Smaregi lỗi / gói không hỗ trợ", "sub": "「Smaregi 連携エラー」(đề xuất) + retry"}, {"key": "e2", "type": "end", "pos": 5, "row": 1, "result": "fail", "badge": "UPD", "ref": "IMP-013", "label": "Nhân viên quầy nhập giảm giá thủ công", "sub": "fallback hiện tại"}, {"key": "e", "type": "edge", "pos": 6, "badge": "NEW", "ref": "IMP-013", "label": "Gói hợp đồng Smaregi + API 仮販売登録 / 取引取得 — CQ-009 · CQ-011"}], "edges": [["a", "s", "", ""], ["s", "f", "mở rộng payload", ""], ["f", "d", "gửi", ""], ["d", "f2", "YES", ""], ["f2", "e1", "xuất OBIC", ""], ["d", "ng", "NO", "ng"], ["ng", "e2", "", "ng"]]}, {"lane": "FL-09", "title": "Quản lý trang cá nhân → quản lý trạng thái ưu đãi (lane baseline + màn user mới)", "note": "CR-006.5 · trạng thái 5 tầng Available / Holding / Used / Expired / Cancelled · NG = lỗi đã chốt / đề xuất; chưa chốt → panel EDGE", "nodes": [{"key": "a", "type": "actor", "pos": 1, "badge": "AS-IS", "ref": "FL-09", "label": "Khách hàng", "sub": "đã đăng nhập"}, {"key": "s", "type": "start", "pos": 2, "badge": "NEW", "ref": "IMP-005", "label": "Vào MyPage → 割引特典一覧", "sub": "menu MyPage mới"}, {"key": "f", "type": "step", "pos": 3, "badge": "NEW", "ref": "IMP-005", "label": "Xem danh sách ưu đãi", "sub": "theo trạng thái · thời hạn · sản phẩm"}, {"key": "d", "type": "decision", "pos": 4, "badge": "NEW", "ref": "IMP-016", "label": "Đã hết hạn?", "sub": "batch chạy 00:30 hằng ngày"}, {"key": "e1", "type": "end", "pos": 5, "result": "ok", "badge": "NEW", "ref": "IMP-005", "label": "Dùng được cho đặt chỗ sau", "sub": "Available"}, {"key": "ng", "type": "ng", "pos": 4, "row": 1, "badge": "NEW", "ref": "IMP-016", "label": "Hết hạn → chuyển Expired", "sub": "「有効期限切れ」(đề xuất) · hiển thị xám"}, {"key": "e2", "type": "end", "pos": 5, "row": 1, "result": "fail", "badge": "NEW", "ref": "IMP-016", "label": "Không dùng được nữa", "sub": "giữ trong lịch sử"}, {"key": "e", "type": "edge", "pos": 6, "badge": "NEW", "ref": "IMP-014", "label": "Hoàn tiền sau khi đã dùng — xét thủ công? CQ-004 · CQ-005"}], "edges": [["a", "s", "", ""], ["s", "f", "mở", ""], ["f", "d", "kiểm", ""], ["d", "e1", "NO", ""], ["d", "ng", "YES", "ng"], ["ng", "e2", "", "ng"]]}, {"lane": "FL-05", "title": "Vận hành đặt chỗ → chi tiết ưu đãi trên booking + báo cáo chiến dịch (lane baseline)", "note": "CR-006.5 · CR-006.12 · nhân viên xem ưu đãi đã dùng, kiểm tra đối soát · NG = lỗi đã chốt / đề xuất; chưa chốt → panel EDGE", "nodes": [{"key": "a", "type": "actor", "pos": 1, "badge": "AS-IS", "ref": "FL-05", "label": "Admin cửa hàng", "sub": "đã đăng nhập"}, {"key": "s", "type": "start", "pos": 2, "badge": "UPD", "ref": "SC-005", "label": "Mở 予約詳細 (SC-005)", "sub": "+ khối ưu đãi đã dùng"}, {"key": "f", "type": "step", "pos": 3, "badge": "NEW", "ref": "IMP-003", "label": "Mở 割引特典一覧 theo chiến dịch", "sub": "/admin/discount-campaigns/:id/usages"}, {"key": "d", "type": "decision", "pos": 4, "badge": "NEW", "ref": "IMP-038", "label": "Chạy báo cáo hiệu quả?", "sub": "option CR-006.12"}, {"key": "f2", "type": "step", "pos": 5, "badge": "NEW", "ref": "IMP-038", "label": "Mở 効果レポート", "sub": "chỉ số khách quay lại, giá trị TB"}, {"key": "e1", "type": "end", "pos": 6, "result": "ok", "badge": "NEW", "ref": "IMP-038", "label": "Xuất CSV đánh giá", "sub": "phục vụ ROI"}, {"key": "ng", "type": "ng", "pos": 3, "row": 1, "badge": "IMPACT", "ref": "SC-005", "label": "Khác tenant → 403", "sub": "giữ quy tắc baseline"}, {"key": "e2", "type": "end", "pos": 5, "row": 1, "result": "fail", "badge": "IMPACT", "ref": "SC-005", "label": "Không thấy dữ liệu đoàn khác", "sub": "security baseline"}, {"key": "e", "type": "edge", "pos": 6, "badge": "NEW", "ref": "IMP-003", "label": "Mã OBIC cho ưu đãi — CQ-011"}], "edges": [["a", "s", "", ""], ["s", "f", "điều hướng", ""], ["f", "d", "chọn", ""], ["d", "f2", "YES", ""], ["f2", "e1", "xuất", ""], ["s", "ng", "khác tenant", "ng"], ["ng", "e2", "", "ng"]]}], "tech": [{"badge": "NEW", "ref": "IMP-019", "label": "discount_campaigns", "sub": "bảng mới — cấu hình chiến dịch"}, {"badge": "NEW", "ref": "IMP-020", "label": "discount_campaign_targets", "sub": "bảng mới — cửa hàng + sản phẩm"}, {"badge": "NEW", "ref": "IMP-021", "label": "user_discounts", "sub": "bảng mới — ưu đãi khách nhận"}, {"badge": "NEW", "ref": "IMP-022", "label": "user_discount_usages", "sub": "bảng mới — lịch sử dùng ưu đãi"}, {"badge": "UPD", "ref": "table:bookings", "label": "bookings — + applied_user_discount_id, discount_amount", "sub": "2 cột mới nullable"}, {"badge": "UPD", "ref": "table:booking_obic_codes", "label": "booking_obic_codes — enum Discount", "sub": "+ cột user_discount_usage_id"}, {"badge": "NEW", "ref": "IMP-010", "label": "Nhóm API admin discount-campaigns (CRUD + usages)", "sub": "4 endpoint"}, {"badge": "NEW", "ref": "IMP-011", "label": "API user discounts + estimate", "sub": "2 endpoint"}, {"badge": "UPD", "ref": "API-080", "label": "API-080 POST /api/bookings — tính giảm giá", "sub": "3 điểm chạm, API phức tạp"}, {"badge": "UPD", "ref": "API-095", "label": "API-095 / API-121 / API-120 — cập nhật trạng thái ưu đãi", "sub": "3 API callback"}, {"badge": "NEW", "ref": "IMP-015", "label": "Cron cấp ưu đãi (grant-next-visit-discount)", "sub": "mỗi 10 phút"}, {"badge": "NEW", "ref": "IMP-016", "label": "Cron hết hạn ưu đãi (expire-user-discounts)", "sub": "hằng ngày 00:30"}, {"badge": "UPD", "ref": "EXT-006", "label": "Smaregi (EXT-006) — subtotalDiscountPrice + with_coupons", "sub": "mở rộng payload + tham số — CQ-009"}, {"badge": "IMPACT", "ref": "EXT-002", "label": "AWS SES / Nodemailer — mẫu mail thông báo ưu đãi", "sub": "chờ CQ-012"}], "redraw": false, "only_cr2": false};
const {page, s:old} = await section();
if (old && !D.redraw) return {error: "section da ton tai — xoa section cu (cua chinh lan chay nay) hoac doi ten truoc khi ve lai (hoac --redraw cr1,cr2)"};
const created=[];
let s = old;
if (!s) {
s = figma.createSection(); s.name = SECTION_NAME; s.x = 0; s.y = 37000; page.appendChild(s);
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
