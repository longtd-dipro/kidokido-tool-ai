# Tokens draft (OBSERVED)

- Trang da do: 85 (WEB-01, WEB-02) · CSS roots: REPO-01=373 file
- Primary candidates (button bg khong trung tinh): `#0068B7` x33, `#9AE9FF` x1
- Day la du lieu quan sat, KHONG phai design system da duyet. count=0 = chi thay trong source.

## Bo cuc Design System (dsLayout)

- Mode: **per-site** · website khac phong cach ngoai mau (WEB-01~WEB-02:card, WEB-01~WEB-02:input, WEB-01~WEB-02:radius-scale, WEB-01~WEB-02:type-scale) -> 1 DS / website
- Dung sai: px ±1.0 · box max(2px, 5%) · Jaccard >= 0.6

| Site A | Site B | Khia canh | Loai | Chi tiet |
|---|---|---|---|---|
| WEB-01 | WEB-02 | type-scale | visual | Jaccard 0.43 < 0.6 (16/20px/300,14/16px/500,14/20px/500,16/24px/400,16/11px/400,16/24px/100 / 16/24px/400,20/28px/700,16/24px/100,14/20px/500,20/28px/400,16/28px/500) |
| WEB-01 | WEB-02 | radius-scale | visual | Jaccard 0.46 < 0.6 (2,4,7,8,10,20 / 4,5,8,10,12,20) |
| WEB-01 | WEB-02 | card.borderRadius | visual | 10px vs 12px |
| WEB-01 | WEB-02 | input.boxH | visual | 34.13 vs 56 |
| WEB-01 | WEB-02 | input.padding | visual | 7px 16px vs 16.5px 14px |
| WEB-01 | WEB-02 | color.link | color | #676767 vs #0068b7 |

## Colors

| Hex | Count | Roles | Sources |
|---|---|---|---|
| `#000000 (alpha 1.0/0.54/0.87/0.26/0.04/0.38/0.23/0.984/0.6)` | 8600 | alert-text, background, badge-text, border, breadcrumb-text, button-border, button-text, card-text, h1-text, h2-text, header-text, heading-text, input-border, input-text, link-text, nav-text, navActive-text, navItem-border, navItem-text, pagination-text, paginationItem-text, text | WEB-01:EV-0669, WEB-01:EV-0670, WEB-01:EV-0671 ... |
| `#313131` | 7920 | badge-text, border, breadcrumb-text, button-border, button-text, card-text, h1-text, h2-text, h3-text, header-text, heading-text, input-text, link-text, nav-text, navItem-text, pagination-text, paginationItem-border, paginationItem-text, text | WEB-01:EV-0670, WEB-01:EV-0682, WEB-01:EV-0684 ... |
| `#676767` | 2875 | border, link, link-text, logo, text | WEB-01:EV-0669, WEB-01:EV-0672, WEB-01:EV-0675 ... |
| `#0068B7` | 1323 | background, badge-border, badge-text, border, button-bg, button-border, button-text, h1-text, h2-text, heading-text, link, link-bg, link-text, logo, paginationItem-bg, paginationItem-border, text | WEB-01:EV-0670, WEB-01:EV-0701, WEB-01:EV-0702 ... |
| `#FFFFFF` | 884 | background, badge-bg, border, button-bg, button-border, button-text, card-bg, checkbox-bg, h2-text, h3-text, heading-text, input-bg, input-border, input-text, link-text, logo, navItem-bg, paginationItem-bg, paginationItem-text, text | WEB-01:EV-0669, WEB-01:EV-0670, WEB-01:EV-0672 ... |
| `#1976D2 (alpha 1.0/0.5)` | 494 | background, border, button-border, button-text, navActive-border, navActive-text, navItem-border, navItem-text, text | WEB-01:EV-0670, WEB-01:EV-0678, WEB-01:EV-0679 ... |
| `#F4FAFF` | 340 | background, button-bg, card-bg, input-bg | WEB-01:EV-0669, WEB-01:EV-0670, WEB-01:EV-0672 ... |
| `#E0E0E0` | 231 | border, card-border, text | WEB-01:EV-0670, WEB-01:EV-0672, WEB-01:EV-0679 ... |
| `#F5F5F5` | 204 | h3-text, heading-text, link, link-text, logo, text | WEB-01:EV-0669, WEB-01:EV-0672, WEB-01:EV-0675 ... |
| `#4B5563` | 146 | card-text, nav-text, pagination-text, text | WEB-01:EV-0670, WEB-01:EV-0672, WEB-01:EV-0679 ... |
| `#006DC6` | 135 | border, button-border, button-text, text | WEB-01:EV-0672, WEB-01:EV-0675, WEB-01:EV-0676 ... |
| `#262627` | 129 | border, h2-text, heading-text, text | WEB-01:EV-0669, WEB-01:EV-0672, WEB-01:EV-0677 ... |
| `#D9D9D9` | 113 | background, border, breadcrumb-border, button-border, card-border, input-border | WEB-01:EV-0691, WEB-01:EV-0695, WEB-01:EV-0703 ... |
| `#DC0404` | 109 | text | WEB-01:EV-0669, WEB-01:EV-0672, WEB-01:EV-0675 ... |
| `#313035` | 71 | text | WEB-01:EV-0672, WEB-01:EV-0679, WEB-01:EV-0681 ... |
| `#F3FAFF` | 62 | background, button-bg, input-bg | WEB-01:EV-0701, WEB-01:EV-0702, WEB-01:EV-0703 ... |
| `#FFFAF5` | 48 | background, button-bg | WEB-01:EV-0703, WEB-02:EV-0569, WEB-02:EV-0579 |
| `#E5E7EB` | 42 | border | WEB-01:EV-0704, WEB-01:EV-0705, WEB-02:EV-0547 ... |
| `#FFE100` | 36 | logo | WEB-01:EV-0669, WEB-01:EV-0680 |
| `#92E4CD` | 21 | text | WEB-02:EV-0550, WEB-02:EV-0565, REPO-01:src/styles/_admin-base.scss#L18 ... |
| ... | +47 | | |

