/*
  Warnings:

  - You are about to drop the column `anwser` on the `security_answers` table. All the data in the column will be lost.
  - Added the required column `answer` to the `security_answers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "security_answers" DROP COLUMN "anwser",
ADD COLUMN     "answer" TEXT NOT NULL;
