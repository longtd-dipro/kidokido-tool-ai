import { BookingStatus, PaymentStatus } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import moment from "moment";

import NotificationDialog from "components/User/NotificationDialog";
import { SseEvent, SseNotification } from "libs/hooks/useSseNotifications";
import { useQrRedirect } from "libs/hooks/useQrRedirect";
import {
  CHECK_IN_OUT_TENANT_VERSION,
  CHECKOUT_BARCODE_QUERY_KEY,
  GO_TO_SAME_DAY_BOOKING_LABEL,
  NO_BOOKING_NOTIFICATION_MESSAGE,
  SESSION_STATUS,
  SHORT_DATE,
} from "constants/common";
import { ROUTE } from "constants/route";
import { Booking } from "models/Entity";
import { fetchUserBookings } from "services/api-client/booking.service";
import { CheckInIcon, CheckOutIcon } from "statics/icons";
import { isSameDay } from "utils/date-time";
import { GROUP_TICKET_TYPES } from "constants/ticket";

import BookingListModal from "./BookingListModal";

const CHECK_IN_STATUSES: BookingStatus[] = [
  BookingStatus.Calling,
  BookingStatus.Successful,
  BookingStatus.Waiting,
];

interface Props {
  scanEvent?: SseNotification | null;
  // Khi tăng, ép tải lại danh sách booking (nút 「このページで続ける」).
  refreshKey?: number;
}

