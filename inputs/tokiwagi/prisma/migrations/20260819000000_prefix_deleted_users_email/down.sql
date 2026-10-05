-- DataMigration rollback: remove the "deleted_<id>_" prefix added by the up migration
UPDATE "users"
SET "email" = regexp_replace("email", '^deleted_' || "id" || '_', '')
WHERE "deleted" = true
  AND "email" IS NOT NULL
  AND "email" ~ ('^deleted_' || "id" || '_');
