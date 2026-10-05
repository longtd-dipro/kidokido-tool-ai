import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import BarcodeScanner from "components/BarcodeScanner";
import AdminLayout from "components/common/AdminLayout";
import NotificationDialog from "components/User/NotificationDialog";
import {
  BARCODE_SCANNER_FULLSCREEN_QUERY_KEY,
  BARCODE_SCANNER_FULLSCREEN_QUERY_VALUE,
  BARCODE_SCANNER_PATH,
  CHECK_IN_OUT_TENANT_VERSION,
  ROLE,
} from "constants/common";
import { ROUTE } from "constants/route";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { withEnabledSmaregi } from "libs/hoc/withEnabledSmaregi";

const SCANNER_PATH = BARCODE_SCANNER_PATH;
const FULLSCREEN_QUERY_KEY = BARCODE_SCANNER_FULLSCREEN_QUERY_KEY;
const FULLSCREEN_QUERY_VALUE = BARCODE_SCANNER_FULLSCREEN_QUERY_VALUE;

const BarcodeScannerPage = () => {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const isFullscreen = router.query[FULLSCREEN_QUERY_KEY] === FULLSCREEN_QUERY_VALUE;
  const [isShowLogoutConfirm, setIsShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (isFullscreen && session?.user && !session.user.kioskMode) {
      updateSession({ kioskMode: true });
    }
  }, [isFullscreen, session?.user, session?.user?.kioskMode, updateSession]);

  useEffect(() => {
    if (!isFullscreen) return undefined;

    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isFullscreen]);

  const handleEnterFullscreen = () => {
    router.push(`${SCANNER_PATH}?${FULLSCREEN_QUERY_KEY}=${FULLSCREEN_QUERY_VALUE}`);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: ROUTE.ADMIN_SIGN_IN });
  };

  const isV2Tenant = session?.user?.tenantAllowedVersion === CHECK_IN_OUT_TENANT_VERSION;
  const canOpenKiosk = session?.user?.role !== ROLE.SUPER_ADMIN && isV2Tenant;

  if (isFullscreen) {
    return (
      <div className="relative min-h-screen bg-[#f1f5f9]">
        <div className="absolute right-4 top-4 z-10 flex gap-3">
          <button
            type="button"
            onClick={() => setIsShowLogoutConfirm(true)}
            className="w-[158px] rounded-md border border-[#006DC6] bg-white px-4 py-2 text-sm font-semibold text-[#006DC6] shadow-sm"
          >
            ログアウト
          </button>
        </div>

        <BarcodeScanner isV2={isV2Tenant} />

        {isShowLogoutConfirm && (
          <NotificationDialog
            isOpen={isShowLogoutConfirm}
            message={
              <p className="text-center text-[20px] leading-[28px] font-semibold xs:text-base">ログアウトしますか?</p>
            }
            okLabel="ログアウト"
            onOk={handleLogout}
            onClose={() => setIsShowLogoutConfirm(false)}
            paperClassName="!border !border-solid !rounded-[10px] !overflow-hidden !shrink-0 h-[224px] w-[540px]"
            buttonClassName="whitespace-nowrap !rounded-[40px] !bg-[#0068B7] !text-[20px] !font-semibold !w-[386px] h-[56px] xs:!w-[240px] xs:h-[48px]"
          />
        )}
      </div>
    );
  }

  return (
    <AdminLayout breadcrumb={[{ title: "" }]}>
      {canOpenKiosk && (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={handleEnterFullscreen}
            className="w-[200px] h-[48px] rounded-md bg-gradient-to-b from-[#2CABF3] to-[#514A9D] px-4 py-2 text-sm font-semibold text-white"
          >
            全画面にする
          </button>
        </div>
      )}
      <BarcodeScanner isV2={isV2Tenant} />
    </AdminLayout>
  );
};

export default withEnabledSmaregi(withAuthentication(BarcodeScannerPage, [ROLE.ADMIN, ROLE.SUPER_ADMIN, ROLE.STAFF]));