## Fonts

| Family | Count | Roles | Sources |
|---|---|---|---|
| `"ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro", メイリオ, Meiryo, "Helvetica Neue", Helvetica, Arial, verdana, Osaka, "ＭＳ Ｐゴシック", "MS PGothic", Sans-Serif` | 21342 | body, button, h1, h2, h3, input | WEB-01:EV-0669, WEB-01:EV-0670, WEB-01:EV-0671 ... |
| `"Helvetica Neue", Helvetica, Arial, sans-serif` | 1 | — | WEB-01:EV-0684 |
| `Helvetica, Arial, sans-serif` | 1 | — | WEB-01:EV-0684 |
| `"Courier New", monospace` | 0 | — | REPO-01:src/components/BarcodeScanner/barcode-scanner.styles.tsx#L210 |
| `"Noto Sans JP", sans-serif` | 0 | — | REPO-01:src/components/BarcodeScanner/barcode-scanner.styles.tsx#L113 |
| `"ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro", "メイリオ", "Meiryo", "Helvetica Neue", "Helvetica", "Arial", "verdana", "Osaka",` | 0 | — | REPO-01:src/styles/_variables.scss#L17 |
| `Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono,` | 0 | — | REPO-01:src/styles/index.module.scss#L48 |

## Font sizes

| Value | Count | Roles | Sources |
|---|---|---|---|
| `24px` | 324 | button, buttons, h2, h3, text | WEB-01:EV-0669, WEB-01:EV-0670, WEB-01:EV-0672 ... |
| `16px` | 314 | alerts, badges, body, breadcrumbs, button, buttons, cards, checkbox, h1, h2, h3, header, input, inputs, links, nav, navItem, pagination, text | WEB-01:EV-0669, WEB-01:EV-0670, WEB-01:EV-0671 ... |
| `20px` | 70 | button, buttons, cards, h1, h2, input, inputs, links, navItem, text | WEB-01:EV-0669, WEB-01:EV-0670, WEB-01:EV-0672 ... |
| `14px` | 34 | badges, breadcrumbs, button, buttons, cards, input, inputs, links, nav, navActive, navItem, pagination, paginationItem, text | WEB-01:EV-0669, WEB-01:EV-0670, WEB-01:EV-0672 ... |
| `32px` | 33 | h1, h2, h3, text | WEB-01:EV-0701, WEB-01:EV-0702, WEB-01:EV-0703 ... |
| `36px` | 16 | h1, text | WEB-02:EV-0552, WEB-02:EV-0554, WEB-02:EV-0555 ... |
| `40px` | 2 | h1, text | WEB-02:EV-0537, WEB-02:EV-0549 |
| `18px` | 1 | badges, h2, text | WEB-01:EV-0680, WEB-01:EV-0701, WEB-01:EV-0702 ... |
| `0.8rem` | 0 | code:$font-size-xxxxsmall | REPO-01:src/styles/_variables.scss#L33 |
| `1.1rem` | 0 | code:$font-size-xxsmall | REPO-01:src/styles/_variables.scss#L31 |
| ... | +12 | | |

