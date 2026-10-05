-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "ticket_booking_schedule_id" INTEGER;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_ticket_booking_schedule_id_fkey" FOREIGN KEY ("ticket_booking_schedule_id") REFERENCES "ticket_booking_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
