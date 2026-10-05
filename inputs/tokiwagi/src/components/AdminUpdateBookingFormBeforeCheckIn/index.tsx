import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import moment from "moment";
import { BookingStatus, PaymentType, TicketBookingSchedule, TicketType } from "@prisma/client";
import Image from "next/legacy/image";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFieldArray, useForm } from "react-hook-form";
import { isNil } from "lodash";
import { TextField } from "@mui/material";

import PeopleIcon from "statics/images/user/people-icon.svg";
import { SHORT_TIME, VACANCY_STATUS } from "constants/common";
import { Booking } from "models/Entity";
import { generateAgeOptions, getTicketBookingSchedule } from "utils/ticket";
import Error from "components/common/Error";
import CalendarIcon from "statics/images/calendar-2.svg";
import { PaymentOnlineBookingFormData } from "components/CreateBooking/PaymentOnlineBookingForm";
import { updatePaymentOnlineBookingSchema } from "libs/validation/bookingSchema";
import QuantityAndAgesInfoFields from "components/CreateBooking/QuantityAndAgesInfoFields";
import { toChildAge } from "utils/booking-child-age-info";
import { checkIsFullOrNotAvailableDay, generateDefaultChildAges, getDailyBookingTotalPrices, isOneDayMonthlyBooking, isPromotionTicket } from "utils/booking";
import DatePickerField from "components/common/Fields/DatePickerField";
import Button from "components/common/Buttons/Button";
import { TransactionInfo } from "services/gmo.service";
import { fetchBookings, fetchBookingTransaction, fetchBookingVacanciesStatus } from "services/api-client/booking.service";
import { BookingPayload } from "models/Booking";
import { AgeUnit, FormStep } from "models/enums";
import { getMessageFromError } from "utils/common";
import NotificationDialog from "components/User/NotificationDialog";
import { fetchBookingById, updateBookingById } from "services/api-client/admin/booking.service";
import { ROUTE } from "constants/route";
import { fetchCreditCardAdmin } from "services/api-client/admin/credit-card.service";
import { isAfterDay, isSameOrAfterDay, isSameOrBeforeDay, standardizeEpochDate } from "utils/date-time";
import { NotificationType } from "stores/reducers/notification";
import { BOOKING_VALIDATION_ERROR_MESSAGES } from "constants/booking";
import { validateBooking } from "utils/booking-validation";
import { checkIsTodayOnlineOneDayTicketVacancyAvailable, convertToOnlineTicketVacancies } from "utils/vacancy-status";
import { OnlineTicketVacancy, PaymentOnlineBookingVacancy } from "models/Vacancy";
import { getUrlQueryValue } from "utils/url";

import AdminUpdateBookingReviewDialog from "./AdminUpdateBookingReviewDialog";
import AdminBookingCreditCardDialog from "./AdminBookingCreditCardDialog";
import AdminBookingConfirmDialog from "./AdminBookingConfirmDialog";

