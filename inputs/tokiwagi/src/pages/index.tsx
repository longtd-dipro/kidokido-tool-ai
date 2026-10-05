import React, { useEffect, useRef, useState } from "react";
import Image from "next/legacy/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import Vector from "statics/images/vector-bottom.svg";
import BreadcrumbRightFill from "statics/images/breadcrumb-right-fill.svg";
import Layout from "components/common/Layout";
import styles from "styles/top-page.module.scss";
import RightFillIcon from "statics/images/right-fill.svg";
import SearchTenantArea from "components/TopPage/SearchTenantArea";
import { checkRequiredInformation } from "services/api-client/user.service";
import { ROUTE } from "constants/route";
import NewsSection from "components/TopPage/News";
import CheckInOutButtons from "components/TopPage/CheckInOutButtons";
import WarningLoginDialog from "components/WarningLoginDialog";
import { CHECKOUT_BARCODE_QUERY_KEY, SESSION_STATUS, SHOW_REQUIRED_LOGIN_POPUP_STORAGE_KEY } from "constants/common";
import { NewIcon } from "statics/icons";
import { useSseNotifications, SseEvent } from "libs/hooks/useSseNotifications";
import NotificationDialog from "components/common/NotificationDialog";
import { MESSAGES } from "constants/messages";

