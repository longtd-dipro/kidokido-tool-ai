import { Drawer } from "@mui/material";
import * as React from "react";

import HeaderDrawerMenuList from "components/common/Header/MobileHeaderMenuDrawer/HeaderDrawerMenuList";

import styles from "../Header.module.scss";

export interface Props {
  isOpen: boolean;
  onToggle: () => void;
  onSignOut: () => void;
}

export default function MobileHeaderMenuDrawer({ isOpen, onToggle, onSignOut }: Props) {
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
        <HeaderDrawerMenuList onToggleMenu={onToggle} onSignOut={onSignOut} />
      </Drawer>
    </div>
  );
}
