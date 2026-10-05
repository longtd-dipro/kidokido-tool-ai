-- Step 1: Add new columns to smaregi_temporary_transactions
ALTER TABLE "smaregi_temporary_transactions" ADD COLUMN "checked_in_at" TIMESTAMP(3);
ALTER TABLE "smaregi_temporary_transactions" ADD COLUMN "settled_transaction_head_id" TEXT;

-- Step 2: Backfill checked_in_at from the linked booking's first_checked_in_at.
-- Pre-recheckIn records have exactly one checkout cycle per barcode, so first_checked_in_at
-- (set at checkout time) is the correct cycle anchor. Fall back to checked_in_at for
-- bookings that were never fully checked out.
UPDATE "smaregi_temporary_transactions" stt
SET checked_in_at = (
  SELECT COALESCE(b.first_checked_in_at, b.checked_in_at)
  FROM bookings b
  WHERE b.bar_code = stt.bar_code
  ORDER BY b.created_at ASC
  LIMIT 1
)
WHERE stt.checked_in_at IS NULL;

-- Step 3: Backfill settled_transaction_head_id from bookings.smaregi_transaction_head_id
-- BEFORE dropping that column. Only Completed rows have a settled real transaction.
UPDATE "smaregi_temporary_transactions" stt
SET settled_transaction_head_id = (
  SELECT b.smaregi_transaction_head_id
  FROM bookings b
  WHERE b.bar_code = stt.bar_code
    AND b.smaregi_transaction_head_id IS NOT NULL
  LIMIT 1
)
WHERE stt.status = 'Completed'
  AND stt.settled_transaction_head_id IS NULL;

-- Step 4: Drop the migrated column from bookings (data already captured above)
ALTER TABLE "bookings" DROP COLUMN "smaregi_transaction_head_id";
