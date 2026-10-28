# GATE V9 — Self-test

| Gate | Ca kiem tra | Ket qua | Chi tiet |
|---|---|---|---|
| baseline | Fixture dung -> V1 PASS | PASS |  |
| baseline | Fixture dung -> V2 PASS | PASS |  |
| baseline | Fixture dung -> V5 PASS | PASS |  |
| baseline | Fixture dung -> V8 PASS | PASS |  |
| baseline | Fixture dung -> V3 PASS | PASS |  |
| index | O4 doc link/trang thai/TBD tu STATUS.md | PASS |  |
| index | O4 layout WEB-xx/project/ -> 1 dong / site, link + gate rieng | PASS |  |
| index | Folder CR-<id>_… chua co Impact xlsx -> version_type CR, dong CR = chua co file | PASS |  |
| index | CR: Impact xlsx (N hang muc · MD · don gia), Figma skip, khong co Summary.md | PASS |  |
| index | CR: co gate v-cr-figma -> dong Figma theo gate (FAIL) | PASS |  |
| index | --skip O5 khi da co 05_Figma/figma-links.md -> O5 skip dung ly do | PASS |  |
| index | figma-links.md chua co link figma.com -> O5 'chưa vẽ' (khong phai 'chưa chạy gate') | PASS |  |
| R1 | read-orm-schema: Prisma model + migration replay (@map, DROP, enum, FK) | PASS |  |
| R1 | Gate schema: inventory du bang/cot tu code -> verify-db-doc check 10 PASS | PASS |  |
| R1 | Gate schema: xoa cot orders.note khoi 04_DB_Columns -> check 10 FAIL | PASS |  |
| R1 | Gate schema: thieu ca bang users trong 03 -> check 10 FAIL | PASS |  |
| R1 | scan-repo fe-api-calls.csv: man -> trigger/nut -> API ID, khong gan nham man khong goi | PASS |  |
| R1 | scan-repo api-roles.csv: role doc tu so sanh role trong handler | PASS |  |
| R1 | repo_commit: hash khong doi -> commit_changed=false; sua 1 file -> true | PASS |  |
| R1 | scan-repo: import theo tsconfig baseUrl ('services/order') + paths ('#lib/*'), JSONC -> co canh mount | PASS |  |
| R1 | scan-repo: khong --sensitive-memory -> file ten chua 'password' van bi bo qua | PASS |  |
| R1 | scan-repo: template `${APIs.ORDER}/${id}` -> /api/orders/:id (hang so cua file import, ten trung) | PASS |  |
| R1 | --sensitive-memory: chi mo lai file 'báo nhầm' bi chan vi ten; .env / .yarnrc.yml / [B] van chan | PASS |  |
| R1 | fe-screen-files.json: route -> file component cua man (cho build-basic-design tra handler) | PASS |  |
| legacy | Carry version cu: UNKNOWN -> Status 'To verify', o noi dung 'Cần xác nhận' | PASS |  |
| V8 | Bug chi doc tu code + Reviewer Pick = Yes -> duoc len Bugs (PASS) | PASS |  |
| R9 | Memory du + 00_Meta -> ask rong, 4 cau an toan o confirm_safety, P0a ke thua 00_Meta | PASS |  |
| R9 | Bo qua cau thuong -> pending, hoi lai; cau an toan khong cho bo qua (exit 2) | PASS |  |
| R9 | Cau tra loi giong credential bi tu choi (exit 2); file memory khong co credential (H06 scan sach) | PASS |  |
| R9 | S1 da phan loai -> khong hoi lai; file moi -> sensitive_unknown | PASS |  |
| V3 | Khong co link Figma + co PNG du phong o Phu luc C -> PASS | PASS |  |
| V3 | Co figma-links.md -> 3 link Figma (API · DB · luong) trong docx | PASS |  |
| V1 | Tro toi EV ma (EV-9999) | PASS |  |
| V1 | File artifact khong ton tai | PASS |  |
| V1 | EV ID trung nhau | PASS |  |
| V1 | code-ref tro toi repo khong co trong 11_Repo | PASS |  |
| V1 | code-ref vuot qua so dong cua file | PASS |  |
| V1 | code-ref thieu prefix REPO-xx | PASS |  |
| V1 | db-query sai dinh dang locator | PASS |  |
| V2 | Function Confirmed nhung khong co bang chung | PASS |  |
| V2 | Function Inferred nhung khong khai Open Question | PASS |  |
| V2 | Screen ID tro toi man khong ton tai | PASS |  |
| V2 | De o trong thay vi ghi 'Cần xác nhận' | PASS |  |
| V2 | Khai khong co DB nhung van co bang DB | PASS |  |
| V2 | Cot Meaning High confidence nhung khong co code-ref | PASS |  |
| V2 | Screen tro toi Site khong ton tai | PASS |  |
| V2 | 10_Site.Screen Count lech so man hinh thuc te | PASS |  |
| V2 | API Confirmed khong co EV code-ref | PASS |  |
| V2 | API To verify khong co Open Question | PASS |  |
| V2 | 08_API_Fields tro toi API khong ton tai | PASS |  |
| V2 | Config Keys chua gia tri (KEY=value) | PASS |  |
| V2 | Config Keys chua chuoi token ngau nhien | PASS |  |
| V2 | API ID sai dinh dang | PASS |  |
| V5 | Node tro toi Function khong ton tai | PASS |  |
| V5 | Node tro toi API khong ton tai | PASS |  |
| V5 | Node mo coi khong noi voi node nao | PASS |  |
| V8 | Bug chua tai hien duoc lot sheet gui khach | PASS |  |
| V8 | Bug gan URL /api thay vi man | PASS |  |
| V8 | Category Data (khong quan sat tren man) | PASS |  |
| V8 | Bug gan voi chuc nang F- thay vi man SC- | PASS |  |
| V8 | Repro Steps chi co 1 buoc | PASS |  |
| V8 | Bug trung lap | PASS |  |
| V8 | Severity Low (chi ghi Medium / High / Urgent) | PASS |  |
| V8 | 00_Meta bug_recipient con 'Cần xác nhận' | PASS |  |
| V8 | Bug chi doc tu code lot sheet Bugs khi nguoi duyet chua chon | PASS |  |
| V8 | code-ref cua bug tro dong khong co that | PASS |  |
| V8 | console error la noise cua cong cu quet (read-only-block) | PASS |  |
| V8 | Detected By Code review nhung chi co anh man | PASS |  |
| V8 | Bug list con chu cu (D1) | PASS |  |
| V8 | Screen / Module khong tro ve SC-/F- co that | PASS |  |
| V3 | Bang output lech index.json (them output sau khi render) | PASS |  |
| V3 | Bang output tro toi file khong ton tai | PASS |  |
| V3 | Inventory them man hinh sau khi render -> so lieu chuong 3 lech | PASS |  |
| V3 | db_mode=NONE nhung chuong 5 van co bang DB | PASS |  |
| V3 | Docx con chu cu (D1: phai ghi 'Cần xác nhận — Q-xxx') | PASS |  |
| V3 | Khong co link Figma va khong co anh PNG du phong (D5) | PASS |  |
| V3 | Template goc (con placeholder) phai FAIL check 2 | PASS |  |

