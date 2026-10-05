import { Role } from "@prisma/client";
import axios from "axios";

import { IResponse } from "models/Response";

const APIs = {
  STAFFS: "/api/admin/staffs",
  COUNT_STAFFS: "/api/admin/staffs/count",
};

export const createStaff = async (values: CreateStaffPayload) => {
  const { data }: { data: IResponse } = await axios.post(APIs.STAFFS, values);
  return data;
};

export const fetchStaffs = async (params?: FetchStaffsParams) => {
  const { data }: { data: IResponse } = await axios.get(APIs.STAFFS, { params });
  return data.data;
};

export const countStaffs = async (params?: CountStaffsParams) => {
  const { data }: { data: IResponse } = await axios.get(APIs.COUNT_STAFFS, { params });
  return data.data;
};

export const deleteStaffById = async (id: string) => {
  const { data }: { data: IResponse } = await axios.delete(`${APIs.STAFFS}/${id}`);
  return data;
};

export const fetchStaffById = async (id: string) => {
  const { data }: { data: IResponse } = await axios.get(`${APIs.STAFFS}/${id}`);
  return data.data;
};

export const updateStaff = async (id: string, values: UpdateStaffPayload) => {
  const { data }: { data: IResponse } = await axios.put(`${APIs.STAFFS}/${id}`, values);
  return data;
};

type CreateStaffPayload = {
  id: string;
  password: string;
  lastName: string;
  firstName: string;
  lastNameFurigana: string;
  firstNameFurigana: string;
  tenantCode: string;
  role: Role;
};

type FetchStaffsParams = {
  limit?: number;
  page?: number;
  name?: string;
  tenantCode?: string;
};

type CountStaffsParams = {
  name?: string;
  tenantCode?: string;
};

type UpdateStaffPayload = {
  id?: string;
  password?: string;
  lastName?: string;
  firstName?: string;
  lastNameFurigana?: string;
  firstNameFurigana?: string;
  tenantCode?: string;
  role?: Role;
};
