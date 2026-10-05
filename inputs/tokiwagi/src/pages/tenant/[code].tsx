import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { PaymentType, Tenant, TicketType } from "@prisma/client";
import moment from "moment";
import { useSession } from "next-auth/react";
import Image from "next/legacy/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import BookingVacancies from "components/BookingVacancies";
import Error from "components/common/Error";
import Layout from "components/common/Layout";
import Spinner from "components/common/Spinner";
import { JP_SHORT_DATE, SHORT_DATE, SHORT_TIME, VACANCY_STATUS } from "constants/common";
import { NEXT_MONTH_BOOKING_QUERY_PARAM, getBookingDaysFromQuery } from "constants/booking";
import { ROUTE } from "constants/route";
import { Ticket, UserTenantFavorite } from "models/Entity";
import { fetchBookingVacanciesStatus } from "services/api-client/booking.service";
import { findTenant } from "services/api-client/tenant.service";
import { fetchTickets } from "services/api-client/ticket.service";
import { addFavorite, fetchTenantFavorites, removeFavorite } from "services/api-client/user.service";
import CalendarIcon from "statics/images/calendar-2.svg";
import CircleOutlineIcon from "statics/images/circle-outline.svg";
import CrossRedIcon from "statics/images/cross-red.svg";
import EmptyImage from "statics/images/empty-image.svg";
import TriangleImage from "statics/images/triangle-pc.svg";
import RightFillIcon from "statics/images/right-fill.svg";
import { getMessageFromError } from "utils/common";
import { getTenantImagePath } from "utils/tenant";
import ErrorDialog from "components/common/ErrorDialog";
import { checkShouldHideTicketVacancy } from "utils/vacancy-status";
import InformationDialog from "components/InDayVacancies/InformationDialog";
import { OnlineTicketVacancy, TicketVacancy } from "models/Vacancy";
import Button from "components/common/Buttons/Button";
import RequiredLoginDialog from "components/common/RequiredLoginDialog";
import UserSiteLoadingButton from "components/common/Buttons/LoadingButton";

import styles from "./[code].module.scss";

type TenantBookingVacancy = {
  status: string;
  ticketId: number;
  ticketName: string;
  canNotBookMore?: boolean;
};

