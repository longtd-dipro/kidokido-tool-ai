import { BookingStatus, TicketType } from "@prisma/client";
import { useEffect, useState } from "react";

import AdminDeleteBookingReviewDialog from "components/AdminCancelBookingDialog/AdminCancelBookingReviewDialog";
import AdminBookingConfirmDialog from "components/AdminUpdateBookingFormBeforeCheckIn/AdminBookingConfirmDialog";
import AdminBookingCreditCardDialog from "components/AdminUpdateBookingFormBeforeCheckIn/AdminBookingCreditCardDialog";
import { MESSAGES } from "constants/messages";
import { Booking } from "models/Entity";
import { fetchMonthlyBookingExtraInfo, updateBookingStatus } from "services/api-client/admin/booking.service";
import { fetchBookingTransaction } from "services/api-client/booking.service";
import { TransactionInfo } from "services/gmo.service";
import { validateChildQuantityAfterCancelBooking } from "utils/booking";
import { checkIsValidChildQuantityAfterCancelMonthlyBooking } from "utils/booking-validation";
import { getMessageFromError } from "utils/common";

type Props = {
  booking: Booking & { newStatus: BookingStatus };
  onClose: () => void;
  onError: (message: string) => void;
  onRefundedSuccess: () => void;
};

enum RefundStep {
  S1_CONFIRM,
  S2_REVIEW,
  S3_PAYMENT,
}

export default function AdminRefundBookingDialogs({ booking, onClose, onError, onRefundedSuccess }: Props) {
  const [step, setStep] = useState<RefundStep>(RefundStep.S1_CONFIRM);
  const [transaction, setTransaction] = useState<TransactionInfo>();
  const [warningMessage, setWarningMessage] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const processValidateChildQuantityAfterCancelMonthlyBooking = async () => {
    const { oneDayBookings } = await fetchMonthlyBookingExtraInfo({ monthlyBookingId: booking.id, includeOneDayBookings: true });
    const { isValidChildQuantity, isAllBookingsInvalid } = checkIsValidChildQuantityAfterCancelMonthlyBooking(oneDayBookings);
    if (!isValidChildQuantity && isAllBookingsInvalid) {
      setWarningMessage(MESSAGES.WARNING_ADMIN_CANCEL_ALL_BOOKINGS);
    }

    if (!isValidChildQuantity && !isAllBookingsInvalid) {
      setWarningMessage(MESSAGES.WARNING_ADMIN_CANCEL_PARTIAL_MONTHLY_BOOKINGS);
    }
  };

  const processValidateChildQuantityAfterCancelBooking = async () => {
    const isValidChildQuantity = validateChildQuantityAfterCancelBooking(booking);
    !isValidChildQuantity && setWarningMessage(MESSAGES.WARNING_ADMIN_CANCEL_ALL_BOOKINGS);
  };

  const fetchData = async () => {
    try {
      if (booking.Ticket.type === TicketType.Monthly && !booking.parentBookingId) {
        await processValidateChildQuantityAfterCancelMonthlyBooking();
      } else {
        await processValidateChildQuantityAfterCancelBooking();
      }

      const transaction = await fetchBookingTransaction(booking.id);
      setTransaction(transaction);
    } catch (err) {
      const message = getMessageFromError(err);
      onError(message);
    }
  };

  const handleAcceptPayment = async () => {
    try {
      await updateBookingStatus({ ...booking, status: booking.newStatus });
      onRefundedSuccess();
    } catch (error) {
      const message = getMessageFromError(error);
      onError(message);
    }
    onRefundedSuccess();
  };

  const handleAcceptConfirmation = async () => {
    setStep(RefundStep.S2_REVIEW);
  };

  return (
    <div>
      {step === RefundStep.S1_CONFIRM && (
        <AdminBookingConfirmDialog
          onAccept={handleAcceptConfirmation}
          onDismiss={() => onClose()}
          dismissText="戻る"
          acceptText="次へ"
          message={"返金を処理しますがよろしいでしょうか。"}
          warningMessage={warningMessage}
        />
      )}

      {step === RefundStep.S2_REVIEW && transaction && (
        <AdminDeleteBookingReviewDialog
          ticketName={booking.Ticket.name}
          useDate={booking.date}
          totalAdult={booking.adultQuantity}
          totalChild={booking.childQuantity}
          refundAmount={Number(booking.totalAmount)}
          transactionDate={transaction?.ProcessDate}
          transactionId={transaction?.TranID}
          isOpen={true}
          onClose={() => setStep(RefundStep.S1_CONFIRM)}
          onOk={() => {
            setStep(RefundStep.S3_PAYMENT);
          }}
        />
      )}

      {step === RefundStep.S3_PAYMENT && (
        <AdminBookingCreditCardDialog
          transaction={transaction}
          userOwnerId={booking.userId}
          isOpen={true}
          onClose={() => setStep(RefundStep.S2_REVIEW)}
          onOk={handleAcceptPayment}
        />
      )}
    </div>
  );
}
