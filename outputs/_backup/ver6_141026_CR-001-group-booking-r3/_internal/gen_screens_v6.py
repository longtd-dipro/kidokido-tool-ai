#!/usr/bin/env python3
"""CR-3 ver6 — format Output 3: NEW (13) + UPD (9, dung lai man AS-IS + to mau) + popup (3). Du lieu mau DATA-PRIVACY §4."""
import json, sys
stage, out = sys.argv[1], sys.argv[2]
v = json.load(open(stage, encoding="utf8"))
DS = "outputs/ver4_061026_ds-figma-update/04_DesignSystem"
ds_read = [f"{DS}/{s}/project/{f}" for s in ("WEB-02", "WEB-01") for f in ("README.md", "tokens.json")] + \
          [f"{DS}/WEB-02/STATUS.md", f"{DS}/WEB-01/STATUS.md",
           f"{DS}/WEB-02/project/components/{{Button,TextField,Select,Radio,Checkbox,Card,Badge,PageHeader,SideNav,AppHeader,Pagination,Breadcrumb}}/README.md",
           f"{DS}/WEB-01/project/components/{{Button,TextField,Select,Radio,Card,Table,Modal,PageHeader,SideNav,Pagination,Breadcrumb}}/README.md"]
old = {it["ref"]: it for it in v["screens"]["items"]}
NAV1 = ["ダッシュボード", "施設管理", "予約管理", "団体管理", "売上管理", "商品管理", "ユーザー管理", "操作履歴"]
MYNAV = ["予約履歴・変更・キャンセル", "団体情報の確認・編集", "担当者", "領収書", "アカウント情報"]
SBW = {"sidebar_width": 315, "sidebar_note": "TBD — đo từ ảnh baseline (STATUS.md WEB-02 D7), user chọn ở CR-3b"}

LBL = {"title": "Tiêu đề trang", "breadcrumb": "Breadcrumb", "section": "Tiêu đề nhóm", "text": "Câu hướng dẫn / ghi chú",
       "steps": "Thanh bước", "card": "Khối thông tin", "table": "Bảng", "pagination": "Phân trang", "search": "Khối tìm kiếm",
       "radio": "Radio", "checkbox": "Checkbox", "badge": "Badge trạng thái", "modal": "Hộp thoại"}
def auto(blocks, act=None, chg_default=None):
    """gan so n cho block cap 1 + sinh dong ITEMS mac dinh; act = {n: action}."""
    act = act or {}
    rows = []
    for k, b in enumerate(blocks, 1):
        b["n"] = k
        t = b["t"]
        if t in ("field", "select"):
            title, desc = b["label"], ("Select" if t == "select" or b.get("select") else "Textbox") + (" · bắt buộc" if b.get("required") else "") + (" · " + b["hint"] if b.get("hint") else "")
        elif t == "field2":
            title = " / ".join(f["label"] for f in b["fields"]); desc = "2 ô cùng hàng" + (" · bắt buộc" if any(f.get("required") for f in b["fields"]) else "")
        elif t == "buttons":
            title = "Nút " + " / ".join(i["text"] for i in b["items"]); desc = " · ".join(("chính" if i.get("variant") != "outline" else "phụ") for i in b["items"])
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
        elif t == "steps":
            title, desc = LBL[t], " → ".join(b["items"])
        elif t == "radio":
            title, desc = b["label"], " / ".join(b["options"])
        elif t == "checkbox":
            title, desc = "Checkbox", b["label"]
        elif t == "modal":
            title, desc = LBL[t] + " 「" + b["title"] + "」", (b.get("message") or "")[:80]
        else:
            title, desc = LBL.get(t, t), b.get("text", "")
        rows.append({"n": k, "title": title, "desc": desc, "action": act.get(k, "—"), "chg": b.get("chg") or chg_default})
    return rows

def item(badge, ref, site, shell, label, stype, entry, purpose, happy, blocks, errors, act=None, **kw):
    it = {"badge": badge, "ref": ref, "site": site, "shell": shell, "label": label, "stype": stype, "entry": entry,
          "purpose": purpose, "happy": happy, "blocks": blocks, "errors": errors, **kw}
    it["items"] = auto(blocks, act, "NEW" if badge == "NEW" else None)
    for r in it["items"]:
        b = blocks[r["n"] - 1]
        if b.get("note"):
            r["desc"] = (r["desc"] + " — " if r["desc"] else "") + b["note"]
    return it

