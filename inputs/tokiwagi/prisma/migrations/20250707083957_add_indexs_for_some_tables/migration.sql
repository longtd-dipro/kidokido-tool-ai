-- CreateIndex
CREATE INDEX "partial_checkouts_deleted_idx" ON "partial_checkouts"("deleted");

-- CreateIndex
CREATE INDEX "tenants_deleted_idx" ON "tenants"("deleted");

-- CreateIndex
CREATE INDEX "tenants_active_idx" ON "tenants"("active");

-- CreateIndex
CREATE INDEX "ticket_booking_schedules_ticket_id_idx" ON "ticket_booking_schedules"("ticket_id");

-- CreateIndex
CREATE INDEX "ticket_booking_schedules_date_to_idx" ON "ticket_booking_schedules"("date_to");

-- CreateIndex
CREATE INDEX "ticket_booking_schedules_deleted_idx" ON "ticket_booking_schedules"("deleted");

-- CreateIndex
CREATE INDEX "tickets_visibility_idx" ON "tickets"("visibility");

-- CreateIndex
CREATE INDEX "tickets_master_ticket_id_idx" ON "tickets"("master_ticket_id");

-- CreateIndex
CREATE INDEX "users_deleted_idx" ON "users"("deleted");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_token_idx" ON "users"("token");
