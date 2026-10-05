/*
  Warnings:

  - You are about to drop the column `adult_code` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `child_code` on the `tickets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "adult_code",
DROP COLUMN "child_code",
ADD COLUMN     "adult_ticket_code" INTEGER,
ADD COLUMN     "child_ticket_code" INTEGER;