E = lambda trig, disp, msg: {"trigger": trig, "display": disp, "msg": msg}
items = []
# ---------------------------------------------------------------- NEW WEB-02
b = old["IMP-046"]["blocks"]
items.append(item("NEW", "IMP-046", "WEB-02", "auth", "[WEB-02] 団体登録", "Form", "SC-063 link 「団体でのご利用はこちら」",
    "Người phụ trách đăng ký đoàn + tài khoản người phụ trách đầu tiên + 請求先 (CR-001.2).",
    ["Nhập 団体情報, 申込担当者, 請求先", "Đồng ý điều khoản → 確認する", "Hệ thống tạo đoàn + users (role User) + gửi mail xác thực", "Bấm link trong mail → マイページ đoàn (IMP-049)"],
    b, [E("Bỏ trống field [必須]", "Inline", "Text: '<項目名>を入力してください' (cùng mẫu message hiện có) · ở lại form"),
        E("Email đã đăng ký", "Inline", "Text: 'こちらのアカウントは既に仮登録を受け付けました。…' (thật) + gửi lại mail"),
        E("Mật khẩu < 8 ký tự / sai định dạng", "Inline", "Text: '半角英数字8文字以上で入力してください' (đề xuất)"),
        E("Lỗi server / mạng", "Toast", "Text: 'システムエラーが発生しました。…' (thật, README WEB-02) · giữ dữ liệu đã nhập")],
    {len(b): "TAP 確認する → mail xác thực → IMP-049. Error nếu thiếu field → inline. TAP 戻る → SC-063"}))
b = old["IMP-047"]["blocks"]
items.append(item("NEW", "IMP-047", "WEB-02", "public", "[WEB-02] 団体予約", "Form", "URL riêng / マイページ đoàn",
    "Đặt chỗ đoàn: chọn 店舗, ngày giờ, vé 団体, số trẻ / người lớn, 当日責任者 (CR-001.3).",
    ["Chọn 店舗 + ngày + giờ → hệ thống tải vé 団体 (公開区分 団体 / 共通)", "Nhập số người, 当日責任者, 備考", "次へ → kiểm sức chứa chung + tỷ lệ trẻ / người lớn → IMP-048"],
    b, [E("Hết chỗ (sức chứa chung)", "Inline", "Text: '完売しましたので、他の日程を選択してください' (thật) · chọn ngày khác"),
        E("Thiếu người lớn theo tỷ lệ", "Modal", "Text: '子ども3名に対し、最低おとな1名の入場をお願いしています。…' (thật) + nút [OK]"),
        E("Dưới số người tối thiểu đoàn", "Inline", "Text: '団体利用は○名以上でご予約ください' (đề xuất — chờ CQ-001)"),
        E("Ngày ngoài lịch bán", "Inline", "Text: '利用できない日程です。他の日程を選択してください。' (thật)")],
    {len(b): "TAP 次へ → IMP-048. Error: hết chỗ / thiếu người lớn → inline / modal"}, cq="CQ-001 số người tối thiểu · CQ-003 nhập tuổi từng trẻ hay theo nhóm · CQ-010 sức chứa chung"))
b = old["IMP-048"]["blocks"]
items.append(item("NEW", "IMP-048", "WEB-02", "public", "[WEB-02] 予約内容確認・お支払い方法", "Form", "IMP-047 次へ",
    "Xác nhận nội dung đặt chỗ đoàn và chọn cách thanh toán theo booking (CR-001.4).",
    ["Xem lại nội dung", "Chọn クレジットカード（代表者） hoặc 店頭払い", "Tick 注意事項 → 予約を確定する", "Thẻ: GMO 3DS → hoàn tất · 店頭払い: tạo booking chờ thanh toán + 支払期限"],
    b, [E("Chưa tick 注意事項", "Inline", "Nút 予約を確定する disabled + text '注意事項をご確認ください' (đề xuất)"),
        E("GMO 3DS / thẻ thất bại", "Full screen", "Màn payment-online-failure hiện có (SC-051) → quay lại màn này"),
        E("Hết chỗ trong lúc xác nhận", "Modal", "Text: '完売しましたので、他の日程を選択してください' (thật) → về IMP-047")],
    {len(b): "TAP 予約を確定する → thẻ: GMO 3DS → SC-070; 店頭払い → SC-070. TAP 戻る → IMP-047"}, cq="CQ-006 cách thanh toán · CQ-011 chọn theo booking"))
