import { yupResolver } from "@hookform/resolvers/yup";
import { TextField } from "@mui/material";
import { BookingStatus, PaymentType, TicketBookingSchedule, TicketType } from "@prisma/client";
import { isNil } from "lodash";
import moment from "moment";
import { useSession } from "next-auth/react";
import Image from "next/legacy/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import Button from "components/common/Buttons/Button";
import Error from "components/common/Error";
import DatePickerField from "components/common/Fields/DatePickerField";
import UserLayout from "components/common/UserLayout";
import { PaymentOnlineBookingFormData } from "components/CreateBooking/PaymentOnlineBookingForm";
import QuantityAndAgesInfoFields from "components/CreateBooking/QuantityAndAgesInfoFields";
import BookingChangePaymentDialog from "components/User/BookingChangePaymentDialog";
import BookingChangeReviewDialog from "components/User/BookingChangeReviewDialog";
import ConfirmationDialogUser from "components/User/ConfirmationDialogUser";
import NotificationDialog from "components/User/NotificationDialog";
import { BOOKING_VALIDATION_ERROR_MESSAGES } from "constants/booking";
import { JP_SHORT_DATE, ROLE, SHORT_TIME } from "constants/common";
import { ROUTE } from "constants/route";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { updatePaymentOnlineBookingSchema } from "libs/validation/bookingSchema";
import { BookingPayload } from "models/Booking";
import { Booking, Tenant } from "models/Entity";
import { AgeUnit } from "models/enums";
import { fetchBookings, fetchBookingTransaction, updateBookingById, fetchBookingVacanciesStatus, fetchBookingById } from "services/api-client/booking.service";
import { fetchTenants } from "services/api-client/tenant.service";
import { fetchHistoryDetail } from "services/api-client/user.service";
import { TransactionInfo } from "services/gmo.service";
import CalendarIcon from "statics/images/calendar-2.svg";
import PeopleIcon from "statics/images/user/people-icon.svg";
import SunIcon from "statics/images/user/sun.svg";
import { NotificationType } from "stores/reducers/notification";
import { isAfterDay, isSameOrAfterDay, isSameOrBeforeDay, standardizeEpochDate, isSameDay } from "utils/date-time";
import {
  checkIsFullOrNotAvailableDay,
  generateDefaultChildAges,
  getDailyBookingTotalPrices,
  isOneDayBooking,
  isOneDayMonthlyBooking,
  isOneDayTimesLimitBooking,
  isPromotionTicket,
} from "utils/booking";
import { toChildAge } from "utils/booking-child-age-info";
import { validateBooking } from "utils/booking-validation";
import { getMessageFromError } from "utils/common";
import { generateAgeOptions, getTicketBookingSchedule } from "utils/ticket";
import { convertToOnlineTicketVacancies } from "utils/vacancy-status";
import { PaymentOnlineBookingVacancy } from "models/Vacancy";

enum FormStep {
  S1_UPDATE,
  S10_CANNOT_UPDATE,

  S2_REVIEW,
  S20_REFUND_CONFIRM,

  S3_PAYMENT,
  S4_CONFIRM,
}

