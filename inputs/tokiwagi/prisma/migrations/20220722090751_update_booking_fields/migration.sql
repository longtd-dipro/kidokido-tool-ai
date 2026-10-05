-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'SystemCancelled';

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "calling_at" TIMESTAMP(3);
