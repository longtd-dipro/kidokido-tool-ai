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
| index | CR: Impact xlsx (N hang muc · MD · don gia), Figma skip, khong co Summary.md | PASS |  |
| index | CR: co gate v-cr-figma -> dong Figma theo gate (FAIL) | PASS |  |
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
| V2 | De o trong thay vi ghi UNKNOWN | PASS |  |
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
| V8 | Quy ket Security ma khong co PoC | PASS |  |
| V8 | Repro Steps chi co 1 buoc | PASS |  |
| V8 | Bug trung lap | PASS |  |
| V8 | Severity Low (khong duoc ghi nhan) | PASS |  |
| V8 | 00_Meta bug_recipient con UNKNOWN | PASS |  |
| V8 | Screen / Module khong tro ve SC-/F- co that | PASS |  |
| V3 | Bang output lech index.json (them output sau khi render) | PASS |  |
| V3 | Bang output tro toi file khong ton tai | PASS |  |
| V3 | Inventory them man hinh sau khi render -> so lieu chuong 3 lech | PASS |  |
| V3 | db_mode=NONE nhung chuong 5 van co bang DB | PASS |  |
| V3 | Template goc (con placeholder) phai FAIL check 2 | PASS |  |

**45 ca · 45 PASS · 0 FAIL**
PASS  read-schema tu choi dump co INSERT (exit 3, khong in du lieu)
PASS  read-schema parse dump schema-only dung (max length/format/enum/comment/FK/next_ev)
PASS  build-api-doc + build-db-doc chay OK
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

23 ca · 23 PASS
PASS project hop le -> PASS
PASS --published-url co trong STATUS.md '- Artifact:' -> check 12 PASS
PASS --published-url sai dang -> check 12 FAIL
PASS APPROVED + --approved-by -> check 13 PASS
PASS family dang map DTCG -> check 3 FAIL
PASS mau ten 'red' -> check 3 FAIL
PASS alias toi token khong ton tai -> check 3 FAIL
PASS ten trung giua 2 family -> check 3 FAIL
PASS ten co dau cach -> check 3 FAIL
PASS con ten obs- chua doi -> check 4 FAIL
PASS usage TODO -> check 4 FAIL
PASS type style usage rong -> check 4 FAIL
PASS mau bia (khong co trong draft) -> check 5 FAIL
PASS font bia -> check 5 FAIL
PASS meta.source chi code -> check 6 FAIL
PASS meta.source gia tri la -> check 6 FAIL
PASS README it muc ## -> check 7 FAIL
PASS README co muc Chua dong bo -> check 7 FAIL
PASS preview khong co marker -> check 8 FAIL
PASS preview co iframe -> check 8 FAIL
PASS component thieu trong bundle -> check 8 FAIL
PASS cover co img -> check 9 FAIL
PASS cover height 500 -> check 9 FAIL
PASS Cover co README (khong con tran) -> check 1 FAIL
PASS con components/_Example -> check 1 FAIL
PASS link.md, khong co STATUS.md -> check 1 FAIL
PASS index sai v/layout -> check 2 FAIL
PASS asset ghi trong index nhung khong co file -> check 10 FAIL
PASS STATUS APPROVED khong --approved-by -> check 13 FAIL
PASS STATUS thieu muc Changelog -> check 13 FAIL
PASS STATUS Trang thai con placeholder -> check 13 FAIL
PASS token vai tro thieu va khong TBD -> check 14 FAIL
PASS token vai tro TBD bi xoa khoi STATUS -> check 14 FAIL
PASS type style thieu sample -> check 15 FAIL
PASS thieu group Heading -> check 15 FAIL
PASS component thieu va khong TBD -> check 16 FAIL
PASS mau ngoai draft + --figma-used + source figma -> check 5 WARN
PASS per-site 2 site hop le -> PASS
PASS per-site: WEB-02 con usage TODO -> WEB-02.4 FAIL
PASS per-site: WEB-02 dung mau chi thay o WEB-01 -> WEB-02.5 FAIL
PASS tron layout (project/ + WEB-xx/) -> check 0 FAIL
PASS per-site co file thua o root -> check 0 FAIL
PASS per-site nhung draft mode themes -> check 0 FAIL
PASS thu muc site khac dsLayout.sites -> check 0 FAIL
PASS 1 thu muc nhung draft mode per-site -> check 0 FAIL
PASS 1 thu muc + draft FORCED themes (tu dong per-site) -> PASS

46 ca · 46 PASS
BASELINE (khong tiem loi)          exit=0 fails=[]

LOI DA TIEM                        KY VONG  BAT DUOC     KQ
--------------------------------------------------------------------------
xoa duong ke data row              #14      -            SKIP — workbook khong co row trong Screen Error message
data row to fill header            #14      [14]         OK
xoa bang ERROR SCENARIOS           #15      -            SKIP — workbook khong co bang ERROR SCENARIOS o SC-001
ghi bay vao Sample                 #1       [1]          OK
phong to anh vuot khung            #13      [13]         OK
Change ID nhay coc                 #12      [12]         OK
xoa row Screen Index               #5       [5]          OK
tro Message Code ma                #6       [6]          OK
xoa EV o cot R item dau            #16      [16]         OK

7/7 case bat dung check ky vong (2 SKIP)
