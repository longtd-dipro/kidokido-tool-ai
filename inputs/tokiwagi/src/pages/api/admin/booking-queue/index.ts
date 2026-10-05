import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import checkAuth from "libs/middleware/checkAuth";
import roleAuth from "libs/middleware/roleAuth";
import { ROLE } from "constants/common";
import { Booking } from "models/Entity";
import withValidation from "libs/middleware/withValidation";
import { updateWaitingOrderSchema } from "libs/validation/schemas";

const validate = withValidation({
  schema: updateWaitingOrderSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch }).use(checkAuth).use(roleAuth([ROLE.ADMIN]));

handler.post(validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const bookingQueue = req.body as Booking[];

  const [ updatedQueue ] = await prisma.$transaction(
    bookingQueue?.map((item) =>
      prisma.booking.update({
        where: {
          id: item.id
        },
        data: {
          waitingOrder: item.waitingOrder
        }
      })
    )
  );

  res.status(200).json({ data: updatedQueue });
});

export default handler;
