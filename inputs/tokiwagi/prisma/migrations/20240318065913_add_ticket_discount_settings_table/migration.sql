-- CreateTable
CREATE TABLE "ticket_discount_settings" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "setting" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_discount_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ticket_discount_settings_ticket_id_key" ON "ticket_discount_settings"("ticket_id");

-- AddForeignKey
ALTER TABLE "ticket_discount_settings" ADD CONSTRAINT "ticket_discount_settings_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
