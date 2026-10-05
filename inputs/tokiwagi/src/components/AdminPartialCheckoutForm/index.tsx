import Image from "next/legacy/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import PeopleIcon from "statics/images/user/people-icon-white.svg";
import Error from "components/common/Error";
import PartialCheckoutQuantityForm from "components/PartialCheckoutQuantityForm";
import ConfirmationDialogUser from "components/User/ConfirmationDialogUser";
import { ROLE } from "constants/common";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { Booking } from "models/Entity";
import { requestPartialCheckout } from "services/api-client/user.service";
import { getMessageFromError } from "utils/common";
import { BookingQuantityFormData } from "models/Booking";
import { countTotalCheckedInPeople, getCheckingInPeopleBooking } from "utils/booking";
import { ROUTE } from "constants/route";
import { fetchBookings } from "services/api-client/booking.service";
import { MESSAGES } from "constants/messages";
import ErrorDialog from "components/common/ErrorDialog";
import { fetchBookingById } from "services/api-client/admin/booking.service";
import NotificationDialog from "components/User/NotificationDialog";
import { getUrlQueryValue } from "utils/url";

function AdminPartialCheckOutForm() {
  const router = useRouter();

  const [booking, setBooking] = useState<Booking>();
  const [sameBarCodeBookings, setSameBarCodeBookings] = useState<Booking[]>();
  const [bookingQuantityPayload, setBookingQuantityPayload] = useState<BookingQuantityFormData>();

  const [errMsg, setErrMsg] = useState<string>("");
  const [isShowConfirmationDialog, setIsShowConfirmationDialog] = useState<boolean>(false);
  const [isShowErrMsgDialog, setIsShowErrMsgDialog] = useState<boolean>(false);
  const [errDialogMsg, setErrDialogMsg] = useState<string>("");
  const [isShowCompletedDialog, setIsShowCompletedDialog] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const filters = getUrlQueryValue("filters");
  const page = getUrlQueryValue("page");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setErrMsg(errMsg);
      const id = Number(router.query.id);
      const booking = await fetchBookingById(id);
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
      setErrMsg(errMsg);
      setIsSubmitting(true);
      await requestPartialCheckout(booking.id, data);
      setIsShowCompletedDialog(true);
    } catch (err) {
      const message = getMessageFromError(err);
      setErrMsg(message);
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

    sendPartialCheckoutRequest(bookingQuantityPayload);
  };

  const checkValidPartialCheckoutRequest = () => {
    const totalCheckedInPeople = countTotalCheckedInPeople(sameBarCodeBookings);
    const totalPeopleRequestRecheckOut = bookingQuantityPayload.adultQuantity + bookingQuantityPayload.childQuantity;

    return totalCheckedInPeople !== totalPeopleRequestRecheckOut;
  };

  const handleRedirectBookingManagement = () => {
    router.push({ pathname: ROUTE.BOOKING_MANAGEMENT_LIST, query: { filters, page } });
  };

  return (
    <div>
      <div className="xs:mx-5">
        {renderHeader(PeopleIcon, "入場者の途中退場を行う")}
        <div className="max-w-[600px] w-full mx-auto mt-[46px] xs:mb-6">
          {booking && (
            <PartialCheckoutQuantityForm
              originalBookingQuantity={getCheckingInPeopleBooking(booking)}
              ticket={booking.Ticket}
              onSuccessfullySubmit={handlePartialCheckoutSuccessfullySubmit}
              onBack={handleRedirectBookingManagement}
            />
          )}
          <Error message={errMsg} className="mt-4 text-center" />
        </div>
      </div>

      {isShowConfirmationDialog && (
        <ConfirmationDialogUser
          onAccept={handleAcceptConfirmation}
          onDismiss={hideConfirmationDialog}
          dismissText="戻る"
          acceptText="確定"
          message="変更を確定します"
          loading={isSubmitting}
        />
      )}

      {isShowErrMsgDialog && <ErrorDialog message={errDialogMsg} text="戻る" onDismiss={() => setIsShowErrMsgDialog(false)} />}

      {isShowCompletedDialog && (
        <NotificationDialog
          hiddenCloseIcon={true}
          isOpen={true}
          width={856}
          message={
            <div className="text-center pt-[12px]">
              <p className="text-[32px] leading-[48px] font-medium mb-[32px]">入場者の途中退場が完了しました</p>
              <p className="text-[16px] leading-[24px] font-light">
                変更が反映されているかマイページよりご確認ください。
                <br />
                お連れの方がまだ場内にいらっしゃる状態で、途中退場した方が再入場する際にはお客様側か
                <br />
                ら再入場手続きをしていただく必要があります。
                <br />
                必要に応じて案内をお願いいたします。
              </p>
            </div>
          }
          okLabel="予約一覧へ"
          onClose={handleRedirectBookingManagement}
        />
      )}
    </div>
  );
}

const renderHeader = (Icon: any, title: string, actions?: React.ReactNode) => {
  return (
    <div className="max-w-[856px] w-100 m-auto flex flex-col gap-[76px]">
      <div className="relative flex xsup:flex-row xs:flex-col items-center justify-between xs:!items-start gap-4 py-5 md:py-[14px] px-[16px] bg-dark-blue">
        <div className="flex items-center justify-center gap-x-5">
          <Image src={Icon} alt="PeopleIcon" />
          <span className="text-2xl font-medium text-white-color xs:text-base xs:leading-7 md:text-lg md:leading-6">{title}</span>
        </div>
        {actions}
        <div className="absolute w-full left-0 bottom-0 border-b-2 border-dotted border-[#979797]"></div>
      </div>
    </div>
  );
};

export default withAuthentication(AdminPartialCheckOutForm, [ROLE.ADMIN, ROLE.SUPER_ADMIN]);
