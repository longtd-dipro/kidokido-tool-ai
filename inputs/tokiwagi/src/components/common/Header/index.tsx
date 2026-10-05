import { IconButton } from "@mui/material";
import { signOut, useSession } from "next-auth/react";
import Image from "next/legacy/image";
import Link from "next/link";
import { useState } from "react";

import ConfirmationSignOutDialog from "components/common/ConfirmationSignOut";
import MobileHeaderMenuDrawer from "components/common/Header/MobileHeaderMenuDrawer";
import { useQrRedirect } from "libs/hooks/useQrRedirect";
import { SESSION_STATUS, SHOW_REQUIRED_LOGIN_POPUP_STORAGE_KEY } from "constants/common";
import { ROUTE } from "constants/route";
import KidOKidIcon from "statics/images/kid-o-kid.svg";
import LineDottedVertical from "statics/images/line-dotted-vertical.svg";
import LogoutIcon from "statics/images/log-out.svg";
import LogoIcon from "statics/images/logo-header.svg";
import UserIcon from "statics/images/user.svg";
import HeaderTopArea from "components/common/Header/HeaderTopArea";
import MobileHeaderSidebarDrawer from "components/common/Header/MobileHeaderSidebarDrawer";

import styles from "./Header.module.scss";

export default function Header() {
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);
  const [isShowSignOutConfirmation, setIsShowSignOutConfirmation] = useState<boolean>(false);
  const { data: session, status } = useSession();
  const { signInHref } = useQrRedirect();

  if (status === SESSION_STATUS.LOADING) {
    return (
      <div className="spinner" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  const toggleMenu = () => {
    setIsOpenMenu(!isOpenMenu);
  };

  const toggleSideBar = () => {
    setIsOpenSidebar(!isOpenSidebar);
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

  const handleClickSignOutMobile = () => {
    toggleMenu();
    handleClickSignOut();
  };

  const handleSignOut = async (e) => {
    e.preventDefault();
    await sessionStorage.removeItem(SHOW_REQUIRED_LOGIN_POPUP_STORAGE_KEY);
    await signOut({ callbackUrl: ROUTE.INDEX });
  };

  return (
    <header className="w-full xs:fixed xs:z-50 xs:top-0 xs:left-0">
      {/*DESKTOP*/}
      <div className="xs:hidden mdonly:hidden bar-bg">
        {/*Header links*/}
        <div>
          <ul className={`${styles["header-list"]} flex justify-end items-center gap-10 h-16 sm:flex-row md:mt-0 md:text-sm md:font-medium`}>
            {/* KidoKido */}
            <li className="py-2 pr-4 pl-3 cursor-pointer">
              <a href="https://kidokid.bornelund.co.jp/" target="_blank" rel="noopener noreferrer" className="text-xl flex items-center">
                キドキドとは
                <IconButton>
                  <Image src={KidOKidIcon} width={18} height={18} alt="KidOKid" />
                </IconButton>
              </a>
            </li>

            {/* Playville */}
            <li className="py-2 pr-4 pl-3 cursor-pointer">
              <a href="https://playville.bornelund.co.jp/" target="_blank" rel="noopener noreferrer" className="text-xl flex items-center">
                プレイヴィルとは
                <IconButton>
                  <Image src={KidOKidIcon} width={18} height={18} alt="プレイヴィルとは" />
                </IconButton>
              </a>
            </li>

            {/* FAQ */}
            {/* <Link passHref href="#" legacyBehavior>
              <li className="py-2 pr-4 pl-3 cursor-pointer">
                <a className="text-xl">
                  よくある質問
                </a>
              </li>
            </Link> */}

            {!session && (
              <div className="flex w-80 h-full gap-0">
                {/* Signup — IP-limited, use a full-page <a> so middleware can redirect to /403 */}
                <a href={ROUTE.SIGN_UP} className={`${styles["btn-signup"]} flex w-40 items-center justify-center cursor-pointer`}>
                  <span className="text-xl">新規利用登録</span>
                </a>

                {/* Signin — IP-limited, use a full-page <a> so middleware can redirect to /403 */}
                <a href={signInHref} className={`${styles["btn-signin"]} flex w-40 items-center justify-center cursor-pointer`}>
                  <span className="text-xl text-white">ログイン</span>
                </a>
              </div>
            )}

            {session && (
              <div className="flex h-full gap-4 self-end pl-24 pr-11">
                {/* Mypage */}
                <Link passHref href={ROUTE.USER_HISTORY_BOOKINGS} legacyBehavior>
                  <a className="flex flex-col w-20 items-center justify-center cursor-pointer">
                    <IconButton aria-label="user">
                      <Image src={UserIcon} width={24} height={24} alt="user" />
                    </IconButton>
                    <span className="text-base">マイページ</span>
                  </a>
                </Link>

                {/* Signout */}
                <div className="flex flex-col w- items-center justify-center cursor-pointer" onClick={() => handleClickSignOut()}>
                  <IconButton aria-label="user">
                    <Image src={LogoutIcon} width={25} height={25} alt="user" />
                  </IconButton>
                  <a className="text-base">ログアウト</a>
                </div>
              </div>
            )}
          </ul>
        </div>

        {/*Menu*/}
        <nav className="container min-w-full">
          <div className={`${styles["header-menu-list"]} flex items-center bg:[#F4FAFF] max-w-full justify-between px-7 h-[152px]`}>
            {/*Logo*/}
            <div className="my-4 ml-[36px]">
              <Link href="/" legacyBehavior>
                <a>
                  <Image src={LogoIcon} width={316} height={113} alt="Logo" />
                </a>
              </Link>
            </div>
            {/*Menu*/}
            <div className="xs:hidden mdonly:hidden" id="navbar-default">
              <ul
                className="flex flex-row xs:flex-col mt-4 justify-center items-center gap-x-7
            md:mt-0 md:text-sm md:font-medium"
              >
                {/* dotted Border */}
                <li className="mx-5">
                  <Image src={LineDottedVertical} alt="Line Dotted Vertical" />
                </li>

                {/* Use on the day */}
                <li className="pr-4 pl-3 md:bg-transparent md:p-0 cursor-pointer lg:pr-0 lg:pl-0">
                  <Link href={ROUTE.USE_IN_DAY_BOOKING} legacyBehavior>
                    <a className="text-xl font-bold">当日利用</a>
                  </Link>
                </li>

                <li className="mx-5">
                  <Image src={LineDottedVertical} alt="Line Dotted Vertical" />
                </li>

                {/* Money plan */}
                <li className="pr-4 pl-3 md:p-0 cursor-pointer lg:pr-0 lg:pl-0">
                  <Link href={ROUTE.BUY_TIMES_LIMIT_TICKET} legacyBehavior>
                    <a className="text-xl font-bold">回数券購入</a>
                  </Link>
                </li>

                <li className="mx-5">
                  <Image src={LineDottedVertical} alt="Line Dotted Vertical" />
                </li>

                {/* 1 Day Reservation/Online purchase */}
                <li className="pr-4 pl-3 md:p-0 cursor-pointer lg:pr-0 lg:pl-0">
                  <Link href={ROUTE.BOOKING_PAYMENT_ONLINE} legacyBehavior>
                    <a className="text-xl font-bold">1DAYパス事前購入</a>
                  </Link>
                </li>

                <li className="mx-5">
                  <Image src={LineDottedVertical} alt="Line Dotted Vertical" />
                </li>

                {/* Monthly/Annual Reservation/Online purchase */}
                <li className="pr-4 pl-3 md:p-0 cursor-pointer lg:pr-0 lg:pl-0">
                  <Link href={ROUTE.BUY_MONTHLY_TICKET} legacyBehavior>
                    <a className="text-xl font-bold">年間・マンスリーパス購入</a>
                  </Link>
                </li>

                <li className="mx-5">
                  <Image src={LineDottedVertical} alt="Line Dotted Vertical" />
                </li>

                {/* Wait time/Sales status */}
                <li className="pr-4 pl-3 md:p-0 cursor-pointer lg:pr-0 lg:pl-0">
                  <Link href={ROUTE.VACANCY_STATUS} legacyBehavior>
                    <a className="text-xl font-bold">待ち時間/販売状況</a>
                  </Link>
                </li>

                <li className="mx-5">
                  <Image src={LineDottedVertical} alt="Line Dotted Vertical" />
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>

      {/*MOBILE & TABLET*/}
      <div className="mdup:hidden">
        <nav className="container min-w-full">
          {/*Top Bar*/}
          {<HeaderTopArea onToggleMenu={toggleMenu} onToggleSidebar={toggleSideBar} />}

          {/*Menu mobile*/}
          <MobileHeaderMenuDrawer isOpen={isOpenMenu} onToggle={toggleMenu} onSignOut={handleClickSignOutMobile} />

          {/*Sidebar mobile */}
          <MobileHeaderSidebarDrawer isOpen={isOpenSidebar} onToggle={toggleSideBar} />
        </nav>
      </div>

      <div className="user">
        {isShowSignOutConfirmation && <ConfirmationSignOutDialog onAccept={handleSignOut} onDismiss={hideSignOutConfirmationDialog} />}
      </div>
    </header>
  );
}
