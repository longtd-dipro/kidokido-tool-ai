import axios from "axios";

import { GMOSettingFormData } from "components/GMOSetting/CreateOrUpdateGMOSetting";
import { IResponse } from "models/Response";

const APIs = {
  GMO_SETTINGS: "/api/admin/gmo-settings",
  CHECK_HAS_ONLINE_BOOKING: "/api/admin/gmo-settings/check-has-online-booking",
};

export const fetchGMOSettings = async () => {
  const { data }: { data: IResponse } = await axios.get(APIs.GMO_SETTINGS);
  return data.data;
};

export const fetchGMOSettingById = async (id: number) => {
  const { data }: { data: IResponse } = await axios.get(`${APIs.GMO_SETTINGS}/${id}`);
  return data.data;
};

export const createGMOSetting = async (values: GMOSettingFormData) => {
  const { data }: { data: IResponse } = await axios.post(APIs.GMO_SETTINGS, values);
  return data;
};

export const updateGMOSetting = async (id: number, values: GMOSettingFormData) => {
  const { data }: { data: IResponse } = await axios.put(`${APIs.GMO_SETTINGS}/${id}`, values);
  return data;
};

export const deleteGMOSetting = async (id: number) => {
  const { data }: { data: IResponse } = await axios.delete(`${APIs.GMO_SETTINGS}/${id}`);
  return data;
};
