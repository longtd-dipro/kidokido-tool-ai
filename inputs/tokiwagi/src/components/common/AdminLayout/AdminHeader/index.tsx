import React, { useMemo, useState } from "react";
import Image from "next/legacy/image";
import { IconButton, Link } from "@mui/material";

import CloseIcon from "statics/images/close.svg";
import LogoIcon from "statics/images/logo-header.svg";
import MenuIcon from "statics/images/menu.svg";
import { useSmaregiEnabledContext } from "contexts/SmaregiEnabledContext";

import AdminSidebar from "../AdminSidebar";

import styles from "./AdminHeader.module.scss";

export default function AdminTabletHeader() {
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [openMenuIds, setOpenMenuIds] = useState<Set<number>>(new Set());

  const toggleMenu = () => {
    setIsOpenMenu(!isOpenMenu);
  };

  const { baseMenuList } = useSmaregiEnabledContext();

  // Merge stable base list with local open/close state — no useEffect needed.
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
    <header className="d-flex flex">
      <div className="w-3/12">
        <nav className="container min-w-full">
          {/*Top Bar*/}
          <div
            className={`${!isOpenMenu ? "" : "hidden"} ${styles["header-menu-list"]}
        flex items-center xs:bg-[#68b5ff] max-w-full justify-between px-5 h-[80px]`}
          >
            {/*Icons*/}
            <div className="flex self-start pt-4">
              {/*Menu*/}
              <IconButton aria-label="menu" onClick={() => toggleMenu()}>
                <Image src={MenuIcon} width={24} height={24} alt="Logo" />
              </IconButton>
            </div>
          </div>

          {/*Menu*/}
          <div className={`${isOpenMenu ? "" : "hidden"}`} style={{ backgroundColor: "#f4faff" }}>
            <div className="">
              <Link href="#"></Link>
              <div className="">
                <IconButton aria-label="close" onClick={() => toggleMenu()} className="px-0">
                  <Image src={CloseIcon} width={24} height={24} alt="Logo" />
                </IconButton>
              </div>
            </div>
            <AdminSidebar menuList={menuList} onToggleSubMenu={handleToggleSubMenu}></AdminSidebar>
          </div>
        </nav>
      </div>

      <div className="w-9/12" style={{ backgroundColor: isOpenMenu ? "rgba(0, 0, 0, 0.5)" : "#f4faff" }}>
        {!isOpenMenu && (
          <div className="text-right pt-4 pr-8">
            <a href="#">
              <Image src={LogoIcon} width={138} height={48} alt="Logo" />
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