export default function AdminUpdateBookingFormBeforeCheckIn() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<Booking>();
  const [parentMonthlyBooking, setParentMonthlyBooking] = useState<Booking>();
  const [sameBarCodeBookings, setSameBarCodeBookings] = useState<Booking[]>();
  const [bookingPayload, setBookingPayload] = useState<BookingPayload>();
  const [transaction, setTransaction] = useState<TransactionInfo>();
  const [creditCard, setCreditCard] = useState<TransactionInfo>();

  const [totalAmount, setTotalAmount] = useState(0);

  const [updateStep, setUpdateStep] = useState(FormStep.S1_UPDATE);

  const [ticketBookingSchedule, setTicketBookingSchedule] = useState<TicketBookingSchedule>();
  const [errMsg, setErrMsg] = useState<string>("");
  const [errNotificationDialogMsg, setErrNotificationDialogMsg] = useState<string>("");
  const [bookingVacancies, setBookingVacancies] = useState<PaymentOnlineBookingVacancy[]>([]);
  const [todayOnlineOneDayTicketVacancy, setTodayOnlineOneDayTicketVacancy] = useState<OnlineTicketVacancy>(null);

  const ticket = booking?.Ticket;
  const isOneDayOnlineBooking = booking?.Ticket.paymentType === PaymentType.Online && booking?.Ticket.type === TicketType.Daily;
  const isOnlyAdultBooking = ticket?.maxChildPerAdult === 0;
  const isHasMonthlyBookingInGroup = sameBarCodeBookings?.some((booking) => isOneDayMonthlyBooking(booking));
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

  const { fields, replace, append, remove } = useFieldArray({
    control,
    name: "childAges",
  });

  const [childQuantity, adultQuantity, childAges, bookingDate] = watch(["childQuantity", "adultQuantity", "childAges", "bookingDate"]);
  const isMonthlyBooking = booking && isOneDayMonthlyBooking(booking);

  const filters = getUrlQueryValue("filters");
  const page = getUrlQueryValue("page");
  const staffOrAdminId = getUrlQueryValue("staffOrAdminId");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (booking?.barCode) {
      fetchSameBarCodeBookings(booking.barCode);
    }
  }, [booking]);

  useEffect(() => {
    if (isNil(childQuantity)) {
      return;
    }

    const defaultChildAges = generateDefaultChildAges(childQuantity ?? 0, childAges);

    replace(defaultChildAges);
  }, [childQuantity]);

  useEffect(() => {
    if (booking) {
      const date = moment(booking?.date).toISOString();
      const ticketBookingSchedule = getTicketBookingSchedule(date, booking?.Ticket);
      setTicketBookingSchedule(ticketBookingSchedule);

      setTotalAmount(Number(booking?.totalAmount));
      setValue("adultQuantity", booking.adultQuantity);
      setValue("childQuantity", booking.childQuantity);
      setValue("childAges", booking.BookingChildAgeInfo.map(toChildAge));
      setValue("bookingDate", booking.date as any as string);
    }
  }, [booking]);

  useEffect(() => {
    const bookingScheduleInfo = getTicketBookingSchedule(bookingDate, ticket);
    setTicketBookingSchedule(bookingScheduleInfo);
  }, [bookingDate]);

  const fetchData = async () => {
    try {
      setErrMsg(errMsg);
      const id = Number(router.query.id);

      const booking = await fetchBookingById(id);
      setBooking(booking);

      const [transaction, creditCard, tenantVacancies] = await Promise.all([
        fetchBookingTransaction(booking.id),
        fetchCreditCardAdmin(booking.userId),
        fetchBookingVacanciesStatus({ tenantCodes: [booking.tenantCode], includeTodayOneDayOnlineForInDayVacancy: true }),
      ]);

      setTransaction(transaction);
      setCreditCard(creditCard);

      const tenantOnlineTicketVacancies = tenantVacancies.oneDayOnlineTenantStatus[booking.tenantCode];
      const bookingVacancies = convertToOnlineTicketVacancies(tenantOnlineTicketVacancies);
      const tenantUseInDayTicketVacancies = tenantVacancies.inDayTenantStatus[booking.tenantCode];
      const todayOnlineOneDayTicketVacancy = tenantUseInDayTicketVacancies.tickets.filter((item) => item.ticketId === booking.ticketId)[0];

      if (checkIsTodayOnlineOneDayTicketVacancyAvailable(todayOnlineOneDayTicketVacancy)) {
        todayOnlineOneDayTicketVacancy.status = VACANCY_STATUS.AVAILABLE;
      }

      setTodayOnlineOneDayTicketVacancy({ ...todayOnlineOneDayTicketVacancy, date: moment().toISOString() });
      setBookingVacancies(bookingVacancies);

      if (isOneDayMonthlyBooking(booking)) {
        fetchParentMonthlyBooking(booking.parentBookingId);
      }
    } catch (err) {
      const message = getMessageFromError(err);
      setErrMsg(message);
    }
  };

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

  const fetchSameBarCodeBookings = async (barCode: string) => {
    try {
      setErrMsg("");
      const bookings = await fetchBookings({ barCode });
      setSameBarCodeBookings(bookings);
    } catch (err) {
      const message = getMessageFromError(err);
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
      bookingPayload,
      tickets: [ticket],
      ticketBookingSchedule: ticketBookingSchedule,
      type: "update",
      originalBooking: booking,
      sameBarCodeBookings,
    });

    if (!isValid) {
      return { type: NotificationType.ERROR, message };
    }
  };

  const redirectToBookingManagement = () => {
    router.push({
      pathname: ROUTE.BOOKING_MANAGEMENT_LIST,
      query: {
        filters,
        page,
        ...(staffOrAdminId && { staffOrAdminId }),
      },
    });
  };

  const handleSubmitUpdateBookingDate = () => {
    setErrNotificationDialogMsg("");
    if (isAfterDay(moment().toDate(), booking.date)) {
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

      await updateBookingById(booking.id, bookingPayload);

      setUpdateStep(FormStep.S5_COMPLETED);
    } catch (error) {
      const message = getMessageFromError(error);
      setErrMsg(message);
      setUpdateStep(FormStep.S1_UPDATE);
    } finally {
      setLoading(false);
    }
  };

  const fromActions = (
    <div className="flex flex-col items-center mt-[24px]">
      <p className="text-center font-light text-[16px] leading-[28px mb-[24px]">
        ※{ticketBookingSchedule?.canCancelOrChangeBeforeInDay > 0 ? "予約日の前日" : "予約日の当日"}
        {ticketBookingSchedule?.canCancelOrChangeUtil &&
          moment(standardizeEpochDate(new Date(ticketBookingSchedule?.canCancelOrChangeUtil))).format(SHORT_TIME)}
        まで変更可能です。
      </p>
      <div className="flex flex-row gap-[40px]">
        <Button variant="outlined" className=" h-[56px] w-[200px] text-[20px]" type="button" onClick={redirectToBookingManagement}>
          戻る
        </Button>
        <Button variant="contained" className="h-[56px] w-[200px] text-[20px]" type="submit">
          変更
        </Button>
      </div>
      <Error message={errMsg} className="mt-4" />
    </div>
  );

  const needToCharge = Number(booking?.totalAmount) !== totalAmount && ticket?.paymentType === PaymentType.Online;
  const canUpdateQuantity = !!creditCard;

  return (
    <div>
      {/* Account Information */}
      {ticket && (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-[856px] w-100 m-auto flex flex-col gap-[76px]">
          {/* Update quantity */}
          <div>
            {renderHeader(PeopleIcon, "予約人数の変更")}
            <div className="max-w-[600px] w-full mx-auto mt-[46px]">
              <QuantityAndAgesInfoFields
                control={control}
                fields={fields}
                errors={errors}
                setValue={setValue}
                adultQuantity={adultQuantity}
                childQuantity={childQuantity}
                ageOptions={generateAgeOptions(ticket)}
                maxChildPerAdult={ticket.maxChildPerAdult}
                minAdultQuantity={isOnlyAdultBooking || (isOneDayOnlineBooking && !isHasMonthlyBookingInGroup) ? 1 : 0}
                minChildQuantity={1}
                maxChildQuantity={isMonthlyBooking && parentMonthlyBooking?.childQuantity}
                maxAdultQuantity={isMonthlyBooking && parentMonthlyBooking?.adultQuantity}
                showChildAgeHint={true}
                adultQuantityLabel="おとなの人数"
                childQuantityLabel="子どもの人数"
                disabled={!canUpdateQuantity || isPromotionTicket(ticket)}
                append={append}
                remove={remove}
              />
            </div>
            {fromActions}
          </div>

          {/* Update booking date */}
          <div>
            {renderHeader(CalendarIcon, "日時の変更")}
            <div className="pt-[52px] flex justify-center">
              <div className="flex items-center">
                <label className="font-medium text-[20px] leading-[32px] w-[112px]">利用日時</label>
                <div className="w-[290px]">
                  <DatePickerField
                    name="bookingDate"
                    control={control}
                    defaultValue={null}
                    disabled={!booking.Ticket.canBookInAdvance}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        className="flex justify-between !border !border-solid rounded-[10px] h-[56px] font-light ad-input-field"
                        InputProps={{
                          ...params.InputProps,
                          className: `${params.className} !h-[56px]`,
                        }}
                        inputProps={{
                          ...params.inputProps,
                          className: `${params.className} !font-light`,
                          readOnly: true,
                        }}
                        fullWidth
                      />
                    )}
                    disablePast={true}
                    shouldDisableDate={(day: moment.Moment) => {
                      const ticketBookingSchedule = getTicketBookingSchedule(day.toISOString(), ticket, false);
                      if (!ticketBookingSchedule) {
                        return true;
                      }

                      const deadlineDate = moment().add(7, "days");
                      const isInNext7Days = isSameOrAfterDay(day, moment().toDate()) && isSameOrBeforeDay(day, deadlineDate);
                      if (!isInNext7Days) {
                        return true;
                      }

                      const onlineTicketVacancies = onlineTicketVacancy ? [...onlineTicketVacancy?.vacancies, todayOnlineOneDayTicketVacancy] : [];
                      const isFullDay = checkIsFullOrNotAvailableDay(day, booking.date, onlineTicketVacancies);
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
            <div className="flex flex-col items-center mt-[24px]">
              <p className="text-center font-light text-[16px] leading-[28px mb-[24px]">ご利用日前日の23:59まで変更可能です。</p>
              <div className="flex flex-row gap-[40px]">
                <Button variant="outlined" className="h-[56px] w-[200px] text-[20px]" type="button" onClick={redirectToBookingManagement}>
                  戻る
                </Button>
                <Button variant="contained" className="h-[56px] w-[200px] text-[20px]" type="button" onClick={handleSubmitUpdateBookingDate}>
                  変更
                </Button>
              </div>
              <Error message={errMsg} className="mt-4" />
            </div>
          </div>
        </form>
      )}

      {updateStep === FormStep.S2_REVIEW && (
        <AdminUpdateBookingReviewDialog
          totalAdult={adultQuantity}
          totalChild={childQuantity}
          totalAmount={totalAmount}
          originTotalAmount={Number(booking?.totalAmount)}
          transactionDate={transaction?.ProcessDate}
          transactionId={transaction?.TranID}
          isOpen={true}
          onClose={() => setUpdateStep(FormStep.S1_UPDATE)}
          onOk={() => {
            if (needToCharge) {
              setUpdateStep(FormStep.S3_PAYMENT);
            } else {
              setUpdateStep(FormStep.S4_CONFIRM);
            }
          }}
        />
      )}

      {updateStep === FormStep.S3_PAYMENT && (
        <AdminBookingCreditCardDialog
          transaction={transaction}
          userOwnerId={booking.userId}
          isOpen={true}
          onClose={() => setUpdateStep(FormStep.S2_REVIEW)}
          onOk={onPaymentChange}
        />
      )}

      {updateStep === FormStep.S20_REFUND_CONFIRM && (
        <AdminBookingConfirmDialog
          onAccept={() => setUpdateStep(FormStep.S2_REVIEW)}
          onDismiss={() => setUpdateStep(FormStep.S1_UPDATE)}
          dismissText="戻る"
          acceptText="次へ"
          message="変更内容に応じて、返金手続きへ進みます。"
        />
      )}

      {updateStep === FormStep.S4_CONFIRM && (
        <AdminBookingConfirmDialog
          onAccept={onUpdateConfirmed}
          onDismiss={() => setUpdateStep(FormStep.S1_UPDATE)}
          onBack={() => {
            setUpdateStep(FormStep.S1_UPDATE);
          }}
          dismissText="戻る"
          acceptText="次へ"
          message="変更を確定します"
          loading={loading}
        />
      )}

      {updateStep === FormStep.S5_COMPLETED && (
        <NotificationDialog
          hiddenCloseIcon={true}
          isOpen={true}
          width={856}
          message={
            <div className="text-center pt-[12px]">
              <p className="text-[32px] leading-[48px] font-medium mb-[32px]">予約の内容を変更しました</p>
              <p className="text-[16px] leading-[24px] font-light">
                変更内容が反映されているかマイページよりご確認ください。
                <br />
                またご利用の際は、初回予約時にお送りしたメールのバーコードを店頭でご提示ください。
                <br />
                引き続きボーネルンドのあそび場をお楽しみください。
              </p>
            </div>
          }
          okLabel="予約一覧へ"
          onClose={redirectToBookingManagement}
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
    </div>
  );
}

const renderHeader = (Icon: any, title: string, actions?: React.ReactNode) => {
  return (
    <div className="relative flex flex-row items-center justify-between gap-4 py-[20px] px-[16px] bar-bg-gray">
      <div className="flex items-center justify-center gap-x-5">
        <Image src={Icon} alt="PeopleIcon" />
        <span className="text-[24px] leading-[32px] font-medium text-blue-color">{title}</span>
      </div>
      {actions}
      <div className="absolute w-full left-0 bottom-0 border-b-2 border-dotted border-[#979797]"></div>
    </div>
  );
};