for ref, nav, stype, purpose, happy, errs, act, cq in (
    ("IMP-049", "団体情報の確認・編集", "Detail", "Xem / sửa 団体情報, 請求先, 領収書宛名 (CR-001.6).",
     ["Mở マイページ đoàn", "Xem thông tin", "編集する → form sửa → lưu (mail thông báo đổi thông tin quan trọng)"],
     [E("Lỗi tải dữ liệu", "Toast", "'システムエラーが発生しました。…' (thật) · nút thử lại"), E("Đoàn bị admin dừng", "Banner", "'この団体は利用停止中です。新規予約はできません' (đề xuất)")],
     {4: "TAP 編集する → form sửa (cùng field IMP-046)"}, ""),
    ("IMP-050", "領収書", "List", "Phát hành / phát hành lại 領収書 PDF theo đặt chỗ, chỉ định 宛名 (CR-001.5).",
     ["Chọn đặt chỗ đã thanh toán", "Nhập / sửa 宛名", "PDFを発行する → tải PDF; lần 2+ ghi 再発行 cùng số"],
     [E("Đặt chỗ chưa thanh toán / đã huỷ", "Inline", "Nút phát hành disabled + 'お支払い完了後に発行できます' (đề xuất)"),
      E("Bỏ trống 宛名", "Inline", "'宛名を入力してください' (đề xuất)"), E("Sinh PDF lỗi", "Toast", "'システムエラーが発生しました。…' (thật)")],
     {3: "TAP 再発行 / 発行する ở dòng → chọn đặt chỗ", 6: "TAP PDFを発行する → popup xác nhận (IMP-041) → PDF"}, "CQ-008 nội dung 領収書"),
    ("IMP-051", "担当者", "List", "Quản lý người phụ trách của đoàn (拡張案, CR-001.6).",
     ["Xem danh sách", "担当者を招待する → nhập email → mail mời", "削除 → xác nhận"],
     [E("Email đã thuộc đoàn khác", "Inline", "'このメールアドレスは既に登録されています' (đề xuất)"), E("Xoá người đại diện duy nhất", "Modal", "'代表者は削除できません' (đề xuất)")],
     {2: "TAP 削除 → modal xác nhận", 3: "TAP 担当者を招待する → form mời"}, "CQ-015"),
):
    b = old[ref]["blocks"]
    items.append(item("NEW", ref, "WEB-02", "mypage", old[ref]["label"], stype, "Sidebar マイページ đoàn", purpose, happy, b, errs, act,
                      nav=MYNAV, nav_active=nav, cq=cq, **SBW))
b = old["IMP-052"]["blocks"]
items.append(item("NEW", "IMP-052", "WEB-02", "auth", "[WEB-02] 追加認証 (拡張案)", "Modal", "Đăng nhập thiết bị mới / thao tác quan trọng",
    "Xác thực bổ sung người phụ trách đoàn bằng mã gửi qua email (拡張案, CR-001.8).",
    ["Hệ thống gửi mã 6 số", "Nhập mã → 確認する", "Đúng → tiếp tục thao tác"],
    b, [E("Sai mã", "Inline", "'認証コードが正しくありません' (đề xuất)"), E("Mã hết hạn", "Inline", "'認証コードの有効期限が切れています。再送信してください' (đề xuất)"),
        E("Sai quá số lần", "Full screen", "Khoá như cơ chế hiện có — chờ CQ-007")],
    {2: "TAP 確認する → tiếp tục; キャンセル → huỷ thao tác"}, cq="CQ-007"))
# ---------------------------------------------------------------- NEW WEB-01
for ref, stype, entry, purpose, happy, errs, act in (
    ("IMP-057", "List", "Menu 団体管理", "Tìm và quản lý đoàn (CR-001.7).", ["Nhập điều kiện → 検索する", "Bấm ✎ → IMP-058 / tên đoàn → IMP-059"],
     [E("Không có kết quả", "Empty state", "'該当するデータがありません' (đề xuất)"), E("Lỗi tải", "Toast", "Toast 「エラー」 (thật — Toast WEB-01)")], {3: "TAP 検索する / リセット", 4: "TAP ✎ → IMP-058", 5: "Đổi trang"}),
    ("IMP-058", "Form", "IMP-057 新規登録 / ✎", "Tạo / sửa đoàn (CR-001.7).", ["Nhập thông tin", "保存する → Toast 「成功」 → IMP-059"],
     [E("Bỏ trống [必須]", "Inline", "'<項目名>を入力してください' (cùng mẫu)"), E("Lỗi lưu", "Toast", "Toast 「エラー」")], {3: "TAP 保存する / キャンセル"}),
    ("IMP-059", "Detail", "IMP-057", "Chi tiết đoàn, người phụ trách, dừng sử dụng (CR-001.7).", ["Xem thông tin", "利用停止 → popup xác nhận", "編集する → IMP-058"],
     [E("Dừng đoàn đang có đặt chỗ tương lai", "Modal", "'将来の予約が○件あります。利用停止しますか？' (đề xuất)"), E("Lỗi", "Toast", "Toast 「エラー」")], {6: "TAP 利用停止 → popup (IMP-033); 編集する → IMP-058"}),
    ("IMP-060", "List", "IMP-059 / menu", "Lịch sử phát hành 領収書 và phát hành lại bởi admin (CR-001.5).", ["Tìm", "再発行 → xác nhận → PDF"],
     [E("領収書 無効 (đã huỷ)", "Inline", "Nút 再発行 ẩn / disabled"), E("Không có kết quả", "Empty state", "'該当するデータがありません' (đề xuất)")], {3: "TAP 検索する", 4: "TAP 再発行"}),
    ("IMP-061", "List", "Menu 操作履歴", "Xem log thao tác admin có lọc (CR-001.7).", ["Chọn kỳ / người / đối tượng → 検索する"],
     [E("Kỳ sai (bắt đầu > kết thúc)", "Inline", "'終了日は開始日より後の日程を選択してください' (thật)"), E("Không có kết quả", "Empty state", "'該当するデータがありません' (đề xuất)")], {3: "TAP 検索する"}),
):
    b = old[ref]["blocks"]
    items.append(item("NEW", ref, "WEB-01", "admin", old[ref]["label"], stype, entry, purpose, happy, b, errs, act, nav=NAV1, nav_active="操作履歴" if ref == "IMP-061" else "団体管理"))
