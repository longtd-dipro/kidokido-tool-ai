/*
  Warnings:

  - You are about to drop the column `opening_from` on the `ticket_booking_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `opening_to` on the `ticket_booking_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `valid_from` on the `ticket_booking_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `valid_to` on the `ticket_booking_schedules` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ticket_id,from,to]` on the table `ticket_booking_schedules` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `from` to the `ticket_booking_schedules` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ticket_booking_schedules_ticket_id_valid_from_valid_to_key";

-- AlterTable
ALTER TABLE "ticket_booking_schedules" DROP COLUMN "opening_from",
DROP COLUMN "opening_to",
DROP COLUMN "valid_from",
DROP COLUMN "valid_to",
ADD COLUMN     "from" DATE NOT NULL,
ADD COLUMN     "to" DATE,
ALTER COLUMN "booking_available_util" SET DATA TYPE TIME,
ALTER COLUMN "cancel_or_change_available_util" SET DATA TYPE TIME,
ALTER COLUMN "max_booking_times" DROP NOT NULL,
ALTER COLUMN "max_booking_times" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "ticket_booking_schedules_ticket_id_from_to_key" ON "ticket_booking_schedules"("ticket_id", "from", "to");
