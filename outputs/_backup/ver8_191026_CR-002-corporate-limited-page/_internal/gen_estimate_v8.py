# Sinh _internal/estimate.json cho CR-002 (S12): 1 dong = 1 chuc nang (man x thao tac), song ngu ja / vi.
# 実装 = function-rates.json [code] x qty (script tinh). Phuong an thay the = dong rieng + pattern (S4).
# Chay: python3 gen_estimate_v8.py
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
J = lambda ja, vi: {"ja": ja, "vi": vi}  # noqa: E731

def R(section, big, mid, small, content, code, pattern, impacts, must="◉", step="Step 1", reuse="一部流用", qty=1, ui=None, req=True, confirm=None):
    d = {"section": section, "big": big, "mid": mid, "small": small, "content": content, "confirm": confirm, "reuse": reuse,
         "must": must, "step": step, "pattern": pattern, "code": code, "qty": qty, "req": req, "impacts": impacts,
         "impl_override": None, "override_note": None}
    if ui: d["ui"] = ui
    return d

BIG_CAL = J("商品購入画面 カレンダー表示", "Lịch trên màn mua sản phẩm")
BIG_LP = J("法人向け限定公開ページ", "Trang 限定公開 cho doanh nghiệp")
BIG_GEN = J("一般向け画面", "Màn hình cho khách thường")
BIG_BUY = J("購入画面", "Màn mua")
BIG_PROD = J("商品管理", "Quản lý sản phẩm")
BIG_LPM = J("限定公開ページ管理（オプション）", "Quản lý trang 限定公開 (Option)")
BIG_DB = J("データベース", "Cơ sở dữ liệu")
BIG_QA = J("既存機能への影響確認", "Kiểm tra ảnh hưởng chức năng hiện có")
OPT = dict(must="◯", step="Step 2")

