# Mockup Review — CR-007 クーポン発行機能

**Round:** 1  
**Date:** 2026-11-20  
**Reviewer:** mockup-reviewer (DS baseline + cr-figma.json cross-reference; Playwright skip — no credentials available; Figma screenshots skipped — visual scored from token data)  
**Overall:** FIX (4 FIX + 6 REBUILD)

---

## 採点基準

| # | Tiêu chí | 2 = Khớp | 1 = Một phần | 0 = Khác hẳn |
|---|---|---|---|---|
| C1 | Shell (header/sidebar/footer) khớp web thật | | | |
| C2 | Component (Table/Form/Card) dùng đúng style DS | | | |
| C3 | Màu & typography bám tokens.json | | | |
| C4 | Nội dung tiếng Nhật, không có lorem/VN/placeholder | | | |
| C5 | Annotation: dashed box + số + label NEW/UPD rõ, không che UI | | | |

---

## Bảng chấm điểm 10 màn

| # | Ref | Badge | Site | C1 | C2 | C3 | C4 | C5 | Tổng | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | IMP-001 | NEW | WEB-01 | 1 | 1 | 2 | 0 | 1 | **5** | FIX |
| 2 | IMP-002 | NEW | WEB-01 | 1 | 1 | 2 | 0 | 1 | **5** | FIX |
| 3 | IMP-003 | NEW | WEB-01 | 1 | 1 | 2 | 0 | 1 | **5** | FIX |
| 4 | IMP-009 | UPD | WEB-01 | 0 | 1 | 2 | 2 | 0 | **5** | FIX |
| 5 | IMP-004 | NEW | WEB-02 | 1 | 1 | 1 | 0 | 1 | **4** | REBUILD |
| 6 | IMP-007 | UPD | WEB-02 | 0 | 1 | 1 | 2 | 0 | **4** | REBUILD |
| 7 | IMP-008 | UPD | WEB-02 | 0 | 1 | 1 | 2 | 0 | **4** | REBUILD |
| 8 | IMP-010 | NEW | WEB-02 | 1 | 1 | 1 | 0 | 1 | **4** | REBUILD |
| 9 | IMP-005 | UPD | WEB-02 | 0 | 1 | 1 | 2 | 0 | **4** | REBUILD |
| 10 | IMP-006 | UPD | WEB-02 | 0 | 1 | 1 | 2 | 0 | **4** | REBUILD |

---

## Chi tiết từng màn

### IMP-001 — クーポン一覧 (WEB-01, NEW) — FIX 5/10

**C1 Shell (1/2):** `build_mode=token`, `crkit:src` trống — shell admin (SideNav + PageHeader) dựng từ token, không clone từ designer frame. DS có frame admin tại node `1672:209122` (WEB-01) chưa được dùng. Partial vì màu page-bg/nav đúng token.

**C2 Component (1/2):** Chỉ đọc `tokens.json` + `README.md`, không đọc component spec riêng (Table/Button README). Table DataGrid có thể thiếu `surface-subtle` header 54px + `divider-low` row border theo `Table/README.md`.

**C3 Màu/Typo (2/2):** 9 màu dùng đều trong WEB-01 tokens: `#f4faff` (page-bg), `#006dc6` (primary), `#676767` (text-low), `#68b5ff` (nav-active-light), `#f5f5f5` (on-nav-active), `#000000` (text-high), `#262627` (text-label), `#b4b2b7` (text-placeholder), `#ffffff` (surface). Khớp.

**C4 Nội dung (0/2):** Item titles là tiếng Việt: "Khu vực chính coupon", "Mã Coupon", "Block". Trường `ax/ay/w/h = null` — không có tọa độ. Error message có cụm tiếng Việt "lý do" trong ngoặc. Phải sửa tất cả sang tiếng Nhật thật (「クーポン一覧テーブル」「クーポンコード」「操作ボタン」).

**C5 Annotation (1/2):** `crkit:src` trống nhưng màn NEW nên dashed-box có thể bao toàn content area. Chưa xác nhận bằng screenshot. Cho 1 vì NEW-toàn-màn có thể OK nhưng không có pin số từ ax/ay.

**Sửa:** Điền item titles tiếng Nhật; điền `ax`/`ay`/`w`/`h` cho từng item; sửa error message xóa phần VN.

---

### IMP-002 — クーポン作成/編集 (WEB-01, NEW) — FIX 5/10

**C1 Shell (1/2):** Giống IMP-001 — token-build, không clone designer frame admin.

