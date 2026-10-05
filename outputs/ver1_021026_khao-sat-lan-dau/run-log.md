# Run log — ver1_021026_khao-sat-lan-dau

version_type: BASELINE
baseline: —
run_mode: FULL

## Điều kiện chạy
| Hạng mục | Giá trị |
|---|---|
| Website | WEB-01 Admin `/admin` · WEB-02 User site `/` — cùng domain CloudFront, môi trường **dev**, có HTTP Basic Auth |
| Tài khoản | WEB-01: Super Admin, Admin Tenant (= Admin Smageri V2), Admin POSS, Admin Smageri V1 · WEB-02: User — tài khoản TEST |
| Điều kiện TEST (POLICIES §3.2) | T1 = dev (P1) · T2 = P2b `[A]` · T3 = P11 `[A]` · người duyệt: **PM dự án** (user khai 02/10/2026). Đăng nhập bằng script (`login-site.js --form` + loader), credential chỉ qua biến môi trường, không ghi ra file nào trong `outputs/` |
| Quyền thao tác | P3 = SUBMIT_STAGING. WEB-01 crawl lại **READ_ONLY** (xem Không chạy / bị chặn). Crawler không bấm nút, không submit form |
| Vùng cấm | Không có (mặc định: xoá / thanh toán / gửi mail qua G9 — không phát sinh) |
| Source | REPO-01 `inputs/tokiwagi` — Next.js fullstack + Prisma (FE → WEB-01, WEB-02) |
| Database | MIGRATION — `prisma/schema.prisma` (dump `inputs/db/kido_local_20270730.dump` có dữ liệu → không đọc) |
| Figma | input: — · output: file TOKIWAGI-PJ, page node 16779-398 (https://www.figma.com/design/jjyE9GhFfRZ5VDZU8HFIPv/TOKIWAGI-PJ?node-id=16779-398) |
| Budget crawl | WEB-01: **269/200 URL — VƯỢT** (142 URL lần 1 bị đăng xuất + 127 URL crawl lại) · WEB-02: 90/200 URL · mỗi lần < 2 phút |

## Discovery Brief
| # | Hạng mục | Giá trị | Nguồn |
|---|---|---|---|
| P0 | Phạm vi | KidoKido · toàn hệ thống · slug khao-sat-lan-dau | user |
| P1 | Website | WEB-01 Admin, WEB-02 User (dev) | user |
| P2 | Tài khoản | 5 role admin + User — TEST, được phép quét | user |
| P3 | Quyền thao tác | SUBMIT_STAGING | user |
| P4 | Vùng cấm | Không | user |
| P5 | Source | REPO-01 inputs/tokiwagi (fullstack) | user |
| P6 | Database | DUMP → chuyển MIGRATION (dump có dữ liệu) | user |
| P7 / P7b | Figma input · Publish DS | — · Có (private) | user |
| P8 | Figma output | TOKIWAGI-PJ node 16779-398 (user xác nhận đúng file) | user |
| P9 | Bug list | Có — nội bộ trước | user |
| P10 | Ngôn ngữ · người đọc | VN · Nội bộ | user |
| P11 | Dữ liệu nguồn | Dev, chỉ dữ liệu test | user |

## Kết quả gate (số chép từ script)
| Gate | Kết quả |
|---|---|
| S1 Sensitive | exit 3 — 80 HIGH → user phân loại (xem `_internal/gates/sensitive.md`) |
| V1 Evidence | 11 checks · 10 PASS · 0 FAIL · 1 WARN (EV mồ côi) |
| V2 Inventory | 30 checks · 30 PASS · 0 FAIL · 0 WARN · 226/226 route |
| V-API | 13 checks · 13 PASS · 0 FAIL · 0 WARN |
| V-DB | 9 checks · 9 PASS · 0 FAIL · 0 WARN |
| V-BD WEB-01 / WEB-02 | 16 checks · 15 PASS · 0 FAIL · 1 WARN (mỗi file — màn NO IMAGE đã khai) |
| V-DS | 35 checks · 33 PASS · 0 FAIL · 2 WARN (shadow-popout lấy từ CSS source) |
| V8 | 15 checks · 15 PASS · 0 FAIL · 0 WARN |
| V5 | 9 checks · 9 PASS · 0 FAIL · 0 WARN |
| V3 | 14 checks · 14 PASS · 0 FAIL · 0 WARN |
| O5 recheck (script trong Figma) | Output 1: ngoài frame 0 · overlap 0/117 · F 98/98 THIẾU [] · Output 2: ngoài frame 0 · overlap 0/159 · node rỗng 0/151 · màn 93/93 |
| V9 self-test | selftest-gates 45/45 · selftest-docs 23/23 · selftest-design-system 46/46 · selftest-basic-design 7/7 (2 SKIP) · selftest-detect-pii 17/17 |
| H06 scan | 189 file đã quét · 0 file có phát hiện |

## Không chạy / bị chặn / lệch quy trình
| Hạng mục | Lý do |
|---|---|
| DB dump | Có `COPY … FROM stdin`, JWT, email → không đọc. O3 từ Prisma. Chờ `inputs/db/schema.sql` schema-only (Q mở) |
| `.yarnrc.yml`, `.git/config`, `.env*` | Không đọc (SECURITY.md §1) |
| Crawl WEB-01 lần 1 (EV-0350…0491) | App gọi `signOut()` khi role mở màn không có quyền (`withAuthentication.tsx#L42-L44`) → phiên bị huỷ. Crawl lại READ_ONLY (chặn POST) → **vượt budget WEB-01**. Screenshot lần 1 giữ lại, không dùng trong ledger |
| Hành vi khi bấm / validation / message lỗi | UNKNOWN — crawler không submit. O1 không có message code, O5 bảng ⑦ ghi "chưa quan sát được" |
| 33 màn `To verify` | Route có tham số / màn không quan sát được → NO IMAGE + Open Question |
| O5 — Combined Detail | Không vẽ (không có màn dùng chung giữa group; Master Map đã thể hiện) — **user chấp nhận** |
| O5 — gate index | Kit chưa có script `v-figma` → README hiện "chưa chạy gate"; recheck bằng script ở `_internal/figma/output*-recheck.md` |
| O4 publish | Lô asset đầu bị bộ phân loại auto mode chặn → user tắt auto mode, publish tiếp đủ |

## Thay đổi kit trong lần chạy (cần đồng bộ sang `dipro-ai-boots/ba-kit/system-to-doc`)
| File | Thay đổi |
|---|---|
| `scripts/login-site.js`, `crawl-site.js` | `--http-user-env/--http-pass-env` (Basic Auth từ env) · crawl: `--seed-file`, `--headed` |
| `scripts/verify-inventory.py` check 16 | URL đã crawl khớp route có tham số không phải số (`/tenant/:code`) — selftest-gates vẫn 45/45 |
| `POLICIES.md` §2/§3.2 + rules (user tự sửa, PM duyệt) | Credential TEST được dùng khi đủ T1–T3; PRODUCTION cấm tuyệt đối |

## Diff so với ver<N-1>
— (baseline đầu tiên)

## Feedback của user
(để trống — user ghi vào đây; lần chạy sau agent đọc)