rows = [
 # ---------------- ① カレンダー
 R("user", BIG_CAL, J("事前予約カレンダー", "Lịch đặt trước"), J("パターンB（推奨）", "Phương án B (KH ưu tiên)"),
   J("初期表示を1週間分とし、「1か月分を見る」ボタンで1か月分のカレンダーを展開する。PC・スマートフォン両対応。店舗詳細・事前購入画面・限定公開ページで共通のカレンダー部品を改修する。",
     "Mặc định hiển thị 1 tuần; nút 「1か月分を見る」 mở lịch 1 tháng. PC + mobile. Sửa component lịch dùng chung (店舗詳細 · màn mua trước · trang 限定公開)."),
   "SCR-UPD-L", "1B", ["IMP-001", "IMP-005", "IMP-006"],
   confirm=J("「1週間分」は本日から7日間、「1か月分」は本日から30日間を想定しています。展開ボタンは商品ごとに設置し、展開状態は保持しない想定です。",
             "「1週間」 = 7 ngày từ hôm nay, 「1 tháng」 = 30 ngày từ hôm nay; mỗi sản phẩm 1 nút, không nhớ trạng thái mở (CQ-001…003).")),
 R("user", BIG_CAL, J("事前予約カレンダー", "Lịch đặt trước"), J("パターンA（代替案）", "Phương án A (thay thế)"),
   J("初期表示ではカレンダーを非表示とし、「カレンダーを表示」ボタンで表示する。パターンBとどちらか1つを選択。",
     "Mặc định ẩn lịch; nút 「カレンダーを表示」 để mở. Chọn 1 trong A / B."),
   "SCR-UPD-M", "1A", ["IMP-007", "IMP-008", "IMP-009"], must="◯"),
 R("common", BIG_QA, J("カレンダー部品", "Component lịch"), J("①共通", "① dùng chung"),
   J("カレンダー部品を利用している画面（事前購入画面・管理画面の空き状況）および空き状況取得処理の動作確認・回帰テスト。",
     "Kiểm tra hồi quy các màn dùng component lịch (màn mua trước · 空き状況 admin) và API lấy chỗ trống."),
   "REGRESSION", "1", ["IMP-002", "IMP-003", "IMP-004"], qty=0.5, req=False),
 # ---------------- ② 限定公開（オプションなし）
 R("user", BIG_LP, J("限定公開ページ", "Trang 限定公開"), J("新規ページ", "Trang mới"),
   J("URLを知っている方のみ閲覧できる「法人のお客様向け商品」ページを新規作成する。既存の店舗詳細ページのレイアウト（店舗情報・カレンダー・当日商品）を流用し、限定公開商品のみを表示する。",
     "Tạo trang mới 「法人のお客様向け商品」 chỉ người biết URL xem được. Dùng lại bố cục 店舗詳細 (thông tin 施設 · lịch · vé trong ngày), chỉ hiện sản phẩm 限定公開."),
   "SCR-PAGE-NEW-M", "2P", ["IMP-016", "IMP-022", "IMP-023"], reuse="新規開発",
   confirm=J("ご依頼どおり限定公開URLのページを1つ設け、複数店舗の商品はページ内で店舗を選択して表示する想定です。URLはシステム設定で固定、専用デザインなし（タイトルのみ変更）を想定しています。",
             "Đúng yêu cầu 1 trang / 1 URL; nhiều 施設 → chọn 施設 trên trang; URL cố định trong cấu hình, không thiết kế riêng (CQ-005, 006, 011).")),
 R("user", BIG_LP, J("限定公開ページ", "Trang 限定公開"), J("簡易案（代替案）", "Phương án đơn giản (thay thế)"),
   J("新規ページを作成せず、既存の店舗詳細ページにアクセスキー付きURLでアクセスした場合のみ限定公開商品を表示する。店舗ごとにURLが必要になるため、ご依頼の「ページを1つ」とは異なります（ご了承いただける場合の代替案）。上記「新規ページ」とどちらか1つを選択。",
     "Không tạo trang mới: trang 店舗詳細 hiện có + URL có khoá → chỉ hiện sản phẩm 限定公開. Mỗi 施設 1 URL — LỆCH yêu cầu '1 trang', chỉ khi KH chấp nhận. Chọn 1 trong 2 (②-S)."),
   "SCR-UPD-M", "2S", ["IMP-016"], must="◯"),
 R("user", BIG_LP, J("商品・空き状況の取得", "Lấy sản phẩm / chỗ trống"), J("限定公開商品の絞り込み", "Lọc sản phẩm 限定公開"),
   J("アクセスキーが正しい場合のみ限定公開商品を返すよう、商品一覧・空き状況の取得処理を改修する。キーが不正な場合は限定公開商品を表示しない。",
     "Sửa API danh sách sản phẩm / chỗ trống: chỉ trả sản phẩm 限定公開 khi khoá đúng; sai khoá thì không hiện."),
   "LOGIC-M", "2", ["IMP-011", "IMP-012"]),
 R("user", BIG_GEN, J("既存の一般向け画面", "Màn khách thường hiện có"), J("限定公開商品を非表示", "Ẩn sản phẩm 限定公開"),
   J("店舗詳細・料金プラン・待ち時間/販売状況・購入画面で限定公開商品を表示しないよう表示条件を変更し、影響範囲を調査・確認する。当日予約・POS・順番待ちの共通処理は変更しない。",
     "Ẩn sản phẩm 限定公開 ở 店舗詳細 · 料金プラン · 待ち時間/販売状況 · màn mua; điều tra phạm vi ảnh hưởng. Không sửa hàm dùng chung (đặt trong ngày · POS · hàng chờ)."),
   "PAGE-FILTER-UPD", "2", ["IMP-021", "IMP-013", "IMP-014", "IMP-025"],
   confirm=J("料金プラン・待ち時間/販売状況ページにも限定公開商品は表示しない想定です。", "Ẩn ở 料金プラン và 待ち時間/販売状況 (CQ-009).")),
 R("user", BIG_BUY, J("事前購入画面", "Màn mua trước"), J("アクセスキー引継ぎ", "Giữ khoá truy cập"),
   J("限定公開ページから遷移した場合にアクセスキーを引き継ぎ、限定公開商品を購入できるようにする。決済はクレジットカード（現行どおり）。",
     "Từ trang 限定公開 sang màn mua trước: giữ khoá để mua được sản phẩm 限定公開. Thanh toán thẻ như hiện tại."),
   "SCR-UPD-S", "2", ["IMP-017"],
   confirm=J("URLを知っている方は閲覧・購入可能（ログイン・パスワードなし）とする想定です。", "Ai biết URL đều xem / mua được, không đăng nhập (CQ-007, 008).")),
 R("user", BIG_BUY, J("当日購入画面", "Màn mua trong ngày"), J("アクセスキー引継ぎ", "Giữ khoá truy cập"),
   J("当日1DAY商品について、限定公開ページから遷移した場合にアクセスキーを引き継ぐ。購入方法は現行の当日利用と同じ。",
     "Vé 当日1DAY: giữ khoá khi chuyển từ trang 限定公開; cách mua như vé trong ngày hiện tại."),
   "SCR-UPD-S", "2", ["IMP-018"]),
 R("sa", BIG_PROD, J("商品登録・編集", "Tạo / sửa sản phẩm"), J("限定公開設定", "Cài đặt 限定公開"),
   J("商品登録・編集画面に「公開区分（一般／限定公開）」の設定項目を追加し、保存・反映する。",
     "Thêm mục 「公開区分 (一般 / 限定公開)」 vào form tạo / sửa sản phẩm, lưu và áp dụng."),
   "SETTING-FIELD", "2", ["IMP-015", "IMP-019", "IMP-024"]),
 R("sa", BIG_PROD, J("商品一覧", "Danh sách sản phẩm"), J("公開区分の表示", "Hiện 公開区分"),
   J("商品一覧に公開区分を表示する。", "Hiện cột 公開区分 ở danh sách sản phẩm."), "SCR-UPD-S", "2", ["IMP-020"]),
 R("sa", BIG_PROD, J("商品詳細", "Chi tiết sản phẩm"), J("公開区分の表示", "Hiện 公開区分"),
   J("商品詳細に公開区分を表示する。", "Hiện 公開区分 ở chi tiết sản phẩm."), "SCR-UPD-S", "2", ["IMP-020"]),
 R("common", BIG_DB, J("商品テーブル", "Bảng sản phẩm"), J("項目追加", "Thêm cột"),
   J("商品テーブルに公開区分（限定公開フラグ）を追加する（マイグレーション含む）。", "Thêm cột cờ 限定公開 vào bảng sản phẩm (kèm migration)."),
   "DB-COLUMN", "2", ["IMP-010"], reuse="新規開発", req=False),
 R("common", BIG_QA, J("購入・決済・POS連携", "Mua · thanh toán · POS"), J("②共通", "② dùng chung"),
   J("限定公開商品の購入・決済（GMO）・POS（スマレジ）連携・キャンセル・マイページについて、既存機能の動作確認・回帰テストを行う。",
     "Kiểm tra hồi quy mua · thanh toán GMO · POS Smaregi · huỷ · my page với sản phẩm 限定公開."),
   "REGRESSION", "2", ["IMP-013", "IMP-025"], req=False),
 # ---------------- ② オプション（複数ページ）
 R("user", BIG_LP, J("限定公開ページ", "Trang 限定公開"), J("ページ単位の商品表示", "Hiện sản phẩm theo trang"),
   J("ページ（URL）ごとに表示する限定公開商品を切り替える。", "Mỗi trang (URL) hiện bộ sản phẩm 限定公開 riêng."),
   "LOGIC-M", "2OPT", ["IMP-033"], **OPT),
 R("sa", BIG_LPM, J("限定公開ページ一覧", "Danh sách trang 限定公開"), J("一覧・検索", "Danh sách · tìm kiếm"),
   J("限定公開ページの一覧画面を新規作成する（ページ名・URL・公開状態）。", "Màn danh sách trang 限定公開 (tên · URL · trạng thái)."),
   "SCR-LIST-NEW", "2OPT", ["IMP-034", "IMP-037", "IMP-038"], reuse="新規開発", **OPT),
 R("sa", BIG_LPM, J("限定公開ページ登録・編集", "Tạo / sửa trang 限定公開"), J("登録・編集", "Tạo · sửa"),
   J("限定公開ページの登録・編集画面を新規作成する（ページ名・タイトル・URLキー）。", "Form tạo / sửa trang 限定公開 (tên · tiêu đề · khoá URL)."),
   "SCR-FORM-EDIT", "2OPT", ["IMP-032"], reuse="新規開発", **OPT,
   confirm=J("1つの商品を複数の限定公開ページに掲載できる仕様（例：同じ商品をA社用・B社用ページの両方に掲載）を想定しています。ページの公開期間設定はなし（手動で公開停止）を想定しています。",
             "1 sản phẩm gắn được nhiều trang (đề xuất Dipro); trang không có thời hạn (CQ-010).")),
 R("sa", BIG_LPM, J("限定公開ページ登録・編集", "Tạo / sửa trang 限定公開"), J("公開停止", "Dừng công khai"),
   J("限定公開ページの公開・公開停止を切り替える。", "Bật / tắt công khai trang 限定公開."), "STATUS-ACTION", "2OPT", ["IMP-032"], reuse="新規開発", **OPT),
 R("sa", BIG_PROD, J("商品登録・編集", "Tạo / sửa sản phẩm"), J("掲載先ページ選択", "Chọn trang hiển thị"),
   J("限定公開商品の掲載先ページを選択する項目を追加する（複数ページ選択可）。", "Thêm mục chọn trang hiển thị cho sản phẩm 限定公開 (chọn được nhiều trang)."),
   "SETTING-FIELD", "2OPT", ["IMP-035"], **OPT),
 R("common", BIG_DB, J("限定公開ページテーブル", "Bảng trang 限定公開"), J("テーブル追加", "Thêm bảng"),
   J("限定公開ページのテーブル、および商品と掲載先ページの紐付けテーブル（1商品を複数ページに掲載可）を追加する。", "Thêm bảng trang 限定公開 + bảng liên kết sản phẩm ↔ trang (1 sản phẩm nhiều trang)."),
   "DB-TABLE-PAIR", "2OPT", ["IMP-030", "IMP-031"], reuse="新規開発", req=False, **OPT),
]

