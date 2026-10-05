# Chạy thử system-to-doc với dữ liệu mẫu

Toàn bộ dữ liệu trong `_sample/` là **giả lập** (ShopDemo) — không có dữ liệu thật.

| Mẫu | Đường dẫn | Dùng cho câu hỏi |
|---|---|---|
| Website tĩnh (danh sách / chi tiết đơn, sidebar, badge, dialog) | `_sample/website/` | P1 — Website |
| Repo FE (React) | `_sample/repos/fe-react` | P5 — Source (FE → WEB-01) |
| Repo BE (Express + Prisma, có cron) | `_sample/repos/be-express` | P5 — Source (BE) |
| Schema DB (MySQL, chỉ cấu trúc) | `_sample/schema.sql` | P6 — Database |
| Yêu cầu thay đổi mẫu | `_sample/CR-001_coupon.md` | Luồng 2 |

## Luồng 1

**Terminal 1** — bật website mẫu (giữ cửa sổ này mở):
```bash
cd ~/Desktop/WORK/AI_AGENTS/system-to-doc-test/_sample/website
python3 -m http.server 8765
```

**Terminal 2** — chạy AI:
```bash
cd ~/Desktop/WORK/AI_AGENTS/system-to-doc-test
claude
/analyze-system
```

Trả lời gợi ý:

| Câu | Trả lời |
|---|---|
| Tên hệ thống · version · phạm vi | `ShopDemo` · `baseline` · Toàn hệ thống |
| Website | 1 website — `http://localhost:8765` (staging, dữ liệu test) |
| Tài khoản | Không có — chỉ màn public |
| Quyền thao tác | Chỉ ĐỌC |
| Source | 2 repo: `_sample/repos/fe-react` (FE → WEB-01), `_sample/repos/be-express` (BE) |
| Database | File schema-only `_sample/schema.sql` |
| Figma | Không (hoặc dán link file Figma của bạn để thử O5) |
| Bug list | Có — nội bộ |
| Dữ liệu nguồn | Staging, dữ liệu test |

Kết quả: `outputs/ver1_<ngày>_baseline/` — mở `README.md` trong đó.

## Luồng 2

```bash
cp _sample/CR-001_coupon.md inputs/cr/
claude
/change-request inputs/cr/CR-001_coupon.md
```
Kết quả: `outputs/ver2_<ngày>_CR-001-…/CR-001_Impact.xlsx` (sheet Summary + Impact).

## Thử lại từ đầu
Xoá các folder trong `outputs/`. Kit nằm ở `.claude/` — khi kit trong repo đổi, copy lại từ `dipro-ai-boots/ba-kit/system-to-doc/`.