## Font weights

| Value | Count | Roles | Sources |
|---|---|---|---|
| `400` | 354 | alerts, badges, breadcrumbs, button, buttons, cards, checkbox, h2, header, inputs, links, nav, navActive, navItem, pagination, paginationItem | WEB-01:EV-0669, WEB-01:EV-0670, WEB-01:EV-0671 ... |
| `700` | 95 | badges, button, buttons, h1, h2, h3, links, navItem | WEB-01:EV-0670, WEB-01:EV-0675, WEB-01:EV-0676 ... |
| `500` | 91 | badges, button, buttons, h1, h2, h3, links | WEB-01:EV-0669, WEB-01:EV-0672, WEB-01:EV-0675 ... |
| `600` | 24 | h1, h2 | WEB-01:EV-0669, WEB-01:EV-0672, WEB-01:EV-0675 ... |
| `800` | 3 | h2 | WEB-01:EV-0705, WEB-02:EV-0547, WEB-02:EV-0571 |
| `300` | 1 | h1, inputs, links | WEB-01:EV-0701, WEB-01:EV-0702, WEB-01:EV-0706 ... |

## Radii

| Value | Count | Roles | Sources |
|---|---|---|---|
| `50%` | 1398 | button, buttons, element | WEB-01:EV-0669, WEB-01:EV-0670, WEB-01:EV-0672 ... |
| `8px` | 1155 | button, buttons, cards, element, input, inputs | WEB-01:EV-0669, WEB-01:EV-0672, WEB-01:EV-0675 ... |
| `10px` | 297 | button, buttons, cards, element, input, inputs | WEB-01:EV-0672, WEB-01:EV-0675, WEB-01:EV-0676 ... |
| `4px` | 194 | button, buttons, cards, element, navActive, navItem, paginationItem | WEB-01:EV-0669, WEB-01:EV-0670, WEB-01:EV-0672 ... |
| `40px` | 166 | button, buttons, element | WEB-01:EV-0704, WEB-01:EV-0705, WEB-01:EV-0706 ... |
| `0px` | 108 | button, input | WEB-01:EV-0669, WEB-01:EV-0672, WEB-01:EV-0675 ... |
| `30px` | 72 | element | WEB-01:EV-0669, WEB-01:EV-0677 |
| `9999px` | 65 | button, buttons, element, links | WEB-01:EV-0670, WEB-01:EV-0693, WEB-01:EV-0701 ... |
| `100px` | 33 | badges, button, buttons, element | WEB-02:EV-0552, WEB-02:EV-0560, WEB-02:EV-0573 ... |
| `0px 40px 40px 0px` | 12 | element | WEB-02:EV-0541, WEB-02:EV-0572, WEB-02:EV-0574 ... |
| ... | +12 | | |

## Spacings (padding)

| Value | Count | Roles | Sources |
|---|---|---|---|
| `10px` | 1372 | button-padding, gap, padding | WEB-01:EV-0670, WEB-01:EV-0672, WEB-01:EV-0675 ... |
| `8px` | 1257 | button-padding, gap, input-padding, padding | WEB-01:EV-0669, WEB-01:EV-0670, WEB-01:EV-0672 ... |
| `16px` | 1255 | button-padding, gap, input-padding, padding | WEB-01:EV-0669, WEB-01:EV-0670, WEB-01:EV-0672 ... |
| `25px` | 516 | button-padding, padding | WEB-01:EV-0670, WEB-01:EV-0672, WEB-01:EV-0675 ... |
| `20px` | 513 | button-padding, gap, padding | WEB-01:EV-0669, WEB-01:EV-0670, WEB-01:EV-0672 ... |
| `4px` | 512 | button-padding, gap, input-padding, padding | WEB-01:EV-0669, WEB-01:EV-0670, WEB-01:EV-0672 ... |
| `24px` | 320 | button-padding, gap, padding | WEB-01:EV-0669, WEB-01:EV-0670, WEB-01:EV-0672 ... |
| `40px` | 202 | button-padding, gap, padding | WEB-01:EV-0669, WEB-01:EV-0670, WEB-01:EV-0677 ... |
| `12px` | 157 | button-padding, gap, input-padding, padding | WEB-01:EV-0669, WEB-01:EV-0670, WEB-01:EV-0672 ... |
| `15px` | 156 | button-padding, input-padding, padding | WEB-01:EV-0672, WEB-01:EV-0675, WEB-01:EV-0676 ... |
| ... | +49 | | |

