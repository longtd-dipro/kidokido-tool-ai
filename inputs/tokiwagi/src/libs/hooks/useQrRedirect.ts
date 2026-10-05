import { useRouter } from "next/router";

import { QR_REDIRECT_QUERY_KEY } from "constants/common";
import { ROUTE } from "constants/route";

type UseQrRedirectReturn = {
  hasQrRedirect: boolean;
  /** `/signin` URL — includes `?redirect=<current-path>` when qrRedirect is active, plain `/signin` otherwise. */
  signInHref: string;
  clearQrRedirect: () => void;
};

export const useQrRedirect = (): UseQrRedirectReturn => {
  const router = useRouter();
  const hasQrRedirect = router.isReady && Boolean(router.query[QR_REDIRECT_QUERY_KEY]);

  const signInHref = hasQrRedirect
    ? `${ROUTE.SIGN_IN}?redirect=${encodeURIComponent(router.asPath)}`
    : ROUTE.SIGN_IN;

  const clearQrRedirect = () => {
    const { [QR_REDIRECT_QUERY_KEY]: _removed, ...restQuery } = router.query;
    router.replace({ pathname: router.pathname, query: restQuery }, undefined, { shallow: true });
  };

  return { hasQrRedirect, signInHref, clearQrRedirect };
};