export default function Index() {
  const { status } = useSession();
  const router = useRouter();

  const { notification, clearNotification } = useSseNotifications();

  const ticketOneDayRef = useRef(null);
  const ticketMonthlyRef = useRef(null);
  const [isShowWarningLoginDialog, setIsShowWarningLoginDialog] = useState<boolean>(false);
  const [checkoutRefreshKey, setCheckoutRefreshKey] = useState<number>(0);

  const showWarningLoginDialog = () => {
    setIsShowWarningLoginDialog(true);
    sessionStorage.setItem(SHOW_REQUIRED_LOGIN_POPUP_STORAGE_KEY, "true");
  };

  const hideWarningLoginDialog = () => {
    setIsShowWarningLoginDialog(false);
  };

  useEffect(() => {
    if (status === SESSION_STATUS.AUTHENTICATED) {
      checkUserInformation();
    } else if (status === SESSION_STATUS.UNAUTHENTICATED) {
      if (!sessionStorage.getItem(SHOW_REQUIRED_LOGIN_POPUP_STORAGE_KEY)) {
        showWarningLoginDialog();
      }
    }
  }, [status]);

  const checkUserInformation = async () => {
    const result = await checkRequiredInformation();
    if (!result) {
      router.push({ pathname: ROUTE.USER_EDIT_ACCOUNT, query: { line_signup: true } });
    }
  };

  const gotoTenantList = (searchTerm: string) => {
    if (!searchTerm) {
      return;
    }

    router.push({
      pathname: ROUTE.TENANT_LIST,
      query: {
        search: searchTerm,
      },
    });
  };

  const gotoMyPage = () => {
    clearNotification();
    router.push(ROUTE.USER_MY_PAGE);
  };

  // 「決済バーコードを表示」: ở lại trang hiện tại, mở modal checkout đã lọc theo barcode vừa checkout.
  const showCheckoutBarcode = (barCode: string) => {
    clearNotification();
    router.replace(
      { pathname: router.pathname, query: { ...router.query, [CHECKOUT_BARCODE_QUERY_KEY]: barCode } },
      undefined,
      { shallow: true }
    );
  };

  // 「このページで続ける」: ở lại trang hiện tại và tải lại danh sách booking.
  const stayAndRefreshCheckout = () => {
    clearNotification();
    setCheckoutRefreshKey((prev) => prev + 1);
  };

  const renderNotificationDialog = () => {
    if (!notification?.message && !notification?.event) {
      return null;
    }

    // チェックイン成功（scan.ts が checkIn フラグを付与した場合のみ）
    if (notification?.event === SseEvent.SCAN_SUCCESS && notification?.checkIn) {
      if (notification.checkIn.hasRemainingCheckIn) {
        return (
          <NotificationDialog
            variant="success"
            title={MESSAGES.CHECKIN_SUCCESS_TITLE}
            message={MESSAGES.CHECKIN_HAS_REMAINING}
            actions={[
              { label: "続けてチェックイン", onClick: clearNotification, styleType: "outline" },
              { label: "マイページへ", onClick: gotoMyPage, styleType: "filled" },
            ]}
            onClose={clearNotification}
          />
        );
      }

      return (
        <NotificationDialog
          variant="success"
          title={MESSAGES.CHECKIN_SUCCESS_TITLE}
          actions={[{ label: "マイページへ", onClick: gotoMyPage, styleType: "outline" }]}
          onClose={clearNotification}
        />
      );
    }

    // チェックアウト成功（scan.ts が checkOut フラグを付与した場合のみ）
    if (notification?.event === SseEvent.SCAN_SUCCESS && notification?.checkOut) {
      const { barCode, hasRemaining, needPayment } = notification.checkOut;
      const barcodeAction = { label: "決済バーコード表示", onClick: () => showCheckoutBarcode(barCode), styleType: "outline" as const };
      const myPageAction = { label: "マイページへ", onClick: gotoMyPage, styleType: "filled" as const };
      const continueAction = { label: "続けてチェックアウト", onClick: stayAndRefreshCheckout, styleType: "outline" as const };

      if (needPayment) {
        return (
          <NotificationDialog
            variant="success"
            title={MESSAGES.CHECKOUT_SUCCESS_TITLE}
            message={MESSAGES.CHECKOUT_NEED_PAYMENT}
            actions={[barcodeAction, myPageAction]}
            secondaryMessage={hasRemaining ? MESSAGES.CHECKOUT_HAS_REMAINING : undefined}
            secondaryActions={hasRemaining ? [continueAction] : undefined}
            onClose={clearNotification}
          />
        );
      }

      if (hasRemaining) {
        return (
          <NotificationDialog
            variant="success"
            title={MESSAGES.CHECKOUT_SUCCESS_TITLE}
            message={MESSAGES.CHECKOUT_HAS_REMAINING}
            actions={[continueAction, myPageAction]}
            onClose={clearNotification}
          />
        );
      }

      return (
        <NotificationDialog
          variant="success"
          title={MESSAGES.CHECKOUT_SUCCESS_TITLE}
          actions={[myPageAction]}
          onClose={clearNotification}
        />
      );
    }

    // 失敗・その他の通知（既存の警告スタイル）
    if (!notification?.message) {
      stayAndRefreshCheckout();
      return null;
    }

    return (
      <NotificationDialog
        message={notification.message}
        title={notification.title}
        closeLabel={notification.event === SseEvent.SCAN_ERROR ? "戻る" : undefined}
        onClose={clearNotification}
      />
    );
  };

  return (
    <Layout>
      <CheckInOutButtons scanEvent={notification} refreshKey={checkoutRefreshKey} />
      <main className="container mx-auto mt-[100px] xs:mt-6 md:mt-16">
        <NewsSection />
      </main>
      {/* Ticket */}
      <div className={`${styles.ticket} w-full pb-16 xs:pb-4`}>
        <div className="mx-auto">
          <div className={`${styles.ticket__container} flex flex-row xs:flex-col md:mx-[40px] xs:mx-[22px] items-stretch justify-center gap-x-6`}>
            {/* Mobile - 2 Button */}
            <div className="hidden xs:flex xs:pt-[1.875rem] xs:gap-[17px]">
              {/* Button Use One Day */}
              <div
                onClick={() => ticketOneDayRef.current.scrollIntoView({ behavior: "smooth" })}
                className="flex flex-col justify-between p-3 text-lg font-bold leading-7 text-[rgb(0,104,183)]
                 bg-white w-[9.938rem] rounded-[10px] border-2 border-[#0068B7] text-center"
              >
                <h1 className="mb-2 mt-4">当日利用</h1>
                <Image src={Vector} alt="Vector" />
              </div>

              {/* Button 1DAY PASS／FREE PASS */}
              <div
                onClick={() => ticketMonthlyRef.current.scrollIntoView({ behavior: "smooth" })}
                className="flex flex-col justify-between p-3 text-lg font-bold leading-7 text-[#0068B7]
                bg-white w-[9.938rem] rounded-[10px] border-2 border-[#0068B7] text-center"
              >
                <h1 className="mb-2 mt-4">
                  翌日以降の利用
                </h1>
                <Image src={Vector} alt="Vector" />
              </div>
            </div>

            {/* Ticket One Day */}
            <div
              className={`${styles.ticket__item} shadow-lg rounded-xl mt-24 md:mt-9  w-full max-w-[555px] xsup:ml-auto xs:mx-auto  xs:bg-white
          `}
            >
              <div className="flex flex-col items-center justify-center">
                <span ref={ticketOneDayRef} className={`${styles.ticket__title} pt-9 text-center xs:max-w-[252px] md:!text-[32px]`}>
                  当日利用
                </span>
                <span className={`${styles.ticket__type} mt-3 md:mt-4 xs:!text-[14px] md:!text-sm md:leading-4 `}>USE ON THE DAY</span>
              </div>
              <div
                className={`${styles.ticket__content} ${styles.one__day__offline__ticket__content} mt-12 mx-auto px-5 xs:px-0 max-w-[480px] w-full 
              xs:max-w-[292px] !md:text-base md:leading-7 xsup:text-left !leading-8 min-h-[96px] md:min-h-0`}
              >
                本日ご利用の方はこちらからお手続きください。
                <div className="xs:text-left">フリーパス・120 分ご利用券をお持ちの方もこちら</div>
              </div>
              <div className="mdonly:min-h-[250px]">
                <Link passHref href="/booking/use-in-day" legacyBehavior>
                  <div
                    className={`${styles.button__ticket} flex items-center mx-auto justify-between xs:items-center rounded-full hover:bg-orange-400 
                cursor-pointer transition duration-150 ease-in-out py-4 md:h-12 px-[30px] xs:px-9 xs:py-2 max-w-[440px] 
                md:max-w-[290px] mdup:text-2xl xs:text-xl md:mb-[10px] md:mt-6 mt-[1.8rem] xs:mt-9 xs:mb-4`}
                  >
                    <h3 className={`${styles.button__title} md:text-base flex items-center`}>今から利用する</h3>
                    <div className="xs:w-[22px] xs:h-[22px] md:w-[22px] md:h-[22px] md:flex md:justify-center md:items-center">
                      <Image src={RightFillIcon} alt="RightFillIcon" />
                    </div>
                  </div>
                </Link>
                <div
                  className={`${styles.ticket__content} mx-auto px-5 xs:px-0 max-w-[480px] w-full 
              xs:max-w-[292px] !md:text-base text-left md:leading-7 md:text-left !leading-8 mt-4 md:mt-0`}
                >
                  <div className="text-xs !leading-8">
                    ※手続き完了後、30 分以内にお越しください。
                    <br />
                    ※入場制限をしている場合、お待ちいただく場合がございます。
                  </div>
                </div>
              </div>
              <h1 className={`${styles.ticket__step} block text-center !pt-[186px] md:leading-8 mdonly:!pt-[26px] xs:pb-6 xs:!pt-9 md:!text-xl`}>
                ご利用の流れ
              </h1>
              {/* Ticket Step Booking */}
              <div className="max-w-[430px] md:px-4 w-full flex flex-col mx-auto xs:px-5">
                <div className="flex items-center mt-2 mb-2 gap-x-6 xs:gap-x-2 ">
                  <h1 className={`${styles.booking__title} max-w-[47px] text-center md:!text-[14px]`}>STEP 01</h1>
                  <span className={`${styles.booking__description} xs:text-xs md:!text-[14px]`}>まずはログイン（初めての方は会員登録を）</span>
                </div>
                <Image src={BreadcrumbRightFill} alt="BreadcrumbRightFill" />
                <div className="flex items-center mt-2 mb-2 gap-x-6 xs:gap-x-2">
                  <h1 className={`${styles.booking__title} max-w-[47px] text-center md:!text-[14px]`}>STEP 02</h1>
                  <span className={`${styles.booking__description} xs:text-xs md:!text-[14px]`}>利用したい店舗・商品を選ぶ</span>
                </div>
                <Image src={BreadcrumbRightFill} alt="BreadcrumbRightFill" />
                <div className="flex items-center mt-2 mb-2 gap-x-6 xs:gap-x-2">
                  <h1 className={`${styles.booking__title} max-w-[47px] text-center md:!text-[14px]`}>STEP 03</h1>
                  <span className={`${styles.booking__description} xs:text-xs md:!text-[14px]`}>利用人数など、必要事項を入力</span>
                </div>
                <Image src={BreadcrumbRightFill} alt="BreadcrumbRightFill" />
                <div className="flex items-center mt-2 mb-2 gap-x-6 xs:gap-x-2">
                  <h1 className={`${styles.booking__title} max-w-[47px] text-center md:!text-[14px]`}>STEP 04</h1>
                  <span className={`${styles.booking__description} xs:text-xs md:!text-[14px]`}>
                    予約完了メールが届きます。
                    <br />
                    当日利用お支払いは店舗でお願いいたします。
                  </span>
                </div>
                <Image src={BreadcrumbRightFill} alt="BreadcrumbRightFill" />
                <div
                  className="py-2 min-h-[44px] md:m-0
               md:text-lg text-2xl md:leading-6 xs:m-0 font-bold flex items-center justify-center"
                >
                  <span className={`${styles.line__title}`}>完了！</span>
                </div>
                <p className="text-xs leading-5 font-medium max-w-[378px] mt-[7.5rem] mdonly:mt-[7.3rem] mb-[22px] md:mt-[117px] xs:mt-6 xs:mb-[20px]">
                  ※ドメイン設定をされている方は 「bornelund.co.jp」 を受信できるように設定してください。
                </p>
              </div>
            </div>

            {/* Ticket 1DAY PASS／FREE PASS */}
            <div className={`${styles.ticket__item} shadow-lg rounded-xl mt-24 md:mt-9 xs:mt-6 max-w-[555px] xsup:mr-auto xs:bg-white xs:mx-auto xs:mb-[60px]`}>
              <div className="flex flex-col items-center justify-center">
                {/*From Desktop -> larger*/}
                <h1 className={`${styles.ticket__title} pt-9 text-center xs:max-w-[252px] hidden mdup:block md:!text-[32px]`}>予約・オンライン購入</h1>

                {/*Tablet Only*/}
                <h1 className={`${styles.ticket__title} pt-9 text-center hidden mdonly:block md:!text-[32px]`}>予約オンライン購入</h1>

                {/*Mobile Only*/}
                <h1 ref={ticketMonthlyRef} className={`${styles.ticket__title} pt-9 text-center hidden xsonly:block md:!text-[32px]`}>
                  予約オンライン購入
                </h1>

                <span className={`${styles.ticket__type} mt-3 md:mt-4 md:!text-[14px] md:!leading-4`}>1DAY PASS／FREE PASS</span>
              </div>
              <p className={`${styles.ticket__content} ${styles.one__day__online__ticket__content} mt-12
               mx-auto max-w-[440px] w-full xs:px-3 px-5 md:text-left mdonly:min-h-[112px] !leading-8`}>
                1DAYパス（翌日から7日後までの分）、またはフリーパスをご購入の方はこちらからお手続きください。
              </p>
              <div className="md:min-h-[250px] xs:min-h-0">
                <Link href="/booking/payment-online" passHref legacyBehavior>
                  <div
                    className={`${styles.button__ticket} 
                    flex items-center mx-auto justify-between rounded-full py-4 px-[30px] max-w-[440px] hover:bg-orange-400 
                cursor-pointer transition duration-150 ease-in-out
                md:max-w-[290px] md:h-12 text-2xl xs:text-xl xs:mb-4 mb-6 md:mb-5 mt-7 md:mt-6 xs:mt-9 xs:py-2 xs:px-9 xs:items-center md:items-center`}
                  >
                    <h3 className={`${styles.button__title} flex xsonly:text-base mdonly:text-base items-center`}>1DAYパス事前購入</h3>
                    <div className="xs:w-[22px] xs:h-[22px] md:w-[22px] md:h-[22px] md:flex md:justify-center md:items-center">
                      <Image src={RightFillIcon} alt="RightFillIcon" />
                    </div>
                  </div>
                </Link>
                <Link href="/booking/buy-times-limit-ticket" passHref legacyBehavior>
                  <div
                    className={`${styles.button__ticket} 
                    flex items-center mx-auto justify-between rounded-full py-4 px-[30px] max-w-[440px] hover:bg-orange-400 
                cursor-pointer transition duration-150 ease-in-out
                md:max-w-[290px] md:h-12 text-2xl xs:text-xl xs:mb-4 md:mb-[10px] mt-6 md:mt-5 xs:mt-4 xs:py-2 xs:px-9 xs:items-center`}
                  >
                    <h3 className={`${styles.button__title} flex xsonly:text-base mdonly:text-base items-center`}>
                      回数券購入
                      <span className="ml-[11px] w-[45px] h-[45px] gap-10 rounded-full">
                        <Image src={NewIcon} alt="NewIcon" width={45} height={45}></Image>
                      </span>
                    </h3>

                    <div className="xs:w-[22px] xs:h-[22px] md:w-[22px] md:h-[22px] md:flex md:justify-center md:items-center">
                      <Image src={RightFillIcon} alt="RightFillIcon" />
                    </div>
                  </div>
                </Link>
                <Link passHref href="/booking/buy-monthly-ticket" legacyBehavior>
                  <div
                    className={`${styles.button__ticket} 
                    flex items-center mx-auto justify-between rounded-full py-4 px-[30px] max-w-[440px] hover:bg-orange-400 
                cursor-pointer transition duration-150 ease-in-out
                md:max-w-[290px] md:h-12 text-2xl xs:text-xl xs:mb-4 md:mb-[10px] mt-6 md:mt-5 xs:mt-4 xs:py-2 xs:px-9 xs:items-center`}
                  >
                    <h3 className={`${styles.button__title} flex xsonly:text-base mdonly:text-base items-center`}>年間・マンスリーパス購入</h3>
                    <div className="xs:w-[22px] xs:h-[22px] md:w-[22px] md:h-[22px] md:flex md:justify-center md:items-center">
                      <Image src={RightFillIcon} alt="RightFillIcon" />
                    </div>
                  </div>
                </Link>
                <div
                  className={`${styles.ticket__content} mt-4 mx-auto !leading-8 max-w-[440px] w-full text-left xs:px-0 xs:max-w-[292px] 
                pr-5 md:px-5 md:text-left md:mt-0`}
                >
                  <p className="text-xs mt-6">※1DAYパスは販売枚数に限りがございます。</p>
                  <p className="text-xs mt-3 !leading-8">※購入の際、各種クーポン、金券はご利用できません。定価でのご購入となります。</p>
                </div>
              </div>

              <h1 className={`${styles.ticket__step} block text-center mdonly:!pt-[30px] xs:pt-9 xs:pb-6 md:!text-xl`}>ご利用の流れ</h1>

              {/* Ticket Step Booking */}
              <div className="max-w-[400px] md:px-4 w-full flex flex-col mx-auto xs:px-5">
                <div className="flex items-center mt-2 mb-2 gap-x-6">
                  <h1 className={`${styles.booking__title} max-w-[47px] text-center md:!text-[14px]`}>STEP 01</h1>
                  <span className={`${styles.booking__description} md:!text-[14px]`}>まずはログイン（初めての方は会員登録を）</span>
                </div>
                <Image src={BreadcrumbRightFill} alt="BreadcrumbRightFill" />
                <div className="flex items-center mt-2 mb-2 gap-x-6">
                  <h1 className={`${styles.booking__title} max-w-[47px] text-center md:!text-[14px]`}>STEP 02</h1>
                  <span className={`${styles.booking__description} md:!text-[14px]`}>利用したい店舗・パス・日時を選ぶ</span>
                </div>
                <Image src={BreadcrumbRightFill} alt="BreadcrumbRightFill" />
                <div className="flex items-center mt-2 mb-2 gap-x-6">
                  <h1 className={`${styles.booking__title} max-w-[47px] text-center md:!text-[14px]`}>STEP 03</h1>
                  <span className={`${styles.booking__description} md:!text-[14px]`}>利用人数など、必要事項を入力</span>
                </div>
                <Image src={BreadcrumbRightFill} alt="BreadcrumbRightFill" />
                <div className="flex items-center mt-2 mb-2 gap-x-6">
                  <h1 className={`${styles.booking__title} max-w-[47px] text-center md:!text-[14px]`}>STEP 04</h1>
                  <span className={`${styles.booking__description} md:!text-[14px]`}>オンライン決済をする</span>
                </div>
                <Image src={BreadcrumbRightFill} alt="BreadcrumbRightFill" />
                <div className="flex items-center mt-2 gap-x-6">
                  <h1 className={`${styles.booking__title} max-w-[47px] text-center md:!text-[14px]`}>STEP 05</h1>
                  <span className={`${styles.booking__description} md:!text-[14px]`}>予約・購入完了メールが届きます。</span>
                </div>
                <Image src={BreadcrumbRightFill} alt="BreadcrumbRightFill" />
                <div
                  className="py-2 min-h-[44px] md:m-0
               md:text-lg text-2xl md:leading-6 xs:m-0 font-bold flex items-center justify-center"
                >
                  <span className={`${styles.line__title}`}>完了！</span>
                </div>
                <p className={`${styles.ticket__content__footer} text-xs mt-[38px] xs:mt-6 xs:mb-[20px] leading-5 font-medium max-w-[378px] md:mt-[47px]`}>
                  ※ドメイン設定をされている方は 「bornelund.co.jp」 を受信できるように設定してください。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bar-bg">
        <SearchTenantArea onSearch={gotoTenantList} />
      </div>
      {/* End Ticket */}
      {/* Show popup first login dialog */}
      {isShowWarningLoginDialog && <WarningLoginDialog onDismiss={hideWarningLoginDialog} />}
      {renderNotificationDialog()}
    </Layout>
  );
}