**77 ca · 77 PASS · 0 FAIL**
PASS  read-schema tu choi dump co INSERT (exit 3, khong in du lieu)
PASS  read-schema parse dump schema-only dung (max length/format/enum/comment/FK/next_ev)
PASS  build-api-doc + build-db-doc chay OK
PASS  R13: inventory / API / DB xlsx khong freeze panel o moi sheet
PASS  build-db-doc tu choi db_mode=NONE (exit 1)
PASS  build-db-doc chap nhan db_mode=MIGRATION
PASS  verify-api-doc PASS tren doc sach
PASS  verify-db-doc PASS tren doc sach
PASS  API: mat block API-002 -> check 5 FAIL
PASS  API: hyperlink gay (sheet khong ton tai) -> check 7 FAIL
PASS  API: link API-001 tro nham block API-002 -> check 7 FAIL
PASS  API: o trong trong 00_Index -> check 12 FAIL
PASS  API: block thieu 1 dong Response -> check 6 FAIL
PASS  API: Confirmed chi co screenshot (khong code-ref) -> check 8 FAIL
PASS  API: 08_API_Fields tro toi API ID khong ton tai -> check 9 FAIL
PASS  DB: quan he tro toi bang bia 'customers' -> check 5 FAIL
PASS  DB: o trong trong luoi cot -> check 7 FAIL
PASS  DB: link 'orders' tro sang sheet users -> check 6 FAIL
PASS  DB: sheet bang thieu 1 cot -> check 4 FAIL
PASS  DB: mat sheet bang payments -> check 2 FAIL
PASS  DB: Confidence High chi co db-query -> check 8 FAIL
PASS  DB: truyen --erd-png nhung anh khong nhung -> check 9 FAIL
PASS  ERD >60 bang: ve 60, bao so bang an
PASS  verify-db-doc PASS voi 73 bang
PASS  PNG chu Nhat: font CJK (Hiragino Sans), render-flow khong bao thieu glyph, 3 script goi use_cjk_font
PASS  O8 Business: render + verify-business PASS
PASS  O8: than bai co ma noi bo / ten bang -> check 3 FAIL
PASS  O8: thuat ngu khong EV, khong Q -> check 4 FAIL
PASS  O8: Q nhac toi khong co trong chuong 5 -> check 7 FAIL
PASS  O8: EV khong co trong inventory -> check 5 FAIL
PASS  O9 DevSetup: key tu .env.example, khong doc .env that, co batch + moi truong
PASS  verify-devsetup PASS tren file sach
PASS  O9: co KEY=gia tri -> check 4 FAIL
PASS  O9: lot email / PII -> check 3 FAIL (detect-pii --scan)

