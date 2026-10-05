import { NextApiRequest, NextApiResponse } from "next";

import { IResponse } from "models/Response";
import logger from "utils/logger";
import { ERROR_MESSAGES } from "constants/errors";
import { serverConfig } from "config";
import { POS_API_RESULT_CODE } from "constants/pos-api-result";

const onError = (err: Error, req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const POS_API_PREFIX = "/api/pos";
  logger.error(err.stack || err.message);
  const error = serverConfig.debug ? err.message : ERROR_MESSAGES.SOMETHING_WENT_WRONG;
  const additionalResults = req.url?.includes(POS_API_PREFIX) ? { resultCode: POS_API_RESULT_CODE.E00000400 } : {};
  res.status(500).json({ ...additionalResults, error: error });
};

export default onError;