b = old["IMP-062"]["blocks"]
items.append(item("NEW", "IMP-062", "WEB-01", "auth", "[WEB-01] 二要素認証", "Form", "SC-027 sau khi đúng mật khẩu",
    "Bước nhập mã 2FA bắt buộc cho admin (CR-001.8).", ["Nhập mã", "認証する → vào admin (Super Admin → dashboard, Admin → 予約管理)"],
    b, [E("Sai mã", "Inline", "'認証コードが正しくありません' (đề xuất)"), E("Mã hết hạn", "Inline", "'有効期限が切れています。再送信してください' (đề xuất)"),
        E("Sai quá số lần", "Modal", "'ログイン回数の上限を越えたのでアカウントがロックされました。…' (thật)")],
    {1: "TAP 認証する → /admin; 戻る → SC-027"}, cq="CQ-013 email / TOTP"))
# ---------------------------------------------------------------- UPD — man AS-IS + to mau
def U(**kw):
    return kw
items.append(item("UPD", "SC-063", "WEB-02", "auth", "[WEB-02] ログイン方法を選択 (SC-063)", "Form", "Header ログイン / SC-046…055",
    "Đăng nhập user. CR: người phụ trách đoàn sau đăng nhập → マイページ đoàn; thêm link đăng ký đoàn (IMP-055).",
    ["Nhập email + mật khẩu → ログイン", "User thường → trang trước; người phụ trách đoàn → IMP-049"],
    [{"t": "breadcrumb", "items": ["トップ", "ログイン"]}, {"t": "title", "text": "ログイン方法を選択"},
     {"t": "text", "text": "ご希望のログイン方法を選択してください。"},
     {"t": "field", "label": "メールアドレス", "placeholder": "user_a@example.com"},
     {"t": "field", "label": "パスワード", "placeholder": "••••••••"},
     {"t": "checkbox", "label": "ログイン情報を保存する", "checked": True},
     {"t": "buttons", "items": [{"text": "ログイン", "variant": "solid"}], "chg": "UPD", "note": "đích chuyển theo loại tài khoản"},
     {"t": "buttons", "items": [{"text": "LINEでログイン", "variant": "outline"}], "note": "nút LINE (màu thương hiệu LINE — ngoài DS)"},
     {"t": "text", "text": "パスワードを忘れた方はこちら ／ 会員登録をされていない方はこちら"},
     {"t": "text", "text": "団体でのご利用はこちら（団体登録）", "chg": "NEW", "note": "link → IMP-046"}],
    [E("Sai email / mật khẩu", "Inline", "'アドレスまたはパスワードが正しくありません。' (thật)"),
     E("Sai nhiều lần", "Inline", "'…{0}回のログインが失敗しました。後{1}回のログインが可能です。' (thật)"),
     E("Đoàn bị dừng", "Banner", "'この団体は利用停止中です' (đề xuất) — vẫn đăng nhập, không đặt mới")],
    {7: "TAP ログイン → user thường: trang trước (AS-IS) · người phụ trách đoàn: IMP-049 (UPD)", 10: "TAP → IMP-046 (NEW)"},
    base="SC-063", changes=["⑦ Nút ログイン: đích chuyển theo loại tài khoản (UPD)", "⑩ Thêm link 団体登録 (NEW)"]))
items.append(item("UPD", "SC-070", "WEB-02", "mypage", "[WEB-02] 予約履歴 (SC-070)", "List", "Sidebar 予約履歴・変更・キャンセル",
    "Danh sách đặt chỗ. CR: hiện đặt chỗ đoàn kèm trạng thái / hạn thanh toán (IMP-053).",
    ["Xem ただいまの予約 / 過去の予約", "Bấm card → SC-071"],
    [{"t": "breadcrumb", "items": ["トップ", "予約履歴"]}, {"t": "title", "text": "予約履歴", "variant": "mypage"},
     {"t": "section", "text": "ただいまの予約"},
     {"t": "card", "tone": "raised", "title": "団体パス — 2026/11/10 10:00", "badge": "団体", "lines": ["店舗：店舗A", "人数：子ども 20名・大人 3名", "支払状態：未払い（支払期限 2026/11/05）"], "chg": "NEW", "note": "card đặt chỗ đoàn + 支払期限"},
     {"t": "section", "text": "過去の予約"}, {"t": "text", "text": "ご予約はございません"}],
    [E("Không có đặt chỗ", "Empty state", "'ご予約はございません' (thật)"), E("Quá 支払期限", "Inline", "Badge '支払期限切れ' trên card (đề xuất — CQ-006)"),
     E("Lỗi tải", "Toast", "'システムエラーが発生しました。…' (thật)")],
    {4: "TAP card → SC-071"}, nav=MYNAV, nav_active="予約履歴・変更・キャンセル", base="SC-070",
    changes=["④ Card đặt chỗ đoàn: badge 団体, 支払状態, 支払期限 (NEW)"], **SBW))
