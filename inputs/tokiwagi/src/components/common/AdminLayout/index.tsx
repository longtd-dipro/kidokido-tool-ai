import { useRouter } from "next/router";
import { ReactNode, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Head from "next/head";

import AdminSidebar from "components/common/AdminLayout/AdminSidebar";
import AdminPageHeading from "components/common/AdminPageHeading";
import { createBreadcrumbDataByMenuItem, createHeadingByPathname, splitToFeaturePathname } from "utils/menu";
import PasswordConfirmationDialog from "components/common/PasswordConfirmationDialog";
import { selectPasswordConfirmation } from "stores/reducers/password-confirmation";
import { onReject, onResolve } from "utils/ui";
import { useDeviceDetector } from "libs/hooks/useDeviceDetector";
import CredentialsConfirmationDialog from "components/common/CredentialsConfirmationDialog";
import { selectCredentialsConfirmation } from "stores/reducers/credentials-confirmation";
import { useSmaregiEnabledContext } from "contexts/SmaregiEnabledContext";

import styles from "./index.module.scss";
import AdminTabletHeader from "./AdminHeader";

type Props = {
  children: ReactNode;
  heading?: string;
  breadcrumb?: { title: string }[];
};

const AdminLayout = ({ children, heading, breadcrumb }: Props) => {
  // openMenuIds tracks which sub-menus the user has expanded.
  // Kept separate from baseMenuList so navigation never resets it.
  const [openMenuIds, setOpenMenuIds] = useState<Set<number>>(new Set());

  const router = useRouter();
  const deviceDetector = useDeviceDetector();
  const { isShow } = useSelector(selectPasswordConfirmation());
  const { isShow: isShowCredentialsConfirmationDialog, loggedStaffId } = useSelector(selectCredentialsConfirmation());
  const featurePathname = splitToFeaturePathname(router.pathname);

  const { baseMenuList } = useSmaregiEnabledContext();

  // Merge the stable base list with local open/close state — no useEffect needed.
  const menuList = useMemo(
    () => baseMenuList.map((item) => ({ ...item, isOpen: openMenuIds.has(item.id) })),
    [baseMenuList, openMenuIds]
  );

  const handleToggleSubMenu = (menuId: number) => {
    setOpenMenuIds((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  };

  return (
    <>
      <Head>{deviceDetector.isMobile() && <meta name="viewport" content="width=768" />}</Head>
      <div className="relative">
        <div className="mdup:hidden absolute z-10 left-0 right-0">
          <AdminTabletHeader></AdminTabletHeader>
        </div>
        <div className={`${styles.container} admin flex`}>
          <div className={"w-[265px] md:w-[10px] mdonly:hidden fixed z-[1]"}>
            <AdminSidebar menuList={menuList} onToggleSubMenu={handleToggleSubMenu} />
          </div>

          <div className="w-full md:mt-4">
            <div className="ml-[265px] md:ml-[10px] mr-8 mb-8 pl-5 mdup:mt-8 md:mb-0  ">
              {featurePathname && menuList.length && (
                <div className="mb-8">
                  <AdminPageHeading
                    heading={heading ?? createHeadingByPathname(featurePathname, menuList)}
                    breadcrumbData={breadcrumb ?? createBreadcrumbDataByMenuItem(featurePathname, menuList)}
                  />
                </div>
              )}

              {children}
            </div>
          </div>
          {isShow && <PasswordConfirmationDialog onAccept={onResolve} onDismiss={onReject} />}

          {/*Credentials Confirmation Dialog*/}
          {isShowCredentialsConfirmationDialog && <CredentialsConfirmationDialog loggedStaffId={loggedStaffId} onAccept={onResolve} onDismiss={onReject} />}
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
