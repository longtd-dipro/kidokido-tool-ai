import axios from "axios";

import { IResponse } from "models/Response";

type FetchNewsParams = {
  page: number;
  limit: number;
  sort_by: string;
};

const APIs = {
  NEWS: "/api/news",
};

export const fetchNews = async (params: FetchNewsParams) => {
  const { data }: { data: IResponse } = await axios.get(APIs.NEWS, { params });
  return data.data;
};
