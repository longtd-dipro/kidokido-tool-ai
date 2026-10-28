#!/usr/bin/env python3
"""ver6 = cr-figma.json ver3 + NON-HAPPY (CR-1/CR-2) + Screen Index Loai + CR-3 format Output 3 (NEW + UPD + popup).
Nguon message: (that) = chuoi trong code / O1 baseline; (đề xuất) = chua co trong he thong, cho KH / dev chot."""
import copy, json, sys
src, out = sys.argv[1], sys.argv[2]
v = json.load(open(src, encoding="utf8"))
L = {f["lane"]: f for f in v["flows"]}
G = {g["id"]: g for g in v["screen_groups"]}

def add(lane, nodes, edges, rm=()):
    f = L[lane]
    f["edges"] = [e for e in f["edges"] if (e[0], e[1]) not in rm]
    f["nodes"] += nodes
    f["edges"] += edges

# ======================= CR-1 — NON-HAPPY moi lane
add("FL-07",
    [{"key": "d", "col": "technology", "row": 1, "type": "decision", "badge": "UPD", "ref": "API-107", "label": "Vé thuộc 公開区分 一般 / 共通?", "sub": "điều kiện lọc mới"},
     {"key": "ng", "col": "outcome", "row": 1, "type": "ng", "badge": "NEW", "ref": "IMP-032", "label": "Vé 団体 mở bằng URL trực tiếp → không bán", "sub": "「この商品は購入できません」(đề xuất) → quay lại 料金プラン"}],
    [["f", "d", "lọc"], ["d", "ng", "NO", "ng"]])
L["FL-07"]["nodes"] = [n if n["key"] != "f1" else {**n, "row": 2} for n in L["FL-07"]["nodes"]]
add("FL-03",
    [{"key": "d", "col": "technology", "row": 1, "type": "decision", "badge": "UPD", "ref": "API-054", "label": "公開区分 đã chọn & hợp lệ?", "sub": "validate khi lưu"},
     {"key": "ng", "col": "outcome", "row": 1, "type": "ng", "badge": "UPD", "ref": "SC-036", "label": "Thiếu 公開区分 → lỗi dưới field", "sub": "「公開区分を選択してください」(đề xuất, cùng mẫu「商品名を入力してください」) · ở lại form"}],
    [["f", "d", "validate"], ["d", "ng", "NO", "ng"]])
add("CR-NEW-1",
    [{"key": "d", "col": "technology", "row": 1, "type": "decision", "badge": "NEW", "ref": "IMP-003", "label": "Email chưa đăng ký & link xác thực còn hạn?", "sub": "dùng lại kiểm tra của API-066"},
     {"key": "ng", "col": "outcome", "row": 1, "type": "ng", "badge": "NEW", "ref": "IMP-033", "label": "Email đã có → báo, gửi lại mail", "sub": "「こちらのアカウントは既に仮登録を受け付けました。…」(thật) · link hết hạn → gửi lại"}],
    [["f", "d", "kiểm"], ["d", "ng", "NO", "ng"]])
L["CR-NEW-1"]["nodes"] = [n if n["key"] != "f1" else {**n, "row": 2} for n in L["CR-NEW-1"]["nodes"]]
add("FL-08",
    [{"key": "d2", "col": "outcome", "row": 2, "type": "decision", "badge": "IMPACT", "ref": "column:tickets.max_child_per_adult", "label": "Đủ người lớn theo tỷ lệ trẻ?", "sub": "IMP-044"},
     {"key": "ng2", "col": "edge", "type": "ng", "badge": "UPD", "ref": "EXT-001", "label": "3DS / thẻ thất bại → huỷ giao dịch", "sub": "booking không tạo · về màn xác nhận, chọn lại cách trả"},
     {"key": "ng3", "col": "outcome", "row": 3, "type": "ng", "badge": "IMPACT", "ref": "column:tickets.max_child_per_adult", "label": "Thiếu người lớn → không cho xác nhận", "sub": "「子ども3名に対し、最低おとな1名の入場をお願いしています。…」(thật)"}],
    [["f2", "d2", "kiểm"], ["d2", "ng3", "NO", "ng"], ["x", "ng2", "NG", "ng"]])
