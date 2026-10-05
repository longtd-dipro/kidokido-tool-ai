# Quality Gate O5 — Basic Design

- Workbook: `outputs/ver1_021026_khao-sat-lan-dau/01_Screens/BasicDesign_WEB-01_ver1.xlsx`
- Working sheets: 45 (SC-001, SC-002, SC-003, SC-004, SC-005, SC-006, SC-007, SC-008, SC-009, SC-010, SC-011, SC-012, SC-013, SC-014, SC-015, SC-016, SC-017, SC-018, SC-019, SC-020, SC-021, SC-022, SC-023, SC-024, SC-025, SC-026, SC-027, SC-028, SC-029, SC-030, SC-031, SC-032, SC-033, SC-034, SC-035, SC-036, SC-037, SC-038, SC-039, SC-040, SC-041, SC-042, SC-043, SC-044, SC-045)
- **16 checks · 15 PASS · 0 FAIL · 1 WARN**

| # | Check | Ket qua | Chi tiet |
|---|---|---|---|
| 1 | Sample immutable | PASS | Sample khong bi cham |
| 2 | Sheet Type = WORKING_SCREEN | PASS | 45 working sheet dung Sheet Type |
| 3 | Screen ID duy nhat | PASS | 45 Screen ID phan biet |
| 4 | Metadata F1..F5 day du | PASS | Moi working sheet du metadata |
| 5 | Screen Index dong bo | PASS | 45 sheet khop Screen Index |
| 6 | Message Code ton tai | PASS | 0 reference, tat ca deu co trong catalog |
| 7 | Change History co row moi | PASS | +45 row |
| 8 | Sheet ngoai scope khong doi | PASS | Khong sheet ngoai scope nao bi cham |
| 9 | Khop Screen Creation Plan | PASS | Dung 45 screen, THIEU: [] THUA: [] |
| 10 | Khai bao UI Source | WARN | 16 sheet chua co anh, da khai bao dung: SC-005, SC-006, SC-007, SC-015, SC-019, SC-020, SC-023, SC-024, SC-030, SC-033, SC-034, SC-037, SC-038, SC-039, SC-042, SC-043 |
| 11 | Khong con sheet vi du tu file mau | PASS | Khong co sheet vi du nao ngoai Screen Creation Plan |
| 12 | Change ID lien tuc | PASS | 50 row, CHG-0001..CHG-0050 lien tuc |
| 13 | Anh UI vua vung A-F | PASS | 29 anh, deu nam trong 840x900px (do bang anchor.ext — kich thuoc Excel thuc su render) |
| 14 | Style data row | PASS | 103 data row deu co duong ke va khong dung fill header |
| 15 | Bang ERROR SCENARIOS | PASS | 45 sheet, so row bang khop so error trong catalog |
| 16 | AS-IS: item co mo ta phai tro EV o cot R | PASS | 45 sheet, moi item co mo ta deu co EV hoac UNKNOWN o cot R |

**FAIL = 0 moi duoc bao Output 5 Done.** Khong duoc ha nguong gate.
