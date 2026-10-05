import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { POS_API_ERROR_MESSAGE, POS_API_RESULT_CODE } from "constants/pos-api-result";
import checkPOSAuth from "libs/middleware/checkPOSAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { POSResponse } from "models/Response";
import withPOSApiValidation from "libs/middleware/withPOSApiValidation";
import { barCodeSchema } from "libs/validation/posApiSchema";
import { BARCODE_LENGTH } from "constants/booking";
import { withLogging } from "libs/middleware/withLogging";

const validate = withPOSApiValidation({
  schema: barCodeSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch }).use(checkPOSAuth);

handler.post(validate(handler), async (req: NextApiRequest, res: NextApiResponse<POSResponse>) => {
  const barCode = req.body.barCode as string;

  if (!checkValidBarCodeFormat(barCode)) {
    return res.status(200).json({ resultCode: POS_API_RESULT_CODE.E00000400, error: POS_API_ERROR_MESSAGE.INVALID_BAR_CODE });
  }

  res.status(200).json({ resultCode: POS_API_RESULT_CODE.E00000000 });
});

export default withLogging(handler);

const checkValidBarCodeFormat = (barCode: string) => {
  const isNumericCode = /^\d+$/.test(barCode);
  return barCode.length === BARCODE_LENGTH && isNumericCode;
};
