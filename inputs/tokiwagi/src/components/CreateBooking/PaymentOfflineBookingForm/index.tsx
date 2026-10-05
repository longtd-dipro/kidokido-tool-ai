import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "@mui/material";
import { BookingStatus, PaymentType, TicketType } from "@prisma/client";
import { cloneDeep, isNil, isEmpty, map, filter } from "lodash";
import moment from "moment";
import { useSession } from "next-auth/react";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

import UseInDayBookingVacancies from "components/BookingVacancies/UseInDayBookingVacancies";
import Error from "components/common/Error";
import SpecialSelectField from "components/common/Fields/SpecialSelectField";
import RequiredLoginDialog from "components/common/RequiredLoginDialog";
import BookingCompletion from "components/CreateBooking/BookingCompletion";
import DisclaimerTermsCheckboxDialog from "components/CreateBooking/DisclaimerTermsCheckboxDialog";
import GuideVideoDialog from "components/CreateBooking/GuideVideoDialog";
import BookingForm from "components/CreateBooking/PaymentOfflineBookingForm/BookingForm";
import PaymentOfflineBookingConfirmation from "components/CreateBooking/PaymentOfflineBookingForm/PaymentOfflineBookingConfirmation";
import TotalBookingInfo from "components/CreateBooking/PaymentOfflineBookingForm/TotalBookingInfo";
import { BOOKING_VALIDATION_ERROR_MESSAGES } from "constants/booking";
import { NOT_AVAILABLE_REASON, SESSION_STATUS, SHORT_DATE, VACANCY_STATUS } from "constants/common";
import { ROUTE } from "constants/route";
import { paymentOfflineBookingSchema } from "libs/validation/bookingSchema";
import { BookingStep, ChildAgeItem } from "models/Booking";
import { Booking, Disclaimer, Tenant, Ticket } from "models/Entity";
import { AgeUnit } from "models/enums";
import { createUseInDayBooking, fetchBookingVacanciesStatus, fetchMainBookings } from "services/api-client/booking.service";
import { fetchTenants } from "services/api-client/tenant.service";
import { fetchTickets } from "services/api-client/ticket.service";
import {
  checkMonthlyTicketCheckAlreadyUsed,
  checkRequiredInformation,
  fetchHistoryList,
  fetchLastBooking,
  fetchMonthlyBookingExtraInfo,
  fetchMonthlyTickets,
  fetchTimesLimitTickets,
} from "services/api-client/user.service";
import ArrowRightCircle from "statics/images/user/arrow-right-circle.svg";
import { getTenantOptions, sortTenantsByFirstCharacterThenCreatedAt } from "utils/tenant";
import { getTicketBookingSchedule } from "utils/ticket";
import { isSameOrAfterDay } from "utils/date-time";
import BookingPlusCircle from "statics/images/user/booking-plus-circle.svg";
import WarningMustWaitingDialog from "components/CreateBooking/PaymentOfflineBookingForm/WarningMustWaitingDialog";
import ErrorDialog from "components/common/ErrorDialog";
import UserMonthlyBookingForm from "components/CreateBooking/PaymentOfflineBookingForm/UserMonthlyBookingForm";
import { MESSAGES } from "constants/messages";
import { checkValidMaxBookingTimesForUseInDayBooking, getMinimumMaxChildPerAdultSetting } from "utils/booking-validation";
import {
  isOneDayMonthlyBooking,
  isOnlineMonthlyTicket,
  isOnlineOneDayBooking,
  isOnlyAdultTicket,
  isPromotionTicket,
  isTimesLimitTicket,
  transformBookingFormData,
} from "utils/booking";
import { TicketVacancy } from "models/Vacancy";
import { fetchDisclaimers } from "services/api-client/disclaimer.service";
import BookingVacancyIconHints from "components/BookingVacancies/BookingVacancyIconHints";
import InsertNewBookingButton from "components/InsertNewBookingButton";
import { hideBackdropLoading, showBackdropLoading } from "stores/reducers/backdrop-loading";
import { scrollToElementOnError } from "utils/ui";
import WarningMonthlyTicketDialog from "components/CreateBooking/PaymentOfflineBookingForm/WarningMonthlyTicketDialog";

import UserTimesLimitBookingForm from "./UserTimesLimitBookingForm";

export type PaymentOfflineBookingFormData = {
  tenantCode: string;
  subEmail: string;
  parentBookingId?: number;

  bookings: BookingFormData[];
  monthlyBookings: BookingFormData[];
  timesLimitBookings: BookingFormData[];
};

export type BookingFormData = {
  ticketId: number | string | any;

  adultQuantity: number;
  childQuantity: number;

  childAges: ChildAgeItem[] | number[] | any;
  parentBookingId?: number;
  minimumAdultQuantity?: number;
  isSkipValidateEmpty?: boolean;
  fromLastBooking?: boolean;
};

const DEFAULT_VALUES_PAYMENT_OFFLINE_BOOKINGS = {
  bookings: [],
  monthlyBookings: [],
  timesLimitBookings: [],
  tenantCode: "",
};

type Props = {
  tenantCode?: string;
  parentBookingId?: number;
  mainBookingId?: number;
  allowInactiveTenantCode?: boolean;
};

