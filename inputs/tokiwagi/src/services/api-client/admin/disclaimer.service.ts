import axios from "axios";

import { Disclaimer } from "models/Entity";
import { IResponse } from "models/Response";

const APIs = {
  DISCLAIMERS: "/api/admin/disclaimers",
};

export const fetchDisclaimers = async () => {
  const { data }: { data: IResponse<Disclaimer[]> } = await axios.get(APIs.DISCLAIMERS);
  return data.data;
};

export const upsertDisclaimers = async (payload) => {
  const { data }: { data: IResponse<Disclaimer[]> } = await axios.post(APIs.DISCLAIMERS, payload);
  return data.data;
};
