-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "gmo_id" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "locked" BOOLEAN DEFAULT false,
ADD COLUMN     "login_attempts" INTEGER;

-- CreateTable
CREATE TABLE "gmo_settings" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "shop_pass" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gmo_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_questions" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,

    CONSTRAINT "security_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_answers" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "question_id" INTEGER NOT NULL,
    "anwser" TEXT NOT NULL,

    CONSTRAINT "security_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "security_answers_user_id_key" ON "security_answers"("user_id");

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_gmo_id_fkey" FOREIGN KEY ("gmo_id") REFERENCES "gmo_settings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_answers" ADD CONSTRAINT "security_answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_answers" ADD CONSTRAINT "security_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "security_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
