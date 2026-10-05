import { ROUTE } from "constants/route";

type SignInResult = {
  error?: string | null;
  status?: number;
  ok?: boolean;
  url?: string | null;
} | undefined;

/**
 * NextAuth `signIn` uses `fetch`, so it bypasses the global axios 403 interceptor.
 * When the middleware blocks the credentials callback by IP whitelist it returns a
 * 403 carrying the target `/403` URL. This helper detects that blocked result and
 * returns the path the client should navigate to, or `null` if it was not a block.
 */
export function getForbiddenRedirect(result: SignInResult): string | null {
  if (!result || result.ok || result.status !== 403) return null;

  if (result.url) {
    try {
      const dest = new URL(result.url);
      return dest.pathname + dest.search;
    } catch {
      // Fall through to the default forbidden route.
    }
  }
  return ROUTE.FORBIDDEN;
}
