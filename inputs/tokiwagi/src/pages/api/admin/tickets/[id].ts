import { Role, Ticket as PrimaTicket, TicketType } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { DEFAULT_TRANSACTION_TIMEOUT, ROLE } from "constants/common";
import { EMAIL_SETTING_KEY } from "constants/settings";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import withValidation from "libs/middleware/withValidation";
import { ticketJsonDataSchema } from "libs/validation/ticketSchema";
import { IResponse } from "models/Response";
import EmailService from "services/email.service";
import prisma from "utils/db";
import { MESSAGES } from "constants/messages";
import { isMasterMonthlyTicket } from "utils/booking";
import { getSlaveMonthlyTickets, hasBooking } from "utils/server/ticket";
import { Ticket } from "models/Entity";
import { diffObicCodes, backfillObicCodesForTicket } from "utils/server/obicCodes";

const validate = withValidation({
  schema: ticketJsonDataSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.SUPER_ADMIN, ROLE.ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const id = +req.query.id;
  const includeSlaveTickets = req.query?.includeSlaveTickets === "true";
  const includeHasBooking = req.query?.includeHasBooking === "true";
  const ticket: Ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      TicketDetail: true,
      Tenant: true,
      TicketBookingSchedule: { where: { deleted: false } },
      TicketDiscountSetting: true,
    },
  });

  if (ticket && isMasterMonthlyTicket(ticket) && includeSlaveTickets) {
    const slaveTickets = await getSlaveMonthlyTickets(ticket.id, { includeTenant: true });
    ticket.slaveTickets = slaveTickets;
    if (includeHasBooking) {
      for (let i = 0; i < slaveTickets.length; i++) {
        const isTicketHasBooking = await hasBooking(slaveTickets[i].id);
        ticket.slaveTickets[i].hasBooking = isTicketHasBooking;
      }
    }
  }

  res.status(200).json({ data: ticket });
});

handler.put(validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const id = +req.query.id;

  const oldTicket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      TicketDetail: true,
      TicketBookingSchedule: { where: { deleted: false } },
      TicketDiscountSetting: true,
    },
  });

  const { slaveTenantCodes, tenantCode, masterTicketId, TicketTenant, id: ticketId, adultTicketCode, childTicketCode, ...payload } = req.body;
  const convertNumberAdultTicketCode = +adultTicketCode;
  const convertNumberChildTicketCode = +childTicketCode;

  const data = {
    ...payload,
    tenantCode: isMasterMonthlyTicket(payload) ? null : tenantCode,
    masterTicketId: isMasterMonthlyTicket(payload) ? null : masterTicketId,
    adultTicketCode: convertNumberAdultTicketCode,
    childTicketCode: convertNumberChildTicketCode,
    TicketDetail: {
      update: req.body.TicketDetail,
    },
    TicketDiscountSetting: {
      upsert: {
        update: req.body.TicketDiscountSetting,
        create: req.body.TicketDiscountSetting
      }
    },
  };

  const updateTicket = await prisma.$transaction(async (tx) => {
    const updatedTicket = await tx.ticket.update({
      include: {
        TicketDetail: true,
        TicketBookingSchedule: { where: { deleted: false } },
        TicketDiscountSetting: true,
      },
      where: {
        id,
      },
      data,
    });
    if (isMasterMonthlyTicket(updatedTicket)) {
      const slaveMonthlyTickets = await getSlaveMonthlyTickets(updatedTicket.id);
      const currentSlaveTenantCodes = slaveMonthlyTickets.map(ticket => ticket.tenantCode);
      const willRemoveTenantCodes = currentSlaveTenantCodes.filter(tenantCode => !slaveTenantCodes.includes(tenantCode));
      const willAddTenantCodes = slaveTenantCodes.filter(tenantCode => !currentSlaveTenantCodes.includes(tenantCode));

      // remove unused slave tickets
      for (let i = 0; i < willRemoveTenantCodes.length; i++) {
        const willRemoveTenantCode = willRemoveTenantCodes[i];
        const willRemoveTicketIds = slaveMonthlyTickets.filter(ticket => ticket.tenantCode == willRemoveTenantCode).map(ticket => ticket.id);
        for (let j = 0; j < willRemoveTicketIds.length; j++) {
          const willRemoveTicketId = willRemoveTicketIds[j];
          const isTicketHasBooking = await hasBooking(willRemoveTicketId);
          if (isTicketHasBooking) {
            throw Error(MESSAGES.CANNOT_REMOVE_TICKET);
          } else {
            await tx.ticket.delete({
              where: {
                id: willRemoveTicketId,
              },
            });
          }
        }
      }

      // add new slave tickets
      for (let i = 0; i < willAddTenantCodes.length; i++) {
        const { id: _id, ...insertData } = data;
        const newSlaveTicketData: PrimaTicket = {
          ...insertData,
          tenantCode: willAddTenantCodes[i],
          type: TicketType.Monthly,
          masterTicketId: id,
          groupId: `${updatedTicket.groupId}_${new Date().getTime().toString()}`,
          videoUrl: updatedTicket.videoUrl,
          TicketDetail: {
            create: req.body.TicketDetail,
          },
          TicketDiscountSetting: {
            create: req.body.TicketDiscountSetting,
          },
        };
        await tx.ticket.create({ data: newSlaveTicketData });
      }
    }

    return updatedTicket;
  }, {
    timeout: DEFAULT_TRANSACTION_TIMEOUT,
  });

  if (req.user.role === ROLE.ADMIN) {
    const superAdminUser = await prisma.user.findFirst({ where: { role: Role.SuperAdmin }, orderBy: { id: "asc" } });
    superAdminUser.email && EmailService.sendEmail(superAdminUser.email, EMAIL_SETTING_KEY.ADMIN_UPDATED_TICKET_NOTIFICATION, { ticket: updateTicket });
  }

  if (oldTicket && updateTicket) {
    const changes = diffObicCodes(oldTicket, updateTicket);
    const filledTransitions = changes.filter((c) => c.changeKind === "empty-to-filled");
    if (filledTransitions.length > 0) {
      await backfillObicCodesForTicket(id, filledTransitions);
    }
  }
  res.status(200).json({ data: { ticket: updateTicket } });
});

