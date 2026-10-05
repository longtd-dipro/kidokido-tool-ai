import { AdminTenant, AppSetting, PrismaClient, Tenant, User } from "@prisma/client";

import { disclaimerSeeds } from "../prisma/seeds/disclaimers";

import { appSettingSeeds } from "./seeds/app-settings";
import { emailSettingSeeds } from "./seeds/email-settings";
import { tenantSeeds } from "./seeds/tenants";
import { userSeeds } from "./seeds/users";
import { adminsTenantsSeeds } from "./seeds/admins_tenants";
import { gmoSettingSeeds } from "./seeds/gmo-settings";

const prisma = new PrismaClient();

async function main() {
  // Seed Email Settings
  for (let emailSettingSeed of emailSettingSeeds) {
    await prisma.emailSetting.create({
      data: emailSettingSeed,
    });
  }
  // Seed App Settings
  for (let appSettingSeed of appSettingSeeds) {
    await prisma.appSetting.create({
      data: appSettingSeed as AppSetting,
    });
  }
  // Seed Tenants
  for (let tenantSeed of tenantSeeds) {
    await prisma.tenant.create({
      data: tenantSeed as Tenant,
    });
  }
  // Seed Users
  for (let userSeed of userSeeds) {
    await prisma.user.create({
      data: userSeed as User,
    });
  }
  // AdminTenants
  for (let adminsTenantsSeed of adminsTenantsSeeds) {
    await prisma.adminTenant.create({
      data: adminsTenantsSeed as AdminTenant,
    });
  }
  // Disclaimers
  for (let disclaimerSeed of disclaimerSeeds) {
    await prisma.disclaimer.create({
      data: disclaimerSeed,
    });
  }
  // GMO Settings
  for (let gmoSettingSeed of gmoSettingSeeds) {
    await prisma.gMOSetting.create({
      data: gmoSettingSeed,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
