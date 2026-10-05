/*
  Warnings:

  - You are about to drop the column `capacity` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `contact_info` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `booking_available_util` on the `ticket_booking_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `remind_booking_message` on the `ticket_booking_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `agreement` on the `ticket_details` table. All the data in the column will be lost.
  - You are about to drop the column `cancel_or_change_available_util` on the `ticket_details` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `setting_url` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the `tickets_tenants` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `served_util` to the `tenants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `can_booking_before_in_day` to the `ticket_booking_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `can_booking_util` to the `ticket_booking_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `can_cancel_or_change_before_in_day` to the `ticket_booking_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `can_cancel_or_change_util` to the `ticket_booking_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enable_remind` to the `ticket_booking_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_code` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tickets_tenants" DROP CONSTRAINT "tickets_tenants_tenant_code_fkey";

-- DropForeignKey
ALTER TABLE "tickets_tenants" DROP CONSTRAINT "tickets_tenants_ticket_id_fkey";

-- AlterTable
ALTER TABLE "tenants" DROP COLUMN "capacity",
DROP COLUMN "contact_info",
DROP COLUMN "description",
DROP COLUMN "location",
ADD COLUMN     "guide" TEXT,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "post_code" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "served_util" TIME NOT NULL,
ADD COLUMN     "site_url" TEXT;

-- AlterTable
ALTER TABLE "ticket_booking_schedules" DROP COLUMN "booking_available_util",
DROP COLUMN "remind_booking_message",
ADD COLUMN     "can_booking_before_in_day" INTEGER NOT NULL,
ADD COLUMN     "can_booking_util" TIME NOT NULL,
ADD COLUMN     "can_cancel_or_change_before_in_day" INTEGER NOT NULL,
ADD COLUMN     "can_cancel_or_change_util" TIME NOT NULL,
ADD COLUMN     "enable_remind" BOOLEAN NOT NULL,
ALTER COLUMN "max_booking_people" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ticket_details" DROP COLUMN "agreement",
DROP COLUMN "cancel_or_change_available_util";

-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "description",
DROP COLUMN "setting_url",
ADD COLUMN     "tenant_code" TEXT NOT NULL;

-- DropTable
DROP TABLE "tickets_tenants";

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_tenant_code_fkey" FOREIGN KEY ("tenant_code") REFERENCES "tenants"("code") ON DELETE CASCADE ON UPDATE CASCADE;
