#!/usr/bin/env python3
"""cr-figma.json cho CR-002 (法人向け商品販売). Format theo cr-view.md: CR-1 (Output 1, moi lane co NG) · CR-2 (Output 2,
man / popup loi, Loai) · CR-3 (Output 3: mockup trai, mo ta + ITEMS + ERROR SCENARIOS phai). Du lieu mau DATA-PRIVACY §4.
Chay tu goc kit: python3 outputs/ver8_.../_internal/gen_view_v8.py"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(KIT, "outputs/ver6_141026_CR-001-group-booking-r3/_internal"))
DS = "outputs/ver4_061026_ds-figma-update/04_DesignSystem"
v6 = json.load(open(os.path.join(KIT, "outputs/ver6_141026_CR-001-group-booking-r3/_internal/cr-figma.json"), encoding="utf8"))
old = {it["ref"]: it for it in v6["screens"]["items"]}

# ---------------------------------------------------------------- CR-1 Flow — dang USE CASE (feedback 20/10/2026)
# 1 lane = 1 use case: actor -> duong di happy (pos, row 0) -> ket thuc; non-happy row 1 -> ket thuc ✗.
# Khong dua technology / function vao lane — API / cot DB / he thong ngoai nam o bang TECHNOLOGY ben phai.
U = lambda key, typ, badge, ref, label, sub="", pos=None, row=0, **kw: {"key": key, "type": typ, "badge": badge, "ref": ref, "label": label,
                                                                       "sub": sub, "pos": pos, "row": row, **kw}
flows = [
 {"lane": "FL-08", "title": "Mua vé trước — lịch thu gọn (use case có sẵn)",
  "note": "CR-002.1 · Phương án B (khách hàng chọn): mặc định 7 ngày → 「もっと見る」 → 1 tháng · áp dụng mọi sản phẩm mua trước",
  "nodes": [U("a", "actor", "AS-IS", "FL-08", "Khách", "không đổi"),
            U("s", "start", "UPD", "SC-067", "Mở trang chi tiết cửa hàng", "lịch hiện 7 ngày cho mỗi sản phẩm", 1),
            U("s1", "step", "UPD", "SC-067", "Bấm 「もっと見る」", "lịch mở rộng 1 tháng · 「閉じる」 thu lại", 2),
            U("d", "decision", "IMPACT", "SC-067", "Tải được lịch 1 tháng?", "", 3),
            U("s2", "step", "IMPACT", "SC-050", "Chọn ngày → màn mua trước", "luồng mua giữ nguyên", 4),
            U("e1", "end", "IMPACT", "SC-050", "Mua vé như hiện tại", "", 5, result="ok"),
            U("ng", "ng", "IMPACT", "SC-067", "Lỗi tải → giữ lịch 7 ngày + thông báo", "「システムエラーが発生しました。…」(có sẵn)", 3, 1),
            U("e2", "end", "IMPACT", "SC-067", "Vẫn ở trang, chọn ngày trong 7 ngày", "", 4, 1, result="fail"),
            U("x1", "edge", "UPD", "IMP-007", "Phương án A (thay thế): mặc định đóng lịch, mở ra → 1 tháng"),
            U("x2", "edge", "IMPACT", "SC-044", "Màn chỗ trống của quản trị dùng chung lịch — giữ lịch mở")],
  "edges": [["a", "s", ""], ["s", "s1", ""], ["s1", "d", ""], ["d", "s2", "Được"], ["s2", "e1", ""], ["d", "ng", "Lỗi", "ng"], ["ng", "e2", "", "ng"]]},
 {"lane": "CR-NEW-1", "title": "Mua sản phẩm doanh nghiệp qua trang giới hạn (use case mới)",
  "note": "CR-002.2 · vào bằng link (không cần đăng nhập) · mua / thanh toán / huỷ dùng luồng hiện có",
  "nodes": [U("a", "actor", "NEW", "IMP-022", "Khách doanh nghiệp (có link)", "nhận link từ Bornelund"),
            U("s", "start", "NEW", "IMP-016", "Mở link trang giới hạn", "", 1),
            U("d", "decision", "NEW", "IMP-022", "Link đúng, trang đang công khai?", "", 2),
            U("s1", "step", "NEW", "IMP-016", "Chọn cửa hàng → xem lịch và sản phẩm giới hạn", "", 3),
            U("s2", "step", "UPD", "SC-050", "Mua trước (thẻ) hoặc dùng trong ngày", "dùng màn mua hiện có", 4),
            U("e1", "end", "IMPACT", "SC-050", "Đặt chỗ xong — mail, My page, huỷ như vé thường", "", 5, result="ok"),
            U("ng", "ng", "NEW", "IMP-016", "Link sai / trang đã dừng → trang không tìm thấy", "「ページが見つかりません」(đề xuất)", 2, 1),
            U("e2", "end", "NEW", "IMP-016", "Không thấy sản phẩm nào", "", 3, 1, result="fail"),
            U("x1", "edge", "NEW", "IMP-022", "Người biết mã sản phẩm có mua được ngoài trang giới hạn không? — chờ khách hàng xác nhận")],
  "edges": [["a", "s", ""], ["s", "d", ""], ["d", "s1", "Đúng"], ["s1", "s2", ""], ["s2", "e1", ""], ["d", "ng", "Sai", "ng"], ["ng", "e2", "", "ng"]]},
 {"lane": "FL-07", "title": "Tra cứu thông tin công khai — ẩn sản phẩm giới hạn (use case có sẵn)",
  "note": "CR-002.2 · bảng giá / tình trạng bán / chi tiết cửa hàng / mua vé thường không hiện sản phẩm giới hạn",
  "no_ng": "Không có nhánh lỗi mới: danh sách chỉ bớt sản phẩm giới hạn; lỗi tải giữ như hiện tại",
  "nodes": [U("a", "actor", "AS-IS", "FL-07", "Khách", "không đổi"),
            U("s", "start", "IMPACT", "SC-059", "Mở bảng giá / tình trạng bán / chi tiết cửa hàng", "", 1),
            U("s1", "step", "IMPACT", "SC-092", "Xem danh sách sản phẩm", "không hiện sản phẩm đang bật hiển thị giới hạn", 2),
            U("e1", "end", "IMPACT", "SC-092", "Chỉ thấy sản phẩm thường — như hiện tại", "", 3, result="ok")],
  "edges": [["a", "s", ""], ["s", "s1", ""], ["s1", "e1", ""]]},
 {"lane": "FL-03", "title": "Thiết lập sản phẩm cho doanh nghiệp (use case có sẵn, quản trị)",
  "note": "CR-002.2 / CR-002.3 · sản phẩm tạo bằng 「商品管理」 hiện có (giá, lịch bán, mã Smaregi / OBIC) — chỉ thêm mục hiển thị giới hạn",
  "nodes": [U("a", "actor", "AS-IS", "FL-03", "Super Admin / Admin", "không đổi"),
            U("s", "start", "UPD", "SC-035", "Mở 「商品管理」 → tạo / sửa sản phẩm", "", 1),
            U("s1", "step", "UPD", "SC-036", "Bật 「Hiển thị giới hạn」 và lưu", "Option: chọn trang hiển thị", 2),
            U("d", "decision", "UPD", "SC-036", "Option: đã chọn trang?", "", 3),
            U("e1", "end", "UPD", "SC-035", "Danh sách sản phẩm hiện nhãn giới hạn", "", 4, result="ok"),
            U("ng", "ng", "UPD", "SC-036", "Chưa chọn trang → báo lỗi dưới mục", "「掲載先ページを選択してください」(đề xuất)", 3, 1),
            U("e2", "end", "UPD", "SC-036", "Không lưu được, ở lại form", "", 4, 1, result="fail"),
            U("x1", "edge", "NEW", "IMP-034", "Option: quản lý nhiều trang giới hạn A / B / C")],
  "edges": [["a", "s", ""], ["s", "s1", ""], ["s1", "d", ""], ["d", "e1", "Đã chọn"], ["d", "ng", "Chưa", "ng"], ["ng", "e2", "", "ng"]]},
]
tech = [{"badge": "UPD", "ref": "API-107", "label": "Danh sách sản phẩm", "sub": "lọc sản phẩm giới hạn theo trang"},
        {"badge": "UPD", "ref": "API-075", "label": "Lịch chỗ trống", "sub": "lấy 30 ngày · bỏ sản phẩm giới hạn ở kết quả trả về"},
        {"badge": "UPD", "ref": "API-050", "label": "Lưu sản phẩm (tạo / sửa)", "sub": "lưu thêm mục hiển thị giới hạn"},
        {"badge": "IMPACT", "ref": "API-074", "label": "Hàm lấy vé theo chỗ trống (dùng chung)", "sub": "đặt trong ngày, tác vụ tự động, POS dùng chung — giữ nguyên"},
        {"badge": "NEW", "ref": "column:tickets.limited_public", "label": "Cột hiển thị giới hạn", "sub": "đúng / sai, mặc định sai"},
        {"badge": "IMPACT", "ref": "EXT-001", "label": "GMO Payment Gateway", "sub": "sản phẩm giới hạn thanh toán như vé thường — kiểm lại"},
        {"badge": "IMPACT", "ref": "EXT-006", "label": "Smaregi POS", "sub": "mã Smaregi / OBIC nhập ở 「商品管理」 như vé thường"}]

# ---------------------------------------------------------------- CR-2 Screen Flow
S = lambda key, badge, ref, label, stype, desc, sub="": {"key": key, "type": "screen", "badge": badge, "ref": ref, "label": label, "sub": sub, "stype": stype, "desc": desc}
NG = lambda key, badge, ref, label, display, parent, trigger, msg, nxt, typ="ng": {"key": key, "type": typ, "badge": badge, "ref": ref, "label": label,
     "display": display, "parent": parent, "trigger": trigger, "msg": msg, "next": nxt}
groups = [
 {"id": "G-CR1", "title": "Mua vé trước — lịch thu gọn (use case FL-08)", "site": "WEB-02", "note": "CR-002.1 (①-B; ①-A ở panel EDGE)",
  "nodes": [{"key": "s", "type": "start", "badge": "AS-IS", "ref": "SC-066", "label": "Vào từ 店舗一覧"},
            S("n67", "UPD", "SC-067", "店舗詳細", "Detail", "Lịch đặt trước: mặc định 7 ngày, もっと見る → 1 tháng", "lịch 7 ngày / sản phẩm"),
            {"key": "d", "type": "decision", "badge": "IMPACT", "ref": "API-075", "label": "Tải 30 ngày OK?"},
            S("n50", "UPD", "SC-050", "1DAYパス事前購入 (form mua trước)", "Form", "Chọn ngày từ lịch đã thu gọn / mở rộng", "giữ ngày đã chọn"),
            NG("ng", "IMPACT", "API-075", "Lỗi tải lịch 1 tháng", "Toast", "SC-067", "API-075 lỗi khi bookingDays = 30",
               "「システムエラーが発生しました。…」(thật)", "giữ lịch 7 ngày"),
            NG("p1", "UPD", "SC-050", "Ngày đã 完売", "Inline", "SC-050", "Chọn ngày đã hết chỗ",
               "「完売しましたので、他の日程を選択してください」(thật)", "chọn ngày khác"),
            {"key": "e1", "type": "edge", "badge": "UPD", "ref": "IMP-007", "label": "①-A: mặc định đóng lịch — chọn 1 trong ①-A / ①-B"},
            S("n44", "IMPACT", "SC-044", "空き状況 (admin)", "List", "Dùng chung component — giữ lịch mở", "không thu gọn")],
  "edges": [["s", "n67", ""], ["n67", "d", "もっと見る"], ["d", "n50", "YES · chọn ngày"], ["d", "ng", "NO", "ng"], ["n50", "p1", "完売", "ng"], ["n67", "n44", "component dùng chung"]]},
 {"id": "G-CR2", "title": "Mua sản phẩm doanh nghiệp qua trang giới hạn (use case CR-NEW-1)", "site": "WEB-02", "note": "CR-002.2 · Option: hiển thị theo trang",
  "nodes": [{"key": "s", "type": "start", "badge": "NEW", "ref": "IMP-022", "label": "Mở URL 限定公開 (khách doanh nghiệp)"},
            {"key": "d", "type": "decision", "badge": "NEW", "ref": "IMP-022", "label": "Khoá URL hợp lệ?"},
            S("n16", "NEW", "IMP-016", "限定公開ページ", "List", "Chọn 施設 → lịch 事前 (áp dụng ①) + vé 当日 của sản phẩm 限定公開", "法人向け商品"),
            S("n50", "UPD", "SC-050", "1DAYパス事前購入", "Form", "Nhận khoá → API-107 trả sản phẩm 限定公開", "mua trước · GMO"),
            S("n54", "UPD", "SC-054", "当日利用 (今から利用する)", "Form", "Nhận khoá → API-107 / 075 trả sản phẩm 限定公開", "mua trong ngày"),
            NG("ng", "NEW", "IMP-016", "Khoá sai → 404", "Full screen", "IMP-016", "Khoá URL sai / trang đã dừng (Option)",
               "「ページが見つかりません」(đề xuất)", "không hiện sản phẩm"),
            NG("p1", "NEW", "IMP-016", "Không có sản phẩm 限定公開", "Inline", "IMP-016", "Chưa có sản phẩm nào bật 限定公開",
               "「現在ご購入いただける商品はありません」(đề xuất)", "ở lại trang"),
            {"key": "e1", "type": "edge", "badge": "NEW", "ref": "IMP-022", "label": "Nhiều 施設 trên 1 trang: chọn 施設 hay liệt kê hết? — CQ-005"}],
  "edges": [["s", "d", ""], ["d", "n16", "YES"], ["d", "ng", "NO", "ng"], ["n16", "n50", "事前"], ["n16", "n54", "当日"], ["n16", "p1", "trống", "ng"]]},
 {"id": "G-CR3", "title": "Tra cứu công khai — ẩn sản phẩm giới hạn (use case FL-07)", "site": "WEB-02", "note": "CR-002.2",
  "no_ng": "Không có màn lỗi mới: các màn chỉ bớt sản phẩm 限定公開 khỏi danh sách",
  "nodes": [{"key": "s", "type": "start", "badge": "AS-IS", "ref": "SC-066", "label": "Vào từ TOP / menu"},
            S("n67", "IMPACT", "SC-067", "店舗詳細", "Detail", "Không hiện sản phẩm 限定公開"),
            S("n59", "IMPACT", "SC-059", "料金プラン", "List", "Không hiện sản phẩm 限定公開"),
            S("n92", "IMPACT", "SC-092", "待ち時間/販売状況", "List", "Không hiện sản phẩm 限定公開"),
            S("n48", "IMPACT", "SC-048", "フリーパス購入", "Form", "Danh sách sản phẩm không có 限定公開"),
            S("n49", "IMPACT", "SC-049", "回数券購入", "Form", "Danh sách sản phẩm không có 限定公開")],
  "edges": [["s", "n67", ""], ["s", "n59", ""], ["s", "n92", ""], ["s", "n48", ""], ["s", "n49", ""]]},
 {"id": "G-CR4", "title": "Thiết lập sản phẩm cho doanh nghiệp (use case FL-03)", "site": "WEB-01", "note": "CR-002.2 · Option CR-002.3",
  "nodes": [{"key": "s", "type": "start", "badge": "AS-IS", "ref": "SC-001", "label": "Menu admin › 商品管理"},
            S("n35", "UPD", "SC-035", "商品管理 — 一覧", "List", "Cột 公開設定: 通常公開 / 限定公開"),
            S("n36", "UPD", "SC-036", "商品管理 — 登録", "Form", "Radio 限定公開 ON / OFF (Option: chọn 掲載先ページ)"),
            S("n37", "UPD", "SC-037", "商品管理 — 編集", "Form", "Cùng form SC-036"),
            S("n38", "UPD", "SC-038", "商品管理 — 詳細", "Detail", "Hiện 公開設定"),
            S("n34", "NEW", "IMP-034", "限定公開ページ管理 (Option)", "List", "Danh sách / tạo / sửa / dừng trang, copy URL"),
            NG("ng", "UPD", "SC-036", "Chưa chọn 掲載先ページ (Option)", "Inline", "SC-036", "限定公開 nhưng không chọn trang",
               "「掲載先ページを選択してください」(đề xuất)", "ở lại form"),
            NG("p1", "NEW", "IMP-037", "Dừng trang đang có sản phẩm", "Modal", "IMP-034", "Bấm 公開停止 trên trang còn sản phẩm",
               "「このページを停止すると掲載中の商品は表示されなくなります。よろしいですか？」(đề xuất)", "OK → dừng / キャンセル", "popup")],
  "edges": [["s", "n35", ""], ["n35", "n36", "新規作成"], ["n35", "n37", "✎"], ["n35", "n38", "👁"], ["s", "n34", "Option"],
            ["n36", "ng", "thiếu trang", "ng"], ["n34", "p1", "公開停止", "ng"]]},
]

# ---------------------------------------------------------------- CR-3 Screens (dung lai helper cua ver6)
ds_read = [f"{DS}/{s}/project/{f}" for s in ("WEB-02", "WEB-01") for f in ("README.md", "tokens.json")] + \
          [f"{DS}/WEB-02/STATUS.md", f"{DS}/WEB-01/STATUS.md",
           f"{DS}/WEB-02/project/components/{{Button,Select,Card,PageHeader,AppHeader,Breadcrumb}}/README.md",
           f"{DS}/WEB-01/project/components/{{Button,TextField,Select,Radio,Card,Table,Modal,PageHeader,SideNav,Pagination,Breadcrumb}}/README.md"]
LBL = {"title": "Tiêu đề trang", "breadcrumb": "Breadcrumb", "section": "Tiêu đề nhóm", "text": "Câu hướng dẫn / ghi chú",
       "card": "Khối thông tin", "table": "Bảng", "pagination": "Phân trang", "search": "Khối tìm kiếm", "radio": "Radio",
       "checkbox": "Checkbox", "badge": "Badge trạng thái", "modal": "Hộp thoại"}
def auto(blocks, act, chg_default):
    rows = []
    for k, b in enumerate(blocks, 1):
        b["n"] = k; t = b["t"]
        if t in ("field", "select"):
            title, desc = b["label"], ("Select" if t == "select" else "Textbox") + (" · bắt buộc" if b.get("required") else "")
        elif t == "field2":
            title, desc = " / ".join(f["label"] for f in b["fields"]), "2 ô cùng hàng"
        elif t == "buttons":
            title, desc = "Nút " + " / ".join(i["text"] for i in b["items"]), " · ".join("chính" if i.get("variant") != "outline" else "phụ" for i in b["items"])
        elif t == "title":
            title, desc = LBL[t] + " 「" + b["text"] + "」", "PageHeader"
        elif t == "card":
            title, desc = LBL[t] + (" 「" + b["title"] + "」" if b.get("title") else ""), "; ".join(b.get("lines") or [])[:120] or "nhóm field"
        elif t == "table":
            title, desc = LBL[t], " · ".join(b["cols"])
        elif t == "search":
            title, desc = LBL[t], " · ".join(f["label"] for f in b["fields"]) + " + " + " / ".join(i["text"] for i in b["buttons"])
        elif t in ("text", "section"):
            title, desc = LBL[t], b["text"][:80]
        elif t == "breadcrumb":
            title, desc = LBL[t], " › ".join(b["items"])
        elif t == "radio":
            title, desc = b["label"], " / ".join(b["options"])
        elif t == "modal":
            title, desc = LBL[t] + " 「" + b["title"] + "」", (b.get("message") or "")[:80]
        else:
            title, desc = LBL.get(t, t), b.get("text", "")
        if b.get("note"): desc = (desc + " — " if desc else "") + b["note"]
        rows.append({"n": k, "title": title, "desc": desc, "action": act.get(k, "—"), "chg": b.get("chg") or chg_default})
    return rows
def item(badge, ref, site, shell, label, stype, entry, purpose, happy, blocks, errors, act=None, **kw):
    it = {"badge": badge, "ref": ref, "site": site, "shell": shell, "label": label, "stype": stype, "entry": entry,
          "purpose": purpose, "happy": happy, "blocks": blocks, "errors": errors, **kw}
    it["items"] = auto(blocks, act or {}, "NEW" if badge == "NEW" else None)
    return it
E = lambda trig, disp, msg: {"trigger": trig, "display": disp, "msg": msg}
DAYS = ["10/22 木", "10/23 金", "10/24 土", "10/25 日", "10/26 月", "10/27 火", "10/28 水"]
W8 = [208] + [96] * 7
CAL = lambda rows, **kw: {"t": "table", "from": "WEB-01", "cols": ["商品"] + DAYS, "widths": W8, "rows": rows, **kw}
SHOP = [{"t": "breadcrumb", "items": ["トップ", "店舗一覧", "店舗A"]}, {"t": "title", "text": "店舗A"},
        {"t": "card", "tone": "raised", "title": "店舗情報", "lines": ["連絡先：090-0000-0000", "住所：Số 1, Đường ABC, Quận 1, TP.HCM", "営業時間：10:00～18:00 <最終受付17:00>"]},
        {"t": "card", "tone": "tinted", "title": "2026/10/22(木) 本日の空き状況", "lines": ["1DAYパス ○ 空きあり", "時間制パス △ 入場制限中"]},
        {"t": "buttons", "items": [{"text": "今から利用する", "variant": "solid"}]}]
NAV_ADMIN = ["予約管理", "空き状況", "売上管理", "商品管理", "ユーザー管理", "従業員管理"]
items = []
items.append(item("UPD", "SC-067", "WEB-02", "public", "[WEB-02] 店舗詳細 — lịch thu gọn ①-B (SC-067)", "Detail", "店舗一覧 / TOP",
    "Thông tin 施設 + tình trạng hôm nay + lịch đặt trước. CR ①-B: mỗi sản phẩm 事前 mặc định hiện 7 ngày, もっと見る → 1 tháng (IMP-001).",
    ["Xem lịch 7 ngày của từng sản phẩm 事前", "もっと見る → tải 30 ngày (API-075 bookingDays) → lịch 1 tháng; 閉じる → thu lại", "Bấm ○ → form mua trước SC-050"],
    SHOP + [{"t": "section", "text": "事前予約"},
     CAL([["1DAYパス（平日）", "○", "○", "—", "—", "○", "○", "○"], ["1DAYパス（休日）", "—", "—", "○", "×", "—", "—", "—"]], chg="UPD", note="mặc định 7 ngày (cũ: hiện đủ số ngày)"),
     {"t": "buttons", "items": [{"text": "もっと見る（1か月）", "variant": "outline", "size": "sm"}], "chg": "NEW", "note": "mỗi sản phẩm 1 nút — CQ-003"},
     {"t": "text", "tone": "note", "text": "※事前予約が完売でも、当日利用で購入できます。"}],
    [E("Tải 30 ngày lỗi", "Toast", "「システムエラーが発生しました。…」(thật) — giữ lịch 7 ngày"),
     E("Ngày đã 完売", "Inline", "Ô hiện × 完売 (thật) — không chọn được"),
     E("Sản phẩm không có lịch bán trong 1 tháng", "Inline", "Ô hiện — (thật)")],
    {7: "TAP ○ → SC-050 (luồng cũ)", 8: "TAP → mở 1 tháng; lần 2 → 閉じる"},
    base="SC-067", changes=["⑦ Lịch mặc định 7 ngày (UPD)", "⑧ Nút もっと見る / 閉じる (NEW)"], ds=["DS-component:WEB-02:Button", "DS-component:WEB-01:Table"],
    cq="CQ-001 số ngày production · CQ-002 tuần = 7 ngày từ hôm nay? · CQ-003 nút theo sản phẩm"))
items.append(item("UPD", "IMP-007", "WEB-02", "public", "[WEB-02] 店舗詳細 — lịch đóng ①-A (phương án thay thế)", "Detail", "店舗一覧 / TOP",
    "Phương án ①-A (chọn 1 trong ①-A / ①-B): mỗi sản phẩm 事前 chỉ hiện tên + nút 「カレンダーを表示」; bấm → lịch 1 tháng.",
    ["Thấy danh sách tên sản phẩm 事前", "カレンダーを表示 → lịch 1 tháng của sản phẩm đó", "Bấm ○ → SC-050"],
    SHOP + [{"t": "section", "text": "事前予約"},
     {"t": "card", "tone": "raised", "title": "1DAYパス（平日）", "lines": ["カレンダーは閉じています"], "chg": "UPD", "note": "lịch đóng mặc định"},
     {"t": "buttons", "items": [{"text": "カレンダーを表示", "variant": "outline", "size": "sm"}], "chg": "NEW"},
     {"t": "card", "tone": "raised", "title": "1DAYパス（休日）", "lines": ["カレンダーは閉じています"], "chg": "UPD"}],
    [E("Tải lịch lỗi", "Toast", "「システムエラーが発生しました。…」(thật)"), E("Ngày đã 完売", "Inline", "Ô hiện × 完売 (thật)")],
    {7: "TAP → mở lịch 1 tháng của sản phẩm"}, base="SC-067",
    changes=["⑦ ⑨ Sản phẩm 事前 hiện dạng đóng (UPD)", "⑧ Nút カレンダーを表示 (NEW)"], ds=["DS-component:WEB-02:Card", "DS-component:WEB-02:Button"],
    cq="Chọn 1 trong ①-A / ①-B"))
items.append(item("NEW", "IMP-016", "WEB-02", "public", "[WEB-02] 限定公開ページ — 法人向け商品", "List", "URL 限定公開 (khách doanh nghiệp)",
    "Trang chỉ người có URL vào được, hiện sản phẩm 限定公開: lịch đặt trước (áp dụng ①) + vé trong ngày. Mua bằng luồng cũ (CR-002.2).",
    ["Mở URL có khoá", "Chọn 施設", "事前: bấm ○ trên lịch → SC-050 (kèm khoá)", "当日: 今から利用する → SC-054 (kèm khoá)"],
    [{"t": "title", "text": "法人のお客様向け商品"},
     {"t": "text", "text": "このページは限定公開です。URLを社外の方に共有しないでください。"},
     {"t": "select", "label": "施設", "placeholder": "店舗A"},
     {"t": "section", "text": "事前予約"},
     CAL([["事前1DAY（平日版）", "○", "○", "—", "—", "○", "○", "○"], ["事前1DAY（休日版）", "—", "—", "○", "○", "—", "—", "—"]]),
     {"t": "buttons", "items": [{"text": "もっと見る（1か月）", "variant": "outline", "size": "sm"}]},
     {"t": "section", "text": "当日利用"},
     {"t": "card", "tone": "tinted", "title": "2026/10/22(木) 本日", "lines": ["当日1DAY（平日版） ○ 空きあり"]},
     {"t": "buttons", "items": [{"text": "今から利用する", "variant": "solid"}]}],
    [E("Khoá URL sai / trang dừng (Option)", "Full screen", "「ページが見つかりません」(đề xuất) — không lộ sản phẩm"),
     E("Chưa có sản phẩm 限定公開", "Inline", "「現在ご購入いただける商品はありません」(đề xuất)"),
     E("Ngày đã 完売", "Inline", "Ô hiện × 完売 (thật)"), E("Lỗi tải", "Toast", "「システムエラーが発生しました。…」(thật)")],
    {3: "Đổi 施設 → tải lại lịch / vé", 5: "TAP ○ → SC-050 kèm khoá", 9: "TAP → SC-054 kèm khoá"},
    ds=["DS-component:WEB-02:PageHeader", "DS-component:WEB-02:Select", "DS-component:WEB-02:Card", "DS-component:WEB-02:Button", "DS-component:WEB-01:Table"],
    cq="CQ-005 nhiều 施設 trên 1 trang (KH đã chốt 1 trang / 1 URL) · CQ-007 rủi ro biết URL · CQ-011 thiết kế riêng?"))
# Admin: dung lai mockup SC-036 / SC-035 cua ver6, doi phan 公開区分 -> 限定公開
b36 = [dict(b) for b in old["SC-036"]["blocks"]]
for b in b36:
    b.pop("n", None)
    if b.get("t") == "radio" and "公開区分" in b.get("label", ""):
        b.update(label="限定公開", options=["OFF（通常公開）", "ON（限定公開）"], selected=1, chg="NEW", note="mặc định OFF")
k = next(i for i, b in enumerate(b36) if b.get("label") == "限定公開") + 1
b36.insert(k, {"t": "select", "label": "掲載先ページ（Option・複数選択可）", "placeholder": "法人向けページA、法人向けページB", "chg": "NEW", "note": "chỉ có ở Option — chọn được nhiều trang (IMP-035)"})
items.append(item("UPD", "SC-036", "WEB-01", "admin", "[WEB-01] 商品管理 登録 / 編集 (SC-036 / 037)", "Form", "SC-035 新規商品追加 / ✎",
    "Tạo / sửa sản phẩm (SC-037 dùng cùng form). CR: thêm 限定公開 ON / OFF (IMP-019); Option: chọn 掲載先ページ (IMP-035).",
    ["Nhập thông tin sản phẩm như hiện tại", "Bật 限定公開 = ON cho 4 sản phẩm 法人向け", "(Option) chọn trang hiển thị", "次へ → bước 2 lịch bán (không đổi)"],
    b36, [E("Bỏ trống 商品名", "Inline", "'商品名を入力してください' (thật)"),
          E("Option: 限定公開 = ON nhưng chưa chọn trang", "Inline", "「掲載先ページを選択してください」(đề xuất)")],
    {}, nav=NAV_ADMIN, nav_active="商品管理", base="SC-036",
    changes=["Radio 限定公開 ON / OFF (NEW)", "Select 掲載先ページ — chỉ Option (NEW)"],
    ds=["DS-component:WEB-01:Radio", "DS-component:WEB-01:Select", "DS-component:WEB-01:Button", "DS-component:WEB-01:Card"]))
b35 = [dict(b) for b in old["SC-035"]["blocks"]]
for b in b35:
    b.pop("n", None)
    if b.get("t") == "select" and "公開区分" in b.get("label", ""):
        b.update(label="公開設定", placeholder="全て / 通常公開 / 限定公開", chg="NEW")
    if b.get("t") == "table":
        b.update(cols=["アクション", "No", "施設名", "商品名", "公開設定", "予約枠"],
                 rows=[["👁 ✎ 🗑", "1", "店舗A", "事前1DAY（平日版）", "限定公開", "設定済み"], ["👁 ✎ 🗑", "2", "店舗A", "1DAYパス", "通常公開", "設定済み"]],
                 chg="UPD", note="+ cột 公開設定")
items.append(item("UPD", "SC-035", "WEB-01", "admin", "[WEB-01] 商品管理 一覧 (SC-035 / 038)", "List", "Menu 商品管理",
    "Danh sách sản phẩm. CR: cột + bộ lọc 公開設定 để nhận biết sản phẩm 法人向け (IMP-020); màn xem SC-038 hiện cùng field.",
    ["Lọc 公開設定 = 限定公開", "Xem / sửa sản phẩm như hiện tại"], b35,
    [E("Không có kết quả", "Empty state", "Bảng trống (hiện có)")], {}, nav=NAV_ADMIN, nav_active="商品管理", base="SC-035",
    changes=["Bộ lọc 公開設定 (NEW)", "Cột 公開設定 (UPD)"],
    ds=["DS-component:WEB-01:Table", "DS-component:WEB-01:Select", "DS-component:WEB-01:Button", "DS-component:WEB-01:Pagination"]))
items.append(item("NEW", "IMP-034", "WEB-01", "admin", "[WEB-01] 限定公開ページ管理 (Option)", "List", "Menu 限定公開ページ管理",
    "Option CR-002.3: tạo nhiều trang 限定公開 A / B / C, mỗi trang 1 URL; dừng trang.",
    ["新規作成 → nhập tên trang → hệ thống sinh URL", "コピー URL gửi khách doanh nghiệp", "公開停止 → popup xác nhận (IMP-037)"],
    [{"t": "title", "text": "限定公開ページ管理"}, {"t": "breadcrumb", "items": ["ホーム", "限定公開ページ管理"]},
     {"t": "buttons", "items": [{"text": "新規作成", "variant": "solid", "size": "sm"}]},
     {"t": "table", "cols": ["操作", "ページ名", "URL", "掲載商品数", "ステータス"], "widths": [120, 220, 420, 140, 140],
      "rows": [["✎ コピー", "法人向けページA", "https://example.com/limited/xxxx", "4", "公開中"], ["✎ コピー", "法人向けページB", "https://example.com/limited/yyyy", "0", "停止"]]},
     {"t": "pagination"}],
    [E("Tên trang trống", "Inline", "「ページ名を入力してください」(đề xuất)"),
     E("Dừng trang còn sản phẩm", "Modal", "Popup IMP-037 xác nhận (đề xuất)"), E("Lỗi lưu", "Toast", "Toast 「エラー」(thật — Toast WEB-01)")],
    {3: "TAP → form tạo trang", 4: "TAP コピー → copy URL; ✎ → sửa"}, nav=NAV_ADMIN + ["限定公開ページ管理"], nav_active="限定公開ページ管理",
    ds=["DS-component:WEB-01:PageHeader", "DS-component:WEB-01:Breadcrumb", "DS-component:WEB-01:Button", "DS-component:WEB-01:Table", "DS-component:WEB-01:Pagination"],
    cq="CQ-010 xác nhận 1 sản phẩm nhiều trang (đề xuất Dipro)"))
items.append(item("NEW", "IMP-037", "WEB-01", "modal", "[WEB-01] ページの公開停止確認 (popup, Option)", "Modal", "IMP-034 公開停止",
    "Xác nhận dừng trang 限定公開 đang có sản phẩm (Option CR-002.3).", ["OK → trang dừng, URL trả 404, sản phẩm không hiển thị ở đâu"],
    [{"t": "modal", "title": "公開停止", "message": "このページを停止すると、掲載中の商品（4件）は表示されなくなります。よろしいですか？",
      "buttons": [{"text": "キャンセル", "variant": "outline"}, {"text": "停止する", "variant": "solid"}]}],
    [E("Lỗi lưu", "Toast", "Toast 「エラー」(thật — Toast WEB-01)")], {1: "TAP 停止する → Toast 「成功」"},
    ds=["DS-component:WEB-01:Modal"]))
# ---------------------------------------------------------------- bo sung 20/10 (feedback: chua co man mo 1 thang + ra soat case con thieu)
N_BASE = len(items)
WK = ["木", "金", "土", "日", "月", "火", "水"]
def month(start_m, start_d, n_days, mark=None, pattern=None):
    """Luoi 1 thang: moi hang = 1 tuan (7 o, bat dau tu hom nay — CQ-002). Gia tri o: ○ / × / — (du lieu mau)."""
    import datetime as _dt
    d0 = _dt.date(2026, start_m, start_d); rows = []
    pat = pattern or ["○", "○", "—", "—", "○", "○", "○"]
    for w in range((n_days + 6) // 7):
        r = ["第%d週" % (w + 1)]
        for k in range(7):
            i = w * 7 + k
            if i >= n_days: r.append(""); continue
            d = d0 + _dt.timedelta(days=i); v = pat[k]
            if d == mark: v = "◎ 選択中"
            elif w == 1 and k == 3: v = "× 完売"
            r.append("%d/%d %s" % (d.month, d.day, v))
        rows.append(r)
    return {"t": "table", "from": "WEB-01", "cols": ["週"] + WK, "widths": [92] + [114] * 7, "rows": rows}
SP_NOTE = "Khung SP 375px theo thiết kế thật của designer (UI Usersite (デザイナー用) › U8.2 店舗一覧詳細 SP); DS WEB-02 chưa có token viewport-mobile"
SP_HEAD = [{"t": "breadcrumb", "items": ["トップ", "店舗一覧", "店舗A"]}, {"t": "title", "text": "店舗A"},
           {"t": "buttons", "items": [{"text": "今から利用する", "variant": "solid", "size": "sm", "width": 311}]}, {"t": "section", "text": "事前予約"}]
SP_DAYS7 = ["10/22(木)　○ 空きあり", "10/23(金)　○ 空きあり", "10/24(土)　—", "10/25(日)　—", "10/26(月)　○ 空きあり", "10/27(火)　○ 空きあり", "10/28(水)　○ 空きあり"]

items.append(item("UPD", "SC-067", "WEB-02", "public", "[WEB-02] 店舗詳細 — ①-B đã mở 1 tháng (PC)", "Detail", "SC-067 bấm もっと見る",
    "Trạng thái sau khi bấm 「もっと見る（1か月）」 ở 1 sản phẩm: lưới mở đủ 30 ngày (mỗi hàng 1 tuần tính từ hôm nay), nút đổi thành 「閉じる」. Sản phẩm khác giữ 7 ngày.",
    ["もっと見る → tải 30 ngày (API-075 bookingDays=30) → lưới 5 hàng", "Bấm ○ → SC-050 (luồng cũ)", "閉じる → thu về 7 ngày, cuộn về đầu khối sản phẩm"],
    SHOP + [{"t": "section", "text": "事前予約"},
     {"t": "text", "text": "1DAYパス（平日）　10/22〜11/20（1か月分）", "chg": "UPD", "note": "tiêu đề khối + khoảng ngày"},
     dict(month(10, 22, 30), chg="UPD", note="mở 1 tháng — 30 ngày, mỗi hàng 1 tuần"),
     {"t": "buttons", "items": [{"text": "閉じる", "variant": "outline", "size": "sm"}], "chg": "NEW", "note": "thay cho もっと見る khi đang mở"},
     CAL([["1DAYパス（休日）", "—", "—", "○", "×", "—", "—", "—"]], chg="UPD", note="sản phẩm khác vẫn 7 ngày"),
     {"t": "buttons", "items": [{"text": "もっと見る（1か月）", "variant": "outline", "size": "sm"}], "chg": "NEW"}],
    [E("Tải 30 ngày lỗi", "Toast", "「システムエラーが発生しました。…」(thật) — giữ lịch 7 ngày, nút vẫn là もっと見る"),
     E("Ngày đã 完売", "Inline", "Ô hiện × 完売 (thật) — không chọn được"),
     E("Sau 30 ngày không có lịch bán", "Inline", "Ô hiện — (thật)")],
    {8: "TAP ○ → SC-050", 9: "TAP → thu về 7 ngày", 11: "TAP → mở 1 tháng sản phẩm này (độc lập)"},
    base="SC-067", changes=["⑦ ⑧ Lưới mở 30 ngày (UPD)", "⑨ Nút 閉じる (NEW)", "⑩ ⑪ Sản phẩm khác giữ 7 ngày + もっと見る"],
    ds=["DS-component:WEB-02:Button", "DS-component:WEB-01:Table"], cq="CQ-001 / CQ-002 (1 tháng = 30 ngày từ hôm nay; tuần = 7 ngày từ hôm nay) · CQ-003"))

items.append(item("UPD", "SC-067", "WEB-02", "public", "[WEB-02] 店舗詳細 — ①-B tự mở khi ngày đang chọn ngoài tuần đầu (PC)", "Detail", "SC-050 quay lại (ngày đã chọn 11/05)",
    "Khi quay lại từ màn mua (SC-050) với ngày đã chọn nằm ngoài 7 ngày đầu (VD 11/05), lịch của sản phẩm đó tự mở 1 tháng và đánh dấu ngày đang chọn — người dùng không mất lựa chọn.",
    ["Quay lại SC-067 với ngày chọn = 11/05", "Hệ thống thấy 11/05 ngoài tuần đầu → tự mở 1 tháng sản phẩm đó", "Ô 11/05 hiện ◎ 選択中; bấm ô khác để đổi ngày"],
    SHOP + [{"t": "section", "text": "事前予約"},
     {"t": "text", "text": "1DAYパス（平日）　10/22〜11/20（1か月分）", "chg": "UPD"},
     dict(month(10, 22, 30, mark=__import__("datetime").date(2026, 11, 5)), chg="NEW", note="tự mở + ◎ ngày đang chọn 11/05"),
     {"t": "buttons", "items": [{"text": "閉じる", "variant": "outline", "size": "sm"}], "chg": "NEW"}],
    [E("Ngày đang chọn đã 完売 / hết lịch khi quay lại", "Inline", "「選択した日付は予約できなくなりました。別の日付を選択してください。」(đề xuất) — bỏ ◎"),
     E("Tải 30 ngày lỗi", "Toast", "「システムエラーが発生しました。…」(thật) — hiện 7 ngày, không tự mở")],
    {8: "Tự mở khi ngày chọn ngoài tuần đầu; TAP ô khác → đổi ngày", 9: "TAP → thu lại (bỏ hiển thị ◎ nhưng giữ ngày chọn)"},
    base="SC-067", changes=["⑧ Tự mở 1 tháng + đánh dấu ngày đang chọn (NEW)", "⑨ 閉じる (NEW)"],
    ds=["DS-component:WEB-02:Button", "DS-component:WEB-01:Table"], cq="Hành vi 'tự mở' là đề xuất của Dipro — cần KH xác nhận (bổ sung vào CQ-003)"))

items.append(item("UPD", "SC-067", "WEB-02", "mobile", "[WEB-02] 店舗詳細 — ①-B 7 ngày (mobile)", "Detail", "店舗一覧 / TOP (SP)",
    "Trên điện thoại, lịch hiển thị dạng lưới như PC (mỗi hàng 7 ngày). ①-B: mỗi sản phẩm mặc định 7 ngày, link 「1か月分を見る」.",
    ["Xem lưới 7 ngày của từng sản phẩm", "「1か月分を見る」 → 4 tuần", "Bấm ô ○ → SC-050"],
    SP_HEAD + [{"t": "card", "tone": "raised", "title": "1DAYパス（平日）", "lines": SP_DAYS7, "chg": "UPD", "note": "7 dòng mặc định"},
     {"t": "buttons", "items": [{"text": "もっと見る（1か月）", "variant": "outline", "size": "sm", "width": 263}], "chg": "NEW"},
     {"t": "card", "tone": "raised", "title": "1DAYパス（休日）", "lines": ["10/24(土)　○ 空きあり", "10/25(日)　× 完売", "…（7日分）"], "chg": "UPD"}],
    [E("Tải 30 ngày lỗi", "Toast", "「システムエラーが発生しました。…」(thật)"), E("Ngày đã 完売", "Inline", "Dòng hiện × 完売 (thật) — không chọn được")],
    {5: "TAP dòng ○ → SC-050", 6: "TAP → mở 30 dòng"}, base="SC-067",
    changes=["⑤ ⑦ Danh sách 7 ngày (UPD)", "⑥ Nút もっと見る (NEW)"], ds=["DS-component:WEB-02:Button", "DS-component:WEB-02:Card"],
    viewport_width=375, viewport_note=SP_NOTE, cq="CQ-003"))

items.append(item("UPD", "SC-067", "WEB-02", "mobile", "[WEB-02] 店舗詳細 — ①-B đã mở 1 tháng (mobile)", "Detail", "SC-067 SP bấm もっと見る",
    "Điện thoại sau khi bấm 「1か月分を見る」: lưới mở 4 tuần (1 tháng), link 「閉じる」 ở cuối khối sản phẩm.",
    ["Lưới 4 tuần", "閉じる → thu về 7 ngày, cuộn về đầu khối", "Bấm ô ○ → SC-050"],
    SP_HEAD + [{"t": "card", "tone": "raised", "title": "1DAYパス（平日）　10/22〜11/20",
                "lines": SP_DAYS7 + ["10/29(木)　○ 空きあり", "10/30(金)　× 完売", "10/31(土)　—", "…", "11/19(木)　○ 空きあり", "11/20(金)　○ 空きあり"],
                "chg": "UPD", "note": "30 dòng (rút gọn bằng …)"},
     {"t": "buttons", "items": [{"text": "閉じる", "variant": "outline", "size": "sm", "width": 263}], "chg": "NEW"}],
    [E("Tải 30 ngày lỗi", "Toast", "「システムエラーが発生しました。…」(thật) — giữ 7 dòng")],
    {5: "TAP dòng ○ → SC-050", 6: "TAP → thu về 7 dòng"}, base="SC-067",
    changes=["⑤ Danh sách 30 ngày (UPD)", "⑥ Nút 閉じる (NEW)"], ds=["DS-component:WEB-02:Button", "DS-component:WEB-02:Card"],
    viewport_width=375, viewport_note=SP_NOTE, cq=""))

items.append(item("UPD", "IMP-007", "WEB-02", "public", "[WEB-02] 店舗詳細 — ①-A lịch đã mở (phương án thay thế)", "Detail", "IMP-007 bấm カレンダーを表示",
    "Phương án ①-A sau khi bấm 「カレンダーを表示」: lịch 1 tháng của sản phẩm đó mở ra, nút đổi thành 「カレンダーを閉じる」.",
    ["カレンダーを表示 → lịch 1 tháng", "Bấm ○ → SC-050", "カレンダーを閉じる → về trạng thái đóng"],
    SHOP + [{"t": "section", "text": "事前予約"},
     {"t": "text", "text": "1DAYパス（平日）　10/22〜11/20（1か月分）", "chg": "UPD"},
     dict(month(10, 22, 30), chg="UPD", note="mở 1 tháng"),
     {"t": "buttons", "items": [{"text": "カレンダーを閉じる", "variant": "outline", "size": "sm"}], "chg": "NEW"},
     {"t": "card", "tone": "raised", "title": "1DAYパス（休日）", "lines": ["カレンダーは閉じています"], "chg": "UPD"}],
    [E("Tải lịch lỗi", "Toast", "「システムエラーが発生しました。…」(thật) — giữ trạng thái đóng"), E("Ngày đã 完売", "Inline", "Ô hiện × 完売 (thật)")],
    {8: "TAP ○ → SC-050", 9: "TAP → đóng lịch"}, base="SC-067",
    changes=["⑦ ⑧ Lịch 1 tháng khi mở (UPD)", "⑨ Nút カレンダーを閉じる (NEW)"], ds=["DS-component:WEB-02:Button", "DS-component:WEB-01:Table", "DS-component:WEB-02:Card"],
    cq="Chọn 1 trong ①-A / ①-B"))

items.append(item("NEW", "IMP-016", "WEB-02", "public", "[WEB-02] 限定公開ページ — khoá sai / trang đã dừng (404)", "Error", "URL 限定公開 sai khoá / trang dừng (Option)",
    "Màn lỗi khi URL 限定公開 sai khoá hoặc trang đã dừng (Option): không tiết lộ là trang 限定公開, không hiện sản phẩm.",
    ["Hiện thông báo không tìm thấy trang", "トップへ → TOP (SC-001)"],
    [{"t": "title", "text": "ページが見つかりません"},
     {"t": "text", "text": "お探しのページは見つかりませんでした。URLをご確認ください。"},
     {"t": "buttons", "items": [{"text": "トップへ戻る", "variant": "solid"}]}],
    [E("—", "Full screen", "Chính màn này là trạng thái lỗi (đề xuất dùng trang 404 chung nếu hệ thống có)")],
    {3: "TAP → TOP"}, ds=["DS-component:WEB-02:PageHeader", "DS-component:WEB-02:Button"],
    cq="Có trang 404 chung của WEB-02 không? (chưa quan sát được) — nếu có thì dùng lại"))

items.append(item("NEW", "IMP-016", "WEB-02", "public", "[WEB-02] 限定公開ページ — chưa có sản phẩm (empty)", "List", "URL 限定公開 (施設 chưa có sản phẩm 限定公開)",
    "Trang 限定公開 hợp lệ nhưng 施設 đang chọn không có sản phẩm 限定公開 đang bán (hết lịch / chưa tạo).",
    ["Đổi 施設 khác", "Hoặc rời trang"],
    [{"t": "title", "text": "法人のお客様向け商品"},
     {"t": "text", "text": "このページは限定公開です。URLを社外の方に共有しないでください。"},
     {"t": "select", "label": "施設", "placeholder": "店舗B"},
     {"t": "card", "tone": "tinted", "title": "現在ご購入いただける商品はありません", "lines": ["別の施設を選択してください。"]}],
    [E("—", "Inline", "Chính màn này là trạng thái rỗng — message 「現在ご購入いただける商品はありません」(đề xuất)")],
    {3: "Đổi 施設 → tải lại sản phẩm"}, ds=["DS-component:WEB-02:PageHeader", "DS-component:WEB-02:Select", "DS-component:WEB-02:Card"],
    cq="Hết chương trình: sản phẩm hết lịch bán → trang hiện màn này (dùng chức năng có sẵn, không hỏi khách)"))

NAVO = NAV_ADMIN + ["限定公開ページ管理"]
FORM = lambda err: [{"t": "title", "text": "限定公開ページ管理"}, {"t": "breadcrumb", "items": ["ホーム", "限定公開ページ管理", "新規作成"]},
    {"t": "card", "tone": "raised", "title": "ページ情報", "blocks": [
        {"t": "field", "label": "ページ名", "required": True, "placeholder": "" if err else "法人向けページA", **({"value": ""} if err else {})},
        *([{"t": "text", "tone": "error", "text": "ページ名を入力してください"}] if err else []),
        {"t": "field", "label": "ページタイトル（表示用）", "placeholder": "法人のお客様向け商品"},
        {"t": "field", "label": "URL（自動生成）", "value": "https://example.com/limited/xxxx", "hint": "保存時に自動生成されます"},
        {"t": "radio", "label": "ステータス", "options": ["公開", "停止"], "selected": 0}]},
    {"t": "buttons", "items": [{"text": "キャンセル", "variant": "outline"}, {"text": "保存する", "variant": "solid"}]}]
items.append(item("NEW", "IMP-032", "WEB-01", "admin", "[WEB-01] 限定公開ページ 登録 / 編集 (Option)", "Form", "IMP-034 新規作成 / ✎",
    "Tạo / sửa trang 限定公開 (Option CR-002.3): tên trang, tiêu đề hiển thị, URL hệ thống sinh, trạng thái. Sản phẩm gán trang ở form sản phẩm (SC-036).",
    ["Nhập ページ名 + タイトル", "保存する → hệ thống sinh URL → Toast 「成功」 → về danh sách IMP-034", "Sửa: đổi tên / tiêu đề / trạng thái (URL giữ nguyên)"],
    FORM(False),
    [E("Bỏ trống ページ名", "Inline", "「ページ名を入力してください」(đề xuất) — màn trạng thái lỗi vẽ bên dưới"),
     E("Lỗi lưu", "Toast", "Toast 「エラー」(thật — Toast WEB-01)"), E("Đổi ステータス sang 停止 khi còn sản phẩm", "Modal", "Popup IMP-037 (đề xuất)")],
    {4: "キャンセル → IMP-034; 保存する → lưu"}, nav=NAVO, nav_active="限定公開ページ管理",
    ds=["DS-component:WEB-01:PageHeader", "DS-component:WEB-01:Breadcrumb", "DS-component:WEB-01:Card", "DS-component:WEB-01:TextField", "DS-component:WEB-01:Radio", "DS-component:WEB-01:Button"],
    cq="CQ-006 có cần đổi URL không"))
items.append(item("NEW", "IMP-032", "WEB-01", "admin", "[WEB-01] 限定公開ページ 登録 — lỗi nhập (Option)", "Form", "IMP-032 保存する khi thiếu ページ名",
    "Trạng thái lỗi của form tạo trang: bỏ trống ページ名 → message đỏ dưới ô, không lưu.",
    ["Bấm 保存する khi ページ名 trống → hiện lỗi", "Nhập lại → lưu bình thường"],
    FORM(True),
    [E("Bỏ trống ページ名", "Inline", "「ページ名を入力してください」(đề xuất)"), E("Lỗi lưu", "Toast", "Toast 「エラー」(thật — Toast WEB-01)")],
    {4: "保存する → kiểm tra bắt buộc"}, nav=NAVO, nav_active="限定公開ページ管理",
    ds=["DS-component:WEB-01:PageHeader", "DS-component:WEB-01:Breadcrumb", "DS-component:WEB-01:Card", "DS-component:WEB-01:TextField", "DS-component:WEB-01:Radio", "DS-component:WEB-01:Button"]))

items.append(item("UPD", "SC-036", "WEB-01", "admin", "[WEB-01] 商品管理 登録 — lỗi chưa chọn 掲載先ページ (Option)", "Form", "SC-036 次へ khi 限定公開 = ON",
    "Option: bật 限定公開 = ON nhưng chưa chọn trang hiển thị → lỗi đỏ dưới ô, không sang bước 2.",
    ["Bật 限定公開 = ON", "Bấm 次へ khi chưa chọn 掲載先ページ → lỗi", "Chọn trang → 次へ bình thường"],
    [{"t": "title", "text": "商品管理"}, {"t": "breadcrumb", "items": ["商品管理"]},
     {"t": "radio", "label": "限定公開", "options": ["OFF（通常公開）", "ON（限定公開）"], "selected": 1, "chg": "NEW"},
     {"t": "select", "label": "掲載先ページ（Option・複数選択可）", "placeholder": "選択してください", "chg": "NEW"},
     {"t": "text", "tone": "error", "text": "掲載先ページを選択してください", "chg": "NEW", "note": "lỗi bắt buộc khi ON (Option)"},
     {"t": "buttons", "items": [{"text": "キャンセル", "variant": "outline"}, {"text": "次へ", "variant": "solid"}]}],
    [E("Option: 限定公開 = ON nhưng chưa chọn trang", "Inline", "「掲載先ページを選択してください」(đề xuất)")],
    {6: "次へ → kiểm tra; lỗi thì ở lại"}, nav=NAV_ADMIN, nav_active="商品管理", base="SC-036",
    changes=["③ ④ ⑤ Field 限定公開 / 掲載先ページ + lỗi bắt buộc (NEW)"],
    ds=["DS-component:WEB-01:PageHeader", "DS-component:WEB-01:Breadcrumb", "DS-component:WEB-01:Radio", "DS-component:WEB-01:Select", "DS-component:WEB-01:Button"]))
ADDED = items[N_BASE:]
# CR-3 chia site -> flow nghiep vu -> man (quy dinh 20/10): gan flow = Group CR-2
FLOW = {"SC-067": "G-CR1", "IMP-007": "G-CR1", "IMP-016": "G-CR2", "SC-036": "G-CR4", "SC-035": "G-CR4", "IMP-034": "G-CR4", "IMP-037": "G-CR4", "IMP-032": "G-CR4"}
for it in items:
    it["flow"] = FLOW[it["ref"]]
for it in items:  # dinh dang ds theo renderer
    it.setdefault("ds", []); it["borrow"] = sorted({r.split(":")[1] for r in it["ds"]} - {it["site"]})
skip = [{"ref": "SC-037", "reason": "Sửa sản phẩm dùng cùng form SC-036 (chế độ sửa) — thay đổi vẽ ở mockup SC-036"},
        {"ref": "SC-038", "reason": "Xem sản phẩm hiện cùng field 公開設定 như SC-035 / SC-036 — thay đổi vẽ ở mockup SC-035"},
        {"ref": "SC-050", "reason": "Chỉ nhận thêm khoá 限定公開 từ URL / truyền xuống API (IMP-017) — giao diện không đổi"},
        {"ref": "SC-054", "reason": "Chỉ nhận thêm khoá 限定公開 từ URL / truyền xuống API (IMP-018) — giao diện không đổi"}]
view = {"site_order": ["WEB-02", "WEB-01"], "site_labels": {"WEB-02": "Màn hình người dùng", "WEB-01": "Màn hình quản trị"}, "title": "法人向け商品販売（カレンダー折りたたみ · 限定公開ページ）", "flows": flows, "tech": tech, "screen_groups": groups,
        "screens": {"ds_read": ds_read, "items": items, "skip": skip},
        "change_note": "⚠ Bảng cộng cả ①-A và ①-B (2 phương án thay thế nhau, chọn 1) → tổng không dùng làm giá; giá theo phương án / tổ hợp: CR-002_ETA_vi.xlsx.",
        "screen_note": "Chỉ màn có dòng Impact + màn dẫn tới (AS-IS). ①-A / ①-B chọn 1. Option = CR-002.3. Message (thật) = có trong hệ thống; (đề xuất) = chờ chốt."}
json.dump(view, open(os.path.join(HERE, "cr-figma.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
# view chi gom man bo sung (ve noi tiep vao section CR-3 dang co, khong ve lai man cu)
json.dump({**view, "screens": {**view["screens"], "items": ADDED}}, open(os.path.join(HERE, "cr-figma-add-201026.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
print(len(flows), "lane ·", len(groups), "group ·", len(items), "man CR-3 ·", len(skip), "skip")
