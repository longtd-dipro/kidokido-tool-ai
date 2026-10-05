-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "first_checked_in_at" TIMESTAMP(3),
ALTER COLUMN "checked_in_at" DROP DEFAULT,
ALTER COLUMN "checked_out_at" DROP DEFAULT;
