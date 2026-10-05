-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'Calling';

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "waiting_order" INTEGER;