L["FL-08"]["nodes"] = [n for n in L["FL-08"]["nodes"]]
# ng2 dat o cot technology row 2 (khong o panel edge)
for n in L["FL-08"]["nodes"]:
    if n["key"] == "ng2":
        n["col"], n["row"] = "technology", 2
for n in L["FL-08"]["nodes"]:
    if n["key"] == "ng":
        n["sub"] = "「完売しましたので、他の日程を選択してください」(thật) · API-008 · API-075"
add("FL-09",
    [{"key": "d", "col": "function", "row": 2, "type": "decision", "badge": "NEW", "ref": "IMP-041", "label": "Đã thanh toán & chưa huỷ?", "sub": "điều kiện phát hành 領収書"},
     {"key": "ng", "col": "technology", "row": 2, "type": "ng", "badge": "NEW", "ref": "IMP-011", "label": "Chưa thanh toán / đã huỷ → không phát hành", "sub": "nút disabled + 「お支払い完了後に発行できます」(đề xuất)"},
     {"key": "ng2", "col": "outcome", "row": 1, "type": "ng", "badge": "UPD", "ref": "API-111", "label": "Quá hạn đổi / huỷ → chặn", "sub": "「ご希望のご予約は変更できません。」(thật, SC-076)"}],
    [["f", "d", "điều kiện"], ["d", "ng", "NO", "ng"], ["x1", "ng2", "quá hạn", "ng"]])
add("FL-05",
    [{"key": "d", "col": "technology", "row": 2, "type": "decision", "badge": "IMPACT", "ref": "API-017", "label": "Đoàn / đặt chỗ thuộc tenant của Admin?", "sub": "IMP-043"},
     {"key": "ng", "col": "outcome", "row": 2, "type": "ng", "badge": "IMPACT", "ref": "API-017", "label": "Khác tenant → 403, không hiển thị", "sub": "giữ quy tắc hiện có — màn / API đoàn mới phải áp dụng"}],
    [["f1", "d", "kiểm"], ["d", "ng", "NO", "ng"]])
for n in L["FL-01"]["nodes"]:
    if n["key"] == "a":
        n["label"], n["sub"] = "Super Admin / Admin", "role Admin · SuperAdmin (ver5)"
add("FL-01",
    [{"key": "d", "col": "technology", "row": 1, "type": "decision", "badge": "NEW", "ref": "IMP-018", "label": "Mã xác thực đúng & còn hạn?", "sub": "CQ-013 email / TOTP"},
     {"key": "ng", "col": "outcome", "row": 1, "type": "ng", "badge": "NEW", "ref": "IMP-062", "label": "Sai mã → nhập lại; quá số lần → khoá", "sub": "「認証コードが正しくありません」(đề xuất) · khoá dùng cơ chế hiện có 「ログイン回数の上限を越えたので…」(thật)"}],
    [["x", "d", "kiểm"], ["d", "ng", "NO", "ng"]])
for ln, f in L.items():
    f["note"] = f.get("note", "") + "  ·  NG = lỗi đã chốt / đề xuất (message thật ghi (thật), chưa có ghi (đề xuất)); chưa chốt → panel EDGE"

