import Image from "next/legacy/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import Error from "components/common/Error";
import UserLayout from "components/common/UserLayout";
import PartialCheckoutQuantityForm from "components/PartialCheckoutQuantityForm";
import ConfirmationDialogUser from "components/User/ConfirmationDialogUser";
import { ROLE } from "constants/common";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { Booking } from "models/Entity";
import { fetchHistoryDetail, requestPartialCheckout } from "services/api-client/user.service";
import PeopleIcon from "statics/images/user/people-icon.svg";
import { getMessageFromError } from "utils/common";
import { BookingQuantityFormData } from "models/Booking";
import { countTotalCheckedInPeople, getCheckingInPeopleBooking } from "utils/booking";
import { ROUTE } from "constants/route";
import { fetchBookings } from "services/api-client/booking.service";
import { MESSAGES } from "constants/messages";
import ErrorDialog from "components/common/ErrorDialog";

function PartialCheckOutBooking() {
  const router = useRouter();

  const [booking, setBooking] = useState<Booking>();
  const [sameBarCodeBookings, setSameBarCodeBookings] = useState<Booking[]>();
  const [bookingQuantityPayload, setBookingQuantityPayload] = useState<BookingQuantityFormData>();

  const [errMsg, setErrMsg] = useState<string>("");
  const [isShowConfirmationDialog, setIsShowConfirmationDialog] = useState<boolean>(false);
  const [isShowErrMsgDialog, setIsShowErrMsgDialog] = useState<boolean>(false);
  const [errDialogMsg, setErrDialogMsg] = useState<string>("");
  const [isShowNoticeDialog, setIsShowNoticeDialog] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setErrMsg(errMsg);
      const id = Number(router.query.id);
      const booking = await fetchHistoryDetail(id);
      setBooking(booking);
      const sameBarcodeBookings = await fetchBookings({ barCode: booking?.barCode });
      setSameBarCodeBookings(sameBarcodeBookings);
    } catch (err) {
      const message = getMessageFromError(err);
      setErrMsg(message);
    }
  };

  const handlePartialCheckoutSuccessfullySubmit = (data: BookingQuantityFormData) => {
    setBookingQuantityPayload(data);
    showConfirmationDialog();
  };

  const showConfirmationDialog = () => {
    setIsShowConfirmationDialog(true);
  };

  const hideConfirmationDialog = () => {
    setIsShowConfirmationDialog(false);
  };

  const sendPartialCheckoutRequest = async (data: BookingQuantityFormData) => {
    try {
      setIsSubmitting(true);
      setErrMsg(errMsg);
      await requestPartialCheckout(booking.id, data);
      router.push({ pathname: ROUTE.USER_PARTIAL_CHECKOUT_SUCCESS, query: { booking_id: booking.id } });
    } catch (err) {
      const message = getMessageFromError(err);
      setErrMsg(message);
    } finally {
      hideNoticePopup();
      setIsSubmitting(false);
    }
  };

  const handleAcceptConfirmation = () => {
    hideConfirmationDialog();
    const isValid = checkValidPartialCheckoutRequest();
    if (!isValid) {
      setErrDialogMsg(MESSAGES.INVALID_PARTIAL_CHECKOUT);
      setIsShowErrMsgDialog(true);
      return;
    }

    showNoticePopup();
  };

  const showNoticePopup = () => {
    setIsShowNoticeDialog(true);
  };

  const hideNoticePopup = () => {
    setIsShowNoticeDialog(false);
  };

  const handleAcceptNotice = () => {
    sendPartialCheckoutRequest(bookingQuantityPayload);
  };

  const checkValidPartialCheckoutRequest = () => {
    const totalCheckedInPeople = countTotalCheckedInPeople(sameBarCodeBookings);
    const totalPeopleRequestRecheckOut = bookingQuantityPayload.adultQuantity + bookingQuantityPayload.childQuantity;

    return totalCheckedInPeople !== totalPeopleRequestRecheckOut;
  };

  const handleRedirectToBookingDetail = () => {
    router.push(ROUTE.USER_HISTORY_BOOKINGS_DETAIL.replace("[id]", String(booking.id)));
  };

  return (
    <UserLayout
      heading="退場者を選択"
      title="マイページ"
      breadcrumbItems={[
        { label: "トップ", href: ROUTE.INDEX },
        { label: "予約履歴", href: ROUTE.USER_HISTORY_BOOKINGS },
        {
          label: "予約詳細",
          href: ROUTE.USER_HISTORY_BOOKINGS_DETAIL.replace("[id]", String(router.query.id)),
        },
        {
          label: "予約変更",
          href: "",
        },
      ]}
    >
      <div className="xs:mx-5">
        {renderHeader(PeopleIcon, "人数を減らす")}
        <div className="max-w-[600px] w-full mx-auto mt-[46px] xs:mb-6">
          {booking && (
            <PartialCheckoutQuantityForm
              originalBookingQuantity={getCheckingInPeopleBooking(booking)}
              ticket={booking.Ticket}
              onSuccessfullySubmit={handlePartialCheckoutSuccessfullySubmit}
              onBack={handleRedirectToBookingDetail}
            />
          )}
        </div>
        <Error message={errMsg} className="mt-4 text-center" />
      </div>

      {isShowConfirmationDialog && (
        <ConfirmationDialogUser
          onAccept={handleAcceptConfirmation}
          onDismiss={hideConfirmationDialog}
          dismissText="戻る"
          acceptText="確定"
          message="変更を確定します"
        />
      )}

      {isShowNoticeDialog && (
        <ConfirmationDialogUser
          loading={isSubmitting}
          onAccept={handleAcceptNotice}
          acceptText="次へ"
          message="<p>途中退場を受け付けました。</p><p>精算はご退場時に一括のお支払いとなります。</p>"
        />
      )}

      {isShowErrMsgDialog && <ErrorDialog message={errDialogMsg} text="戻る" onDismiss={() => setIsShowErrMsgDialog(false)} />}
    </UserLayout>
  );
}

const renderHeader = (Icon: any, title: string, actions?: React.ReactNode) => {
  return (
    <div className="relative flex xsup:flex-row xs:flex-col items-center justify-between xs:!items-start gap-4 py-5 md:py-[14px] px-[16px] bar-bg-gray">
      <div className="flex items-center justify-center gap-x-5">
        <Image src={Icon} alt="PeopleIcon" />
        <span className="text-2xl font-medium text-blue-color xs:text-base xs:leading-7 md:text-lg md:leading-6">{title}</span>
      </div>
      {actions}
      <div className="absolute w-full left-0 bottom-0 border-b-2 border-dotted border-[#979797]"></div>
    </div>
  );
};

export default withAuthentication(PartialCheckOutBooking, [ROLE.USER]);
