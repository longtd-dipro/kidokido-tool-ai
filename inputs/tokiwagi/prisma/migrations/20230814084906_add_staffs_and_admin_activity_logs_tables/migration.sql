-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'Staff';

-- CreateTable
CREATE TABLE "staffs" (
    "id" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "first_name_furigana" TEXT,
    "last_name_furigana" TEXT,
    "role" "Role" NOT NULL,
    "tenant_code" TEXT NOT NULL,

    CONSTRAINT "staffs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_activity_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "staff_id" TEXT,
    "activity_type" TEXT NOT NULL,
    "details" TEXT,
    "reference" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staffs_tenant_code_key" ON "staffs"("tenant_code");

-- AddForeignKey
ALTER TABLE "staffs" ADD CONSTRAINT "staffs_tenant_code_fkey" FOREIGN KEY ("tenant_code") REFERENCES "tenants"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_activity_logs" ADD CONSTRAINT "admin_activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_activity_logs" ADD CONSTRAINT "admin_activity_logs_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staffs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
