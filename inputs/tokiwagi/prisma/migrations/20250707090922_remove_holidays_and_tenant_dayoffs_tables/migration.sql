/*
  Warnings:

  - You are about to drop the `holidays` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tenants_day_offs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tenants_holidays` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tenants_day_offs" DROP CONSTRAINT "tenants_day_offs_tenant_code_fkey";

-- DropForeignKey
ALTER TABLE "tenants_holidays" DROP CONSTRAINT "tenants_holidays_holiday_id_fkey";

-- DropForeignKey
ALTER TABLE "tenants_holidays" DROP CONSTRAINT "tenants_holidays_tenant_code_fkey";

-- DropTable
DROP TABLE "holidays";

-- DropTable
DROP TABLE "tenants_day_offs";

-- DropTable
DROP TABLE "tenants_holidays";

-- DropEnum
DROP TYPE "Weekday";
