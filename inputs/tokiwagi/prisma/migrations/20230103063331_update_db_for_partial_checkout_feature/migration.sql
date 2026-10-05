-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "partial_checked_out_adult_quantity" INTEGER,
ADD COLUMN     "partial_checked_out_child_quantity" INTEGER;

-- CreateTable
CREATE TABLE "partial_checkouts" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "checked_out_at" TIMESTAMP(3) NOT NULL,
    "is_adult" BOOLEAN NOT NULL,
    "quantity" INTEGER NOT NULL,
    "booking_child_age_info_id" INTEGER,

    CONSTRAINT "partial_checkouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "partial_checkouts_booking_id_idx" ON "partial_checkouts"("booking_id");

-- AddForeignKey
ALTER TABLE "partial_checkouts" ADD CONSTRAINT "partial_checkouts_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partial_checkouts" ADD CONSTRAINT "partial_checkouts_booking_child_age_info_id_fkey" FOREIGN KEY ("booking_child_age_info_id") REFERENCES "booking_child_age_infos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
