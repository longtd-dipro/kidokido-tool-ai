/*
  Warnings:

  - You are about to drop the column `cancle_booking_message` on the `ticket_details` table. All the data in the column will be lost.
  - You are about to drop the column `change_booking_message` on the `ticket_details` table. All the data in the column will be lost.
  - You are about to drop the column `no_waiting_booking_message` on the `ticket_details` table. All the data in the column will be lost.
  - You are about to drop the column `waiting_booking_message` on the `ticket_details` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ticket_details" DROP COLUMN "cancle_booking_message",
DROP COLUMN "change_booking_message",
DROP COLUMN "no_waiting_booking_message",
DROP COLUMN "waiting_booking_message";