# ======================= CR-2 — stype/desc + popup / NG
SC = {  # key -> (stype, desc)
 "n63": ("Form", "Đăng nhập; người phụ trách đoàn → マイページ đoàn; + link 団体登録"),
 "n46": ("Form", "Đăng ký đoàn + người phụ trách đầu tiên + 請求先"),
 "n49": ("Detail", "Xem / sửa 団体情報, 請求先, 領収書宛名"),
 "n51": ("List", "Danh sách người phụ trách, mời / gỡ (拡張案)"),
 "n52": ("Form", "Nhập mã xác thực bổ sung (拡張案)"),
 "n47": ("Form", "Đặt chỗ đoàn: 店舗, ngày giờ, vé đoàn, số người, 当日責任者"),
 "n48": ("Form", "Xác nhận nội dung + chọn thẻ / 店頭払い + đồng ý 免責"),
 "n70": ("List", "予約履歴: + đặt chỗ đoàn, trạng thái / hạn thanh toán"),
 "n71": ("Detail", "Chi tiết: + thông tin đoàn, nút 領収書, phí huỷ"),
 "n50": ("List", "Danh sách 領収書, 宛名, phát hành / 再発行 PDF"),
 "n76": ("Form", "Đổi số người theo nhóm tuổi / ngày; hiện phí / hoàn dự kiến"),
 "n59": ("Detail", "料金プラン — không còn vé 団体"), "n67": ("Detail", "店舗詳細 — không còn vé 団体"),
 "n27": ("Form", "Đăng nhập admin → chuyển bước 2FA"), "n62": ("Form", "Nhập mã 二要素認証"),
 "n57": ("List", "Danh sách đoàn, tìm theo tên / người phụ trách"), "n58": ("Form", "Tạo / sửa đoàn"),
 "n04": ("List", "予約管理: + lọc 一般 / 団体, cột 団体名, CSV"), "n05": ("Detail", "予約詳細: + đoàn, 当日責任者, thanh toán, 領収書"),
 "n07": ("Form", "予約編集 (cùng component SC-005)"), "n35": ("List", "商品管理: + cột / lọc 公開区分"),
 "n36": ("Form", "Tạo vé: + field 公開区分"), "n37": ("Form", "Sửa vé: + field 公開区分"), "n38": ("Detail", "Xem vé: + 公開区分"),
 "n60": ("List", "Lịch sử phát hành 領収書, phát hành lại"), "n61": ("List", "操作履歴 có lọc"),
 "n09": ("List", "在庫調整 — kiểm sức chứa chung"), "n44": ("List", "空き状況 — kiểm sức chứa chung"),
 "n03": ("Form", "バーコード読み取り — đoàn đông người"), "n26": ("List", "入場状況管理"),
 "n12": ("Dashboard", "Dashboard — số liệu có đoàn"), "n25": ("List", "売上管理"), "n40": ("List", "ユーザー管理"), "n14": ("List", "自動返信メール設定"),
 "n54": ("Form", "当日利用 — không còn vé 団体"),
}
for g in v["screen_groups"]:
    for n in g["nodes"]:
        if n["type"] == "screen" and n["key"] in SC and n["badge"] != "AS-IS" and not (g["id"] == "G-CR3" and n["key"] == "n59"):
            n["stype"], n["desc"] = SC[n["key"]]
        if n["type"] == "screen" and n["key"] in ("n48", "n49") and g["id"] == "G-CR3":
            n["stype"], n["desc"] = ("Form", "フリーパス購入 — không còn vé 団体") if n["key"] == "n48" else ("Form", "回数券購入 — không còn vé 団体")
        if g["id"] == "G-CR3" and n["key"] == "n59":
            n["stype"], n["desc"] = "Detail", "料金プラン — không còn vé 団体"
        if g["id"] == "G-CR5" and n["key"] == "n59":
            n["stype"], n["desc"] = "Detail", "Chi tiết đoàn, người phụ trách, đặt chỗ, dừng sử dụng"
# NG cu -> bo sung display/msg
def fix_ng(gid, key, **kw):
    for n in G[gid]["nodes"]:
        if n["key"] == key:
            n.update(kw)
fix_ng("G-CR1", "ng", display="Inline", parent="IMP-046", trigger="Link xác thực hết hạn", msg="認証URLの有効期限が切れています。再送信してください (đề xuất)", next="gửi lại mail xác thực")
fix_ng("G-CR2", "ng", display="Inline", parent="IMP-047", trigger="Hết chỗ (sức chứa chung)", msg="完売しましたので、他の日程を選択してください (thật)", next="ở lại IMP-047, chọn ngày khác")
fix_ng("G-CR4", "ng", display="Inline", parent="IMP-062", trigger="Sai mã / quá số lần", msg="認証コードが正しくありません (đề xuất) · quá số lần → khoá (thật)", next="nhập lại / màn khoá")
def addg(gid, nodes, edges):
    G[gid]["nodes"] += nodes; G[gid]["edges"] += edges
addg("G-CR1", [
  {"key": "p1", "type": "ng", "badge": "NEW", "ref": "IMP-033", "label": "Email đã đăng ký", "display": "Inline", "parent": "IMP-046", "trigger": "Email trùng tài khoản đã có", "msg": "こちらのアカウントは既に仮登録を受け付けました。… (thật)", "next": "gửi lại mail / đăng nhập"},
  {"key": "p2", "type": "ng", "badge": "UPD", "ref": "SC-063", "label": "Sai email / mật khẩu", "display": "Inline", "parent": "SC-063", "trigger": "Đăng nhập sai", "msg": "アドレスまたはパスワードが正しくありません。(thật)", "next": "ở lại SC-063"}],
  [["n46", "p1", "trùng", "ng"], ["n63", "p2", "sai", "ng"]])
