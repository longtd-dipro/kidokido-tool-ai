import { NextApiRequest } from "next";
import cookie from "cookie";
import { decode } from "next-auth/jwt";

import { serverConfig } from "config";
import logger from "utils/logger";

export const logRequest = async (req: NextApiRequest) => {
  let userId: number;
  const cookies = cookie.parse(req.headers["cookie"] || "");
  const sessionToken = cookies["next-auth.session-token"] || cookies["__Secure-next-auth.session-token"];

  if (sessionToken) {
    try {
      const decoded = await decode({
        token: sessionToken,
        secret: serverConfig.auth.secret,
      });
      userId = decoded.userId;
    } catch (error) {
      // Do nothing here
    }
  }

  const body = hideSensitiveInforIfNeeded(req.body);
  logger.info({
    service: req.url?.startsWith("/api/pos") ? "pos" : "web",
    userId,
    type: "request",
    url: req.url || req.headers["referer"],
    method: req.method,
    headers: req.headers,
    body,
  });
};

function hideSensitiveInforIfNeeded(body) {
  let newBody = body;
  if (body?.password) {
    newBody = {
      ...newBody,
      password: "****************",
    };
  }

  if (body?.confirmationPassword) {
    newBody = {
      ...newBody,
      confirmationPassword: "****************",
    };
  }
  return newBody;
}