P = lambda i, ja, vi: {"id": i, "label": J(ja, vi)}  # noqa: E731
est = {
 "meta": {"cr_id": "CR-002", "title": J("法人向け商品販売に伴う機能改修", "Chỉnh sửa chức năng phục vụ bán sản phẩm cho khách doanh nghiệp — CR-002"),
          "customer": J("株式会社TOKIWAGI", "Công ty TOKIWAGI"), "date": "2026-10-19", "valid_days": 30,
          "section_labels": {"sa": J("管理サイト（SUPER ADMIN・施設ADMIN 共通画面）", "Trang quản trị (WEB-01) — màn dùng chung Super Admin · Admin cửa hàng")}},
 "patterns": [P("1B", "①-B", "①-B"), P("1A", "①-A", "①-A"), P("1", "①共通", "① chung"), P("2P", "②新規ページ", "② trang mới"),
              P("2S", "②簡易案", "②-S"), P("2", "②共通", "② chung"), P("2OPT", "②オプション", "② Option")],
 "combos": [
   {"label": J("① パターンB", "①-B"), "patterns": ["1B", "1"]},
   {"label": J("① パターンA", "①-A"), "patterns": ["1A", "1"]},
   {"label": J("② 限定公開ページ（オプションなし）", "② không Option"), "patterns": ["2P", "2"]},
   {"label": J("② 簡易案（店舗詳細ページ流用）", "②-S (dùng lại 店舗詳細)"), "patterns": ["2S", "2"]},
   {"label": J("② オプション（追加分のみ）", "② Option (phần cộng thêm)"), "patterns": ["2OPT"]},
   {"label": J("①B ＋ ②（オプションなし）", "①-B + ② không Option"), "patterns": ["1B", "1", "2P", "2"]},
   {"label": J("①B ＋ ②（オプションあり）", "①-B + ② có Option"), "patterns": ["1B", "1", "2P", "2", "2OPT"]},
   {"label": J("①A ＋ ②（オプションなし）", "①-A + ② không Option"), "patterns": ["1A", "1", "2P", "2"]},
   {"label": J("①B ＋ ②簡易案", "①-B + ②-S"), "patterns": ["1B", "1", "2S", "2"]},
 ],
 "rows": rows,
 "premises": {
  "前提条件": [
   J("本見積もりは、ご共有いただいた見積依頼書（2026年10月16日）をもとに、現時点で確認できている要件および想定仕様に基づいて作成しております。",
     "Ước tính dựa trên văn bản yêu cầu báo giá KH gửi (16/10/2026) và đặc tả giả định tại thời điểm hiện tại."),
   J("法人向け商品（事前1DAY・当日1DAY × 平日・休日）は、既存の商品管理機能で御社にて登録いただく前提とし、本見積もりの対象外とする。",
     "4 sản phẩm 法人向け do KH tự tạo bằng 商品管理 hiện có — ngoài phạm vi ước tính."),
   J("購入・予約・決済・キャンセル・マイページ・POS連携は既存機能をそのまま利用する。", "Mua · đặt chỗ · thanh toán · huỷ · my page · POS dùng nguyên chức năng hiện có."),
   J("①のパターンA・Bはいずれか1つ、②の新規ページ・簡易案はいずれか1つを選択いただく前提とする。合計は「パターン別合計」をご参照ください。",
     "①-A / ①-B chọn 1; ② trang mới / ②-S chọn 1. Tổng xem bảng 'Tổng theo phương án'."),
   J("Step 1 は①・②の基本機能、Step 2 は②のオプション（複数ページ管理）とする。", "Step 1 = ① + ② cơ bản; Step 2 = ② Option (quản lý nhiều trang)."),
   J("企画終了時（2027年1月頃）は、既存の販売スケジュール（終了日）および公開ステータスの設定で法人向け商品の販売を終了する運用とし、日付による自動非表示機能は本見積もりの対象外とする。",
     "Kết thúc chương trình (khoảng 01/2027): dùng lịch bán (ngày kết thúc) và trạng thái đăng có sẵn để dừng bán sản phẩm doanh nghiệp; không làm chức năng tự ẩn theo ngày."),
   J("未確定の仕様については開発着手前に協議・確定し、仕様変更や追加要望が発生した場合は、必要に応じて工数・費用・スケジュールを再調整する。",
     "Đặc tả chưa chốt sẽ thống nhất trước khi phát triển; thay đổi / yêu cầu thêm → điều chỉnh lại công số, chi phí, lịch."),
  ],
  "既存システムへの影響": [
   J("カレンダー表示は店舗詳細・事前購入画面で共通の部品を改修するため、共通部品を利用する画面の動作確認を行う。",
     "Sửa component lịch dùng chung → kiểm tra các màn đang dùng."),
   J("商品に公開区分を追加し、一般向け画面では限定公開商品を表示しないよう表示条件を変更する。", "Thêm 公開区分 cho sản phẩm; màn khách thường ẩn sản phẩm 限定公開."),
   J("当日予約・POS・順番待ちで利用している共通処理は変更しない方針とするが、既存の購入・決済機能について回帰テストが必要となる。",
     "Không sửa hàm dùng chung (đặt trong ngày · POS · hàng chờ), nhưng cần kiểm thử hồi quy mua / thanh toán."),
  ],
  "クライアント側で事前に決定・準備が必要な事項": [
   J("カレンダー表示： パターンA・Bの選択、「1週間分」「1か月分」の定義、展開ボタンの設置単位。", "Lịch: chọn A / B, định nghĩa 「1 tuần」「1 tháng」, nút theo sản phẩm hay chung."),
   J("限定公開ページ： 複数店舗の商品の表示方法（ページ内で店舗選択／全店舗一覧）、簡易案（店舗ごとのURL）の採否、URL変更の要否、専用デザインの要否。",
     "Trang 限定公開: cách hiện nhiều 施設 trên 1 trang (chọn 施設 / liệt kê hết), có nhận ②-S (mỗi 施設 1 URL — lệch yêu cầu) không, có cần đổi URL từ admin, có cần thiết kế riêng."),
   J("公開範囲： URLを知っている方のみ閲覧・購入可能とすることへのご了承、料金プラン・待ち時間ページでの表示要否。",
     "Phạm vi công khai: chấp nhận 'biết URL là mua được', có hiện ở 料金プラン / 待ち時間 không."),
   J("運用： 売上・予約件数の区別方法、受入試験の環境・ご担当者・日程。", "Vận hành: phân biệt doanh thu, môi trường / người / lịch nghiệm thu."),
  ],
  "想定されるリスク": [
   J("限定公開はURLによるアクセス制御のため、URLが第三者に共有された場合は閲覧・購入される可能性がある。", "限定公開 kiểm soát bằng URL — link bị chia sẻ thì người ngoài xem / mua được."),
   J("共通のカレンダー部品・商品取得処理を改修するため、一般予約を含む既存機能に影響が生じる可能性がある。", "Sửa component / API dùng chung → có thể ảnh hưởng đặt chỗ thường."),
   J("仕様確定・ご発注の時期により、リリース日が変動する可能性がある。", "Ngày release phụ thuộc thời điểm chốt đặc tả và đặt hàng."),
   J("仕様変更や追加対応が発生した場合、開発工数・費用およびスケジュールに影響する可能性がある。", "Thay đổi đặc tả / yêu cầu thêm → ảnh hưởng công số, chi phí, lịch."),
  ],
 },
}
# ---------------- Ban tieng Viet (CR-002_ETA_vi.xlsx): viet lai de hieu, theo kieu ban FINAL (Noi dung du kien + gach dau dong),
# khong de lan tieng Nhat. Thu tu = thu tu rows o tren; kiem bang small.ja de khong gan nham.
VI_ROWS = [
 ("パターンB（推奨）", "Lịch trên màn mua vé", "Lịch đặt trước", "Phương án B (khách hàng chọn)",
  "Nội dung dự kiến:\n・Mặc định mỗi sản phẩm chỉ hiện lịch 7 ngày.\n・Nút 「Xem 1 tháng」 mở lịch 30 ngày; nút 「Đóng」 thu lại.\n・Áp dụng cho cả máy tính và điện thoại.\n・Sửa phần lịch dùng chung cho trang chi tiết cửa hàng, màn mua vé trước và trang giới hạn.",
  "1 tuần = 7 ngày tính từ hôm nay; 1 tháng = 30 ngày tính từ hôm nay; mỗi sản phẩm có nút riêng, không nhớ trạng thái mở khi tải lại trang."),
 ("パターンA（代替案）", "Lịch trên màn mua vé", "Lịch đặt trước", "Phương án A (thay thế cho B)",
  "Nội dung dự kiến:\n・Mặc định ẩn lịch, chỉ hiện tên sản phẩm.\n・Nút 「Hiện lịch」 mở lịch 1 tháng của sản phẩm đó.\n・Chọn 1 trong 2 phương án A hoặc B.", None),
 ("①共通", "Kiểm tra ảnh hưởng chức năng hiện có", "Phần lịch dùng chung", "Hạng mục ①",
  "Kiểm tra lại các màn đang dùng chung phần lịch: màn mua vé trước, màn tình trạng chỗ trống của quản trị.", None),
 ("新規ページ", "Trang giới hạn cho doanh nghiệp", "Trang giới hạn", "Tạo trang mới",
  "Nội dung dự kiến:\n・Tạo trang 「Sản phẩm dành cho khách doanh nghiệp」, chỉ người có link mới vào được.\n・Dùng lại bố cục trang chi tiết cửa hàng: thông tin cửa hàng, lịch đặt trước, vé dùng trong ngày.\n・Chỉ hiện các sản phẩm đang bật 「Hiển thị giới hạn」.\n・Link sai → báo không tìm thấy trang.",
  "Đúng yêu cầu 1 trang / 1 link; sản phẩm của nhiều cửa hàng → chọn cửa hàng ngay trên trang; link cố định trong cấu hình; không thiết kế riêng (chỉ đổi tiêu đề)."),
 ("簡易案（代替案）", "Trang giới hạn cho doanh nghiệp", "Trang giới hạn", "Phương án đơn giản (thay thế)",
  "Nội dung dự kiến:\n・Không tạo trang mới: dùng lại trang chi tiết cửa hàng, mở bằng link có khoá thì hiện thêm sản phẩm giới hạn.\n・Mỗi cửa hàng 1 link riêng → khác yêu cầu 「1 trang」, chỉ dùng nếu khách hàng đồng ý.\n・Chọn 1 trong 2: tạo trang mới hoặc phương án này.", None),
 ("限定公開商品の絞り込み", "Trang giới hạn cho doanh nghiệp", "Lấy dữ liệu sản phẩm / chỗ trống", "Chỉ trả sản phẩm giới hạn khi link đúng",
  "Nội dung dự kiến:\n・Sửa xử lý lấy danh sách sản phẩm và chỗ trống: chỉ trả sản phẩm giới hạn khi link có khoá đúng.\n・Không có khoá hoặc khoá sai → không trả sản phẩm giới hạn.", None),
 ("限定公開商品を非表示", "Màn hình hiện có cho khách thường", "Chi tiết cửa hàng · bảng giá · tình trạng bán · màn mua", "Ẩn sản phẩm giới hạn",
  "Nội dung dự kiến:\n・Không hiện sản phẩm giới hạn ở các màn dành cho khách thường.\n・Điều tra và xác nhận phạm vi ảnh hưởng.\n・Không sửa phần xử lý dùng chung cho mua trong ngày, máy POS, hàng chờ.",
  "Ẩn cả ở trang bảng giá và trang thời gian chờ / tình trạng bán."),
 ("アクセスキー引継ぎ", "Màn mua vé", "Mua vé trước", "Giữ khoá từ link",
  "Nội dung dự kiến:\n・Khi đi từ trang giới hạn sang màn mua vé trước, giữ khoá để mua được sản phẩm giới hạn.\n・Thanh toán bằng thẻ như hiện tại.",
  "Ai có link đều xem và mua được (không cần đăng nhập / mật khẩu)."),
 ("アクセスキー引継ぎ", "Màn mua vé", "Mua vé dùng trong ngày", "Giữ khoá từ link",
  "Nội dung dự kiến:\n・Vé dùng trong ngày: giữ khoá khi đi từ trang giới hạn sang.\n・Cách mua giống vé dùng trong ngày hiện tại.", None),
 ("限定公開設定", "Quản lý sản phẩm", "Đăng ký / sửa sản phẩm", "Cài đặt hiển thị giới hạn",
  "Nội dung dự kiến:\n・Thêm mục 「Hiển thị giới hạn」 vào form đăng ký / sửa sản phẩm: Tắt = bán bình thường, Bật = chỉ hiện ở trang giới hạn.\n・Lưu và áp dụng cho các màn người dùng.", None),
 ("公開区分の表示", "Quản lý sản phẩm", "Danh sách sản phẩm", "Hiển thị loại bán",
  "Thêm cột cho biết sản phẩm đang bán thường hay bán giới hạn.", None),
 ("公開区分の表示", "Quản lý sản phẩm", "Chi tiết sản phẩm", "Hiển thị loại bán",
  "Hiện loại bán (thường / giới hạn) ở màn chi tiết sản phẩm.", None),
 ("項目追加", "Cơ sở dữ liệu", "Bảng sản phẩm", "Thêm cột",
  "Nội dung dự kiến:\n・Thêm cột lưu cài đặt 「Hiển thị giới hạn」 của sản phẩm (kèm chuyển đổi dữ liệu).", None),
 ("②共通", "Kiểm tra ảnh hưởng chức năng hiện có", "Mua vé · thanh toán · máy POS", "Hạng mục ②",
  "Nội dung dự kiến:\n・Kiểm tra lại với sản phẩm giới hạn: mua vé, thanh toán thẻ, liên kết máy POS, huỷ vé, trang cá nhân.", None),
 ("ページ単位の商品表示", "Trang giới hạn cho doanh nghiệp", "Trang giới hạn", "Hiện sản phẩm theo từng trang",
  "Nội dung dự kiến (Option):\n・Mỗi trang (mỗi link) chỉ hiện các sản phẩm được gắn với trang đó.", None),
 ("一覧・検索", "Quản lý trang giới hạn (Option)", "Danh sách trang giới hạn", "Danh sách",
  "Nội dung dự kiến (Option):\n・Màn mới liệt kê các trang giới hạn: tên trang, link, trạng thái.\n・Sao chép link để gửi cho khách doanh nghiệp.", None),
 ("登録・編集", "Quản lý trang giới hạn (Option)", "Tạo / sửa trang giới hạn", "Tạo · sửa",
  "Nội dung dự kiến (Option):\n・Form tạo / sửa trang: tên trang, tiêu đề hiển thị.\n・Hệ thống tự sinh link khi lưu.",
  "1 sản phẩm gắn được nhiều trang (đề xuất của Dipro); trang không có thời hạn, quản trị dừng bằng tay."),
 ("公開停止", "Quản lý trang giới hạn (Option)", "Tạo / sửa trang giới hạn", "Dừng / mở lại trang",
  "Nội dung dự kiến (Option):\n・Bật / dừng công khai từng trang; trang đã dừng thì link báo không tìm thấy trang.", None),
 ("掲載先ページ選択", "Quản lý sản phẩm", "Đăng ký / sửa sản phẩm", "Chọn trang hiển thị",
  "Nội dung dự kiến (Option):\n・Với sản phẩm giới hạn, chọn 1 hoặc nhiều trang sẽ hiển thị sản phẩm.", None),
 ("テーブル追加", "Cơ sở dữ liệu", "Bảng trang giới hạn", "Thêm bảng",
  "Nội dung dự kiến (Option):\n・Thêm bảng trang giới hạn và bảng liên kết sản phẩm ↔ trang (1 sản phẩm gắn được nhiều trang).", None),
]
assert len(VI_ROWS) == len(rows)
for r, (sm, big, mid, small, content, confirm) in zip(rows, VI_ROWS):
    assert r["small"]["ja"] == sm, (r["small"]["ja"], sm)
    r["big"]["vi"], r["mid"]["vi"], r["small"]["vi"], r["content"]["vi"] = big, mid, small, content
    if r.get("confirm"):
        assert confirm, sm
        r["confirm"]["vi"] = confirm
