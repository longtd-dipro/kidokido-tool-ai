import axios from "axios";

import { Tenant } from "models/Entity";
import { IResponse } from "models/Response";

const APIs = {
  TENANTS: "/api/tenants",
  TENANTS_COUNT: "/api/tenants/count",
  TENANTS_VACANCIES: "/api/tenant-vacancies",

};

export const fetchTenants = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  allowInactiveTenantCode?: boolean;
}) => {
  const { data }: { data: IResponse<Tenant[]> } = await axios.get(APIs.TENANTS, { params });
  return data.data;
};

export const fetchTotalTenants = async (params?: {
  search?: string;
}) => {
  const { data }: { data: IResponse<number> } = await axios.get(APIs.TENANTS_COUNT, { params });
  return data.data;
};

export const findTenant = async (value: String) => {
  const { data }: { data: IResponse } = await axios.get(`${APIs.TENANTS}/${value}`);
  return data.data;
};

export const fetchTenantVacancies = async (payload) => {
  const { data }: { data: IResponse } = await axios.post(`${APIs.TENANTS_VACANCIES}`, payload);
  return data.data;
};