const CheckInOutButtons = ({ scanEvent, refreshKey }: Props) => {
  const { status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === SESSION_STATUS.AUTHENTICATED;
  const { hasQrRedirect, clearQrRedirect } = useQrRedirect();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isShowCheckInModal, setIsShowCheckInModal] = useState(false);
  const [isShowCheckOutModal, setIsShowCheckOutModal] = useState(false);
  const [isShowNoBookingDialog, setIsShowNoBookingDialog] = useState(false);
  // Khi được set, modal checkout chỉ hiển thị nhóm booking thuộc barcode này.
  const [checkoutFilterBarCode, setCheckoutFilterBarCode] = useState<string | null>(null);
  const checkoutBarCodeParam = router.isReady ? (router.query[CHECKOUT_BARCODE_QUERY_KEY] as string) : "";
  const fetchData = useCallback(async () => {
    setIsLoadingBookings(true);
    try {
      const data: Booking[] = await fetchUserBookings({ fromDate: moment().format(SHORT_DATE) });
      setBookings(data);
    } catch {
      setBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setBookings([]);
      return;
    }

    fetchData();
  }, [isAuthenticated, fetchData]);

  useEffect(() => {
    if (isAuthenticated && [SseEvent.TRANSACTION_PAID, SseEvent.SCAN_SUCCESS].includes(scanEvent?.event as SseEvent)) {
      fetchData();
    }
  }, [isAuthenticated, scanEvent, fetchData]);

  // Nút 「このページで続ける」 trên popup checkout: tải lại danh sách booking.
  useEffect(() => {
    if (isAuthenticated && refreshKey) {
      fetchData();
    }
  }, [refreshKey, isAuthenticated, fetchData]);

  // Mở modal checkout đã lọc theo barcode khi nhận query param (nút 「決済バーコードを表示」).
  useEffect(() => {
    if (!isAuthenticated || !checkoutBarCodeParam) {
      return;
    }
    setCheckoutFilterBarCode(checkoutBarCodeParam);
    setIsShowCheckOutModal(true);
    fetchData();
    const { [CHECKOUT_BARCODE_QUERY_KEY]: _removed, ...restQuery } = router.query;
    router.replace({ pathname: router.pathname, query: restQuery }, undefined, { shallow: true });
  }, [isAuthenticated, checkoutBarCodeParam]);

  const { checkInBookings, checkOutBookings } = useMemo(() => {
    const feature: Booking[] = [];
    const checkIn: Booking[] = [];
    const checkOut: Booking[] = [];
    const today = new Date();
    for (const booking of bookings) {
      if (
        booking.Tenant?.allowedVersion === CHECK_IN_OUT_TENANT_VERSION
        && isSameDay(today, booking.date)
        && (!GROUP_TICKET_TYPES.includes(booking.Ticket.type) || booking.parentBookingId)
      ) {
        if (CHECK_IN_STATUSES.includes(booking.status)) {
          feature.push(booking);
          checkIn.push(booking);
        }

        if (
          booking.status === BookingStatus.CheckedIn ||
          (booking.status === BookingStatus.CheckedOut && booking.paymentStatus === PaymentStatus.Pending)
        ) {
          feature.push(booking);
          checkOut.push(booking);
        }
      }
    }

    if (checkIn.length < 1) {
      setIsShowCheckInModal(false);
    }

    if (checkOut.length < 1) {
      setIsShowCheckOutModal(false);
    }

    if (hasQrRedirect && feature.length < 1 && !isLoadingBookings && isAuthenticated) {
      setIsShowNoBookingDialog(true);
    } else {
      setIsShowNoBookingDialog(false);
    }

    return { checkInBookings: checkIn, checkOutBookings: checkOut };
  }, [bookings, isLoadingBookings, hasQrRedirect, isAuthenticated]);

  const showCheckIn = isAuthenticated && checkInBookings.length > 0;
  const showCheckOut = isAuthenticated && checkOutBookings.length > 0;

  const handleCheckIn = () => {
    setIsShowCheckInModal(true);
    fetchData();
  };

  const handleCheckOut = () => {
    setCheckoutFilterBarCode(null);
    setIsShowCheckOutModal(true);
    fetchData();
  };

  const handleCloseCheckOutModal = () => {
    setIsShowCheckOutModal(false);
    setCheckoutFilterBarCode(null);
  };

  const handleCloseNoBookingDialog = () => {
    setIsShowNoBookingDialog(false);
    clearQrRedirect();
  };

  const handleGoToSameDayBooking = () => {
    setIsShowNoBookingDialog(false);
    router.push(ROUTE.USE_IN_DAY_BOOKING);
  };

  return (
    <>
      {isShowNoBookingDialog && (
        <NotificationDialog
          isOpen={isShowNoBookingDialog}
          message={
            <p className="text-center text-[20px] leading-[28px] font-semibold xs:text-base">{NO_BOOKING_NOTIFICATION_MESSAGE}</p>
          }
          okLabel={GO_TO_SAME_DAY_BOOKING_LABEL}
          onClose={handleCloseNoBookingDialog}
          onOk={handleGoToSameDayBooking}
          disablePortal={false}
          paperWidth={540}
          paperHeight={224}
          paperClassName="!border !border-solid !border-[#9AE9FF] !rounded-[10px] !overflow-hidden !shrink-0"
          contentClassName="!pb-[20px]"
          buttonClassName="whitespace-nowrap !rounded-[40px] !bg-[#0068B7] !text-[20px] !font-semibold !w-[386px] h-[56px] xs:!w-[240px] xs:h-[48px]"
        />
      )}

      {Boolean(showCheckIn || showCheckOut) && (
        <div
          className="
            z-40 flex
            notxs:fixed notxs:right-0 notxs:top-1/2 notxs:-translate-y-1/2 notxs:flex-col notxs:gap-4
            xs:sticky xs:top-[80px] xs:left-0 xs:right-0 xs:flex-row xs:justify-center xs:gap-6 xs:px-4 xs:py-3
          "
        >
          {showCheckIn && (
            <button
              type="button"
              onClick={handleCheckIn}
              className="
                flex items-center gap-2 bg-white border border-[#397E51] text-[#397E51]
                font-semibold px-4 shadow-[0px_2px_0px_0px_#397E51] notxs:text-xl xs:text-base
                notxs:w-[210px] notxs:h-[64px] notxs:justify-start notxs:rounded-l-lg notxs:rounded-r-none
                xs:flex-1 xs:h-[56px] xs:justify-center xs:rounded-lg
              "
            >
              <Image src={CheckInIcon} alt="" width={24} height={24} />
              <span className="whitespace-nowrap">チェックイン</span>
            </button>
          )}

          {showCheckOut && (
            <button
              type="button"
              onClick={handleCheckOut}
              className="
                flex items-center gap-2 bg-white border border-[#943537] text-[#BD4649]
                font-semibold px-4 shadow-[0px_2px_0px_0px_#913537] notxs:text-xl xs:text-base
                notxs:w-[210px] notxs:h-[64px] notxs:justify-start notxs:rounded-l-lg notxs:rounded-r-none
                xs:flex-1 xs:h-[56px] xs:justify-center xs:rounded-lg
              "
            >
              <Image src={CheckOutIcon} alt="" width={24} height={24} />
              <span className="whitespace-nowrap">チェックアウト</span>
            </button>
          )}
        </div>
      )}

      {isShowCheckInModal && (
        <BookingListModal variant="checkin" bookings={checkInBookings} onDismiss={() => setIsShowCheckInModal(false)} />
      )}

      {isShowCheckOutModal && (
        <BookingListModal
          variant="checkout"
          bookings={checkOutBookings}
          filterBarCode={checkoutFilterBarCode ?? undefined}
          onDismiss={handleCloseCheckOutModal}
        />
      )}
    </>
  );
};

export default CheckInOutButtons;
