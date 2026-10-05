import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import withValidation from "libs/middleware/withValidation";
import { sendPreviewEmailSchema } from "libs/validation/emailSettingSchema";
import { IResponse } from "models/Response";
import EmailService from "services/email.service";
import { FAKE_BARCODE_IMAGE_EMAIL_DATA, FAKE_EMAIL_DATA, FAKE_MONTHLY_BOOKING_EMAIL_DATA } from "constants/email-template";
import { EMAIL_SETTING_KEY } from "constants/settings";
import { checkIsRenderBarCodeImage } from "utils/email-setting";

const validate = withValidation({
  schema: sendPreviewEmailSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.SUPER_ADMIN]));

handler.post(validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { emailTitle, emailKey, content, email } = req.body;

  let data = emailKey === EMAIL_SETTING_KEY.MONTHLY_BOOKING_SUCCESSFUL ? FAKE_MONTHLY_BOOKING_EMAIL_DATA : FAKE_EMAIL_DATA;

  if (checkIsRenderBarCodeImage(emailKey)) {
    data = { ...data, ...FAKE_BARCODE_IMAGE_EMAIL_DATA };
  }

  EmailService.sendEmailWithPredefinedContent([email], { content: content, title: emailTitle }, data);

  res.status(200).json({ data: null });
});

export default handler;
