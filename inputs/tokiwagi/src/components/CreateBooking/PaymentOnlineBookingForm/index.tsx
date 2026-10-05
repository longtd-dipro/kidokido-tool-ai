import { yupResolver } from "@hookform/resolvers/yup";
import { PaymentType, TicketBookingSchedule, TicketType } from "@prisma/client";
import { cloneDeep } from "lodash";
import moment from "moment";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";

import BookingVacancies from "components/BookingVacancies";
import Button from "components/common/Buttons/Button";
import Error from "components/common/Error";
import ErrorDialog from "components/common/ErrorDialog";
import SpecialSelectField from "components/common/Fields/SpecialSelectField";
import RequiredLoginDialog from "components/common/RequiredLoginDialog";
import Spinner from "components/common/Spinner";
import BookingCompletion from "components/CreateBooking/BookingCompletion";
import BookingConfirmation from "components/CreateBooking/BookingConfirmation";
import BookingQuantityPriceAndTotalAmountInfo from "components/CreateBooking/BookingQuantityPriceAndTotalAmountInfo";
import CreditCardForm from "components/CreateBooking/CreditCardForm";
import DisclaimerTermsCheckboxDialog from "components/CreateBooking/DisclaimerTermsCheckboxDialog";
import GuideVideoDialog from "components/CreateBooking/GuideVideoDialog";
import {
  BOOKING_VALIDATION_ERROR_MESSAGES,
  TRANSACTION_ERRORS,
} from "constants/booking";
import { JP_SHORT_DATE, SHORT_DATE } from "constants/common";
import { ROUTE } from "constants/route";
import { paymentOnlineBookingSchema } from "libs/validation/bookingSchema";
import { BookingPayload, BookingStep, ChildAgeItem } from "models/Booking";
import { Booking, Disclaimer, Tenant, Ticket } from "models/Entity";
import { AgeUnit } from "models/enums";
import {
  checkSameDateBookingExists,
  createBooking,
  fetchBookings,
} from "services/api-client/booking.service";
import { fetchTenants } from "services/api-client/tenant.service";
import { fetchTickets } from "services/api-client/ticket.service";
import {
  checkRequiredInformation,
  deleteCreditCard,
} from "services/api-client/user.service";
import {
  NotificationType,
  showNotification,
} from "stores/reducers/notification";
import { validateBooking } from "utils/booking-validation";
import {
  getTenantOptions,
  sortTenantsByFirstCharacterThenCreatedAt,
} from "utils/tenant";
import {
  generateAgeOptions,
  getTicketBookingSchedule,
  getTicketById,
} from "utils/ticket";
import { fetchDisclaimers } from "services/api-client/disclaimer.service";
import { OnlineTicketVacancy } from "models/Vacancy";
import { calculateDiscountByQuantity } from "utils/discount";
import { DiscountInfo } from "models/Discount";
import ExpiredCreditCardDialog from "components/common/ExpiredCreditCardDialog";
import { scrollToElementOnError } from "utils/ui";
import SameDayBookingWarningDialog from "components/common/SameDayBookingWarningDialog";

export type PaymentOnlineBookingFormData = {
  tenantCode: string;
  ticketId: number;

  adultQuantity: number;
  childQuantity: number;

  childAges: ChildAgeItem[] | number[] | any;
  bookingDate: string;
  subEmail: string;

  limitTimes?: number;
  extraTimes?: number;
};

const DEFAULT_VALUES = {
  adultQuantity: 1,
  childQuantity: 1,

  bookingDate: "",
};

type Props = {
  tenantCode?: string;
  bookingDate?: string;
  ticketId?: number;
  allowInactiveTenantCode: boolean;
  bookingDays?: number;
};

