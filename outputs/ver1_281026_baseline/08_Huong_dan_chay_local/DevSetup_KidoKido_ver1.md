# Hướng dẫn chạy local và môi trường — KidoKido ver1

> Người đọc: dev mới vào dự án. Máy tự gom từ source (chỉ đọc). Cấu hình chỉ ghi **tên key** — giá trị lấy từ Tech Lead / secret manager, không bao giờ ghi vào file này.

## 1. Repo và công cụ

| Repo | Công cụ / file | Nguồn |
|---|---|---|
| REPO-01 | Node.js — (package.json không ghi engines.node) | REPO-01:package.json |
| REPO-01 | README (đọc phần cài đặt) | REPO-01:README.md |

## 2. Cài đặt và chạy

| Repo | Bước | Lệnh | Nguồn |
|---|---|---|---|
| REPO-01 | Cài | yarn install | REPO-01:package.json |
| REPO-01 | Chạy | `yarn dev` | REPO-01:package.json |
| REPO-01 | Chạy | `yarn build` | REPO-01:package.json |
| REPO-01 | Chạy | `yarn lint` | REPO-01:package.json |
| REPO-01 | Chạy | `yarn lint:css` | REPO-01:package.json |
| REPO-01 | Chạy | `yarn lint:css:fix` | REPO-01:package.json |
| REPO-01 | Chạy | `yarn start` | REPO-01:package.json |
| REPO-01 | Chạy | `yarn prepare` | REPO-01:package.json |
| REPO-01 | Chạy | `yarn test` | REPO-01:package.json |
| REPO-01 | Chạy | `yarn seed` | REPO-01:package.json |
| REPO-01 | Chạy | `yarn db:push` | REPO-01:package.json |
| REPO-01 | Chạy | `yarn db:reset` | REPO-01:package.json |
| REPO-01 | Chạy | `yarn migrate:deploy` | REPO-01:package.json |

## 3. Database local

| Repo | Service | Image · port | Nguồn |
|---|---|---|---|
| REPO-01 | nextjs-app | tokiwagi:${TAG:-latest} · port 3000:3000 | REPO-01:docker/docker-compose.yml |

> Bổ sung tay (28/10/2026): docker-compose chỉ có ứng dụng, **không có service database**. Code dùng PostgreSQL qua Prisma (REPO-01:prisma/schema.prisma, key `DATABASE_URL`) và có lệnh `yarn migrate:deploy` / `yarn seed`. Cách dựng PostgreSQL local (phiên bản, docker hay cài máy) — Cần xác nhận với Tech Lead. Dữ liệu mẫu (seed) có tài khoản dev: hỏi Tech Lead, không chép vào tài liệu.

## 4. Cấu hình (chỉ tên key)

| Repo | Tên key | Nguồn |
|---|---|---|
| REPO-01 | `NODE_ENV` | REPO-01:.env.example |
| REPO-01 | `ENV` | REPO-01:.env.example |
| REPO-01 | `DEBUG` | REPO-01:.env.example |
| REPO-01 | `NEXTAUTH_URL` | REPO-01:.env.example |
| REPO-01 | `NEXTAUTH_SECRET` | REPO-01:.env.example |
| REPO-01 | `DATABASE_URL` | REPO-01:.env.example |
| REPO-01 | `LOG_LEVEL` | REPO-01:.env.example |
| REPO-01 | `LOG_FOLDER_PATH` | REPO-01:.env.example |
| REPO-01 | `EXTERNAL_URL` | REPO-01:.env.example |
| REPO-01 | `EMAIL_SERVICE` | REPO-01:.env.example |
| REPO-01 | `EMAIL_FROM` | REPO-01:.env.example |
| REPO-01 | `EMAIL_USER` | REPO-01:.env.example |
| REPO-01 | `EMAIL_PASSWORD` | REPO-01:.env.example |
| REPO-01 | `LINE_CLIENT_ID` | REPO-01:.env.example |
| REPO-01 | `LINE_CLIENT_SECRET` | REPO-01:.env.example |
| REPO-01 | `GMO_API_URL` | REPO-01:.env.example |
| REPO-01 | `GMO_SHOP_PASS` | REPO-01:.env.example |
| REPO-01 | `GMO_SITE_ID` | REPO-01:.env.example |
| REPO-01 | `GMO_SITE_PASS` | REPO-01:.env.example |
| REPO-01 | `NEXT_PUBLIC_GMO_SHOP_ID` | REPO-01:.env.example |
| REPO-01 | `NEXT_PUBLIC_TOKEN_URL` | REPO-01:.env.example |
| REPO-01 | `POS_API_KEY` | REPO-01:.env.example |
| REPO-01 | `ENABLE_CRON_JOB` | REPO-01:.env.example |
| REPO-01 | `STORAGE_TYPE` | REPO-01:.env.example |
| REPO-01 | `AWS_ACCESS_KEY_ID` | REPO-01:.env.example |
| REPO-01 | `AWS_SECRET_ACCESS_KEY` | REPO-01:.env.example |
| REPO-01 | `AWS_S3_BUCKET` | REPO-01:.env.example |
| REPO-01 | `AWS_S3_COMMON_BUCKET` | REPO-01:.env.example |
| REPO-01 | `AWS_REGION` | REPO-01:.env.example |
| REPO-01 | `AWS_CLOUDWATCH_LOG_GROUP` | REPO-01:.env.example |
| REPO-01 | `ENABLE_CLOUDWATCH_LOG` | REPO-01:.env.example |
| REPO-01 | `NEXT_PUBLIC_ONLINE_BOOKING_ADVANCE_DAYS` | REPO-01:.env.example |
| REPO-01 | `BASIC_AUTH_USER` | REPO-01:.env.example |
| REPO-01 | `BASIC_AUTH_PASS` | REPO-01:.env.example |
| REPO-01 | `SMAREGI_API_BASE_URL` | REPO-01:.env.example |
| REPO-01 | `SMAREGI_ID_BASE_URL` | REPO-01:.env.example |
| REPO-01 | `SMAREGI_CLIENT_ID` | REPO-01:.env.example |
| REPO-01 | `SMAREGI_CLIENT_SECRET` | REPO-01:.env.example |
| REPO-01 | `SMAREGI_SCOPES` | REPO-01:.env.example |

## 5. Môi trường

- Cần xác nhận — không thấy tên môi trường trong file mẫu / pipeline

## 6. Pipeline / deploy

| Repo | File | Tên |
|---|---|---|
| REPO-01 | .github/workflows/ci.yml | Continuous integration |
| REPO-01 | docker/Dockerfile | — |
| REPO-01 | docker/docker-compose.yml | — |
| REPO-01 | jenkins/Jenkinsfile | — |

## 7. Lịch batch

| Batch | Lịch | Xử lý | Nguồn |
|---|---|---|---|
| — | — | Không thấy batch trong source đã khảo sát | — |

> Bổ sung tay (28/10/2026): repo có 7 tác vụ định kỳ dạng đường dẫn API trong thư mục REPO-01:src/pages/api/cron-job/ (daily · process-overdue-calling-booking · process-overdue-no-waiting-booking · reconcile-smaregi-transactions · remind-using-booking · remind-one-day-booking · remind-booking-expired). Chúng chỉ chạy khi key `ENABLE_CRON_JOB` được bật (REPO-01:src/config.ts#L67-L68). **Lịch gọi và bên gọi (cron của server / dịch vụ ngoài) không có trong repo** — Cần xác nhận với Tech Lead.
