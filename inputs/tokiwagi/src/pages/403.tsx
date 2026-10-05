import { useEffect } from "react";
import { GetServerSideProps } from "next";
import { signOut } from "next-auth/react";

import { FORBIDDEN_MESSAGES, ForbiddenLogout, ForbiddenParam, ForbiddenReason } from "constants/messages";

interface ForbiddenProps {
  message: string;
  shouldLogout: boolean;
}

// The IP block uses NextResponse.rewrite, so `reason` is only available on the
// server (the browser URL stays on /admin/*). Resolve the message here.
export const getServerSideProps: GetServerSideProps<ForbiddenProps> = async ({ query }) => {
  const reasonValue = query[ForbiddenParam.REASON];
  const logoutValue = query[ForbiddenParam.LOGOUT];
  const reasonParam = Array.isArray(reasonValue) ? reasonValue[0] : reasonValue;
  const logoutParam = Array.isArray(logoutValue) ? logoutValue[0] : logoutValue;
  const message = FORBIDDEN_MESSAGES[reasonParam ?? ForbiddenReason.DEFAULT] ?? FORBIDDEN_MESSAGES[ForbiddenReason.DEFAULT];

  // `logout` is decoupled from `reason`: an IP block always forces logout, even
  // on pages that intentionally keep the default 403 message.
  return { props: { message, shouldLogout: logoutParam === ForbiddenLogout.ENABLED } };
};

export default function Forbidden({ message, shouldLogout }: ForbiddenProps) {
  // When blocked by the IP whitelist, end the NextAuth session so the user is
  // logged out for the next session (clears the session cookie + client state).
  useEffect(() => {
    if (shouldLogout) {
      // Do NOT redirect: a blocked IP can't reach any /admin route (incl. signin),
      // so redirecting there would bounce back to /403 → signOut → loop. Just
      // clear the session in the background and keep showing the 403 message.
      signOut({ redirect: false });
    }
  }, [shouldLogout]);

  return (
    <div className="px-[24px] pt-[48px] w-full flex items-center justify-center">
      {message}
    </div>
  );
}
