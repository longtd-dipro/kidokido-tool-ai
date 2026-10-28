#!/usr/bin/env python3
"""Sinh _internal/bd/<WEB>.json (spec O1) tu CODE cho nut ma fe-api-calls.csv khong khop nhan.
Moi mo ta deu co code-ref tim bang regex tren file that cua man (page + component import toi da 5 tang).
Khong tim thay bang chung -> bo trong 'api' de build-basic-design.py tu ghi "Cần xác nhận — Q-xxx".
Chay: python3 build_bd_spec.py WEB-01   (tu thu muc goc du an)
"""
import csv, importlib.util, json, os, re, sys

site = sys.argv[1]
I = "outputs/ver1_281026_baseline/_internal"
REPO = "inputs/tokiwagi"
KS = ".claude/skills/system-analyst/scripts"
sys.path.insert(0, KS)
import inv_schema as S  # noqa
spec_ = importlib.util.spec_from_file_location("bd", KS + "/build-basic-design.py")
BD = importlib.util.module_from_spec(spec_)
spec_.loader.exec_module(BD)

inv = S.load(I + "/inventory.xlsx", {"02_Screen": S.SHEETS["02_Screen"]})
screens = [s for s in inv["02_Screen"] if s["Site"] == site]
pages = json.load(open(f"{I}/recon/crawl/{site}/pages.json"))
edges = list(csv.DictReader(open(f"{I}/recon/code/REPO-01/fe-api-calls.csv")))
routes = {r["route"]: r["file"] for r in json.load(open(f"{I}/recon/code/REPO-01/fe-routes.json"))}
TXT = {}


def text(rel):
    if rel not in TXT:
        try:
            TXT[rel] = open(os.path.join(REPO, rel), encoding="utf8", errors="ignore").read().split("\n")
        except OSError:
            TXT[rel] = []
    return TXT[rel]


IMP = re.compile(r"""^import\s+[^'"]*?from\s+['"]([^'"]+)['"]""")


def resolve(cur, spec):
    if spec.startswith("."):
        base = os.path.normpath(os.path.join(os.path.dirname(cur), spec))
    elif spec.startswith(("components/", "pages/", "libs/", "hooks/", "containers/", "layouts/")):
        base = "src/" + spec
    else:
        return None
    for suf in ("", ".tsx", ".ts", ".jsx", ".js", "/index.tsx", "/index.ts", "/index.jsx", "/index.js"):
        if os.path.isfile(os.path.join(REPO, base + suf)):
            return base + suf
    return None


def files_of(route):
    root = routes.get(route)
    if not root:
        return []
    out, todo = [root], [(root, 0)]
    while todo:
        f, d = todo.pop(0)
        if d >= 5:
            continue
        for ln in text(f):
            m = IMP.match(ln.strip())
            if m:
                g = resolve(f, m.group(1))
                if g and g not in out:
                    out.append(g)
                    todo.append((g, d + 1))
    return out


def ref(f, a, b=None):
    return "REPO-01:%s#L%d" % (f, a) + ("-L%d" % b if b and b != a else "")


def find(files, rx):
    r = re.compile(rx)
    for f in files:
        for i, ln in enumerate(text(f), 1):
            if r.search(ln):
                return f, i
    return None


def handler_near(f, n):
    """onClick / onChange quanh dong n -> ten ham."""
    L = text(f)
    for i in range(max(0, n - 5), min(len(L), n + 3)):
        m = re.search(r"on(?:Click|Change|PageChange)\s*=\s*\{\s*(?:\(\)\s*=>\s*|\([^)]*\)\s*=>\s*)?([A-Za-z_$][\w$.]*)", L[i])
        if m:
            return m.group(1).split(".")[-1], i + 1
    return None, None


def body(f, h):
    L = text(f)
    for i, ln in enumerate(L):
        if re.search(r"(?:const|function)\s+%s\b" % re.escape(h), ln):
            out, depth, started = [], 0, False
            for j in range(i, min(len(L), i + 40)):
                out.append(L[j])
                depth += L[j].count("{") - L[j].count("}")
                started = started or "{" in L[j]
                if started and depth <= 0:
                    return "\n".join(out), i + 1, j + 1
            return "\n".join(out), i + 1, i + 40
    return None, None, None


def classify(f, h, mine):
    hit = [e for e in mine if e["Trigger"].split(" ")[0] == h or e["Trigger"].startswith(h + " ")]
    b, a, z = body(f, h)
    if hit:
        return "api", hit, (a, z)
    if not b:
        return None, None, None
    if "handleShowConfirmationPopup" in b and re.search(r"show\w*Dialog\(|set\w*\(", b):
        return "reauth", None, (a, z)
    if re.search(r"router\.(push|replace)|window\.location|redirect", b):
        return "nav", None, (a, z)
    if re.search(r"set\w*\(\s*(true|!|\w)|show\w*\(|toggle\w*\(|open\w*\(", b) and not re.search(r"await\s+\w+\(", b):
        return "state", None, (a, z)
    return None, None, None


