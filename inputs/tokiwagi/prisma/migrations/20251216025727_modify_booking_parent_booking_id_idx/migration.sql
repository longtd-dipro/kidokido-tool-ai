-- DropIndex
DROP INDEX "bookings_parent_booking_id_idx";

-- CreateIndex
CREATE INDEX "bookings_parent_booking_id_status_idx" ON "bookings"("parent_booking_id", "status");
