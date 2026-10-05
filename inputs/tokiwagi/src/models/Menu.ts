export type SubMenu = {
  title: string;
  heading?: string;
  path: string;
  checkActive?: (routePath: string) => boolean;
};

export type Menu = {
  id: number;
  title: string;
  heading?: string;
  path?: string;
  icons: {
    active: any;
    inactive: any;
    hover?: any;
  };
  hasSubMenu?: boolean;
  subMenuItems?: SubMenu[];
  isOpen?: boolean;
  checkActive?: (routePath: string) => boolean;
};
