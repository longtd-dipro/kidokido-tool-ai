import axios from "axios";

import { IResponse } from "models/Response";

const APIs = {
  SIGNUP: "/api/auth/signup",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  UPDATE_PASSWORD: "/api/auth/update-password",
  CHANGE_PASSWORD: "/api/auth/change-password",
  RESET_PASSWORD: "/api/auth/reset-password",
  VERIFY_TOKEN: "/api/auth/verify",
  CHANGE_EMAIL: "/api/auth/change-email",
  RESEND_VERIFICATION_EMAIL: "/api/auth/resend-verification-email",
  REQUEST_UNLOCK_ACCOUNT: "/api/auth/request-unlock-account",
  UNLOCK_ACCOUNT: "/api/auth/unlock-account",
  CHECK_ADMIN_CREDENTIALS: "/api/auth/check-admin-credentials",
  SECURITY_QUESTIONS: "/api/auth/security-questions",
};

export const signup = async (values) => {
  const { data }: { data: IResponse } = await axios.post(APIs.SIGNUP, values);
  return data.data;
};

export const forgotPassword = async (values) => {
  const { data }: { data: IResponse } = await axios.post(APIs.FORGOT_PASSWORD, values);
  return data.data;
};

export const updatePassword = async (values) => {
  const { data }: { data: IResponse } = await axios.post(APIs.UPDATE_PASSWORD, values);
  return data.data;
};

export const resetPassword = async (values) => {
  const { data }: { data: IResponse } = await axios.post(APIs.RESET_PASSWORD, values);
  return data.data;
};

export const changePassword = async (values) => {
  const { data }: { data: IResponse } = await axios.post(APIs.CHANGE_PASSWORD, values);
  return data.data;
};

export const verifyToken = async (token: string) => {
  const { data }: { data: IResponse } = await axios.get(`${APIs.VERIFY_TOKEN}/${token}`);
  return data.data;
};

export const changeEmail = async (values) => {
  const { data }: { data: IResponse } = await axios.put(APIs.CHANGE_EMAIL, values);
  return data.data;
};

export const resendVerificationEmail = async (values) => {
  const { data }: { data: IResponse } = await axios.post(APIs.RESEND_VERIFICATION_EMAIL, values);
  return data.data;
};

export const requestUnlockAccount = async (values) => {
  const { data }: { data: IResponse } = await axios.post(APIs.REQUEST_UNLOCK_ACCOUNT, values);
  return data.data;
};

export const unlockAccount = async (values) => {
  const { data }: { data: IResponse } = await axios.post(APIs.UNLOCK_ACCOUNT, values);
  return data.data;
};

export const checkCredentials = async (values) => {
  const { data }: { data: IResponse } = await axios.post(APIs.CHECK_ADMIN_CREDENTIALS, values);
  return data.data;
};

export const fetchSecurityQuestions = async () => {
  const { data }: { data: IResponse } = await axios.get(APIs.SECURITY_QUESTIONS);
  return data.data;
};