handler.delete(roleAuth([ROLE.SUPER_ADMIN]), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const id = +req.query.id;

  if (await hasBooking(id)) {
    // Do not allow to delete ticket if it had at least one booking
    return res.status(400).json({ error: MESSAGES.CANNOT_REMOVE_TICKET });
  }

  const deleteTicket = await prisma.$transaction(async (tx) => {
    const willDeleteTicket = await tx.ticket.findFirst({ where: { id } });
    if (willDeleteTicket) {
      if (isMasterMonthlyTicket(willDeleteTicket)) {
        // Check and remove slave monthly tickets
        const slaveMonthlyTickets = await getSlaveMonthlyTickets(willDeleteTicket.id);
        const slaveMonthlyTicketIds = slaveMonthlyTickets.map(ticket => ticket.id);
        for (let i = 0; i < slaveMonthlyTicketIds.length; i++) {
          const slaveMonthlyTicketId = slaveMonthlyTicketIds[i];
          if (await hasBooking(slaveMonthlyTicketId)) {
            throw Error(MESSAGES.CANNOT_REMOVE_TICKET);
          } else {
            await tx.ticket.delete({
              where: {
                id: slaveMonthlyTicketId,
              },
            });
          }
        }
      }

      const deletedTicket = await tx.ticket.delete({
        where: {
          id,
        },
      });

      return deletedTicket;
    }

  }, { timeout: DEFAULT_TRANSACTION_TIMEOUT });

  res.status(200).json({ data: { deleted: deleteTicket.id } });
});

handler.patch(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const id = +req.query.id;
  const { videoUrl } = req.body;

  const updateTicket = await prisma.ticket.update({
    where: {
      id,
    },
    data: {
      videoUrl,
    },
  });

  if (isMasterMonthlyTicket(updateTicket)) {
    const slaveMonthlyTickets = await getSlaveMonthlyTickets(updateTicket.id);
    if (slaveMonthlyTickets.length) {
      await prisma.ticket.updateMany({
        where: {
          id: {
            in: slaveMonthlyTickets.map(ticket => ticket.id),
          },
          videoUrl: null
        },
        data: {
          videoUrl,
        },
      });
    }
  }

  res.status(200).json({ data: { ticket: updateTicket } });
});

export default handler;
