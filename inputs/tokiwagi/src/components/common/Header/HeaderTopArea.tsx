import { IconButton } from "@mui/material";
import Image from "next/legacy/image";
import Link from "next/link";
import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import LogoIcon from "statics/images/logo-header.svg";
import UserIcon from "statics/images/user.svg";
import MenuIcon from "statics/images/menu.svg";
import ScanBarcodeIcon from "statics/images/scan-barcode.svg";
import { ROUTE } from "constants/route";

import styles from "./Header.module.scss";

export interface Props {
  onToggleMenu: () => void;
  onToggleSidebar: () => void;
}

export default function HeaderTopArea({ onToggleMenu, onToggleSidebar }: Props) {
  const { data: session } = useSession();
  const router = useRouter();

  const redirectToHistoryBookings = () => {
    router.push(ROUTE.USER_HISTORY_BOOKINGS);
  };

  return (
    <div
      className={`${styles["header-menu-list"]}
        flex items-center xs:bg-[#FFFFFF] max-w-full justify-between px-5 h-[80px] shadow-md`}
    >
      {/*Logo*/}
      <div className="my-4">
        <Link href="/" legacyBehavior>
          <a>
            <Image src={LogoIcon} width={152} height={53} alt="Logo" />
          </a>
        </Link>
      </div>

      {/*Icons*/}
      <div className="flex self-start py-2">
        {/*Scan barcode icon*/}
        {session &&
        <a>
          <IconButton onClick={() => redirectToHistoryBookings()}>
            <Image src={ScanBarcodeIcon} width={27} height={27} alt="scan-barcode" />
          </IconButton>
        </a>
        }
        {/*User*/}
        <a>
          <IconButton onClick={() => onToggleSidebar()}>
            <Image src={UserIcon} width={27} height={27} alt="user" />
          </IconButton>
        </a>
        {/*Menu*/}
        <IconButton aria-label="menu" onClick={() => onToggleMenu()}>
          <Image src={MenuIcon} width={27} height={27} alt="Logo" />
        </IconButton>
      </div>
    </div>
  );
}
