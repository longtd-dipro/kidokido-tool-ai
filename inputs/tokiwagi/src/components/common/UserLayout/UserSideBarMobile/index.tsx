import Link from "next/link";
import Image from "next/legacy/image";
import { IconButton } from "@mui/material";
import { signOut, useSession } from "next-auth/react";
import React from "react";
import router from "next/router";

import LogoIcon from "statics/images/logo-header.svg";
import CloseIcon from "statics/images/close.svg";
import UserIcon from "statics/images/user.svg";
import { ROUTE } from "constants/route";
import LineDottedHorizontal from "statics/images/line-dotted-horizontal.svg";
import styles from "components/common/Header/Header.module.scss";
import { splitToFeaturePathname } from "utils/menu";
import { MENU_LIST_USER } from "constants/settings";
import Button from "components/common/Buttons/Button";

interface Props {
  toggleSideBar: () => void;
}

const UserSidebarMobile = ({ toggleSideBar }: Props) => {
  const { data: session } = useSession();

  const checkIsActive = (menuPath: string) => {
    const featurePathname = splitToFeaturePathname(router.pathname, true);
    return menuPath === featurePathname;
  };

  // /signin and /signup are IP-limited. Use a full-page navigation so the middleware
  // can redirect to /403 (router.push is client-side and won't follow that redirect).
  const redirectSignIn = () => {
    window.location.href = ROUTE.SIGN_IN;
  };

  const redirectSignUp = () => {
    window.location.href = ROUTE.SIGN_UP;
  };

  const redirectMyPage = () => {
    router.push(ROUTE.USER_MY_PAGE);
  };

  const processSignOut = () => {
    signOut({ callbackUrl: ROUTE.INDEX });
  };

  return (
    <div className="w-[315px] px-3">
      <div className="flex justify-between w-auto h-auto">
        <Link passHref href="/" legacyBehavior>
          <a className="flex items-center gap-3 ">
            <div className="md:max-w-full max-w-[75%] mb-4 mt-[11px]">
              <Image src={LogoIcon} width={152} height={53} alt="Logo" />
            </div>
          </a>
        </Link>
        <div className="flex h-full self-start">
          <IconButton aria-label="close" onClick={() => toggleSideBar()} className="px-0">
            <Image src={CloseIcon} width={24} height={24} alt="Logo" />
          </IconButton>
        </div>
      </div>
      <div className="flex items-center">
        <IconButton aria-label="user">
          <Image src={UserIcon} width={24} height={24} alt="Logo" />
        </IconButton>
        {session ? (
          <div className="mx-2 flex gap-2 ml-[18px]">
            <Button variant="outlined" className="!text-base !font-medium !px-[10px]" onClick={redirectMyPage}>
              マイページ
            </Button>
            <Button variant="outlined" className="!text-base !font-medium !px-[10px]" onClick={processSignOut}>
              ログアウト
            </Button>
          </div>
        ) : (
          <div className="mx-2 flex gap-2 ml-[18px]">
            <Button variant="outlined" className="!text-base !font-medium !px-[10px]" onClick={redirectSignIn}>
              ログイン
            </Button>
            <Button variant="outlined" className="!text-base !font-medium !px-[10px]" onClick={redirectSignUp}>
              会員登録
            </Button>
          </div>
        )}
      </div>
      <Image src={LineDottedHorizontal} alt="Line Dotted Horizontal" />
      {session && (
        <div className={"w-full mt-5 px-2"}>
          {MENU_LIST_USER.map(({ id, icons, path, title }) => (
            <div key={id} className="">
              <Link passHref href={path} legacyBehavior>
                <div className={`${styles.menu} ${checkIsActive(path) && styles.active} mb-6 hover:transition-all ease-in-out cursor-pointer`}>
                  <a className={`${styles.link} flex items-center`}>
                    <span className="mr-4">
                      <Image src={checkIsActive(path) ? icons.active : icons.inactive} alt="logo" />
                    </span>
                    <span className="text-base">{title}</span>
                  </a>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSidebarMobile;
