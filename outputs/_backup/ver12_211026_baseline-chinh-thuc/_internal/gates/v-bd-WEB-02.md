# Quality Gate O5 — Basic Design

- Workbook: `outputs/ver12_211026_baseline-chinh-thuc/01_Screens/BasicDesign_WEB-02_ver12.xlsx`
- Working sheets: 49 (SC-046, SC-047, SC-048, SC-049, SC-050, SC-051, SC-052, SC-053, SC-054, SC-055, SC-056, SC-057, SC-058, SC-059, SC-060, SC-061, SC-062, SC-063, SC-064, SC-065, SC-066, SC-067, SC-068, SC-069, SC-070, SC-071, SC-072, SC-073, SC-074, SC-075, SC-076, SC-077, SC-078, SC-079, SC-080, SC-081, SC-082, SC-083, SC-084, SC-085, SC-086, SC-087, SC-088, SC-089, SC-090, SC-091, SC-092, SC-093, SC-094)
- **16 checks · 15 PASS · 0 FAIL · 1 WARN**

| # | Check | Ket qua | Chi tiet |
|---|---|---|---|
| 1 | Sample immutable | PASS | Sample khong bi cham |
| 2 | Sheet Type = WORKING_SCREEN | PASS | 49 working sheet dung Sheet Type |
| 3 | Screen ID duy nhat | PASS | 49 Screen ID phan biet |
| 4 | Metadata F1..F5 day du | PASS | Moi working sheet du metadata |
| 5 | Screen Index dong bo | PASS | 49 sheet khop Screen Index |
| 6 | Message Code ton tai | PASS | 0 reference, tat ca deu co trong catalog |
| 7 | Change History co row moi | PASS | +48 row |
| 8 | Sheet ngoai scope khong doi | PASS | Khong sheet ngoai scope nao bi cham |
| 9 | Khop Screen Creation Plan | PASS | Dung 49 screen, THIEU: [] THUA: [] |
| 10 | Khai bao UI Source | WARN | 25 sheet chua co anh, da khai bao dung: SC-047, SC-050, SC-051, SC-052, SC-053, SC-058, SC-061, SC-072, SC-073, SC-074, SC-075, SC-077, SC-078, SC-081, SC-082, SC-083, SC-084, SC-085, SC-086, SC-087, SC-088, SC-089, SC-090, SC-093, SC-094 |
| 11 | Khong con sheet vi du tu file mau | PASS | Khong co sheet vi du nao ngoai Screen Creation Plan |
| 12 | Change ID lien tuc | PASS | 53 row, CHG-0001..CHG-0053 lien tuc |
| 13 | Anh UI vua vung A-F | PASS | 24 anh, deu nam trong 840x900px (do bang anchor.ext — kich thuoc Excel thuc su render) |
| 14 | Style data row | PASS | 110 data row deu co duong ke va khong dung fill header |
| 15 | Bang ERROR SCENARIOS | PASS | 49 sheet, so row bang khop so error trong catalog |
| 16 | AS-IS: item co mo ta phai tro EV o cot R | PASS | 49 sheet, moi item co mo ta deu co EV hoac UNKNOWN o cot R |

**FAIL = 0 moi duoc bao Output 5 Done.** Khong duoc ha nguong gate.

16 checks · 15 PASS · 0 FAIL · 1 WARN
