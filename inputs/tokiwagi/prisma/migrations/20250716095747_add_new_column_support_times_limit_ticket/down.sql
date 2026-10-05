-- AlterTable
ALTER TABLE "ticket_details" DROP COLUMN "extra_times",
DROP COLUMN "limit_times";

-- AlterTable
ALTER TABLE "ticket_booking_schedules" DROP COLUMN "enable_expiration_remind",
DROP COLUMN "expiration_remind_at",
DROP COLUMN "expiration_remind_before_in_day";

-- AlterEnum
BEGIN;
CREATE TYPE public."TicketType_new" AS ENUM (
	'Hourly',
	'Daily',
	'Monthly',
	'MasterMonthly');
ALTER TABLE "tickets" ALTER COLUMN "ticket_type" TYPE "TicketType_new" USING ("ticket_type"::text::"TicketType_new");
ALTER TYPE "TicketType" RENAME TO "TicketType_old";
ALTER TYPE "TicketType_new" RENAME TO "TicketType";
DROP TYPE "TicketType_old";
COMMIT;