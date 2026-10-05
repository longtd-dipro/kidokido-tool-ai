import { Menu } from "models/Menu";

export const splitToFeaturePathname = (pathname: string, isUserSite = false) => {
  const pathnameItems = pathname.split("/");
  const featurePathnameItems = [pathnameItems[0], pathnameItems[1], pathnameItems[2]];
  
  if (isUserSite) {
    featurePathnameItems.push(pathnameItems[3]);
  }

  return featurePathnameItems.join("/");
};

export const findMenuItemByPathname = (pathname: string, menuList: Menu[]) => {
  return menuList.find((menu) => menu.path === pathname || menu.subMenuItems?.some((item) => item.path === pathname));
};

export const createHeadingByPathname = (pathname: string, menuList: Menu[]) => {
  const menu = findMenuItemByPathname(pathname, menuList);

  if (!menu) {
    return "";
  }

  if (menu.hasSubMenu) {
    const subMenu = menu.subMenuItems.find((item) => item.path === pathname);
    return subMenu.heading ?? subMenu.title;
  }

  return menu.heading ?? menu.title;
};

export const createBreadcrumbDataByMenuItem = (pathname: string, menuList: Menu[]) => {
  const menu = findMenuItemByPathname(pathname, menuList);
  if (!menu) {
    return [];
  }

  if (!menu.hasSubMenu) {
    return [{ title: menu.title }];
  }

  const subMenu = menu.subMenuItems.find((item) => item.path === pathname);
  return [{ title: menu.title }, { title: subMenu.title }];
};
