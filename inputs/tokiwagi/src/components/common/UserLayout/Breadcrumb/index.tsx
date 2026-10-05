import Image from "next/legacy/image";
import Link from "next/link";
import React from "react";

import { ROUTE } from "constants/route";
import { isLimitedIpRoute } from "utils/ipLimitedRoute";
import ChevronRightImage from "statics/images/user/chevron-right.svg";

export interface Props {
    title: string;
    link?: string;
}

// IP-limited routes must be reached via a full-page navigation: next/link client
// transitions do not reliably follow the middleware's redirect to /403, so a blocked
// user would still land on the page. A plain <a> issues a document request that the
// middleware can redirect. Non-limited routes keep client-side routing via <Link>.
const BreadcrumbLink = ({ href, className, children }: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) => {
  if (isLimitedIpRoute(href)) {
    return <a href={href} className={className}>{children}</a>;
  }
  return (
    <Link href={href} passHref legacyBehavior>
      <span className={className}>{children}</span>
    </Link>
  );
};

const Breadcrumb = ({ title }: Props) => {
  return (
    <div>
      <div className="flex items-center mt-6 gap-x-1 xs:hidden">
        <BreadcrumbLink href={ROUTE.INDEX} className="text-lg font-bold cursor-pointer text-blue-color">
          トップ
        </BreadcrumbLink>

        <div className="flex">
          <Image src={ChevronRightImage} alt={"icon"} />
          <span className="relative text-lg font-medium text-blue-color">
            {title}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
