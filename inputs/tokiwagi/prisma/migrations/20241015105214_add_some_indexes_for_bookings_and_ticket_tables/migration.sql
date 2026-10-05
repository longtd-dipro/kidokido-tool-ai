-- CreateIndex
CREATE INDEX "bookings_user_id_status_idx" ON "bookings"("user_id", "status");

-- CreateIndex
CREATE INDEX "bookings_ticket_id_idx" ON "bookings"("ticket_id");

-- CreateIndex
CREATE INDEX "bookings_parent_booking_id_idx" ON "bookings"("parent_booking_id");

-- CreateIndex
CREATE INDEX "tickets_ticket_type_idx" ON "tickets"("ticket_type");
