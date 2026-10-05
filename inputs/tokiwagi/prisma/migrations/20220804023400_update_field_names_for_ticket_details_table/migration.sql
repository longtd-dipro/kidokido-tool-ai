/*
  Warnings:

  - You are about to drop the column `discount_num_of_adult_threshold` on the `ticket_details` table. All the data in the column will be lost.
  - You are about to drop the column `discount_num_of_child_threshold` on the `ticket_details` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ticket_details" DROP COLUMN "discount_num_of_adult_threshold",
DROP COLUMN "discount_num_of_child_threshold",
ADD COLUMN     "discount_adult_threshold" DECIMAL(65,30),
ADD COLUMN     "discount_child_threshold" DECIMAL(65,30);
