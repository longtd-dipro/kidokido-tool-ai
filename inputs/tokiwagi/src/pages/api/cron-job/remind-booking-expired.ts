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
import { SHORT_DATE, SHORT_TIME } from "constants/common";
import { serverConfig } from "config";
import { EMAIL_SETTING_KEY } from "constants/settings";
import EmailService from "services/email.service";
import { calculateDeadlineMonthlyTicket, populateTimesLimitBookingsUsageInfo } from "utils/booking";

const handler = nc({ onError, onNoMatch });

// RUN every minute
handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  if (serverConfig.cronJob.enable) {
    let potentialRemindedBookings = await prisma.booking.findMany({
      where: {
        date: { lte: new Date() },
        status: { notIn: [BookingStatus.Cancelled, BookingStatus.SystemCancelled] },
        Ticket: {
          type: { in: [TicketType.DailyTimesLimit, TicketType.HourlyTimesLimit] },
        },
        parentBookingId: null,
        expirationRemindedAt: null,
        OR: [
          {
            paymentStatus: {
              not: PaymentStatus.Pending,
            },
          },
          {
            GMOTransactionId: {
              not: null
            }
          }
        ],
        TicketBookingSchedule: {
          deleted: false,
          enableExpirationRemind: true
        },
      },
      include: {
        Tenant: true,
        Ticket: {
          include: {
            TicketDetail: true,
          }
        },
        User: true,
        TicketBookingSchedule: true,
      },
    }) as any[];

    potentialRemindedBookings = await populateTimesLimitBookingsUsageInfo(prisma, potentialRemindedBookings);
    for (const potentialRemindedBooking of potentialRemindedBookings) {
      const ticketBookingSchedule = potentialRemindedBooking.TicketBookingSchedule;
      const expirationRemindBeforeInDay = ticketBookingSchedule?.expirationRemindBeforeInDay;
      const expirationRemindAt = ticketBookingSchedule?.expirationRemindAt;

      const expiredAt = calculateDeadlineMonthlyTicket(
        potentialRemindedBooking.createdAt,
        potentialRemindedBooking.Ticket,
        [potentialRemindedBooking.TicketBookingSchedule]
      );
      const availableTimes = potentialRemindedBooking.totalTimes - potentialRemindedBooking.usageTimes;
      if (expiredAt < new Date() || availableTimes <= 0) {
        await prisma.booking.update({ where: { id: potentialRemindedBooking.id }, data: { expirationRemindedAt: moment().toISOString() } });
        continue;
      }
      if (!isNil(expirationRemindBeforeInDay) && !isNil(expirationRemindAt) && availableTimes > 0) {
        const remindDate = moment(expiredAt).subtract(Number(expirationRemindBeforeInDay), "day");
        const needToRemind = isSameDay(moment(), remindDate) &&
          isAfterOrSameTime(moment(), moment(expirationRemindAt, SHORT_TIME));
        if (needToRemind) {
          const {
            subEmail,
            User: { email: userEmail },
          } = potentialRemindedBooking;
          const destinationEmails = subEmail && subEmail !== userEmail ? [subEmail, userEmail] : [userEmail];

          await prisma.booking.update({ where: { id: potentialRemindedBooking.id }, data: { expirationRemindedAt: moment().toISOString() } });

          const mailTemplateData = {
            name: potentialRemindedBooking.User.name,
            booking: {
              ...potentialRemindedBooking,
              Tenant: {
                ...potentialRemindedBooking.Tenant,
                openedAt: moment(potentialRemindedBooking.Tenant.openedAt).format(SHORT_TIME),
                closedAt: moment(potentialRemindedBooking.Tenant.closedAt).format(SHORT_TIME),
                servedUtil: moment(potentialRemindedBooking.Tenant.servedUtil).format(SHORT_TIME),
              },
              availableTimes,
              expiredAt: moment(expiredAt).format(SHORT_DATE),
            },
          };
          EmailService.sendEmail(destinationEmails, EMAIL_SETTING_KEY.REMIND_BOOKING_EXPIRED, mailTemplateData);
        }
      }
    }

    res.status(200).json({ data: null });
  } else {
    res.status(200).json({ data: "Cron job is not enable" });
  }
});

export default handler;
