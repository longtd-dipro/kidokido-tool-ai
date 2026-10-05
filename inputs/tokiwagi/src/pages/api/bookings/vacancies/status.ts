import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import { getInDayVacancy, getNextDaysOneDayOnlineVacancy, getTenantTicketsForVacancy } from "utils/server/vacancy-status";
import { convertToArray } from "utils/array";
import { clampBookingAdvanceDays } from "constants/booking";

const handler = nc({ onError, onNoMatch });

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const tenantCodes = convertToArray(req.query["tenantCodes[]"]);
  const includeTodayOneDayOnlineForInDayVacancy = req.query.includeTodayOneDayOnlineForInDayVacancy;
  const { sortTicketsBy } = req.query;
  const bookingDays = clampBookingAdvanceDays(req.query.bookingDays as string);
  const fromQueryTicketOrder = sortTicketsBy && (sortTicketsBy as string).split(".").reduce((result, item, index, array) => ({ [array[0]]: array[1] }), {});
  const defaultTicketOrder = { id: "asc" };
  const orderBy = fromQueryTicketOrder ? [fromQueryTicketOrder, defaultTicketOrder] : [defaultTicketOrder];

  const tickets = await getTenantTicketsForVacancy(tenantCodes as string[], orderBy);
  const inDayTenantStatus = await getInDayVacancy(tickets, includeTodayOneDayOnlineForInDayVacancy === "true");
  const oneDayOnlineTenantStatus = await getNextDaysOneDayOnlineVacancy(tickets, bookingDays);

  res.status(200).json({
    data: {
      inDayTenantStatus,
      oneDayOnlineTenantStatus,
    },
  });
});

export default handler;
