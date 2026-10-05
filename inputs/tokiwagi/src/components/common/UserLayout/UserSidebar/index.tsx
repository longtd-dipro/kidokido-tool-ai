import React from "react";
import { useRouter } from "next/router";
import Image from "next/legacy/image";
import Link from "next/link";

import { splitToFeaturePathname } from "utils/menu";
import { MENU_LIST_USER } from "constants/settings";

import styles from "./index.module.scss";

const UserSidebar = () => {
  const router = useRouter();

  const checkIsActive = (menuPath: string) => {
    const featurePathname = splitToFeaturePathname(router.pathname, true);
    return menuPath === featurePathname;
  };

  return (
    <div className={`${styles.sidebar} w-full h-screen pt-8 mdonly:hidden xs:hidden`}>
      {MENU_LIST_USER.map(({ id, icons, path, title }) => (
        <div key={id} className="">
          <Link passHref href={path} legacyBehavior>
            <div
              className={`${styles.menu} ${checkIsActive(path) && styles.active} py-4 pl-4 pr-6
              hover:transition-all ease-in-out cursor-pointer`}
            >
              <a className={`${styles.link} flex items-center`}>
                <span className="mr-4">
                  <Image src={checkIsActive(path) ? icons.active : icons.inactive} alt="logo" />
                </span>
                <span className="text-base mdup:text-[18px]">{title}</span>
              </a>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default React.memo(UserSidebar);
