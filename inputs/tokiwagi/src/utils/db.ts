import { PrismaClient } from "@prisma/client";

import { registerSoftDeleteModels } from "libs/middleware/prisma/softDelete";
import { standardizeDBTimeField } from "libs/middleware/prisma/standardizeDBTimeField";

declare global {
  // eslint-disable-next-line no-unused-vars
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

registerSoftDeleteModels(prisma, ["Tenant", "User", "PartialCheckout", "TicketBookingSchedule"]);
standardizeDBTimeField(prisma, {
  "Tenant": ["openedAt", "closedAt", "servedUtil"],
  "TicketBookingSchedule": ["timeFrom", "timeTo", "canBookingFrom", "canBookingUtil", "canCancelOrChangeUtil", "remindAt"]
});

export default prisma;
