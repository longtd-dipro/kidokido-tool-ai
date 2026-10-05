import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

import { serverConfig } from "config";
import {
  fetchNotificationsAfter,
  getLatestNotificationId,
} from "utils/server/sse-hub";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

const KEEP_ALIVE_INTERVAL_MS = 25_000;
const POLL_INTERVAL_MS = 2_500;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }

  // EventSource sends cookies automatically, so getToken can read the session.
  const token = await getToken({ req, secret: serverConfig.auth.secret });
  const userId = token?.userId;
  if (!userId) {
    return res.status(401).end();
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders?.();

  res.write(": connected\n\n");

  let lastId = await getLatestNotificationId(userId);
  let polling = false;

  const keepAlive = setInterval(() => {
    try {
      res.write(": ping\n\n");
    } catch {
      // Cleanup happens on 'close'.
    }
  }, KEEP_ALIVE_INTERVAL_MS);

  const poll = setInterval(async () => {
    // Skip if the previous tick is still running (slow DB) to avoid overlap.
    if (polling) return;
    polling = true;
    try {
      const rows = await fetchNotificationsAfter(userId, lastId);
      for (const row of rows) {
        try {
          res.write(`data: ${JSON.stringify(row.payload)}\n\n`);
        } catch {
          // Broken pipe; the 'close' handler will clean up.
          break;
        }
        lastId = row.id;
      }
    } catch {
      // Transient DB error; retry on the next tick.
    } finally {
      polling = false;
    }
  }, POLL_INTERVAL_MS);

  req.on("close", () => {
    clearInterval(keepAlive);
    clearInterval(poll);
  });
};

export default handler;
