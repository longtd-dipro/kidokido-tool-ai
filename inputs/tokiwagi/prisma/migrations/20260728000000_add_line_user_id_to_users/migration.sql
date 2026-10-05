-- Step 1: Add line_user_id column to users
ALTER TABLE "users" ADD COLUMN "line_user_id" TEXT;

-- Step 2: Index for lookup/sync by LINE user id
CREATE INDEX "users_line_user_id_idx" ON "users"("line_user_id");

-- Step 3: Backfill from accounts (provider = 'line') for users who already signed in with LINE
UPDATE "users" u
SET "line_user_id" = a."provider_account_id"
FROM "accounts" a
WHERE a."user_id" = u."id"
  AND a."provider" = 'line'
  AND u."line_user_id" IS NULL;
