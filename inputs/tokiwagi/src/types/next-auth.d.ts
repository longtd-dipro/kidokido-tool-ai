import { TenantVersion } from "@prisma/client";
import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  // eslint-disable-next-line no-unused-vars
  interface Session {
    user: {
      id: number;
      role: string;
      tenantCode: string; // Admin Role only
      tenantName: string; // Admin Role only
      tenantAllowedVersion?: TenantVersion; // Admin Role only — gates tenant-version features
      rememberMe: boolean;
      kioskMode?: boolean; // Barcode-scanner kiosk lock — pins the session to the scanner
    } & DefaultSession["user"];
  }

  // eslint-disable-next-line no-unused-vars
  interface User extends DefaultUser {
    id: number;
    role: string;
    tenantCode: string; // Admin Role only
    tenantName: string; // Admin Role only
    tenantAllowedVersion?: TenantVersion; // Admin Role only — gates tenant-version features
    rememberMe: boolean;
    lineUserId?: string | null;
  }
}

declare module "next-auth/jwt" {
  // eslint-disable-next-line no-unused-vars
  interface JWT extends DefaultJWT {
    userId: number;
    role: string;
    tenantCode: string; // Admin Role only
    tenantName: string; // Admin Role only
    tenantAllowedVersion?: TenantVersion; // Admin Role only — gates tenant-version features
    rememberMe: boolean;
    kioskMode?: boolean; // Barcode-scanner kiosk lock — pins the session to the scanner
  }
}
