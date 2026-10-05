import { NextRequest, NextResponse } from "next/server";

import { serverConfig } from "config";
import { IpWhitelist } from "utils/server/ipWhitelist";
import {
  FORBIDDEN_MESSAGES,
  FORBIDDEN_REASON_HEADER,
  ForbiddenLogout,
  ForbiddenParam,
  ForbiddenReason,
} from "constants/messages";
import { DEFAULT_FORBIDDEN_PAGES } from "constants/route";
import { isLimitedIpRoute } from "utils/ipLimitedRoute";

export async function middleware(req: NextRequest) {
  const basicAuthResponse = checkBasicAuth(req);
  if (basicAuthResponse) return basicAuthResponse;

  const { pathname } = req.nextUrl;
  if (isLimitedIpRoute(pathname, req.method) && !(await isAdminCredentialsSignIn(req, pathname))) {
    const allowed = await checkIpRegionAccess(req);
    if (!allowed) {
      return buildForbiddenResponse(req);
    }
  }

  return NextResponse.next();
}

// /api/auth/callback/credentials is shared by both the public and admin sign-in
// forms. Admin routes are exempt from the IP guard, so mirror that exemption here
// using the same signal NextAuth's own authorize() callback uses to tell them apart.
// Reads the POST body (not headers like Referer) because CloudFront always forwards
// the request body to the origin regardless of its origin-request header allow-list.
async function isAdminCredentialsSignIn(req: NextRequest, pathname: string): Promise<boolean> {
  if (pathname !== "/api/auth/callback/credentials") return false;
  try {
    const callbackUrl = (await req.clone().formData()).get("callbackUrl");
    return typeof callbackUrl === "string" && callbackUrl.includes("admin");
  } catch {
    return false;
  }
}

// Builds the absolute /403 URL (with reason/logout params) the client should land on.
function buildForbiddenUrl(req: NextRequest): URL {
  const url = req.nextUrl.clone();
  url.pathname = "/403";
  url.search = "";
  // An IP block always forces logout. Keep the default message on the pages that
  // intentionally suppress the IP message; show the IP message everywhere else.
  if (!DEFAULT_FORBIDDEN_PAGES.includes(req.nextUrl.pathname)) {
    url.searchParams.set(ForbiddenParam.REASON, ForbiddenReason.IP);
  }
  url.searchParams.set(ForbiddenParam.LOGOUT, ForbiddenLogout.ENABLED);
  return url;
}

function buildForbiddenResponse(req: NextRequest): NextResponse {
  // API requests get JSON (so axios callers can read the message); browser page
  // navigations are redirected to the 403 page immediately.
  const isApi = req.nextUrl.pathname.startsWith("/api/");
  const forbiddenUrl = buildForbiddenUrl(req);

  if (isApi) {
    // Tag the response so the client interceptor knows this 403 is an IP block
    // (and must force logout), as opposed to a permission/role 403.
    // `url` is included so fetch-based callers that bypass the axios interceptor
    // (e.g. NextAuth `signIn`, which would otherwise throw on `new URL(undefined)`)
    // can read where to navigate after the block.
    return NextResponse.json(
      { message: FORBIDDEN_MESSAGES[ForbiddenReason.IP], url: forbiddenUrl.toString() },
      { status: 403, headers: { [FORBIDDEN_REASON_HEADER]: ForbiddenReason.IP } },
    );
  }

  return NextResponse.redirect(forbiddenUrl);
}

function checkBasicAuth(req: NextRequest): Response | null {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;

  // Skip if credentials are not configured
  if (!user || !pass) return null;

  // Only protect /admin pages and /api/admin/* endpoints
  const pathname = req.nextUrl.pathname;
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) return null;

  const authHeader = req.headers.get("authorization") ?? "";
  const [scheme, encoded] = authHeader.split(" ");

  if (scheme === "Basic" && encoded) {
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const [inputUser, inputPass] = decoded.split(":");
    if (inputUser === user && inputPass === pass) return null;
  }

  return new Response("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": "Basic realm=\"Tokiwagi Admin\"" },
  });
}

// Apply middleware to all routes except file upload endpoints (Edge middleware
// buffers the multipart body when converting IncomingMessage → Web Request,
// which corrupts the stream before formidable can parse it).
export const config = {
  matcher: "/((?!api/upload).*)",
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function checkMaintenanceMode(req: NextRequest) {
  const urlPath = req.nextUrl.pathname;

  // Exclude API routes, static files, Next.js internals, and the maintenance page
  const excludedPaths = [
    "/api", // Exclude API routes
    "/_next", // Next.js internals (chunks, images, etc.)
    "/static", // Static assets
    "/public", // Public folder assets
    "/maintenance" // The maintenance page itself
  ];

  // Skip middleware for these paths
  if (excludedPaths.some(path => urlPath.startsWith(path)) || urlPath.includes("favicon.ico")) {
    return false;
  }
  return await isMaintenanceMode();
}

async function isMaintenanceMode() {
  try {
    const res = await fetch(serverConfig.external.url + "/api/app-settings/maintenance-mode");
    const { data } = await res.json();
    return data?.value === "on";
  } catch (error) {
    console.error("Error fetching maintenance mode:", error);
    return false;
  }
}

// In-isolate cache so the middleware does not HTTP round-trip to the API route on
// every admin request. The S3-backed source already revalidates every 5 min, so a
// short TTL here is plenty. On a transient fetch error we serve the stale value.
let whitelistCache: { data: IpWhitelist; expiresAt: number } | null = null;
const WHITELIST_CACHE_TTL_MS = 60 * 1000;

async function getIpWhitelistCached(): Promise<IpWhitelist> {
  if (whitelistCache && Date.now() < whitelistCache.expiresAt) {
    return whitelistCache.data;
  }
  try {
    const res = await fetch(serverConfig.external.url + "/api/app-settings/ip-whitelist");
    const { data } = (await res.json()) as { data: IpWhitelist };
    whitelistCache = { data, expiresAt: Date.now() + WHITELIST_CACHE_TTL_MS };
    return data;
  } catch (err) {
    // Serve stale cache if we have one; otherwise let the caller decide.
    if (whitelistCache) return whitelistCache.data;
    throw err;
  }
}

async function checkIpRegionAccess(req: NextRequest): Promise<boolean> {
  try {
    const { countries, ips } = await getIpWhitelistCached();
    // Both lists empty — no restriction configured
    if (countries?.length === 0 && ips?.length === 0) return true;

    const clientIp = getClientIp(req);
    const clientCountry = req.headers.get("cloudfront-viewer-country")
      || (req as any).geo?.country;

    // IP check: if IPs list is set, client IP must be in it
    if (ips?.length > 0) {
      const ipAllowed = clientIp != null && ips.includes(clientIp);
      if (ipAllowed) return true;
    }
    // Region check: if countries list is set, client region must be in it
    if (countries?.length > 0) {
      const regionAllowed = clientCountry != null &&
        countries.some((r) => r.toLowerCase() === clientCountry.toLowerCase());
      if (!regionAllowed) return false;
    }
    return true;
  } catch (error) {
    // Fail open — do not block admins when whitelist is unavailable
    console.error("Error fetching IP whitelist:", error);
    return true;
  }
}

function getClientIp(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return null;
}
