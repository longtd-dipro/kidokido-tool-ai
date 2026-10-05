/*
  Warnings:

  - The values [Date,Month] on the enum `PriceUnit` will be removed. If these variants are still used in the database, this will fail.
  - The values [Hour,Date,Monthly,Other] on the enum `TicketType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `end_time` on the `ticket_booking_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `ticket_booking_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `extended_time_adult_price` on the `ticket_details` table. All the data in the column will be lost.
  - You are about to drop the column `extended_time_child_price` on the `ticket_details` table. All the data in the column will be lost.
  - You are about to drop the column `remind_at` on the `ticket_details` table. All the data in the column will be lost.
  - You are about to drop the column `remind_before_in_day` on the `ticket_details` table. All the data in the column will be lost.
  - You are about to drop the column `remind_booking_message` on the `ticket_details` table. All the data in the column will be lost.
  - You are about to drop the column `adult_price` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `adult_price_unit` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `available_on_holiday` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `can_cancel_booking_before_in_minute` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `can_change_booking_before_in_minute` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `can_create_booking_before_in_minute` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `child_price` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `child_price_unit` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `enable_discount` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `end_sale_at` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `max_booking_people` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `max_booking_times` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `only_available_on_holiday` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `start_sale_at` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `valid_from` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `valid_to` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tenant_code]` on the table `admins_tenants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ticket_id,valid_from,valid_to]` on the table `ticket_booking_schedules` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `date` on the `holidays` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `base_adult_period` to the `ticket_booking_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `base_adult_period_price` to the `ticket_booking_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `base_adult_period_unit` to the `ticket_booking_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `base_child_period` to the `ticket_booking_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `base_child_period_price` to the `ticket_booking_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `base_child_period_unit` to the `ticket_booking_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `booking_available_util` to the `ticket_booking_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `can_book_in_advance` to the `ticket_booking_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cancel_or_change_available_util` to the `ticket_booking_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max_booking_people` to the `ticket_booking_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `opening_from` to the `ticket_booking_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `opening_to` to the `ticket_booking_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_sale_at` to the `ticket_booking_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valid_from` to the `ticket_booking_schedules` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `child_age_limit_from` on the `tickets` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `child_age_limit_to` on the `tickets` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ticket_booking_schedules" DROP COLUMN "end_time",
DROP COLUMN "start_time",
ADD COLUMN     "base_adult_period" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "base_adult_period_price" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "base_adult_period_unit" "PriceUnit" NOT NULL,
ADD COLUMN     "base_child_period" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "base_child_period_price" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "base_child_period_unit" "PriceUnit" NOT NULL,
ADD COLUMN     "booking_available_util" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "can_book_in_advance" BOOLEAN NOT NULL,
ADD COLUMN     "cancel_or_change_available_util" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "end_sale_at" TIMESTAMP(3),
ADD COLUMN     "extended_adult_period" DECIMAL(65,30),
ADD COLUMN     "extended_adult_period_price" DECIMAL(65,30),
ADD COLUMN     "extended_adult_period_unit" "PriceUnit",
ADD COLUMN     "extended_child_period" DECIMAL(65,30),
ADD COLUMN     "extended_child_period_price" DECIMAL(65,30),
ADD COLUMN     "extended_child_period_unit" "PriceUnit",
ADD COLUMN     "max_booking_people" INTEGER NOT NULL,
ADD COLUMN     "max_booking_times" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "opening_from" TIME NOT NULL,
ADD COLUMN     "opening_to" TIME NOT NULL,
ADD COLUMN     "remind_at" TIME,
ADD COLUMN     "remind_before_in_day" INTEGER,
ADD COLUMN     "remind_booking_message" TEXT,
ADD COLUMN     "start_sale_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "valid_from" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "valid_to" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "adult_price",
DROP COLUMN "adult_price_unit",
DROP COLUMN "available_on_holiday",
DROP COLUMN "can_cancel_booking_before_in_minute",
DROP COLUMN "can_change_booking_before_in_minute",
DROP COLUMN "can_create_booking_before_in_minute",
DROP COLUMN "child_price",
DROP COLUMN "child_price_unit",
DROP COLUMN "enable_discount",
DROP COLUMN "end_sale_at",
DROP COLUMN "image_url",
DROP COLUMN "max_booking_people",
DROP COLUMN "max_booking_times",
DROP COLUMN "only_available_on_holiday",
DROP COLUMN "start_sale_at",
DROP COLUMN "valid_from",
DROP COLUMN "valid_to",
ADD COLUMN     "setting_url" TEXT,
DROP COLUMN "child_age_limit_from",
ADD COLUMN     "child_age_limit_from" INTEGER NOT NULL,
DROP COLUMN "child_age_limit_to",
ADD COLUMN     "child_age_limit_to" INTEGER NOT NULL;

-- AlterEnum
BEGIN;
CREATE TYPE "PriceUnit_new" AS ENUM ('Minute', 'Hour', 'Day');
ALTER TABLE "ticket_booking_schedules" ALTER COLUMN "base_adult_period_unit" TYPE "PriceUnit_new" USING ("base_adult_period_unit"::text::"PriceUnit_new");
ALTER TABLE "ticket_booking_schedules" ALTER COLUMN "base_child_period_unit" TYPE "PriceUnit_new" USING ("base_child_period_unit"::text::"PriceUnit_new");
ALTER TABLE "ticket_booking_schedules" ALTER COLUMN "extended_adult_period_unit" TYPE "PriceUnit_new" USING ("extended_adult_period_unit"::text::"PriceUnit_new");
ALTER TABLE "ticket_booking_schedules" ALTER COLUMN "extended_child_period_unit" TYPE "PriceUnit_new" USING ("extended_child_period_unit"::text::"PriceUnit_new");
ALTER TYPE "PriceUnit" RENAME TO "PriceUnit_old";
ALTER TYPE "PriceUnit_new" RENAME TO "PriceUnit";
DROP TYPE "PriceUnit_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TicketType_new" AS ENUM ('OneDay', 'MultipleDays');
ALTER TABLE "tickets" ALTER COLUMN "ticket_type" TYPE "TicketType_new" USING ("ticket_type"::text::"TicketType_new");
ALTER TYPE "TicketType" RENAME TO "TicketType_old";
ALTER TYPE "TicketType_new" RENAME TO "TicketType";
DROP TYPE "TicketType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ticket_booking_schedules" DROP CONSTRAINT "ticket_booking_schedules_ticket_id_fkey";

-- DropForeignKey
ALTER TABLE "ticket_details" DROP CONSTRAINT "ticket_details_ticket_id_fkey";

-- DropIndex
DROP INDEX "ticket_booking_schedules_ticket_id_key";


-- AlterTable
ALTER TABLE "holidays" DROP COLUMN "date",
ADD COLUMN     "date" DATE NOT NULL;

-- AlterTable
ALTER TABLE "ticket_details" DROP COLUMN "extended_time_adult_price",
DROP COLUMN "extended_time_child_price",
DROP COLUMN "remind_at",
DROP COLUMN "remind_before_in_day",
DROP COLUMN "remind_booking_message",
ADD COLUMN     "adult_price" DECIMAL(65,30),
ADD COLUMN     "child_price" DECIMAL(65,30),
ADD COLUMN     "enable_discount" BOOLEAN,
ADD COLUMN     "no_waiting_booking_message" TEXT,
ADD COLUMN     "total_days_in_use_from_start" INTEGER;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "name",
ADD COLUMN     "apartment" TEXT,
ADD COLUMN     "birthday" TIME,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "first_name_furigana" TEXT,
ADD COLUMN     "gender" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "last_name" TEXT,
ADD COLUMN     "last_name_furigana" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "admins_tenants_tenant_code_key" ON "admins_tenants"("tenant_code");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_booking_schedules_ticket_id_valid_from_valid_to_key" ON "ticket_booking_schedules"("ticket_id", "valid_from", "valid_to");

-- AddForeignKey
ALTER TABLE "ticket_details" ADD CONSTRAINT "ticket_details_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_booking_schedules" ADD CONSTRAINT "ticket_booking_schedules_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
