import { Button, Card, CardContent, CardHeader, Grid } from "@mui/material";
import {
  BookingStatus,
  PaymentStatus,
  PaymentType,
  TicketType,
} from "@prisma/client";
import bwipjs from "bwip-js";
import groupBy from "lodash/groupBy";
import moment from "moment";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { map } from "lodash";

import Spinner from "components/common/Spinner";
import UserLayout from "components/common/UserLayout";
import WarningDialog from "components/common/WarningDialog";
import ConfirmationCancelBookingDialog from "components/User/ConfirmationCancelBookingDialog";
import CreditCardFormDialog from "components/User/CreditCardFormDialog";
import ExtendedPricesList from "components/ExtendedPricesList";
import { JP_SHORT_DATE, LONG_DATE, ROLE, SHORT_TIME } from "constants/common";
import { ROUTE } from "constants/route";
import { PAYMENT_TYPE_OPTIONS } from "constants/ticket";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { Booking } from "models/Entity";
import {
  cancelBooking,
  fetchHistoryDetail,
} from "services/api-client/user.service";
import { formatThousands } from "utils/common";
import { formatStayDurationColonTime } from "utils/date-time";
import { getAgeLabel, getTicketBookingSchedule } from "utils/ticket";
import { TransactionInfo } from "services/gmo.service";
import {
  changePaymentStatus,
  fetchBookings,
  fetchBookingStatus,
  fetchBookingTransaction,
} from "services/api-client/booking.service";
import ErrorDialog from "components/common/ErrorDialog";
import Error from "components/common/Error";
import { BOOKING_VALIDATION_ERROR_MESSAGES } from "constants/booking";
import {
  checkBookingUpdateDeadline,
  checkIsValidChildQuantity,
} from "utils/booking-validation";
import NotificationDialog from "components/User/NotificationDialog";
import SmaregiBarcodeSection from "components/User/SmaregiBarcodeSection";
import { MESSAGES } from "constants/messages";
import {
  checkStatusCanNotCancelBooking,
  checkStatusCanNotUpdateBooking,
  getBookingFirstCheckoutAt,
  getBookingFirstStayDurationMinutes,
  isOneDayBooking,
  isTimesLimitTicket,
} from "utils/booking";
import { getUseInDayBookingAmount } from "utils/discount";
import { SmaregiQRCodes } from "models/Booking";

import styles from "./index.module.scss";

