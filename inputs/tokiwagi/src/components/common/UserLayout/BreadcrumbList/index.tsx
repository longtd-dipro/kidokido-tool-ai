import Image from "next/legacy/image";
import Link from "next/link";
import React from "react";

import { isLimitedIpRoute } from "utils/ipLimitedRoute";
import ChevronRightImage from "statics/images/user/chevron-right.svg";

export interface BreadcrumbItem {
  label: string;
  // When omitted, the item is rendered as plain text (current page).
  href?: string;
}

export interface Props {
  items: BreadcrumbItem[];
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

// A multi-level breadcrumb (e.g. トップ > マイページ > 予約履歴 > 予約詳細).
// Items with an `href` render as links; items without one render as plain text.
// The last item (current page) is always rendered as plain, non-clickable text —
// even if it was given an `href` — since it represents the page the user is on.
const BreadcrumbList = ({ items }: Props) => {
  return (
    <div>
      <div className="flex items-center mt-6 gap-x-1 xs:hidden">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const fontWeight = isLast ? "font-medium" : "font-bold";

          return (
            <div key={index} className="flex items-center gap-x-1">
              {index > 0 && <Image src={ChevronRightImage} alt={"icon"} />}
              {item.href && !isLast ? (
                <BreadcrumbLink
                  href={item.href}
                  className={`relative text-lg ${fontWeight} cursor-pointer text-blue-color`}
                >
                  {item.label}
                </BreadcrumbLink>
              ) : (
                <span className={`relative text-lg ${fontWeight} text-blue-color`}>
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BreadcrumbList;