def call_text(es):
    return "\n".join(BD.call_text(e) for e in es)


PAGER = re.compile(r"^(前のページへ|次のページへ|ページ\d+へ?|\d+)$")
DATE = re.compile(r"^\d\d/\d\d( ー)?$")


def rule(it, files, mine):
    """-> (api, p_jp, q_vn, r) hoac None."""
    lab = it["label"]
    if lab.startswith("Choose date") or lab.startswith("Choose time"):
        hit = find(files, r"<(Desktop|Mobile|Static)?(Date|Time|DateTime)Picker\b|DatePicker|TimePicker")
        if hit:
            return ("Không gọi API — mở bộ chọn ngày / giờ",
                    "日付・時刻ピッカーを開く（APIなし）", "Mở bộ chọn ngày / giờ (thành phần MUI), không gửi dữ liệu", ref(*hit))
    if lab == "開く":
        hit = find(files, r"<Autocomplete\b|<Select\b|<TextField[^>]*select")
        if hit:
            return ("Không gọi API — mở danh sách chọn", "選択肢リストを開く（APIなし）",
                    "Mở danh sách lựa chọn (nút mũi tên của ô chọn MUI)", ref(*hit))
    if lab == "toggle password visibility":
        f = "src/components/common/Fields/PasswordInputField/index.tsx"
        if f in files:
            hit = find([f], r"toggle password visibility")
            return ("Không gọi API", "パスワードの表示／非表示を切り替える（APIなし）",
                    "Hiện / ẩn mật khẩu đang nhập, không gửi đi", ref(f, hit[1], hit[1] + 2))
    if lab == "user":
        hit = find([x for x in files if "Header" in x or "SideBar" in x], r'aria-label="user"')
        if hit and "Header/index.tsx" in hit[0]:
            return ("Không gọi API — chuyển trang 「マイページ」 hoặc mở hộp thoại xác nhận 「ログアウト」",
                    "ヘッダーのユーザーアイコン：「マイページ」へ遷移／「ログアウト」確認ダイアログを開く（APIなし）",
                    "Biểu tượng người dùng ở thanh đầu trang: 「マイページ」 → chuyển tới lịch sử đặt chỗ; 「ログアウト」 → mở hộp thoại xác nhận đăng xuất",
                    ref(hit[0], hit[1] - 4, hit[1] + 10))
        if hit:
            return ("Không gọi API", "ユーザーアイコン（メニュー表示、APIなし）",
                    "Biểu tượng người dùng trong menu (chỉ hiển thị, không có hàm xử lý khi nhấn)", ref(*hit))
    if DATE.match(lab):
        for f, h in (("src/components/TenantVacancies/Vacancy.tsx", "onShowVacancyDetail"),
                     ("src/components/BookingVacancies/Vacancy.tsx", "handleChooseVacancy")):
            if f in files:
                hit = find([f], r"onClick=\{.*%s" % h)
                if h == "onShowVacancyDetail":
                    return ("Không gọi API — hiện chi tiết chỗ trống của ngày đã chọn",
                            "日付セル押下：その日の空き状況詳細を表示（APIなし）",
                            "Bấm ô ngày → chọn ngày (chỉ ngày còn chỗ), hiện chi tiết chỗ trống của ngày đó",
                            ref(f, hit[1]) + " · REPO-01:src/components/TenantVacancies/index.tsx#L95-L99")
                return ("Không gọi API — chọn ngày; ngày hết chỗ / không nhận đặt thì hiện hộp thoại lỗi",
                        "日付セル押下：日付を選択（満席・受付不可はエラーダイアログ、APIなし）",
                        "Bấm ô ngày → chọn ngày; ngày hết chỗ hoặc không nhận đặt → hiện hộp thoại lỗi",
                        ref(f, 42, 56))
    if PAGER.match(lab):
        hit = find(files, r"<DataGrid\b")
        if hit:
            L = "\n".join(text(hit[0]))
            if 'paginationMode="server"' not in L:
                return ("Không gọi API — phân trang trong bảng", "表の改ページ（クライアント側、APIなし）",
                        "Chuyển trang trong bảng (bảng MUI DataGrid phân trang phía trình duyệt)", ref(*hit))
            h2 = find([hit[0]], r"onPageChange\s*=")
            if h2:
                h, _ = handler_near(*h2)
                k, es, rng = classify(hit[0], h, mine) if h else (None, None, None)
                if k == "api":
                    return (call_text(es), "改ページ：%s を呼び出す" % call_text(es),
                            "Chuyển trang → gọi lại danh sách: %s" % call_text(es), ref(*h2))
    # nut / icon co nhan trong code: aria-label="lab" hoac chu hien thi
    esc = re.escape(lab)
    hit = find(files, r'aria-label="%s"' % esc) or find(files, r">\s*%s\s*<|['\"]%s['\"]" % (esc, esc))
    if not hit:
        return None
    f, n = hit
    near = "\n".join(text(f)[max(0, n - 6):n + 3])
    h, hl = handler_near(f, n)
    if not h and re.search(r'type="submit"', near):
        subs = sorted({e["Trigger Ref"] for e in mine if e["Trigger"].startswith("onSubmit") and e["Trigger Ref"].startswith("REPO-01:" + f)})
        es = [e for e in mine if e["Trigger Ref"] in subs]
        if len(subs) == 1:
            return (call_text(es), "フォーム送信：%s を呼び出す" % call_text(es),
                    "Gửi form → gọi %s" % call_text(es), ref(f, n) + " · " + subs[0])
        return None
    if not h:
        return None
    k, es, rng = classify(f, h, mine)
    r = ref(f, hl) + (" · " + ref(f, *rng) if rng and rng[0] else "")
    if k == "api":
        return (call_text(es), "押下時：%s を呼び出す" % call_text(es), "Hành vi khi nhấn: gọi %s" % call_text(es), r)
    if k == "reauth":
        dels = [e for e in mine if e["Method"] == "DELETE" or re.search(r"(?i)delete|remove", e["Trigger"])] if lab == "delete" else []
        tail = ("\nKhi đồng ý trong hộp thoại xoá: %s" % call_text(dels)) if dels else ""
        return ("Không gọi API khi nhấn — hỏi lại mật khẩu / thông tin nhân viên, rồi mở hộp thoại tiếp theo" + tail,
                "押下時：パスワード（または従業員情報）の再確認ダイアログを表示し、確認後に次のダイアログを開く",
                "Hành vi khi nhấn: hiện hộp thoại nhập lại mật khẩu (hoặc thông tin nhân viên) để xác nhận, xong mới mở hộp thoại tiếp theo (hàm %s)" % h + tail, r)
    if k == "nav":
        return ("Không gọi API — chuyển trang", "押下時：画面遷移（APIなし）",
                "Hành vi khi nhấn: chuyển trang (hàm %s)" % h, r)
    if k == "state":
        extra = ""
        if lab == "delete" or "削除" in lab:
            dels = [e for e in mine if re.search(r"(?i)delete|remove", e["Trigger"]) or e["Method"] == "DELETE"]
            if dels:
                extra = "\nKhi đồng ý trong hộp thoại: %s" % call_text(dels)
        return ("Không gọi API khi nhấn — mở hộp thoại / đổi trạng thái màn" + extra,
                "押下時：ダイアログ表示・画面状態の変更（押下時点ではAPIなし）",
                "Hành vi khi nhấn: mở hộp thoại hoặc đổi trạng thái màn (hàm %s), chưa gửi dữ liệu" % h + extra, r)
    return None


