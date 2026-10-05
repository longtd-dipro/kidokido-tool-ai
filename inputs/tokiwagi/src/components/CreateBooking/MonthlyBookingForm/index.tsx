/* eslint-disable react-hooks/exhaustive-deps */
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, TextField } from "@mui/material";
import { TicketType } from "@prisma/client";
import { cloneDeep, isNil } from "lodash";
import moment from "moment";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Script from "next/script";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import Error from "components/common/Error";
import AutocompleteField from "components/common/Fields/AutocompleteField";
import DatePickerField from "components/common/Fields/DatePickerField";
import RequiredLoginDialog from "components/common/RequiredLoginDialog";
import BookingConfirmation from "components/CreateBooking/BookingConfirmation";
import BookingQuantityPriceAndTotalAmountInfo from "components/CreateBooking/BookingQuantityPriceAndTotalAmountInfo";
import CreditCardForm from "components/CreateBooking/CreditCardForm";
import { PaymentOnlineBookingFormData } from "components/CreateBooking/PaymentOnlineBookingForm";
import { serverConfig } from "config";
import { JP_SHORT_DATE, SESSION_STATUS } from "constants/common";
import { ROUTE } from "constants/route";
import { monthlyBookingSchema } from "libs/validation/bookingSchema";
import { BookingPayload, BookingStep } from "models/Booking";
import { Booking, Tenant, Ticket } from "models/Entity";
import { AgeUnit } from "models/enums";
import { checkSameDateBookingExists, createBooking, fetchBookings } from "services/api-client/booking.service";
import { fetchTenants } from "services/api-client/tenant.service";
import { fetchSupportedTicketsByMasterTicketId, fetchTickets } from "services/api-client/ticket.service";
import { checkRequiredInformation, deleteCreditCard } from "services/api-client/user.service";
import { calculateDeadlineMonthlyTicket, generateDefaultChildAges, getMonthlyBookingTotalPrices } from "utils/booking";
import { validateBooking } from "utils/booking-validation";
import { getMessageFromError } from "utils/common";
import { isSameOrAfterDay, isSameOrBeforeDay } from "utils/date-time";
import { generateAgeOptions, getTicketBookingSchedule, getTicketById } from "utils/ticket";
import { sortTenantsByFirstCharacterThenCreatedAt } from "utils/tenant";
import { TRANSACTION_ERRORS } from "constants/booking";
import ExpiredCreditCardDialog from "components/common/ExpiredCreditCardDialog";
import { scrollToElementOnError } from "utils/ui";
import ConfirmationDialogUser from "components/User/ConfirmationDialogUser";
import SameDayBookingWarningDialog from "components/common/SameDayBookingWarningDialog";

import BookingCompletionMonthly from "../BookingCompletion/BookingCompletionMonthly";

const DEFAULT_VALUES = {
  adultQuantity: 1,
  childQuantity: 1,
  childAges: [{}],
  bookingDate: "",
};

