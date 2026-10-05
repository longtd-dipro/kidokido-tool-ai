-- Step 2: Drop the first_checkout_at column
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "first_checkout_at";