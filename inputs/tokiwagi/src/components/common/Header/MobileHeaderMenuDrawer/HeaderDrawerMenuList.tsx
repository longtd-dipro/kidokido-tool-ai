import Image from "next/legacy/image";
import Link from "next/link";
import * as React from "react";
import { IconButton } from "@mui/material";
import Brightness1OutlinedIcon from "@mui/icons-material/Brightness1Outlined";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { useQrRedirect } from "libs/hooks/useQrRedirect";
import { ROUTE } from "constants/route";
import CloseIcon from "statics/images/close.svg";
import LogoIcon from "statics/images/logo-header.svg";
import UserIcon from "statics/images/user.svg";
import LineDottedHorizontal from "statics/images/line-dotted-horizontal.svg";
import KidOKidIcon from "statics/images/kid-o-kid.svg";
import Button from "components/common/Buttons/Button";

export interface Props {
  onToggleMenu: () => void;
  onSignOut: () => void;
}

export default function HeaderDrawerMenuList({ onToggleMenu, onSignOut }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const { signInHref } = useQrRedirect();

  // /signin and /signup are IP-limited. Use a full-page navigation so the middleware
  // can redirect to /403 (router.push is client-side and won't follow that redirect).
  const redirectSignIn = () => {
    window.location.href = signInHref;
  };

  const redirectSignUp = () => {
    window.location.href = ROUTE.SIGN_UP;
  };

  const redirectMyPage = () => {
    router.push(ROUTE.USER_MY_PAGE);
  };

  return (
    <div className={"w-[315px] px-3 transition-all duration-200 ease-in-out"}>
      <div className="flex justify-between w-auto h-auto">
        <Link passHref href="/" legacyBehavior>
          <a className="flex items-center gap-3 ">
            <div className="md:max-w-full max-w-[75%] mt-[11px]">
              <Image src={LogoIcon} width={152} height={53} alt="Logo" />
            </div>
          </a>
        </Link>
        <div className="flex h-full self-start">
          <IconButton aria-label="close" onClick={() => onToggleMenu()} className="px-0">
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
            <Button variant="outlined" className="!text-base !font-medium !px-[10px]" onClick={onSignOut}>
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
      <ul className="mt-5 px-3">
        <Link passHref href={ROUTE.USE_IN_DAY_BOOKING} legacyBehavior>
          <li className="mb-5">
            <a className="cursor-pointer text-2xl xs:!text-[19.2px] font-bold hover:underline">
              <Brightness1OutlinedIcon style={{ width: 10 }}></Brightness1OutlinedIcon>
              <span className="ml-2">当日利用</span>
            </a>
          </li>
        </Link>
        <Link passHref href={ROUTE.BUY_TIMES_LIMIT_TICKET} legacyBehavior>
          <li className="mb-5">
            <a className="cursor-pointer text-2xl xs:!text-[19.2px] font-bold hover:underline">
              <Brightness1OutlinedIcon style={{ width: 10 }}></Brightness1OutlinedIcon>
              <span className="ml-2">回数券購入</span>
            </a>
          </li>
        </Link>
        {/* 1 Day Reservation/Online purchase */}
        <Link passHref href={ROUTE.BOOKING_PAYMENT_ONLINE} legacyBehavior>
          <li className="mb-5">
            <a className="cursor-pointer text-2xl xs:!text-[19.2px] font-bold hover:underline">
              <Brightness1OutlinedIcon style={{ width: 10 }}></Brightness1OutlinedIcon>
              <span className="ml-2">1DAYパス事前購入</span>
            </a>
          </li>
        </Link>
        {/* Monthly/Annual Reservation/Online purchase */}
        <Link passHref href={ROUTE.BUY_MONTHLY_TICKET} legacyBehavior>
          <li className="mb-5">
            <a className="cursor-pointer text-2xl xs:!text-[19.2px] font-bold hover:underline">
              <Brightness1OutlinedIcon style={{ width: 10 }}></Brightness1OutlinedIcon>
              <span className="ml-2">年間・マンスリーパス購入</span>
            </a>
          </li>
        </Link>
        <Link passHref href={ROUTE.VACANCY_STATUS} legacyBehavior>
          <li className="mb-5">
            <a className="cursor-pointer text-2xl xs:!text-[19.2px] font-bold hover:underline">
              <Brightness1OutlinedIcon style={{ width: 10 }}></Brightness1OutlinedIcon>
              <span className="ml-2">待ち時間/販売状況</span>
            </a>
          </li>
        </Link>
        <Link passHref href="https://www.bornelund.co.jp/page/play-reserve_2301">
          <li className="mb-5">
            <a className="cursor-pointer text-2xl xs:!text-[19.2px] font-bold hover:underline">
              <Brightness1OutlinedIcon style={{ width: 10 }}></Brightness1OutlinedIcon>
              <span className="ml-2">よくある質問</span>
            </a>
          </li>
        </Link>
        {/* KidoKido */}
        <Link passHref href="https://kidokid.bornelund.co.jp">
          <li className="mb-5">
            <a className="cursor-pointer text-2xl xs:!text-[19.2px] font-bold hover:underline flex items-center">
              <Brightness1OutlinedIcon style={{ width: 10 }}></Brightness1OutlinedIcon>
              <span className="ml-2">キドキドとは</span>
              <IconButton className="mr-3">
                <Image src={KidOKidIcon} width={18} height={18} alt="KidOKid" />
              </IconButton>
            </a>
          </li>
        </Link>
        {/* Playville */}
        <Link passHref href="https://playville.bornelund.co.jp/">
          <li className="mb-5">
            <a className="cursor-pointer text-2xl xs:!text-[19.2px] font-bold hover:underline flex items-center">
              <Brightness1OutlinedIcon style={{ width: 10 }}></Brightness1OutlinedIcon>
              <span className="ml-2">プレイヴィルとは</span>
              <IconButton className="mr-3">
                <Image src={KidOKidIcon} width={18} height={18} alt="KidOKid" />
              </IconButton>
            </a>
          </li>
        </Link>
      </ul>
    </div>
  );
}
