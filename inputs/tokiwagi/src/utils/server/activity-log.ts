import { pick } from "lodash";

import { User } from "models/Entity";
import { ActivityType } from "models/enums";
import prisma from "utils/db";
import { isAdmin, isStaff } from "utils/user";

type WriteActivityLogParams = {
  query: any;
  staffId?: string;
  userId?: number;
  activityType: ActivityType;
};

const isEmptyFilters = (query) => {
  const { limit, page, fromAction, userOrStaffId, ...filters } = query;

  return !query || Object.values(filters).every((value) => !value);
};

export const handleWriteActivityLog = async (query, loggedInUser: User, activityType: ActivityType) => {
  if (query.userOrStaffId) {
    const staff = await prisma.staff.findUnique({ where: { id: query.userOrStaffId } });
    if (staff) {
      // For staff with role staff
      if (isStaff(staff) && (!isEmptyFilters(query) || isBookingActivity(activityType))) {
        writeActivityLog({ query, staffId: staff.id, userId: loggedInUser.id, activityType });
      }

      // For staff with role admin
      if (isAdmin(staff)) {
        writeActivityLog({ query, staffId: staff.id, userId: loggedInUser.id, activityType });
      }

      return;
    }

    // For original admin
    const user = await prisma.user.findUnique({ where: { id: +query.userOrStaffId || 0 } });
    if (user) {
      writeActivityLog({ query, userId: user.id, activityType });
    }
  }
};

export const writeActivityLog = async ({ query, staffId, userId, activityType }: WriteActivityLogParams) => {
  const filters = extractFilterFields(query, activityType);
  return prisma.adminActivityLog.create({
    data: {
      activityType,
      details: JSON.stringify(filters),
      staffId,
      userId,
    },
  });
};

export const extractFilterFields = (query, activityType: ActivityType) => {
  const options = {
    [ActivityType.SearchUser]: extractUserFilterFields,
    [ActivityType.SearchBooking]: extractBookingFilterFields,
    [ActivityType.DownloadBooking]: extractBookingFilterFields,
    [ActivityType.SearchRevenue]: extractRevenueFilterFields,
    [ActivityType.DownloadRevenue]: extractRevenueFilterFields,
  };

  const option = options[activityType];

  return option && options[activityType](query);
};

const extractUserFilterFields = (query) => {
  const FILTERS = ["name", "email", "phone", "startDate", "endDate"];
  return pick(query, FILTERS);
};

const extractBookingFilterFields = (query) => {
  const FILTERS = ["name", "ticketId", "status", "startDate", "endDate", "shortBarCode"];
  return pick(query, FILTERS);
};

const extractRevenueFilterFields = (query) => {
  const FILTERS = ["ticketId", "alreadyRecheckIn", "fromDate", "endDate"];
  return pick(query, FILTERS);
};

const isBookingActivity = (activityType: ActivityType) => {
  return [ActivityType.SearchBooking, ActivityType.DownloadBooking].includes(activityType);
};