function BookingDetail() {
  const { data: session } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<Booking>();
  const [parentMonthlyBooking, setParentMonthlyBooking] = useState<Booking>();
  const [bookingPayload, setBookingPayload] = useState<BookingPayload>();
  const [transaction, setTransaction] = useState<TransactionInfo>();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [bookingVacancies, setBookingVacancies] = useState<PaymentOnlineBookingVacancy[]>([]);

  const [totalAmount, setTotalAmount] = useState(0);

  const [updateStep, setUpdateStep] = useState(FormStep.S1_UPDATE);

  const [ticketBookingSchedule, setTicketBookingSchedule] = useState<TicketBookingSchedule>();
  const [errMsg, setErrMsg] = useState<string>("");
  const [errNotificationDialogMsg, setErrNotificationDialogMsg] = useState<string>("");

  const ticket = booking?.Ticket;
  const isOneDayOnlineBooking = booking?.Ticket.paymentType === PaymentType.Online && booking?.Ticket.type === TicketType.Daily;
  const isMonthlyBooking = booking && isOneDayMonthlyBooking(booking);
  const isTimesLimitBooking = booking && isOneDayTimesLimitBooking(booking);

  const isOnlyAdultBooking = ticket?.maxChildPerAdult === 0;
  const onlineTicketVacancy = bookingVacancies.find((item) => item.ticketId === ticket?.id);

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    getValues,
  } = useForm<PaymentOnlineBookingFormData>({
    resolver: yupResolver(updatePaymentOnlineBookingSchema),
  });

  const [childQuantity, adultQuantity, childAges, bookingDate] = watch(["childQuantity", "adultQuantity", "childAges", "bookingDate"]);

  useEffect(() => {
    if (router?.query?.id) {
      const id = Number(router.query.id);
      fetchData(id);
    }
  }, [router?.query?.id]);

  useEffect(() => {
    if (isNil(childQuantity)) {
      return;
    }

    const defaultChildAges = generateDefaultChildAges(childQuantity ?? 0, childAges);

    replace(defaultChildAges);
  }, [childQuantity]);

  useEffect(() => {
    if (booking) {
      fetchVacanciesData(booking);
      if (isOneDayMonthlyBooking(booking)) {
        fetchParentMonthlyBooking(booking.parentBookingId);
      }

      const date = moment(booking?.date).toISOString();
      const ticketBookingSchedule = getTicketBookingSchedule(date, booking?.Ticket);
      setTicketBookingSchedule(ticketBookingSchedule);

      setTotalAmount(Number(booking?.totalAmount));
      setValue("adultQuantity", booking.adultQuantity - (booking.partialCheckedOutAdultQuantity || 0));
      setValue("childQuantity", booking.childQuantity - (booking.partialCheckedOutChildQuantity || 0));
      setValue("childAges", booking.BookingChildAgeInfo
        .filter((childAgeInfo) => !booking.PartialCheckout.find((partialCheckout) => partialCheckout.bookingChildAgeInfoId === childAgeInfo.id))
        .map(toChildAge));
      setValue("bookingDate", booking.date as any as string);
    }
  }, [booking]);

  useEffect(() => {
    const bookingScheduleInfo = getTicketBookingSchedule(bookingDate, ticket);
    setTicketBookingSchedule(bookingScheduleInfo);
  }, [bookingDate]);

  const fetchData = async (id: number) => {
    try {
      setErrMsg(errMsg);
      const booking = await fetchHistoryDetail(id);
      setBooking(booking);

      const [tenants, transaction] = await Promise.all([fetchTenants(), fetchBookingTransaction(booking.id)]);

      setTransaction(transaction);
      setTenants(tenants);
    } catch (err) {
      const message = getMessageFromError(err);
      setErrMsg(message);
    }
  };

  const fetchVacanciesData = async (booking: Booking) => {
    try {
      setErrMsg("");

      const tenantVacancies = await fetchBookingVacanciesStatus({ tenantCodes: [booking.tenantCode] });
      const tenantOnlineTicketVacancies = tenantVacancies.oneDayOnlineTenantStatus[booking.tenantCode];
      const bookingVacancies = convertToOnlineTicketVacancies(tenantOnlineTicketVacancies);
      setBookingVacancies(bookingVacancies);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const fetchParentMonthlyBooking = async (parentMonthlyBookingId: number) => {
    try {
      setErrMsg("");

      const parentMonthlyBooking = await fetchBookingById(parentMonthlyBookingId);
      setParentMonthlyBooking(parentMonthlyBooking);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const { fields, replace, remove, append } = useFieldArray({
    control,
    name: "childAges",
  });

  const fetchBookingsData = async (): Promise<Booking[]> => {
    try {
      setErrMsg("");
      const bookings = await fetchBookings({ barCode: booking.barCode });
      return bookings;
    } catch (err) {
      const message = getMessageFromError(err);
      setErrMsg(message);
    }
  };

  const checkBookingValid = async (bookingPayload: BookingPayload) => {
    setErrMsg("");
    const bookings = await fetchBookingsData();

    if (!ticketBookingSchedule) {
      return { type: NotificationType.ERROR, message: BOOKING_VALIDATION_ERROR_MESSAGES.INVALID_BOOKING_DATE };
    }

    const sameBarCodeBookings = bookings.filter(
      (item) => item.barCode === booking.barCode && !([BookingStatus.Cancelled, BookingStatus.SystemCancelled] as string[]).includes(item.status)
    );

    const { isValid, message } = validateBooking({
      userId: session.user.id,
      bookingPayload,
      tickets: [ticket],
      tenants: tenants,
      ticketBookingSchedule: ticketBookingSchedule,
      type: "update",
      originalBooking: booking,
      sameBarCodeBookings,
    });

    if (!isValid) {
      return { type: NotificationType.ERROR, message };
    }
  };

  const onSubmit = async (data: PaymentOnlineBookingFormData) => {
    setErrNotificationDialogMsg("");
    const { totalAmount } = getDailyBookingTotalPrices(data.adultQuantity, data.childQuantity, ticket, ticketBookingSchedule);

    const bookingPayload = {
      id: booking.id,
      tenantCode: booking.tenantCode,
      ticketId: booking.ticketId,
      date: moment(booking?.date).toISOString(),
      subEmail: booking.subEmail,
      adultPrice: +booking.adultPrice,
      childPrice: +booking.childPrice,
      adultQuantity: Number(data.adultQuantity),
      childQuantity: Number(data.childQuantity),
      childAges: childAges.map(({ age, unit }) => (unit === AgeUnit.Year ? age * 12 : age)),
      totalAmount: isOneDayOnlineBooking ? totalAmount : +booking.totalAmount,
      parentBookingId: booking.parentBookingId,
    };

    const validateError = await checkBookingValid(bookingPayload);
    if (validateError) {
      setErrNotificationDialogMsg(validateError.message);
      return setUpdateStep(FormStep.S10_CANNOT_UPDATE);
    }

    setTotalAmount(totalAmount);
    setBookingPayload(bookingPayload);

    if (!isOneDayOnlineBooking) {
      setUpdateStep(FormStep.S4_CONFIRM);
      return;
    }

    const needRefund = Number(booking.totalAmount) > totalAmount;
    const needPayment = Number(booking.totalAmount) < totalAmount;

    if (needRefund) {
      setUpdateStep(FormStep.S20_REFUND_CONFIRM);
    } else if (needPayment) {
      setUpdateStep(FormStep.S2_REVIEW);
    } else {
      setUpdateStep(FormStep.S4_CONFIRM);
    }
  };

  const onPaymentChange = () => {
    setUpdateStep(FormStep.S4_CONFIRM);
  };

  const onUpdateConfirmed = async () => {
    try {
      if (loading) {
        return;
      }

      setLoading(true);

      await updateBookingById(bookingPayload);
      router.push({ pathname: ROUTE.USER_HISTORY_BOOKINGS_DETAIL_UPDATE_COMPLETED, query: { bookingId: booking.id } });
    } catch (error) {
      const message = getMessageFromError(error);
      setErrMsg(message);
      setUpdateStep(FormStep.S1_UPDATE);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUpdateBookingDate = () => {
    setErrNotificationDialogMsg("");
    if (isSameOrAfterDay(moment().toDate(), booking.date)) {
      setErrNotificationDialogMsg("ご希望の日にちは変更できません。");
      setUpdateStep(FormStep.S10_CANNOT_UPDATE);
      return;
    }

    const bookingDate = getValues("bookingDate");

    const bookingPayload = {
      id: booking.id,
      tenantCode: booking.tenantCode,
      ticketId: booking.ticketId,
      date: bookingDate,
      subEmail: booking.subEmail,
      adultPrice: +booking.adultPrice,
      childPrice: +booking.childPrice,
      adultQuantity: booking.adultQuantity,
      childQuantity: booking.childQuantity,
      childAges: booking.BookingChildAgeInfo.map(({ childAgeInMonth }) => childAgeInMonth),
      totalAmount: +booking.totalAmount,
    };

    setBookingPayload(bookingPayload);
    setUpdateStep(FormStep.S4_CONFIRM);
  };
  const disableUpdateQuantityButton = isMonthlyBooking &&
    booking?.status === BookingStatus.CheckedIn &&
    booking.childQuantity - (booking.partialCheckedOutChildQuantity || 0) == parentMonthlyBooking?.childQuantity &&
    booking.adultQuantity - (booking.partialCheckedOutAdultQuantity || 0) == parentMonthlyBooking?.adultQuantity;

  const fromActions = (
    <div className="flex flex-col items-center">
      <div className="flex flex-row gap-[40px] xs:flex-col-reverse xs:gap-0">
        <Link href={ROUTE.USER_HISTORY_BOOKINGS_DETAIL.replace("[id]", String(booking?.id))} legacyBehavior>
          <a className="user-button-outline-blue-medium h-[56px] md:h-12 w-[200px] xs:w-[290px] xs:h-[48px] xs:!mt-4 text-xl md:!text-lg mdup:!leading-7">
            戻る
          </a>
        </Link>
        <Button
          variant="contained"
          className={`user-button-blue-medium h-[56px] md:h-12 w-[200px] xs:w-[290px] text-xl md:!text-lg mdup:!leading-7
            ${disableUpdateQuantityButton && "opacity-50"}
          `}
          type="submit"
          disabled={disableUpdateQuantityButton}
        >
          変更
        </Button>
      </div>
      <Error message={errMsg} className="mt-4" />
    </div>
  );

  const needCreditCard = Number(booking?.totalAmount) - totalAmount !== 0;

  const shouldRenderBuyMoreTicketButton = (booking: Booking) => {
    const isSameDateBooking = isSameDay(moment().toDate(), booking?.date);

    return isSameDateBooking;
  };

  const shouldRenderUpdateQuantity = (booking: Booking) => {
    const isOneDayBookingReCheckedIn = isOneDayBooking(booking) && !!booking.firstCheckedInAt;
    if (isOneDayBookingReCheckedIn) {
      return false;
    }
    if (isMonthlyBooking) {
      return !booking.checkedOutAt || booking?.status != BookingStatus.CheckedOut;
    } else {
      return booking?.status !== BookingStatus.CheckedIn;
    }
  };

  const shouldRenderUpdateBookingDate = (booking: Booking) => {
    const isCheckingInBooking = booking?.status === BookingStatus.CheckedIn;
    const isOneDayBookingReCheckedIn = isOneDayBooking(booking) && !!booking.firstCheckedInAt;
    if (isOneDayBookingReCheckedIn) {
      return false;
    }
    return !isCheckingInBooking;
  };

  const bookingQuantities = useMemo(
    () => {
      let maxAdultQuantity;
      let maxChildQuantity;
      let minAdultQuantity = isOneDayOnlineBooking || isOnlyAdultBooking ? 1 : 0;
      let minChildQuantity = 1;
      if (isMonthlyBooking) {
        const partialCheckedOutAdultQuantity = (booking.partialCheckedOutAdultQuantity || 0);
        const partialCheckedOutChildQuantity = (booking.partialCheckedOutChildQuantity || 0);

        maxAdultQuantity = parentMonthlyBooking?.adultQuantity;
        maxChildQuantity = parentMonthlyBooking?.childQuantity;

        minAdultQuantity = Math.min(
          maxAdultQuantity,
          booking.status == BookingStatus.CheckedIn ?
            booking.adultQuantity - partialCheckedOutAdultQuantity
            : minAdultQuantity);
        minChildQuantity = Math.min(
          maxChildQuantity,
          booking.status == BookingStatus.CheckedIn ?
            booking.childQuantity - partialCheckedOutChildQuantity
            : minChildQuantity
        );
      } else if (isTimesLimitBooking) {
        const ticketDetail = booking.Ticket.TicketDetail;
        const temperoryUsageTimes = booking.childQuantity;
        const availableTimes = ticketDetail.limitTimes + (ticketDetail.extraTimes || 0) - booking.usageTimes + temperoryUsageTimes;
        maxChildQuantity = availableTimes;
        maxAdultQuantity = availableTimes;
      }

      return {
        maxAdultQuantity,
        maxChildQuantity,
        minAdultQuantity,
        minChildQuantity,
      };
    },
    [booking, parentMonthlyBooking]
  );
  return (
    <UserLayout
      heading="予約内容変更"
      title="マイページ"
      breadcrumbItems={[
        { label: "トップ", href: ROUTE.INDEX },
        { label: "予約履歴", href: ROUTE.USER_HISTORY_BOOKINGS },
        {
          label: "予約詳細",
          href: ROUTE.USER_HISTORY_BOOKINGS_DETAIL.replace("[id]", String(router.query.id)),
        },
        {
          label: "予約変更",
          href: ROUTE.USER_HISTORY_BOOKINGS_DETAIL_UPDATE.replace("[id]", String(router.query.id)),
        },
      ]}
    >
      {/* Account Information */}
      {ticket && (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-[856px] w-100 m-auto flex flex-col gap-[76px] xs:mx-5">
          {/* Update quantity */}
          {shouldRenderUpdateQuantity(booking) && (
            <div>
              {renderHeader(PeopleIcon, "人数の変更")}
              <div className="max-w-[600px] w-full mx-auto mt-[46px] xs:mb-6">
                <QuantityAndAgesInfoFields
                  control={control}
                  fields={fields}
                  errors={errors}
                  setValue={setValue}
                  adultQuantity={adultQuantity}
                  childQuantity={childQuantity}
                  ageOptions={generateAgeOptions(ticket)}
                  maxChildPerAdult={ticket.maxChildPerAdult}
                  minAdultQuantity={bookingQuantities.minAdultQuantity}
                  minChildQuantity={bookingQuantities.minChildQuantity}
                  maxChildQuantity={bookingQuantities.maxChildQuantity}
                  maxAdultQuantity={bookingQuantities.maxAdultQuantity}
                  showChildAgeHint={true}
                  remove={remove}
                  append={append}
                  adultQuantityLabel="おとなの人数"
                  childQuantityLabel="子どもの人数"
                  disabled={isPromotionTicket(ticket)}
                  isTimesLimitBooking={isTimesLimitBooking}
                />
              </div>
              <p className="text-center font-light text-[16px] xs:!text-[14px] leading-[28px] my-[24px]">
                {isMonthlyBooking && booking.status !== BookingStatus.CheckedIn && (
                  <>
                    ※{ticketBookingSchedule?.canCancelOrChangeBeforeInDay > 0 ? "予約日の前日" : "予約日の当日"}
                    {ticketBookingSchedule?.canCancelOrChangeUtil &&
                      moment(standardizeEpochDate(new Date(ticketBookingSchedule?.canCancelOrChangeUtil))).format(SHORT_TIME)}
                    まで変更可能です。
                  </>
                )}
              </p>
              {fromActions}
            </div>
          )}

          {/* Update booking date */}
          {shouldRenderUpdateBookingDate(booking) && (
            <div>
              {renderHeader(CalendarIcon, "日時の変更")}
              <div className="pt-[52px] flex justify-center">
                <div className="flex items-center xs:flex-col">
                  <label className="font-medium text-[20px] leading-[32px] w-[112px] xs:w-full xs:text-left xs:mb-2 xs:text-[16px]">利用日時</label>
                  <div className="w-[290px] xs:w-[335px]">
                    <DatePickerField
                      mask={"____年__月__日"}
                      key={booking?.id}
                      name="bookingDate"
                      control={control}
                      defaultValue={null}
                      disabled={!isOneDayOnlineBooking}
                      inputFormat={`${JP_SHORT_DATE}`}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          className="flex justify-between !border !border-solid rounded-[10px] h-full font-light"
                          inputProps={{
                            ...params.inputProps,
                            className: `${params.className} !font-light h-[40px] mx-2`,
                            readOnly: true,
                          }}
                          fullWidth
                        />
                      )}
                      disablePast={true}
                      shouldDisableDate={(day: moment.Moment) => {
                        const deadlineDate = moment().add(7, "days");
                        const isInNext7Days = isAfterDay(day, moment().toDate()) && isSameOrBeforeDay(day, deadlineDate);
                        if (!isInNext7Days) {
                          return true;
                        }

                        const ticketBookingSchedule = getTicketBookingSchedule(day.toISOString(), ticket, false);
                        if (!ticketBookingSchedule) {
                          return true;
                        }

                        const isFullDay = checkIsFullOrNotAvailableDay(day, booking.date, onlineTicketVacancy?.vacancies);
                        if (isFullDay) {
                          return true;
                        }

                        return false;
                      }}
                    />
                    {errors.bookingDate && <Error message={errors.bookingDate.message} className="mt-3" />}
                  </div>
                </div>
              </div>
              <p className="text-center font-light text-[16px] leading-[28px] my-[24px] xs:text-[14px]">利用日前日の23:59まで変更可能です。</p>
              <div className="flex flex-col items-center">
                <div className="flex flex-row gap-[40px] xs:flex-col-reverse xs:gap-0">
                  <Link href={ROUTE.USER_HISTORY_BOOKINGS_DETAIL.replace("[id]", String(booking?.id))} legacyBehavior>
                    <a
                      className="user-button-outline-blue-medium h-[56px]
                  md:h-12 w-[200px] xs:w-[290px] xs:h-[48px] xs:!mt-4 text-xl md:!text-lg mdup:!leading-7"
                    >
                      戻る
                    </a>
                  </Link>
                  <Button
                    variant="contained"
                    className="user-button-blue-medium h-[56px] md:h-12 w-[200px] xs:w-[290px] text-xl md:!text-lg mdup:!leading-7"
                    type="button"
                    onClick={handleSubmitUpdateBookingDate}
                    disabled={!isOneDayOnlineBooking}
                  >
                    変更
                  </Button>
                </div>
                <Error message={errMsg} className="mt-4" />
              </div>
            </div>
          )}

          <div className="flex flex-col">
            <div>
              {shouldRenderBuyMoreTicketButton(booking) && (
                <>
                  {renderHeader(
                    SunIcon,
                    "当日利用の商品を追加する",
                    <div className="xs:hidden">
                      <div>
                        <Link href={`${ROUTE.USE_IN_DAY_BOOKING}?mainBookingId=${booking.id}&tenantCode=${booking.tenantCode}`} legacyBehavior>
                          <a className="user-button-outline-blue-medium">追加する</a>
                        </Link>
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="xsup:hidden h-0 flex justify-center">
                      <Link href={`${ROUTE.USE_IN_DAY_BOOKING}?mainBookingId=${booking.id}&tenantCode=${booking.tenantCode}`} legacyBehavior>
                        <a className="user-button-blue-medium my-6 h-[56px] md:h-12 w-[200px] xs:w-[290px] text-xl md:!text-lg mdup:!leading-7">追加する</a>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div></div>
        </form>
      )}

      {updateStep === FormStep.S2_REVIEW && (
        <BookingChangeReviewDialog
          totalAdult={adultQuantity}
          totalChild={childQuantity}
          totalAmount={totalAmount}
          originTotalAmount={Number(booking?.totalAmount)}
          transactionDate={transaction?.ProcessDate}
          transactionId={transaction?.TranID}
          isOpen={true}
          onClose={() => setUpdateStep(FormStep.S1_UPDATE)}
          onOk={() => {
            if (needCreditCard) {
              setUpdateStep(FormStep.S3_PAYMENT);
            } else {
              setUpdateStep(FormStep.S4_CONFIRM);
            }
          }}
        />
      )}

      {updateStep === FormStep.S3_PAYMENT && (
        <BookingChangePaymentDialog transaction={transaction} isOpen={true} onClose={() => setUpdateStep(FormStep.S2_REVIEW)} onOk={onPaymentChange} />
      )}

      {updateStep === FormStep.S20_REFUND_CONFIRM && (
        <ConfirmationDialogUser
          onAccept={() => setUpdateStep(FormStep.S2_REVIEW)}
          onDismiss={() => setUpdateStep(FormStep.S1_UPDATE)}
          dismissText="戻る"
          acceptText="次へ"
          message="変更内容に応じて、返金手続きへ進みます。"
        />
      )}
      {updateStep === FormStep.S4_CONFIRM && (
        <ConfirmationDialogUser
          onAccept={onUpdateConfirmed}
          onDismiss={() => setUpdateStep(FormStep.S1_UPDATE)}
          onBack={() => {
            setUpdateStep(FormStep.S1_UPDATE);
            router.push(`${ROUTE.USER_HISTORY_BOOKINGS}/${booking?.id}`);
          }}
          dismissText="戻る"
          acceptText="確定"
          message="変更を確定します"
          loading={loading}
        />
      )}
      {updateStep === FormStep.S10_CANNOT_UPDATE && (
        <NotificationDialog
          isOpen={true}
          message={errNotificationDialogMsg || "ご希望のご予約は変更できません。"}
          okLabel="戻る"
          onClose={() => setUpdateStep(FormStep.S1_UPDATE)}
        />
      )}
    </UserLayout>
  );
}

const renderHeader = (Icon: any, title: string, actions?: React.ReactNode) => {
  return (
    <div className="relative flex xsup:flex-row xs:flex-col items-center justify-between xs:!items-start gap-4 py-5 md:py-[14px] px-[16px] bar-bg-gray">
      <div className="flex items-center justify-center gap-x-5">
        <Image src={Icon} alt="PeopleIcon" />
        <span className="text-2xl font-medium text-blue-color xs:text-base xs:leading-7 md:text-lg md:leading-6">{title}</span>
      </div>
      {actions}
      <div className="absolute w-full left-0 bottom-0 border-b-2 border-dotted border-[#979797]"></div>
    </div>
  );
};

export default withAuthentication(BookingDetail, [ROLE.USER]);
