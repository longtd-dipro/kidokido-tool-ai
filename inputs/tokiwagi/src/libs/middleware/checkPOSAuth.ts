import { NextApiRequest, NextApiResponse } from "next";

import { POS_API_ERROR_MESSAGE, POS_API_RESULT_CODE } from "constants/pos-api-result";
import { POSResponse } from "models/Response";
import { serverConfig } from "config";

const checkPOSAuth = async (req: NextApiRequest, res: NextApiResponse<POSResponse>, next: Function) => {
  const apiKey = req.headers["api-key"];

  if (!apiKey) {
    return res.status(200).json({ resultCode: POS_API_RESULT_CODE.E00000401, error: POS_API_ERROR_MESSAGE.API_KEY_NOT_FOUND });
  }

  if (apiKey !== serverConfig.pos.apiKey) {
    return res.status(200).json({ resultCode: POS_API_RESULT_CODE.E00000401, error: POS_API_ERROR_MESSAGE.INVALID_API_KEY });
  }

  next();
};

export default checkPOSAuth;
