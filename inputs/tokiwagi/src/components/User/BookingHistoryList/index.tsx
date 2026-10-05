import { Card, CardActions, CardContent, CardHeader, Grid, Pagination } from "@mui/material";
import moment from "moment";
import { useRouter } from "next/router";
import { useState } from "react";
import { BookingStatus, PaymentStatus, PaymentType, TicketType } from "@prisma/client";

import { Barcode } from "components/common/Barcode";
import Button from "components/common/Buttons/Button";
import { BOOKING_HISTORY_PAGE_SIZE, JP_SHORT_DATE, SHORT_TIME } from "constants/common";
import { ROUTE } from "constants/route";
import { Booking } from "models/Entity";
import {
  calculateBookingsPriceMap,
  getBookingFirstCheckoutAt,
  getBookingFirstStayDurationMinutes,
  getPaymentStatus,
  getShortBarCode,
  isPossibleReCheckInBooking,
  isTimesLimitTicket,
} from "utils/booking";
import { formatThousands } from "utils/common";
import { formatStayDurationColonTime } from "utils/date-time";

import styles from "./index.module.scss";

export interface Props {
  bookings: ArrayLike<Booking & { index?: string }>;
  isPast?: boolean;
  onRequestReCheckIn?: (booking: Booking, skipCheckingWaiting?: boolean) => void;
}

