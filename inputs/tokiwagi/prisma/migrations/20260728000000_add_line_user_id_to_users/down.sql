-- Step 1: Drop the index
DROP INDEX IF EXISTS "users_line_user_id_idx";

-- Step 2: Drop the line_user_id column
ALTER TABLE "users" DROP COLUMN IF EXISTS "line_user_id";