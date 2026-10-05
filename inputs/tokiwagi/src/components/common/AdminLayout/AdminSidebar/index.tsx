import CircleIcon from "@mui/icons-material/Circle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Image from "next/legacy/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { MouseEvent, useState } from "react";
import { signOut, useSession } from "next-auth/react";

import LogOut from "statics/images/logout-icon.svg";
import ConfirmationSignOutDialog from "components/common/ConfirmationSignOut";
import { Menu, SubMenu } from "models/Menu";
import Logo from "statics/images/admin-logo.svg";
import { splitToFeaturePathname } from "utils/menu";
import { ROUTE } from "constants/route";

import styles from "./index.module.scss";

type Props = {
  menuList: Menu[];
  onToggleSubMenu: (menuId: number) => void;
};

export default function AdminSidebar({ menuList, onToggleSubMenu }: Props) {
  const [isShowSignOutConfirmation, setIsShowSignOutConfirmation] = useState<boolean>(false);
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const checkIsActive = (menuPath: string, subMenuItems?: SubMenu[]) => {
    const featurePathname = splitToFeaturePathname(router.pathname);
    return menuPath === featurePathname || subMenuItems?.some((item) => item.path === featurePathname);
  };

  const handleToggleSubMenu = (e: MouseEvent, menuId: number) => {
    onToggleSubMenu(menuId);
    e.preventDefault();
  };

  const showSignOutConfirmationDialog = () => {
    setIsShowSignOutConfirmation(true);
  };

  const hideSignOutConfirmationDialog = () => {
    setIsShowSignOutConfirmation(false);
  };

  const handleClickSignOut = () => {
    showSignOutConfirmationDialog();
  };

  const handleSignOut = async (e) => {
    e.preventDefault();
    await signOut({ callbackUrl: ROUTE.ADMIN_SIGN_IN });
  };

  return (
    <div className={`${styles.sidebar} admin w-full h-screen pt-8 relative`}>
      <div className="flex justify-center pb-6">
        <Image src={Logo} alt="logo" />
      </div>
      <div className={`pt-2 pl-5 pr-2 ${styles.menuList}`}>
        {menuList.map(({ id, icons, path, title, hasSubMenu, subMenuItems, isOpen, checkActive: checkOpen }) => {
          const isMenuOpen = isOpen || checkOpen?.(router.pathname) || checkIsActive(path, subMenuItems);

          return (
            <div key={id} className="mb-2">
              <div className={`${styles.menu} ${isMenuOpen && styles.active} ${isMenuOpen && hasSubMenu && styles.hasSubmenu} py-4 pl-4 pr-1 `}>
                <Link passHref href={hasSubMenu ? "" : path} legacyBehavior>
                  <a className={`${styles.link} flex items-center `} onClick={(e) => hasSubMenu && handleToggleSubMenu(e, id)}>
                    <span className="mr-4">
                      <Image src={isMenuOpen ? icons.active : icons.inactive} alt="logo" />
                    </span>
                    <span>{title}</span>
                    {hasSubMenu && (
                      <span className="ml-auto" onClick={(e) => handleToggleSubMenu(e, id)}>
                        {isMenuOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </span>
                    )}
                  </a>
                </Link>
              </div>

              {hasSubMenu && isMenuOpen && (
                <ul>
                  {subMenuItems.map((subMenuItem) => {
                    const subMenuActive = subMenuItem.checkActive ? subMenuItem.checkActive(router.pathname) : checkIsActive(subMenuItem.path);
                    return (
                      <Link key={subMenuItem.title} passHref href={subMenuItem.path} legacyBehavior>
                        <li
                          className={`
                          ${styles.subMenu} 
                          ${subMenuActive && styles.active}
                          text-sm flex items-center gap-x-4 cursor-pointer py-1 px-2 mr-4 ml-8 mb-2 duration-200
                          `}
                        >
                          <a className="flex items-center">
                            <CircleIcon style={{ width: 6 }} />
                            <span className="ml-2">{subMenuItem.title}</span>
                          </a>
                        </li>
                      </Link>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
        <div className="absolute bottom-0 md:mb-9 py-4 pl-4 pr-1">
          {!!user?.tenantName && <p className="font-medium mb-2 break-all">{user?.tenantName}でログイン中</p>}
          <a className={`${styles.link} flex items-center cursor-pointer`} onClick={handleClickSignOut}>
            <span className="mr-4">
              <Image src={LogOut} alt="logo" />
            </span>
            <span className="text-[#DC0404]">ログアウト</span>
          </a>
        </div>
      </div>
      {isShowSignOutConfirmation && <ConfirmationSignOutDialog onAccept={handleSignOut} onDismiss={hideSignOutConfirmationDialog} />}
    </div>
  );
}