est["meta"]["section_labels"] = {
    "user": J("ユーザー予約サイト", "Trang đặt chỗ cho khách hàng"),
    "sa": J("管理サイト（SUPER ADMIN・施設ADMIN 共通画面）", "Trang quản trị (dùng chung cho Super Admin và Admin cửa hàng)"),
    "admin": J("施設管理サイト（ADMIN）", "Trang quản trị cửa hàng"),
    "common": J("全システム", "Toàn hệ thống (dữ liệu · kiểm tra ảnh hưởng)")}
VI_PAT = {"1B": "① Phương án B", "1A": "① Phương án A", "1": "① Dùng chung", "2P": "② Trang mới", "2S": "② Phương án đơn giản", "2": "② Dùng chung", "2OPT": "② Option"}
for pt in est["patterns"]:
    pt["label"]["vi"] = VI_PAT[pt["id"]]
VI_COMBO = ["① Phương án B", "① Phương án A", "② Không Option (trang mới)", "② Phương án đơn giản", "② Option (phần cộng thêm)",
            "① B + ② không Option", "① B + ② có Option", "① A + ② không Option", "① B + ② phương án đơn giản"]
for cb, v in zip(est["combos"], VI_COMBO):
    cb["label"]["vi"] = v
VI_PREM = {
 "前提条件": ["Báo giá dựa trên văn bản yêu cầu báo giá khách hàng gửi ngày 16/10/2026 và đặc tả giả định tại thời điểm hiện tại.",
             "4 sản phẩm cho doanh nghiệp (vé 1 ngày mua trước / dùng trong ngày × ngày thường / ngày nghỉ) do khách hàng tự tạo bằng chức năng quản lý sản phẩm hiện có — không nằm trong báo giá.",
             "Mua vé, đặt chỗ, thanh toán, huỷ, trang cá nhân, liên kết máy POS dùng nguyên chức năng hiện có.",
             "Hạng mục ①: chọn 1 trong phương án A / B. Hạng mục ②: chọn 1 trong 「tạo trang mới」 / 「phương án đơn giản」. Tổng tiền xem bảng 「Tổng theo phương án」.",
             "Step 1 = hạng mục ① và ② cơ bản; Step 2 = Option của ② (nhiều trang giới hạn).",
             "Kết thúc chương trình (khoảng 01/2027): quản trị đặt ngày kết thúc lịch bán / chuyển trạng thái đăng sang Ẩn bằng chức năng có sẵn; không làm chức năng tự ẩn theo ngày.",
             "Đặc tả chưa chốt sẽ thống nhất trước khi bắt đầu phát triển; nếu thay đổi đặc tả hoặc có yêu cầu thêm thì điều chỉnh lại công số, chi phí và lịch."],
 "既存システムへの影響": ["Sửa phần lịch dùng chung → kiểm tra lại các màn đang dùng phần lịch này.",
             "Thêm cài đặt 「Hiển thị giới hạn」 cho sản phẩm; các màn dành cho khách thường sẽ ẩn sản phẩm giới hạn.",
             "Không sửa phần xử lý dùng chung cho mua trong ngày, máy POS, hàng chờ, nhưng cần kiểm thử hồi quy phần mua vé và thanh toán."],
 "クライアント側で事前に決定・準備が必要な事項": ["Lịch: chọn phương án A hay B; định nghĩa 「1 tuần」, 「1 tháng」; nút mở lịch đặt cho từng sản phẩm hay chung.",
             "Trang giới hạn: sản phẩm của nhiều cửa hàng hiển thị thế nào trên 1 trang; có dùng phương án đơn giản (mỗi cửa hàng 1 link) không; có cần đổi link từ màn quản trị không; có cần thiết kế riêng không.",
             "Phạm vi công khai: chấp nhận 「ai có link là mua được」; có ẩn sản phẩm giới hạn ở trang bảng giá / thời gian chờ không.",
             "Vận hành: cách tách doanh thu, môi trường / người / lịch nghiệm thu."],
 "想定されるリスク": ["Trang giới hạn kiểm soát bằng link — nếu link bị chia sẻ thì người ngoài cũng xem và mua được.",
             "Sửa phần lịch và phần lấy dữ liệu sản phẩm dùng chung → có thể ảnh hưởng tới đặt chỗ thông thường.",
             "Ngày release phụ thuộc thời điểm chốt đặc tả và đặt hàng.",
             "Thay đổi đặc tả hoặc yêu cầu thêm → ảnh hưởng tới công số, chi phí và lịch."]}