export default function PaymentOfflineBookingForm({
  tenantCode: defaultTenantCode,
  mainBookingId,
  parentBookingId: defaultParentBookingId,
  allowInactiveTenantCode,
}: Props) {
  const router = useRouter();
  const dispatch = useDispatch();
  const bookingAreaRef = useRef(null);
  const { status: sessionStatus } = useSession();
  const [errMsg, setErrMsg] = useState<string>();
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const [isShowDisclaimerTermsCheckboxDialog, setIsShowDisclaimerTermsCheckboxDialog] = useState<boolean>(false);
  const [isShowRequiredLoginDialog, setIsShowRequiredLoginDialog] = useState<boolean>(false);
  const [isShowWarningMustWaitingDialog, setIsShowWarningMustWaitingDialog] = useState<boolean>(false);
  const [isShowErrorDialog, setIsShowErrorDialog] = useState<boolean>(false);
  const [errorDialogMsg, setErrorDialogMsg] = useState<string>("");

  const [isShowGuideVideoDialog, setIsShowGuideVideoDialog] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingStep, setBookingStep] = useState<BookingStep>(BookingStep.InputBooking);
  const [bookingPayload, setBookingPayload] = useState<PaymentOfflineBookingFormData>(null);
  const [totalMinutesMustWait, setTotalMinutesMustWait] = useState<number>(0);

  const [monthlyBookingErrorMsg, setMonthlyBookingErrorMsg] = useState<string>("");
  const [mainBookings, setMainBookings] = useState<Booking[]>(null);
  const [isLoadedMainBookings, setIsLoadedMainBookings] = useState<boolean>(false);
  const [disclaimers, setDisclaimers] = useState<Disclaimer[]>(null);
  const [isProcessingLastBookings, setIsProcessingLastBookings] = useState<boolean>(false);
  const [isShowWarningMonthlyTicketDialog, setIsShowWarningMonthlyTicketDialog] = useState<boolean>(false);

  const [tenantData, setTenantData] = useState<{
    tickets: Ticket[],
    visibleTickets: Ticket[]
    userMonthlyBookings: Booking[],
    userTimesLimitBookings: Booking[],
    bookingVacancies: TicketVacancy[]
  }>({
    tickets: [],
    visibleTickets: [],
    userMonthlyBookings: [],
    userTimesLimitBookings: [],
    bookingVacancies: []
  });

  const [isLoadingTenantData, setIsLoadingTenantData] = useState<boolean>(false);

  const shouldNotRenderBuyMonthlyBookingButton = tenantData.userMonthlyBookings.length;

  const methods = useForm<PaymentOfflineBookingFormData>({
    resolver: yupResolver(paymentOfflineBookingSchema),
    defaultValues: {
      ...DEFAULT_VALUES_PAYMENT_OFFLINE_BOOKINGS
    },
  });

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = methods;

  const { fields, remove, append } = useFieldArray({
    control,
    name: "bookings",
  });

  const {
    fields: monthlyFields,
    remove: removeMonthlyField,
    append: appendMonthlyField,
  } = useFieldArray({
    control,
    name: "monthlyBookings",
  });

  const {
    fields: timesLimitFields,
    remove: removeTimesLimitField,
    append: appendTimesLimitField,
  } = useFieldArray({
    control,
    name: "timesLimitBookings",
  });

  const [tenantCode, inputBookings, monthlyBookings] = watch(["tenantCode", "bookings", "monthlyBookings"]);

  useEffect(() => {
    fetchData();
    fetchDataCheckRequiredInformation();
    mainBookingId && fetchMainBookingsData(mainBookingId);
  }, [allowInactiveTenantCode]);

  useEffect(() => {
    if (tenantCode) {
      fetchTenantData(tenantCode);
    }
  }, [tenantCode]);

  useEffect(() => {
    if (defaultTenantCode) {
      if (mainBookingId) {
        if (isLoadedMainBookings) {
          setValue("tenantCode", defaultTenantCode);
        }
      } else {
        setValue("tenantCode", defaultTenantCode);
      }
    }
  }, [defaultTenantCode, isLoadedMainBookings]);

  const fetchData = async () => {
    try {
      setErrMsg("");
      setLoading(true);

      const [tenants, disclaimers] = await Promise.all([fetchTenants({ allowInactiveTenantCode }), fetchDisclaimers()]);

      setTenants(sortTenantsByFirstCharacterThenCreatedAt(tenants));
      setDisclaimers(disclaimers);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantData = async (tenantCode: string) => {
    try {
      setErrMsg("");
      setIsLoadingTenantData(true);

      const bookingVacancies = await getBookingVacancies(tenantCode);
      const { tickets, userMonthlyBookings, userTimesLimitBookings } = await getTicketsData(tenantCode);
      await populateTenantData(tickets, userMonthlyBookings, userTimesLimitBookings, bookingVacancies);

      const shouldShowMonthlyTicketWarningDialog = await checkMonthlyTicketCheckAlreadyUsed({ tenantCode });
      setIsShowWarningMonthlyTicketDialog(shouldShowMonthlyTicketWarningDialog);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setIsLoadingTenantData(false);
      isProcessingLastBookings && setTimeout(() => scrollToBookingArea(), 200);
    }
  };

  const populateTenantData = async (
    tickets: Ticket[],
    userMonthlyBookings: Booking[],
    userTimesLimitBookings: Booking[],
    bookingVacancies: TicketVacancy[]
  ) => {
    const visibleTickets = getVisibleTickets(bookingVacancies, tickets);
    const [filteredUserMonthlyBookings, filteredUserTimesLimitBookings] = await Promise.all([
      filterUserMonthlyBookings(userMonthlyBookings, bookingVacancies),
      filterUserTimesLimitBookings(userTimesLimitBookings, bookingVacancies, true)
    ]);
    setTenantData({
      tickets,
      visibleTickets,
      userMonthlyBookings: filteredUserMonthlyBookings,
      userTimesLimitBookings: filteredUserTimesLimitBookings,
      bookingVacancies,
    });

    let isSkipValidateEmptyForUseInDayBooking = false;
    if (filteredUserMonthlyBookings.length || filteredUserTimesLimitBookings.length) {
      isSkipValidateEmptyForUseInDayBooking = true;
      // Set default monthly booking if there are no monthly booking
      if (filteredUserMonthlyBookings.length && isEmpty(monthlyFields)) {
        const defaultMonthlyBooking = filteredUserMonthlyBookings
          .find(booking => booking.id === defaultParentBookingId) || filteredUserMonthlyBookings[0];
        setValue("monthlyBookings", [
          {
            ticketId: defaultMonthlyBooking.Ticket,
            adultQuantity: 1,
            childQuantity: 1,
            parentBookingId: defaultMonthlyBooking.id,
            childAges: [{ age: "", unit: "" }],
            isSkipValidateEmpty: false,
          }
        ]);
      }
      if (filteredUserTimesLimitBookings.length && isEmpty(timesLimitFields)) {
        const defaultTimeLimitBooking = filteredUserTimesLimitBookings
          .find(booking => booking.id === defaultParentBookingId) || filteredUserTimesLimitBookings[0];
        setValue("timesLimitBookings", [
          {
            ticketId: defaultTimeLimitBooking.Ticket,
            adultQuantity: 1,
            childQuantity: 1,
            parentBookingId: defaultTimeLimitBooking.id,
            childAges: [{ age: "", unit: "" }],
            isSkipValidateEmpty: false,
          }
        ]);
      }
    }

    // Insert new Use In Day booking if needed
    inputBookings.length === 0 && handleInsertNewBooking(isSkipValidateEmptyForUseInDayBooking);
  };

  const filterUserMonthlyBookings = async (userMonthlyBookings: Booking[], bookingVacancies: TicketVacancy[]) => {
    const today = moment().toDate();
    // filter by booking schedule & ticket visibility
    let validUserMonthlyBookings = userMonthlyBookings.filter((booking) => {
      const isSameOfAfterDesireUsingDate = isSameOrAfterDay(today, booking.date);
      const isVisibleTicket = booking.Ticket.visibility;
      const todayBookingSchedule = getTicketBookingSchedule(today, booking.Ticket, false);

      return isSameOfAfterDesireUsingDate && isVisibleTicket && !!todayBookingSchedule;
    });
    // filter by ticket vacancy status
    const notAvailableMonthlyTicketIds = map(
      filter(bookingVacancies, (vacancy) =>
        vacancy.status === VACANCY_STATUS.NOT_AVAILABLE &&
        vacancy.reason !== NOT_AVAILABLE_REASON.EXPIRED &&
        vacancy.reason !== NOT_AVAILABLE_REASON.NOT_TIME_YET
      ),
      (vacancy) => vacancy.ticketId
    );

    // filter by main bookings
    const onlineMonthlyBookingIdsInMainBookings = map(
      filter(mainBookings, (booking) => !!booking.parentBookingId),
      (booking) => booking.parentBookingId
    );

    validUserMonthlyBookings = validUserMonthlyBookings.filter((booking) => {
      return !notAvailableMonthlyTicketIds.includes(booking.ticketId) && !onlineMonthlyBookingIdsInMainBookings.includes(booking.id);
    });

    // filter by maxBookingTimes setting
    const fetchExtraInfoPromises = validUserMonthlyBookings.map((item) => fetchMonthlyBookingExtraInfo({
      monthlyBookingId: item.id,
      ticketId: item.ticketId,
    }));
    const extraInfoResponses = await Promise.all(fetchExtraInfoPromises);

    let invalidMonthlyBookingIds = [];
    for (let i = 0; i < extraInfoResponses.length; i++) {
      const extraInfoResponse = extraInfoResponses[i];
      const { alreadyUsedInDay, maxBookingTimes } = extraInfoResponse;
      alreadyUsedInDay && maxBookingTimes === 1 && invalidMonthlyBookingIds.push(validUserMonthlyBookings[i].id);
    }

    validUserMonthlyBookings = validUserMonthlyBookings.filter((item) => !invalidMonthlyBookingIds.includes(item.id));

    return validUserMonthlyBookings;
  };

  const filterUserTimesLimitBookings = async (userMonthlyBookings: Booking[], bookingVacancies: TicketVacancy[], excludeExceededBookings = false) => {
    const today = moment().toDate();
    // filter by booking schedule & ticket visibility
    let validUserTimesLimitBookings = userMonthlyBookings.filter((booking) => {
      const isSameOfAfterDesireUsingDate = isSameOrAfterDay(today, booking.date);
      const isVisibleTicket = booking.Ticket.visibility;
      const todayBookingSchedule = getTicketBookingSchedule(today, booking.Ticket, false);

      return isSameOfAfterDesireUsingDate && isVisibleTicket && !!todayBookingSchedule;
    });
    if (excludeExceededBookings) {
      validUserTimesLimitBookings = validUserTimesLimitBookings
        .filter((booking) => booking.usageTimes < (booking.Ticket.TicketDetail.limitTimes + (booking.Ticket.TicketDetail.extraTimes || 0)));
    }
    // filter by ticket vacancy status
    const notAvailableMonthlyTicketIds = map(
      filter(bookingVacancies, (vacancy) =>
        vacancy.status === VACANCY_STATUS.NOT_AVAILABLE &&
        vacancy.reason !== NOT_AVAILABLE_REASON.EXPIRED &&
        vacancy.reason !== NOT_AVAILABLE_REASON.NOT_TIME_YET
      ),
      (vacancy) => vacancy.ticketId
    );

    validUserTimesLimitBookings = validUserTimesLimitBookings.filter((booking) => !notAvailableMonthlyTicketIds.includes(booking.ticketId));

    // filter by maxBookingTimes setting
    const fetchExtraInfoPromises = validUserTimesLimitBookings.map((item) => fetchMonthlyBookingExtraInfo({
      monthlyBookingId: item.id,
      ticketId: item.ticketId,
    }));
    const extraInfoResponses = await Promise.all(fetchExtraInfoPromises);

    let invalidMonthlyBookingIds = [];
    for (let i = 0; i < extraInfoResponses.length; i++) {
      const extraInfoResponse = extraInfoResponses[i];
      const { alreadyUsedInDay, maxBookingTimes } = extraInfoResponse;
      alreadyUsedInDay && maxBookingTimes === 1 && invalidMonthlyBookingIds.push(validUserTimesLimitBookings[i].id);
    }

    return validUserTimesLimitBookings.filter((item) => !invalidMonthlyBookingIds.includes(item.id));
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

  const getTicketsData = async (tenantCode: string) => {
    const tickets = await fetchTickets({ tenantCode, canBookInAdvance: false, paymentType: PaymentType.Offline, sort_by: "displayOrder.asc" });
    let userMonthlyBookings = [];
    let userTimesLimitBookings = [];
    if (sessionStatus === SESSION_STATUS.AUTHENTICATED) {
      [userMonthlyBookings, userTimesLimitBookings] = await Promise.all([
        fetchMonthlyTickets({
          tenantCode,
          isAvailable: true,
          includeSupportedTenant: true,
          onlyIncludeSupportedTenantIfAlreadyUseTheFirstTime: true
        }),
        fetchTimesLimitTickets({
          tenantCode,
          isAvailable: true,
          includeSupportedTenant: true,
          onlyIncludeSupportedTenantIfAlreadyUseTheFirstTime: true
        })
      ]);
    }

    return { tickets, userMonthlyBookings, userTimesLimitBookings };
  };
  const getBookingVacancies = async (tenantCode: string) => {
    const bookingVacanciesResp = await fetchBookingVacanciesStatus({ tenantCodes: [tenantCode], sortTicketsBy: "displayOrder.asc" });
    const inDayStatus = bookingVacanciesResp.inDayTenantStatus[tenantCode];
    const bookingVacancies = inDayStatus ? inDayStatus.tickets : [];
    return bookingVacancies;
  };

  const fetchMainBookingsData = async (mainBookingId: number) => {
    try {
      setErrMsg("");
      const mainBookings = await fetchMainBookings(mainBookingId);
      setMainBookings(mainBookings);
      setIsLoadedMainBookings(true);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const getVisibleTickets = (ticketVacancies: TicketVacancy[], tickets: Ticket[]) => {
    const clonedTickets = cloneDeep(tickets);
    let invisibleTicketIds = [];
    for (const ticketVacancy of ticketVacancies) {
      if (ticketVacancy.status === VACANCY_STATUS.NOT_AVAILABLE) {
        invisibleTicketIds.push(ticketVacancy.ticketId);
      }
    }

    const visibleTickets = clonedTickets.filter((ticket) => !invisibleTicketIds.includes(ticket.id));
    return visibleTickets;
  };

  const prepareBookingPayloadToSubmit = (bookingFormData: PaymentOfflineBookingFormData) => {
    const cloneBookingFormData = cloneDeep(bookingFormData);
    const bookings = [...cloneBookingFormData.monthlyBookings, ...cloneBookingFormData.timesLimitBookings, ...cloneBookingFormData.bookings].map(
      ({ minimumAdultQuantity, isSkipValidateEmpty, fromLastBooking, ...booking }) => {
        return {
          ...booking,
          childAges: booking?.childAges?.map(({ age, unit }) => (unit === AgeUnit.Year ? age * 12 : age)),
          mainBookingId,
        };
      }
    );

    delete cloneBookingFormData.monthlyBookings;
    cloneBookingFormData.bookings = bookings.filter((booking) => booking.ticketId);

    return cloneBookingFormData;
  };

  const onSubmit = async (data: PaymentOfflineBookingFormData) => {
    try {
      const sameDayBookings = await fetchHistoryList({ date: moment().format(SHORT_DATE) });

      setErrMsg("");
      setMonthlyBookingErrorMsg("");
      const bookingPayload = prepareBookingPayloadToSubmit(data);
      setBookingPayload(bookingPayload);

      if (isEmpty(bookingPayload.bookings)) {
        setErrorDialogMsg("ご入力いただいた項目に不備があります。再度ご確認とご入力の上で次に進んでください。");
        setIsShowErrorDialog(true);
        return;
      }

      const { isMustWaiting, totalMinutes } = checkIsMustWaiting(bookingPayload.bookings.map((booking) => booking.ticketId));
      const { isValidChildQuantity, maximumQuantity } = await checkIsValidChildQuantity(bookingPayload.bookings);
      const isValidMaxBookingTimes = checkValidMaxBookingTimesForUseInDayBooking(bookingPayload.bookings, sameDayBookings, tenantData.tickets);

      if (!isValidChildQuantity) {
        setErrorDialogMsg(`大人の方1名に対し、お子様は最大${maximumQuantity}名までのご入場となります。もう一度予約内容をご確認ください。`);
        setIsShowErrorDialog(true);
        return;
      }

      if (!isValidMaxBookingTimes) {
        setErrorDialogMsg(BOOKING_VALIDATION_ERROR_MESSAGES.MAX_BOOKING_TIMES);
        setIsShowErrorDialog(true);
        return;
      }

      if (isMustWaiting) {
        setIsShowWarningMustWaitingDialog(true);
        setTotalMinutesMustWait(totalMinutes);
        return;
      }

      mainBookingId ? setBookingStep(BookingStep.Confirmation) : handleShowGuideVideo();
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

  const handleShowDisclaimerTermsCheckbox = () => {
    const shouldShowCheckboxes = checkShouldShowCheckboxes();
    shouldShowCheckboxes ? setIsShowDisclaimerTermsCheckboxDialog(true) : setBookingStep(BookingStep.Confirmation);
  };

  const handleSubmitAgreementTerms = () => {
    setIsShowDisclaimerTermsCheckboxDialog(false);
    setBookingStep(BookingStep.Confirmation);
  };

  const handleDismissTermsDialog = () => {
    setIsShowDisclaimerTermsCheckboxDialog(false);
  };

  const handleBack = () => {
    errMsg && setErrMsg("");
    setBookingStep(BookingStep.InputBooking);
  };

  const handleConfirmBooking = async () => {
    try {
      setErrMsg("");
      setIsSubmitting(true);
      await createUseInDayBooking(bookingPayload);
      setBookingStep(BookingStep.Completion);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInsertNewBooking = (isSkipValidateEmpty?: boolean, ticketId?: number) => {
    if (sessionStatus === SESSION_STATUS.UNAUTHENTICATED) {
      setIsShowRequiredLoginDialog(true);
      return;
    }

    const hasMonthlyBooking = tenantData.userMonthlyBookings.length > 0;
    const alreadyHaveAtLeastOneBookingInput = hasMonthlyBooking || fields.length > 0;

    const isSkipValidateEmptyValue = isNil(isSkipValidateEmpty) ? alreadyHaveAtLeastOneBookingInput : isSkipValidateEmpty;

    const bookingDefaultValue = {
      ticketId: "" as any,
      isSkipValidateEmpty: isSkipValidateEmptyValue,
    };

    if (ticketId) {
      const ticket = tenantData.tickets.find((ticket) => ticket.id === ticketId);
      if (ticket) {
        const { adultQuantity, childQuantity, childAges } = getBookingFormDefaultValueFromTicketID(ticket);
        bookingDefaultValue["ticketId"] = ticket;
        bookingDefaultValue["adultQuantity"] = adultQuantity;
        bookingDefaultValue["childQuantity"] = childQuantity;
        bookingDefaultValue["childAges"] = childAges;
      }
    }

    append(bookingDefaultValue);
  };

  const handleInsertNewMonthlyBooking = () => {
    if (sessionStatus === SESSION_STATUS.UNAUTHENTICATED) {
      setIsShowRequiredLoginDialog(true);
      return;
    }

    const bookingDefaultValue = {
      ticketId: "" as any,
      isSkipValidateEmpty: !!mainBookingId,
    };

    appendMonthlyField(bookingDefaultValue);
  };

  const handleInsertNewTimesLimitBooking = () => {
    if (sessionStatus === SESSION_STATUS.UNAUTHENTICATED) {
      setIsShowRequiredLoginDialog(true);
      return;
    }

    const bookingDefaultValue = {
      ticketId: "" as any,
      isSkipValidateEmpty: !!mainBookingId,
    };

    appendTimesLimitField(bookingDefaultValue);
  };

  const getBookingFormDefaultValueFromTicketID = (ticket: Ticket) => {
    let adultQuantity = null;
    let childQuantity = null;
    let childAges = null;

    if (isOnlyAdultTicket(ticket)) {
      adultQuantity = 1;
      childQuantity = 0;
    } else if (isPromotionTicket(ticket)) {
      adultQuantity = 1;
      childQuantity = 1;
      childAges = [{ age: "", unit: "" }];
    } else {
      const hasMonthlyBooking = tenantData.userMonthlyBookings.length > 0;
      const defaultAdultQuantity = mainBookingId || hasMonthlyBooking || inputBookings.length > 0 ? 0 : 1;
      adultQuantity = defaultAdultQuantity;
      childQuantity = 1;
      childAges = [{ age: "", unit: "" }];
    }

    return { adultQuantity, childQuantity, childAges };
  };

  const handleFillLastBookingData = async () => {
    let isProcessError = false;
    try {
      dispatch(showBackdropLoading());
      setIsProcessingLastBookings(true);
      const lastBookings = await fetchLastBooking({ canBookInAdvance: false });

      if (lastBookings.length) {
        const tenantCodeOfLastBookings = lastBookings[0].tenantCode;

        const chosenTenantCode = tenantCode;

        if (chosenTenantCode && tenantCodeOfLastBookings !== chosenTenantCode) {
          const message = `選択された店舗で${lastBookings[0].Ticket.name}はご利用できません。`;
          setErrorDialogMsg(message);
          setIsShowErrorDialog(true);
          isProcessError = true;
          return;
        }

        if (mainBookingId) {
          if (tenantCodeOfLastBookings !== mainBookings?.[0]?.tenantCode) {
            setErrorDialogMsg("ご利用される店舗と選択した店舗を同一してください");
            setIsShowErrorDialog(true);
            isProcessError = true;
            return;
          }

          const monthlyBooking = mainBookings.find((booking) => isOnlineMonthlyTicket(booking.Ticket));
          if (monthlyBooking) {
            const ticketName = monthlyBooking.Ticket.name;
            setErrorDialogMsg(`${ticketName}の商品は既に予約されているため、他の商品を選択してください。`);
            setIsShowErrorDialog(true);
            isProcessError = true;
            return;
          }
        }

        let vacancies = cloneDeep(tenantData.bookingVacancies);
        if (vacancies.length === 0) {
          const response = await fetchBookingVacanciesStatus({ tenantCodes: [tenantCodeOfLastBookings] });

          const inDayStatus = response.inDayTenantStatus[tenantCodeOfLastBookings];
          vacancies = inDayStatus ? inDayStatus.tickets : [];
        }

        for (const lastBooking of lastBookings) {
          const vacancy = vacancies.find((item) => {
            return item.ticketId === lastBooking.ticketId;
          });

          const isInvisibility = !lastBooking.Ticket.visibility;
          const isNotAvailableVacancy = vacancy?.status === VACANCY_STATUS.NOT_AVAILABLE;
          const isCanNotBookMore = vacancy?.canNotBookMore;

          if (!vacancy || isInvisibility || isNotAvailableVacancy || isCanNotBookMore) {
            const message = `現在 ${lastBooking.Ticket.name} はご利用できません。`;
            setErrorDialogMsg(message);
            setIsShowErrorDialog(true);
            isProcessError = true;
            return;
          }

          if (isOneDayMonthlyBooking(lastBooking)) {
            const { isAvailable, alreadyUsedInDay, maxBookingTimes } = await fetchMonthlyBookingExtraInfo({
              monthlyBookingId: lastBooking.parentBookingId,
              ticketId: lastBooking.ticketId
            });

            if (!isAvailable) {
              setErrorDialogMsg(MESSAGES.EXPIRED_MONTHLY_BOOKING);
              setIsShowErrorDialog(true);
              isProcessError = true;
              return;
            }

            if (alreadyUsedInDay && maxBookingTimes === 1) {
              setErrorDialogMsg("前回に予約された商品の予約できる回数は1回に限ります。お手数ですが、他の商品をお使いください。");
              setIsShowErrorDialog(true);
              isProcessError = true;
              return;
            }
          }
        }

        const hourlyOrDailyBookings = [];
        const lastMonthlyBookings = [];
        const timesLimitBookings = [];
        for (const lastBooking of lastBookings) {
          const lastBookingTicketType = lastBooking?.Ticket?.type;
          if (isTimesLimitTicket(lastBookingTicketType)){
            timesLimitBookings.push(lastBooking);
          } else if (lastBookingTicketType === TicketType.Monthly){
            lastMonthlyBookings.push(lastBooking);
          } else {
            hourlyOrDailyBookings.push(lastBooking);
          }
        }
     
        setValue("tenantCode", tenantCodeOfLastBookings);
        setValue(
          "bookings",
          hourlyOrDailyBookings.map((booking) => transformBookingFormData(booking))
        );
        if (lastMonthlyBookings.length){
          setValue(
            "monthlyBookings",
            lastMonthlyBookings.map((booking) => transformBookingFormData(booking))
          );
        }         
        if (timesLimitBookings.length){
          setValue(
            "timesLimitBookings",
            timesLimitBookings.map((booking) => transformBookingFormData(booking))
          );
        }         
        
      } else {
        isProcessError = true;
      }
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      dispatch(hideBackdropLoading());
      !isProcessError && tenantData.bookingVacancies.length && scrollToBookingArea();
      isProcessError && setIsProcessingLastBookings(false);
    }
  };

  const scrollToBookingArea = () => {
    bookingAreaRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsProcessingLastBookings(false);
  };

  const handleRedirectBuyMonthlyTicket = () => {
    router.push(ROUTE.BUY_MONTHLY_TICKET);
  };

  const checkShouldShowCheckboxes = () => {
    for (const inputBooking of inputBookings) {
      if (inputBooking.ticketId?.TicketDetail?.requiredAgreement) {
        return true;
      }
    }

    for (const userMonthlyBooking of tenantData.userMonthlyBookings) {
      if (userMonthlyBooking.Ticket?.TicketDetail?.requiredAgreement) {
        return true;
      }
    }

    for (const userTimesLimitBooking of tenantData.userTimesLimitBookings) {
      if (userTimesLimitBooking.Ticket?.TicketDetail?.requiredAgreement) {
        return true;
      }
    }
    return false;
  };

  const handleChangeTenant = () => {
    remove();
    removeMonthlyField();
    removeTimesLimitField();
    setTenantData({
      ...tenantData,
      tickets: [],
      visibleTickets: [],
    });
    if (mainBookingId) {
      delete router.query.mainBookingId;
      router.push({ pathname: router.pathname, query: { ...router.query } });
    }
  };

  const checkIsMustWaiting = (inputBookingTicketIds: string[]) => {
    if (mainBookingId) {
      const isHasCheckingInBooking = mainBookings.some((booking) => booking.status === BookingStatus.CheckedIn);
      const isHasOneDayOnlineBooking = mainBookings.some((booking) => isOnlineOneDayBooking(booking));
      const isMainBookingNotWaiting = mainBookings.some((booking) => booking.id === mainBookingId && booking.status !== BookingStatus.Waiting);

      if (isHasCheckingInBooking || isHasOneDayOnlineBooking || isMainBookingNotWaiting) {
        return { isMustWaiting: false, totalMinutes: 0 };
      }
    }

    let minutes = [];
    const isMustWaiting = inputBookingTicketIds.every((item) => {
      const bookingVacancy = tenantData.bookingVacancies.find(({ ticketId }) => ticketId === +item);
      if (!bookingVacancy) {
        return false;
      }

      if (bookingVacancy.status === VACANCY_STATUS.FULL) {
        minutes.push(bookingVacancy.waitingTimeInMinutes);
      }
      return bookingVacancy.status === VACANCY_STATUS.FULL;
    });

    const totalMinutes = Math.min(...minutes);

    return { isMustWaiting, totalMinutes };
  };

  const handleAcceptBookWithWaiting = () => {
    setIsShowWarningMustWaitingDialog(false);
    mainBookingId ? setBookingStep(BookingStep.Confirmation) : handleShowGuideVideo();
  };

  const checkIsValidChildQuantity = async (inputBookings: any) => {
    const clonedInputBookings = cloneDeep(inputBookings);
    if (mainBookingId && mainBookings) {
      clonedInputBookings.push(...mainBookings);
    }

    const maximumQuantity = getMaximumChildQuantity(clonedInputBookings, [...userMonthlyTickets, ...userTimesLimitTickets, ...tenantData.tickets]);
    const inputQuantity = clonedInputBookings.reduce((sum, inputBooking) => +inputBooking.childQuantity + sum, 0);

    return {
      isValidChildQuantity: inputQuantity <= maximumQuantity,
      maximumQuantity,
    };
  };

  const getMaximumChildQuantity = (inputBookings: Array<BookingFormData | Booking>, tickets: Ticket[]) => {
    if (tickets.length) {
      const totalAdultQuantity = inputBookings.reduce((sum, inputBooking) => +inputBooking.adultQuantity + sum, 0);
      const bookingTickets = inputBookings.map((inputBooking) => {
        if ((inputBooking as Booking).Ticket) {
          return (inputBooking as Booking).Ticket;
        }

        const ticket = tickets.find((ticket) => {
          return ticket.id === inputBooking.ticketId || ticket.id === inputBooking.ticketId.id;
        });

        return ticket;
      });

      const minimumMaxChildPerAdultSetting = getMinimumMaxChildPerAdultSetting(bookingTickets.filter(Boolean));
      return totalAdultQuantity * minimumMaxChildPerAdultSetting;
    }
  };

  const handleInsertAvailableVacancyToBookingForm = (ticketVacancy: TicketVacancy) => {
    if (ticketVacancy.ticketType !== TicketType.Monthly) {
      const emptyBookingFormIndex = inputBookings.findIndex((item) => !item.ticketId);
      if (emptyBookingFormIndex >= 0) {
        remove(emptyBookingFormIndex);
      }

      handleInsertNewBooking(false, ticketVacancy.ticketId);
      scrollToInsertBookingButton();
    }
  };

  const handleAfterRemoveBooking = (index: number) => {
    const hasMonthlyBooking = tenantData.userMonthlyBookings.length || tenantData.userTimesLimitBookings.length;
    if (!hasMonthlyBooking && index === 0) {
      setValue(`bookings.${0}.isSkipValidateEmpty`, false);

      fields.length === 1 && setValue(`bookings.${0}.ticketId`, "");
    }
  };

  const handleRemoveMonthlyBooking = (index: number) => {
    removeMonthlyField(index);

    if (index === 0 && monthlyFields.length === 1) {
      setValue(`monthlyBookings.${0}.ticketId`, "");
      setValue(`monthlyBookings.${0}.isSkipValidateEmpty`, !!mainBookingId);
    }
  };

  const handleRemoveTimesLimitBooking = (index: number) => {
    removeTimesLimitField(index);
    const hasMonthlyBooking = tenantData.userMonthlyBookings.length || tenantData.userTimesLimitBookings.length;
    if (!hasMonthlyBooking && index === 0) {
      setValue(`timesLimitBookings.${0}.isSkipValidateEmpty`, false);

      fields.length === 1 && setValue(`timesLimitBookings.${0}.ticketId`, "");
    }
  };

  const scrollToInsertBookingButton = () => {
    const lastBookingFieldId = fields.at(-1)?.id;
    lastBookingFieldId && document.getElementById(lastBookingFieldId).scrollIntoView({ behavior: "smooth" });
  };

  const isAllTicketNotAvailable = tenantData.bookingVacancies?.every((vacancy) => vacancy.status === VACANCY_STATUS.NOT_AVAILABLE);
  const isDisableInsertMonthlyBookingButton = tenantData.userMonthlyBookings.length === monthlyFields.length;

  const userMonthlyTickets = tenantData.userMonthlyBookings.map((booking) => booking.Ticket);
  const userTimesLimitTickets = tenantData.userTimesLimitBookings.map((booking) => booking.Ticket);

  return (
    <div className="w-[824px] mx-auto xs:w-full xs:mt-4 md:w-full">
      {bookingStep === BookingStep.InputBooking && !loading && (
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit, scrollToElementOnError)}>
            {/*MOBILE*/}
            <div className="xsup:hidden">
              <h2 className="usr-title-line mx-auto xs:!text-[28px] mb-8 xs:!font-medium">当日利用</h2>
            </div>

            {/*Re-booking*/}
            <div className="flex justify-center mt-10 mb-16 xs:mb-6 md:mb-8">
              <Button
                variant="outlined"
                className="w-[403px] h-[64px] xs:h-[40px] !text-xl xs:!text-base md:!text-base md:h-[48px] md:w-[330px]"
                onClick={handleFillLastBookingData}
                disabled={isLoadingTenantData}
              >
                前回と同じ内容で入力する
              </Button>
            </div>

            {/*Choose tenant*/}
            <div className="mb-16 xs:mb-8 xs:!text-[0.8rem]">
              <SpecialSelectField
                labelId="choose-tenant-label"
                name="tenantCode"
                control={control}
                options={getTenantOptions(tenants)}
                className="flex-1 block"
                currentValue={tenantCode}
                handleChange={handleChangeTenant}
                shouldDisable={!!mainBookingId}
              />
              {errors.tenantCode && <Error message={errors.tenantCode.message} />}
            </div>

            {!loading && tenantCode && (
              <div>
                {/* Booking Vacancies */}
                <div>
                  <div className={"text-center font-bold text-2xl text-blue-color mb-4 mt-[2.5rem]"}>販売状況</div>
                  {!isAllTicketNotAvailable && <BookingVacancyIconHints marginTop={2} marginBottom={8} />}
                </div>
                <UseInDayBookingVacancies
                  bookingVacancies={tenantData.bookingVacancies}
                  loadingBooking={isLoadingTenantData}
                  tickets={tenantData.tickets}
                  monthlyTickets={tenantData.userMonthlyBookings.map((item) => item.Ticket)}
                  isAllTicketNotAvailable={isAllTicketNotAvailable}
                  onClickAvailableVacancy={handleInsertAvailableVacancyToBookingForm}
                  onError={(msg) => setErrMsg(msg)}
                />

                <span ref={bookingAreaRef}></span>

                <div className="mt-16">
                  {/* User Monthly Booking */}
                  {Boolean(tenantData.userMonthlyBookings.length) && (
                    <>
                      <h3 className="text-center font-bold text-2xl text-blue-color mb-4 mt-[2.5rem]">お持ちのフリーパス</h3>
                      <div className="bg-[#DBF0FF] pt-4 px-4 rounded-[10px] pb-2 mb-7 xs:mb-4">
                        {monthlyFields.map((monthlyField, index) => {
                          return (
                            <div className="mb-4" key={monthlyField.id}>
                              <UserMonthlyBookingForm
                                fieldIndex={index}
                                parentMonthlyBookings={tenantData.userMonthlyBookings}
                                tickets={tenantData.userMonthlyBookings.map((booking) => booking.Ticket)}
                                onRemove={handleRemoveMonthlyBooking}
                              />
                            </div>
                          );
                        })}

                        {!isDisableInsertMonthlyBookingButton && (
                          <div className="mt-2 xs:mt-0">
                            <div className="flex justify-center">
                              <InsertNewBookingButton onClickButton={handleInsertNewMonthlyBooking} title="さらにパスを追加する" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-center my-1 xs:my-1">
                        <Image src={BookingPlusCircle} alt="plus" />
                      </div>
                    </>
                  )}

                  {
                    Boolean(tenantData.userTimesLimitBookings.length) && (
                      <>
                        {/* Times Limit Booking */}
                        <h3 className="text-center font-bold text-2xl text-blue-color mb-4 mt-[28px] xs:mt-[16px]">お持ちの回数券</h3>
                        <div className="bg-[#DBF0FF] pt-4 px-4 rounded-[10px] pb-2 mb-7 xs:mb-4">
                          {timesLimitFields.map((appendTimesLimitField, index) => {
                            return (
                              <div className="mb-4" key={appendTimesLimitField.id}>
                                <UserTimesLimitBookingForm
                                  fieldIndex={index}
                                  parentTimesLimitBookings={tenantData.userTimesLimitBookings}
                                  tickets={tenantData.userTimesLimitBookings.map((booking) => booking.Ticket)}
                                  onRemove={handleRemoveTimesLimitBooking}
                                />
                              </div>
                            );
                          })}

                          <div className="mt-2 xs:mt-0">
                            <div className="flex justify-center">
                              <InsertNewBookingButton onClickButton={handleInsertNewTimesLimitBooking} title="さらに商品を追加する" />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-center my-1 xs:my-1">
                          <Image src={BookingPlusCircle} alt="plus" />
                        </div>
                      </>
                    )
                  }

                  {/* Use In Day Booking */}
                  {
                    Boolean(tenantData.userMonthlyBookings.length || tenantData.userTimesLimitBookings.length) && (
                      <h3 className="text-center font-bold text-2xl text-blue-color mb-4 mt-[28px] xs:mt-[16px]">当日利用の商品</h3>
                    )
                  }

                  <div className="bg-[#DBF0FF] pt-4 px-4 rounded-[10px] pb-2">
                    {fields.map((item, index) => {
                      return (
                        <div key={item.id} id={item.id} className="mb-4">
                          <BookingForm
                            index={index}
                            tickets={tenantData.visibleTickets}
                            control={control}
                            setValue={setValue}
                            watch={watch}
                            errors={errors}
                            removeBooking={remove}
                            defaultQuantityDetail={item}
                            userMonthlyBookings={tenantData.userMonthlyBookings}
                            userTimesLimitBookings={tenantData.userTimesLimitBookings}
                            mainBookingId={mainBookingId}
                            onRemoveBooking={(index: number) => handleAfterRemoveBooking(index)}
                          />
                        </div>
                      );
                    })}

                    <div className="mt-2 xs:mt-0">
                      <div className="flex justify-center">
                        <InsertNewBookingButton onClickButton={handleInsertNewBooking} title="さらに商品を追加する" />
                      </div>
                    </div>
                  </div>
                </div>

                {!shouldNotRenderBuyMonthlyBookingButton ? (
                  <div className="flex justify-center mt-4">
                    <Button onClick={handleRedirectBuyMonthlyTicket} variant="outlined" className="w-[380px] h-[50px] !text-base !px-4 xs:!text-sm">
                      <div className="flex items-center justify-between w-full">
                        <span>フリーパス購入を希望の方はこちら</span>
                        <Image src={ArrowRightCircle} alt="plus" />
                      </div>
                    </Button>
                  </div>
                ) : null}

                {/*Total booking info*/}
                {monthlyFields.length || inputBookings.length || timesLimitFields.length ? (
                  <div className="mt-16">
                    <TotalBookingInfo
                      maximumChildQuantity={
                        getMaximumChildQuantity(
                          prepareBookingPayloadToSubmit(getValues()).bookings, [...userMonthlyTickets, ...tenantData.tickets, ...userTimesLimitTickets]
                        )
                      }
                      hasMainBookingId={!!mainBookingId}
                      mainBookings={mainBookings}
                    />
                  </div>
                ) : null}

                <div className="flex flex-col justify-center mt-16 xs:mt-8">
                  {/*Buttons*/}
                  <div className="mx-auto mt-4">
                    <Button
                      type="submit"
                      variant="contained"
                      className="!min-w-[403px] h-[64px] xs:!min-w-[290px] xs:h-[48px] md:!text-lg md:h-[48px] md:!min-w-[290px]"
                      fullWidth
                      disabled={!inputBookings.length && !tenantData.userMonthlyBookings.length && !tenantData.userTimesLimitBookings.length}
                    >
                      {tenantData.userMonthlyBookings.length ? "これで確定" : "次へ"}
                    </Button>
                  </div>
                  <div className="text-center mt-2">
                    {Object.keys(errors).length === 0 ? (
                      monthlyBookingErrorMsg ? (
                        <Error message={monthlyBookingErrorMsg} />
                      ) : (
                        ""
                      )
                    ) : (
                      <Error message={"ご入力いただいた項目に不備があります。再度ご確認とご入力の上で次に進んでください。"} />
                    )}
                  </div>
                </div>
              </div>
            )}
          </form>
        </FormProvider>
      )}

      {bookingStep === BookingStep.Confirmation && (
        <PaymentOfflineBookingConfirmation
          bookingPayload={bookingPayload}
          tenants={tenants}
          tickets={[...userMonthlyTickets, ...tenantData.tickets, ...userTimesLimitTickets]}
          mainBookings={mainBookings}
          onBack={handleBack}
          onConfirm={handleConfirmBooking}
          isSubmitting={isSubmitting}
        />
      )}

      {bookingStep === BookingStep.Completion && (
        <BookingCompletion
          redirectUrl={ROUTE.USER_HISTORY_BOOKINGS}
          heading="受付が完了しました"
          title="ご登録いただいたメールアドレスにメールをお送りしました。"
          content="店頭でメールに記載のバーコードをご提示ください。"
          note="空予約を防ぐため、30分で自動キャンセルとなりますのでご注意ください。"
        />
      )}

      {isShowGuideVideoDialog && (
        <GuideVideoDialog
          videoUrl={monthlyBookings.length ? monthlyBookings[0].ticketId.videoUrl : inputBookings[0].ticketId.videoUrl}
          onDismiss={() => setIsShowGuideVideoDialog(false)}
          onNext={() => {
            setIsShowGuideVideoDialog(false);
            handleShowDisclaimerTermsCheckbox();
          }}
        />
      )}

      {isShowDisclaimerTermsCheckboxDialog && (
        <DisclaimerTermsCheckboxDialog defaultDisclaimers={disclaimers} onAccept={handleSubmitAgreementTerms} onDismiss={handleDismissTermsDialog} />
      )}

      {/* Error */}
      <Error message={errMsg} className="mt-4 text-center" />

      {/* Notification Error */}
      {isShowErrorDialog && <ErrorDialog onDismiss={() => setIsShowErrorDialog(false)} message={errorDialogMsg} text="キャンセル" />}
      {isShowRequiredLoginDialog && <RequiredLoginDialog onDismiss={() => setIsShowRequiredLoginDialog(false)} />}
      {isShowWarningMustWaitingDialog && (
        <WarningMustWaitingDialog
          totalMinutesMustWait={totalMinutesMustWait}
          onDismiss={() => setIsShowWarningMustWaitingDialog(false)}
          onAccept={handleAcceptBookWithWaiting}
        />
      )}

      {isShowWarningMonthlyTicketDialog && (
        <WarningMonthlyTicketDialog
          onDismiss={() => setIsShowWarningMonthlyTicketDialog(false)}
        />)}
    </div>
  );
}
