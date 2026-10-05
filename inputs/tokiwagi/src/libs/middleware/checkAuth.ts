import { NextApiRequest, NextApiResponse } from "next";
import { decode, getToken } from "next-auth/jwt";

import { IResponse } from "models/Response";
import { ERROR_MESSAGES } from "constants/errors";
import { serverConfig } from "config";

const checkAuth = async (req: NextApiRequest, res: NextApiResponse<IResponse>, next: Function) => {
  try {
    const accessToken = req.headers["access-token"];
    if (accessToken) {
      const decoded = await decode({
        token: accessToken as string,
        secret: serverConfig.auth.secret,
      });
      req.user = {
        id: decoded.userId,
        role: decoded.role,
        tenantCode: decoded.tenantCode,
        tenantName: decoded.tenantName,
        rememberMe: decoded.rememberMe
      };
    } else {
      const token = await getToken({
        req,
        secret: serverConfig.auth.secret,
      });

      if (token) {
        req.user = {
          id: token.userId,
          role: token.role,
          email: token.email,
          tenantCode: token.tenantCode,
          tenantName: token.tenantName,
          rememberMe: token.rememberMe
        };
      }
    }

    if (req.user) {
      next();
    } else {
      res.status(401).json({ error: ERROR_MESSAGES.UNAUTHENTICATED });
    }
  } catch (error) {
    res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_ERROR });
  }
};

export default checkAuth;