export default function MonthlyBookingForm() {
  const router = useRouter();
  const { data: session, status: authenticationStatus } = useSession();
  const [errMsg, setErrMsg] = useState<string>();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [originalTickets, setOriginalTickets] = useState<Ticket[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [bookingStep, setBookingStep] = useState<BookingStep>(BookingStep.InputBooking);
  const [paymentInfo, setPaymentInfo] = useState<ReturnType<typeof getMonthlyBookingTotalPrices>>({
    totalAmount: 0,
    totalDiscount: 0,
    adultPrice: 0,
    childPrice: 0,
    adultPriceWithDiscount: 0,
    childPriceWithDiscount: 0,
  });
  const allowInactiveTenantCode = router.query?.allowInactiveTenantCode === "true";

  const [bookingPayload, setBookingPayload] = useState<BookingPayload>(null);
  const [isShowRequiredLoginDialog, setIsShowRequiredLoginDialog] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deadlineDate, setDeadlineDate] = useState<string | Date>("");
  const [haveExpiredCardError, setHaveExpiredCardError] = useState(false);
  const [isShowMultipleTenantsGuideDialog, setIsShowMultipleTenantsGuideDialog] = useState<boolean>(false);
  const [numberOfSupportedTenants, setNumberOfSupportedTenants] = useState<number>(0);
  const [isShowSameDayMonthlyBookingDialog, setIsShowSameDayMonthlyBookingDialog] = useState<boolean>(false);
  const [slaveTenants, setSlaveTenants] = useState<Tenant[]>([]);
  const {
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PaymentOnlineBookingFormData>({
    resolver: yupResolver(monthlyBookingSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { fields, replace, append, remove } = useFieldArray({
    control,
    name: "childAges",
  });

  const [tenantCode, ticketId, childQuantity, adultQuantity, childAges, bookingDate] = watch([
    "tenantCode",
    "ticketId",
    "childQuantity",
    "adultQuantity",
    "childAges",
    "bookingDate",
  ]);

  useEffect(() => {
    if (authenticationStatus === SESSION_STATUS.UNAUTHENTICATED) {
      setIsShowRequiredLoginDialog(true);
    }
  }, [authenticationStatus]);

  useEffect(() => {
    fetchData();
    fetchDataCheckRequiredInformation();
  }, [allowInactiveTenantCode]);

  useEffect(() => {
    if (tenantCode) {
      if (authenticationStatus === SESSION_STATUS.UNAUTHENTICATED) {
        setIsShowRequiredLoginDialog(true);
        setValue("tenantCode", null);
        return;
      }

      const filteredTickets = originalTickets.filter((ticket) => {
        const { startSaleAt, endSaleAt } = ticket.TicketDetail;
        const today = moment(new Date()).toDate();
        const isInOnlineBookingDate = (startSaleAt ? isSameOrAfterDay(today, startSaleAt) : true) && (endSaleAt ? isSameOrBeforeDay(today, endSaleAt) : true);

        return ticket.tenantCode === tenantCode && isInOnlineBookingDate;
      });
      setTickets(filteredTickets);
    }
  }, [tenantCode]);

  useEffect(() => {
    if (ticketId) {
      setValue("adultQuantity", DEFAULT_VALUES.adultQuantity);
      setValue("childQuantity", DEFAULT_VALUES.childQuantity);
      setValue("childAges", DEFAULT_VALUES.childAges as any);

      setValue("bookingDate", null);
      setDeadlineDate("");

      const ticket = getTicketById(ticketId, tickets);
      setSlaveTenants(ticket && ticket?.slaveTenants ? ticket.slaveTenants : []);
    }
  }, [ticketId]);

  useEffect(() => {
    if (isNil(childQuantity)) {
      return;
    }

    const defaultChildAges = generateDefaultChildAges(childQuantity ?? 0, childAges);

    replace(defaultChildAges);
  }, [childQuantity]);

  useEffect(() => {
    if (bookingDate) {
      if (ticket) {
        const deadlineDate = moment(calculateDeadlineMonthlyTicket(bookingDate, ticket)).format(JP_SHORT_DATE + " dddd");
        setDeadlineDate(deadlineDate);
      }
    }
  }, [bookingDate]);

  useEffect(() => {
    if (ticketId) {
      const ticket = getTicketById(ticketId, tickets);
      const paymentInfo = getMonthlyBookingTotalPrices(adultQuantity, childQuantity, ticket);

      setPaymentInfo(paymentInfo);
    }
  }, [ticketId, childQuantity, adultQuantity]);

  const fetchData = async () => {
    try {
      setErrMsg("");

      const [tenants, monthlyTickets] = await Promise.all([
        fetchTenants({ allowInactiveTenantCode }),
        fetchTickets({
          ticketTypes: [TicketType.Monthly],
          hasBookingSchedule: true,
          hasSlaveTenants: true
        }),
      ]);

      setTenants(sortTenantsByFirstCharacterThenCreatedAt(tenants));
      setOriginalTickets(monthlyTickets);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const fetchBookingsData = async (bookingTicketId: number, bookingDate: string): Promise<Booking[]> => {
    try {
      setErrMsg("");
      const bookings = await fetchBookings({ ticketId: bookingTicketId, date: bookingDate });
      return bookings;
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const fetchDataCheckRequiredInformation = async () => {
    try {
      const result = await checkRequiredInformation();
      if (!result) {
        router.push({ pathname: ROUTE.USER_EDIT_ACCOUNT, query: { line_signup: true } });
        return;
      }
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const prepareBookingPayloadToSubmit = (bookingFormData: PaymentOnlineBookingFormData, ticket: Ticket): BookingPayload => {
    const clonedBookingFormData = cloneDeep(bookingFormData);
    const { bookingDate, childAges, ...bookingPayload } = clonedBookingFormData;

    const transformedChildAges = childAges?.map(({ age, unit }) => (unit === AgeUnit.Year ? age * 12 : age)) ?? [];
    const date = moment(bookingDate).utc(true).toISOString();
    const adultPrice = +ticket.TicketDetail.adultPrice;
    const childPrice = +ticket.TicketDetail.childPrice;
    const { totalAmount } = getMonthlyBookingTotalPrices(bookingFormData.adultQuantity, bookingFormData.childQuantity, ticket);

    return { ...bookingPayload, date, childAges: transformedChildAges, adultPrice, childPrice, totalAmount };
  };

  const onSubmit = async (data: PaymentOnlineBookingFormData) => {
    try {
      setErrMsg("");

      const ticket = getTicketById(ticketId, tickets);
      const bookingScheduleInfo = getTicketBookingSchedule(moment().toString(), ticket);

      const bookingPayload = prepareBookingPayloadToSubmit(data, getTicketById(ticketId, tickets));

      const sameDayBookings = await fetchBookingsData(bookingScheduleInfo.ticketId, bookingPayload.date);

      const { isValid, message } = validateBooking({
        userId: session.user.id,
        bookingPayload,
        tickets,
        tenants,
        ticketBookingSchedule: bookingScheduleInfo,
        sameDayBookings,
      });

      if (!isValid) {
        setErrMsg(message);
        return;
      }

      setBookingPayload(bookingPayload);

      const numberOfSupportTenants = await getNumberOfSupportedTenants(ticket);
      if (numberOfSupportTenants > 0) {
        setNumberOfSupportedTenants(numberOfSupportTenants);
        showMultipleTenantsGuideDialog();
      } else {
        setBookingStep(BookingStep.InputCreditCard);
      }
    } catch (err) {
      const message = getMessageFromError(err);
      setErrMsg(message);
    }
  };

  const getNumberOfSupportedTenants = async (ticket: Ticket) => {
    let numberOfSupportTenants = 0;
    if (ticket.masterTicketId) {
      const supportedTickets = await fetchSupportedTicketsByMasterTicketId(ticket.masterTicketId, {
        visibility: true,
        hasBookingSchedule: true
      });
      numberOfSupportTenants = supportedTickets.length;
    }

    return numberOfSupportTenants;
  };

  const handleSaveUserCreditCard = (cardSeq: string, rememberCard = true) => {
    setBookingPayload({ ...bookingPayload, cardSeq, rememberCard });
    setBookingStep(BookingStep.Confirmation);
  };

  const handleBack = () => {
    setBookingStep(BookingStep.InputBooking);
  };

  const handleBackToInputCreditCard = () => {
    setErrMsg("");
    haveExpiredCardError && hideExpiredCardDialog();
    setBookingStep(BookingStep.InputCreditCard);
  };

  const handleConfirmBooking = async () => {
    const isSameDayMonthlyBooking = await checkSameDateBookingExists({
      ticketId: bookingPayload.ticketId,
      date: bookingPayload.date,
    });
    if (isSameDayMonthlyBooking) {
      setIsShowSameDayMonthlyBookingDialog(true);
    } else {
      await handleBookMonthlyTicket();
    }
  };

  const handleBookMonthlyTicket = async () => {
    try {
      setIsShowSameDayMonthlyBookingDialog(false);
      setIsSubmitting(true);
      setErrMsg("");
      const { rememberCard, ...payload } = bookingPayload;
      const resp = await createBooking(payload);
      if (!rememberCard) {
        await deleteCreditCard(payload.cardSeq);
      }
      if (resp.data?.RedirectUrl) {
        await router.push(`${resp.data.RedirectUrl}&t=${resp.data.t}`);
      } else {
        setBookingStep(BookingStep.Completion);
      }
    } catch (err) {
      const message = getMessageFromError(err);
      if (message === TRANSACTION_ERRORS["42G830000"]) {
        setHaveExpiredCardError(true);
      }
      setErrMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hideExpiredCardDialog = () => {
    setHaveExpiredCardError(false);
  };

  const showMultipleTenantsGuideDialog = () => {
    setIsShowMultipleTenantsGuideDialog(true);
  };

  const hideMultipleTenantsGuideDialog = () => {
    setIsShowMultipleTenantsGuideDialog(false);
  };

  const continueToProcessPayment = () => {
    hideMultipleTenantsGuideDialog();
    setBookingStep(BookingStep.InputCreditCard);
  };

  const ticket = getTicketById(ticketId, tickets);
  const ticketUseInDays = ticket?.TicketDetail.totalDaysInUseFromStart;

  return (
    <div className="md:px-5 mx-auto">
      <ExpiredCreditCardDialog isOpen={haveExpiredCardError} onClose={hideExpiredCardDialog} onBack={handleBackToInputCreditCard} />
      {bookingStep === BookingStep.InputBooking && (
        <form onSubmit={handleSubmit(onSubmit, scrollToElementOnError)}>
          <h2 className="usr-title-line mx-auto xs:!text-[28px] mb-[64px] xs:mb-9">フリーパス購入</h2>
          {/*Choose tenant*/}
          <div className={STYLES.INPUT_CARD}>
            <div className="flex xs:flex-col">
              <label className={STYLES.INPUT_LABEL}>ご利用店舗</label>
              <div className="grow">
                <AutocompleteField
                  name="tenantCode"
                  defaultValue={null}
                  control={control}
                  options={tenants.map((tenant) => tenant.code)}
                  getOptionLabel={(tenantCode) => tenants.find((t) => t.code === tenantCode)?.name || tenantCode}
                  isOptionEqualToValue={(option, value) => option === value}
                  className="usr-input-field h-[56px] w-full flex justify-center items-center"
                  renderInput={(params) => <TextField {...params} inputProps={{ ...params.inputProps, readOnly: true }} />}
                  onChange={(_, value) => {
                    reset({ ticketId: null });
                    setValue("tenantCode", value);
                  }}
                />
                {errors.tenantCode && <Error message={errors.tenantCode.message} className="mt-3" />}
              </div>
            </div>
          </div>

          {tenantCode && (
            <div className={STYLES.INPUT_CARD}>
              <div className="flex xs:flex-col">
                <label className={STYLES.INPUT_LABEL}>商品選択</label>
                <div className="grow">
                  <AutocompleteField
                    name="ticketId"
                    defaultValue={null}
                    control={control}
                    options={tickets.map((tenant) => tenant.id)}
                    getOptionLabel={(ticketId) => tickets.find((t) => t.id === ticketId)?.name || ticketId}
                    isOptionEqualToValue={(option, value) => option === value}
                    className="usr-input-field h-[56px] w-full xs:flex xs:justify-center xs:items-center"
                    renderInput={(params) => <TextField {...params} disabled inputProps={{ ...params.inputProps, readOnly: true }} />}
                    disabled={!tenantCode}
                  />
                  {errors.ticketId && <Error message={errors.ticketId.message} className="mt-3" />}
                </div>
              </div>
              {Boolean(ticketId && slaveTenants?.length) && (
                <div className="flex xs:flex-col">
                  <label className={STYLES.INPUT_LABEL}></label>
                  <p
                    className="mt-[8px] text-[14px] leading-[16px] font-medium
                  md:font-light md:text-xs md:justify-items-end md:float-right md:max-w-[422px] xs:text-sm "
                  >
                    この商品が使える店舗：{slaveTenants.map((t) => t.name).join("、")}
                  </p>
                </div>
              )}
            </div>
          )}

          {ticketId && (
            <>
              <div className={STYLES.INPUT_CARD}>
                <div className="flex xs:flex-col">
                  <label className={STYLES.INPUT_LABEL}>利用スタート希望日</label>
                  <div className="grow">
                    <DatePickerField
                      name="bookingDate"
                      control={control}
                      defaultValue={null}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          className="flex justify-between usr-input-field h-[56px]"
                          fullWidth
                          inputProps={{
                            ...params.inputProps,
                            readOnly: true,
                          }}
                        />
                      )}
                      disablePast={true}
                      shouldDisableDate={(day: moment.Moment) => {
                        const ticket = getTicketById(ticketId, tickets);
                        const ticketBookingSchedule = getTicketBookingSchedule(day.toISOString(), ticket, false);
                        if (!ticketBookingSchedule) {
                          return true;
                        }
                        return false;
                      }}
                    />
                    {errors.bookingDate && <Error message={errors.bookingDate.message} className="mt-3" />}
                  </div>
                </div>
              </div>
              <div>
                <div className="flex xs:flex-col">
                  <label className={STYLES.INPUT_LABEL}>終了予定日</label>
                  <div className="grow">
                    <TextField name="deadlineDate" className="usr-input-field w-full h-[56px]" value={deadlineDate} disabled={true} />
                    {errors.bookingDate && <Error message={errors.bookingDate.message} className="mt-3" />}
                  </div>
                </div>
                {ticketId && (
                  <p
                    className="mt-[8px] text-[14px] leading-[16px] font-medium
                  md:font-light md:text-xs md:justify-items-end md:float-right md:max-w-[422px] xs:text-sm "
                  >
                    ※選択された希望日から{ticketUseInDays}日間ご利用可能となります。購入日と利用日は異なりますのでご注意ください。
                  </p>
                )}
              </div>

              <div className="mt-[64px] xs:mt-20">
                <BookingQuantityPriceAndTotalAmountInfo
                  control={control}
                  fields={fields}
                  remove={remove}
                  append={append}
                  errors={errors}
                  setValue={setValue}
                  adultQuantity={adultQuantity}
                  childQuantity={childQuantity}
                  ticketDetail={getTicketById(ticketId, tickets).TicketDetail}
                  totalAmount={paymentInfo.totalAmount}
                  totalDiscount={paymentInfo.totalDiscount}
                  bookingScheduleInfo={getTicketBookingSchedule(moment().toString(), getTicketById(ticketId, tickets))}
                  ageOptions={generateAgeOptions(getTicketById(ticketId, tickets))}
                  maxChildPerAdult={getTicketById(ticketId, tickets).maxChildPerAdult ?? 1}
                  ticketType={TicketType.Monthly}
                  minAdultQuantity={1}
                  minChildQuantity={1}
                  headerText="購入内容"
                  headerDescription="必要枚数を子どもの人数でご入力ください。"
                  shouldHideAdultQuantity={true}
                  showMonthlyChildAgeHintMessage={true}
                />
              </div>

              {/*Buttons*/}
              <div className="flex justify-center mt-[64px] mb-5 xs:mb-3 md:mb-4 md:mt-12">
                <Button type="submit" variant="contained" className="max-w-[403px] w-full h-[64px] xs:max-w-[290px] xs:h-[48px]" disabled={!tenantCode}>
                  <span className="xs:text-lg md:text-lg font-bold text-xl ">支払いへ進む</span>
                </Button>
              </div>

              {Object.keys(errors).length !== 0 ? (
                <Error className="text-center" message={"ご入力いただいた項目に不備があります。再度ご確認とご入力の上で次に進んでください。"} />
              ) : null}
            </>
          )}
        </form>
      )}

      {/*Show guide dialog for multiple tenants*/}
      {ticket && isShowMultipleTenantsGuideDialog &&
        <ConfirmationDialogUser
          onAccept={continueToProcessPayment}
          onDismiss={hideMultipleTenantsGuideDialog}
          acceptText="支払いへ進む"
          message={`${ticket.name}は、全国${numberOfSupportedTenants}カ所
          にあるボーネルンドのあそび場でご利用いただけますが、初回利用時のみ、購入の際に登録された店舗でのご利用をお願いします。`}
          mobileButtonWidth={200}
          mobileTextSize={14}
        />
      }

      {bookingStep === BookingStep.InputCreditCard && (
        <div>
          <h2 className="usr-title-line mx-auto xs:!text-[28px] mb-[64px] xs:mb-9">フリーパス購入</h2>
          <CreditCardForm onSave={handleSaveUserCreditCard} onBack={handleBack} />
        </div>
      )}

      {bookingStep === BookingStep.Confirmation && (
        <div>
          <h2 className="usr-title-line mx-auto xs:!text-[28px] mb-[64px]">ご購入内容</h2>
          <BookingConfirmation
            ticketType={TicketType.Monthly}
            bookingPayload={bookingPayload}
            tenants={tenants}
            tickets={tickets}
            onBack={handleBackToInputCreditCard}
            onConfirm={handleConfirmBooking}
            totalAdultPrice={paymentInfo.adultPriceWithDiscount}
            totalChildPrice={paymentInfo.childPriceWithDiscount}
            isSubmitting={isSubmitting}
            shouldRenderChildFirst={true}
          />
        </div>
      )}

      {bookingStep === BookingStep.Completion && <BookingCompletionMonthly tenantCode={tenantCode} />}

      {isShowRequiredLoginDialog && <RequiredLoginDialog onDismiss={() => setIsShowRequiredLoginDialog(false)} />}

      {isShowSameDayMonthlyBookingDialog &&
        <SameDayBookingWarningDialog
          text="はい"
          dismissText="いいえ"
          message={"有効期限内のパスがありますが、購入しますか？"}
          onAccept={handleBookMonthlyTicket}
          onDismiss={() => setIsShowSameDayMonthlyBookingDialog(false)}
        />
      }

      {/* Error */}
      <Error message={errMsg} className="text-[14px] mt-4 text-center" />

      <Script src={serverConfig.gmo.token_url}></Script>
    </div>
  );
}

const STYLES = {
  INPUT_CARD: "relative mb-[32px]",
  INPUT_LABEL: "text-[20px] leading-[32px] font-medium min-w-[288px] flex leading-[56px] xs:text-base xs:mb-2",
};