export default function BookingHistoryList({ bookings, isPast = false, onRequestReCheckIn }: Props) {
  const router = useRouter();
  const [page, setPage] = useState<number>(1);

  const pageSize = BOOKING_HISTORY_PAGE_SIZE;
  const totalPage = Math.ceil(bookings.length / pageSize);

  const { sortedBookings, bookingsPriceListMap } = calculateBookingsPriceMap(bookings as Booking[]);
  const list = sortedBookings.slice((page - 1) * pageSize, page * pageSize);

  const getDaiLyBookingTotalAmount = (booking: Booking) => {
    const bookingPriceList = bookingsPriceListMap[booking.id];
    return bookingPriceList?.totalAmountAfterDiscount;
  };

  const handleChangePage = (_, page) => {
    setPage(page);
  };

  const getTotalAmount = (booking: Booking) => {
    const amount = +booking.totalAmount ? +booking.totalAmount : getDaiLyBookingTotalAmount(booking);
    return formatThousands(amount);
  };

  return (
    <div className={styles.booking_history_list}>
      {list.map((item) => {
        const isHideReCheckInButton = !!item.requestedReCheckInAt;
        const isDisableReCheckInButton = item.Ticket.type === TicketType.Daily &&
          item.Ticket.paymentType === PaymentType.Offline &&
          item.paymentStatus !== PaymentStatus.Completed;
        const isCheckingIn = item.status === BookingStatus.CheckedIn;

        let cardClassName = `${styles.card} ${isCheckingIn ? styles["card--highlight"] : ""}`;
        let cardHeaderClassName = `${styles.header} ${isCheckingIn ? styles["header--highlight"] : ""}`;
        let cardBgClassName = "";
        if (isPast) {
          cardClassName = `${styles.card} ${item.isSmaregiScanned ? styles["card--disabled"] : ""}`;
          cardHeaderClassName = `${styles.header} ${item.isSmaregiScanned ? styles["header--disabled"] : ""}`;
          cardBgClassName = item.isSmaregiScanned ? "!bg-[#f0f0f0]" : "";
        }
        return (
          <Card sx={{ minWidth: 275 }} className={cardClassName} key={item.id}>
            <CardHeader
              className="!p-0"
              title={
                <Grid container className={cardHeaderClassName}>
                  <Grid item xs={12} md={6} className="px-4">
                    {/* No */}
                    <div className="xs:mb-[20px] text-[16px] mb-3">
                      <span className="font-medium inline-flex shrink">
                        No.{getShortBarCode(item.barCode)} ({item.index})
                      </span>
                    </div>
                    {/* Barcode - Mobile */}
                    <div className="flex xs:flex-col xs:mb-[20px] xsup:hidden">
                      <span className="font-medium xs:inline-flex xs:w-[100px]">バーコード：</span>
                      <span className="md:ml-0 ml-4 font-light md:text-[14px]">
                        <Barcode includeText={true} code={item.barCode} backgroundcolor="ffffff" paddingheight={2} paddingwidth={8} />
                      </span>
                    </div>
                    {/* Booking Date */}
                    <div className="mb-3 xs:mb-[20px] xs:flex">
                      <span className="font-medium xs:inline-flex xs:w-[100px]">利用日時：</span>
                      <span className="ml-4 font-light md:text-[14px]">{`${moment(item.date).format(JP_SHORT_DATE)} (${moment(item.date).format(
                        "ddd"
                      )})`}</span>
                    </div>
                    {/* Tenant */}
                    <div className="flex xs:mb-[20px] text-[16px] mb-3 xs:flex">
                      <span className="font-medium inline-flex xs:w-[100px]">施設名:</span>
                      <span className="ml-4 font-light md:text-[14px] break-all">{`${item.Tenant.name}`}</span>
                    </div>
                    {/* Quantity */}
                    <div className="xs:flex">
                      <span className="font-medium xs:w-[100px]">予約人数:</span>
                      <span className="ml-4 font-light md:text-[14px]">
                        {
                          !isTimesLimitTicket(item?.Ticket?.type) && (
                            <span className="mr-4">おとな{item.adultQuantity}名</span>
                          )
                        }
                        <span>子ども{item.childQuantity}名</span>
                      </span>
                    </div>
                  </Grid>

                  {/* Desktop */}
                  <Grid item xs={12} md={6} className="px-4 xs:hidden">
                    {/* Barcode */}
                    <div className="flex xs:mb-[20px]">
                      <span className="font-medium xs:inline-flex xs:w-[100px]">バーコード：</span>
                      <span className="mdonly:ml-2 ml-4 font-light md:text-[14px]">
                        <Barcode includeText={true} code={item.barCode} backgroundcolor="ffffff" paddingheight={2} paddingwidth={8} />
                      </span>
                    </div>
                  </Grid>
                </Grid>
              }
            />

            <CardContent className={`${cardBgClassName} !pb-0`}>
              <Grid container className={styles.content}>
                <Grid item xs={6} md={4}>
                  <p className="text-xl font-medium xs:text-base">商品名</p>
                </Grid>
                <Grid item xs={6} md={8} className="font-light xs:text-base xs:leading-6 break-words">
                  {item.Ticket.name}
                </Grid>

                <Grid item xs={6} md={4} className="my-4">
                  <p className="text-xl font-medium xs:text-base">利用料金</p>
                </Grid>
                <Grid item xs={6} className="my-4 font-light xs:text-base xs:leading-6">
                  {getTotalAmount(item)}円
                </Grid>
                <Grid item xs={6} md={4}>
                  <p className="text-xl font-medium xs:text-base">決済状況</p>
                </Grid>
                <Grid item xs={6} className="font-light xs:text-base xs:leading-6">
                  {getPaymentStatus(item)}
                </Grid>

                {/*Checked-In At*/}
                {!!item.checkedInAt && (
                  <>
                    <Grid item xs={6} md={4}>
                      <p className="text-xl font-medium xs:text-base">入場時間</p>
                    </Grid>
                    <Grid item xs={6} className="font-light xs:text-base xs:leading-6">
                      <span className="p-2 rounded-md bg-blue text-white">{moment(item.firstCheckedInAt || item.checkedInAt).format(SHORT_TIME)}</span>
                    </Grid>
                  </>
                )}

                {/*Checked-Out At / Stay Duration (first checkout only)*/}
                {!!getBookingFirstCheckoutAt(item) && (
                  <>
                    <Grid item xs={6} md={4}>
                      <p className="text-xl font-medium xs:text-base">退場時間</p>
                    </Grid>
                    <Grid item xs={6} className="font-light xs:text-base xs:leading-6">
                      <span className="p-2 rounded-md bg-blue text-white">{moment(getBookingFirstCheckoutAt(item)).format(SHORT_TIME)}</span>
                    </Grid>
                    <Grid item xs={6} md={4}>
                      <p className="text-xl font-medium xs:text-base">滞在時間</p>
                    </Grid>
                    <Grid item xs={6} className="font-light xs:text-base xs:leading-6">
                      <span className="p-2 rounded-md bg-blue text-white">{formatStayDurationColonTime(getBookingFirstStayDurationMinutes(item))}</span>
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>

            <CardActions className={`${styles.footer} ${cardBgClassName}`}>
              <div className="flex flex-col gap-4 text-sm font-light xs:mb-[20px] xs:text-[500] xs:leading-[28px]">
                {!isPast && <>
                  <span>クーポンその他の割引券などはご退場時の清算時にご提示ください。オンライン購入は対象外となります。</span>
                  <span>※予約の変更/キャンセルを行う場合は「予約詳細」に進んでください。</span>
                </>}
              </div>

              <div>
                <div className="flex gap-4">
                  {isPossibleReCheckInBooking(item) ? (
                    <Button
                      type="button"
                      variant="contained"
                      onClick={() => onRequestReCheckIn(item, !isPast)}
                      disabled={isHideReCheckInButton || isDisableReCheckInButton}
                      className={`!h-[36px] ${isHideReCheckInButton ? "disabled" : isDisableReCheckInButton ? "user usr-disable-button" : ""}`}
                    >
                      <span className="xs:text-[16px] text-base mdup:min-w-[90px]">再入場予約</span>
                    </Button>
                  ) : null}

                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => {
                      router.push(`${ROUTE.USER_HISTORY_BOOKINGS}/${item.id}${isPast ? "?past=true" : ""}`);
                    }}
                    className="!h-[36px] "
                  >
                    <span className="xs:text-[16px] text-base mdup:min-w-[80px]">予約詳細</span>
                  </Button>
                </div>
              </div>
            </CardActions>
          </Card>
        );
      })}

      {bookings.length && (
        <div className="flex justify-center pt-12 px-4 xs:px-0">
          <Pagination className="user-pagination" count={totalPage} shape="rounded" onChange={handleChangePage} />
        </div>
      )}
    </div>
  );
}
