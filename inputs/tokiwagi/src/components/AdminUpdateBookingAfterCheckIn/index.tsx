import { PaymentType } from "@prisma/client";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";

import AdminUpdateAfterCheckInBookingForm from "components/AdminUpdateBookingAfterCheckIn/AdminUpdateAfterCheckInBookingForm";
import AdminBookingConfirmDialog from "components/AdminUpdateBookingFormBeforeCheckIn/AdminBookingConfirmDialog";
import AdminBookingCreditCardDialog from "components/AdminUpdateBookingFormBeforeCheckIn/AdminBookingCreditCardDialog";
import AdminUpdateBookingReviewDialog from "components/AdminUpdateBookingFormBeforeCheckIn/AdminUpdateBookingReviewDialog";
import Error from "components/common/Error";
import NotificationDialog from "components/User/NotificationDialog";
import { ROUTE } from "constants/route";
import { BookingQuantityFormData } from "models/Booking";
import { Booking } from "models/Entity";
import { FormStep } from "models/enums";
import { fetchBookingById, updateDecreaseQuantityBooking } from "services/api-client/admin/booking.service";
import { fetchBookingTransaction } from "services/api-client/booking.service";
import { TransactionInfo } from "services/gmo.service";
import PeopleIcon from "statics/images/user/people-icon.svg";
import { getDailyBookingTotalPrices, getDetailPeopleBooking, isOnlineOneDayBooking } from "utils/booking";
import { getMessageFromError } from "utils/common";
import { getUrlQueryValue } from "utils/url";

export default function AdminUpdateBookingAfterCheckIn() {
  const router = useRouter();
  const [errMsg, setErrMsg] = useState<string>("");
  const [booking, setBooking] = useState<Booking>();
  const [transaction, setTransaction] = useState<TransactionInfo>();
  const [updateStep, setUpdateStep] = useState(FormStep.S1_UPDATE);
  const [totalAmount, setTotalAmount] = useState(0);
  const [decreasedQuantity, setDecreasedQuantity] = useState<BookingQuantityFormData>();

  const filters = getUrlQueryValue("filters");
  const page = getUrlQueryValue("page");
  const staffOrAdminId = getUrlQueryValue("staffOrAdminId");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setErrMsg(errMsg);
      const id = Number(router.query.id);
      const booking = await fetchBookingById(id);
      setBooking(booking);

      const transaction = await fetchBookingTransaction(booking.id);

      setTransaction(transaction);
    } catch (err) {
      const message = getMessageFromError(err);
      setErrMsg(message);
    }
  };

  const handleRedirectBookingManagement = () => {
    router.push({
      pathname: ROUTE.BOOKING_MANAGEMENT,
      query: {
        filters,
        page,
        ...(staffOrAdminId && { staffOrAdminId }),
      },
    });
  };

  const handleUpdateSuccessfullySubmit = (data: BookingQuantityFormData) => {
    setDecreasedQuantity(data);

    if (isOnlineOneDayBooking(booking)) {
      const adultQuantity = booking.adultQuantity - data.adultQuantity;
      const childQuantity = booking.childQuantity - data.childQuantity;

      const { totalAmount } = getDailyBookingTotalPrices(adultQuantity, childQuantity, booking.Ticket, booking.TicketBookingSchedule);

      setTotalAmount(totalAmount);
      setUpdateStep(FormStep.S20_REFUND_CONFIRM);

      return;
    }

    setUpdateStep(FormStep.S4_CONFIRM);
  };

  const onPaymentChange = () => {
    setUpdateStep(FormStep.S4_CONFIRM);
  };

  const onUpdateConfirmed = async () => {
    try {
      await updateDecreaseQuantityBooking(booking.id, decreasedQuantity);
      setUpdateStep(FormStep.S5_COMPLETED);
    } catch (error) {
      const message = getMessageFromError(error);
      setErrMsg(message);
      setUpdateStep(FormStep.S1_UPDATE);
    }
  };

  const needToCharge = Number(booking?.totalAmount) !== totalAmount && booking?.Ticket?.paymentType === PaymentType.Online;

  return (
    <div>
      <div className="xs:mx-5">
        {renderHeader(PeopleIcon, "予約人数の変更")}
        <div className="max-w-[600px] w-full mx-auto mt-[46px] xs:mb-6">
          {booking && (
            <AdminUpdateAfterCheckInBookingForm
              originalBookingQuantity={getDetailPeopleBooking(booking)}
              partialCheckouts={booking.PartialCheckout}
              ticket={booking.Ticket}
              onSuccessfullySubmit={handleUpdateSuccessfullySubmit}
              onBack={handleRedirectBookingManagement}
            />
          )}
        </div>
        <Error message={errMsg} className="mt-4" />
      </div>

      {updateStep === FormStep.S2_REVIEW && (
        <AdminUpdateBookingReviewDialog
          totalAdult={booking.adultQuantity - decreasedQuantity.adultQuantity}
          totalChild={booking.childQuantity - decreasedQuantity.childQuantity}
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
          onClose={handleRedirectBookingManagement}
        />
      )}

      {updateStep === FormStep.S10_CANNOT_UPDATE && (
        <NotificationDialog isOpen={true} message={"ご希望のご予約は変更できません。"} okLabel="戻る" onClose={() => setUpdateStep(FormStep.S1_UPDATE)} />
      )}
    </div>
  );
}

const renderHeader = (Icon: any, title: string, actions?: ReactNode) => {
  return (
    <div className="max-w-[856px] w-100 m-auto flex flex-col gap-[76px]">
      <div className="relative flex xsup:flex-row xs:flex-col items-center justify-between xs:!items-start gap-4 py-5 md:py-[14px] px-[16px] bar-bg-gray">
        <div className="flex items-center justify-center gap-x-5">
          <Image src={Icon} alt="icon" />
          <span className="text-2xl font-medium text-blue-color xs:text-base xs:leading-7 md:text-lg md:leading-6">{title}</span>
        </div>
        {actions}
        <div className="absolute w-full left-0 bottom-0 border-b-2 border-dotted border-[#979797]"></div>
      </div>
    </div>
  );
};