addg("G-CR2", [
  {"key": "p1", "type": "popup", "badge": "NEW", "ref": "IMP-038", "label": "Xác nhận huỷ + キャンセル料", "display": "Modal", "parent": "SC-071", "trigger": "Bấm 予約キャンセル", "msg": "キャンセル料 ¥1,000 が発生します。返金額 ¥0 … よろしいでしょうか？ (đề xuất)", "next": "OK → huỷ + vô hiệu 領収書 / Huỷ → SC-071"},
  {"key": "p2", "type": "popup", "badge": "NEW", "ref": "IMP-041", "label": "Xác nhận phát hành lại 領収書", "display": "Modal", "parent": "IMP-050", "trigger": "Bấm 再発行", "msg": "同じ領収書番号で「再発行」と記載して発行します。(đề xuất)", "next": "PDF tải về"},
  {"key": "p3", "type": "ng", "badge": "UPD", "ref": "EXT-001", "label": "Thanh toán thẻ thất bại", "display": "Full screen", "parent": "IMP-048", "trigger": "GMO 3DS / thẻ lỗi", "msg": "決済に失敗しました (dùng màn payment-online-failure hiện có)", "next": "quay lại IMP-048"},
  {"key": "p4", "type": "ng", "badge": "UPD", "ref": "SC-076", "label": "Quá hạn đổi", "display": "Inline", "parent": "SC-076", "trigger": "Đổi sau hạn", "msg": "ご希望のご予約は変更できません。(thật)", "next": "ở lại SC-071"}],
  [["n71", "p1", "huỷ", "ng"], ["n50", "p2", "再発行", ""], ["sys", "p3", "NG", "ng"], ["n76", "p4", "quá hạn", "ng"]])
addg("G-CR3", [
  {"key": "p1", "type": "ng", "badge": "UPD", "ref": "API-107", "label": "Vé 団体 qua URL trực tiếp", "display": "Full screen", "parent": "SC-067", "trigger": "Mở URL vé 団体 từ trang thường", "msg": "この商品は購入できません (đề xuất) — hoặc 404 hiện có", "next": "料金プラン"}],
  [["n67", "p1", "URL vé đoàn", "ng"]])
addg("G-CR4", [
  {"key": "p1", "type": "popup", "badge": "UPD", "ref": "SC-027", "label": "Tài khoản bị khoá", "display": "Modal", "parent": "SC-027", "trigger": "Sai quá số lần (mật khẩu hoặc mã)", "msg": "ログイン回数の上限を越えたのでアカウントがロックされました。… (thật)", "next": "gửi mail mở khoá"}],
  [["n27", "p1", "khoá", "ng"]])
addg("G-CR5", [
  {"key": "p1", "type": "popup", "badge": "NEW", "ref": "IMP-033", "label": "Xác nhận dừng đoàn", "display": "Modal", "parent": "IMP-059", "trigger": "Bấm 利用停止", "msg": "この団体を利用停止にします。担当者は新規予約できなくなります。よろしいですか？(đề xuất)", "next": "OK → ステータス 停止"},
  {"key": "p2", "type": "ng", "badge": "UPD", "ref": "SC-036", "label": "Thiếu 公開区分", "display": "Inline", "parent": "SC-036", "trigger": "Lưu vé chưa chọn 公開区分", "msg": "公開区分を選択してください (đề xuất)", "next": "ở lại form"}],
  [["n59", "p1", "利用停止", "ng"], ["n36", "p2", "NG", "ng"]])
v["screen_note"] = ("Chỉ màn có dòng Impact + màn dẫn tới (AS-IS). Mỗi Group có ≥ 1 NG / ⚠ popup lỗi (message (thật) = có trong hệ thống; (đề xuất) = chờ chốt). "
                    "④ Screen Index có cột Loại, ⑦ Error / Popup Index liệt kê đủ NG + popup.")
json.dump(v, open(out, "w", encoding="utf8"), ensure_ascii=False, indent=1)
print("flows/groups ok")
