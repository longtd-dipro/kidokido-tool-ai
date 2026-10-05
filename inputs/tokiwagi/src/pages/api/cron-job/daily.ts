import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import onError from "libs/middleware/onError";
import onNoMatch from "libs/middleware/onNoMatch";
import { IResponse } from "models/Response";
import { serverConfig } from "config";
import { cleanupOldNotifications } from "utils/server/sse-hub";

/**
 * Daily maintenance cron — run once at end of day (after the latest store close).
 *
 * Orchestrates independent daily tasks; each is isolated in its own try/catch so a failure in one
 * does not block the others. Add new daily jobs as separate, named functions below.
 */
const handler = nc({ onError, onNoMatch });

handler.get(async (req: NextApiRequest, res: NextApiResponse<IResponse>) => {
  if (!serverConfig.cronJob.enable) {
    return res.status(200).json({ data: "Cron job is not enable" });
  }

  cleanupOldNotifications();

  return res.status(200).json({ data: "success" });
});

export default handler;
