-- CreateIndex
CREATE INDEX "bookings_bar_code_idx" ON "bookings"("bar_code");

-- CreateIndex
CREATE INDEX "bookings_tenant_code_status_date_idx" ON "bookings"("tenant_code", "status", "date");

-- CreateIndex
CREATE INDEX "tickets_tenant_code_idx" ON "tickets"("tenant_code");

-- CreateIndex
CREATE INDEX "users_name_phone_idx" ON "users"("name", "phone");
