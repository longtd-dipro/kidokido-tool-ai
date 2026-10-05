-- DropIndex
DROP INDEX "bookings_bar_code_idx";

-- DropIndex
DROP INDEX "users_deleted_idx";

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE INDEX "bookings_bar_code_created_at_idx" ON "bookings"("bar_code", "created_at");

-- CreateIndex
CREATE INDEX "bookings_payment_status_GMO_transaction_id_created_at_idx" ON "bookings"("payment_status", "GMO_transaction_id", "created_at");

-- CreateIndex
CREATE INDEX "bookings_payment_status_GMO_transaction_id_user_id_idx" ON "bookings"("payment_status", "GMO_transaction_id", "user_id");

-- CreateIndex
CREATE INDEX "users_role_deleted_created_at_idx" ON "users"("role", "deleted", "created_at");