for k, vis in VI_PREM.items():
    assert len(vis) == len(est["premises"][k]), k
    for it, v in zip(est["premises"][k], vis):
        it["vi"] = v
# ---------------- Ban tieng Nhat (gui khach): viet theo kieu 見積書 FINAL — 【想定する対応内容】 + ・ (writing-style.md)
JA_CONTENT = [
 "【想定する対応内容】\n・事前予約カレンダーの初期表示を、商品ごとに本日から1週間分とする。\n・「1か月分を見る」ボタンで1か月分のカレンダーを展開し、「閉じる」で元に戻す。\n・PC・スマートフォンの両方に対応する。\n・店舗詳細ページ・事前購入画面・限定公開ページで共通のカレンダー部品を改修する。",
 "【想定する対応内容】\n・事前予約カレンダーを初期表示では非表示とし、商品名のみを表示する。\n・「カレンダーを表示」ボタンで、その商品の1か月分のカレンダーを表示する。\n※パターンBとどちらか1つを選択いただく前提です。",
 "【想定する対応内容】\n・カレンダー部品を利用している画面（事前購入画面、管理画面の空き状況）の動作確認・回帰テストを行う。",
 "【想定する対応内容】\n・URLを知っている方だけが閲覧できる「法人のお客様向け商品」ページを新規作成する。\n・既存の店舗詳細ページのレイアウト（店舗情報・カレンダー・当日商品）を流用する。\n・限定公開に設定された商品のみを表示する。\n・URLが正しくない場合は「ページが見つかりません」を表示する。",
 "【提案する対応方法】（簡易案）\n・新規ページは作成せず、既存の店舗詳細ページにアクセスキー付きURLでアクセスした場合のみ、限定公開商品を表示する。\n・店舗ごとにURLが必要になるため、ご依頼の「ページを1つ」とは異なります（ご了承いただける場合の代替案）。\n※上記「新規ページ」とどちらか1つを選択いただく前提です。",
 "【想定する対応内容】\n・商品一覧・空き状況の取得処理を改修し、正しいアクセスキー付きのURLからアクセスした場合のみ限定公開商品を表示する。\n・キーがない、または正しくない場合は限定公開商品を表示しない。",
 "【想定する対応内容】\n・店舗詳細・料金プラン・待ち時間/販売状況・購入画面など一般向けの画面に、限定公開商品を表示しないようにする。\n・影響範囲を調査・確認する。\n・当日予約・POS・順番待ちで利用している共通処理は変更しない。",
 "【想定する対応内容】\n・限定公開ページから事前購入画面へ遷移した場合、アクセスキーを引き継ぎ、限定公開商品を購入できるようにする。\n・決済はクレジットカード（現行どおり）とする。",
 "【想定する対応内容】\n・当日1DAY商品について、限定公開ページから当日購入画面へ遷移した場合にアクセスキーを引き継ぐ。\n・購入方法は現行の当日利用と同じとする。",
 "【想定する対応内容】\n・商品登録・編集画面に「限定公開」の設定項目（OFF：通常公開／ON：限定公開）を追加する。\n・設定内容を保存し、ユーザー画面の表示に反映する。",
 "【想定する対応内容】\n・商品一覧に公開区分（通常公開／限定公開）を表示する。",
 "【想定する対応内容】\n・商品詳細に公開区分（通常公開／限定公開）を表示する。",
 "【想定する対応内容】\n・商品テーブルに公開区分（限定公開フラグ）を追加する（データ移行を含む）。",
 "【想定する対応内容】\n・限定公開商品について、購入・決済（クレジットカード）・POS連携・キャンセル・マイページの動作確認・回帰テストを行う。",
 "【想定する対応内容】（オプション）\n・限定公開ページ（URL）ごとに、そのページに掲載された商品のみを表示する。",
 "【想定する対応内容】（オプション）\n・限定公開ページの一覧画面を新規作成する（ページ名・URL・公開状態を表示）。\n・URLをコピーして法人のお客様へご案内できるようにする。",
 "【想定する対応内容】（オプション）\n・限定公開ページの登録・編集画面を新規作成する（ページ名・表示タイトル）。\n・保存時にページごとのURLを自動で発行する。",
 "【想定する対応内容】（オプション）\n・限定公開ページごとに公開・公開停止を切り替えられるようにする。\n・公開停止したページのURLでは「ページが見つかりません」を表示する。",
 "【想定する対応内容】（オプション）\n・限定公開商品の掲載先ページを、作成済みのページから選択できるようにする（複数ページ選択可）。",
 "【想定する対応内容】（オプション）\n・限定公開ページのテーブル、および商品と掲載先ページの紐付けテーブル（1商品を複数ページに掲載可）を追加する。",
]
assert len(JA_CONTENT) == len(rows)
for r, c in zip(rows, JA_CONTENT):
    r["content"]["ja"] = c
