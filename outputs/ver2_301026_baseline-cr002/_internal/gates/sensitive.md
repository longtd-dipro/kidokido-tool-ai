# S1 — Sensitive scan

Nguon: `inputs/tokiwagi`, `inputs/db`

**975 file quet · 80 HIGH · 134 LOW/INFO · 1 bo qua**

## HIGH — DUNG doc nguon nay (POLICIES.md §5 muc 1)

Bao user: file nao, loai gi (KHONG kem gia tri). Hoi cach xu ly: go file / dua ban schema-only hoac da lam sach / xac nhan la du lieu gia. Credential that -> huong dan rotate.

| # | Vi tri | Pattern | Mau (da che) | Ghi chu |
|---|---|---|---|---|
| 1 | `tokiwagi/.yarnrc.yml` | credential-config-file | — | chi bao TEN, khong mo file |
| 2 | `tokiwagi/README.md#L13` | password_kv | Pa************Aa | — |
| 3 | `tokiwagi/README.md#L17` | password_kv | Pa************Aa | — |
| 4 | `tokiwagi/README.md#L21` | password_kv | Pa************Aa | — |
| 5 | `tokiwagi/prisma/seeds/users.ts#L6` | password_kv | pa************oS | — |
| 6 | `tokiwagi/prisma/seeds/users.ts#L30` | password_kv | pa************oS | — |
| 7 | `tokiwagi/prisma/seeds/users.ts#L54` | password_kv | pa************oS | — |
| 8 | `tokiwagi/prisma/seeds/users.ts#L26` | hardcoded-credential | su************_1 | key token |
| 9 | `tokiwagi/prisma/seeds/users.ts#L50` | hardcoded-credential | ad***********_1 | key token |
| 10 | `tokiwagi/prisma/seeds/users.ts#L74` | hardcoded-credential | us**********_1 | key token |
| 11 | `tokiwagi/src/components/ForgotPassword/ForgotPasswordSuccess.tsx` | name-keyword-file | — | chi bao TEN, khong mo file |
| 12 | `tokiwagi/src/components/ResetPasswordAdmin/ResetPasswordSuccess.tsx` | name-keyword-file | — | chi bao TEN, khong mo file |
| 13 | `tokiwagi/src/components/Tenant/CreateOrUpdateTenant/index.tsx#L83` | password_kv | pa************rd | — |
| 14 | `tokiwagi/src/components/User/ConfirmInfoUser/index.tsx#L23` | password_kv | pa************rd | — |
| 15 | `tokiwagi/src/constants/errors.ts#L15` | hardcoded-credential | トー**********ます | key INVALID_TOKEN |
| 16 | `tokiwagi/src/constants/errors.ts#L29` | hardcoded-credential | パス******ます | key INVALID_PASSWORD |
| 17 | `tokiwagi/src/constants/route.ts#L9` | hardcoded-credential | /f************rd | key FORGOT_PASSWORD |
| 18 | `tokiwagi/src/constants/route.ts#L40` | hardcoded-credential | /u************rd | key USER_CHANGE_PASSWORD |
| 19 | `tokiwagi/src/constants/route.ts#L58` | hardcoded-credential | /a************rd | key ADMIN_FORGOT_PASSWORD |
| 20 | `tokiwagi/src/constants/settings.ts#L52` | hardcoded-credential | re**********rd | key RESET_PASSWORD |
| 21 | `tokiwagi/src/libs/middleware/checkPOSAuth.ts#L8` | password_kv | ap************s[ | — |
| 22 | `tokiwagi/src/pages/forgot-password.tsx` | name-keyword-file | — | chi bao TEN, khong mo file |
| 23 | `tokiwagi/src/pages/admin/change-password.tsx` | name-keyword-file | — | chi bao TEN, khong mo file |
| 24 | `tokiwagi/src/pages/admin/forgot-password.tsx` | name-keyword-file | — | chi bao TEN, khong mo file |
| 25 | `tokiwagi/src/pages/admin/signin.tsx#L63` | password_kv | pa************rd | — |
| 26 | `tokiwagi/src/pages/admin/signin.tsx#L195` | password_kv | pa************s( | — |
| 27 | `tokiwagi/src/pages/admin/reset-password/[token].tsx` | name-keyword-file | — | chi bao TEN, khong mo file |
| 28 | `tokiwagi/src/pages/admin/unlock-account/[token].tsx` | name-keyword-file | — | chi bao TEN, khong mo file |
| 29 | `tokiwagi/src/pages/api/admin/admin-credentials-confirmation.ts` | name-keyword-file | — | chi bao TEN, khong mo file |
| 30 | `tokiwagi/src/pages/api/admin/credentials-confirmation.ts` | name-keyword-file | — | chi bao TEN, khong mo file |
| 31 | `tokiwagi/src/pages/api/admin/password-confirmation.ts` | name-keyword-file | — | chi bao TEN, khong mo file |
| 32 | `tokiwagi/src/pages/api/admin/staffs/[id].ts#L39` | password_kv | pa************rd | — |
| 33 | `tokiwagi/src/pages/api/admin/staffs/[id].ts#L64` | password_kv | pa************rd | — |
| 34 | `tokiwagi/src/pages/api/auth/change-password.ts` | name-keyword-file | — | chi bao TEN, khong mo file |
| 35 | `tokiwagi/src/pages/api/auth/check-admin-credentials.ts` | name-keyword-file | — | chi bao TEN, khong mo file |
| 36 | `tokiwagi/src/pages/api/auth/fetch-access-token.ts` | name-keyword-file | — | chi bao TEN, khong mo file |
| 37 | `tokiwagi/src/pages/api/auth/forgot-password.ts` | name-keyword-file | — | chi bao TEN, khong mo file |
| 38 | `tokiwagi/src/pages/api/auth/reset-password.ts` | name-keyword-file | — | chi bao TEN, khong mo file |
| 39 | `tokiwagi/src/pages/api/auth/update-password.ts` | name-keyword-file | — | chi bao TEN, khong mo file |
| 40 | `tokiwagi/src/pages/api/auth/verify/[token].ts` | name-keyword-file | — | chi bao TEN, khong mo file |
| 41 | `tokiwagi/src/pages/api/user/notifications/stream.ts#L27` | password_kv | se************et | — |
| 42 | `tokiwagi/src/pages/reset-password/[token].tsx` | name-keyword-file | — | chi bao TEN, khong mo file |
| 43 | `tokiwagi/src/pages/user/my-page/personal-info/change-password.tsx` | name-keyword-file | — | chi bao TEN, khong mo file |
| 44 | `tokiwagi/src/pages/user/my-page/personal-info/update-information/verify-edit-email/[token].tsx` | name-keyword-file | — | chi bao TEN, khong mo file |
| 45 | `tokiwagi/src/pages/user/my-page/personal-info/update-password/[token].tsx` | name-keyword-file | — | chi bao TEN, khong mo file |
| 46 | `tokiwagi/src/pages/verify/[token].tsx` | name-keyword-file | — | chi bao TEN, khong mo file |
| 47 | `tokiwagi/src/services/api-client/auth.service.ts#L7` | hardcoded-credential | /a************rd | key FORGOT_PASSWORD |
| 48 | `tokiwagi/src/services/api-client/auth.service.ts#L8` | hardcoded-credential | /a************rd | key UPDATE_PASSWORD |
| 49 | `tokiwagi/src/services/api-client/auth.service.ts#L9` | hardcoded-credential | /a************rd | key CHANGE_PASSWORD |
| 50 | `tokiwagi/src/services/api-client/auth.service.ts#L10` | hardcoded-credential | /a************rd | key RESET_PASSWORD |
| 51 | `tokiwagi/src/services/api-client/auth.service.ts#L11` | hardcoded-credential | /a************fy | key VERIFY_TOKEN |
| 52 | `tokiwagi/src/services/smaregi/smaregi.service.ts#L75` | password_kv | pa************et | — |
| 53 | `tokiwagi/src/stores/reducers/credentials-confirmation.ts` | name-keyword-file | — | chi bao TEN, khong mo file |
| 54 | `tokiwagi/src/stores/reducers/password-confirmation.ts` | name-keyword-file | — | chi bao TEN, khong mo file |
| 55 | `tokiwagi/src/utils/auth.ts#L30` | password_kv | pa************): | — |
| 56 | `tokiwagi/src/utils/auth.ts#L53` | password_kv | pa************): | — |
| 57 | `tokiwagi/src/utils/auth.ts#L78` | password_kv | pa************rd | — |
| 58 | `db/kido_local_20270730.dump#L1325` | sql-data-rows | — | 0 INSERT, 1 COPY ... FROM stdin (doc mot phan) |
| 59 | `db/kido_local_20270730.dump#L1438` | jwt | ey************V4 | — |
| 60 | `db/kido_local_20270730.dump#L1439` | jwt | ey************Sc | — |
| 61 | `db/kido_local_20270730.dump#L1440` | jwt | ey************W0 | — |
| 62 | `db/kido_local_20270730.dump#L1441` | jwt | ey************gc | — |
| 63 | `db/kido_local_20270730.dump#L1442` | jwt | ey************Fo | — |
| 64 | `db/kido_local_20270730.dump#L1443` | jwt | ey************Lw | — |
| 65 | `db/kido_local_20270730.dump#L1444` | jwt | ey************Z8 | — |
| 66 | `db/kido_local_20270730.dump#L1445` | jwt | ey************fU | — |
| 67 | `db/kido_local_20270730.dump#L1446` | jwt | ey************9g | — |
| 68 | `db/kido_local_20270730.dump#L1447` | jwt | ey************l0 | — |
| 69 | `db/kido_local_20270730.dump#L1448` | jwt | ey************Gw | — |
| 70 | `db/kido_local_20270730.dump#L1449` | jwt | ey************pg | — |
| 71 | `db/kido_local_20270730.dump#L1450` | jwt | ey************04 | — |
| 72 | `db/kido_local_20270730.dump#L1451` | jwt | ey************Mo | — |
| 73 | `db/kido_local_20270730.dump#L1452` | jwt | ey************ig | — |
| 74 | `db/kido_local_20270730.dump#L1453` | jwt | ey************ws | — |
| 75 | `db/kido_local_20270730.dump#L1454` | jwt | ey************Ag | — |
| 76 | `db/kido_local_20270730.dump#L1455` | jwt | ey************aM | — |
| 77 | `db/kido_local_20270730.dump#L1456` | jwt | ey************Sg | — |
| 78 | `db/kido_local_20270730.dump#L1457` | jwt | ey************Xw | — |
| 79 | `db/kido_local_20270730.dump#L1458` | jwt | ey************l4 | — |
| 80 | `db/kido_local_20270730.dump#L1470` | bulk-email | nh***********vn | 32 gia tri khac nhau -> nghi du lieu that |

