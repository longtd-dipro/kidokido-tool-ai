-- Add first_checkout_at: set once on a booking's first-ever checkout and preserved across
-- later re-check-in/checkout cycles, mirroring first_checked_in_at.
ALTER TABLE "bookings" ADD COLUMN "first_checkout_at" TIMESTAMP(3);
