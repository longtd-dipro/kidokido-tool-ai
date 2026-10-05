import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { ROUTE } from "constants/route";
import {
  BARCODE_SCANNER_FULLSCREEN_QUERY_KEY,
  BARCODE_SCANNER_FULLSCREEN_QUERY_VALUE,
  BARCODE_SCANNER_PATH,
  SESSION_STATUS,
} from "constants/common";

export const withAuthentication = (WrappedComponent, allowedRoles?: string[]) => {
  const RequiredAuthentication = (props) => {
    const [shouldRender, setShouldRender] = useState<boolean>(false);
    const { data: session, status } = useSession();
    const router = useRouter();

    const enforceKioskLock = () => {
      if (!router.isReady || !session?.user?.kioskMode) return false;
      const isScannerKiosk =
        router.pathname === BARCODE_SCANNER_PATH &&
        router.query[BARCODE_SCANNER_FULLSCREEN_QUERY_KEY] === BARCODE_SCANNER_FULLSCREEN_QUERY_VALUE;
      if (!isScannerKiosk) {
        router.replace(`${BARCODE_SCANNER_PATH}?${BARCODE_SCANNER_FULLSCREEN_QUERY_KEY}=${BARCODE_SCANNER_FULLSCREEN_QUERY_VALUE}`);
        return true;
      }
      return false;
    };

    useEffect(() => {
      if (status === SESSION_STATUS.LOADING) return;

      const signInBase = router.pathname.startsWith("/admin") ? ROUTE.ADMIN_SIGN_IN : ROUTE.SIGN_IN;
      const signInUrl = `${signInBase}?redirect=${router.asPath}`;

      if (!session) {
        router.push(signInUrl);
        return;
      }

      if (allowedRoles && !allowedRoles.includes(session.user.role)) {
        signOut({ callbackUrl: signInUrl });
        return;
      }

      if (enforceKioskLock()) return;

      setShouldRender(true);
    }, [status, router.isReady, router.asPath, session?.user?.kioskMode]);

    return shouldRender ? <WrappedComponent {...props} /> : null;
  };

  return RequiredAuthentication;
};
