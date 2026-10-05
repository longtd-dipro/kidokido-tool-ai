import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import { checkExistingEmailIncludeDeleted } from "utils/auth";
import prisma from "utils/db";
import { ERROR_MESSAGES } from "constants/errors";

const handler = nc({ onError, onNoMatch });

handler.post(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Check if the email is already taken and verified or not  
    return res.status(200).json({ // If taken, return the appropriate response with an error message 
      data: {
        existing: true,
        verified: !!user.emailVerified,
        message: user.emailVerified ? ERROR_MESSAGES.EMAIL_ALREADY_TAKEN : ERROR_MESSAGES.EMAIL_ALREADY_TAKEN_BUT_NOT_VERIFY
      }
    });

  } else if (await checkExistingEmailIncludeDeleted(email)) {
    // If not taken, check if it was previously deleted and return the appropriate response with an error message  
    return res.status(200).json({ data: { existing: true, verified: true, message: ERROR_MESSAGES.EMAIL_ALREADY_TAKEN_AND_DELETED } });
  } else { // If neither taken nor deleted before, return a response indicating that it's available to use  
    return res.status(200).json({ data: { existing: false } });
  }
});

export default handler;