items.append(item("UPD", "SC-071", "WEB-02", "mypage", "[WEB-02] 予約詳細 (SC-071)", "Detail", "SC-070 card",
    "Chi tiết đặt chỗ. CR: thêm thông tin đoàn, nút 領収書, bỏ câu '領収書は店頭にて…' với đặt chỗ đoàn (IMP-053).",
    ["Xem nội dung", "予約内容変更 → SC-076", "予約キャンセル → popup phí huỷ (IMP-038)", "領収書を発行する → IMP-050"],
    [{"t": "breadcrumb", "items": ["トップ", "予約履歴", "予約詳細"]}, {"t": "title", "text": "予約詳細", "variant": "mypage"},
     {"t": "card", "tone": "raised", "title": "予約内容", "lines": ["店舗：店舗A", "利用日時：2026/11/10 10:00", "商品：団体パス", "予約人数：子ども 20名・大人 3名", "支払方法：クレジットカード", "利用料金：¥1,000"]},
     {"t": "card", "tone": "tinted", "title": "団体情報", "lines": ["団体名：Công ty ABC", "当日責任者：山田太郎（090-0000-0000）", "支払期限：2026/11/05"], "chg": "NEW"},
     {"t": "text", "tone": "note", "text": "領収書は店頭にて発行いたします。サイト上では発行できません。", "chg": "DEL", "note": "ẩn với đặt chỗ đoàn"},
     {"t": "buttons", "items": [{"text": "予約内容変更", "variant": "outline"}, {"text": "予約キャンセル", "variant": "outline"}]},
     {"t": "buttons", "items": [{"text": "領収書を発行する", "variant": "solid"}], "chg": "NEW"}],
    [E("Quá hạn đổi / huỷ", "Inline", "'ご希望のご予約は変更できません。' (thật)"), E("Chưa thanh toán", "Inline", "Nút 領収書 disabled + 'お支払い完了後に発行できます' (đề xuất)"),
     E("Huỷ phát sinh phí", "Modal", "Popup IMP-038: phí huỷ + số tiền hoàn (đề xuất — CQ-005)")],
    {6: "TAP 予約内容変更 → SC-076 · 予約キャンセル → IMP-038", 7: "TAP → IMP-050"}, nav=MYNAV, nav_active="予約履歴・変更・キャンセル", base="SC-071",
    changes=["④ Khối 団体情報 (NEW)", "⑤ Câu '領収書は店頭にて…' ẩn với đoàn (DEL)", "⑦ Nút 領収書を発行する (NEW)"],
    cq="AS-IS dựng từ nhãn trong code (EV-0556 chụp nhầm màn huỷ) — CQ-012", **SBW))
items.append(item("UPD", "SC-076", "WEB-02", "mypage", "[WEB-02] 予約変更 (SC-076)", "Form", "SC-071 予約内容変更",
    "Đổi ngày / số người. CR: đặt chỗ đoàn đổi số người theo nhóm tuổi, 当日責任者, hiện phí / hoàn dự kiến (IMP-054).",
    ["Chọn ngày mới / đổi số người", "Xem phí / hoàn dự kiến", "次へ → 変更を確定します → hoàn phần chênh (GMO)"],
    [{"t": "breadcrumb", "items": ["トップ", "予約履歴", "予約詳細", "予約変更"]}, {"t": "title", "text": "予約変更", "variant": "mypage"},
     {"t": "field2", "fields": [{"label": "日時の変更", "value": "2026/11/10"}, {"label": "時間", "value": "10:00", "select": True}]},
     {"t": "field2", "fields": [{"label": "子ども（0〜2歳）", "value": "0", "unit": "名"}, {"label": "子ども（3〜5歳）", "value": "20", "unit": "名"}], "chg": "UPD", "note": "cũ: 1 ô 子どもの人数 → mới: theo nhóm tuổi"},
     {"t": "field", "label": "おとなの人数", "value": "3", "unit": "名"},
     {"t": "field", "label": "当日責任者", "value": "山田太郎", "chg": "NEW"},
     {"t": "card", "tone": "tinted", "title": "料金の変更（予定）", "lines": ["差額：¥0", "キャンセル料：¥0", "返金予定額：¥0"], "chg": "NEW"},
     {"t": "text", "tone": "note", "text": "利用日前日の23:59まで変更可能です。"},
     {"t": "buttons", "items": [{"text": "戻る", "variant": "outline"}, {"text": "次へ", "variant": "solid"}]}],
    [E("Quá hạn đổi", "Inline", "'ご希望のご予約は変更できません。' (thật)"), E("Ngày mới không bán", "Inline", "'ご希望の日にちは変更できません。' (thật)"),
     E("Hết chỗ ngày mới", "Inline", "'完売しましたので、他の日程を選択してください' (thật)"), E("Thiếu người lớn", "Modal", "'子ども3名に対し、最低おとな1名の入場…' (thật)")],
    {9: "TAP 次へ → xác nhận 変更を確定します → hoàn tiền; 戻る → SC-071"}, nav=MYNAV, nav_active="予約履歴・変更・キャンセル", base="SC-076",
    changes=["④ Số trẻ theo nhóm tuổi (UPD)", "⑥ 当日責任者 (NEW)", "⑦ Khối phí / hoàn dự kiến (NEW)"],
    cq="AS-IS dựng từ nhãn trong code (EV-0558 chụp màn hoàn tất) — CQ-012 · CQ-003 · CQ-005", **SBW))
