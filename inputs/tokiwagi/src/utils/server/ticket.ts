import prisma from "utils/db";

export const getSlaveMonthlyTickets = async (masterTicketId: number, params: {
  visibility?: boolean
  includeTenant?: boolean,
  includeBookingSchedule?: boolean,
} = { includeTenant: false, includeBookingSchedule: false }) => {
  const tickets = await prisma.ticket.findMany({
    where: {
      masterTicketId,
      visibility: params.visibility,
      Tenant: {
        active: true,
        deleted: false,
      }
    },
    orderBy: { createdAt: "asc" },
    include: {
      Tenant: params.includeTenant,
      TicketBookingSchedule: params.includeBookingSchedule ? {
        where: { dateTo: { gte: new Date() }, deleted: false },
        orderBy: { dateTo: "asc" },
      } : false
    }
  });
  return tickets;
};

export const hasBooking = async (ticketId: number) => {
  const booking = await prisma.booking.findFirst({
    where: { ticketId },
  });

  return !!booking;
};

