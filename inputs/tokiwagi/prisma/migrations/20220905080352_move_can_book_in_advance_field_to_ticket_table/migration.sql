/*
  Warnings:

  - You are about to drop the column `can_book_in_advance` on the `ticket_booking_schedules` table. All the data in the column will be lost.
  - Added the required column `can_book_in_advance` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ticket_booking_schedules" DROP COLUMN "can_book_in_advance";

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "can_book_in_advance" BOOLEAN NOT NULL;
