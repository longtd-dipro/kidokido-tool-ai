import axios from "axios";

import { IResponse } from "models/Response";

const APIs = {
  SEARCH_CREDIT_CARD: "/api/admin/credit-cards/search",
};

export const fetchCreditCardAdmin = async (userId: number) => {
  const { data }: { data: IResponse } = await axios.get(`${APIs.SEARCH_CREDIT_CARD}/${userId}`);
  return data.data;
};
