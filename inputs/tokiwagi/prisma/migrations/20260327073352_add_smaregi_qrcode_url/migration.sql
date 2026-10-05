-- AlterTable
ALTER TABLE "ticket_booking_schedules" ADD COLUMN     "base_adult_smaregi_qrcode_url" VARCHAR(255),
ADD COLUMN     "base_child_smaregi_qrcode_url" VARCHAR(255),
ADD COLUMN     "extended_adult_smaregi_qrcode_url" VARCHAR(255),
ADD COLUMN     "extended_child_smaregi_qrcode_url" VARCHAR(255);

-- AlterTable
ALTER TABLE "ticket_details" ADD COLUMN     "adult_smaregi_qrcode_url" VARCHAR(255),
ADD COLUMN     "child_smaregi_qrcode_url" VARCHAR(255),
ADD COLUMN     "discount_adult_smaregi_qrcode_url" VARCHAR(255),
ADD COLUMN     "discount_child_smaregi_qrcode_url" VARCHAR(255);
