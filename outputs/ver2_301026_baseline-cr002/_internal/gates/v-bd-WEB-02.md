# Quality Gate O4 — Basic Design

- Workbook: `outputs/ver1_281026_baseline/05_Basic_Design/BasicDesign_WEB-02_ver1.xlsx`
- Working sheets: 42 (トップページ, アクセス権限エラー, フリーパス購入, 回数券購入, 予約・オンライン購入, 購入 予約に失敗しました, 購入完了（フリーパス）, 購入 予約完了, 当日利用, 特定商取引法に基づく表示, エラー, パスワードを忘れた場合, メンテナンス中, 料金プラン, プライバシーポリシー, パスワードの再設定, パスワードを変更しました, ログイン方法を選択, アカウント作成はこちら, 仮登録を受付けました, 店舗一覧, 施設詳細, 利用規約, 予約履歴一覧, 予約キャンセル完了, 退場者を選択, 予約の内容を変更しました（途中退場）, 予約変更（振り分け）, 予約の内容を変更しました, アカウント削除, お気に入り店舗一覧, フリーパスの確認, アカウント情報の確認・編集, クレジットカード情報の編集, クレジットカード情報を削除しました, クレジットカード情報を変更しました, パスワードの変更, メールアドレスの変更が完了しました, パスワードの変更（新パスワード入力）, 回数券の確認, 待ち時間 販売状況, ご登録ありがとうございました。)
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
| 10 | Khai bao UI Source | PASS | Giai đoạn 1 (chua chay Playwright): 18 sheet chua co anh, da khai bao — bo sung o Giai đoạn 2 |
| 11 | Khong con sheet vi du tu file mau | PASS | Khong co sheet vi du nao ngoai Screen Creation Plan |
| 12 | Change ID lien tuc | PASS | 6 row, CHG-0001..CHG-0006 lien tuc |
| 13 | Anh UI vua vung A-F | PASS | 24 anh, deu nam trong 840x900px, co caption danh so (do bang anchor.ext — kich thuoc Excel thuc su render) |
| 14 | Style data row | PASS | 312 data row deu co duong ke va khong dung fill header |
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
