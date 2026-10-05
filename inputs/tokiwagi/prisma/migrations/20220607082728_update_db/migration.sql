/*
  Warnings:
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users_roles` table. If the table is not empty, all the data it contains will be lost.
*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('User', 'Admin', 'SuperAdmin');

-- CreateEnum
CREATE TYPE "PriceUnit" AS ENUM ('Minute', 'Hour', 'Date', 'Month');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('Online', 'Offline');

-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('Baby', 'Gift', 'Hour', 'Date', 'Monthly', 'Other');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('Pending', 'Completed', 'Cancelled', 'Waiting', 'CheckedIn', 'CheckedOut');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('Pending', 'Completed', 'Partial', 'Refunded');

-- DropForeignKey
ALTER TABLE "users_roles" DROP CONSTRAINT "users_roles_role_id_fkey";

-- DropForeignKey
ALTER TABLE "users_roles" DROP CONSTRAINT "users_roles_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "allowed_newsletter" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "is_blacklist" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "post_code" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT E'User',
ADD COLUMN     "ward" TEXT,
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "token" DROP NOT NULL;

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "users_roles";

-- CreateTable
CREATE TABLE "tenants" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "contact_info" TEXT,
    "capacity" INTEGER NOT NULL,
    "opened_at" TIME NOT NULL,
    "closed_at" TIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "admins_tenants" (
    "user_id" INTEGER NOT NULL,
    "tenant_code" TEXT NOT NULL,

    CONSTRAINT "admins_tenants_pkey" PRIMARY KEY ("user_id","tenant_code")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" SERIAL NOT NULL,
    "tenant_code" TEXT,
    "name" TEXT NOT NULL,
    "content" TEXT,
    "image_url" TEXT,
    "video_url" TEXT,
    "adult_price" DECIMAL(65,30) NOT NULL,
    "adult_price_unit" "PriceUnit" NOT NULL DEFAULT E'Date',
    "child_price" DECIMAL(65,30) NOT NULL,
    "child_price_unit" "PriceUnit" NOT NULL DEFAULT E'Date',
    "start_sale_at" TIMESTAMP(3),
    "end_sale_at" TIMESTAMP(3),
    "valid_from" TIMESTAMP(3),
    "valid_to" TIMESTAMP(3),
    "available_on_holiday" BOOLEAN NOT NULL DEFAULT false,
    "only_available_on_holiday" BOOLEAN NOT NULL DEFAULT false,
    "payment_type" "PaymentType" NOT NULL,
    "ticket_type" "TicketType" NOT NULL,
    "visibility" BOOLEAN NOT NULL DEFAULT true,
    "enable_discount" BOOLEAN NOT NULL DEFAULT true,
    "child_age_limit_from" TEXT NOT NULL,
    "child_age_limit_to" TEXT NOT NULL,
    "max_child_per_adult" INTEGER NOT NULL,
    "can_create_booking_before_in_minute" INTEGER NOT NULL,
    "can_cancel_booking_before_in_minute" INTEGER NOT NULL,
    "can_change_booking_before_in_minute" INTEGER NOT NULL,
    "max_booking_times" INTEGER NOT NULL DEFAULT 1,
    "max_booking_people" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_details" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "discount_num_of_adult_threshold" DECIMAL(65,30),
    "discount_adult_price" DECIMAL(65,30),
    "discount_num_of_child_threshold" DECIMAL(65,30),
    "discount_child_price" DECIMAL(65,30),
    "agreement" TEXT,
    "required_agreement" BOOLEAN,
    "extended_time_adult_price" DECIMAL(65,30),
    "extended_time_child_price" DECIMAL(65,30),
    "waiting_booking_message" TEXT,
    "cancle_booking_message" TEXT,
    "change_booking_message" TEXT,
    "remind_booking_message" TEXT,
    "remind_before_in_day" INTEGER,
    "remind_at" TIME,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_booking_schedules" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,

    CONSTRAINT "ticket_booking_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" SERIAL NOT NULL,
    "tenant_code" TEXT NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "adult_quantity" INTEGER NOT NULL,
    "adult_price" DECIMAL(65,30) NOT NULL,
    "child_quantity" INTEGER NOT NULL,
    "child_price" DECIMAL(65,30) NOT NULL,
    "child_age" TEXT,
    "total_amount" DECIMAL(65,30) NOT NULL,
    "discount_code" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT E'Pending',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT E'Pending',
    "bar_code" TEXT NOT NULL,
    "sub_email" TEXT NOT NULL,
    "from" TIMESTAMP(3),
    "to" TIMESTAMP(3),
    "checked_in_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "checked_out_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_settings" (
    "setting_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "data_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("setting_key")
);

-- CreateTable
CREATE TABLE "email_settings" (
    "email_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_settings_pkey" PRIMARY KEY ("email_key")
);

-- CreateTable
CREATE TABLE "holidays" (
    "id" SERIAL NOT NULL,
    "date" TIME NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets_holidays" (
    "ticket_id" INTEGER NOT NULL,
    "holiday_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_holidays_pkey" PRIMARY KEY ("ticket_id","holiday_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_code_key" ON "tenants"("code");

-- CreateIndex
CREATE UNIQUE INDEX "admins_tenants_user_id_key" ON "admins_tenants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_details_ticket_id_key" ON "ticket_details"("ticket_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_booking_schedules_ticket_id_key" ON "ticket_booking_schedules"("ticket_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_booking_schedules_ticket_id_start_time_end_time_key" ON "ticket_booking_schedules"("ticket_id", "start_time", "end_time");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_bar_code_key" ON "bookings"("bar_code");

-- AddForeignKey
ALTER TABLE "admins_tenants" ADD CONSTRAINT "admins_tenants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins_tenants" ADD CONSTRAINT "admins_tenants_tenant_code_fkey" FOREIGN KEY ("tenant_code") REFERENCES "tenants"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_tenant_code_fkey" FOREIGN KEY ("tenant_code") REFERENCES "tenants"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_details" ADD CONSTRAINT "ticket_details_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_booking_schedules" ADD CONSTRAINT "ticket_booking_schedules_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tenant_code_fkey" FOREIGN KEY ("tenant_code") REFERENCES "tenants"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets_holidays" ADD CONSTRAINT "tickets_holidays_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets_holidays" ADD CONSTRAINT "tickets_holidays_holiday_id_fkey" FOREIGN KEY ("holiday_id") REFERENCES "holidays"("id") ON DELETE CASCADE ON UPDATE CASCADE;