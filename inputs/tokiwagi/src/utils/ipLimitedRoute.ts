import { LIMIT_IP_ACCESSING_ROUTES } from "constants/common";

/**
 * Whether a path (optionally for a specific HTTP method) is subject to the IP
 * whitelist. Shared by the edge middleware (to block requests) and the client
 * (to decide when a link must be a full-page navigation so the middleware's
 * redirect to /403 is honored — next/link client transitions do not reliably
 * follow middleware redirects in the Pages Router).
 */
export function isLimitedIpRoute(pathname: string, method = "GET"): boolean {
  for (const route of LIMIT_IP_ACCESSING_ROUTES) {
    const path = typeof route === "string" ? route : route.path;
    if (!pathname.startsWith(path)) continue;

    // Plain string entry, or object without `methods`, limits every method.
    const methods = typeof route === "string" ? undefined : route.methods;
    if (!methods || methods.length === 0) return true;

    if (methods.some((m) => m.toUpperCase() === method.toUpperCase())) return true;
  }
  return false;
}
