/*
  Warnings:

  - A unique constraint covering the columns `[shop_id]` on the table `gmo_settings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "gmo_settings_shop_id_key" ON "gmo_settings"("shop_id");
