import { BookingStatus, PaymentStatus, Prisma, TicketType } from "@prisma/client";
import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { handleWriteActivityLog } from "utils/server/activity-log";
import { ActivityType } from "models/enums";
import { convertToArray } from "utils/array";

import BookingWhereInput = Prisma.BookingWhereInput;

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { limit, page } = req.query;
  const filters = generateAdminBookingFilters(req);

  const fromAction = req.query.fromAction as ActivityType;

  fromAction && (await handleWriteActivityLog(req.query, req.user, fromAction));

  const bookings = await prisma.booking.findMany({
    where: {
      AND: filters,
    },
    skip: page ? (Number(page) - 1) * Number(limit) : undefined,
    take: limit ? Number(limit) : undefined,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      Ticket: true,
      User: true,
    },
  });

  res.status(200).json({ data: { bookings } });
});

export default handler;

export const generateAdminBookingFilters = (req: NextApiRequest) => {
  const { user } = req;

  const name = (req.query.name || undefined) as string;
  const tenantCode = req.query.tenantCode || undefined;
  const ticketType: TicketType = TicketType[req.query.ticketType as string];
  const ticketId = req.query.ticketId ? Number(req.query.ticketId) : undefined;
  const status: BookingStatus[] = convertToArray(req.query["status[]"] as BookingStatus[]);
  const startDate = req.query.startDate && moment(req.query.startDate).utc(true).toDate();
  const endDate = req.query.endDate && moment(req.query.endDate).utc(true).toDate();
  const shortBarCode = (req.query.shortBarCode || undefined) as string;
  const barCode = (req.query.barCode || undefined) as string;
  const isSuperAdmin = user.role === ROLE.SUPER_ADMIN;

  const filters: BookingWhereInput[] = [
    {
      status: { in: status },
      ticketId: ticketId,
      tenantCode: isSuperAdmin ? tenantCode : user.tenantCode,
    },
    {
      OR: [
        { GMOTransactionId: null },
        {
          paymentStatus: {
            not: PaymentStatus.Pending
          }
        },
      ]
    }
  ];

  if (ticketType) {
    filters.push({
      Ticket: {
        type: ticketType,
      },
    });
  }

  if (name) {
    filters.push({
      User: {
        name: {
          contains: name,
          mode: "insensitive",
        },
      },
    });
  }

  if (startDate || endDate) {
    filters.push({
      date: {
        gte: startDate,
        lte: endDate,
      },
    });
  }

  if (barCode || shortBarCode) {
    filters.push({
      barCode: {
        equals: barCode,
        endsWith: shortBarCode,
      },
    });
  }

  return filters;
};
