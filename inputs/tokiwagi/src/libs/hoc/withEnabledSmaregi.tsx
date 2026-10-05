import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { ROUTE } from "constants/route";
import { useSmaregiEnabled } from "libs/hooks/useSmaregiEnabled";

export const withEnabledSmaregi = (WrappedComponent) => {
  const RequiredAuthentication = (props) => {
    const [shouldRender, setShouldRender] = useState<boolean>(false);
    const { data: session, status: sessionStatus } = useSession();
    const user = session?.user;
    const router = useRouter();
    const { isEnabledSmaregi, loading: isEnabledSmaregiLoading } = useSmaregiEnabled(user?.tenantCode);

    useEffect(() => {
      // Wait until the session has fully resolved (not still "loading")
      if (sessionStatus === "loading") return;

      // Once session is resolved, wait for the smaregi check to finish
      if (isEnabledSmaregiLoading) return;

      if (!isEnabledSmaregi) {
        router.replace(ROUTE.FORBIDDEN);
        return;
      }

      setShouldRender(true);
    }, [sessionStatus, isEnabledSmaregi, isEnabledSmaregiLoading, router]);

    return shouldRender ? <WrappedComponent {...props} /> : null;
  };

  return RequiredAuthentication;
};
