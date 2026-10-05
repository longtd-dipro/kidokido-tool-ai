/*
  Warnings:

  - The values [Partial] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('Error', 'Pending', 'Completed', 'Refunded');
ALTER TABLE "bookings" ALTER COLUMN "payment_status" DROP DEFAULT;
ALTER TABLE "bookings" ALTER COLUMN "payment_status" TYPE "PaymentStatus_new" USING ("payment_status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "PaymentStatus_old";
ALTER TABLE "bookings" ALTER COLUMN "payment_status" SET DEFAULT 'Pending';
COMMIT;

-- DropIndex
DROP INDEX "bookings_bar_code_key";

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "reminded_at" TIMESTAMP(3);
