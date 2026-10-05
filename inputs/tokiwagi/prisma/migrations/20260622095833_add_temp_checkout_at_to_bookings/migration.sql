-- Add temp_checkout_at column to store the calculate-pay-amount timestamp
-- so OBIC codes at check-out are computed against the same time the amount was quoted.
ALTER TABLE "bookings" ADD COLUMN "temp_checkout_at" TIMESTAMP(3);
