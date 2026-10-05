import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import withValidation from "libs/middleware/withValidation";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import checkAuth from "libs/middleware/checkAuth";
import roleAuth from "libs/middleware/roleAuth";
import { ROLE } from "constants/common";
import { compileEmailContent } from "utils/email";
import { emailPreviewSchema } from "libs/validation/emailSettingSchema";
import { FAKE_EMAIL_DATA, FAKE_MONTHLY_BOOKING_EMAIL_DATA } from "constants/email-template";
import { EMAIL_SETTING_KEY } from "constants/settings";

const validate = withValidation({
  schema: emailPreviewSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.SUPER_ADMIN]));

handler.post(validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { content, emailKey } = req.body;

  const data = emailKey === EMAIL_SETTING_KEY.MONTHLY_BOOKING_SUCCESSFUL ? FAKE_MONTHLY_BOOKING_EMAIL_DATA : FAKE_EMAIL_DATA;

  const html = compileEmailContent(content, { data });
  res.status(200).json({ data: html });
});

export default handler;
