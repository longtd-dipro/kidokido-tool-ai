import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { ObicSourceField } from "@prisma/client";

import { ROLE } from "constants/common";
import checkAuth from "libs/middleware/checkAuth";
import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import roleAuth from "libs/middleware/roleAuth";
import { IResponse } from "models/Response";
import prisma from "utils/db";
import { backfillObicCodesForTicket } from "utils/server/obicCodes";

const handler = nc({ onError, onNoMatch })
  .use(checkAuth)
  .use(roleAuth([ROLE.ADMIN, ROLE.SUPER_ADMIN]));

handler.post(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  const ticketId = +req.query.id;

  const pendingSources = await prisma.bookingObicCode.findMany({
    where: { isPending: true, Booking: { ticketId } },
    distinct: ["sourceField", "sourceTierIndex"],
    select: { sourceField: true, sourceTierIndex: true },
  });

  if (pendingSources.length === 0) {
    return res.status(200).json({ data: { rowsUpdated: 0, message: "No pending obic rows found" } });
  }

  const changes = pendingSources.map((s) => ({
    source: s.sourceField as ObicSourceField,
    tierIndex: s.sourceTierIndex ?? undefined,
    before: "",
    after: "<manual>",
    changeKind: "empty-to-filled" as const,
  }));

  const rowsUpdated = await backfillObicCodesForTicket(ticketId, changes);

  res.status(200).json({ data: { rowsUpdated } });
});

export default handler;
