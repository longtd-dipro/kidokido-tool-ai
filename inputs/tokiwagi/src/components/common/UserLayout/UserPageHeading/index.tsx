import * as React from "react";

import Breadcrumb from "../Breadcrumb";
import BreadcrumbList, { BreadcrumbItem } from "../BreadcrumbList";

import styles from "./index.module.scss";
export interface Props {
  heading: string;
  title: string;
  link?: string;
  // When provided, renders a multi-level breadcrumb instead of the default
  // single-level one. Existing pages that don't pass this are unaffected.
  breadcrumbItems?: BreadcrumbItem[];
}

export default function UserPageHeading({ heading, title, link, breadcrumbItems }: Props) {
  return (
    <div>
      <div className="flex items-center mt-6 gap-x-1 xs:hidden">
        {breadcrumbItems?.length ? (
          <BreadcrumbList items={breadcrumbItems} />
        ) : (
          <Breadcrumb title={title} link={link} />
        )}
      </div>
      {/* Heading */}
      <h1
        className={`
          ${styles.title} mt-6 mb-14 text-[36px] font-medium
          xs:leading-[48px] xs:text-[28px] xs:pb-[24px] xs:mb-[36px] md:text-[28px]
        `}
      >
        {heading}
      </h1>

      {/* Breadcrumb */}
    </div>
  );
}
