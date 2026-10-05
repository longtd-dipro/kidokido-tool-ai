import axios from "axios";

import { IResponse } from "models/Response";

const APIs = {
  APP_SETTINGS: "/api/admin/app-settings"
};

export const fetchAppSettings = async () => {
  const { data }: { data: IResponse } = await axios.get(APIs.APP_SETTINGS);
  return data.data;
};

export const fetchAppSettingByKey = async (settingKey: string) => {
  const { data }: { data: IResponse } = await axios.get(`${APIs.APP_SETTINGS}/${settingKey}`);
  return data.data;
};

export const createAppSetting = async (values) => {
  const { data }: { data: IResponse } = await axios.post(APIs.APP_SETTINGS, values);
  return data;
};

export const updateAppSetting = async (values) => {
  const { data }: { data: IResponse } = await axios.put(`${APIs.APP_SETTINGS}/${values.settingKey}`, values);
  return data;
};

export const deleteAppSetting = async (settingKey: string) => {
  const { data }: { data: IResponse } = await axios.delete(`${APIs.APP_SETTINGS}/${settingKey}`);
  return data;
};
