import { useRouter } from "next/router";
import { ReactNode } from "react";

import { MENU_LIST_USER } from "constants/settings";
import { createHeadingByPathname, splitToFeaturePathname } from "utils/menu";
import { ROLE } from "constants/common";
import { withAuthentication } from "libs/hoc/withAuthentication";

import Header from "../Header";
import Footer from "../Footer";

import UserSidebar from "./UserSidebar";
import UserPageHeading from "./UserPageHeading";
import { BreadcrumbItem } from "./BreadcrumbList";

type Props = {
  children: ReactNode;
  heading?: string;
  title?: string;
  link?: string;
  breadcrumbItems?: BreadcrumbItem[];
};

const UserLayout = ({ children, heading, title, link, breadcrumbItems }: Props) => {
  const router = useRouter();

  const featurePathname = splitToFeaturePathname(router.pathname, true);

  return (
    <>
      <Header />
      <div className={"user flex mb-14 xs:mt-[80px]"}>
        <div className="max-w-[350px] flex-0 bg-side-bar">
          <UserSidebar />
        </div>
        <div className="flex-1 mx-8 xs:mx-0 md:mx-[40px]">
          {!!featurePathname && (
            <div className="mb-8 xs:mx-5">
              <UserPageHeading
                heading={heading ?? createHeadingByPathname(featurePathname, MENU_LIST_USER)}
                title={title}
                link={link}
                breadcrumbItems={breadcrumbItems}
              />
            </div>
          )}
          <div className="max-w-[856px] mx-auto">{children}</div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default withAuthentication(UserLayout, [ROLE.USER]);