items.append(item("UPD", "SC-027", "WEB-01", "auth", "[WEB-01] ログイン (admin, SC-027)", "Form", "/admin/signin",
    "Đăng nhập admin. CR: đúng mật khẩu → chuyển bước 2FA (IMP-066).",
    ["Nhập email + mật khẩu → ログイン", "Đúng → IMP-062 (mới) thay vì vào thẳng /admin"],
    [{"t": "card", "tone": "raised", "title": "ログイン", "lines": ["メールアドレスとパスワードでログインしてください"],
      "blocks": [{"t": "field", "label": "メールアドレス", "placeholder": "test_admin@example.com"}, {"t": "field", "label": "パスワード", "placeholder": "••••••••"}]},
     {"t": "buttons", "items": [{"text": "ログイン", "variant": "solid"}], "chg": "UPD", "note": "đích: /admin → IMP-062"},
     {"t": "text", "text": "パスワードを忘れた場合"}],
    [E("Sai email / mật khẩu", "Inline", "'アドレスまたはパスワードが正しくありません。' (thật)"),
     E("Sai quá số lần", "Modal", "'ログイン回数の上限を越えたのでアカウントがロックされました。…「送信」…' (thật) + nút [送信する]")],
    {2: "TAP ログイン → IMP-062 (UPD; AS-IS: /admin)", 3: "TAP → SC-016"}, base="SC-027",
    changes=["② Nút ログイン: chuyển sang bước 2FA (UPD)"], cq="EV-0687 chỉ chụp được spinner — AS-IS dựng từ code signin.tsx"))
items.append(item("UPD", "SC-004", "WEB-01", "admin", "[WEB-01] 予約管理 (SC-004)", "List", "Menu 予約管理",
    "Danh sách đặt chỗ. CR: lọc 一般 / 団体, tên đoàn, cột đoàn, CSV có cột đoàn (IMP-063).",
    ["Nhập điều kiện → 検索する", "CSVファイル出力 → CSV có cột 団体名", "Bấm 👁 → SC-005"],
    [{"t": "title", "text": "予約管理"}, {"t": "breadcrumb", "items": ["予約管理"]},
     {"t": "search", "fields": [{"label": "氏名", "placeholder": "山田 太郎"}, {"label": "施設名", "placeholder": "選択", "select": True}, {"label": "商品名", "placeholder": "選択", "select": True}],
      "buttons": [{"text": "リセット", "variant": "outline"}, {"text": "検索する", "variant": "solid"}, {"text": "CSVファイル出力", "variant": "outline"}], "chg": "UPD", "note": "CSV + cột 団体名"},
     {"t": "field2", "fields": [{"label": "区分", "placeholder": "全て / 一般 / 団体", "select": True}, {"label": "団体名・担当者名", "placeholder": "Công ty ABC"}], "chg": "NEW"},
     {"t": "table", "cols": ["アクション", "No", "施設名", "予約ID", "区分", "団体名", "商品名"], "widths": [120, 60, 180, 120, 100, 200, 220],
      "rows": [["👁 ✎", "1", "店舗A", "SO-0001", "団体", "Công ty ABC", "団体パス"], ["👁 ✎", "2", "店舗A", "SO-0002", "一般", "—", "ワンデーパス"]], "chg": "UPD", "note": "+ cột 区分, 団体名"},
     {"t": "pagination"}],
    [E("Không có kết quả", "Empty state", "Bảng trống (hành vi hiện có)"), E("Admin xem đoàn tenant khác", "—", "Không hiển thị (giữ quy tắc tenant)"),
     E("Xuất CSV lỗi", "Toast", "Toast 「エラー」 (thật — Toast WEB-01)")],
    {3: "TAP 検索する / リセット / CSV", 5: "TAP 👁 → SC-005 · ✎ → SC-007", 6: "Đổi trang"}, nav=NAV1, nav_active="予約管理", base="SC-004",
    changes=["③ CSV thêm cột 団体名 (UPD)", "④ Lọc 区分 / 団体名 (NEW)", "⑤ Bảng + cột 区分, 団体名 (UPD)"]))