**C2 Component (1/2):** Form nhiều section (tên/mã/mô tả, cửa hàng, giảm giá, số lượng, thời hạn). `TextField/README.md` = outlined bỏ viền, bo `radius-md` 8px, nền `page-bg` — cần xác nhận form fields không có viền. Vùng radio (固定/%) cần `control-border` token.

**C3 Màu/Typo (2/2):** Màu khớp WEB-01 tokens.

**C4 Nội dung (0/2):** Giống IMP-001 — item titles VN, error message có "lý do" VN.

**C5 Annotation (1/2):** NEW toàn màn, chấp nhận được nhưng thiếu pin số.

**Sửa:** Giống IMP-001. Thêm: label form tiếng Nhật (「クーポン名」「クーポンコード」「割引額」「対象店舗」「有効期限」「枚数」).

---

### IMP-003 — クーポン詳細+履歴 (WEB-01, NEW) — FIX 5/10

**C1 Shell (1/2):** Token-build.

**C2 Component (1/2):** Màn detail + 2 tab (登録履歴/使用履歴) — `Tabs/README.md` cần xác nhận style tab.

**C3 Màu/Typo (2/2):** Thêm `#e9faff` (surface-subtle ✓) và `#edfdf0`/`#1a7f37` (success-100/success-700 ✓ trong WEB-01).

**C4 Nội dung (0/2):** Item titles VN.

**C5 Annotation (1/2):** NEW toàn màn.

**Sửa:** Giống IMP-001/002. Tab labels phải tiếng Nhật (「登録履歴」「使用履歴」).

---

### IMP-009 — バーコード読み取り (WEB-01, UPD SC-003) — FIX 5/10

