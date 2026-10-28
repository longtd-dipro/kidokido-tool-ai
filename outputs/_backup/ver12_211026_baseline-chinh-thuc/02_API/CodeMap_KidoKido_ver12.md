# Code map — KidoKido

![Code map](CodeMap_KidoKido_ver12.png)

Lien (`-->`) = ghi nhan trong inventory · Dut (`-.->`) = suy ra tu code (fe-api-calls, table-refs), **can kiem chung** truoc khi ghi Confirmed. Node la nhom; so tren canh = so API/job.

```mermaid
flowchart LR
  subgraph L0["Websites"]
    n_site_WEB_01["WEB-01<br/>Admin (管理画面)"]
    n_site_WEB_02["WEB-02<br/>User site (予約・購入サイト)"]
  end
  subgraph L1["FE repos"]
    n_fe_REPO_01["REPO-01 (FULLSTACK)<br/>Next.js (pages router) · R"]
  end
  subgraph L2["API groups"]
    n_grp_A_REPO_01_admin["admin<br/>61 API · REPO-01"]
    n_grp_A_REPO_01_app_settings["app-settings<br/>2 API · REPO-01"]
    n_grp_A_REPO_01_auth["auth<br/>14 API · REPO-01"]
    n_grp_A_REPO_01_bookings["bookings<br/>8 API · REPO-01"]
    n_grp_A_REPO_01_cron_job["cron-job<br/>7 API · REPO-01"]
    n_grp_A_REPO_01_disclaimers["disclaimers<br/>1 API · REPO-01"]
    n_grp_A_REPO_01_error_report["error-report<br/>1 API · REPO-01"]
    n_grp_A_REPO_01_gmo["gmo<br/>1 API · REPO-01"]
    n_grp_A_REPO_01_health["health<br/>1 API · REPO-01"]
    n_grp_A_REPO_01_migration["migration<br/>7 API · REPO-01"]
    n_grp_A_REPO_01_news["news<br/>1 API · REPO-01"]
    n_grp_A_REPO_01_other["other<br/>1 API · REPO-01"]
    n_grp_A_REPO_01_pos["pos<br/>5 API · REPO-01"]
    n_grp_A_REPO_01_smaregi["smaregi<br/>1 API · REPO-01"]
    n_grp_A_REPO_01_status["status<br/>1 API · REPO-01"]
    n_grp_A_REPO_01_tenants["tenants<br/>3 API · REPO-01"]
    n_grp_A_REPO_01_tickets["tickets<br/>2 API · REPO-01"]
    n_grp_A_REPO_01_tickets_supported["tickets-supported<br/>1 API · REPO-01"]
    n_grp_A_REPO_01_upload["upload<br/>1 API · REPO-01"]
    n_grp_A_REPO_01_user["user<br/>24 API · REPO-01"]
  end
  subgraph L3["BE repos"]
    n_be_REPO_01["REPO-01 (FULLSTACK)<br/>Next.js (pages router) · R"]
  end
  subgraph L4["DB tables"]
    n_tbl_accounts["accounts"]
    n_tbl_admin_activity_logs["admin_activity_logs"]
    n_tbl_admins_tenants["admins_tenants"]
    n_tbl_app_settings["app_settings"]
    n_tbl_booking_child_age_infos["booking_child_age_infos"]
    n_tbl_booking_obic_codes["booking_obic_codes"]
    n_tbl_bookings["bookings"]
    n_tbl_disclaimers["disclaimers"]
    n_tbl_email_settings["email_settings"]
    n_tbl_gmo_settings["gmo_settings"]
    n_tbl_news["news"]
    n_tbl_partial_checkouts["partial_checkouts"]
    n_tbl_security_questions["security_questions"]
    n_tbl_smaregi_temporary_transactions["smaregi_temporary_transactions"]
    n_tbl_smaregi_transactions["smaregi_transactions"]
    n_tbl_sse_notifications["sse_notifications"]
    n_tbl_staffs["staffs"]
    n_tbl_tenants["tenants"]
    n_tbl_ticket_booking_schedules["ticket_booking_schedules"]
    n_tbl_ticket_details["ticket_details"]
    n_tbl_ticket_discount_settings["ticket_discount_settings"]
    n_tbl_tickets["tickets"]
    n_tbl_users["users"]
    n_tbl_users_tenants_favorites["users_tenants_favorites"]
    n_tbl__more["+3 more tables<br/>(xem bang chi tiet)"]
  end
  n_site_WEB_01 -->|"1"| n_fe_REPO_01
  n_site_WEB_02 -->|"1"| n_fe_REPO_01
  n_grp_A_REPO_01_admin -->|"61"| n_be_REPO_01
  n_fe_REPO_01 -->|"247 +31?"| n_grp_A_REPO_01_admin
  n_be_REPO_01 -->|"10 +4?"| n_tbl_app_settings
  n_be_REPO_01 -->|"72 +55?"| n_tbl_bookings
  n_be_REPO_01 -->|"60 +21?"| n_tbl_users
  n_be_REPO_01 -->|"60 +16?"| n_tbl_tickets
  n_be_REPO_01 -->|"41 +3?"| n_tbl_ticket_booking_schedules
  n_be_REPO_01 -->|"30 +3?"| n_tbl_email_settings
  n_be_REPO_01 -->|"45 +11?"| n_tbl_tenants
  n_be_REPO_01 -->|"30 +1?"| n_tbl_ticket_details
  n_be_REPO_01 -->|"20 +1?"| n_tbl_ticket_discount_settings
  n_be_REPO_01 -->|"14 +2?"| n_tbl_booking_child_age_infos
  n_be_REPO_01 -->|"11 +1?"| n_tbl_partial_checkouts
  n_be_REPO_01 -->|"8 +4?"| n_tbl_booking_obic_codes
  n_be_REPO_01 -->|"12 +3?"| n_tbl_gmo_settings
  n_be_REPO_01 -->|"7"| n_tbl_sse_notifications
  n_be_REPO_01 -->|"9 +3?"| n_tbl_staffs
  n_be_REPO_01 -->|"5"| n_tbl_admin_activity_logs
  n_be_REPO_01 -->|"6 +1?"| n_tbl_smaregi_temporary_transactions
  n_be_REPO_01 -->|"3"| n_tbl_smaregi_transactions
  n_be_REPO_01 -->|"2 +2?"| n_tbl_disclaimers
  n_be_REPO_01 -->|"3 +3?"| n_tbl_news
  n_be_REPO_01 -->|"4 +1?"| n_tbl_admins_tenants
  n_be_REPO_01 -->|"3"| n_tbl_accounts
  n_grp_A_REPO_01_app_settings -->|"2"| n_be_REPO_01
  n_grp_A_REPO_01_auth -->|"14"| n_be_REPO_01
  n_be_REPO_01 -->|"3 +2?"| n_tbl_security_questions
  n_fe_REPO_01 -->|"19 +10?"| n_grp_A_REPO_01_auth
  n_grp_A_REPO_01_bookings -->|"8"| n_be_REPO_01
  n_fe_REPO_01 -->|"107 +1?"| n_grp_A_REPO_01_bookings
  n_grp_A_REPO_01_cron_job -->|"7"| n_be_REPO_01
  n_grp_A_REPO_01_disclaimers -->|"1"| n_be_REPO_01
  n_fe_REPO_01 -->|"26"| n_grp_A_REPO_01_disclaimers
  n_grp_A_REPO_01_error_report -->|"1"| n_be_REPO_01
  n_grp_A_REPO_01_gmo -->|"1"| n_be_REPO_01
  n_grp_A_REPO_01_health -->|"1"| n_be_REPO_01
  n_grp_A_REPO_01_migration -->|"7"| n_be_REPO_01
  n_grp_A_REPO_01_news -->|"1"| n_be_REPO_01
  n_fe_REPO_01 -->|"1"| n_grp_A_REPO_01_news
  n_grp_A_REPO_01_pos -->|"5"| n_be_REPO_01
  n_grp_A_REPO_01_smaregi -->|"1"| n_be_REPO_01
  n_grp_A_REPO_01_status -->|"1"| n_be_REPO_01
  n_grp_A_REPO_01_tenants -->|"3"| n_be_REPO_01
  n_fe_REPO_01 -->|"29 +1?"| n_grp_A_REPO_01_tenants
  n_grp_A_REPO_01_tickets_supported -->|"1"| n_be_REPO_01
  n_fe_REPO_01 -->|"4"| n_grp_A_REPO_01_tickets_supported
  n_grp_A_REPO_01_tickets -->|"2"| n_be_REPO_01
  n_fe_REPO_01 -->|"53"| n_grp_A_REPO_01_tickets
  n_grp_A_REPO_01_upload -->|"1"| n_be_REPO_01
  n_fe_REPO_01 -->|"4 +1?"| n_grp_A_REPO_01_upload
  n_grp_A_REPO_01_user -->|"24"| n_be_REPO_01
  n_fe_REPO_01 -->|"226 +18?"| n_grp_A_REPO_01_user
  n_be_REPO_01 -->|"3 +3?"| n_tbl_users_tenants_favorites
  n_grp_A_REPO_01_other -->|"1"| n_be_REPO_01
  n_fe_REPO_01 -.->|"1?"| n_grp_A_REPO_01_error_report
  n_be_REPO_01 -->|"2 +2?"| n_tbl__more
```

