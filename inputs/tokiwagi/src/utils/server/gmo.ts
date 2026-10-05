import { serverConfig } from "config";
import prisma from "utils/db";
import { GMOAccount } from "utils/gmo";

export const getGMOAccountByTenant = async (tenantCode: string): Promise<GMOAccount> => {
  const gmoSettings = await prisma.gMOSetting.findMany({ include: { Tenant: true } });

  const gmoSetting = gmoSettings.find((item) => item.Tenant.find((tenant) => tenant?.code === tenantCode));

  return {
    shop_id: gmoSetting?.shopId || serverConfig.gmo.shop_id,
    shop_pass: gmoSetting?.shopPass || serverConfig.gmo.shop_pass,
    site_id: serverConfig.gmo.site_id,
    site_pass: serverConfig.gmo.site_pass,
  };
};

export const checkHasAssociatedTenant = async (gmoSettingId: number) => {
  const gmoSetting = await prisma.gMOSetting.findUnique({
    where: {
      id: gmoSettingId,
    },
    include: {
      Tenant: true,
    },
  });

  return !!gmoSetting.Tenant.length;
};

export const checkExistingGMOSetting = async (shopId: string) => {
  const existingGMOSetting = await prisma.gMOSetting.findUnique({
    where: {
      shopId,
    },
  });

  return !!existingGMOSetting;
};