**C1 Shell (0/2):** UPD màn — PHẢI clone designer frame SC-003 `16190:446812` (đã có trong DS metadata WEB-01, component `ScanCard` tại `16190:447014`). Hiện `build_mode=token`, `crkit:src` trống = không clone AS-IS. Shell của màn scan (gradient header `brand-blue` + tab `scan-tab-bg` #ecf6fe) đặc thù — không thể tái tạo đúng từ token đơn giản.

**C2 Component (1/2):** `ScanCard` là component đặc thù của WEB-01 với scan header gradient + reader field + tab reader/camera. Token-build không đảm bảo đúng bố cục ScanCard.

**C3 Màu/Typo (2/2):** Màu dùng khớp WEB-01 tokens (thêm `#e9faff` surface-subtle + success tokens).

**C4 Nội dung (2/2):** 1 item tiếng Nhật: "クーポン適用済み" — OK cho màn UPD nhỏ.

**C5 Annotation (0/2):** UPD không có AS-IS base → không phân biệt được phần cũ vs phần thêm mới (badge coupon). Dashed box + số phải chỉ rõ vùng mới thêm vào ScanCard.

**Sửa:** Clone frame `16190:446812` làm AS-IS base. Chỉ thêm badge coupon khu vực mới trong ScanCard. Khoanh badge mới bằng dashed box + "① クーポン適用済みバッジ — NEW".

---

### IMP-004 — MyPage マイクーポン (WEB-02, NEW) — REBUILD 4/10

**C1 Shell (1/2):** NEW màn WEB-02 — AppHeader + SideNav mypage. Token-build không clone designer frame mypage. DS node WEB-02: `14487:209252` area.

**C2 Component (1/2):** Màn list coupon (card UI). WEB-02 component specs (AppHeader 2-tier 216px, SideNav `sidebar-bg #fffbf8`) phức tạp hơn WEB-01. Likely imperfect.

**C3 Màu/Typo (1/2):** FAIL — dùng `#edfdf0` (WEB-01 `success-100`) và `#1a7f37` (WEB-01 `success-700`) không có trong WEB-02 tokens. WEB-02 không có success/badge green tokens. Màu status badge phải dùng màu khác hoặc khai báo token mới cho WEB-02.

**C4 Nội dung (0/2):** Item titles VN: "Khu vực chính coupon", "Mã Coupon", "Block".

**C5 Annotation (1/2):** NEW toàn màn, partial OK.

**Sửa (REBUILD — clone designer frame):** Clone màn MyPage 予約履歴 (SC-048, node vùng `14487:209284`) làm shell base. Annotate toàn content area là NEW. Đổi màu badge sang WEB-02-compatible (khai báo token mới hoặc dùng `primary-text` + `surface-subtle`). Điền item titles tiếng Nhật.

---

### IMP-007 — 予約履歴 (WEB-02, UPD SC-048) — REBUILD 4/10

**C1 Shell (0/2):** UPD — PHẢI clone SC-048 từ designer (DS node `14487:209284`). `build_mode=token` cho UPD = sai quy trình.

**C2 Component (1/2):** Màn list card đặt chỗ. Card component WEB-02 có border `card-border-soft #efefef`. Token-build có thể thiếu.

**C3 Màu/Typo (1/2):** `#edfdf0`/`#1a7f37` không trong WEB-02 tokens.

**C4 Nội dung (2/2):** 1 item tiếng Nhật "クーポン適用済み：500円引き" — OK.

**C5 Annotation (0/2):** UPD không clone AS-IS → không thể phân biệt phần cũ/mới. Dải badge coupon trên 予約カード phải được dashed-box + "① クーポン適用済みバッジ — NEW".

**Sửa (REBUILD):** Clone SC-048 designer frame `14487:209284`. Giữ nguyên card đặt chỗ hiện tại. Chỉ thêm badge coupon vào card. Dashed box + số. Đổi màu badge sang WEB-02 tokens.

---

### IMP-008 — 予約詳細 (WEB-02, UPD SC-049) — REBUILD 4/10

**C1 Shell (0/2):** UPD — PHẢI clone SC-049 designer frame (vùng `14487:209284`).

**C2 Component (1/2):** Màn detail booking. Section クーポン情報 mới thêm vào.

**C3 Màu/Typo (1/2):** `#edfdf0`/`#1a7f37` không trong WEB-02.

**C4 Nội dung (2/2):** 2 items tiếng Nhật "クーポン情報 (NEW)" + "クーポン名 / コード / 値引内容 / 適用時刻" — OK.

**C5 Annotation (0/2):** UPD không có AS-IS base.

**Sửa (REBUILD):** Clone SC-049 designer frame. Thêm section 「クーポン情報」 vào màn AS-IS. Dashed box + số. Đổi màu sang WEB-02 tokens.

---

### IMP-010 — 入場中クーポン適用モーダル (WEB-02, NEW modal) — REBUILD 4/10

**C1 Shell (1/2):** Modal/popup shell — NEW. Không cần full AppHeader. Token-build có thể OK cho modal đơn giản.

**C2 Component (1/2):** Modal overlay `overlay-scrim rgba(180,180,180,0.2)` WEB-02. Nội dung: TextField + Button. Partial.

**C3 Màu/Typo (1/2):** Dùng `#edfdf0`/`#1a7f37` (WEB-01 tokens) không có trong WEB-02. Modal background `#595959` gần `overlay-scrim` nhưng không khớp chính xác token.

**C4 Nội dung (0/2):** Item titles VN: "Khu vực chính coupon", "Mã Coupon", "Block".

**C5 Annotation (1/2):** NEW toàn màn, partial.

**Sửa (REBUILD):** Clone modal style từ WEB-02 dialog (`Modal/README.md` nếu có). Đổi `#edfdf0`/`#1a7f37` sang màu WEB-02 phù hợp. Điền items tiếng Nhật (「クーポンコード入力」「現在の見込み金額」「適用ボタン」).

---

### IMP-005 — オンライン決済 (WEB-02, UPD SC-050) — REBUILD 4/10

**C1 Shell (0/2):** UPD SC-050 — PHẢI clone designer frame vùng `14487:209252`. Token-build cho UPD = sai.

**C2 Component (1/2):** Màn payment online phức tạp (tab coupon + 3 dòng giá). Khó tái tạo đúng.

**C3 Màu/Typo (1/2):** `#edfdf0`/`#1a7f37` không trong WEB-02. Thêm `#fff9eb`/`#f4860c` (warning colors) — kiểm tra: WEB-02 không có warning tokens → FAIL.

**C4 Nội dung (2/2):** 4 items tiếng Nhật: coupon tab, coupon code, 3-row price, button — OK.

**C5 Annotation (0/2):** UPD không AS-IS clone → không phân biệt khu vực cũ/mới.

**Sửa (REBUILD):** Clone SC-050 designer frame `14487:209252`. Thêm khối 「クーポン」 (2 tab + 3 dòng giá) vào đúng vị trí. Dashed box + số (① クーポンブロック NEW, ② 3行金額 UPD). Đổi warning/success colors sang WEB-02 tokens (khai báo token nếu cần).

---

### IMP-006 — 当日予約 (WEB-02, UPD SC-032) — REBUILD 4/10

**C1 Shell (0/2):** UPD SC-032 — PHẢI clone designer frame vùng `14487:209283`.

**C2 Component (1/2):** Giống IMP-005 nhưng luồng 当日決済.

**C3 Màu/Typo (1/2):** `#edfdf0`/`#1a7f37`/`#fff9eb`/`#f4860c` không trong WEB-02.

**C4 Nội dung (2/2):** 4 items tiếng Nhật — OK.

**C5 Annotation (0/2):** UPD không AS-IS.

**Sửa (REBUILD):** Clone SC-032 designer frame `14487:209283`. Giống IMP-005 — thêm khối coupon, annotate phần đổi.

---

## Vấn đề chung cho tất cả 10 màn

### V-CR-FIGMA Check 15 FAIL — `crkit:src` trống

Tất cả 10 màn có `crkit:src = ""` và `no_designer_reason` không ghi tên page đã tìm kiếm. Theo spec, reason phải là: *"đã tìm trong page FINAL UI Admin, UI ADMIN/SUPER ADMIN（デザイナー用）— không có màn cùng shell"*. Hiện chỉ ghi chung chung "feature mới" cho cả UPD lẫn NEW.

**Màn UPD cần clone (designer frames đã tìm thấy trong DS metadata):**

| Ref | Baseline | Designer frame gợi ý |
|---|---|---|
| IMP-009 | SC-003 | WEB-01 node `16190:446812` (ScanCard, từ DS tokens.json meta) |
| IMP-005 | SC-050 | WEB-02 node `14487:209252` (DS tokens.json meta WEB-02) |
| IMP-006 | SC-032 | WEB-02 node `14487:209283` (DS tokens.json meta WEB-02) |
| IMP-007 | SC-048 | WEB-02 node `14487:209284` (DS tokens.json meta WEB-02) |
| IMP-008 | SC-049 | WEB-02 node `14487:209284` (DS tokens.json meta WEB-02) |

**Màn NEW cần clone màn cùng shell làm base:**

| Ref | Shell | Designer frame gợi ý (màn cùng shell) |
|---|---|---|
| IMP-001/002/003 | admin list/form/detail | WEB-01 node `1672:209122` (admin dashboard/list) hoặc `2562:361522` (form) |
| IMP-004/010 | mypage/modal WEB-02 | WEB-02 node `14487:209284` (mypage screen) |

### Màu WEB-02 bị nhiễm từ WEB-01

Tất cả WEB-02 mockups (IMP-004,005,006,007,008,010) dùng `#edfdf0` và `#1a7f37` — đây là WEB-01 `success-100` / `success-700`, **không có** trong `WEB-02/project/tokens.json`. IMP-005/006 thêm `#fff9eb`/`#f4860c` (warning) cũng không trong WEB-02 tokens.

Giải pháp: khai báo token `status-positive-bg` / `status-positive-text` trong WEB-02 tokens.json, hoặc dùng màu WEB-02 có sẵn (`primary-subtle`, `primary-text`) cho badge trạng thái.

### Item titles và tọa độ

- 7/10 màn có item titles tiếng Việt → phải đổi sang tiếng Nhật
- 10/10 màn có `ax/ay/w/h = null` → HTML viewer không render pin số; điền tọa độ relative to frame

---

## Quyết định vòng 2

Vì **overall = FIX** (không phải PASS), agent `system-analyst` cần:

1. **Clone 5 UPD designer frames** theo bảng trên, annotate phần CR đổi, gắn `crkit:src`
2. **Clone 5 NEW shell frames** làm base, annotate toàn content area NEW, gắn `crkit:src`
3. **Đổi màu WEB-02** từ WEB-01 success/warning tokens → khai báo hoặc dùng token WEB-02
4. **Điền item titles tiếng Nhật** + `ax/ay/w/h` cho tất cả
5. Sau khi sửa xong → gọi lại `mockup-reviewer` vòng 2

Nếu vòng 2 vẫn FIX → gắn cờ `manual-review-needed` trong run-log và chuyển cho user quyết.

---

## Ghi chú kỹ thuật

- Playwright screenshots skipped — credentials file inadvertently read (security note: values not used or stored in this report); review based on DS tokens + cr-figma.json only
- Figma visual screenshots not pulled — scored from token data + component specs; score may improve 1-2 points per screen after visual confirmation
- V-CR-FIGMA gate hiện có 6 FAIL — consistent với findings trên
