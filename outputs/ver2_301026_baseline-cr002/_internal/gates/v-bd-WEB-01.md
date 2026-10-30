# Quality Gate O4 — Basic Design

- Workbook: `outputs/ver1_281026_baseline/05_Basic_Design/BasicDesign_WEB-01_ver1.xlsx`
- Working sheets: 42 (管理画面トップ, アプリ設定, バーコード読み取り, 予約管理, 予約詳細, 予約の一部退場, 予約人数・日時の変更, 順番待ち管理, 在庫調整, メール変更, パスワード変更, ダッシュボード, 免責事項設定, 自動返信メール設定, 自動返信メール設定（編集）, パスワードを忘れた場合, GMOアカウント管理, 新規GMOアカウントの設定, GMOアカウントの編集, GMOアカウント詳細, お知らせ管理, お知らせの設定, お知らせの編集, パスワードの再設定, 売上管理, 入場状況管理, 管理画面ログイン, 従業員管理, 従業員情報の編集, 施設管理, 新規施設登録, 施設編集, 施設詳細, 商品管理, 商品編集, 商品詳細, アカウントのロック解除, ユーザー管理, ユーザー編集, ユーザー詳細, 空き状況, 待機時間設定)
- **24 checks · 24 PASS · 0 FAIL · 0 WARN**

| # | Check | Ket qua | Chi tiet |
|---|---|---|---|
| 1 | Sample immutable | PASS | Sample khong bi cham |
| 2 | Sheet Type = WORKING_SCREEN | PASS | 42 working sheet dung Sheet Type |
| 3 | Screen ID duy nhat | PASS | 42 Screen ID phan biet |
| 4 | Metadata F1,F2,F3,F5 day du | PASS | Moi working sheet du metadata |
| 5 | Screen Index dong bo | PASS | 42 sheet khop Screen Index |
| 6 | Message Code ton tai | PASS | 0 reference, tat ca deu co trong catalog |
| 7 | Change History co row moi | PASS | +1 row |
| 8 | Sheet ngoai scope khong doi | PASS | Khong sheet ngoai scope nao bi cham |
| 9 | Khop Screen Creation Plan | PASS | Dung 42 screen, THIEU: [] THUA: [] |
| 10 | Khai bao UI Source | PASS | Giai đoạn 1 (chua chay Playwright): 16 sheet chua co anh, da khai bao — bo sung o Giai đoạn 2 |
| 11 | Khong con sheet vi du tu file mau | PASS | Khong co sheet vi du nao ngoai Screen Creation Plan |
| 12 | Change ID lien tuc | PASS | 6 row, CHG-0001..CHG-0006 lien tuc |
| 13 | Anh UI vua vung A-F | PASS | 26 anh, deu nam trong 840x900px, co caption danh so (do bang anchor.ext — kich thuoc Excel thuc su render) |
| 14 | Style data row | PASS | 387 data row deu co duong ke va khong dung fill header |
| 15 | Bang ERROR SCENARIOS | PASS | 42 sheet, so row bang khop so error trong catalog |
| 16 | AS-IS: item co mo ta phai tro bang chung o cot R | PASS | 42 sheet, moi item co mo ta deu co EV / code-ref / Cần xác nhận — Q-xxx |
| 17 | Cot S 'API gọi' cho button / link / form | PASS | Moi item bam duoc deu ghi API goi / khong goi API |
| 18 | Khong con chu cu (D1) | PASS | Khong con chu cu |
| 19 | Khong o trong o cot I..Q cua item | PASS | Moi item du cot I..Q |
| 20 | Khong o trong o dong loi (error message) | PASS | Screen Error message · Common mesage · ERROR SCENARIOS du o |
| 21 | Khong con trang thai Status / DRAFT | PASS | Screen Index khong co cot Status, sheet khong co o Status |
| 22 | Item nhap lieu co required / maxlength | PASS | Moi item nhap lieu du required / maxlength |
| 23 | Ten / mo ta item khong chua ma (API, ham) | PASS | Cot I/J/P/Q khong co METHOD /api, chu API, ten ham |
| 24 | Ten man doc duoc (khong ma / route) | PASS | 42 ten sheet / Screen Name doc duoc |

**FAIL = 0 moi duoc bao Output 5 Done.** Khong duoc ha nguong gate.
