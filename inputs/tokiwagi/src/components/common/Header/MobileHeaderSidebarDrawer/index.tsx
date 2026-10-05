import { Drawer } from "@mui/material";
import * as React from "react";

import UserSidebarMobile from "components/common/UserLayout/UserSideBarMobile";

import styles from "../Header.module.scss";

export interface Props {
  isOpen: boolean;
  onToggle: () => void;
}

export default function MobileHeaderSidebarDrawer({ isOpen, onToggle }: Props) {
  return (
    <div>
      <Drawer
        variant="temporary"
        open={isOpen}
        onClose={onToggle}
        ModalProps={{
          keepMounted: true,
        }}
        anchor={"right"}
        className={`${styles["header-drawer"]}`}
      >
        <UserSidebarMobile toggleSideBar={onToggle} />
      </Drawer>
    </div>
  );
}
