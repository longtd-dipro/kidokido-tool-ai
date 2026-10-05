import * as React from "react";

import Breadcrumb from "components/common/Breadcrumb";

export interface Props {
  heading: string;
  breadcrumbData: { title: string; link?: string }[];
}

export default function AdminPageHeading({ heading, breadcrumbData }: Props) {
  return (
    <div>
      {/* Heading */}
      <h1 className="font-[600] text-xl mb-2">{heading}</h1>

      {/* Breadcrumb */}
      <div>
        <Breadcrumb data={breadcrumbData} />
      </div>
    </div>
  );
}
