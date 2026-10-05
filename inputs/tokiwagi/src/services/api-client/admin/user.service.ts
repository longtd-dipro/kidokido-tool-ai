import axios from "axios";

import { IResponse } from "models/Response";

const APIs = {
  USERS: "/api/admin/users",
  COUNT_USERS: "/api/admin/users/count"
};

export const fetchUsers = async (params?) => {
  const { data }: { data: IResponse } = await axios.get(APIs.USERS, { params: params });
  return data.data;
};

export const fetchUserById = async (id: number) => {
  const { data }: { data: IResponse } = await axios.get(`${APIs.USERS}/${id}`);
  return data.data;
};

export const createUser = async (values) => {
  const { data }: { data: IResponse } = await axios.post(APIs.USERS, values);
  return data;
};

export const updateUser = async (id: number, payload) => {
  const { data }: { data: IResponse } = await axios.put(`${APIs.USERS}/${id}`, payload);
  return data;
};

export const deleteUserById = async (id: number) => {
  const { data }: { data: IResponse } = await axios.delete(`${APIs.USERS}/${id}`);
  return data;
};

export const countUsers = async (params?) => {
  const { data }: { data: IResponse } = await axios.get(APIs.COUNT_USERS, { params: params });
  return data.data;
};