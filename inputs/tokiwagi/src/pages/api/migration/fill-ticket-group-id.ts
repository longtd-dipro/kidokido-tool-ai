import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { isMasterMonthlyTicket } from "utils/booking";

const handler = nc({ onError, onNoMatch });

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const unfilledGroupIdTickets = await prisma.ticket.findMany({
    where: {
      groupId: null
    },
  });

  for (let i = 0; i < unfilledGroupIdTickets.length; i++) {
    const ticket = unfilledGroupIdTickets[i];
    if (!ticket.masterTicketId) {
      // Fill groupId for master monthly ticket and other ticket types but slave monthly ticket
      const groupId = ticket.createdAt.getTime().toString();
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { groupId }
      });

      // Fill groupId for slave monthly tickets
      if (isMasterMonthlyTicket(ticket)) {
        const slaveMonthlyTickets = unfilledGroupIdTickets.filter(t => t.masterTicketId === ticket.id);
        for (let j = 0; j < slaveMonthlyTickets.length; j++) {
          const slaveMonthlyTicket = slaveMonthlyTickets[j];
          await prisma.ticket.update({
            where: { id: slaveMonthlyTicket.id },
            data: { groupId: `${groupId}_${new Date().getTime().toString()}` }
          });
        }
      }
    }
  }

  res.status(200).json({
    data: unfilledGroupIdTickets.length,
  });
});

export default handler;