# ---------------- Cau hoi nghiep vu gui khach (kit sinh sheet 確認事項 / Cau hoi nghiep vu) — khong ma noi bo
D1, D2, D3 = "2026/10/20", "2026/10/21", "2026/10/28"
def Q(id_, grp, q, why, prop, alt, due):
    return {"id": id_, "group": grp, "question": q, "why": why, "proposal": prop, "alt": alt, "due": due}
GL, GP, GO, GV = J("カレンダー（①）", "Lịch (①)"), J("限定公開ページ（②）", "Trang giới hạn (②)"), J("オプション", "Option"), J("運用", "Vận hành")
est["questions"] = [
 Q("CQ-001", GL, J("「1か月分を見る」で表示するのは、本日から30日間でよろしいでしょうか。それとも当月末までの表示が必要でしょうか。",
                   "Khi bấm “Xem 1 tháng”, lịch hiện 30 ngày tính từ hôm nay, hay hiện đến hết tháng hiện tại?"),
   J("カレンダーを展開した際の表示日数を決めるためです。", "Quyết định số ngày hiển thị khi mở rộng lịch."),
   J("本日から30日間", "30 ngày tính từ hôm nay."), J("当月末まで表示する場合、日付処理の追加により工数が少し増えます。", "Đến hết tháng → thêm xử lý ngày, phát sinh công nhỏ."), D1),
 Q("CQ-002", GL, J("初期表示の「1週間分」は本日から7日間でよろしいでしょうか。それとも月曜〜日曜の暦週でしょうか。",
                   "“1 tuần” hiển thị mặc định là 7 ngày tính từ hôm nay, hay 1 tuần theo lịch (thứ Hai – Chủ nhật)?"),
   J("パターンBの初期表示の範囲を決めるためです。", "Quyết định ngày bắt đầu / kết thúc của lịch thu gọn (phương án B)."),
   J("本日から7日間", "7 ngày tính từ hôm nay."), J("暦週で表示する場合、工数が少し増えます。", "Theo tuần lịch → thêm xử lý, phát sinh công nhỏ."), D1),
 Q("CQ-004", GL, J("カレンダー折りたたみの対象は、店舗詳細ページ・事前購入画面・限定公開ページでよろしいでしょうか（管理画面の空き状況は変更なし）。",
                   "Chức năng thu gọn lịch áp dụng cho trang chi tiết cửa hàng, màn mua vé trước và trang giới hạn — đúng không? (màn tình trạng chỗ trống của quản trị giữ nguyên)"),
   J("改修・テストの対象画面を確定するためです。", "Phạm vi màn cần sửa và kiểm thử."), J("上記3画面", "Áp dụng cho 3 màn trên."),
   J("対象画面が増える場合、テスト工数が増えます。", "Thêm màn khác → thêm kiểm thử."), D1),
 Q("CQ-005", GP, J("限定公開ページは、ご依頼どおりURL1つのページとする想定です。複数店舗の商品は、ページ内で店舗を選択して表示する形でよろしいでしょうか。全店舗分を同時に一覧表示する必要はありますか。",
                   "Trang giới hạn (1 trang, 1 link — theo yêu cầu) hiển thị sản phẩm của nhiều cửa hàng thế nào: chọn cửa hàng ngay trên trang, hay liệt kê tất cả cửa hàng cùng lúc?"),
   J("商品と販売スケジュールは店舗ごとに管理されており、表示方法がご依頼に記載されていないためです。", "Sản phẩm và lịch bán được quản lý theo từng cửa hàng; yêu cầu chưa nói cách hiển thị."),
   J("ページ内で店舗を選択して表示", "Chọn cửa hàng ngay trên trang."),
   J("全店舗を一覧表示する場合、ページが長くなり工数が少し増えます。", "Liệt kê tất cả → trang dài, phát sinh công nhỏ."), D2),
 Q("CQ-006", GP, J("限定公開ページのURLを、管理画面から変更する必要はありますか（URLが外部に漏れた場合など）。",
                   "Có cần tự đổi link trang giới hạn từ màn quản trị không (ví dụ khi link bị lộ)?"),
   J("URL変更機能の要否を決めるためです。", "Ảnh hưởng tới việc có cần thêm chức năng đổi link."),
   J("基本機能：URLは固定とし、変更が必要な場合は弊社で対応します。オプション：ページを公開停止し、新しいページを作成します。",
     "Bản cơ bản: link cố định, khi cần đổi thì Dipro hỗ trợ. Option: dừng trang cũ, tạo trang mới."),
   J("管理画面からURLを変更する場合、機能追加となり工数が増えます。", "Tự đổi link từ màn quản trị → thêm chức năng, phát sinh công."), D2),
 Q("CQ-007", GP, J("限定公開は「URLを知っている方なら閲覧・購入できる」（ログイン・パスワードなし）仕様でよろしいでしょうか。URLが共有された場合のリスクについてご了承いただけますか。",
                   "Trang giới hạn theo kiểu “ai có link là xem và mua được” (không đăng nhập, không mật khẩu) — khách hàng có chấp nhận rủi ro link bị chia sẻ không?"),
   J("限定公開ページの保護レベルを決めるためです。", "Quyết định mức bảo vệ của trang giới hạn."), J("上記仕様でご了承いただく", "Chấp nhận như trên."),
   J("ログインやパスワードによる制限を追加する場合、工数が増えます。", "Thêm đăng nhập / mật khẩu → phát sinh công."), D2),
 Q("CQ-008", GP, J("法人向け商品の購入方法は、事前1DAYはクレジットカード決済（現行どおり）、当日1DAYは現行の当日利用と同じ方法でよろしいでしょうか。",
                   "Cách mua sản phẩm doanh nghiệp: vé mua trước thanh toán thẻ online, vé dùng trong ngày mua như vé dùng trong ngày hiện tại — đúng không?"),
   J("既存の購入・決済の仕組みをそのまま利用できるか確認するためです。", "Xác nhận dùng nguyên luồng mua và thanh toán hiện có."), J("現行どおり", "Giữ như hiện tại."),
   J("請求書払いなど別の決済方法が必要な場合、大きく工数が増えます。", "Cách thanh toán khác (hoá đơn, chuyển khoản…) → phát sinh lớn."), D2),
 Q("CQ-009", GP, J("限定公開商品は、料金プランページや待ち時間/販売状況ページにも表示しない想定でよろしいでしょうか。",
                   "Sản phẩm giới hạn có cần ẩn ở trang bảng giá và trang thời gian chờ / tình trạng bán không?"),
   J("限定公開商品を非表示にする画面の範囲を決めるためです。", "Phạm vi các màn phải ẩn sản phẩm giới hạn."), J("両ページとも表示しない", "Ẩn ở cả 2 trang."),
   J("表示する場合、テスト工数が少し減ります。", "Vẫn hiện → giảm kiểm thử."), D2),
 Q("CQ-010", GO, J("オプションでは、1つの商品を複数の限定公開ページに掲載できる仕様（例：同じ商品をA社用・B社用の両ページに掲載）をご提案します。この仕様でよろしいでしょうか。",
                   "Dipro đề xuất 1 sản phẩm hiển thị được ở nhiều trang (VD 1 vé dùng chung cho công ty X và công ty Y) — khách hàng có đồng ý không?"),
   J("商品とページの紐付け方法を決めるためです。", "Quyết định cách gán sản phẩm vào trang."),
   J("1商品を複数ページに掲載可能", "1 sản phẩm gắn được nhiều trang."),
   J("1商品1ページとする場合は工数が少し減ります。", "Chỉ 1 trang → giảm nhẹ công."), D3),
 Q("CQ-014", GV, J("法人向け商品の売上・予約件数を、売上管理やCSVで区別して確認する必要はありますか（現状は商品名で区別可能です）。",
                   "Có cần xem riêng doanh thu / số đặt chỗ của sản phẩm doanh nghiệp ở màn quản lý doanh thu hoặc file CSV không?"),
   J("売上レポートに絞り込み・項目追加が必要か判断するためです。", "Quyết định có cần thêm bộ lọc / cột riêng cho báo cáo."),
   J("商品名で区別（既存機能で対応可能）", "Phân biệt bằng tên sản phẩm (đã làm được với chức năng hiện có)."),
   J("専用の絞り込み・項目が必要な場合、工数が増えます。", "Cần lọc / cột riêng → phát sinh công."), D2),
]
VIP = lambda x: x.replace("・", "• ").replace("「", "“").replace("」", "”")  # noqa: E731
for q in est["questions"]:
    for k in ("question", "why", "proposal", "alt"):
        q[k]["vi"] = VIP(q[k]["vi"])
for r in rows:
    for k in ("big", "mid", "small", "content", "confirm"):
        if r.get(k):
            r[k]["vi"] = VIP(r[k]["vi"])
for k in est["premises"]:
    for it in est["premises"][k]:
        it["vi"] = VIP(it["vi"])
json.dump(est, open(os.path.join(HERE, "estimate.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
print("estimate.json: %d dong" % len(rows))
