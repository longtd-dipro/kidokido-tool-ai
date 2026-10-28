# Quality Gate O5 — Basic Design

- Workbook: `outputs/ver1_281026_baseline/01_Screens/BasicDesign_WEB-02_ver1.xlsx`
- Working sheets: 48 (SC-046, SC-047, SC-048, SC-049, SC-050, SC-051, SC-052, SC-053, SC-054, SC-055, SC-056, SC-057, SC-058, SC-059, SC-060, SC-061, SC-062, SC-063, SC-064, SC-065, SC-066, SC-067, SC-068, SC-069, SC-070, SC-071, SC-072, SC-073, SC-074, SC-075, SC-076, SC-077, SC-078, SC-079, SC-080, SC-081, SC-082, SC-083, SC-084, SC-085, SC-086, SC-087, SC-088, SC-089, SC-090, SC-091, SC-092, SC-093)
- **19 checks · 17 PASS · 0 FAIL · 2 WARN**

| # | Check | Ket qua | Chi tiet |
|---|---|---|---|
| 1 | Sample immutable | PASS | Sample khong bi cham |
| 2 | Sheet Type = WORKING_SCREEN | PASS | 48 working sheet dung Sheet Type |
| 3 | Screen ID duy nhat | PASS | 48 Screen ID phan biet |
| 4 | Metadata F1..F5 day du | PASS | Moi working sheet du metadata |
| 5 | Screen Index dong bo | PASS | 48 sheet khop Screen Index |
| 6 | Message Code ton tai | PASS | 0 reference, tat ca deu co trong catalog |
| 7 | Change History co row moi | PASS | +1 row |
| 8 | Sheet ngoai scope khong doi | PASS | Khong sheet ngoai scope nao bi cham |
| 9 | Khop Screen Creation Plan | PASS | Dung 48 screen, THIEU: [] THUA: [] |
| 10 | Khai bao UI Source | WARN | 48 sheet chua co anh, da khai bao dung: SC-046, SC-047, SC-048, SC-049, SC-050, SC-051, SC-052, SC-053, SC-054, SC-055, SC-056, SC-057, SC-058, SC-059, SC-060, SC-061, SC-062, SC-063, SC-064, SC-065, SC-066, SC-067, SC-068, SC-069, SC-070, SC-071, SC-072, SC-073, SC-074, SC-075, SC-076, SC-077, SC-078, SC-079, SC-080, SC-081, SC-082, SC-083, SC-084, SC-085, SC-086, SC-087, SC-088, SC-089, SC-090, SC-091, SC-092, SC-093 |
| 11 | Khong con sheet vi du tu file mau | PASS | Khong co sheet vi du nao ngoai Screen Creation Plan |
| 12 | Change ID lien tuc | PASS | 6 row, CHG-0001..CHG-0006 lien tuc |
| 13 | Anh UI vua vung A-F | WARN | Khong co anh nao de kiem (moi sheet deu NO IMAGE) |
| 14 | Style data row | PASS | 64 data row deu co duong ke va khong dung fill header |
| 15 | Bang ERROR SCENARIOS | PASS | 48 sheet, so row bang khop so error trong catalog |
| 16 | AS-IS: item co mo ta phai tro bang chung o cot R | PASS | 48 sheet, moi item co mo ta deu co EV / code-ref / Cần xác nhận — Q-xxx |
| 17 | Cot S 'API gọi' cho button / link / form | PASS | Moi item bam duoc deu ghi API goi / khong goi API |
| 18 | Khong con chu cu (D1) | PASS | Khong con chu cu |
| 19 | Khong o trong o cot I..Q cua item | PASS | Moi item du cot I..Q |

**FAIL = 0 moi duoc bao Output 5 Done.** Khong duoc ha nguong gate.
