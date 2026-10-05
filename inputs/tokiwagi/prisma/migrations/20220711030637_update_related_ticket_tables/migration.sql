/*
  Warnings:

  - The values [Pending] on the enum `BookingStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `content` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `tenant_code` on the `tickets` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BookingStatus_new" AS ENUM ('Completed', 'Cancelled', 'Waiting', 'CheckedIn', 'CheckedOut');
ALTER TABLE "bookings" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "bookings" ALTER COLUMN "status" TYPE "BookingStatus_new" USING ("status"::text::"BookingStatus_new");
ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "BookingStatus_old";
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'Completed';
COMMIT;

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_tenant_code_fkey";

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "parent_booking_id" INTEGER,
ALTER COLUMN "status" SET DEFAULT E'Completed',
ALTER COLUMN "sub_email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ticket_booking_schedules" ALTER COLUMN "base_adult_period" DROP NOT NULL,
ALTER COLUMN "base_adult_period_price" DROP NOT NULL,
ALTER COLUMN "base_adult_period_unit" DROP NOT NULL,
ALTER COLUMN "base_child_period" DROP NOT NULL,
ALTER COLUMN "base_child_period_price" DROP NOT NULL,
ALTER COLUMN "base_child_period_unit" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "content",
DROP COLUMN "tenant_code",
ADD COLUMN     "description" TEXT;