export default function DetailTenant() {
  const { data: session } = useSession();

  const router = useRouter();
  const { code } = router.query;
  const bookingDays = getBookingDaysFromQuery(router.query);
  const [tenant, setTenant] = useState<Tenant>();
  const [errMsg, setErrMsg] = useState<string>();
  const [tenantFavorites, setTenantFavorites] = useState<UserTenantFavorite[]>([]);
  const [oneDayOnlineTickets, setOneDayOnlineTickets] = useState<Ticket[]>([]);

  const [selectedOnlineTicketVacancy, setSelectedOnlineTicketVacancy] = useState<OnlineTicketVacancy>();
  const [useInDayBookingVacancies, setUseInDayBookingVacancies] = useState<TenantBookingVacancy[]>([]);

  const [isShowErrorDialog, setIsShowErrorDialog] = useState<boolean>(false);
  const [errorDialogMsg, setErrorDialogMsg] = useState<string>("");
  const [isShowWaitingPopupDialog, setIsShowWaitingPopupDialog] = useState<boolean>(false);
  const [selectedTicketVacancy, setSelectedTicketVacancy] = useState<TicketVacancy>(null);
  const [isShowRequiredLoginDialog, setIsShowRequiredLoginDialog] = useState<boolean>(false);

  const [isSubmittingUpdateFavorite, setIsSubmittingUpdateFavorite] = useState<boolean>(false);

  useEffect(() => {
    fetchTenant();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  useEffect(() => {
    if (session) {
      getTenantFavorites();
    }
  }, [session]);

  useEffect(() => {
    if (tenant) {
      fetchOneDayOnlineTickets(tenant.code);
      fetchTenantBookingVacancies(tenant.code);
    }
  }, [tenant]);

  const getTenantFavorites = async () => {
    if (!session) return false;
    try {
      setErrMsg("");
      const response = await fetchTenantFavorites();
      setTenantFavorites(response);
    } catch (err) {
      const message = getMessageFromError(err);
      setErrMsg(message);
    }
  };

  const fetchTenant = async () => {
    try {
      setErrMsg("");
      const response = await findTenant(code as String);
      setTenant(response);
    } catch (err) {
      const message = getMessageFromError(err);
      setErrMsg(message);
    }
  };

  const fetchTenantBookingVacancies = async (tenantCode: string) => {
    try {
      const response = await fetchBookingVacanciesStatus({ tenantCodes: [tenantCode], sortTicketsBy: "displayOrder.asc" });
      const inDayStatus = response.inDayTenantStatus[tenantCode];
      inDayStatus ? setUseInDayBookingVacancies(inDayStatus.tickets) : setUseInDayBookingVacancies([]);
    } catch (error) {
      const message = getMessageFromError(error);
      setErrMsg(message);
    }
  };

  const fetchOneDayOnlineTickets = async (tenantCode: string) => {
    try {
      setErrMsg("");
      const tickets = await fetchTickets({ tenantCode, canBookInAdvance: true, paymentType: PaymentType.Online, ticketTypes: [TicketType.Daily] });
      setOneDayOnlineTickets(tickets);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const checkTenantFavorite = () => {
    return tenantFavorites.find((item) => item.tenantCode === code);
  };

  const handleFavorite = async () => {
    try {
      setIsSubmittingUpdateFavorite(true);
      setErrMsg("");
      await addFavorite(code as string);
      await getTenantFavorites();
    } catch (err) {
      const message = getMessageFromError(err);
      setErrMsg(message);
    } finally {
      setIsSubmittingUpdateFavorite(false);
    }
  };

  const handleUnFavorite = async () => {
    try {
      setIsSubmittingUpdateFavorite(true);
      setErrMsg("");
      await removeFavorite(code as string);
      await getTenantFavorites();
    } catch (err) {
      const message = getMessageFromError(err);
      setErrMsg(message);
    } finally {
      setIsSubmittingUpdateFavorite(false);
    }
  };

  const handleClickButtonRedirectUseInDayBooking = () => {
    const isAllTicketNotAvailable = useInDayBookingVacancies.every((vacancy) => vacancy.status === VACANCY_STATUS.NOT_AVAILABLE);
    if (isAllTicketNotAvailable) {
      setErrorDialogMsg("お取り扱い時間外です。");
      setIsShowErrorDialog(true);
      return;
    }

    router.push({
      pathname: ROUTE.USE_IN_DAY_BOOKING,
      query: {
        tenantCode: tenant?.code,
      },
    });
  };

  const handleClickVacancyRedirectUseInDayBooking = (ticketVacancy: TenantBookingVacancy) => {
    const { status, ticketId } = ticketVacancy;
    setSelectedTicketVacancy(ticketVacancy as any);

    if (status === VACANCY_STATUS.NOT_AVAILABLE) {
      return;
    }

    if (status === VACANCY_STATUS.FULL) {
      showWaitingPopupDialog();
      return;
    }

    handleRedirectUseInDayBooking(tenant?.code, ticketId);
  };

  const handleClickRedirectOnlineOneDayBooking = () => {
    if (!session) {
      setIsShowRequiredLoginDialog(true);
      return;
    }

    redirectOnlineOneDayBooking();
  };

  const handleRedirectUseInDayBooking = (tenantCode: string, ticketId: number) => {
    router.push({
      pathname: ROUTE.USE_IN_DAY_BOOKING,
      query: {
        tenantCode,
        ticketId,
      },
    });
  };

  const redirectOnlineOneDayBooking = () => {
    const bookingDate = moment(selectedOnlineTicketVacancy?.date || moment().add(1, "day")).format(SHORT_DATE);
    router.push({
      pathname: ROUTE.BOOKING_PAYMENT_ONLINE,
      query: {
        tenantCode: code,
        date: bookingDate,
        ticketId: selectedOnlineTicketVacancy?.ticketId,
        ...(bookingDays ? { [NEXT_MONTH_BOOKING_QUERY_PARAM]: "true" } : {}),
      },
    });
  };

  const handleChooseOnlineOneDayTicket = (onlineTicketVacancy: OnlineTicketVacancy) => {
    setSelectedOnlineTicketVacancy(onlineTicketVacancy);
  };

  const showWaitingPopupDialog = () => {
    setIsShowWaitingPopupDialog(true);
  };

  const hideWaitingPopupDialog = () => {
    setIsShowWaitingPopupDialog(false);
  };

  const isFavorite = checkTenantFavorite();

  return (
    <Layout breadcrumbData={[{ title: "店舗一覧", link: ROUTE.TENANT_LIST }, { title: "施設詳細" }]}>
      {/*Error*/}
      <Error message={errMsg} />
      {tenant && (
        <main className="">
          <div className="top-page-title-wrapper xs:w-[300px] w-[800px] md:w-[600px] break-all mx-auto">
            <h1 className="usr-title-line">{tenant?.name}</h1>
          </div>
          <section className="flex flex-col xs:gap-[32px] gap-[64px] max-w-[825px] md:px-[40px] xs:px-5 w-full mx-auto">
            <div>
              {/* desktop */}
              <div className="xs:hidden flex justify-center w-full  xs:px-5">
                <div className="w-[300px] h-[80px]">
                  <img
                    src={getTenantImagePath(tenant) ?? EmptyImage}
                    alt=""
                    style={{ borderRadius: 10, objectFit: "fill", width: "100%", height: "100%" }}
                  ></img>
                </div>
              </div>
              {/* mobile */}
              <div className="xsup:hidden flex justify-center w-full h-[80x]">
                <div className=" w-[300px] h-[80px]">
                  <img
                    src={getTenantImagePath(tenant) ?? EmptyImage}
                    alt=""
                    style={{ borderRadius: 10, objectFit: "fill", width: "100%", height: "100%" }}
                  ></img>
                </div>
              </div>
              <div className="mt-[32px] text-center">
                {session ? (
                  <UserSiteLoadingButton
                    isLoading={isSubmittingUpdateFavorite}
                    type="button"
                    onClick={isFavorite ? handleUnFavorite : handleFavorite}
                    className="w-[230px] h-[44px] !text-base"
                    variant={isFavorite ? "contained" : "outlined"}
                  >
                    <>
                      <span>お気に入り登録</span>
                      {isFavorite ? <FavoriteIcon className="ml-2" color="error" /> : <FavoriteBorderIcon className="ml-2" />}
                    </>
                  </UserSiteLoadingButton>
                ) : (
                  <Link href={ROUTE.SIGN_IN} legacyBehavior>
                    <a className="user-button-outline-blue-medium w-[220px]">
                      お気に入りに登録 &nbsp;
                      <FavoriteBorderIcon />
                    </a>
                  </Link>
                )}
              </div>
            </div>
            <div className={styles.tenantInfo}>
              <div className="flex">
                <div className="w-[118px] shrink-0">
                  <span className="md:text-base md:leading-5 text-xl">連絡先</span>
                </div>
                <span className="flex items-center font-light text-base leading-5 md:text-sm md:leading-6 truncate">{tenant?.phone}</span>
              </div>
              <div className="flex">
                <div className="w-[118px] shrink-0">
                  <span className="md:text-base md:leading-5 text-xl">住所</span>
                </div>
                <span className="flex items-center font-light text-base leading-5 md:text-sm md:leading-6 work-break">{tenant?.address}</span>
              </div>
              <div className="flex">
                <div className="w-[120px] shrink-0">
                  <span className="md:text-base md:leading-5 text-xl">アクセス</span>
                </div>
                <span className="flex items-center font-light text-base leading-5 md:text-sm md:leading-6 truncate whitespace-pre-line">{tenant?.guide}</span>
              </div>
              <div className="flex">
                <div className="w-[118px] shrink-0">
                  <span className="md:text-base md:leading-5 text-xl">営業時間</span>
                </div>
                <span className="flex items-center font-light text-base leading-5 md:text-sm md:leading-6">
                  {tenant?.openedAt ? moment(tenant?.openedAt).format(SHORT_TIME) : ""}～{tenant?.closedAt ? moment(tenant?.closedAt).format(SHORT_TIME) : ""}
                  &nbsp;
                  {"<"}最終受付{tenant?.servedUtil ? moment(tenant?.servedUtil).format(SHORT_TIME) : ""}
                  {">"}
                </span>
              </div>
              <div className="flex">
                <div className="w-[120px] shrink-0">
                  <span className="md:text-base md:leading-5 text-xl">お知らせ </span>
                </div>
                <span className="flex items-center font-light text-base leading-5 md:text-sm md:leading-6 truncate whitespace-pre-line">{tenant?.note}</span>
              </div>
            </div>
            <div className={styles.tenantTodayStatus}>
              <div className={styles.tenantTodayStatusHeader}>
                <span className="xs:w-[20px] xs:h-[20px] flex">
                  <Image src={CalendarIcon} alt="" width={28} height={28}></Image>
                </span>
                <span>{moment().format(JP_SHORT_DATE + "(dddd)")}</span>
              </div>
              <div className={styles.tenantTodayStatusContent}>
                {useInDayBookingVacancies?.length > 0 &&
                  useInDayBookingVacancies.map((ticketVacancy) => {
                    const { status, ticketName, ticketId } = ticketVacancy;
                    if (checkShouldHideTicketVacancy(ticketVacancy as any)) {
                      return null;
                    }

                    return (
                      <div key={ticketId} className={styles.tenantTodayStatusContentItem}>
                        <div className="grow">
                          <span>{ticketName}</span>
                        </div>
                        <div className="w-[118px] flex xs:justify-end">
                          <a
                            className="md:w-4 md:h-4 mdup:w-[23px] mdup:h-[23px] cursor-pointer"
                            onClick={() => handleClickVacancyRedirectUseInDayBooking(ticketVacancy)}
                          >
                            {status === VACANCY_STATUS.FULL ? (
                              <Image src={TriangleImage} alt={"TriangleImage"} width={23} height={23} />
                            ) : (
                              <Image src={status === VACANCY_STATUS.NOT_AVAILABLE ? CrossRedIcon : CircleOutlineIcon} alt="" width={23} height={23} />
                            )}
                          </a>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="flex justify-center items-center">
                <div className="flex flex-col justify-center xs:gap-[14px] gap-[1.25rem] xs:my-[16px] my-[32px]">
                  <div className="flex items-center">
                    <span className="xs:w-[10px] flex">
                      <Image src={CircleOutlineIcon} alt="tenant-logo" width={23} height={23} />
                    </span>
                    &nbsp;
                    <span className="md:text-sm md:leading-6 text-base leading-5">空きあり</span>
                  </div>
                  <div className="flex items-center">
                    <span className="xs:w-[10px] flex">
                      <Image src={TriangleImage} alt="tenant-logo" width={23} height={23} />
                    </span>
                    &nbsp;
                    <span className="md:text-sm md:leading-6 text-base leading-5">入場制限中。お待ちいただきます</span>
                  </div>
                  <div className="flex items-center">
                    <span className="xs:w-[10px] flex">
                      <Image src={CrossRedIcon} alt="tenant-logo" width={23} height={23} />
                    </span>
                    &nbsp;
                    <span className="md:text-sm md:leading-6 text-base leading-5">空きなし</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <a className="user-button-blue-big md:w-[290px] xs:w-[290px] md:h-12 w-[300px] !pr-[15px]" onClick={handleClickButtonRedirectUseInDayBooking}>
                  <span className="grow text-left md:!text-lg">今から利用する</span>
                  <span className="md:w-[22px] w-[40px]">
                    <Image src={RightFillIcon} alt="right" width={40} height={40} />
                  </span>
                </a>
                <p className="mt-5 xs:text-sm">※手続き完了後、30分以内にお越しください。</p>
              </div>
            </div>
            <div className={styles.tenantVacancies}>
              {oneDayOnlineTickets.length > 0 && (
                <div className="mb-[32px] xs:mx-5">
                  <BookingVacancies
                    onBook={handleChooseOnlineOneDayTicket}
                    tenantCode={tenant?.code}
                    showErrorWhenFullVacancy={false}
                    showErrorWhenNotAvailableVacancy={false}
                    bookingDays={bookingDays}
                  />
                </div>
              )}

              <Button
                variant="contained"
                className="user-button-blue-big md:w-[290px] md:h-12 w-[300px] !pr-[15px]"
                onClick={handleClickRedirectOnlineOneDayBooking}
              >
                <div className="flex items-center justify-between w-full pl-4">
                  <span className="grow text-left md:!text-lg">1DAYパス 購入</span>
                  <span className="md:w-[22px] w-[40px] flex items-center">
                    <Image src={RightFillIcon} alt="right" width={40} height={40} />
                  </span>
                </div>
              </Button>
            </div>
          </section>
        </main>
      )}
      {!tenant && (
        <div className="flex justify-center items-center h-[100vh]">
          <Spinner />
        </div>
      )}

      {isShowErrorDialog && <ErrorDialog onDismiss={() => setIsShowErrorDialog(false)} message={errorDialogMsg} text="キャンセル" />}

      {/* Show popup */}
      {isShowWaitingPopupDialog && (
        <InformationDialog
          onAccept={() => handleRedirectUseInDayBooking(selectedTicketVacancy.tenantCode, selectedTicketVacancy.ticketId)}
          onDismiss={hideWaitingPopupDialog}
          message="現在の待ち時間"
          text="予約する"
          people={selectedTicketVacancy.waitingBookingsCount}
          minutes={selectedTicketVacancy.waitingTimeInMinutes}
          isShowButton={true}
        />
      )}

      {isShowRequiredLoginDialog && <RequiredLoginDialog onDismiss={() => setIsShowRequiredLoginDialog(false)} />}
    </Layout>
  );
}
