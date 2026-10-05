import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { IResponse } from "models/Response";
import { saveCard, saveMember, searchMember } from "services/gmo.service";
import { parseGMOResponse } from "utils/gmo";
import { CREDIT_CARD_ERRORS, TRANSACTION_ERRORS } from "constants/booking";
import EmailService from "services/email.service";
import { EMAIL_SETTING_KEY } from "constants/settings";
import prisma from "utils/db";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.USER]));

handler.post(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { user } = req;
  const { token, cardSeq, shouldNotify } = req.body;

  const { MemberID } = await searchMember(user.id);

  if (!MemberID) {
    await saveMember(user.id);
  }

  const data = await saveCard(user.id, token, cardSeq);
  const results = parseGMOResponse(data);
  if (results.ErrInfo) {
    res.status(400).json({ error: TRANSACTION_ERRORS[results.ErrInfo] || CREDIT_CARD_ERRORS[results.ErrInfo] });
    return;
  }

  if (shouldNotify) {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (dbUser) {
      EmailService.sendEmail(dbUser.email, EMAIL_SETTING_KEY.USER_UPDATED_CREDIT_CARD, {
        name: dbUser.name,
      });
    }
  }

  res.status(200).json({ data: results });
});

export default handler;