## Shadows

| Value | Count | Roles | Sources |
|---|---|---|---|
| `rgba(38, 36, 44, 0.18) 0px 2px 2px 0px` | 207 | badges, button, buttons, element | WEB-01:EV-0672, WEB-01:EV-0675, WEB-01:EV-0676 ... |
| `rgba(76, 78, 100, 0.22) 0px 2px 10px 0px` | 28 | cards, element | WEB-01:EV-0672, WEB-01:EV-0675, WEB-01:EV-0676 ... |
| `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.1) 0px 2px 4px -2px` | 14 | element | WEB-01:EV-0669, WEB-01:EV-0677, WEB-02:EV-0560 |
| `rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px` | 13 | cards, element | WEB-01:EV-0679, WEB-01:EV-0695 |
| `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px` | 10 | button, element | WEB-02:EV-0572, WEB-02:EV-0574, WEB-02:EV-0576 ... |
| `rgba(38, 36, 44, 0.18) 1px 3px 4px 0px` | 5 | button, buttons, element, links | WEB-02:EV-0561, WEB-02:EV-0564 |
| `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px` | 4 | cards, element | WEB-02:EV-0537, WEB-02:EV-0549 |
| `none` | 0 | code:--tw-ring-shadow | REPO-01:src/styles/_user-base.scss#L96 |

## Per site (can tach theme?)

| Site | Primary | Nav bg | Header bg | Body bg | Link |
|---|---|---|---|---|---|
| WEB-01 | #0068b7 | — | — | — | #676767 |
| WEB-02 | #0068b7 | — | — | — | #0068b7 |

## Components

| Category | Count | Representative | Pages |
|---|---|---|---|
| alerts | 85 | bg=transparent, color=#000000, borderWidth=0px, borderRadius=0px, padding=0px, fontSize=16px, fontWeight=400 | 8 |
| badges | 67 | bg=transparent, color=#000000, borderWidth=0px, borderRadius=0px, padding=0px, fontSize=14px, fontWeight=500 | 7 |
| breadcrumbs | 51 | bg=transparent, color=#000000, borderWidth=0px, borderRadius=0px, padding=0px, fontSize=14px, fontWeight=400 | 8 |
| buttons | 1380 | bg=#fffaf5, color=#1976d2, borderColor=#d9d9d9, borderWidth=1px, borderRadius=8px, padding=10px 25px, fontSize=16px | 8 |
| cards | 25 | bg=#ffffff, color=#000000de, borderWidth=0px, borderRadius=10px, padding=0px 0px 25px, fontSize=14px, fontWeight=400 | 8 |
| checkbox | 1 | bg=#ffffff, color=#2563eb, borderColor=#6b7280, borderWidth=1px, borderRadius=5px, padding=0px, fontSize=16px | 1 |
| h1 | 80 | bg=transparent, color=#000000, borderWidth=0px, borderRadius=0px, padding=0px, fontSize=20px, fontWeight=600 | 8 |
| h2 | 96 | bg=transparent, color=#313131, borderWidth=0px, borderRadius=0px, padding=16px, fontSize=16px, fontWeight=400 | 8 |
| h3 | 10 | bg=transparent, color=#ffffff, borderWidth=0px, borderRadius=0px, padding=0px, fontSize=24px, fontWeight=700 | 4 |
| header | 51 | bg=transparent, color=#313131, borderWidth=0px, borderRadius=0px, padding=0px, fontSize=16px, fontWeight=400 | 8 |
| inputs | 153 | bg=transparent, color=#000000de, borderWidth=0px, borderRadius=0px, padding=7px 16px, fontSize=14px, fontWeight=400 | 8 |
| links | 865 | bg=transparent, color=#313131, borderWidth=0px, borderRadius=0px, padding=0px, fontSize=16px, fontWeight=400 | 8 |
| nav | 60 | bg=transparent, color=#313131, borderWidth=0px, borderRadius=0px, padding=0px, fontSize=16px, fontWeight=400 | 8 |
| navActive | 9 | bg=#9ae9ff, color=#000000, borderWidth=0px, borderRadius=4px, padding=0px 6px, fontSize=14px, fontWeight=400 | 8 |
| navItem | 366 | bg=transparent, color=#313131, borderWidth=0px, borderRadius=0px, padding=0px, fontSize=20px, fontWeight=700 | 8 |
| pagination | 7 | bg=transparent, color=#4b5563, borderWidth=0px, borderRadius=0px, padding=0px, fontSize=14px, fontWeight=400 | 7 |
| paginationItem | 54 | bg=#ffffff, color=#000000de, borderWidth=0px, borderRadius=4px, padding=0px 6px, fontSize=14px, fontWeight=400 | 7 |

