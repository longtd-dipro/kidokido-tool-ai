import React from "react";
import Image from "next/legacy/image";
import Link from "next/link";

import LogoFooter from "statics/images/logo-footer.svg";
import { ROUTE } from "constants/route";
import ArrowImage from "statics/images/user/arrow-up.svg";
import ArrowSmallImage from "statics/images/user/arrow-up-mobile.svg";

import styles from "./Footer.module.scss";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="relative w-full">
      <div className={` ${styles["footer-bg-white"]} h-[225px] flex justify-around`}>
        {/* Go to top Desktop*/}
        <div className="flex flex-col items-center absolute top-[-60px] bottom-0 right-[70px] xs:hidden mdonly:hidden">
          <div className="w-[68px] h-[68px] bg-blue rounded-full flex justify-center items-center cursor-pointer" onClick={scrollToTop}>
            <Image src={ArrowImage} alt="ArrowImage" />
          </div>
          <span className="text-blue-color font-bold text-sm">トップ</span>
        </div>

        {/* Go to top Table and Mobile*/}
        <div
          className="hidden flex-col items-center absolute
          mdonly:top-[-35px] mdonly:right-0 mdonly:bottom-0 mdonly:left-[85%] mdonly:flex
          xs:flex xs:inset-0 xs:top-[-20px] xs:right-0 xs:bottom-0 xs:left-[82%] "
        >
          <div className="w-10 h-10 bg-blue rounded-full flex justify-center items-center cursor-pointer" onClick={scrollToTop}>
            <Image src={ArrowSmallImage} alt="ArrowSmallImage" />
          </div>
          <span className="text-blue-color font-bold text-sm md:text-xs xs:hidden">トップ</span>
        </div>

        {/*Logo*/}
        <div className="flex flex-col items-center justify-around gap-6 py-10 mb-0">
          {/*Desktop Icon*/}
          <Link href="https://www.bornelund.co.jp/" legacyBehavior>
            <a className="xs:hidden">
              <Image src={LogoFooter} width={134} height={189} alt="Logo" />
            </a>
          </Link>
          {/*Mobile Icon*/}
          <Link href="https://www.bornelund.co.jp/" legacyBehavior>
            <a className="xsup:hidden">
              <Image src={LogoFooter} width={83} height={117} alt="Logo" />
            </a>
          </Link>
        </div>

        {/*Links*/}
        <div className="xs:pt-10 mdonly:pt-16 mdup:pt-16">
          <ul className={`${styles["footer-list"]} list-outside grid gap-1 mdonly:gap-6 mdup:gap-10 xs:grid-cols-1 mdonly:grid-cols-3 mdup:grid-cols-4`}>
            {[
              { content: "利用規約", link: ROUTE.TERMS_OF_USE },
              { content: "プライバシーポリシー", link: ROUTE.PRIVACY_POLICY },
              { content: "特定商取引に基づく表示", link: ROUTE.COMMERCIAL_LAW },
              { content: "料金プラン ", link: ROUTE.PRICE_LIST },
              { content: "よくある質問", link: "https://www.bornelund.co.jp/page/play-reserve_2301" },
              { content: "店舗一覧", link: ROUTE.TENANT_LIST },
              { content: "お問い合わせ", link: "https://kidokid.bornelund.co.jp/contact/" },
            ].map(({ content, link }) => {
              return (
                <li key={content} className="pl-8 md:ml-5">
                  <Link passHref href={link} legacyBehavior>
                    <a className="cursor-pointer hover:underline" target={link.startsWith("http") ? "_blank" : "_self"}>
                      {content}
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className={`${styles["copy-right"]} h-fit pt-2 text-center md:py-2 mt-8`}>
        <p className="text-sm leading-7 xs:hidden mdonly:w-[576px] mdonly:ml-[120px] md:text-[10px] md:font-light md:leading-[14px]">
          このホームページに掲載のイラスト・写真・文章の無断転載を禁じます。すべての著作権は株式会社ボーネルンドに帰属します。
        </p>
        <p className="text-sm leading-7 md:text-[10px] md:font-light md:leading-[14px] ">© BørneLund Corporation. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
