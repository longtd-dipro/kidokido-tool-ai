import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { PaymentType, TicketType } from "@prisma/client";

import onError from "libs/middleware/onError";
import prisma from "utils/db";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import { convertToArray } from "utils/array";
import { USER_TENANT_WITHIN_INCLUDE_FIELDS } from "utils/server/db-fields-selector";
import { getHiddenTenantTicketNames } from "utils/server/booking";
import { SourcePage } from "models/common";

const handler = nc({ onError, onNoMatch });

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const tenantCode = req.query.tenantCode as string;
  const paymentType = req.query.paymentType as PaymentType;
  const canBookInAdvance = req.query.canBookInAdvance ? req.query.canBookInAdvance === "true" : undefined;
  const ticketTypes = convertToArray(req.query.ticketTypes as TicketType[]);
  const hasBookingSchedule = req.query.hasBookingSchedule === "true";
  const hasSlaveTenants = req.query.hasSlaveTenants === "true";
  const { sort_by } = req.query;
  const fromQueryOrder = sort_by && (sort_by as string).split(".").reduce((result, item, index, array) => ({ [array[0]]: array[1] }), {});
  const defaultOrder = { id: "asc" };
  const orderBy = fromQueryOrder ? [fromQueryOrder, defaultOrder] : [defaultOrder];
  const today = new Date();
  const sourcePage = req.query.sourcePage;
  let hiddenTenantTicketNames = [];
  if (sourcePage === SourcePage.PRICE_LIST) {
    hiddenTenantTicketNames = await getHiddenTenantTicketNames(tenantCode);
  }
  let tickets = await prisma.ticket.findMany({
    where: {
      tenantCode,
      paymentType,
      canBookInAdvance,
      visibility: true,
      type: {
        in: ticketTypes,
      },
      ...(hiddenTenantTicketNames.length > 0 && {
        name: {
          notIn: hiddenTenantTicketNames,
        },
      })
    },
    orderBy,
    include: {
      TicketBookingSchedule: {
        where: { dateTo: { gte: today }, deleted: false },
        orderBy: { dateTo: "asc" },
      },
      TicketDetail: true,
      Tenant: {
        select: USER_TENANT_WITHIN_INCLUDE_FIELDS
      },
      TicketDiscountSetting: true,
    },
  });

  if (hasBookingSchedule) {
    tickets = tickets.filter((ticket) => {
      return ticket.TicketBookingSchedule?.length > 0;
    });
  }

  if (hasSlaveTenants) {
    const masterTicketIds = tickets
      .filter((ticket) => ticket.masterTicketId)
      .map((ticket) => ticket.masterTicketId);

    let slaveTickets = [];
    if (masterTicketIds.length) {
      slaveTickets = await prisma.ticket.findMany({
        where: {
          masterTicketId: {
            in: masterTicketIds,
          },
        },
        include: {
          Tenant: {
            select: {
              code: true,
              name: true,
            }
          },
        },
      });
    }

    tickets = tickets.map((ticket) => ({
      ...ticket,
      slaveTenants: ticket.masterTicketId ?
        slaveTickets
          .filter((slaveTicket) => slaveTicket.masterTicketId === ticket.masterTicketId)
          .map((ticketTenant) => ticketTenant.Tenant) :
        [ticket.Tenant],
    }));
  }
  res.status(200).json({ data: tickets });
});

export default handler;
