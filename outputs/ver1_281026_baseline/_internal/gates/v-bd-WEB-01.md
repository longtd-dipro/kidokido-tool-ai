# Quality Gate O5 — Basic Design

- Workbook: `outputs/ver1_281026_baseline/01_Screens/BasicDesign_WEB-01_ver1.xlsx`
- Working sheets: 45 (SC-001, SC-002, SC-003, SC-004, SC-005, SC-006, SC-007, SC-008, SC-009, SC-010, SC-011, SC-012, SC-013, SC-014, SC-015, SC-016, SC-017, SC-018, SC-019, SC-020, SC-021, SC-022, SC-023, SC-024, SC-025, SC-026, SC-027, SC-028, SC-029, SC-030, SC-031, SC-032, SC-033, SC-034, SC-035, SC-036, SC-037, SC-038, SC-039, SC-040, SC-041, SC-042, SC-043, SC-044, SC-045)
- **19 checks · 17 PASS · 0 FAIL · 2 WARN**

| # | Check | Ket qua | Chi tiet |
|---|---|---|---|
| 1 | Sample immutable | PASS | Sample khong bi cham |
| 2 | Sheet Type = WORKING_SCREEN | PASS | 45 working sheet dung Sheet Type |
| 3 | Screen ID duy nhat | PASS | 45 Screen ID phan biet |
| 4 | Metadata F1..F5 day du | PASS | Moi working sheet du metadata |
| 5 | Screen Index dong bo | PASS | 45 sheet khop Screen Index |
| 6 | Message Code ton tai | PASS | 0 reference, tat ca deu co trong catalog |
| 7 | Change History co row moi | PASS | +1 row |
| 8 | Sheet ngoai scope khong doi | PASS | Khong sheet ngoai scope nao bi cham |
| 9 | Khop Screen Creation Plan | PASS | Dung 45 screen, THIEU: [] THUA: [] |
| 10 | Khai bao UI Source | WARN | 45 sheet chua co anh, da khai bao dung: SC-001, SC-002, SC-003, SC-004, SC-005, SC-006, SC-007, SC-008, SC-009, SC-010, SC-011, SC-012, SC-013, SC-014, SC-015, SC-016, SC-017, SC-018, SC-019, SC-020, SC-021, SC-022, SC-023, SC-024, SC-025, SC-026, SC-027, SC-028, SC-029, SC-030, SC-031, SC-032, SC-033, SC-034, SC-035, SC-036, SC-037, SC-038, SC-039, SC-040, SC-041, SC-042, SC-043, SC-044, SC-045 |
| 11 | Khong con sheet vi du tu file mau | PASS | Khong co sheet vi du nao ngoai Screen Creation Plan |
| 12 | Change ID lien tuc | PASS | 6 row, CHG-0001..CHG-0006 lien tuc |
| 13 | Anh UI vua vung A-F | WARN | Khong co anh nao de kiem (moi sheet deu NO IMAGE) |
| 14 | Style data row | PASS | 61 data row deu co duong ke va khong dung fill header |
| 15 | Bang ERROR SCENARIOS | PASS | 45 sheet, so row bang khop so error trong catalog |
| 16 | AS-IS: item co mo ta phai tro bang chung o cot R | PASS | 45 sheet, moi item co mo ta deu co EV / code-ref / Cần xác nhận — Q-xxx |
| 17 | Cot S 'API gọi' cho button / link / form | PASS | Moi item bam duoc deu ghi API goi / khong goi API |
| 18 | Khong con chu cu (D1) | PASS | Khong con chu cu |
| 19 | Khong o trong o cot I..Q cua item | PASS | Moi item du cot I..Q |

**FAIL = 0 moi duoc bao Output 5 Done.** Khong duoc ha nguong gate.