out, stat = {}, {"screens": 0, "fixed": 0, "left": 0}
for sc in screens:
    page = next((p for p in pages if p.get("evId") and p.get("evId") == sc["Screenshot EV"]), None)
    if not page:
        continue
    files = files_of(sc["URL / Route"])
    mine = [e for e in edges if BD.norm_route(e["Screen Route"]) == BD.norm_route(sc["URL / Route"])]
    labels = {e["UI Label"] for e in mine if e["Trigger"] != "mount"}
    items = BD.web_items(page, sc["Screenshot EV"])
    changed = False
    for it in items:
        if it["label"].startswith("Choose date, selected date is"):   # nhan chua gia tri ngay -> khong ghi gia tri
            for k in ("name_jp", "name_vn", "label"):
                it[k] = "Choose date"
            it["p"] = it["p"].replace(it["p"].split("\n")[0], "・Choose date")
            it["q"] = it["q"].replace(it["q"].split("\n")[0], "・Choose date")
            changed = True
        if it["type"] not in BD.CLICK or it["label"] in labels or it["type"] == "Hyperlink":
            continue
        res = rule(it, files, mine) if files else None
        if not res:
            stat["left"] += 1
            continue
        api, pj, qv, r = res
        it["api"] = api
        it["p"] += "\n・押下時の挙動：" + pj
        it["q"] += "\n・Hành vi khi nhấn: " + qv
        it["r"] = "; ".join(x for x in (it.get("r"), r) if x)
        stat["fixed"] += 1
        changed = True
    if changed:
        out[sc["Screen ID"]] = {"items": items}
        stat["screens"] += 1
os.makedirs(I + "/bd", exist_ok=True)
json.dump({"screens": out}, open(f"{I}/bd/{site}.json", "w"), ensure_ascii=False, indent=1)
print(site, stat)