## Man hinh -> API -> Bang

| Screen ID | Site | Route | API (documented) | API (inferred) | Tables (documented) | Tables (inferred) |
|---|---|---|---|---|---|---|
| SC-001 | WEB-01 | /admin | API-045, API-135, API-136 | — | admins_tenants, bookings, gmo_settings, staffs, tenants, users | — |
| SC-002 | WEB-01 | /admin/app-settings | API-001, API-002 | — | app_settings | — |
| SC-003 | WEB-01 | /admin/barcode-scanner | API-019, API-020, API-045, API-135, API-136 | — | admins_tenants, booking_child_age_infos, booking_obic_codes, bookings, email_settings, gmo_settings, partial_checkouts, smaregi_temporary_transactions, smaregi_transactions, sse_notifications, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-004 | WEB-01 | /admin/booking-management | API-013, API-014, API-017, API-018, API-021, API-045, API-047, API-071, API-072, API-073, API-074, API-075, API-083, API-104, API-106, API-107, API-112, API-113, API-114, API-116, API-117, API-121, API-123, API-135, API-136 | — | admin_activity_logs, admins_tenants, app_settings, booking_child_age_infos, bookings, disclaimer_options, disclaimers, email_settings, gmo_settings, partial_checkouts, smaregi_temporary_transactions, sse_notifications, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-005 | WEB-01 | /admin/booking-management/details/:id | API-009, API-017, API-045, API-070, API-071, API-074, API-075, API-083, API-104, API-106, API-107, API-112, API-113, API-114, API-116, API-117, API-121, API-123, API-135, API-136 | — | admin_activity_logs, admins_tenants, app_settings, booking_child_age_infos, bookings, disclaimer_options, disclaimers, email_settings, gmo_settings, partial_checkouts, smaregi_temporary_transactions, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-006 | WEB-01 | /admin/booking-management/partial-checkout/:id | API-009, API-017, API-045, API-070, API-071, API-074, API-075, API-083, API-104, API-106, API-107, API-112, API-113, API-114, API-116, API-117, API-118, API-121, API-123, API-135, API-136 | — | admin_activity_logs, admins_tenants, app_settings, booking_child_age_infos, bookings, disclaimer_options, disclaimers, email_settings, gmo_settings, partial_checkouts, smaregi_temporary_transactions, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-007 | WEB-01 | /admin/booking-management/update/:id | API-009, API-015, API-017, API-028, API-045, API-069, API-070, API-071, API-073, API-074, API-075, API-083, API-104, API-106, API-107, API-109, API-112, API-113, API-114, API-116, API-117, API-121, API-123, API-124, API-125, API-126, API-135, API-136 | — | admin_activity_logs, admins_tenants, app_settings, booking_child_age_infos, bookings, disclaimer_options, disclaimers, email_settings, gmo_settings, partial_checkouts, smaregi_temporary_transactions, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-008 | WEB-01 | /admin/booking-queue | API-003, API-004, API-005, API-006, API-007, API-017, API-045, API-071, API-074, API-075, API-083, API-104, API-106, API-107, API-112, API-113, API-114, API-116, API-117, API-121, API-123, API-135, API-136 | — | admin_activity_logs, admins_tenants, app_settings, booking_child_age_infos, bookings, disclaimer_options, disclaimers, email_settings, gmo_settings, partial_checkouts, smaregi_temporary_transactions, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-009 | WEB-01 | /admin/booking-vacancies | API-008, API-022, API-045, API-135, API-136 | — | admins_tenants, bookings, email_settings, gmo_settings, staffs, tenants, ticket_booking_schedules, tickets, users | — |
| SC-010 | WEB-01 | /admin/change-email | API-045, API-062, API-135, API-136 | — | admins_tenants, bookings, gmo_settings, staffs, tenants, users | — |
| SC-011 | WEB-01 | /admin/change-password | API-045, API-135, API-136, API-137 | — | admins_tenants, bookings, gmo_settings, staffs, tenants, users | — |
| SC-012 | WEB-01 | /admin/dashboard | API-017, API-023, API-024, API-025, API-026, API-027, API-045, API-047, API-054, API-071, API-074, API-075, API-083, API-104, API-106, API-107, API-112, API-113, API-114, API-116, API-117, API-121, API-123, API-135, API-136 | — | admin_activity_logs, admins_tenants, app_settings, booking_child_age_infos, bookings, disclaimer_options, disclaimers, email_settings, gmo_settings, partial_checkouts, smaregi_temporary_transactions, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | TotalUserBookingsGroup, user_first_bookings |
| SC-013 | WEB-01 | /admin/disclaimer-management | API-029, API-045, API-135, API-136 | — | admins_tenants, bookings, disclaimer_options, disclaimers, gmo_settings, staffs, tenants, users | — |
| SC-014 | WEB-01 | /admin/email-settings | API-030, API-031, API-045, API-135, API-136 | — | admins_tenants, bookings, email_settings, gmo_settings, staffs, tenants, users | — |
| SC-015 | WEB-01 | /admin/email-settings/edit/:emailKey | API-017, API-030, API-031, API-032, API-033, API-045, API-071, API-074, API-075, API-083, API-104, API-106, API-107, API-112, API-113, API-114, API-116, API-117, API-121, API-123, API-135, API-136 | — | admin_activity_logs, admins_tenants, app_settings, booking_child_age_infos, bookings, disclaimer_options, disclaimers, email_settings, gmo_settings, partial_checkouts, smaregi_temporary_transactions, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-016 | WEB-01 | /admin/forgot-password | API-140 | — | email_settings, users | — |
| SC-017 | WEB-01 | /admin/gmo-settings | API-034, API-035, API-045, API-135, API-136 | — | admins_tenants, bookings, gmo_settings, staffs, tenants, users | — |
| SC-018 | WEB-01 | /admin/gmo-settings/create | API-034, API-035, API-045, API-135, API-136 | — | admins_tenants, bookings, gmo_settings, staffs, tenants, users | — |
| SC-019 | WEB-01 | /admin/gmo-settings/edit/:id | API-034, API-035, API-045, API-135, API-136 | — | admins_tenants, bookings, gmo_settings, staffs, tenants, users | — |
| SC-020 | WEB-01 | /admin/gmo-settings/view/:id | API-034, API-045, API-135, API-136 | — | admins_tenants, bookings, gmo_settings, staffs, tenants, users | — |
| SC-021 | WEB-01 | /admin/news-management | API-036, API-037, API-045, API-135, API-136 | — | admins_tenants, bookings, gmo_settings, news, staffs, tenants, users | — |
| SC-022 | WEB-01 | /admin/news-management/create | API-036, API-037, API-045, API-135, API-136 | — | admins_tenants, bookings, gmo_settings, news, staffs, tenants, users | — |
| SC-023 | WEB-01 | /admin/news-management/edit/:newsId | API-036, API-037, API-045, API-135, API-136 | — | admins_tenants, bookings, gmo_settings, news, staffs, tenants, users | — |
| SC-024 | WEB-01 | /admin/reset-password/:token | API-141 | — | users | — |
| SC-025 | WEB-01 | /admin/revenue-management | API-017, API-039, API-041, API-045, API-047, API-054, API-071, API-074, API-075, API-083, API-104, API-106, API-107, API-112, API-113, API-114, API-116, API-117, API-121, API-123, API-135, API-136 | — | admin_activity_logs, admins_tenants, app_settings, booking_child_age_infos, bookings, disclaimer_options, disclaimers, email_settings, gmo_settings, partial_checkouts, smaregi_temporary_transactions, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-026 | WEB-01 | /admin/scan-management | API-011, API-013, API-014, API-017, API-018, API-045, API-047, API-071, API-073, API-074, API-075, API-083, API-104, API-106, API-107, API-112, API-113, API-114, API-116, API-117, API-121, API-123, API-135, API-136 | — | admin_activity_logs, admins_tenants, app_settings, booking_child_age_infos, bookings, disclaimer_options, disclaimers, email_settings, gmo_settings, partial_checkouts, smaregi_temporary_transactions, sse_notifications, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-027 | WEB-01 | /admin/signin | API-063, API-065, API-138 | — | admins_tenants, email_settings, security_questions, users | — |
| SC-028 | WEB-01 | /admin/staff-management | API-042, API-043, API-044, API-045, API-047, API-134, API-135, API-136 | — | admins_tenants, bookings, gmo_settings, staffs, tenants, users | — |
| SC-029 | WEB-01 | /admin/staff-management/create | API-042, API-044, API-045, API-047, API-135, API-136 | — | admins_tenants, bookings, gmo_settings, staffs, tenants, users | — |
| SC-030 | WEB-01 | /admin/staff-management/edit/:id | API-042, API-044, API-045, API-047, API-135, API-136 | — | admins_tenants, bookings, gmo_settings, staffs, tenants, users | — |
| SC-031 | WEB-01 | /admin/tenant-management | API-045, API-046, API-047, API-067, API-135, API-136 | — | admins_tenants, bookings, gmo_settings, staffs, tenants, users | — |
| SC-032 | WEB-01 | /admin/tenant-management/create | API-035, API-045, API-047, API-108, API-135, API-136 | — | admins_tenants, bookings, gmo_settings, staffs, tenants, users | — |
| SC-033 | WEB-01 | /admin/tenant-management/edit/:tenantCode | API-035, API-045, API-047, API-108, API-135, API-136 | — | admins_tenants, bookings, gmo_settings, staffs, tenants, users | — |
| SC-034 | WEB-01 | /admin/tenant-management/view/:tenantCode | API-045, API-135, API-136 | — | admins_tenants, bookings, gmo_settings, staffs, tenants, users | — |
| SC-035 | WEB-01 | /admin/ticket-management | API-017, API-045, API-047, API-050, API-052, API-054, API-071, API-074, API-075, API-083, API-104, API-106, API-107, API-112, API-113, API-114, API-116, API-117, API-121, API-123, API-135, API-136 | — | admin_activity_logs, admins_tenants, app_settings, booking_child_age_infos, booking_obic_codes, bookings, disclaimer_options, disclaimers, email_settings, gmo_settings, partial_checkouts, smaregi_temporary_transactions, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-036 | WEB-01 | /admin/ticket-management/create | API-017, API-045, API-047, API-048, API-049, API-050, API-053, API-054, API-071, API-074, API-075, API-083, API-104, API-106, API-107, API-108, API-112, API-113, API-114, API-116, API-117, API-121, API-123, API-135, API-136 | — | admin_activity_logs, admins_tenants, app_settings, booking_child_age_infos, booking_obic_codes, bookings, disclaimer_options, disclaimers, email_settings, gmo_settings, partial_checkouts, smaregi_temporary_transactions, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-037 | WEB-01 | /admin/ticket-management/edit/:ticketId | API-017, API-045, API-047, API-048, API-049, API-050, API-053, API-054, API-071, API-074, API-075, API-083, API-104, API-106, API-107, API-108, API-112, API-113, API-114, API-116, API-117, API-121, API-123, API-135, API-136 | — | admin_activity_logs, admins_tenants, app_settings, booking_child_age_infos, booking_obic_codes, bookings, disclaimer_options, disclaimers, email_settings, gmo_settings, partial_checkouts, smaregi_temporary_transactions, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-038 | WEB-01 | /admin/ticket-management/view/:ticketId | API-017, API-045, API-050, API-071, API-074, API-075, API-083, API-104, API-106, API-107, API-112, API-113, API-114, API-116, API-117, API-121, API-123, API-135, API-136 | — | admin_activity_logs, admins_tenants, app_settings, booking_child_age_infos, booking_obic_codes, bookings, disclaimer_options, disclaimers, email_settings, gmo_settings, partial_checkouts, smaregi_temporary_transactions, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-039 | WEB-01 | /admin/unlock-account/:token | API-067 | — | users | — |
| SC-040 | WEB-01 | /admin/user-management | API-017, API-045, API-056, API-057, API-058, API-071, API-074, API-075, API-083, API-104, API-106, API-107, API-112, API-113, API-114, API-116, API-117, API-121, API-123, API-135, API-136 | — | accounts, admin_activity_logs, admins_tenants, app_settings, booking_child_age_infos, bookings, disclaimer_options, disclaimers, email_settings, gmo_settings, partial_checkouts, smaregi_temporary_transactions, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-041 | WEB-01 | /admin/user-management/create | API-045, API-056, API-058, API-135, API-136 | — | accounts, admin_activity_logs, admins_tenants, bookings, email_settings, gmo_settings, staffs, tenants, users | — |
| SC-042 | WEB-01 | /admin/user-management/edit/:userId | API-045, API-056, API-058, API-135, API-136 | — | accounts, admin_activity_logs, admins_tenants, bookings, email_settings, gmo_settings, staffs, tenants, users | — |
| SC-043 | WEB-01 | /admin/user-management/view/:userId | API-045, API-056, API-135, API-136 | — | accounts, admins_tenants, bookings, gmo_settings, staffs, tenants, users | — |
| SC-044 | WEB-01 | /admin/vacancies-status | API-045, API-054, API-075, API-135, API-136 | — | admins_tenants, app_settings, bookings, gmo_settings, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-045 | WEB-01 | /admin/waiting-time-management | API-001, API-045, API-135, API-136 | — | admins_tenants, app_settings, bookings, gmo_settings, staffs, tenants, users | — |
| SC-046 | WEB-02 | / | API-017, API-071, API-074, API-075, API-083, API-094, API-104, API-106, API-107, API-112, API-113, API-114, API-116, API-117, API-121, API-123 | — | admin_activity_logs, app_settings, booking_child_age_infos, bookings, disclaimer_options, disclaimers, email_settings, news, partial_checkouts, smaregi_temporary_transactions, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-047 | WEB-02 | /403 | — | — | — | — |
| SC-048 | WEB-02 | /booking/buy-monthly-ticket | API-017, API-069, API-070, API-071, API-074, API-075, API-083, API-104, API-105, API-106, API-107, API-112, API-113, API-114, API-116, API-117, API-121, API-123, API-124, API-125, API-126 | — | admin_activity_logs, app_settings, booking_child_age_infos, bookings, disclaimer_options, disclaimers, email_settings, gmo_settings, partial_checkouts, smaregi_temporary_transactions, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-049 | WEB-02 | /booking/buy-times-limit-ticket | API-017, API-069, API-070, API-071, API-074, API-075, API-083, API-104, API-105, API-106, API-107, API-112, API-113, API-114, API-116, API-117, API-121, API-123, API-124, API-125, API-126 | — | admin_activity_logs, app_settings, booking_child_age_infos, bookings, disclaimer_options, disclaimers, email_settings, gmo_settings, partial_checkouts, smaregi_temporary_transactions, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-050 | WEB-02 | /booking/payment-online | API-017, API-069, API-070, API-071, API-074, API-075, API-083, API-104, API-106, API-107, API-112, API-113, API-114, API-116, API-117, API-121, API-123, API-124, API-125, API-126 | — | admin_activity_logs, app_settings, booking_child_age_infos, bookings, disclaimer_options, disclaimers, email_settings, gmo_settings, partial_checkouts, smaregi_temporary_transactions, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-051 | WEB-02 | /booking/payment-online-failure | — | — | — | — |
| SC-052 | WEB-02 | /booking/payment-online-monthly-ticket-success | — | — | — | — |
| SC-053 | WEB-02 | /booking/payment-online-success | — | — | — | — |
| SC-054 | WEB-02 | /booking/use-in-day | API-017, API-071, API-074, API-075, API-083, API-104, API-106, API-107, API-112, API-113, API-114, API-116, API-117, API-121, API-123 | — | admin_activity_logs, app_settings, booking_child_age_infos, bookings, disclaimer_options, disclaimers, email_settings, partial_checkouts, smaregi_temporary_transactions, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-055 | WEB-02 | /commercial-law | — | — | — | — |
| SC-056 | WEB-02 | /error | — | — | — | — |
| SC-057 | WEB-02 | /forgot-password | API-140 | — | email_settings, users | — |
| SC-058 | WEB-02 | /maintenance | — | — | — | — |
| SC-059 | WEB-02 | /price-list | API-017, API-071, API-074, API-075, API-083, API-104, API-106, API-107, API-112, API-113, API-114, API-116, API-117, API-121, API-123 | — | admin_activity_logs, app_settings, booking_child_age_infos, bookings, disclaimer_options, disclaimers, email_settings, partial_checkouts, smaregi_temporary_transactions, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-060 | WEB-02 | /privacy-policy | — | — | — | — |
| SC-061 | WEB-02 | /reset-password/:token | API-141 | — | users | — |
| SC-062 | WEB-02 | /reset-password/success | — | — | — | — |
| SC-063 | WEB-02 | /signin | API-064 | — | email_settings, users | — |
| SC-064 | WEB-02 | /signup | API-064, API-066, API-122 | — | email_settings, users | — |
| SC-065 | WEB-02 | /signup-success | API-064 | — | email_settings, users | — |
| SC-066 | WEB-02 | /tenant-list | API-075, API-104, API-130, API-132 | — | app_settings, bookings, tenants, ticket_booking_schedules, tickets, users_tenants_favorites | — |
| SC-067 | WEB-02 | /tenant/:code | API-075, API-102, API-107, API-130, API-132 | — | app_settings, bookings, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users_tenants_favorites | — |
| SC-068 | WEB-02 | /terms-of-use | — | — | — | — |
| SC-069 | WEB-02 | /user/my-page | — | — | — | — |
| SC-070 | WEB-02 | /user/my-page/booking-history | API-017, API-070, API-071, API-074, API-075, API-083, API-104, API-106, API-107, API-112, API-113, API-114, API-116, API-117, API-119, API-121, API-123 | — | admin_activity_logs, app_settings, booking_child_age_infos, bookings, disclaimer_options, disclaimers, email_settings, gmo_settings, partial_checkouts, smaregi_temporary_transactions, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-071 | WEB-02 | /user/my-page/booking-history/:id | API-017, API-070, API-071, API-072, API-073, API-074, API-075, API-083, API-104, API-106, API-107, API-109, API-110, API-111, API-112, API-113, API-114, API-116, API-117, API-121, API-123 | — | admin_activity_logs, app_settings, booking_child_age_infos, bookings, disclaimer_options, disclaimers, email_settings, gmo_settings, partial_checkouts, smaregi_temporary_transactions, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-072 | WEB-02 | /user/my-page/booking-history/cancel-success | — | — | — | — |
| SC-073 | WEB-02 | /user/my-page/booking-history/partial-checkout/:id | API-017, API-070, API-071, API-074, API-075, API-083, API-104, API-106, API-107, API-109, API-112, API-113, API-114, API-116, API-117, API-118, API-121, API-123 | — | admin_activity_logs, app_settings, booking_child_age_infos, bookings, disclaimer_options, disclaimers, email_settings, gmo_settings, partial_checkouts, smaregi_temporary_transactions, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-074 | WEB-02 | /user/my-page/booking-history/partial-checkout/success | — | — | — | — |
| SC-075 | WEB-02 | /user/my-page/booking-history/update | — | — | — | — |
| SC-076 | WEB-02 | /user/my-page/booking-history/update/:id | API-017, API-069, API-070, API-071, API-073, API-074, API-075, API-083, API-104, API-106, API-107, API-109, API-112, API-113, API-114, API-116, API-117, API-121, API-123, API-124, API-125, API-126 | — | admin_activity_logs, app_settings, booking_child_age_infos, bookings, disclaimer_options, disclaimers, email_settings, gmo_settings, partial_checkouts, smaregi_temporary_transactions, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-077 | WEB-02 | /user/my-page/booking-history/update/completed | — | — | — | — |
| SC-078 | WEB-02 | /user/my-page/delete-account | API-128 | — | accounts, email_settings, users | — |
| SC-079 | WEB-02 | /user/my-page/favorite-tenants | API-075, API-130, API-131, API-132 | — | app_settings, bookings, tenants, ticket_booking_schedules, tickets, users_tenants_favorites | — |
| SC-080 | WEB-02 | /user/my-page/monthly-ticket-status | API-017, API-068, API-071, API-074, API-075, API-083, API-104, API-105, API-106, API-107, API-112, API-113, API-114, API-115, API-116, API-117, API-121, API-123 | — | admin_activity_logs, app_settings, booking_child_age_infos, bookings, disclaimer_options, disclaimers, email_settings, partial_checkouts, smaregi_temporary_transactions, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-081 | WEB-02 | /user/my-page/personal-info | API-124, API-126, API-128 | — | accounts, email_settings, users | — |
| SC-082 | WEB-02 | /user/my-page/personal-info/change-credit-card | API-125, API-126 | — | email_settings, users | — |
| SC-083 | WEB-02 | /user/my-page/personal-info/change-credit-card/delete | — | — | — | — |
| SC-084 | WEB-02 | /user/my-page/personal-info/change-credit-card/success | — | — | — | — |
| SC-085 | WEB-02 | /user/my-page/personal-info/change-password | API-142 | — | email_settings, users | — |
| SC-086 | WEB-02 | /user/my-page/personal-info/update-information | API-122, API-128 | — | accounts, email_settings, users | — |
| SC-087 | WEB-02 | /user/my-page/personal-info/update-information/success | — | — | — | — |
| SC-088 | WEB-02 | /user/my-page/personal-info/update-information/verify-edit-email/:token | API-127, API-143 | — | email_settings, users | — |
| SC-089 | WEB-02 | /user/my-page/personal-info/update-password/:token | API-141 | — | users | — |
| SC-090 | WEB-02 | /user/my-page/personal-info/update-password/success | — | — | — | — |
| SC-091 | WEB-02 | /user/my-page/times-limit-ticket-status | API-017, API-068, API-071, API-074, API-075, API-083, API-104, API-105, API-106, API-107, API-112, API-113, API-114, API-116, API-117, API-120, API-121, API-123 | — | admin_activity_logs, app_settings, booking_child_age_infos, bookings, disclaimer_options, disclaimers, email_settings, partial_checkouts, smaregi_temporary_transactions, staffs, tenants, ticket_booking_schedules, ticket_details, ticket_discount_settings, tickets, users | — |
| SC-092 | WEB-02 | /vacancy-status | API-075, API-104 | — | app_settings, bookings, tenants, ticket_booking_schedules, tickets | — |
| SC-093 | WEB-02 | /verify/:token | API-127, API-143 | — | email_settings, users | — |
| SC-094 | WEB-02 | (chưa chốt — đề xuất /limited/{khoá}) | — | — | — | — |

Bang an khoi hinh (it ket noi): disclaimer_options, TotalUserBookingsGroup, user_first_bookings
