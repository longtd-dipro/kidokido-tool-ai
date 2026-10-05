import axios from "axios";

import { IResponse } from "models/Response";

const APIs = {
  PASSWORD_CONFIRMATION: "/api/admin/password-confirmation",
  ADMIN_CREDENTIALS_CONFIRMATION: "/api/admin/admin-credentials-confirmation",
  CREDENTIALS_CONFIRMATION: "/api/admin/credentials-confirmation",
};

export const confirmAdminPassword = async (payload) => {
  const { data }: { data: IResponse } = await axios.post(APIs.PASSWORD_CONFIRMATION, payload);
  return data.data;
};

export const confirmAdminCredentials = async (payload: ConfirmAdminCredentialsPayload) => {
  const { data }: { data: IResponse } = await axios.post(APIs.ADMIN_CREDENTIALS_CONFIRMATION, payload);
  return data.data;
};

export const confirmCredentials = async (payload: ConfirmCredentialsPayload) => {
  const { data }: { data: IResponse } = await axios.post(APIs.CREDENTIALS_CONFIRMATION, payload);
  return data.data;
};

export type ConfirmAdminCredentialsPayload = {
  email: string;
  password: string;
};

export type ConfirmCredentialsPayload = {
  idOrEmail: string;
  password: string;
};
