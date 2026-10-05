-- AlterTable
ALTER TABLE "tenants" DROP COLUMN "smaregi_contract_id",
ALTER COLUMN "allowed_version" SET DEFAULT 'v1',
ALTER COLUMN "smaregi_store_id" SET DATA TYPE TEXT;
