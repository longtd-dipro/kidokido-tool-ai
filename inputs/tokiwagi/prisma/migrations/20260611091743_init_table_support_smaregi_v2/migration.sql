-- CreateEnum
CREATE TYPE "TenantVersion" AS ENUM ('v1', 'v2', 'v3');

-- CreateEnum
CREATE TYPE "SmaregiTemporaryStatus" AS ENUM ('Normal', 'Completed', 'Cancelled');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "smaregi_transaction_head_id" TEXT;

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "allowed_version" "TenantVersion" NOT NULL DEFAULT 'v1',
ADD COLUMN     "smaregi_store_id" TEXT;

-- CreateTable
CREATE TABLE "sse_notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sse_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "smaregi_temporary_transactions" (
    "id" SERIAL NOT NULL,
    "bar_code" TEXT NOT NULL,
    "temporary_transaction_head_id" TEXT,
    "temporary_transaction_barcode" TEXT,
    "pre_registration_name" TEXT,
    "store_id" TEXT,
    "terminal_id" TEXT,
    "total" DECIMAL(10,2),
    "status" "SmaregiTemporaryStatus" NOT NULL DEFAULT 'Normal',
    "sync_error" TEXT,
    "synced_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "smaregi_temporary_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "smaregi_transactions" (
    "id" SERIAL NOT NULL,
    "transaction_head_id" TEXT NOT NULL,
    "contract_id" TEXT,
    "store_id" TEXT,
    "action" TEXT NOT NULL,
    "total" DECIMAL(65,30),
    "raw_payload" JSONB NOT NULL,
    "affected_booking_ids" JSONB,
    "source" TEXT NOT NULL DEFAULT 'Webhook',
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "smaregi_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sse_notifications_user_id_id_idx" ON "sse_notifications"("user_id", "id");

-- CreateIndex
CREATE INDEX "sse_notifications_created_at_idx" ON "sse_notifications"("created_at");

-- CreateIndex
CREATE INDEX "smaregi_temporary_transactions_status_idx" ON "smaregi_temporary_transactions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "smaregi_temporary_transactions_temporary_transaction_barcod_key" ON "smaregi_temporary_transactions"("temporary_transaction_barcode");

-- CreateIndex
CREATE UNIQUE INDEX "smaregi_transactions_transaction_head_id_key" ON "smaregi_transactions"("transaction_head_id");

-- CreateIndex
CREATE INDEX "smaregi_transactions_store_id_idx" ON "smaregi_transactions"("store_id");
