/*
  Warnings:

  - You are about to drop the column `discount_adult_price` on the `ticket_details` table. All the data in the column will be lost.
  - You are about to drop the column `discount_child_price` on the `ticket_details` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ticket_details" DROP COLUMN "discount_adult_price",
DROP COLUMN "discount_child_price",
ADD COLUMN     "discount_adult_amount" DECIMAL(65,30),
ADD COLUMN     "discount_child_amount" DECIMAL(65,30);
