import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";

const handler = nc({ onError, onNoMatch });

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  let applyNewDiscountSettingCount = 0;
  let alreadyAppliedNewDiscountSettingCount = 0;
  const enableDiscountTickets = await prisma.ticketDetail.findMany({
    where: { enableDiscount: true },
  });

  const discountTicketIds = enableDiscountTickets.map(ticketDetail => ticketDetail.ticketId);

  const existingDiscountSettingTicketIdsMap = (await prisma.ticketDiscountSetting.findMany({
    where: { ticketId: { in: discountTicketIds }, },
  })).map(setting => setting.ticketId).reduce((acc, ticketId) => {
    acc[ticketId] = true;
    return acc;
  }, {});

  // Apply new discount for un-apply ones
  for (let i = 0; i < enableDiscountTickets.length; i++) {
    const enableDiscountTicket = enableDiscountTickets[i];
    if (!existingDiscountSettingTicketIdsMap[enableDiscountTicket.ticketId]) {
      await prisma.ticketDiscountSetting.create({
        data: {
          ticketId: enableDiscountTicket.ticketId,
          setting: [
            {
              "threshold": 2,
              "adultDiscountAmount": +enableDiscountTicket.discountAdultAmount,
              "childDiscountAmount": +enableDiscountTicket.discountChildAmount
            }
          ],
          hourlyExtraTimeSetting: {},
        },
      });

      applyNewDiscountSettingCount++;
    } else {
      alreadyAppliedNewDiscountSettingCount++;
    }
  }

  res.status(200).json({
    data: {
      appliedCount: applyNewDiscountSettingCount,
      alreadyAppliedCount: alreadyAppliedNewDiscountSettingCount,
    },
  });
});

export default handler;
