# GATE V-CR — CR-001_Impact.xlsx

| # | Check | Ket qua | Chi tiet |
|---|---|---|---|
| 1 | Workbook dung 2 sheet Summary + Impact, header Impact dung schema | PASS |  |
| 2 | meta du key, source_type/overall_risk hop le, baseline_version khop | PASS |  |
| 3 | Giai trinh CR: >=1 dong, tieu chi C1..C6, baseline_ref co that + trich dan | PASS |  |
| 4 | Ca 6 truc: co impact HOAC no_impact_axes (ly do >= 15 ky tu), khong ca hai | PASS |  |
| 5 | Impact ID dung dang IMP-NNN, duy nhat | PASS |  |
| 6 | Enum axis / change_type / conflict / risk | PASS |  |
| 7 | UPD/DEL/IMPACT: moi baseline_ref ton tai trong baseline | PASS |  |
| 8 | NEW: ref la — hoac cha ton tai; cot moi trung cot cu phai conflict=Yes | PASS |  |
| 9 | Moi impact co hang muc, noi dung, vi sao phai sua, anh huong | PASS |  |
| 10 | rate_code co trong bang don gia, dung truc + loai; qty > 0 | PASS |  |
| 11 | Sheet Impact khop cr.json; MD = don gia x so luong; dong Tong MD dung | PASS |  |
| 12 | Summary: tong MD theo truc / loai / tong chung = tong cac dong | PASS |  |
| 13 | Conflict=Yes: co chi tiet + (CQ hoac md_note) | PASS |  |
| 14 | Risk=High: co cau hoi hoac giai phap (question / md_note) | PASS |  |
| 15 | CQ dung dang, duy nhat, moi question tro toi CQ co that | PASS |  |
| 16a | Screen UPD/DEL/IMPACT tham chieu SC- | PASS |  |
| 16b | DB tham chieu table:/column:/— | PASS |  |
| 16c | ThirdParty tham chieu EXT-/— | PASS |  |
| 16d | Mockup NEW/UPD bam design system baseline (DS:/DS-component:) | PASS |  |
| 17 | Evidence (trich CR / file baseline) cho moi impact | PASS |  |
| 18 | Ref DS khong mo ho giua cac site (DS:WEB-xx:<token>) | PASS |  |
| 19 | Bang don gia APPROVED | WARN | status=DRAFT v1 — MD la uoc luong so bo, PM/Tech Lead phai duyet |
| 20 | Xung dot CR-vs-CR | PASS | khong truyen --other-cr |
| 21 | not_cr: label BUG/QUESTION + ly do | PASS |  |

**24 checks · 23 PASS · 0 FAIL · 1 WARN**
