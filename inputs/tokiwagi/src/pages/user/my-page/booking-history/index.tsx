import { TicketType } from "@prisma/client";
import moment from "moment";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";

import WarningMustWaitingDialog from "components/CreateBooking/PaymentOfflineBookingForm/WarningMustWaitingDialog";
import BookingHistoryList from "components/User/BookingHistoryList";
import Error from "components/common/Error";
import ErrorDialog from "components/common/ErrorDialog";
import UserLayout from "components/common/UserLayout";
import WarningDialog from "components/common/WarningDialog";
import { ROLE, SHORT_DATE, VACANCY_STATUS } from "constants/common";
import { MESSAGES } from "constants/messages";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { Booking } from "models/Entity";
import { TicketVacancy } from "models/Vacancy";
import { fetchBookingVacanciesStatus, fetchBookings } from "services/api-client/booking.service";
import { fetchHistoryList, requestReCheckIn } from "services/api-client/user.service";
import { isAccumulativeBooking, isOnlineOneDayBooking, isPossibleReCheckInBooking, isTimesLimitTicket } from "utils/booking";
import { scrollToTop } from "utils/common";
import { isAfterDay } from "utils/date-time";
import { ROUTE } from "constants/route";

function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [errMsg, setErrMsg] = useState<string>();
  const [selectedRequestReCheckInBooking, setSelectedRequestReCheckInBooking] = useState<Booking>(null);
  const [isShowErrorDialog, setIsShowErrorDialog] = useState<boolean>(false);
  const [errorDialogMsg, setErrorDialogMsg] = useState<string>("");
  const [isShowWarningMustWaitingDialog, setIsShowWarningMustWaitingDialog] = useState<boolean>(false);
  const [totalMinutesMustWait, setTotalMinutesMustWait] = useState<number>(0);
  const [isSubmittingRequestReCheckIn, setIsSubmittingRequestReCheckIn] = useState<boolean>(false);
  const [isShowNotMatchAccountDialog, setIsShowNotMatchAccountDialog] = useState<boolean>(false);

  const router = useRouter();
  const fromUrlUserId = +router.query.userId;

  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  let nowBookings = [];
  let oldBookings = [];
  bookings.forEach((booking) => {
    const isOldBooking = isAfterDay(moment().toDate(), booking.date) || ["Cancelled", "CheckedOut", "SystemCancelled"].includes(booking.status);
    if (isOldBooking) {
      oldBookings.push(booking);
    } else {
      nowBookings.push(booking);
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (currentUserId && fromUrlUserId && currentUserId !== fromUrlUserId) {
      setIsShowNotMatchAccountDialog(true);
    }
  }, [currentUserId, fromUrlUserId]);

  const fetchData = async () => {
    try {
      setErrMsg("");
      const bookings = await fetchHistoryList({ fromDate: moment().format(SHORT_DATE) });

      const excludedParentMonthlyBookings = bookings.filter((booking) =>
        !((booking.Ticket.type === TicketType.Monthly || isTimesLimitTicket(booking.Ticket.type))
          && !booking.parentBookingId));

      setBookings(excludedParentMonthlyBookings);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const handleRequestReCheckIn = async (booking: Booking, skipCheckingWaiting = false) => {
    try {
      const { tenantCode, barCode } = booking;
      setSelectedRequestReCheckInBooking(booking);
      setErrMsg("");

      let sameBarCodeBookings = await fetchBookings({ barCode, includeBookingSchedule: true });
      sameBarCodeBookings = sameBarCodeBookings.filter((booking) => isPossibleReCheckInBooking(booking));

      const response = await fetchBookingVacanciesStatus({ tenantCodes: [tenantCode] });
      const inDayStatus = response.inDayTenantStatus[tenantCode];
      const inDayVacancies = inDayStatus ? inDayStatus.tickets : [];

      const isNotAvailableBooking = checkIsNotAvailableBooking(sameBarCodeBookings, inDayVacancies);
      if (isNotAvailableBooking) {
        setErrorDialogMsg(MESSAGES.BOOKING_TICKET_NOT_AVAILABLE);
        setIsShowErrorDialog(true);
        return;
      }

      if (!skipCheckingWaiting) {
        const { isMustWaiting, totalMinutesMustWait } = checkWaitingStatus(sameBarCodeBookings, inDayVacancies);

        if (isMustWaiting) {
          setIsShowWarningMustWaitingDialog(true);
          setTotalMinutesMustWait(totalMinutesMustWait);
          return;
        }
      }

      await handleAcceptRequestReCheckIn(booking.barCode);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const handleAcceptRequestReCheckIn = async (barCode: string, isMustWaiting = false) => {
    try {
      if (isSubmittingRequestReCheckIn) return;
      setIsSubmittingRequestReCheckIn(true);
      await requestReCheckIn({ barCode, isMustWaiting });
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setIsShowWarningMustWaitingDialog(false);
      setIsSubmittingRequestReCheckIn(false);
      fetchData();
      scrollToTop();
    }
  };

  const checkWaitingStatus = (bookings: Booking[], inDayVacancies: TicketVacancy[]) => {
    let isMustWaiting = false;
    let totalMinutesMustWait = 0;

    const oneDayOnlineBookings = bookings.filter((booking) => isOnlineOneDayBooking(booking));
    const oneDayOnlineStandardAloneBookings = oneDayOnlineBookings.filter((booking) => !isAccumulativeBooking(booking));
    const oneDayOnlineAccumulativeBookings = oneDayOnlineBookings.filter((booking) => isAccumulativeBooking(booking));

    const inDayBookings = bookings.filter((booking) => !isOnlineOneDayBooking(booking));
    const inDayStandardAloneBookings = inDayBookings.filter((booking) => !isAccumulativeBooking(booking));
    const inDayAccumulativeBookings = inDayBookings.filter((booking) => isAccumulativeBooking(booking));

    // If having at least one booking is not waiting when requesting check-in then the same barcode bookings are not waiting too.
    if (oneDayOnlineStandardAloneBookings.length > 0) {
      isMustWaiting = false;
      totalMinutesMustWait = 0;
      return { isMustWaiting, totalMinutesMustWait };
    } else {
      if (inDayStandardAloneBookings.length > 0) {
        const inDayStandardAloneWaitingStatus = checkInDayWaitingStatus(inDayStandardAloneBookings, inDayVacancies);
        isMustWaiting = inDayStandardAloneWaitingStatus.isMustWaiting;
        totalMinutesMustWait = inDayStandardAloneWaitingStatus.totalMinutesMustWait;

        if (!isMustWaiting) {
          return { isMustWaiting, totalMinutesMustWait };
        }
      }

      if (oneDayOnlineAccumulativeBookings.length || inDayAccumulativeBookings.length) {
        const accumulativeWaitingStatus = getAccumulativeWaitingStatus(inDayVacancies);
        isMustWaiting = accumulativeWaitingStatus.isMustWaiting;
        totalMinutesMustWait = totalMinutesMustWait
          ? Math.min(accumulativeWaitingStatus.totalMinutesMustWait, totalMinutesMustWait)
          : accumulativeWaitingStatus.totalMinutesMustWait;
        if (!isMustWaiting) {
          return { isMustWaiting, totalMinutesMustWait };
        }
      }
    }

    return { isMustWaiting, totalMinutesMustWait };
  };

  const checkInDayWaitingStatus = (inDayBookings: Booking[], inDayVacancies: TicketVacancy[]) => {
    let isMustWaiting = false;
    let totalMinutesMustWait = 0;

    const filteredVacanciesByBookings = inDayVacancies.filter((vacancy) => inDayBookings.find((booking) => booking.ticketId === vacancy.ticketId));

    if (filteredVacanciesByBookings.length > 0) {
      let minutes = [];
      isMustWaiting = filteredVacanciesByBookings.every((vacancy) => {
        if (vacancy.status === VACANCY_STATUS.FULL) {
          minutes.push(vacancy.waitingTimeInMinutes);
          return true;
        }
        return false;
      });

      if (minutes.length) {
        totalMinutesMustWait = Math.min(...minutes);
      }
    }

    return { isMustWaiting, totalMinutesMustWait };
  };

  const getAccumulativeWaitingStatus = (vacancies: TicketVacancy[]) => {
    let isMustWaiting = false;
    let totalMinutesMustWait = 0;
    const accumulativeVacancies = vacancies.filter((vacancy) => vacancy.isAccumulativeMaxBookingPeople === true);
    // All accumulative tickets have the same status
    const fullAccumulativeVacancy = accumulativeVacancies.find((vacancy) => vacancy.status === VACANCY_STATUS.FULL);
    if (fullAccumulativeVacancy) {
      isMustWaiting = true;
      totalMinutesMustWait = fullAccumulativeVacancy.waitingTimeInMinutes;
    }

    return { isMustWaiting, totalMinutesMustWait };
  };

  const checkIsNotAvailableBooking = (bookings: Booking[], vacancies: TicketVacancy[]) => {
    const filteredVacanciesByBookings = vacancies.filter(
      (vacancy) => bookings.find((booking) => booking.ticketId === vacancy.ticketId) && !vacancy.canNotBookMore
    );
    const hasAtLeastOneNotAvailableVacancy = filteredVacanciesByBookings.some((vacancy) => vacancy.status === VACANCY_STATUS.NOT_AVAILABLE);

    return hasAtLeastOneNotAvailableVacancy;
  };

  const forceUserLogout = () => {
    signOut({ callbackUrl: ROUTE.SIGN_IN });
  };

  return (
    <UserLayout
      title="マイページ"
      breadcrumbItems={[
        { label: "トップ", href: ROUTE.INDEX },
        { label: "予約履歴", href: ROUTE.USER_HISTORY_BOOKINGS },
      ]}
    >
      <div className="container mx-auto">
        <h2 className="usr-title-line text-center xs:!text-2xl mx-auto mb-16 xs:mb-8 xs:pt-[0] pt-8 font bold xs:!leading-[48px]">ただいまの予約</h2>
      </div>
      <section className="relative pt-2 xs:px-[20px]">
        <Error message={errMsg} />
        {nowBookings.length ? (
          <BookingHistoryList bookings={nowBookings} onRequestReCheckIn={handleRequestReCheckIn} />
        ) : (
          <p className="flex justify-center pt-12 pl-4 pr-4 font-bold">ご予約はございません</p>
        )}
      </section>

      <div className="container mx-auto mt-12">
        <h2 className="usr-title-line text-center xs:!text-2xl xs:!leading-[48px] mx-auto mb-16 xs:mb-8 pt-8 font bold">過去の予約</h2>
      </div>
      <section className="relative pt-2 xs:px-[20px]">
        <Error message={errMsg} />

        {oldBookings.length ? (
          <BookingHistoryList bookings={oldBookings} isPast={true} onRequestReCheckIn={handleRequestReCheckIn} />
        ) : (
          <p className="flex justify-center pt-4 pl-4 pr-4 font-bold">ご予約はございません</p>
        )}
      </section>

      {isShowErrorDialog && <ErrorDialog onDismiss={() => setIsShowErrorDialog(false)} message={errorDialogMsg} text="キャンセル" />}
      {isShowWarningMustWaitingDialog && (
        <WarningMustWaitingDialog
          totalMinutesMustWait={totalMinutesMustWait}
          questionText={"再入場を続けますか？"}
          onDismiss={() => setIsShowWarningMustWaitingDialog(false)}
          onAccept={() => handleAcceptRequestReCheckIn(selectedRequestReCheckInBooking.barCode, true)}
        />
      )}
      {isShowNotMatchAccountDialog && (
        <WarningDialog
          message="予約したアカウントとは異なるアカウントでログインしています。<br/>予約した正しいアカウントで再度ログインをお願いいたします。"
          text="OK"
          hideDismissButton={true}
          hideCloseButton={true}
          onDismiss={() => { }}
          onAccept={forceUserLogout}
        />
      )}
    </UserLayout>
  );
}

export default withAuthentication(BookingHistory, [ROLE.USER]);