function BookingDetail() {
  const router = useRouter();

  const [booking, setBooking] = useState<Booking>();
  const [sameBarcodeBookings, setSameBarcodeBookings] = useState<Booking[]>();
  const [errMsg, setErrMsg] = useState<string>();
  const [popupErrMsg, setPopupErrMsg] = useState<string>();
  const [isShowWarningDialog, setIsShowWarningDialog] =
    useState<boolean>(false);
  const [isShowNotificationDialog, setIsShowNotificationDialog] =
    useState<boolean>(false);
  const [isShowCreditCardFormDialog, setIsShowCreditCardFormDialog] =
    useState<boolean>(false);
  const [
    isShowConfirmationCancelBookingDialog,
    setIsShowConfirmationCancelBookingDialog,
  ] = useState<boolean>(false);
  const [
    isShowConfirmationPartialCheckoutBookingDialog,
    setIsShowConfirmationPartialCheckoutBookingDialog,
  ] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [transaction, setTransaction] = useState<TransactionInfo>();
  const [isShowErrorDialog, setIsShowErrorDialog] = useState<boolean>(false);
  const [isValidChildQuantityAfterCancel, setIsValidChildQuantityAfterCancel] =
    useState<boolean>(true);
  const [warningDialogMsg, setWarningDialogMsg] = useState<string>("");
  const [isShowRequireReloadErrorDialog, setIsShowRequireReloadErrorDialog] =
    useState<boolean>(false);
  const [invalidStatusErrMsg, setInvalidStatusErrMsg] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (router?.query?.id) {
      const id = Number(router.query.id);
      fetchData(id);
    }
  }, [router?.query?.id]);

  useEffect(() => {
    try {
      bwipjs.toCanvas("mycanvas", {
        bcid: "code128",
        text: booking?.barCode,
        scale: 3,
        height: 10,
        includetext: true,
        textxalign: "center",
      });

      fetchSameBarcodeBookings(booking?.barCode);
    } catch (err) {
      setErrMsg(err.message);
    }
  }, [booking]);

  const showWarningDialog = () => {
    setIsShowWarningDialog(true);
  };

  const hideWarningDialog = () => {
    setIsShowWarningDialog(false);
  };

  const fetchData = async (id: number) => {
    try {
      setErrMsg("");
      setLoading(true);
      const [booking, transaction] = await Promise.all([
        fetchHistoryDetail(id),
        fetchBookingTransaction(id),
      ]);

      if (booking === null) {
        return router.push(ROUTE.USER_HISTORY_BOOKINGS);
      }

      setTransaction(transaction);
      setBooking(booking);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePaymentStatus = async (
    paymentStatus: PaymentStatus,
    isSmaregiScanned: boolean,
  ) => {
    try {
      setErrMsg("");
      setLoading(true);
      await changePaymentStatus(booking.id, {
        paymentStatus,
        isSmaregiScanned,
      });

      setBooking({ ...booking, paymentStatus, isSmaregiScanned });
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSameBarcodeBookings = async (barCode: string) => {
    try {
      const bookings = await fetchBookings({
        barCode,
        includeBookingSchedule: true,
      });
      setSameBarcodeBookings(bookings);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const shouldRenderCancelOrChangeButtons = (booking: Booking) => {
    const isPast = router.query.past === "true";
    const isOneDayOnlineBooking =
      booking.Ticket.paymentType === PaymentType.Online &&
      booking.Ticket.type === TicketType.Daily;
    const isUseInDayBooking = !booking.Ticket.canBookInAdvance;
    const isOneDayMonthlyBooking =
      booking.Ticket.type === TicketType.Monthly && booking.parentBookingId;
    const isOneDayTimesLimitBooking =
      (
        [TicketType.DailyTimesLimit, TicketType.HourlyTimesLimit] as string[]
      ).includes(booking.Ticket.type) && booking.parentBookingId;
    const { result: canNotUpdateBooking } = checkStatusCanNotUpdateBooking(
      booking.status,
    );

    return (
      !canNotUpdateBooking &&
      !isPast &&
      (isOneDayOnlineBooking ||
        isUseInDayBooking ||
        isOneDayMonthlyBooking ||
        isOneDayTimesLimitBooking)
    );
  };

  const shouldRenderCancelButton = (booking: Booking) => {
    const isOneDayBookingReCheckedIn =
      isOneDayBooking(booking) && !!booking.firstCheckedInAt;
    const isValidBookingStatusCanCancel = [
      BookingStatus.Successful,
      BookingStatus.Waiting,
      BookingStatus.Calling,
    ].includes(booking.status as any);
    return isValidBookingStatusCanCancel && !isOneDayBookingReCheckedIn;
  };

  const shouldRenderPartialCheckOutButton = (booking: Booking) => {
    const isCheckingIn = booking.status === BookingStatus.CheckedIn;
    return isCheckingIn;
  };

  const validateBookingStatusToUpdateBooking = async () => {
    try {
      const status = await fetchBookingStatus(booking.id);
      const { result: canNotUpdate } = checkStatusCanNotUpdateBooking(status);
      if (canNotUpdate) {
        setIsShowRequireReloadErrorDialog(true);
        return false;
      }
      return true;
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const validateBookingStatusToCancelBooking = async () => {
    try {
      const status = await fetchBookingStatus(booking.id);
      const { result: canNotCancel, errorMessage } =
        checkStatusCanNotCancelBooking(status);
      if (canNotCancel) {
        setInvalidStatusErrMsg(errorMessage);
        setIsShowRequireReloadErrorDialog(true);
        return false;
      }
      return true;
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const handleClickCancelBooking = async () => {
    if (!(await validateBookingStatusToCancelBooking())) return;

    const bookingSchedule =
      getTicketBookingSchedule(booking.date.toString(), booking.Ticket) ||
      booking.TicketBookingSchedule;
    const isValidBookingCancelDeadline = checkBookingUpdateDeadline(
      booking,
      bookingSchedule,
    );
    if (!isValidBookingCancelDeadline) {
      setPopupErrMsg(
        BOOKING_VALIDATION_ERROR_MESSAGES.OVERDUE_CANCEL_BOOKING_TIME,
      );
      setIsShowErrorDialog(true);
    } else {
      setWarningDialogMsg(MESSAGES.WARNING_CANCEL_ONE_BOOKING);
      if (sameBarcodeBookings?.length > 1) {
        const isValidChildQuantity = checkIsValidChildQuantity(
          sameBarcodeBookings.filter((item) => item.id !== booking.id),
        );
        setIsValidChildQuantityAfterCancel(isValidChildQuantity);
        setWarningDialogMsg(
          isValidChildQuantity
            ? MESSAGES.WARNING_CANCEL_ONE_BOOKING
            : MESSAGES.WARNING_CANCEL_ALL_BOOKINGS,
        );
      }

      showWarningDialog();
    }
  };

  const handleClickUpdateBooking = async () => {
    if (!(await validateBookingStatusToUpdateBooking())) return;

    const bookingSchedule =
      booking.TicketBookingSchedule ||
      getTicketBookingSchedule(booking.date.toString(), booking.Ticket);
    const isValidBookingUpdateDeadline = checkBookingUpdateDeadline(
      booking,
      bookingSchedule,
    );

    if (!isValidBookingUpdateDeadline) {
      setPopupErrMsg(
        BOOKING_VALIDATION_ERROR_MESSAGES.OVERDUE_UPDATE_BOOKING_TIME,
      );
      setIsShowErrorDialog(true);
    } else {
      router.push(`${ROUTE.USER_HISTORY_BOOKINGS}/update/${booking.id}`);
    }
  };

  const handleRedirectPartialCheckoutPage = () => {
    router.push(`${ROUTE.USER_PARTIAL_CHECKOUT}/${booking.id}`);
  };

  const handleAcceptCancelBooking = () => {
    if (
      isTimesLimitTicket(booking.Ticket.type) ||
      !booking.Ticket.canBookInAdvance
    ) {
      submitCancelBooking();
      return;
    }
    setIsShowWarningDialog(false);
    setIsShowConfirmationCancelBookingDialog(true);
  };

  const submitCancelBooking = async () => {
    try {
      if (isSubmitting) return;
      setIsSubmitting(true);
      const shouldCancelAllSameBarcodeBookings =
        !isValidChildQuantityAfterCancel;
      await cancelBooking(booking.id, shouldCancelAllSameBarcodeBookings);
      router.push({ pathname: ROUTE.USER_CANCEL_BOOKING_SUCCESS, query: { bookingId: booking.id } });
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
      hideWarningDialog();
      setIsSubmitting(false);
    }
  };

  const handleClickPartialCheckout = async () => {
    if (!(await validateBookingStatusToUpdateBooking())) return;
    showConfirmationPartialCheckoutDialog();
  };

  const showConfirmationPartialCheckoutDialog = () => {
    setIsShowConfirmationPartialCheckoutBookingDialog(true);
  };

  const hideConfirmationPartialCheckoutDialog = () => {
    setIsShowConfirmationPartialCheckoutBookingDialog(false);
  };

  const childAges = groupBy(booking?.BookingChildAgeInfo, "childAgeInMonth");
  const childAgeKeys = Object.keys(childAges);

  const renderPartialCheckoutInfo = (booking: Booking) => {
    const { PartialCheckout } = booking;
    if (!PartialCheckout.length) {
      return null;
    }

    // First map to add formatted checkedOutAt
    const formattedItems = PartialCheckout.map((item) => ({
      ...item,
      checkedOutAt: moment(item.checkedOutAt).format(LONG_DATE),
    }));

    // Group by checkedOutAt
    const groupedByCheckout = groupBy(formattedItems, "checkedOutAt");

    // Map each group
    const partialCheckoutGroup = map(groupedByCheckout, (values, key) => {
      const adultQuantity = values.find((item) => item.isAdult)?.quantity || 0;

      const childAges = values
        .filter((item) => !item.isAdult)
        .map((item) => item.BookingChildAgeInfo.childAgeInMonth);

      const childGrouped = groupBy(childAges);
      const childAgeGroup = map(childGrouped, (values, age) => ({
        age,
        quantity: values.length,
      }));

      const childQuantity = childAges.length;

      return {
        adultQuantity,
        childQuantity,
        childAges: childAgeGroup,
        checkedOutAt: key,
      };
    });

    return (
      <Grid container className={styles.content_id}>
        <Grid item xs={6} lg={4}>
          <p className="text-xl font-medium xs:text-base xs:leading-5">
            途中退場人数
          </p>
        </Grid>
        <Grid item xs={6} lg={8} className="font-light xs:text-[14px]">
          {partialCheckoutGroup.map((item, index) => (
            <div
              key={index}
              className="flex gap-8 mb-8 xs:flex-col xs:gap-2 xs:mb-4"
            >
              <p>{moment(item.checkedOutAt).format(SHORT_TIME)}</p>
              <div>
                {item.adultQuantity ? (
                  <div className="flex gap-8 mb-4 xs:gap-4 xs:mb-2">
                    <p>おとな</p>
                    <p>{item.adultQuantity}人</p>
                  </div>
                ) : null}

                {item.childQuantity ? (
                  <div className="flex gap-8 xs:gap-4">
                    <p>子ども</p>
                    <div>
                      {item.childAges.map((item, index) => (
                        <p className="mb-2" key={index}>
                          {item.quantity}人 x {getAgeLabel(item.age as any)}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </Grid>
      </Grid>
    );
  };

  return (
    <UserLayout
      heading="予約詳細"
      title="予約詳細"
      breadcrumbItems={[
        { label: "トップ", href: ROUTE.INDEX },
        { label: "予約履歴", href: ROUTE.USER_HISTORY_BOOKINGS },
        {
          label: "予約詳細",
          href: ROUTE.USER_HISTORY_BOOKINGS_DETAIL.replace("[id]", String(router.query.id)),
        },
        ...(isShowConfirmationCancelBookingDialog
          ? [{
            label: "予約キャンセル",
            href: ROUTE.USER_HISTORY_BOOKINGS_DETAIL.replace("[id]", String(router.query.id)),
          }]
          : []),
      ]}
    >
      <section className="relative xs:px-5 pt-2 text-gray-600 body-font">
        {loading && (
          <div className="flex justify-center">
            <Spinner />
          </div>
        )}

        {!loading && booking && (
          <>
            <Card sx={{ minWidth: 275 }} className={styles.card}>
              <CardHeader
                className="!p-0"
                title={
                  <div className={styles.header}>
                    <div className={styles.col}>
                      <span></span>
                    </div>
                    <div className={styles.col}>
                      <div className="xs:mb-[20px] text-[16px]">
                        <span className="font-medium xs:inline-flex xs:w-[100px]">
                          利用日時：
                        </span>
                        <span className="ml-4 font-light md:text-[14px]">
                          {moment(booking?.date).format(
                            `${JP_SHORT_DATE} (ddd)`,
                          )}
                        </span>
                      </div>
                    </div>
                    <div className={styles.titleEnd}>
                      <div className="text-[16px]">
                        <span className="font-medium xs:inline-flex xs:w-[100px]">
                          予約人数:
                        </span>
                        <span className="ml-4 font-light md:text-[14px]">{`おとな ${booking?.adultQuantity}人 子ども${booking?.childQuantity} 人`}</span>
                      </div>
                    </div>
                  </div>
                }
              />
              <CardContent>
                <Grid container className={styles.content_id}>
                  <Grid item xs={12} md={6} lg={4}>
                    <p className="text-xl font-medium xs:text-base xs:leading-5 xs:text-center xs:mb-[20px]">
                      バーコード
                    </p>
                  </Grid>
                  <Grid item xs={12} md={6} lg={8}>
                    <canvas id="mycanvas" className="xs:mx-auto"></canvas>
                  </Grid>
                </Grid>

                <Grid container className="xs:pt-[20px]">
                  <Grid item xs={6} lg={4}>
                    <p className="text-xl font-medium xs:text-base xs:leading-5">
                      店舗
                    </p>
                  </Grid>
                  <Grid item xs={6} lg={8}>
                    <p className="font-light xs:text-[14px]">
                      {booking?.Tenant?.name}
                    </p>
                  </Grid>

                  <Grid item xs={6} lg={4}>
                    <p className="mt-4 text-xl font-medium xs:text-base xs:leading-5">
                      予約ID
                    </p>
                  </Grid>
                  <Grid item xs={6} lg={8}>
                    <p className="mt-4 font-light xs:text-[14px]">
                      {booking?.id}
                    </p>
                  </Grid>

                  <Grid item xs={6} lg={4}>
                    <p className="my-4 text-xl font-medium xs:text-base xs:leading-5">
                      商品
                    </p>
                  </Grid>
                  <Grid item xs={6} lg={8}>
                    <p className="my-4 font-light xs:text-[14px]">
                      {booking?.Ticket?.name}
                    </p>
                  </Grid>

                  <Grid item xs={6} lg={4}>
                    <p className="text-xl font-medium xs:text-base xs:leading-5">
                      購入日時
                    </p>
                  </Grid>
                  <Grid item xs={6} lg={8}>
                    <p className="font-light xs:text-[14px]">
                      {moment(booking?.createdAt).format(JP_SHORT_DATE)} (
                      {moment(booking?.createdAt).format("ddd")})
                    </p>
                  </Grid>
                  <Grid item xs={6} lg={4}>
                    <p className="my-4 text-xl font-medium xs:text-base xs:leading-5">
                      利用開始日
                    </p>
                  </Grid>
                  <Grid item xs={6} lg={8}>
                    <p className="my-4 font-light xs:text-[14px]">
                      {moment(booking?.date).format(JP_SHORT_DATE)} (
                      {moment(booking?.date).format("ddd")})
                    </p>
                  </Grid>
                  {!isTimesLimitTicket(booking?.Ticket?.type) && (
                    <>
                      <Grid item xs={6} lg={4}>
                        <p className="text-xl font-medium xs:text-base xs:leading-5">
                          おとなの人数
                        </p>
                      </Grid>
                      <Grid item xs={6} lg={8}>
                        <p className="mb-4 font-light xs:text-[14px]">
                          {booking?.adultQuantity}人
                        </p>
                      </Grid>
                    </>
                  )}

                  <Grid item xs={6} lg={4}>
                    <p className="text-xl font-medium xs:text-base xs:leading-5">
                      子どもの人数・年齢
                    </p>
                  </Grid>
                  <Grid item xs={6} lg={8}>
                    <div className="mb-4 font-light xs:text-[14px]">
                      {childAgeKeys.map((key) => {
                        const childAge = childAges[key];

                        return (
                          <div key={key} className="mb-[12px]">
                            {childAge.length}人 x {getAgeLabel(+key)}
                          </div>
                        );
                      })}
                    </div>
                  </Grid>
                </Grid>

                <Grid container className={styles.content_id}>
                  {/*CheckinAt*/}
                  {booking && !!booking.checkedInAt && (
                    <>
                      <Grid item xs={6} lg={4}>
                        <p className="mb-4 text-xl font-medium xs:text-base xs:leading-5">
                          入場時間
                        </p>
                      </Grid>
                      <Grid item xs={6} lg={8} className="font-light  xs:text-[14px] ">
                        <span className="mb-4 p-2 rounded-md bg-blue text-white max-w-min">
                          {moment(
                            booking.firstCheckedInAt || booking.checkedInAt,
                          ).format(SHORT_TIME)}
                        </span>
                      </Grid>
                    </>
                  )}

                  {/*CheckedOutAt / Stay Duration (first checkout only)*/}
                  {booking && !!getBookingFirstCheckoutAt(booking) && (
                    <>
                      <Grid item xs={6} lg={4}>
                        <p className="mb-4 text-xl font-medium xs:text-base xs:leading-5">
                          退場時間
                        </p>
                      </Grid>
                      <Grid item xs={6} lg={8} className="font-light  xs:text-[14px] ">
                        <span className="mb-4 p-2 rounded-md bg-blue text-white max-w-min">
                          {moment(getBookingFirstCheckoutAt(booking)).format(SHORT_TIME)}
                        </span>
                      </Grid>

                      <Grid item xs={6} lg={4}>
                        <p className="mb-4 text-xl font-medium xs:text-base xs:leading-5">
                          滞在時間
                        </p>
                      </Grid>
                      <Grid item xs={6} lg={8} className="font-light  xs:text-[14px] ">
                        <span className="mb-4 p-2 rounded-md bg-blue text-white max-w-min">
                          {formatStayDurationColonTime(getBookingFirstStayDurationMinutes(booking))}
                        </span>
                      </Grid>
                    </>
                  )}

                  <Grid item xs={6} lg={4}>
                    <p className="text-xl font-medium xs:text-base xs:leading-5">
                      {" "}
                      利用料金
                    </p>
                  </Grid>
                  <Grid
                    item
                    xs={6}
                    lg={8}
                    className="font-light  xs:text-[14px]"
                  >
                    {booking &&
                      sameBarcodeBookings &&
                      formatThousands(
                        getUseInDayBookingAmount(booking, sameBarcodeBookings),
                      )}
                    円
                  </Grid>
                  {booking?.extendedPrices && (booking.extendedPrices.child.length > 0 || booking.extendedPrices.parent.length > 0) && (
                    <>
                      <Grid item xs={6} lg={4}>
                        <p className="my-4 text-xl font-medium xs:text-base xs:leading-5">
                          延長料金
                        </p>
                      </Grid>
                      <Grid
                        item
                        xs={6}
                        lg={8}
                        className="font-light xs:text-[14px]"
                      >
                        <ExtendedPricesList
                          extendedPrices={booking.extendedPrices}
                          showTotal={false}
                          filterZero
                          className="my-4 flex flex-col gap-[4px] max-w-[164px]"
                        />
                      </Grid>
                    </>
                  )}

                  <Grid item xs={6} lg={4}>
                    <p className="my-4 text-xl font-medium xs:text-base xs:leading-5">
                      支払方法
                    </p>
                  </Grid>
                  <Grid item xs={6} lg={8}>
                    <p className="my-4 font-light xs:text-[14px]">
                      {
                        PAYMENT_TYPE_OPTIONS.find(
                          ({ value }) => value === booking?.Ticket?.paymentType,
                        ).label
                      }
                    </p>
                  </Grid>
                </Grid>

                {booking && renderPartialCheckoutInfo(booking)}

                {booking && (
                  <SmaregiBarcodeSection
                    booking={booking as Booking & { smaregiQRCodes: SmaregiQRCodes }}
                    loading={loading}
                    onChangePaymentStatus={handleChangePaymentStatus}
                  />
                )}

                <Grid container className={styles.content_id}>
                  <Grid item xs={12} md={6} lg={4}>
                    <p className="text-xl font-medium xs:text-base xs:leading-5 xs:text-center xs:mb-[20px]">
                      注意事項
                    </p>
                  </Grid>
                  <Grid item xs={12} md={6} lg={8}>
                    <ul className="font-light list-disc xs:text-[14px] xs:px-[10px] leading-[24px]">
                      <li>メールでお送りしているバーコードと同じものです。</li>
                      <li>
                        ご利用予定日を過ぎますと本バーコードはご利用できませんのでご注意ください。
                      </li>
                      <li>
                        領収書は店頭にて発行いたします。サイト上では発行できません。
                      </li>
                      <li>
                        キャンセル/返金手続きはお客さまにてお願いいたします。
                      </li>
                    </ul>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            <div className="flex justify-between py-2 xs:flex-col-reverse xs:max-w-[290px] xs:mx-[auto]">
              <div className="md:max-w-[290px] md:w-[290px]">
                <Button
                  type="button"
                  variant="outlined"
                  className="h-[64px] w-[200px] md:w-full md:block xs:text-[18px] xs:h-[48px]"
                  onClick={() => {
                    router.push(`${ROUTE.USER_HISTORY_BOOKINGS}`);
                  }}
                >
                  戻る
                </Button>
              </div>
              {booking && shouldRenderCancelOrChangeButtons(booking) && (
                <div className="flex flex-row md:block md:max-w-[290px] md:w-[290px] gap-[24px]">
                  <div className="md:mb-[16px] md:mr-[0]">
                    <Button
                      type="button"
                      variant="contained"
                      className="w-[200px] h-[64px] md:w-full md:block xs:text-[18px] xs:h-[48px]"
                      onClick={handleClickUpdateBooking}
                    >
                      予約内容変更
                    </Button>
                  </div>
                  {shouldRenderCancelButton(booking) && (
                    <div className="xs:mb-[16px]">
                      <Button
                        type="button"
                        variant="contained"
                        className={
                          "w-[200px] h-[64px] md:w-full md:block xs:text-[18px] xs:h-[48px]"
                        }
                        onClick={handleClickCancelBooking}
                      >
                        予約キャンセル
                      </Button>
                    </div>
                  )}
                  {shouldRenderPartialCheckOutButton(booking) && (
                    <div className="xs:mb-[16px]">
                      <Button
                        type="button"
                        variant="contained"
                        className={
                          "w-[200px] h-[64px] md:w-full md:block xs:text-[18px] xs:h-[48px]"
                        }
                        onClick={handleClickPartialCheckout}
                      >
                        退場者を選択
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {isShowWarningDialog && (
          <WarningDialog
            text="次へ"
            message={warningDialogMsg}
            onDismiss={hideWarningDialog}
            onAccept={handleAcceptCancelBooking}
          />
        )}

        <NotificationDialog
          isOpen={isShowNotificationDialog}
          message="ご希望のご予約は変更できません。"
          okLabel="戻る"
          onClose={() => setIsShowNotificationDialog(false)}
        />

        {isShowConfirmationCancelBookingDialog && (
          <ConfirmationCancelBookingDialog
            booking={booking}
            transactionDate={transaction?.ProcessDate}
            transactionId={transaction?.TranID}
            onDismiss={() => {
              setIsShowConfirmationCancelBookingDialog(false);
            }}
            onAccept={() => {
              setIsShowConfirmationCancelBookingDialog(false);
              setIsShowCreditCardFormDialog(true);
            }}
          />
        )}

        {isShowConfirmationPartialCheckoutBookingDialog && (
          <WarningDialog
            text="次へ"
            message={
              "途中で退場したい方がいる場合は、スタッフ立ち会いで退場手続きを行ってください。途中退場されたお客様の再入場はできませんので予めご了承ください。"
            }
            onDismiss={hideConfirmationPartialCheckoutDialog}
            onAccept={handleRedirectPartialCheckoutPage}
          />
        )}

        {isShowCreditCardFormDialog && (
          <CreditCardFormDialog
            transaction={transaction}
            onDismiss={() => {
              setIsShowCreditCardFormDialog(false);
            }}
            onAccept={submitCancelBooking}
          />
        )}
      </section>

      {/*Error Popup*/}
      {isShowErrorDialog && (
        <ErrorDialog
          message={popupErrMsg}
          text="戻る"
          onDismiss={() => setIsShowErrorDialog(false)}
        />
      )}

      {/*Required Reload Error Popup*/}
      {isShowRequireReloadErrorDialog && (
        <WarningDialog
          hideDismissButton={true}
          text="はい"
          message={invalidStatusErrMsg}
          onAccept={() => router.reload()}
          onDismiss={() => setIsShowRequireReloadErrorDialog(false)}
        />
      )}

      {/* Error */}
      <Error message={errMsg} className="mt-4 text-center" />
    </UserLayout>
  );
}

export default withAuthentication(BookingDetail, [ROLE.USER]);