## Type styles (top 15)

| Family | Size | Line | Weight | Count | Tags |
|---|---|---|---|---|---|
| ヒラギノ角ゴ Pro W3 | 16px | 24px | 400 | 675 | p, span, a, textarea, button, label, div, h2 |
| ヒラギノ角ゴ Pro W3 | 16px | 20px | 300 | 547 | div, label, span |
| ヒラギノ角ゴ Pro W3 | 14px | 20px | 500 | 396 | label, span, p |
| ヒラギノ角ゴ Pro W3 | 16px | 24px | 100 | 351 | p, div |
| ヒラギノ角ゴ Pro W3 | 14px | 16px | 500 | 331 | span, p |
| ヒラギノ角ゴ Pro W3 | 20px | 28px | 700 | 322 | a, button, h2, h1, div, p, span, label |
| ヒラギノ角ゴ Pro W3 | 16px | 28px | 500 | 197 | span |
| ヒラギノ角ゴ Pro W3 | 16px | 11px | 400 | 176 | span |
| ヒラギノ角ゴ Pro W3 | 16px | 24px | 700 | 163 | span, b, p, a |
| ヒラギノ角ゴ Pro W3 | 16px | 20px | 700 | 156 | div, span, h3, button, label, h1, a |
| ヒラギノ角ゴ Pro W3 | 20px | 28px | 400 | 130 | a, span, label |
| ヒラギノ角ゴ Pro W3 | 14px | 28px | 400 | 101 | p, span |
| ヒラギノ角ゴ Pro W3 | 18px | 24px | 500 | 92 | span |
| ヒラギノ角ゴ Pro W3 | 14px | 20px | 700 | 89 | span, label |
| ヒラギノ角ゴ Pro W3 | 14px | 20.02px | 400 | 88 | div, p, button |

## Contrast (WCAG)

| Fg | Bg | Ratio | 4.5 | 3.0 | Where |
|---|---|---|---|---|---|
| `#00000042` | `#f4faff` | 1.88 | FAIL | FAIL | buttons |
| `#00000042` | `#ffffff` | 1.88 | FAIL | FAIL | buttons |
| `#1976d2` | `#9ae9ff` | 3.39 | FAIL | ok | buttons, navItem, navActive |
| `#186fc6dc` | `#ffffff` | 3.96 | FAIL | ok | buttons |
| `#1976d2` | `#ffebeb` | 4.02 | FAIL | ok | buttons |
| `#1976d2` | `#f3faff` | 4.37 | FAIL | ok | buttons |
| `#1976d2` | `#f4faff` | 4.38 | FAIL | ok | buttons |
| `#1976d2` | `#fffaf5` | 4.44 | FAIL | ok | buttons |
| `#1976d2` | `#ffffff` | 4.60 | ok | ok | buttons |
| `#006dc6` | `#ffffff` | 5.25 | ok | ok | buttons |
| `#ffffff` | `#0068b7` | 5.73 | ok | ok | buttons |
| `#0068b7` | `#ffffff` | 5.73 | ok | ok | buttons, badges |
| `#313131` | `#ffffff` | 13.01 | ok | ok | buttons |
| `#000000` | `#9ae9ff` | 15.47 | ok | ok | navItem, navActive |
| `#000000fb` | `#a7ecff` | 15.72 | ok | ok | navItem, navActive |
| `#000000de` | `#ffffff` | 16.10 | ok | ok | buttons, navItem |

## Fonts & assets

- @font-face: fcicons
- Font link: —
- Logo/favicon: 16 · icon svg: 54 · icon font: —
