-- Step 1: Restore smaregi_transaction_head_id column on bookings
ALTER TABLE "bookings" ADD COLUMN "smaregi_transaction_head_id" TEXT;

-- Step 2: Restore data from smaregi_temporary_transactions.settled_transaction_head_id
-- BEFORE dropping that column. Take the most recently settled transaction per barcode.
UPDATE "bookings" b
SET smaregi_transaction_head_id = (
  SELECT stt.settled_transaction_head_id
  FROM smaregi_temporary_transactions stt
  WHERE stt.bar_code = b.bar_code
    AND stt.settled_transaction_head_id IS NOT NULL
  ORDER BY stt.created_at DESC
  LIMIT 1
)
WHERE b.smaregi_transaction_head_id IS NULL;

-- Step 3: Drop the new columns from smaregi_temporary_transactions
ALTER TABLE "smaregi_temporary_transactions" DROP COLUMN "checked_in_at";
ALTER TABLE "smaregi_temporary_transactions" DROP COLUMN "settled_transaction_head_id";
