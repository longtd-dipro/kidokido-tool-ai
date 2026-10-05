import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { NextAuthOptions, SessionOptions, User } from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import LineProvider from "next-auth/providers/line";

import { serverConfig } from "config";
import { MAXIMUM_ALLOWED_LOGIN_ATTEMPTS, ROLE } from "constants/common";
import { ERROR_MESSAGES } from "constants/errors";
import { signInSchema, tokenSignInSchema } from "libs/validation/schemas";
import {
  getAdminTenantByUserId,
  getRoleByUserId,
  getUserByEmail,
  getUserByToken,
  increaseLoginAttempts,
  isMatchingSecurityAnswer,
  resetLoginAttempts,
  verifyPassword,
} from "utils/auth";
import { formatMessage } from "utils/common";
import prisma from "utils/db";
import { isSuperAdmin } from "utils/user";
import { logRequest } from "utils/server/request";

const SESSION_LIFESPAN = {
  DEFAULT: 1 * 24 * 60 * 60, // 1 day
  REMEMBER_ME: 7 * 24 * 60 * 60, // 7 days
};

const DEFAULT_SESSION_OPTIONS: Partial<SessionOptions> = {
  strategy: "jwt",
  maxAge: SESSION_LIFESPAN.DEFAULT,
};

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const sessionOptions = { ...DEFAULT_SESSION_OPTIONS };

  const serverSession = await getServerSession(req, res, DEFAULT_NEXT_AUTH_OPTIONS);
  if (serverSession?.user?.rememberMe) {
    sessionOptions.maxAge = SESSION_LIFESPAN.REMEMBER_ME;
  }
  const nextAuthOptions = { ...DEFAULT_NEXT_AUTH_OPTIONS, session: sessionOptions };
  return await NextAuth(req, res, nextAuthOptions);
}

async function updateUserLineId(user: User) {
  if (user?.lineUserId) {
    return;
  }
  await prisma.$queryRaw`
        UPDATE "users" u
        SET "line_user_id" = a."provider_account_id"
        FROM "accounts" a
        WHERE u."id" = a."user_id" AND u."id" = ${user.id} AND a."provider_account_id" IS NOT NULL;
      `;
}

const DEFAULT_NEXT_AUTH_OPTIONS: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any, req: NextApiRequest) {
        const isAdminSite = req.body.callbackUrl.includes("admin");
        if (!isAdminSite) {
          logRequest(req);
        }

        signInSchema.validateSync(credentials);
        const { email, password, rememberMe, questionId, enteredAnswer } = credentials;
        const user = await getUserByEmail(email);

        if (!user) {
          throw new Error(ERROR_MESSAGES.INVALID_CREDENTIAL);
        }

        if (!user.password) {
          throw new Error(ERROR_MESSAGES.INVALID_CREDENTIAL);
        }

        if (!(await verifyPassword(password, user.password))) {
          throw new Error(ERROR_MESSAGES.INVALID_CREDENTIAL);
        }

        if (!user.emailVerified) {
          throw new Error(ERROR_MESSAGES.ACCOUNT_NOT_VERIFY);
        }

        if (questionId) {
          if (!(await isMatchingSecurityAnswer(questionId, enteredAnswer))) {
            let message = ERROR_MESSAGES.INVALID_SECURITY_ANSWER;
            const updatedUser = await increaseLoginAttempts(user);
            message = formatMessage(
              ERROR_MESSAGES.INVALID_SECURITY_ANSWER_WITH_LOGGED_ATTEMPTS,
              updatedUser.loginAttempts,
              `${MAXIMUM_ALLOWED_LOGIN_ATTEMPTS - updatedUser.loginAttempts}`
            );

            if (updatedUser.locked) {
              message = isSuperAdmin(user) ? ERROR_MESSAGES.LOCKED_SUPER_ADMIN : ERROR_MESSAGES.LOCKED_ADMIN;
            }

            throw new Error(message);
          }
        }

        const authUser: User = {
          id: user.id,
          role: user.role,
          email: user.email,
          name: user.name,
          tenantCode: undefined,
          tenantName: undefined,
          rememberMe: rememberMe === "true",
        };

        switch (user.role) {
          case ROLE.SUPER_ADMIN:
            if (!isAdminSite) {
              throw new Error(ERROR_MESSAGES.ADMIN_CAN_NOT_LOGIN_ON_USER_SITE);
            }

            await resetLoginAttempts(user.id);
            break;
          case ROLE.ADMIN: {
            if (!isAdminSite) {
              throw new Error(ERROR_MESSAGES.ADMIN_CAN_NOT_LOGIN_ON_USER_SITE);
            }

            const adminTenant = await getAdminTenantByUserId(user.id);

            if (!adminTenant) {
              throw new Error(ERROR_MESSAGES.ADMIN_NOT_BELONG_ANY_TENANTS);
            }

            await resetLoginAttempts(user.id);

            const tenant = await prisma.tenant.findUnique({ where: { code: adminTenant.tenantCode } });

            authUser.tenantCode = adminTenant.tenantCode;
            authUser.tenantName = tenant?.name;
            authUser.tenantAllowedVersion = tenant?.allowedVersion;
            break;
          }
          case ROLE.USER: {
            if (isAdminSite) {
              throw new Error(ERROR_MESSAGES.REQUIRED_ADMIN_PERMISSION);
            }
            break;
          }
        }

        return authUser;
      },
    }),
    CredentialsProvider({
      id: "token",
      name: "Token",
      credentials: {
        token: { label: "token", type: "text" },
      },
      async authorize(credentials: any) {
        tokenSignInSchema.validateSync(credentials);
        const { token } = credentials;
        const user = await getUserByToken(token);

        if (!user) {
          throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
        }

        const authUser: User = {
          id: user.id,
          role: user.role,
          email: user.email,
          name: user.name,
          tenantCode: undefined,
          tenantName: undefined,
          rememberMe: false,
        };

        if (!user.emailVerified) {
          throw new Error(ERROR_MESSAGES.ACCOUNT_NOT_VERIFY);
        }

        return authUser;
      },
    }),
    LineProvider({
      clientId: serverConfig.providers.line.clientId,
      clientSecret: serverConfig.providers.line.clientSecret,
      authorization: { params: { scope: "openid profile" } },
    }),
  ],

  adapter: PrismaAdapter(prisma),
  secret: serverConfig.auth.secret,
  jwt: {
    secret: serverConfig.auth.secret,
  },
  session: DEFAULT_SESSION_OPTIONS,
  events: {
    async linkAccount({ user }) {
      await updateUserLineId(user as User);
    },
    async signIn({ user }) {
      await updateUserLineId(user);
    }
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const userId = Number(user.id);
        const role = await getRoleByUserId(userId);
        token.tenantCode = user.tenantCode;
        token.tenantName = user.tenantName;
        token.userId = userId;
        token.role = role;
        token.rememberMe = user.rememberMe;
        token.tenantAllowedVersion = user.tenantAllowedVersion;
      }

      if (trigger === "update" && typeof session?.kioskMode === "boolean") {
        token.kioskMode = session.kioskMode;
      }

      return token;
    },

    async session({ session, token }) {
      if (token?.role) {
        session.user.tenantCode = token.tenantCode;
        session.user.tenantName = token.tenantName;
        session.user.id = token.userId;
        session.user.role = token.role;
        session.user.rememberMe = token.rememberMe;
        session.user.tenantAllowedVersion = token.tenantAllowedVersion;
        session.user.kioskMode = token.kioskMode ?? false;
      }

      return session;
    },

    async redirect({ url }) {
      return url;
    },
  },
};
