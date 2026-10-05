import { NextApiRequest, NextApiResponse } from "next";

import { IResponse } from "models/Response";
import { logRequest } from "utils/server/request";

export const withLogging = (handler) => {
  return async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
    logRequest(req);
    return handler(req, res);
  };
};
