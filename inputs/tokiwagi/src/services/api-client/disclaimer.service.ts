import axios from "axios";

import { Disclaimer } from "models/Entity";
import { IResponse } from "models/Response";

const APIs = {
  DISCLAIMERS: "/api/disclaimers",
};

export const fetchDisclaimers = async () => {
  const { data }: { data: IResponse<Disclaimer[]> } = await axios.get(APIs.DISCLAIMERS);
  return data.data;
};
