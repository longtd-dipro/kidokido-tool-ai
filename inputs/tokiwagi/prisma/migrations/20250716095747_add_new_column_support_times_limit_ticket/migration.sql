-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TicketType" ADD VALUE 'HourlyTimesLimit';
ALTER TYPE "TicketType" ADD VALUE 'DailyTimesLimit';

-- AlterTable
ALTER TABLE "ticket_details" ADD COLUMN     "extra_times" INTEGER,
ADD COLUMN     "limit_times" INTEGER;

-- AlterTable
ALTER TABLE "ticket_booking_schedules" ADD COLUMN     "enable_expiration_remind" BOOLEAN,
ADD COLUMN     "expiration_remind_at" TIME,
ADD COLUMN     "expiration_remind_before_in_day" INTEGER;
