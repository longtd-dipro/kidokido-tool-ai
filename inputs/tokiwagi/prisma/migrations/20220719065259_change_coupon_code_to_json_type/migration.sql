/*
  Warnings:

  - You are about to drop the column `coupon_code` on the `bookings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "coupon_code",
ADD COLUMN     "coupons" JSONB;
