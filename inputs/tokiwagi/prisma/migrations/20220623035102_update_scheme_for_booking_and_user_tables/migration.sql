/*
  Warnings:

  - The `birthday` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "user_id" INTEGER;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "birthday",
ADD COLUMN     "birthday" DATE;

-- CreateTable
CREATE TABLE "booking_child_age_infos" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "child_age_in_month" INTEGER NOT NULL,

    CONSTRAINT "booking_child_age_infos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_child_age_infos" ADD CONSTRAINT "booking_child_age_infos_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