## LOW / INFO

| Vi tri | Muc | Pattern | Mau (da che) | Ghi chu |
|---|---|---|---|---|
| `tokiwagi/.git/config` | INFO | git-config-present | — | khong doc; co the chua token o remote URL |
| `tokiwagi/yarn.lock#L5651` | LOW | phone_vn | e0*******27 | 13 gia tri (thuong la email tac gia / vi du) |
| `tokiwagi/yarn.lock#L2755` | LOW | phone_jp | f0********39 | 1 gia tri (thuong la email tac gia / vi du) |
| `tokiwagi/yarn.lock#L10488` | LOW | credit_card | e4************83 | 2 gia tri (thuong la email tac gia / vi du) |
| `tokiwagi/prisma/migrations/20220509042826_init_schema/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220531104840_add_token_field_to_users_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220603113718_login_with_line/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220607082728_update_db/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220610031343_add_tenant_day_off_holiday_tables/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220610065212_update_app_settings_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220621074556_update_db_for_new_features/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220621083947_re_add_name_field_for_user_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220623035102_update_scheme_for_booking_and_user_tables/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220624031038_update_ticket_type/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220624081527_add_first_checked_in_field_for_bookings_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220627100918_update_ticket_booking_schedules_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220628032825_update_bookings_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220628091929_allow_null_on_some_fields_in_bookings_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220629032403_add_users_tenants_favorites_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220629073754_update_relation_on_users_tenants_favorites_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220630081252_update_db_for_new_requirement/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220711030637_update_related_ticket_tables/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220711081252_update_fields_for_ticket_and_booking/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220719065259_change_coupon_code_to_json_type/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220720101520_update_booking_schema/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220722090751_update_booking_fields/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220725110859_update_bookings_schema/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220728045434_remove_redundant_fields_on_ticket_detail_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220801041348_update_discount_fields_on_ticket_details_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220802085340_add_codes_for_child_and_adult_on_tickets_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220802085804_refactor_field_names_on_tickets_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220804023400_update_field_names_for_ticket_details_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220810024313_add_privacy_settings_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220815024331_remove_privacy_setting_table_and_consolidate_related_fields/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220815030232_re_add_province_field_for_address_info/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220826102811_update_db_base_on_new_ui/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220905070757_add_max_booking_people_accumulative_field_for_ticket_booking_schedule/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220905080352_move_can_book_in_advance_field_to_ticket_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220912081129_drop_full_name_field_on_tenants_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220912103830_remove_not_null_for_some_fields_on_tenants_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20220916082004_add_deleted_field_to_tenants_table_for_soft_deleted/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20221006104859_add_indexing_for_some_tables/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20221011023946_add_can_booking_from_field_for_ticket_booking_schedule_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20221018101827_add_news_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20221027101847_add_ticket_booking_schedule_id_field_for_booking_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20221031024158_add_invisible_when_reached_max_booking_people_field_for_ticket_booking_schedule_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20221125021634_add_display_order_field_for_ticket_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20221129043840_add_created_at_field_for_user_tenants_favorites_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20221206044824_add_cancelled_at_field_for_bookings_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20221207021013_add_note_field_for_tenant_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20221208024212_add_requested_re_check_in_at_field_for_bookings_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20221208035447_add_deleted_field_for_users_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20221214044921_add_disclaimer_tables/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20221229080008_allow_null_value_for_gender_on_user_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20230103063331_update_db_for_partial_checkout_feature/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20230110022548_add_deleted_field_for_partial_checkouts_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20230117071830_add_re_check_in_count_field_for_booking_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20230119024224_add_gmo_transaction_id_field_for_booking_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20230126150158_add_active_field_to_email_setting_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20230131025947_add_waiting_at_field_for_bookings_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20230206033408_add_deleted_field_on_ticket_booking_schedules_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20230208083210_add_stay_duration_fields_for_bookings_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20230217084930_add_partial_checked_out_at_field_for_bookings_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20230309033641_remove_unique_constraint_on_ticket_booking_schedules_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20230405071732_add_is_promotion_field_for_tickets_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20230711074520_add_gmo_and_security_tables/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20230711075236_fix_typo_field_in_security_answers_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20230721025830_add_unique_constraint_on_gmo_setting_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20230724101624_add_first_checked_out_booking_id_field_to_user_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20230803034522_remove_security_answer_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20230814084906_add_staffs_and_admin_activity_logs_tables/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20230816042314_remove_unique_constraint_on_staff_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20230816043636_add_created_at_and_updated_at_fields_on_staff_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20230905033841_add_index_for_booking_id_field_on_booking_child_age_infos_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20231127043717_add_start_and_end_sale_at_on_ticket_detail_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20231128062959_update_only_save_date_start_end_sale_at_fields/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20240318065913_add_ticket_discount_settings_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20240321135937_add_hourly_extra_time_setting_field_for_ticket_discount_settings_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20240923092014_add_some_fields_for_ticket_booking_schedules_table/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| `tokiwagi/prisma/migrations/20241015105214_add_some_indexes_for_bookings_and_ticket_tables/migration.sql` | INFO | sql-schema-only | — | khong thay INSERT/COPY |
| ... | | | | +54 dong |

## Khong quet / quet mot phan

- `db/kido_local_20270730.dump` — chi quet 2 MB dau

KET QUA: HIGH -> exit 3, DUNG