34 ca · 34 PASS
build: Mở màn -> GET (API-001)                               OK
build: nut 保存 -> POST (API-002)                              OK
build: nut 削除 chi co trong code -> dong item + code-ref      OK
build: nut 印刷 khong co bang chung -> Cần xác nhận — Q-010    OK
build: link -> Không gọi API                                 OK
build: loi web HTTP 500 vao ERROR SCENARIOS, noise bi bo     OK
build: khong freeze panel (R13)                              OK
build: stdout dem o Cần xác nhận + next_q                    OK
code: Screenshot EV 'EV-0003; EV-0004' -> ghep trang EV-0004 OK
code: nhan datepicker bo ngay da chon -> 'Choose date' + code-ref OK
code: nhan khong chua gia tri ngay (2026 / Oct 28)           OK
code: o ngay 10/28, 10/29 -> 1 dong （日付）                     OK
code: icon aria-label=delete -> handler -> DELETE (API-003)  OK
code: router.push -> Không gọi API — chuyển trang            OK
code: onClick viet thang trong JSX -> Trigger Ref cung dong (API-004) OK
code: nhan gan dung 保存する ~ 保存 -> POST (API-002)              OK
code: khong co trong code -> Cần xác nhận — Q-001            OK
code: stdout code_matched / confirm_cells                    OK
BASELINE (khong tiem loi)          exit=0 fails=[]

LOI DA TIEM                        KY VONG  BAT DUOC     KQ
--------------------------------------------------------------------------
xoa duong ke data row              #14      [14]         OK
data row to fill header            #14      [14]         OK
xoa bang ERROR SCENARIOS           #15      [15]         OK
ghi bay vao Sample                 #1       [1]          OK
phong to anh vuot khung            #13      [13]         OK
Change ID nhay coc                 #12      [12]         OK
xoa row Screen Index               #5       [5]          OK
tro Message Code ma                #6       [6]          OK
xoa EV o cot R item dau            #16      [16]         OK
xoa o 'API gọi' cua nut            #17      [17]         OK
con chu cu trong mo ta (D1)        #18      [18]         OK
bo trong o required cua item       #19      [19]         OK

12/12 case bat dung check ky vong — PASS
