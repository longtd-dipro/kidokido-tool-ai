/*
  Warnings:

  - You are about to drop the column `city` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `ward` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `privacy_settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "city",
DROP COLUMN "district",
DROP COLUMN "province",
DROP COLUMN "ward",
ADD COLUMN     "address" TEXT;

-- DropTable
DROP TABLE "privacy_settings";
