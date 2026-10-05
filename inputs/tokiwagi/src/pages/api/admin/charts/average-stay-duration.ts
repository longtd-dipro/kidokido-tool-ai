import { groupBy, map, toArray } from "lodash";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import moment from "moment";

import { ROLE, SHORT_DATE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { getDiffOfDates, newDateKeepLocalTime } from "utils/date-time";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.SUPER_ADMIN, ROLE.ADMIN]));

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const { dateFrom, dateTo } = req.query;

  const results: any[] = await prisma.$queryRaw`
    select tenant_code, date, checked_in_at, checked_out_at, first_checked_in_at, stay_duration
    from bookings
    where checked_in_at is not null 
          and checked_out_at is not null 
          and ${newDateKeepLocalTime(dateFrom as string)} <= date 
          and date <= ${newDateKeepLocalTime(dateTo as string)}
  group by tenant_code, date, checked_in_at, checked_out_at, first_checked_in_at, stay_duration
  `;

  const groupedByTenant = groupBy(results, "tenant_code");

  const statistics = toArray(groupedByTenant).map((tenantItems) => {
    const enriched = tenantItems.map((item) => {
      let usingTimeInHour;
      if (item.stay_duration) {
        usingTimeInHour = item.stay_duration / 60;
      } else {
        const checkedInAt = new Date(item.first_checked_in_at || item.checked_in_at);
        const checkedOutAt = new Date(item.checked_out_at);

        const diffTime = getDiffOfDates(checkedInAt, checkedOutAt);
        usingTimeInHour = diffTime.hours + diffTime.minutes / 60;
      }
      return { ...item, usingTimeInHour };
    });

    const groupedByDate = groupBy(enriched, "date");

    const data = map(groupedByDate, (values, key) => {
      return {
        date: key,
        totalUsingTime: values.reduce((total, { usingTimeInHour }) => total + usingTimeInHour, 0),
        totalBookings: values.length,
        tenant_code: values[0].tenant_code,
      };
    }).map((item) => {
      const ratio = +(+item.totalUsingTime / item.totalBookings).toFixed(2);
      const date = moment(item.date).format(SHORT_DATE);
      return [date, ratio];
    });

    return {
      name: tenantItems[0].tenant_code,
      data,
    };
  });

  res.status(200).json({ data: statistics });
});

export default handler;
