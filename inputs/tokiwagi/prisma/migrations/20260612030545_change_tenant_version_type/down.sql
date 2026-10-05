-- AlterEnum
BEGIN;
CREATE TYPE "TenantVersion_new" AS ENUM ('v0', 'v1', 'v2', 'v3');
ALTER TABLE "tenants" ALTER COLUMN "allowed_version" DROP DEFAULT;
ALTER TABLE "tenants" ALTER COLUMN "allowed_version" TYPE "TenantVersion_new" USING ("allowed_version"::text::"TenantVersion_new");
ALTER TYPE "TenantVersion" RENAME TO "TenantVersion_old";
ALTER TYPE "TenantVersion_new" RENAME TO "TenantVersion";
DROP TYPE "TenantVersion_old";
ALTER TABLE "tenants" ALTER COLUMN "allowed_version" SET DEFAULT 'v1';
COMMIT;
