-- AlterTable
ALTER TABLE "tenants" ALTER COLUMN "opened_at" DROP NOT NULL,
ALTER COLUMN "closed_at" DROP NOT NULL,
ALTER COLUMN "served_util" DROP NOT NULL;
