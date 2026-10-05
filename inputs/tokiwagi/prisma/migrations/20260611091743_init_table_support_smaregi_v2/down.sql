-- AlterTable
ALTER TABLE "tenants" DROP COLUMN "smaregi_store_id",
DROP COLUMN "allowed_version";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "smaregi_transaction_head_id";

-- DropTable
DROP TABLE "smaregi_transactions";

-- DropTable
DROP TABLE "smaregi_temporary_transactions";

-- DropTable
DROP TABLE "sse_notifications";

-- DropEnum
DROP TYPE "SmaregiTemporaryStatus";

-- DropEnum
DROP TYPE "TenantVersion";
