ALTER TABLE "booking_obic_codes" DROP COLUMN "deleted"; 

DROP INDEX  IF EXISTS "booking_obic_codes_booking_id_deleted_idx";
