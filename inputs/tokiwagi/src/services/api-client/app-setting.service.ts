import axios from "axios";

import { IResponse } from "models/Response";

const APIs = {
  APP_SETTINGS: "/api/app-settings",
};

export const fetchAppSettingByKey = async (settingKey: string) => {
  const { data }: { data: IResponse } = await axios.get(`${APIs.APP_SETTINGS}/${settingKey}`);
  return data.data;
};
