import { cloneDeep } from "lodash";
import moment from "moment";
import { useEffect } from "react";

import Button from "components/common/Buttons/Button";
import UserSiteLoadingButton from "components/common/Buttons/LoadingButton";
import { PaymentOfflineBookingFormData } from "components/CreateBooking/PaymentOfflineBookingForm";
import { JP_SHORT_DATE } from "constants/common";
import { Booking, Tenant, Ticket } from "models/Entity";
import { formatThousands } from "utils/common";
import { getTenantByCode } from "utils/tenant";
import { getTicketBookingSchedule, getTicketById } from "utils/ticket";
import { formatBasePeriod, formatExtendPeriod } from "utils/date-time";
import { generateUseInDayBookingsWithDiscount } from "utils/discount";
import { PriceItem } from "models/Discount";
import { isTimesLimitTicket } from "utils/booking";

import styles from "./PaymentOfflineBookingConfirmation.module.scss";

export interface Props {
  bookingPayload: PaymentOfflineBookingFormData;
  tenants: Tenant[];
  tickets: Ticket[];
  isSubmitting?: boolean;
  mainBookings?: Booking[];

  onConfirm: () => void;
  onBack: () => void;
}

export default function PaymentOfflineBookingConfirmation({ onConfirm, onBack, bookingPayload, tenants, tickets, isSubmitting, mainBookings }: Props) {
  const bookingDate = new Date();
  const withTicketBookings = cloneDeep(bookingPayload.bookings).map(booking => {
    const ticket = getTicketById(booking.ticketId, tickets);
    if (ticket) {
      booking["Ticket"] = ticket;
    }

    return booking;
  }).filter(booking => !!booking["Ticket"]);

  const { useInDayWithDiscountBookings, useInDayWithDiscountBookingsPriceListMap }
    = generateUseInDayBookingsWithDiscount(withTicketBookings, mainBookings);
  const allTotalAmountAfterDiscount = Math.max(0, Object.values(useInDayWithDiscountBookingsPriceListMap).reduce((total, priceList) => {
    total += priceList.totalAmountAfterDiscount;
    return total;
  }, 0));

  const handleConfirm = () => {
    onConfirm();
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const renderPlanAmount = ({ title, priceList }) => {
    return (
      <>
        <p className="w-1/3 text-xl font-medium xs:text-base">{title}</p>
        <div className="font-light xs:text-sm">
          {priceList.map((priceItem: PriceItem, index) => {
            return (
              <div key={index} className="grid grid-cols-2 font-light xs:text-sm">
                <div className="flex justify-between">
                  <span>
                    {priceItem.quantity}人&nbsp;x&nbsp;
                  </span>
                  <span>{formatThousands(priceItem.price).toString()}円</span>
                </div>

                <span>&nbsp;= {formatThousands(priceItem.amount)}円</span>
              </div>
            );
          })
          }
        </div>
      </>
    );
  };

  return (
    <div>
      <div className={styles.bookings}>
        <div className="mb-8">
          <h2 className="mx-auto usr-title-line">予約内容確認</h2>
        </div>
        {useInDayWithDiscountBookings.length ? (
          <div>
            {useInDayWithDiscountBookings.map((booking, i) => {
              const { adultPriceList, childPriceList, totalAmountAfterDiscount, ticketType } = useInDayWithDiscountBookingsPriceListMap[booking.id];
              const ticket = getTicketById(booking.ticketId, tickets);
              const bookingSchedule = getTicketBookingSchedule(bookingDate, ticket);
              const shouldShowNotice = +bookingSchedule?.extendedChildPeriod && +bookingSchedule?.extendedChildPeriodPrice;

              return (
                <div key={i} className={`${styles.card} mb-8`}>
                  <div className={`${styles.heading} text-center py-4 font-bold text-xl`}>
                    <p>{ticket?.name}</p>
                  </div>

                  <div className={`${styles.body} py-8 px-6 xs:py-4 xs:px-4`}>
                    <div className="flex">
                      <p className="w-1/3 text-xl font-medium xs:text-base">店舗</p>
                      <p className="font-light xs:text-sm work-break w-[31.25rem] xs:w-[12.5rem]">{getTenantByCode(bookingPayload.tenantCode, tenants).name}</p>
                    </div>
                    <div className="flex my-2">
                      <p className="w-1/3 text-xl font-medium xs:text-base">日時</p>
                      <p className="font-light xs:text-sm">
                        {moment(bookingDate).format(JP_SHORT_DATE)} ({moment(bookingDate).format("ddd")})
                      </p>
                    </div>
                    <div className="flex my-2">
                      <p className="w-1/3 text-xl font-medium xs:text-base">注意事項</p>
                      {shouldShowNotice ? (
                        <p className="flex-1 font-light xs:text-sm">
                          表示された金額は基本料金のみとなります。利用時間に応じて、延長料金が加算されます。入場後
                          {formatBasePeriod(+bookingSchedule.baseChildPeriod, bookingSchedule.baseChildPeriodUnit, ticket?.type)}
                          以上ご利用の場合、
                          {formatExtendPeriod(+bookingSchedule.extendedChildPeriod, bookingSchedule.extendedChildPeriodUnit)}
                          のご延長ごとに子ども1人当たり{formatThousands(+bookingSchedule.extendedChildPeriodPrice)}
                          円お支払いとなります。お手洗いのみ入退場可能です。
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className={`${styles.footer} px-6 py-8 xs:px-4`}>
                    <div className="flex">
                      {renderPlanAmount({ title: "子ども", priceList: childPriceList })}
                    </div>
                    <div className="flex my-2">
                      {!isTimesLimitTicket(ticketType) && renderPlanAmount({ title: "おとな", priceList: adultPriceList })}
                    </div>
                    <div className={`${styles.totalPrice} flex pt-2 xs:justify-between`}>
                      <p className="w-1/3 text-xl font-medium xs:text-base xs:w-1/2">支払予定金額</p>
                      <p className="font-light xs:text-sm">{formatThousands(totalAmountAfterDiscount)}円</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        <div className="flex justify-between mx-12 text-2xl font-bold xs:mx-0">
          <p>合計支払予定金額 </p>
          <p>{formatThousands(allTotalAmountAfterDiscount)}円</p>
        </div>
      </div>

      {/*Buttons*/}
      <div className="flex justify-center gap-24 mt-8 xs:flex-col-reverse xs:mx-0 xs:gap-0">
        <Button type="button" variant="outlined" onClick={onBack} className="!w-[200px] !h-[64px] xs:!w-full xs:!h-[48px] xs:!mt-4">
          戻る
        </Button>
        <UserSiteLoadingButton
          isLoading={isSubmitting}
          type="button"
          variant="contained"
          onClick={handleConfirm}
          className="!w-[200px] !h-[64px] xs:!w-full xs:!h-[48px]"
        >
          予約内容確定
        </UserSiteLoadingButton>
      </div>
    </div>
  );
}
