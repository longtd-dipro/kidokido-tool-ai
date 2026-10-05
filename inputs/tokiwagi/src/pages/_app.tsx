import { useEffect } from "react";
import axios from "axios";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import Router from "next/router";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import "@fullcalendar/common/main.css";
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/timegrid/main.css";
import "@fullcalendar/list/main.css";
import "moment/locale/ja";
import { createTheme, ThemeProvider } from "@mui/material";
import { jaJP } from "@mui/material/locale";

import { storeWrapper } from "stores";
import { DEFAULT_FORBIDDEN_PAGES, ROUTE } from "constants/route";
import {
  FORBIDDEN_REASON_HEADER,
  ForbiddenLogout,
  ForbiddenParam,
  ForbiddenReason,
} from "constants/messages";
import Notification from "components/common/Notification";
import { JAPAN_LOCALE_CODE } from "constants/common";
import ErrorBoundary from "components/ErrorBoundary";
import { useDeviceDetector } from "libs/hooks/useDeviceDetector";
import BackdropLoading from "components/common/BackdropLoading";
import { SmaregiEnabledProvider } from "contexts/SmaregiEnabledContext";

import "styles/globals.scss";

const theme = createTheme(
  {
    breakpoints: {
      values: {
        xs: 0,
        sm: 0,
        md: 767,
        lg: 1440,
        xl: 1919,
      },
    },
    components: {
      MuiDialog: {
        defaultProps: {
          maxWidth: false,
        },
      },
    },
  },
  jaJP
);

function MyApp({ Component, pageProps }: AppProps) {
  const deviceDetector = useDeviceDetector();

  // Redirect to the 403 page (client-side, no full reload) when any API call is
  // blocked by the IP whitelist. The middleware returns 403 for /api/admin/*.
  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const isForbidden = error?.response?.status === 403;
        const isAlreadyOnForbiddenPage = Router.pathname === ROUTE.FORBIDDEN;
        if (isForbidden && !isAlreadyOnForbiddenPage) {
          // An IP-change 403 (tagged by the middleware) always forces a logout.
          const isIpBlock = error?.response?.headers?.[FORBIDDEN_REASON_HEADER] === ForbiddenReason.IP;
          const useDefaultMessage = DEFAULT_FORBIDDEN_PAGES.includes(Router.pathname);

          const params = new URLSearchParams();
          // Keep the default message on the listed pages; show the IP message elsewhere.
          if (isIpBlock && !useDefaultMessage) params.set(ForbiddenParam.REASON, ForbiddenReason.IP);
          if (isIpBlock) params.set(ForbiddenParam.LOGOUT, ForbiddenLogout.ENABLED);

          const query = params.toString();
          Router.push(query ? `${ROUTE.FORBIDDEN}?${query}` : ROUTE.FORBIDDEN);
        }
        return Promise.reject(error);
      },
    );
    return () => axios.interceptors.response.eject(interceptorId);
  }, []);

  return (
    <SessionProvider session={pageProps.session}>
      <SmaregiEnabledProvider>
        <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={JAPAN_LOCALE_CODE}>
          <ThemeProvider theme={theme}>
            <Head>
              <title>ボーネルンドあそび場予約・購入サイト</title>
              {deviceDetector.isMobile() && <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />}
            </Head>

            <ErrorBoundary>
              <Component {...pageProps} />
            </ErrorBoundary>

            <Notification />
            <BackdropLoading />
            <div>
              <input id="event-emitter" hidden />
            </div>
          </ThemeProvider>
        </LocalizationProvider>
      </SmaregiEnabledProvider>
    </SessionProvider>
  );
}

export default storeWrapper.withRedux(MyApp);
