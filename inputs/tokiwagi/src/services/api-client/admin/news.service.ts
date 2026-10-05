import axios from "axios";

import { IResponse } from "models/Response";

const APIs = {
  NEWS: "/api/admin/news",
};

export const fetchNews = async () => {
  const { data }: { data: IResponse } = await axios.get(APIs.NEWS);
  return data.data;
};

export const fetchNewsById = async (id: number) => {
  const { data }: { data: IResponse } = await axios.get(`${APIs.NEWS}/${id}`);
  return data.data;
};

export const createNews = async (values) => {
  const { data }: { data: IResponse } = await axios.post(APIs.NEWS, values);
  return data;
};

export const updateNews = async (values) => {
  const { data }: { data: IResponse } = await axios.put(`${APIs.NEWS}/${values.id}`, values);
  return data;
};

export const deleteNewsById = async (id: number) => {
  const { data }: { data: IResponse } = await axios.delete(`${APIs.NEWS}/${id}`);
  return data;
};
