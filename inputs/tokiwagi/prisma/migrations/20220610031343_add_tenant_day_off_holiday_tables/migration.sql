/*
  Warnings:
  - The values [Baby,Gift] on the enum `TicketType` will be removed. If these variants are still used in the database, this will fail.
*/
-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun');

-- AlterEnum
BEGIN;
CREATE TYPE "TicketType_new" AS ENUM ('Hour', 'Date', 'Monthly', 'Other');
ALTER TABLE "tickets" ALTER COLUMN "ticket_type" TYPE "TicketType_new" USING ("ticket_type"::text::"TicketType_new");
ALTER TYPE "TicketType" RENAME TO "TicketType_old";
ALTER TYPE "TicketType_new" RENAME TO "TicketType";
DROP TYPE "TicketType_old";
COMMIT;

-- CreateTable
CREATE TABLE "tenants_day_offs" (
    "tenant_code" TEXT NOT NULL,
    "day_off" "Weekday" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_day_offs_pkey" PRIMARY KEY ("tenant_code","day_off")
);

-- CreateTable
CREATE TABLE "tenants_holidays" (
    "tenant_code" TEXT NOT NULL,
    "holiday_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_holidays_pkey" PRIMARY KEY ("tenant_code","holiday_id")
);

-- AddForeignKey
ALTER TABLE "tenants_day_offs" ADD CONSTRAINT "tenants_day_offs_tenant_code_fkey" FOREIGN KEY ("tenant_code") REFERENCES "tenants"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants_holidays" ADD CONSTRAINT "tenants_holidays_tenant_code_fkey" FOREIGN KEY ("tenant_code") REFERENCES "tenants"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants_holidays" ADD CONSTRAINT "tenants_holidays_holiday_id_fkey" FOREIGN KEY ("holiday_id") REFERENCES "holidays"("id") ON DELETE CASCADE ON UPDATE CASCADE;