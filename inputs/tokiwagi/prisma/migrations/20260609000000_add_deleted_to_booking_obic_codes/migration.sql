-- AlterTable: add soft-delete flag to booking_obic_codes
ALTER TABLE "booking_obic_codes" ADD COLUMN "deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "booking_obic_codes_booking_id_deleted_idx" ON "booking_obic_codes"("booking_id", "deleted");
