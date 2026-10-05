-- DropForeignKey
ALTER TABLE "booking_obic_codes" DROP CONSTRAINT "booking_obic_codes_booking_id_fkey";

-- DropTable (indexes are dropped automatically with the table)
DROP TABLE "booking_obic_codes";

-- AlterTable
ALTER TABLE "ticket_details"
  DROP COLUMN "adult_obic_code",
  DROP COLUMN "adult_obic_code_1st_booking",
  DROP COLUMN "child_obic_code",
  DROP COLUMN "child_obic_code_1st_booking",
  DROP COLUMN "discount_adult_obic_code",
  DROP COLUMN "discount_child_obic_code";

-- AlterTable
ALTER TABLE "ticket_booking_schedules"
  DROP COLUMN "base_adult_obic_code",
  DROP COLUMN "base_child_obic_code",
  DROP COLUMN "extended_adult_obic_code",
  DROP COLUMN "extended_child_obic_code";

-- DropEnum
DROP TYPE "ObicSourceField";
DROP TYPE "ObicAudience";
DROP TYPE "ObicCodeKind";
