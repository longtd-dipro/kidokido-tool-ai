import axios from "axios";

import { IResponse } from "models/Response";
import { Tenant } from "models/Entity";

const APIs = {
  TENANTS: "/api/admin/tenants",
  COUNT_TENANTS: "/api/admin/tenants/count",
};

export const fetchTenants = async (params?) => {
  const { data }: { data: IResponse } = await axios.get(APIs.TENANTS, { params: params });
  return data.data as Tenant[];
};

export const fetchTenantByCode = async (tenantCode: string) => {
  const { data }: { data: IResponse } = await axios.get(`${APIs.TENANTS}/${tenantCode}`);
  return data.data;
};

export const createTenant = async (values: Tenant) => {
  const { data }: { data: IResponse } = await axios.post(APIs.TENANTS, values);
  return data.data;
};

export const updateTenant = async (values: Tenant) => {
  const { data }: { data: IResponse } = await axios.put(`${APIs.TENANTS}/${values.code}`, values);
  return data.data;
};

export const updateTenantImageUrl = async (tenantCode, imageUrl: string) => {
  const { data }: { data: IResponse } = await axios.patch(`${APIs.TENANTS}/${tenantCode}`, { imageUrl });
  return data.data;
};

export const deleteTenant = async (code: String) => {
  const { data }: { data: IResponse } = await axios.delete(`${APIs.TENANTS}/${code}`);
  return data.data;
};

export const countTenants = async (params?) => {
  const { data }: { data: IResponse } = await axios.get(APIs.COUNT_TENANTS, { params: params });
  return data.data;
};
