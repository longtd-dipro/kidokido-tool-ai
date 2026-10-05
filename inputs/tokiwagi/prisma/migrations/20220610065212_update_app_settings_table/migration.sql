/*
  Warnings:
  - Changed the type of `data_type` on the `app_settings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
*/
-- CreateEnum
CREATE TYPE "DataType" AS ENUM ('Text', 'Number', 'RichText');

-- AlterTable
ALTER TABLE "app_settings"
ALTER COLUMN "data_type" TYPE "DataType" USING data_type::"DataType";