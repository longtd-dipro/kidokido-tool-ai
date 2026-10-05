-- CreateTable
CREATE TABLE "users_tenants_favorites" (
    "user_id" INTEGER NOT NULL,
    "tenant_code" TEXT NOT NULL,

    CONSTRAINT "users_tenants_favorites_pkey" PRIMARY KEY ("user_id","tenant_code")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_tenants_favorites_user_id_key" ON "users_tenants_favorites"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenants_favorites_tenant_code_key" ON "users_tenants_favorites"("tenant_code");

-- AddForeignKey
ALTER TABLE "users_tenants_favorites" ADD CONSTRAINT "users_tenants_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_tenants_favorites" ADD CONSTRAINT "users_tenants_favorites_tenant_code_fkey" FOREIGN KEY ("tenant_code") REFERENCES "tenants"("code") ON DELETE CASCADE ON UPDATE CASCADE;
