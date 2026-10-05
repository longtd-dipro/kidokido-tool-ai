import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { BookingStatus, PaymentStatus, TicketType } from "@prisma/client";
import moment from "moment";
import { isNil } from "lodash";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { isAfterOrSameTime, isSameDay, standardizeEpochDate } from "utils/date-time";
import EmailService from "services/email.service";
import { EMAIL_SETTING_KEY } from "constants/settings";
import { serverConfig } from "config";
import { SHORT_TIME } from "constants/common";
import { Booking } from "models/Entity";

const handler = nc({ onError, onNoMatch });

// RUN every minute
handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  if (serverConfig.cronJob.enable) {
    const fromNowBookings = await prisma.booking.findMany({
      where: {
        date: { gte: new Date() },
        status: { notIn: [BookingStatus.Cancelled, BookingStatus.SystemCancelled] },
      },
      include: {
        Tenant: true,
        Ticket: true,
        TicketBookingSchedule: true,
        User: true,
      },
    });

    const isOneDayOnlinePendingBooking = (booking: Booking) => {
      return booking.paymentStatus === PaymentStatus.Pending && !!booking.GMOTransactionId;
    };

    const dailyBookings = fromNowBookings.filter(
      (booking) => booking.Ticket.type === TicketType.Daily && !isOneDayOnlinePendingBooking(booking)
    );
    for (const dailyBooking of dailyBookings) {
      const ticketBookingSchedule = dailyBooking.TicketBookingSchedule;
      const remindBeforeInDay = ticketBookingSchedule?.remindBeforeInDay;
      let remindAt = ticketBookingSchedule?.remindAt;

      if (!isNil(remindBeforeInDay) && !isNil(remindAt)) {
        remindAt = standardizeEpochDate(remindAt);
        const remindDate = moment(dailyBooking.date).subtract(remindBeforeInDay, "day");
        const needRemind = isSameDay(moment(), remindDate) && isAfterOrSameTime(moment().toDate(), moment(remindAt).toDate()) && !dailyBooking.remindedAt;

        if (needRemind) {
          await prisma.booking.update({ where: { id: dailyBooking.id }, data: { remindedAt: moment().toISOString() } });
          EmailService.sendEmail([dailyBooking.User.email, dailyBooking.subEmail], EMAIL_SETTING_KEY.REMIND_USING_ONE_DAY_BOOKING, {
            name: dailyBooking.User.name,
            booking: {
              ...dailyBooking,
              Tenant: {
                ...dailyBooking.Tenant,
                openedAt: moment(dailyBooking.Tenant.openedAt).format(SHORT_TIME),
                closedAt: moment(dailyBooking.Tenant.closedAt).format(SHORT_TIME),
                servedUtil: moment(dailyBooking.Tenant.servedUtil).format(SHORT_TIME),
              },
            },
          });
        }
      }
    }

    res.status(200).json({ data: null });
  } else {
    res.status(200).json({ data: "Cron job is not enable" });
  }
});

export default handler;