items.append(item("UPD", "SC-005", "WEB-01", "admin", "[WEB-01] 予約詳細 (SC-005 / SC-007)", "Detail", "SC-004 👁",
    "Chi tiết đặt chỗ (SC-007 sửa dùng cùng component). CR: thông tin đoàn, 当日責任者, cách / hạn thanh toán, 領収書 (IMP-064).",
    ["Xem chi tiết", "編集する → SC-007 (cùng màn, chế độ sửa)", "(拡張案) 承認 / 却下"],
    [{"t": "title", "text": "予約詳細"}, {"t": "breadcrumb", "items": ["予約管理", "予約詳細"]},
     {"t": "card", "tone": "raised", "title": "パス情報", "lines": ["予約：SO-0001", "店舗：店舗A", "商品：団体パス", "利用時間：2026/11/10 10:00", "支払方法：店舗決済"]},
     {"t": "card", "tone": "raised", "title": "お客様情報", "lines": ["お名前：山田太郎", "メール：user_a@example.com", "電話番号：090-0000-0000"]},
     {"t": "card", "tone": "raised", "title": "団体情報", "lines": ["団体名：Công ty ABC", "当日責任者：山田太郎", "支払期限：2026/11/05", "領収書：発行済（R-0001）"], "chg": "NEW"},
     {"t": "buttons", "items": [{"text": "戻る", "variant": "outline"}, {"text": "編集する", "variant": "solid"}]},
     {"t": "buttons", "items": [{"text": "却下", "variant": "outline"}, {"text": "承認", "variant": "solid"}], "chg": "NEW", "note": "拡張案 — CQ-002"}],
    [E("Không tìm thấy đặt chỗ", "Full screen", "Màn lỗi / 404 hiện có"), E("Khác tenant", "Full screen", "403 (giữ quy tắc tenant)"), E("Duyệt lỗi", "Toast", "Toast 「エラー」")],
    {6: "TAP 編集する → SC-007; 戻る → SC-004", 7: "TAP 承認 / 却下 (拡張案)"}, nav=NAV1, nav_active="予約管理", base="SC-005",
    changes=["⑤ Khối 団体情報 (NEW)", "⑦ Nút 承認 / 却下 — 拡張案 (NEW)"], cq="AS-IS dựng từ nhãn code details/[id].tsx (UI chưa quan sát) — CQ-012 · CQ-002"))
items.append(item("UPD", "SC-035", "WEB-01", "admin", "[WEB-01] 商品管理 一覧 (SC-035)", "List", "Menu 商品管理",
    "Danh sách vé. CR: cột + bộ lọc 公開区分 (IMP-065).", ["Chọn 施設名 / ngày / 公開区分 → 検索する", "新規商品追加 → SC-036"],
    [{"t": "title", "text": "商品管理"}, {"t": "breadcrumb", "items": ["商品管理"]},
     {"t": "field2", "fields": [{"label": "施設名", "placeholder": "選択", "select": True}, {"label": "日付選択", "value": "2026/10/02"}]},
     {"t": "select", "label": "公開区分", "placeholder": "全て / 一般 / 団体 / 共通", "chg": "NEW"},
     {"t": "buttons", "items": [{"text": "検索する", "variant": "outline", "size": "sm"}, {"text": "OBIC用Excel出力", "variant": "outline", "size": "sm"}, {"text": "新規商品追加", "variant": "solid", "size": "sm"}]},
     {"t": "table", "cols": ["アクション", "No", "施設名", "商品名", "公開区分", "予約枠"], "widths": [140, 60, 220, 260, 140, 140],
      "rows": [["👁 ✎ 🗑", "1", "店舗A", "団体パス", "団体", "設定済み"], ["👁 ✎ 🗑", "2", "店舗A", "ワンデーパス", "一般", "設定済み"]], "chg": "UPD", "note": "+ cột 公開区分"},
     {"t": "pagination"}],
    [E("Không có kết quả", "Empty state", "Bảng trống (hiện có)"), E("Xoá vé đang có đặt chỗ", "Modal", "Xác nhận xoá hiện có")],
    {5: "TAP 検索する / Excel / 新規商品追加 → SC-036", 6: "TAP 👁 → SC-038 · ✎ → SC-037", 7: "Đổi trang"}, nav=NAV1, nav_active="商品管理", base="SC-035",
    changes=["④ Bộ lọc 公開区分 (NEW)", "⑥ Bảng + cột 公開区分 (UPD)"]))
items.append(item("UPD", "SC-036", "WEB-01", "admin", "[WEB-01] 商品管理 登録 (SC-036 / 037 / 038)", "Form", "SC-035 新規商品追加",
    "Tạo vé (SC-037 sửa, SC-038 xem dùng cùng form). CR: thêm field 公開区分 (IMP-065).", ["Nhập thông tin vé + chọn 公開区分", "次へ → bước 2 (khung đặt chỗ)"],
    [{"t": "title", "text": "商品管理"}, {"t": "breadcrumb", "items": ["商品管理"]},
     {"t": "card", "tone": "raised", "title": "① 商品の基本設定", "blocks": [
         {"t": "field", "label": "商品名", "required": True, "placeholder": "当日時間制パス"},
         {"t": "radio", "label": "商品のタイプ", "options": ["時間制", "ワンデー", "指定期間利用", "回数券"], "selected": 1},
         {"t": "select", "label": "施設設定", "required": True, "placeholder": "施設名"},
         {"t": "radio", "label": "公開ステータス", "options": ["公開", "非公開"], "selected": 0}]},
     {"t": "radio", "label": "公開区分 [必須]", "options": ["一般", "団体", "共通"], "selected": 0, "chg": "NEW", "note": "mặc định 一般"},
     {"t": "buttons", "items": [{"text": "キャンセル", "variant": "outline"}, {"text": "次へ", "variant": "solid"}]}],
    [E("Bỏ trống 商品名", "Inline", "'商品名を入力してください' (thật)"), E("Bỏ trống 施設設定", "Inline", "'施設設定を入力してください' (thật)"),
     E("Chưa chọn 公開区分", "Inline", "'公開区分を選択してください' (đề xuất)")],
    {5: "TAP 次へ → bước 2; キャンセル → SC-035"}, nav=NAV1, nav_active="商品管理", base="SC-036",
    changes=["④ Field 公開区分 一般 / 団体 / 共通 (NEW)"], cq="CQ-009 có 共通 không"))
