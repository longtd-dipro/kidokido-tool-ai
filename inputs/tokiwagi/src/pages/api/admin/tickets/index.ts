import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { PaymentType, TicketType } from "@prisma/client";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import withValidation from "libs/middleware/withValidation";
import { ticketJsonDataSchema } from "libs/validation/ticketSchema";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { isMasterMonthlyTicket } from "utils/booking";
import { convertToArray } from "utils/array";

const validate = withValidation({
  schema: ticketJsonDataSchema,
  mode: "body",
});

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.SUPER_ADMIN, ROLE.ADMIN]));

handler.post(roleAuth([ROLE.SUPER_ADMIN, ROLE.ADMIN]), validate(handler), async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { slaveTenantCodes, tenantCode, TicketTenant, adultTicketCode, childTicketCode, ...payload } = req.body;
  const convertNumberAdultTicketCode = +adultTicketCode;
  const convertNumberChildTicketCode = +childTicketCode;
  const groupId = new Date().getTime().toString();
  const data = {
    ...payload,
    tenantCode: isMasterMonthlyTicket(payload) ? null : tenantCode,
    adultTicketCode: convertNumberAdultTicketCode,
    childTicketCode: convertNumberChildTicketCode,
    groupId,
    TicketDetail: {
      create: payload.TicketDetail,
    },
    TicketDiscountSetting: {
      create: payload.TicketDiscountSetting,
    },
  };
  const ticket = await prisma.ticket.create({ data });

  if (isMasterMonthlyTicket(ticket) && slaveTenantCodes && slaveTenantCodes.length > 0) {
    for (let i = 0; i < slaveTenantCodes.length; i++) {
      const tenantCode = slaveTenantCodes[i];
      const childGroupId = `${groupId}_${new Date().getTime().toString()}`;
      await prisma.ticket.create({
        data: {
          ...data,
          tenantCode,
          type: TicketType.Monthly,
          masterTicketId: ticket.id,
          groupId: childGroupId
        }
      });
    }
  }

  res.status(201).json({ data: { ticket } });
});

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const admin = req.user;
  const paymentType = req.query.paymentType as PaymentType;
  const canBookInAdvance = req.query.canBookInAdvance ? req.query.canBookInAdvance === "true" : undefined;
  const ticketTypes = convertToArray(req.query.ticketTypes as TicketType[]);
  const tenantCode = req.query.tenantCode as string;
  const { limit, page } = req.query;
  const excludeExpiredSchedule = req.query.excludeExpiredSchedule ? req.query.excludeExpiredSchedule === "true" : undefined;
  const tickets = await prisma.ticket.findMany({
    where: {
      tenantCode: {
        contains: tenantCode || admin.tenantCode,
        mode: "insensitive",
      },
      type: {
        in: ticketTypes,
      },
      paymentType,
      canBookInAdvance,
    },
    include: {
      TicketDetail: true,
      TicketBookingSchedule: {
        where: { deleted: false, ...(excludeExpiredSchedule ? { dateTo: { gte: new Date() } } : {}) },
      },
      Tenant: true,
    },
    skip: page ? (Number(page) - 1) * Number(limit) : undefined,
    take: limit ? Number(limit) : undefined,
    orderBy: [
      { groupId: "desc" }
    ],
  });

  res.status(200).json({ data: tickets });
});

export default handler;
