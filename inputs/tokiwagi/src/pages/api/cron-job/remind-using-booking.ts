import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { BookingStatus, PaymentStatus, TicketType } from "@prisma/client";
import moment from "moment";
import { isNil } from "lodash";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { isAfterOrSameTime, isSameDay } from "utils/date-time";
import EmailService from "services/email.service";
import { APP_SETTING_KEY, EMAIL_SETTING_KEY } from "constants/settings";
import { SHORT_TIME } from "constants/common";
import { serverConfig } from "config";
import { Booking } from "models/Entity";
import { isTimesLimitTicket } from "utils/booking";

const handler = nc({ onError, onNoMatch });

// RUN every minute
handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  if (serverConfig.cronJob.enable) {
    const fromTodayBookings = await prisma.booking.findMany({
      where: {
        date: { gte: new Date() },
        status: { notIn: [BookingStatus.Cancelled, BookingStatus.SystemCancelled] },
      },
      include: {
        Tenant: true,
        Ticket: true,
        User: true,
      },
    });

    const isOnlinePendingBooking = (booking: Booking) => {
      return booking.paymentStatus === PaymentStatus.Pending && !!booking.GMOTransactionId;
    };
    const potentialBookings = fromTodayBookings
      .filter((booking) => (booking.Ticket.type === TicketType.Monthly || isTimesLimitTicket(booking.Ticket.type))
        && !booking.parentBookingId && !isOnlinePendingBooking(booking));

    for (const potentialBooking of potentialBookings) {
      const remindBeforeInDay = (await prisma.appSetting.findUnique({ where: { settingKey: APP_SETTING_KEY.MONTHLY_REMIND_BEFORE_IN_DAY } })).value;
      const remindAt = (await prisma.appSetting.findUnique({ where: { settingKey: APP_SETTING_KEY.MONTHLY_REMIND_AT } })).value;

      if (!isNil(remindBeforeInDay) && !isNil(remindAt)) {
        const remindDate = moment(potentialBooking.date).subtract(Number(remindBeforeInDay), "day");
        const needToRemind = isSameDay(moment(), remindDate) && isAfterOrSameTime(moment(), moment(remindAt, SHORT_TIME)) && !potentialBooking.remindedAt;
        if (needToRemind) {
          const {
            subEmail,
            User: { email: userEmail },
          } = potentialBooking;
          const destinationEmails = subEmail && subEmail !== userEmail ? [subEmail, userEmail] : [userEmail];

          await prisma.booking.update({ where: { id: potentialBooking.id }, data: { remindedAt: moment().toISOString() } });

          EmailService.sendEmail(destinationEmails, EMAIL_SETTING_KEY.REMIND_USING_MONTHLY_BOOKING, {
            name: potentialBooking.User.name,
            booking: {
              ...potentialBooking,
              Tenant: {
                ...potentialBooking.Tenant,
                openedAt: moment(potentialBooking.Tenant.openedAt).format(SHORT_TIME),
                closedAt: moment(potentialBooking.Tenant.closedAt).format(SHORT_TIME),
                servedUtil: moment(potentialBooking.Tenant.servedUtil).format(SHORT_TIME),
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
