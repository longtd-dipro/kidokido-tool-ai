-- AlterEnum
ALTER TYPE "TicketType" ADD VALUE 'MasterMonthly';

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "master_ticket_id" INTEGER;
