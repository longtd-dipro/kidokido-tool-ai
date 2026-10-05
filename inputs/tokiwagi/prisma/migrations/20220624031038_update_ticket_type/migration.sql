/*
  Warnings:

  - The values [OneDay,MultipleDays] on the enum `TicketType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TicketType_new" AS ENUM ('Hourly', 'Daily', 'Monthly');
ALTER TABLE "tickets" ALTER COLUMN "ticket_type" TYPE "TicketType_new" USING ("ticket_type"::text::"TicketType_new");
ALTER TYPE "TicketType" RENAME TO "TicketType_old";
ALTER TYPE "TicketType_new" RENAME TO "TicketType";
DROP TYPE "TicketType_old";
COMMIT;
