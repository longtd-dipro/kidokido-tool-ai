import { createContext, ReactNode, useContext, useMemo } from "react";
import { useSession } from "next-auth/react";

import { useSmaregiEnabled } from "libs/hooks/useSmaregiEnabled";
import { Menu } from "models/Menu";
import { ROLE } from "constants/common";
import { MENU_LIST_ADMIN, MENU_LIST_SUPER_ADMIN } from "constants/settings";
import { ROUTE } from "constants/route";

type SmaregiEnabledContextValue = {
  isEnabledSmaregi: boolean;
  loading: boolean;
  error: string | null;
  /**
   * The resolved base menu list for the current user role + smaregi state.
   * Memoized — does NOT change on navigation, only when role or smaregi result changes.
   */
  baseMenuList: Menu[];
};

const SmaregiEnabledContext = createContext<SmaregiEnabledContextValue>({
  isEnabledSmaregi: false,
  loading: false,
  error: null,
  baseMenuList: [],
});

/**
 * Place this Provider inside <SessionProvider> so it can read the session.
 *
 * - Calls useSmaregiEnabled exactly once per tenantCode (no re-fetch on navigation).
 * - Computes `baseMenuList` via useMemo — pure derived state, no useEffect/setState.
 * - Any component consuming useSmaregiEnabledContext() gets a stable reference
 *   and will NOT re-render unless role or smaregi result actually changes.
 */
export const SmaregiEnabledProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const tenantCode = session?.user?.tenantCode;
  const role = session?.user?.role;

  const { isEnabledSmaregi, loading, error } = useSmaregiEnabled(tenantCode);

  const baseMenuList = useMemo<Menu[]>(() => {
    if (role === ROLE.ADMIN) {
      if (!isEnabledSmaregi && !loading) {
        return MENU_LIST_ADMIN.filter(
          (menu) =>
            menu.path !== ROUTE.ADMIN_BARCODE_SCANNER &&
            menu.path !== ROUTE.ADMIN_SCAN_MANAGEMENT
        );
      }
      return MENU_LIST_ADMIN;
    }
    return MENU_LIST_SUPER_ADMIN;
  }, [role, isEnabledSmaregi, loading]);

  const value = useMemo(
    () => ({ isEnabledSmaregi, loading, error, baseMenuList }),
    [isEnabledSmaregi, loading, error, baseMenuList]
  );

  return (
    <SmaregiEnabledContext.Provider value={value}>
      {children}
    </SmaregiEnabledContext.Provider>
  );
};

export const useSmaregiEnabledContext = () => useContext(SmaregiEnabledContext);
