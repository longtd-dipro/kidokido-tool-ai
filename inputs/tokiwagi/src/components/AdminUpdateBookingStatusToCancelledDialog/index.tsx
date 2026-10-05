import { BookingStatus } from "@prisma/client";
import { useEffect, useState } from "react";

import AdminRefundBookingDialogs from "components/AdminRefundBookingDialogs";
import AdminBookingConfirmDialog from "components/AdminUpdateBookingFormBeforeCheckIn/AdminBookingConfirmDialog";
import { MESSAGES } from "constants/messages";
import { Booking } from "models/Entity";
import { updateBookingStatus } from "services/api-client/admin/booking.service";
import { isOnlineBooking, validateChildQuantityAfterCancelBooking } from "utils/booking";
import { getMessageFromError } from "utils/common";

type Props = {
  booking: Booking & { newStatus: BookingStatus };
  onDismiss: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function AdminUpdateBookingStatusToCancelledDialog({ booking, onDismiss, onSuccess, onError }: Props) {
  // State
  const [isShowRefundDialogs, setIsShowRefundDialogs] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string>();
  const [warningMessage, setWarningMessage] = useState<string>("");

  // Effect
  useEffect(() => {
    fetchData();
  }, [booking]);

  // Function
  const processValidateChildQuantityAfterCancelBooking = async () => {
    const isValidChildQuantity = validateChildQuantityAfterCancelBooking(booking);

    if (isValidChildQuantity) {
      await processUpdateStatus();
    } else {
      setWarningMessage(MESSAGES.WARNING_ADMIN_CANCEL_ALL_BOOKINGS);
    }
  };

  const fetchData = async () => {
    try {
      setErrMsg(errMsg);

      if (isOnlineBooking(booking) && booking.newStatus === BookingStatus.SystemCancelled) {
        showRefundDialogs();
      } else {
        await processValidateChildQuantityAfterCancelBooking();
      }
    } catch (err) {
      const message = getMessageFromError(err);
      setErrMsg(message);
    }
  };

  const showRefundDialogs = () => {
    setIsShowRefundDialogs(true);
  };

  const hideRefundDialogs = () => {
    setIsShowRefundDialogs(false);
    onDismiss();
  };

  const processUpdateStatus = async () => {
    try {
      await updateBookingStatus({ ...booking, status: booking.newStatus });
      onSuccess();
    } catch (error) {
      const message = getMessageFromError(error);
      onError(message);
    }
  };

  // Render
  if (warningMessage) {
    return (
      <AdminBookingConfirmDialog
        onAccept={processUpdateStatus}
        onDismiss={onDismiss}
        dismissText="戻る"
        acceptText="次へ"
        message={isOnlineBooking(booking) ? "返金を処理しますがよろしいでしょうか。" : "キャンセルを処理しますがよろしいでしょうか。"}
        warningMessage={warningMessage}
      />
    );
  }

  if (isShowRefundDialogs) {
    return <AdminRefundBookingDialogs booking={booking} onClose={hideRefundDialogs} onError={(message) => setErrMsg(message)} onRefundedSuccess={onSuccess} />;
  }

  return null;
}
