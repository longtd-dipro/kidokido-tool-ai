-- DataMigration: backfill email prefix for users already soft-deleted before KIDOKIDO-2119,
-- to match the "deleted_<id>_<email>" format applied by utils/server/user.ts#deleteUser
UPDATE "users"
SET "email" = 'deleted_' || "id" || '_' || "email"
WHERE "deleted" = true
  AND "email" IS NOT NULL
  AND "email" NOT LIKE 'deleted\_%' ESCAPE '\';
