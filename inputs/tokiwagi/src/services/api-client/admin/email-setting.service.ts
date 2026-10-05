import axios from "axios";

import { IResponse } from "models/Response";

const APIs = {
  EMAIL_SETTINGS: "/api/admin/email-settings",
  PREVIEW_EMAIL: "/api/admin/email-settings/preview",
  SEND_PREVIEW_EMAIL: "/api/admin/email-settings/send-preview-email",
};

export const fetchEmailSettings = async () => {
  const { data }: { data: IResponse } = await axios.get(APIs.EMAIL_SETTINGS);
  return data.data;
};

export const fetchEmailSettingByKey = async (key: string) => {
  const { data }: { data: IResponse } = await axios.get(`${APIs.EMAIL_SETTINGS}/${key}`);
  return data.data;
};

export const createEmailSetting = async (values) => {
  const { data }: { data: IResponse } = await axios.post(APIs.EMAIL_SETTINGS, values);
  return data;
};

export const updateEmailSetting = async (values) => {
  const { data }: { data: IResponse } = await axios.put(`${APIs.EMAIL_SETTINGS}/${values.emailKey}`, values);
  return data;
};

export const deleteEmailSetting = async (emailKey: string) => {
  const { data }: { data: IResponse } = await axios.delete(`${APIs.EMAIL_SETTINGS}/${emailKey}`);
  return data;
};

export const getPreviewEmailContent = async (content: string, emailKey: string) => {
  const { data }: { data: IResponse } = await axios.post(`${APIs.PREVIEW_EMAIL}`, { content, emailKey });
  return data.data;
};

export const sendPreviewEmail = async (payload: SendPreviewEmailPayload) => {
  const { data }: { data: IResponse } = await axios.post(`${APIs.SEND_PREVIEW_EMAIL}`, payload);
  return data.data;
};

type SendPreviewEmailPayload = {
  emailKey: string;
  emailTitle: string;
  content: string;
  email: string;
};