# ---------------------------------------------------------------- POPUP
items.append(item("NEW", "IMP-038", "WEB-02", "modal", "[WEB-02] 予約キャンセル確認 — キャンセル料 (popup)", "Modal", "SC-071 予約キャンセル",
    "Xác nhận huỷ đặt chỗ đoàn, hiện phí huỷ và số tiền hoàn (CR-001.4).", ["Xem phí huỷ / tiền hoàn", "はい → huỷ, hoàn tiền, vô hiệu 領収書 → SC-071 (đã huỷ)"],
    [{"t": "modal", "from": "WEB-01", "title": "予約キャンセル", "message": "キャンセル料 ¥1,000 が発生します。返金予定額 ¥0。発行済みの領収書は無効になります。よろしいでしょうか？",
      "buttons": [{"text": "いいえ", "variant": "outline"}, {"text": "はい", "variant": "solid"}]}],
    [E("Quá hạn huỷ", "Inline", "'ご希望のご予約は変更できません。' (thật)"), E("Hoàn tiền GMO lỗi", "Toast", "'システムエラーが発生しました。…' (thật) — đặt chỗ giữ nguyên")],
    {1: "TAP はい → huỷ; いいえ → đóng"}, scrim="overlay-scrim", cq="CQ-005 mức phí huỷ"))
items.append(item("NEW", "IMP-041", "WEB-02", "modal", "[WEB-02] 領収書の再発行確認 (popup)", "Modal", "IMP-050 PDFを発行する (lần 2+)",
    "Xác nhận phát hành lại 領収書 cùng số, ghi 再発行 (CR-001.5).", ["はい → PDF có dấu 再発行, lưu lịch sử"],
    [{"t": "modal", "from": "WEB-01", "title": "領収書の再発行", "message": "同じ領収書番号で「再発行」と記載して発行します。宛名：Công ty ABC",
      "buttons": [{"text": "キャンセル", "variant": "outline"}, {"text": "発行する", "variant": "solid"}]}],
    [E("領収書 đã vô hiệu", "Inline", "'この領収書は無効です' (đề xuất)"), E("Sinh PDF lỗi", "Toast", "'システムエラーが発生しました。…' (thật)")],
    {1: "TAP 発行する → tải PDF"}, scrim="overlay-scrim", cq="CQ-008"))
items.append(item("NEW", "IMP-033", "WEB-01", "modal", "[WEB-01] 団体の利用停止確認 (popup)", "Modal", "IMP-059 利用停止",
    "Xác nhận dừng sử dụng đoàn (CR-001.2).", ["はい → ステータス 停止, người phụ trách không đặt mới được, ghi 操作履歴"],
    [{"t": "modal", "title": "利用停止", "message": "この団体を利用停止にします。担当者は新規予約できなくなります。よろしいですか？",
      "buttons": [{"text": "キャンセル", "variant": "outline"}, {"text": "利用停止", "variant": "solid"}]}],
    [E("Lỗi lưu", "Toast", "Toast 「エラー」 (thật — Toast WEB-01)")], {1: "TAP 利用停止 → Toast 「成功」"}))
skip = [{"ref": "SC-007", "reason": "update/[id].tsx render cùng component BookingManagementDetail với SC-005 — thay đổi vẽ ở mockup SC-005"},
        {"ref": "SC-037", "reason": "Sửa vé dùng cùng form SC-036 (chế độ sửa) — thay đổi 公開区分 vẽ ở mockup SC-036"},
        {"ref": "SC-038", "reason": "Xem vé dùng cùng form SC-036 (chỉ đọc) — thay đổi 公開区分 vẽ ở mockup SC-036"}]
v["screens"] = {"ds_read": ds_read, "items": items, "skip": skip}
json.dump(v, open(out, "w", encoding="utf8"), ensure_ascii=False, indent=1)
print(len(items), "man ·", sum(1 for i in items if i["badge"] == "NEW"), "NEW ·", sum(1 for i in items if i["badge"] == "UPD"), "UPD ·", sum(1 for i in items if i["shell"] == "modal"), "popup")
