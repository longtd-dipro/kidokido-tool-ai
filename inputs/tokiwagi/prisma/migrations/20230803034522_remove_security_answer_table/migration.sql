/*
  Warnings:

  - You are about to drop the `security_answers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "security_answers" DROP CONSTRAINT "security_answers_question_id_fkey";

-- DropForeignKey
ALTER TABLE "security_answers" DROP CONSTRAINT "security_answers_user_id_fkey";

-- AlterTable
ALTER TABLE "security_questions" ADD COLUMN     "answer" TEXT;

-- DropTable
DROP TABLE "security_answers";
