-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "pos_total_amount" DECIMAL(65,30),
ADD COLUMN     "smaregi_qr_codes" JSONB,
ADD COLUMN     "web_total_amount" DECIMAL(65,30);
