import prisma from "utils/db";

export const getAppSettingByKey = async (settingKey: string) => {
  const appSetting = (await prisma.appSetting.findUnique({
    where: {
      settingKey,
    },
  })).value;
  return appSetting;
};
