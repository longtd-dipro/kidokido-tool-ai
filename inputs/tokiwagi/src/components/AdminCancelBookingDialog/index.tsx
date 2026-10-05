import { PaymentType, TicketType } from "@prisma/client";
import { useEffect, useState } from "react";

import AdminBookingConfirmDialog from "components/AdminUpdateBookingFormBeforeCheckIn/AdminBookingConfirmDialog";
import NotificationDialog from "components/User/NotificationDialog";
import { MESSAGES } from "constants/messages";
import { Booking } from "models/Entity";
import { cancelBooking, fetchMonthlyBookingExtraInfo } from "services/api-client/admin/booking.service";
import { fetchBookingTransaction } from "services/api-client/booking.service";
import { TransactionInfo } from "services/gmo.service";
import { isOnlineBooking, validateChildQuantityAfterCancelBooking } from "utils/booking";
import { checkIsValidChildQuantityAfterCancelMonthlyBooking } from "utils/booking-validation";
import { getMessageFromError } from "utils/common";

import AdminDeleteBookingReviewDialog from "./AdminCancelBookingReviewDialog";

type Props = {
  booking: Booking;
  onDismiss: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function AdminCancelBookingDialog(props: Props) {
  // State
  const [transaction, setTransaction] = useState<TransactionInfo>();
  const [isValidChildQuantityAfterCancel, setIsValidChildQuantityAfterCancel] = useState<boolean>(true);
  const [specificBookingBarCodeShouldCancelAll, setSpecificBookingBarCodeShouldCancelAll] = useState<string[]>([]);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [errMsg, setErrMsg] = useState<string>();
  const [warningMessage, setWarningMessage] = useState<string>("");

  // Variable
  const hadTransaction =
    props.booking.paymentStatus === "Completed" && props.booking.Ticket.paymentType === PaymentType.Online && !props.booking.parentBookingId;

  // Effect
  useEffect(() => {
    fetchData();
  }, [props.booking]);

  // Function
  const handleDelete = async () => {
    try {
      setIsLoading(true);

      const shouldCancelAllSameBarcodeBookings = !isValidChildQuantityAfterCancel;
      await cancelBooking({ id: props.booking.id, shouldCancelAllSameBarcodeBookings, specificBookingBarCodeShouldCancelAll });
      props.onSuccess();
      setShowReviewDialog(false);
      setShowCompleteDialog(true);
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      props.onError(message);
      setErrMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const processValidateChildQuantityAfterCancelMonthlyBooking = async () => {
    const { oneDayBookings } = await fetchMonthlyBookingExtraInfo({ monthlyBookingId: props.booking.id, includeOneDayBookings: true });
    const { isValidChildQuantity, isAllBookingsInvalid, invalidBookingBarCodes } = checkIsValidChildQuantityAfterCancelMonthlyBooking(oneDayBookings);
    setSpecificBookingBarCodeShouldCancelAll(invalidBookingBarCodes);
    setIsValidChildQuantityAfterCancel(isValidChildQuantity);
    if (!isValidChildQuantity && isAllBookingsInvalid) {
      setWarningMessage(MESSAGES.WARNING_ADMIN_CANCEL_ALL_BOOKINGS);
    }

    if (!isValidChildQuantity && !isAllBookingsInvalid) {
      setWarningMessage(MESSAGES.WARNING_ADMIN_CANCEL_PARTIAL_MONTHLY_BOOKINGS);
    }
  };

  const processValidateChildQuantityAfterCancelBooking = async () => {
    const isValidChildQuantity = await validateChildQuantityAfterCancelBooking(props.booking);
    setIsValidChildQuantityAfterCancel(isValidChildQuantity);
    !isValidChildQuantity && setWarningMessage(MESSAGES.WARNING_ADMIN_CANCEL_ALL_BOOKINGS);
  };

  const fetchData = async () => {
    try {
      setErrMsg(errMsg);

      if (props.booking.Ticket.type === TicketType.Monthly && !props.booking.parentBookingId) {
        await processValidateChildQuantityAfterCancelMonthlyBooking();
      } else {
        await processValidateChildQuantityAfterCancelBooking();
      }

      if (hadTransaction) {
        const transaction = await fetchBookingTransaction(props.booking.id);
        setTransaction(transaction);
      }

      setShowConfirmDialog(true);
    } catch (err) {
      const message = getMessageFromError(err);
      setErrMsg(message);
    }
  };

  const handleAcceptCancelBooking = () => {
    if (hadTransaction) {
      setShowConfirmDialog(false);
      setShowReviewDialog(true);
    } else {
      setShowConfirmDialog(false);
      handleDelete();
    }
  };

  if (showConfirmDialog) {
    return (
      <AdminBookingConfirmDialog
        onAccept={handleAcceptCancelBooking}
        onDismiss={props.onDismiss}
        dismissText="戻る"
        acceptText="次へ"
        message={isOnlineBooking(props.booking) ? "返金を処理しますがよろしいでしょうか。" : "キャンセルを処理しますがよろしいでしょうか。"}
        warningMessage={warningMessage}
      />
    );
  }

  if (showReviewDialog) {
    return (
      <AdminDeleteBookingReviewDialog
        ticketName={props.booking.Ticket.name}
        useDate={props.booking.date}
        totalAdult={props.booking.adultQuantity}
        totalChild={props.booking.childQuantity}
        refundAmount={hadTransaction ? Number(props.booking.totalAmount) : 0}
        transactionDate={transaction?.ProcessDate}
        transactionId={transaction?.TranID}
        isOpen={true}
        onClose={props.onDismiss}
        onOk={handleDelete}
        errorMsg={errMsg}
        isLoading={isLoading}
      />
    );
  }

  if (showCompleteDialog) {
    return (
      <NotificationDialog
        hiddenCloseIcon={true}
        isOpen={true}
        width={856}
        message={
          <div className="text-center pt-[12px]">
            <p className="text-[32px] leading-[48px] font-medium mb-[32px]">
              {isOnlineBooking(props.booking) ? "返金を処理しました" : "キャンセルを処理しました"}
            </p>
            <p className="text-[16px] leading-[24px] font-light">
              キャンセル内容が反映されているかは、マイページ「予約履歴・変更・キャンセ
              <br />
              ル」よりご確認いただけます。
            </p>
          </div>
        }
        okLabel="予約一覧に戻る"
        onClose={() => {
          props.onDismiss();
        }}
      />
    );
  }

  return null;
}
