/*
  Warnings:

  - You are about to alter the column `smaregi_store_id` on the `tenants` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "smaregi_contract_id" VARCHAR(100),
ALTER COLUMN "allowed_version" SET DEFAULT 'v0',
ALTER COLUMN "smaregi_store_id" SET DATA TYPE VARCHAR(100);