export default function PaymentOnlineBookingForm({
  tenantCode: defaultTenantCode,
  bookingDate: defaultBookingDate,
  ticketId: defaultTicketId,
  allowInactiveTenantCode = false,
  bookingDays,
}: Props) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: session } = useSession();
  const [errMsg, setErrMsg] = useState<string>();
  const [popupErrMsg, setPopupErrMsg] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isShowErrorDialog, setIsShowErrorDialog] = useState<boolean>(false);
  const [isShowRequiredLoginDialog, setIsShowRequiredLoginDialog] =
    useState<boolean>(false);
  const [isShowGuideVideoDialog, setIsShowGuideVideoDialog] =
    useState<boolean>(false);
  const [isShowSameDayMonthlyBookingDialog, setIsShowSameDayMonthlyBookingDialog] = useState<boolean>(false);
  const [
    isShowDisclaimerTermsCheckboxDialog,
    setIsShowDisclaimerTermsCheckboxDialog,
  ] = useState<boolean>(false);
  const [bookingStep, setBookingStep] = useState<BookingStep>(
    BookingStep.InputBooking
  );
  const [haveExpiredCardError, setHaveExpiredCardError] = useState(false);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [bookingScheduleInfo, setBookingScheduleInfo] =
    useState<TicketBookingSchedule>(null);
  const [bookingPayload, setBookingPayload] = useState<BookingPayload>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [totalDiscount, setTotalDiscount] = useState<number>(0);
  const [discountInfo, setDiscountInfo] = useState<DiscountInfo>();
  const [isDisableTenantSelect, setIsDisableTenantSelect] =
    useState<boolean>(false);
  const [disclaimers, setDisclaimers] = useState<Disclaimer[]>(null);

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PaymentOnlineBookingFormData>({
    resolver: yupResolver(paymentOnlineBookingSchema),
    defaultValues: {
      ...DEFAULT_VALUES,
      tenantCode: defaultTenantCode || "",
      bookingDate: defaultBookingDate,
      ticketId: defaultTicketId ?? undefined,
    },
  });

  const { fields, remove, append } = useFieldArray({
    control,
    name: "childAges",
  });

  const [tenantCode, ticketId, childQuantity, adultQuantity, bookingDate] =
    watch([
      "tenantCode",
      "ticketId",
      "childQuantity",
      "adultQuantity",
      "bookingDate",
    ]);

  useEffect(() => {
    fetchData();
    fetchDataCheckRequiredInformation();
  }, [allowInactiveTenantCode]);

  useEffect(() => {
    tenantCode && fetchTicketsData();
  }, [tenantCode]);

  useEffect(() => {
    if (bookingScheduleInfo) {
      const { baseAdultPeriodPrice, baseChildPeriodPrice } =
        bookingScheduleInfo;
      const adultAmount = adultQuantity * +baseAdultPeriodPrice;
      const childAmount = childQuantity * +baseChildPeriodPrice;
      const totalAmount = adultAmount + childAmount;
      const ticket = getTicketById(ticketId, tickets);
      const discount = calculateDiscountByQuantity(
        adultQuantity,
        childQuantity,
        ticket,
        bookingDate
      );
      setTotalDiscount(discount.total);
      setDiscountInfo(discount);
      setTotalAmount(Math.max(0, totalAmount - discount.total));
    }
  }, [childQuantity, adultQuantity]);

  useEffect(() => {
    if (tickets.length && ticketId && bookingDate) {
      const ticket = getTicketById(ticketId, tickets);
      const bookingScheduleInfo = getTicketBookingSchedule(bookingDate, ticket);
      const defaultTotalAmount =
        +bookingScheduleInfo.baseAdultPeriodPrice +
        +bookingScheduleInfo.baseChildPeriodPrice;
      setBookingScheduleInfo(bookingScheduleInfo);

      const discount = calculateDiscountByQuantity(
        adultQuantity,
        childQuantity,
        ticket,
        bookingDate
      );
      setTotalDiscount(discount.total);
      setDiscountInfo(discount);
      setTotalAmount(Math.max(0, defaultTotalAmount - discount.total));
    }
  }, [tickets, ticketId, bookingDate]);

  useEffect(() => {
    if (defaultBookingDate) {
      if (!session) {
        setIsShowRequiredLoginDialog(true);
        reset();
        return;
      }

      remove();
      setValue("adultQuantity", 1);
      setValue("childQuantity", 1);
      append({ age: "", unit: "" });
    }
  }, [defaultBookingDate]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrMsg("");

      const [tenants, disclaimers] = await Promise.all([
        fetchTenants({ allowInactiveTenantCode }),
        fetchDisclaimers(),
      ]);

      setTenants(sortTenantsByFirstCharacterThenCreatedAt(tenants));
      setDisclaimers(disclaimers);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTicketsData = async () => {
    try {
      setErrMsg("");
      const tickets = await fetchTickets({
        tenantCode,
        canBookInAdvance: true,
        paymentType: PaymentType.Online,
        ticketTypes: [TicketType.Daily],
      });
      setTickets(tickets);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const fetchBookingsData = async (bookingTicketId: number, bookingDate: string): Promise<Booking[]> => {
    try {
      setErrMsg("");
      const bookings = await fetchBookings({
        ticketId: bookingTicketId,
        date: bookingDate,
      });
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
        router.push({
          pathname: ROUTE.USER_EDIT_ACCOUNT,
          query: { line_signup: true },
        });
        return;
      }
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const prepareBookingPayloadToSubmit = (
    bookingFormData: PaymentOnlineBookingFormData,
    bookingScheduleInfo: TicketBookingSchedule
  ): BookingPayload => {
    const clonedBookingFormData = cloneDeep(bookingFormData);
    const { bookingDate, childAges, ...bookingPayload } = clonedBookingFormData;

    const transformedChildAges = childAges.map(({ age, unit }) =>
      unit === AgeUnit.Year ? age * 12 : age
    );
    const date = moment(bookingDate).utc(true).toISOString();
    const adultPrice = +bookingScheduleInfo.baseAdultPeriodPrice;
    const childPrice = +bookingScheduleInfo.baseChildPeriodPrice;

    return {
      ...bookingPayload,
      date,
      childAges: transformedChildAges,
      adultPrice,
      childPrice,
      totalAmount,
    };
  };

  const onSubmit = async (data: PaymentOnlineBookingFormData) => {
    try {
      setErrMsg("");

      if (!bookingScheduleInfo) {
        dispatch(
          showNotification({
            type: NotificationType.ERROR,
            message: BOOKING_VALIDATION_ERROR_MESSAGES.INVALID_BOOKING_DATE,
          })
        );
        return;
      }

      const bookingPayload = prepareBookingPayloadToSubmit(
        data,
        bookingScheduleInfo
      );

      const sameDayBookings = await fetchBookingsData(bookingScheduleInfo.ticketId, bookingPayload.date);

      const { isValid, message } = validateBooking({
        userId: session.user.id,
        bookingPayload,
        tickets,
        ticketBookingSchedule: bookingScheduleInfo,
        sameDayBookings,
      });

      if (!isValid) {
        setIsShowErrorDialog(true);
        setPopupErrMsg(message);
        return;
      }

      setBookingPayload(bookingPayload);
      handleShowGuideVideo();
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const handleShowGuideVideo = () => {
    // TODO: temporarily skip show guide video dialog and go to next step
    // setIsShowGuideVideoDialog(true);
    handleShowDisclaimerTermsCheckbox();
  };

  const handleSubmitAgreementTerms = () => {
    setIsShowDisclaimerTermsCheckboxDialog(false);
    setBookingStep(BookingStep.InputCreditCard);
  };

  const handleDismissTermsDialog = () => {
    setIsShowDisclaimerTermsCheckboxDialog(false);
  };

  const handleBookingTicketAndDate = (vacancy: OnlineTicketVacancy) => {
    const { ticketId, date } = vacancy;
    if (!session) {
      setIsShowRequiredLoginDialog(true);
      return;
    }

    setValue("ticketId", ticketId, { shouldValidate: true });
    setValue("bookingDate", moment(date).format(SHORT_DATE), {
      shouldValidate: true,
    });

    remove();
    const ticket = tickets.find((ticket) => ticket.id === ticketId);
    if (ticket?.maxChildPerAdult === 0) {
      setValue("adultQuantity", 1);
      setValue("childQuantity", 0);
    } else {
      setValue("adultQuantity", 1);
      setValue("childQuantity", 1);
      append({ age: "", unit: "" });
    }
  };

  const handleSaveUserCreditCard = async (
    cardSeq: string,
    rememberCard = true
  ) => {
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

  const handleShowDisclaimerTermsCheckbox = () => {
    if (getTicketById(ticketId, tickets).TicketDetail.requiredAgreement) {
      setIsShowDisclaimerTermsCheckboxDialog(true);
    } else {
      setBookingStep(BookingStep.InputCreditCard);
    }
  };

  const handleConfirmBooking = async () => {
    const isSameDayMonthlyBooking = await checkSameDateBookingExists({
      ticketId: bookingPayload.ticketId,
      date: bookingPayload.date,
    });
    if (isSameDayMonthlyBooking) {
      setIsShowSameDayMonthlyBookingDialog(true);
    } else {
      await handleBookOnlineTicket();
    }
  };

  const handleBookOnlineTicket = async () => {
    try {
      setIsShowSameDayMonthlyBookingDialog(false);
      setIsSubmitting(true);
      setErrMsg("");
      const { rememberCard, ...payload } = bookingPayload;
      const resp = await createBooking({ ...payload, bookingDays });
      if (!rememberCard) {
        await deleteCreditCard(payload.cardSeq);
      }
      if (resp.data?.RedirectUrl) {
        await router.push(`${resp.data.RedirectUrl}&t=${resp.data.t}`);
      } else {
        setBookingStep(BookingStep.Completion);
      }
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      if (message === TRANSACTION_ERRORS["42G830000"]) {
        setHaveExpiredCardError(true);
      }
      setErrMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hideErrorDialog = () => {
    setIsShowErrorDialog(false);
  };

  const disableTenantSelect = () => {
    setIsDisableTenantSelect(true);
  };

  const enableTenantSelect = () => {
    setIsDisableTenantSelect(false);
  };

  const handleChangeTenant = () => {
    setValue("ticketId", undefined);
    setValue("bookingDate", "");
    disableTenantSelect();
  };

  const hideExpiredCardDialog = () => {
    setHaveExpiredCardError(false);
  };

  return (
    <div className="flex flex-col w-[824px] xs:w-full mx-auto md:w-full">
      <ExpiredCreditCardDialog
        isOpen={haveExpiredCardError}
        onClose={hideExpiredCardDialog}
        onBack={handleBackToInputCreditCard}
      />
      {isLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      {bookingStep === BookingStep.InputBooking && !isLoading && (
        <form
          onSubmit={handleSubmit(onSubmit, scrollToElementOnError)}
          className="flex flex-col justify-center w-full"
        >
          {/*MOBILE*/}
          <div className="xsup:hidden">
            <h2 className="usr-title-line mx-auto xs:!text-[28px] mb-8">
              事前予約
            </h2>
          </div>

          {/*Choose tenant*/}
          <div className="mb-10">
            <SpecialSelectField
              labelId="choose-tenant-label"
              name="tenantCode"
              control={control}
              options={getTenantOptions(tenants)}
              className="flex-1 block"
              currentValue={tenantCode}
              disabled={isDisableTenantSelect}
              handleChange={handleChangeTenant}
            />
            {errors.tenantCode && <Error message={errors.tenantCode.message} />}
          </div>

          {!isLoading && tenantCode && (
            <>
              <h2 className="my-4 text-2xl font-bold text-center text-blue-color">
                販売状況
              </h2>

              <div className="mt-2">
                <BookingVacancies
                  showErrorWhenFullVacancy={false}
                  showErrorWhenNotAvailableVacancy={false}
                  tenantCode={tenantCode}
                  onBook={handleBookingTicketAndDate}
                  chosen={{ date: bookingDate, ticketId }}
                  onLoaded={enableTenantSelect}
                  bookingDays={bookingDays}
                />
                {(errors.bookingDate || errors.ticketId) && (
                  <Error
                    message={
                      errors.bookingDate?.message || errors.ticketId?.message
                    }
                    className="text-center mt-4"
                  />
                )}
              </div>

              <div className="mt-8 xs:mt-4">
                {ticketId ? (
                  <div className="px-12 py-4 mt-8 mb-16 bar-bg-gray xs:px-2 xs:mb-8">
                    <div className="flex mb-2 items-center">
                      <p className="w-1/3 text-2xl font-medium xs:text-base md:text-xl xs:w-[110px]">
                        商品選択
                      </p>
                      <p className="xs:text-sm font-light xs:w-[200px] break-all">
                        {getTicketById(ticketId, tickets)?.name}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <p className="w-1/3 text-2xl font-medium xs:text-base md:text-xl xs:w-[110px]">
                        日時選択
                      </p>
                      <div className="flex gap-4 text-base font-light xs:text-sm xs:w-[200px] break-all">
                        <p>
                          {moment(bookingDate).format(JP_SHORT_DATE)}{" "}
                          {moment(bookingDate).format("dddd")}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {bookingScheduleInfo && ticketId ? (
                  <BookingQuantityPriceAndTotalAmountInfo
                    control={control}
                    fields={fields}
                    errors={errors}
                    append={append}
                    remove={remove}
                    setValue={setValue}
                    adultQuantity={adultQuantity}
                    childQuantity={childQuantity}
                    bookingScheduleInfo={bookingScheduleInfo}
                    totalAmount={totalAmount}
                    totalDiscount={totalDiscount}
                    discountInfo={discountInfo}
                    ageOptions={generateAgeOptions(
                      getTicketById(ticketId, tickets)
                    )}
                    maxChildPerAdult={
                      getTicketById(ticketId, tickets).maxChildPerAdult
                    }
                    minAdultQuantity={1}
                    minChildQuantity={1}
                  />
                ) : null}

                <div className="flex flex-col justify-center mt-16 xs:mt-8">
                  {/*Buttons*/}
                  <div className="mx-auto mt-4">
                    <Button
                      type="submit"
                      variant="contained"
                      className="!min-w-[403px] h-[64px] xs:!min-w-[290px] xs:h-[48px] md:h-[48px] md:!min-w-[290px] md:!text-lg"
                      fullWidth
                    >
                      次へ
                    </Button>
                  </div>
                </div>

                {Object.keys(errors).length !== 0 ? (
                  <Error
                    className="mt-4 text-center"
                    message={
                      "ご入力いただいた項目に不備があります。再度ご確認とご入力の上で次に進んでください。"
                    }
                  />
                ) : null}
              </div>
            </>
          )}
        </form>
      )}

      {bookingStep === BookingStep.InputCreditCard && (
        <CreditCardForm onSave={handleSaveUserCreditCard} onBack={handleBack} />
      )}

      {bookingStep === BookingStep.Confirmation && (
        <div>
          <h2 className="mx-auto usr-title-line mb-16 xs:mb-9">予約内容確認</h2>
          <BookingConfirmation
            bookingPayload={bookingPayload}
            tenants={tenants}
            tickets={tickets}
            onBack={handleBackToInputCreditCard}
            onConfirm={handleConfirmBooking}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {bookingStep === BookingStep.Completion && (
        <BookingCompletion
          redirectUrl={ROUTE.USER_HISTORY_BOOKINGS}
          heading="購入/予約完了"
          title="ご登録のメールアドレスにご予約内容のメールをお送りしました。"
          content="当日、店頭にてメールに記載のあるバーコードをご提示ください。当日のご来場お待ちしております。"
        />
      )}

      {isShowGuideVideoDialog && (
        <GuideVideoDialog
          videoUrl={getTicketById(ticketId, tickets).videoUrl}
          onDismiss={() => setIsShowGuideVideoDialog(false)}
          onNext={() => {
            setIsShowGuideVideoDialog(false);
            handleShowDisclaimerTermsCheckbox();
          }}
        />
      )}

      {isShowDisclaimerTermsCheckboxDialog && (
        <DisclaimerTermsCheckboxDialog
          defaultDisclaimers={disclaimers}
          onAccept={handleSubmitAgreementTerms}
          onDismiss={handleDismissTermsDialog}
        />
      )}

      {isShowSameDayMonthlyBookingDialog &&
        <SameDayBookingWarningDialog
          text="はい"
          dismissText="いいえ"
          message={"同じ内容の商品を購入済みですが、購入を続けてよろしいですか？"}
          onAccept={handleBookOnlineTicket}
          onDismiss={() => setIsShowSameDayMonthlyBookingDialog(false)}
        />
      }

      {/*Error*/}
      {isShowErrorDialog && (
        <ErrorDialog
          message={popupErrMsg}
          onDismiss={hideErrorDialog}
          text="キャンセル"
        />
      )}

      {/* Error */}
      <Error message={errMsg} className="mt-4 text-center" />

      {isShowRequiredLoginDialog && (
        <RequiredLoginDialog
          onDismiss={() => setIsShowRequiredLoginDialog(false)}
        />
      )}
    </div>
  );
}
