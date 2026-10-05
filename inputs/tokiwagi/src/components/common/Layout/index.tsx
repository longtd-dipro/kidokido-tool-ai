import React from "react";
import Link from "next/link";
import Image from "next/legacy/image";

import Header from "components/common/Header";
import Footer from "components/common/Footer";
import ChevronRightImage from "statics/images/user/chevron-right.svg";

type Props = {
  breadcrumbData?: { title: string; link?: string; }[];
};

function Layout(props: React.PropsWithChildren<Props>) {
  return (
    <div className="user text-color min-h-[100vh] flex flex-col">
      <Header />
      {
        props.breadcrumbData ? (
          <>
            <div
              id="breadcrumb"
              className="flex items-center my-[24px] w-full max-w-4xl mx-auto gap-x-1 xs:hidden md:px-10 xs:mt-[80px]"
            >
              <Link href="/" passHref legacyBehavior>
                <span className="text-lg font-bold cursor-pointer text-blue-color">トップ</span>
              </Link>
              {props.breadcrumbData.map((item, index) => (
                <div key={index} className="flex">
                  <Image src={ChevronRightImage} alt={"icon"} />
                  <Link href={item.link || "#"} passHref legacyBehavior>
                    <span className={"relative text-lg font-medium cursor-pointer text-blue-color"}>
                      {item.title}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
            <div className="grow">
              {props.children}
            </div>
          </>
        ) : (
          <div className="grow xs:mt-[80px]">
            {props.children}
          </div>
        )
      }
      <Footer />
    </div>
  );
}

export default Layout;
