/*
  Warnings:

  - You are about to drop the column `child_age` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `from` on the `ticket_booking_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `to` on the `ticket_booking_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `apartment` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `company` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `tickets_holidays` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[ticket_id,date_from,date_to]` on the table `ticket_booking_schedules` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date_from` to the `ticket_booking_schedules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'Error';

-- DropForeignKey
ALTER TABLE "tickets_holidays" DROP CONSTRAINT "tickets_holidays_holiday_id_fkey";

-- DropForeignKey
ALTER TABLE "tickets_holidays" DROP CONSTRAINT "tickets_holidays_ticket_id_fkey";

-- DropIndex
DROP INDEX "ticket_booking_schedules_ticket_id_from_to_key";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "child_age",
ALTER COLUMN "adult_price" DROP NOT NULL,
ALTER COLUMN "child_price" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ticket_booking_schedules" DROP COLUMN "from",
DROP COLUMN "to",
ADD COLUMN     "date_from" DATE NOT NULL,
ADD COLUMN     "date_to" DATE,
ADD COLUMN     "time_from" TIME,
ADD COLUMN     "time_to" TIME;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "apartment",
DROP COLUMN "company",
DROP COLUMN "department";

-- DropTable
DROP TABLE "tickets_holidays";

-- CreateTable
CREATE TABLE "tickets_tenants" (
    "ticket_id" INTEGER NOT NULL,
    "tenant_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_tenants_pkey" PRIMARY KEY ("ticket_id","tenant_code")
);

-- CreateIndex
CREATE UNIQUE INDEX "ticket_booking_schedules_ticket_id_date_from_date_to_key" ON "ticket_booking_schedules"("ticket_id", "date_from", "date_to");

-- AddForeignKey
ALTER TABLE "tickets_tenants" ADD CONSTRAINT "tickets_tenants_tenant_code_fkey" FOREIGN KEY ("tenant_code") REFERENCES "tenants"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets_tenants" ADD CONSTRAINT "tickets_tenants_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
