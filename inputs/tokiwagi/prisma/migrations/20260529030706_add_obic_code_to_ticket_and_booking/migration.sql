-- CreateEnum
CREATE TYPE "ObicCodeKind" AS ENUM ('Base', 'ExtendedPeriod', 'Discount', 'HourlyExtraTimeDiscount');

-- CreateEnum
CREATE TYPE "ObicAudience" AS ENUM ('Adult', 'Child');

-- CreateEnum
CREATE TYPE "ObicSourceField" AS ENUM ('TD_adultObicCode', 'TD_adultObicCode1stBooking', 'TD_childObicCode', 'TD_childObicCode1stBooking', 'TD_discountAdultObicCode', 'TD_discountChildObicCode', 'TBS_baseAdultObicCode', 'TBS_baseChildObicCode', 'TBS_extendedAdultObicCode', 'TBS_extendedChildObicCode', 'TDS_hourlyExtraTime_adultObicCode', 'TDS_hourlyExtraTime_childObicCode', 'TDS_discountTier_adultObicCode', 'TDS_discountTier_childObicCode');

-- AlterTable
ALTER TABLE "ticket_booking_schedules" ADD COLUMN     "base_adult_obic_code" VARCHAR(255),
ADD COLUMN     "base_child_obic_code" VARCHAR(255),
ADD COLUMN     "extended_adult_obic_code" VARCHAR(255),
ADD COLUMN     "extended_child_obic_code" VARCHAR(255);

-- AlterTable
ALTER TABLE "ticket_details" ADD COLUMN     "adult_obic_code" VARCHAR(255),
ADD COLUMN     "adult_obic_code_1st_booking" VARCHAR(255),
ADD COLUMN     "child_obic_code" VARCHAR(255),
ADD COLUMN     "child_obic_code_1st_booking" VARCHAR(255),
ADD COLUMN     "discount_adult_obic_code" VARCHAR(255),
ADD COLUMN     "discount_child_obic_code" VARCHAR(255);

-- CreateTable
CREATE TABLE "booking_obic_codes" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "kind" "ObicCodeKind" NOT NULL,
    "audience" "ObicAudience" NOT NULL,
    "obic_code" VARCHAR(255) NOT NULL,
    "source_field" "ObicSourceField" NOT NULL,
    "source_tier_index" INTEGER,
    "amount" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "line_index" INTEGER NOT NULL,
    "is_pending" BOOLEAN NOT NULL DEFAULT false,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_obic_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_obic_codes_booking_id_idx" ON "booking_obic_codes"("booking_id");

-- CreateIndex
CREATE INDEX "booking_obic_codes_booking_id_is_pending_source_field_sourc_idx" ON "booking_obic_codes"("booking_id", "is_pending", "source_field", "source_tier_index");

-- CreateIndex
CREATE INDEX "booking_obic_codes_booking_id_obic_code_quantity_idx" ON "booking_obic_codes"("booking_id", "obic_code", "quantity");

-- AddForeignKey
ALTER TABLE "booking_obic_codes" ADD CONSTRAINT "booking_obic_codes_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
