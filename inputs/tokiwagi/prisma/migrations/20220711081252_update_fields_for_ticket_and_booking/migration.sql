/*
  Warnings:

  - The values [Completed] on the enum `BookingStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `discount_code` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `cancel_or_change_available_util` on the `ticket_booking_schedules` table. All the data in the column will be lost.
  - Added the required column `cancel_or_change_available_util` to the `ticket_details` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BookingStatus_new" AS ENUM ('Successful', 'Cancelled', 'Waiting', 'CheckedIn', 'CheckedOut');
ALTER TABLE "bookings" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "bookings" ALTER COLUMN "status" TYPE "BookingStatus_new" USING ("status"::text::"BookingStatus_new");
ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "BookingStatus_old";
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'Successful';
COMMIT;

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "discount_code",
ADD COLUMN     "coupon_code" TEXT,
ALTER COLUMN "status" SET DEFAULT E'Successful';

-- AlterTable
ALTER TABLE "ticket_booking_schedules" DROP COLUMN "cancel_or_change_available_util";

-- AlterTable
ALTER TABLE "ticket_details" ADD COLUMN     "cancel_or_change_available_util" TIME NOT NULL;
