/*
  Warnings:

  - The values [v3] on the enum `TenantVersion` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TenantVersion_new" AS ENUM ('v0', 'v1', 'v2');
ALTER TABLE "tenants" ALTER COLUMN "allowed_version" DROP DEFAULT;
ALTER TABLE "tenants" ALTER COLUMN "allowed_version" TYPE "TenantVersion_new" USING ("allowed_version"::text::"TenantVersion_new");
ALTER TYPE "TenantVersion" RENAME TO "TenantVersion_old";
ALTER TYPE "TenantVersion_new" RENAME TO "TenantVersion";
DROP TYPE "TenantVersion_old";
ALTER TABLE "tenants" ALTER COLUMN "allowed_version" SET DEFAULT 'v1';
COMMIT;
