-- CreateIndex
CREATE INDEX "ticket_booking_schedules_ticket_id_deleted_date_to_idx" ON "ticket_booking_schedules"("ticket_id", "deleted", "date_to");
