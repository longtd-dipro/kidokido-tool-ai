import { useFormContext } from "react-hook-form";

import { AGE_UNIT_OPTIONS } from "constants/ticket";
import { formatThousands } from "utils/common";
import { getAgeLabel } from "utils/ticket";
import { calcSumByField } from "utils/array";
import { generateUseInDayBookingsWithDiscount } from "utils/discount";
import { PriceItem } from "models/Discount";
import { Booking } from "models/Entity";
import { isTimesLimitTicket } from "utils/booking";

import styles from "./TotalBookingInfo.module.scss";

export interface Props {
  maximumChildQuantity?: number;
  hasMainBookingId?: boolean;
  mainBookings?: Booking[];
}

export default function TotalBookingInfo({ maximumChildQuantity, hasMainBookingId, mainBookings }: Props) {
  const { watch } = useFormContext();

  const [monthlyBookings, bookings, timesLimitBookings] = watch(["monthlyBookings", "bookings", "timesLimitBookings"]);

  const totalAdultQuantity = calcSumByField([...monthlyBookings, ...bookings, ...timesLimitBookings], "adultQuantity");
  const totalChildQuantity = calcSumByField([...monthlyBookings, ...bookings, ...timesLimitBookings], "childQuantity");
  const totalChildAges = [...monthlyBookings, ...bookings, ...timesLimitBookings]
    .reduce((total, booking) => (booking?.childAges ? [...total, ...booking.childAges] : []), []);

  const totalBookings = [...monthlyBookings, ...bookings, ...timesLimitBookings];
  const { useInDayWithDiscountBookings, useInDayWithDiscountBookingsPriceListMap } = generateUseInDayBookingsWithDiscount(totalBookings, mainBookings);
  const totalOriginalAmount = Object.values(useInDayWithDiscountBookingsPriceListMap).reduce((total, priceList) => {
    total += priceList.totalOriginalAmount;
    return total;
  }, 0);

  const totalDiscount = Object.values(useInDayWithDiscountBookingsPriceListMap).reduce((total, priceList) => {
    total += priceList.totalDiscount;
    return total;
  }, 0);

  const totalAmountAfterDiscount = Math.max(0, totalOriginalAmount - totalDiscount);

  const isReachedOverMaximumChildQuantity = totalChildQuantity > maximumChildQuantity;

  // Functions
  const renderTotalPlanAmount = () => {
    if (!useInDayWithDiscountBookings.length) {
      return null;
    }

    return (
      <div className={`${styles.detailPrices} py-4 px-2 xs:px-0 md:px-0`}>
        {useInDayWithDiscountBookings.map((booking, index) => {
          const { Ticket: ticket } = booking;
          if (!ticket) {
            return null;
          }

          return (
            <div key={index} className={index !== useInDayWithDiscountBookings.length - 1 ? "mb-6" : ""}>
              <div className="text-xl font-bold break-all">{`${ticket.name}`}</div>
              <div className="flex flex-col justify-between gap-0 my-2 xs:flex-col">
                {renderPlanAmount({ title: "子ども", priceList: useInDayWithDiscountBookingsPriceListMap[booking.id].childPriceList })}
                {
                  !isTimesLimitTicket(useInDayWithDiscountBookingsPriceListMap[booking.id].ticketType) && 
                    renderPlanAmount({ title: "おとな", priceList: useInDayWithDiscountBookingsPriceListMap[booking.id].adultPriceList })
                }
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPlanAmount = ({ title, priceList }) => {
    return (
      <div className="flex">
        <p className="w-1/3 font-medium xs:text-base">{title}</p>
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
      </div>
    );
  };

  // Rendering
  if (!totalAdultQuantity && !totalChildQuantity) {
    return null;
  }

  return (
    <div className={`${styles.card}`}>
      <div className={`${styles.title} py-4`}>
        <p className="text-center text-xl font-medium">支払予定金額</p>
      </div>
      <div className="px-16 py-4 xs:px-4">
        <div className="flex justify-between mb-4">
          <p className="text-xl font-medium md:text-base">おとな人数</p>
          <p>{totalAdultQuantity}名</p>
        </div>
        <div className="flex justify-between mb-4">
          <p className="text-xl font-medium md:text-base">子ども人数</p>
          <p>{totalChildQuantity}名</p>
        </div>
        <div className="flex justify-between mb-4">
          <p className="text-xl font-medium md:text-base">子どもの年齢</p>
          <div className="text-right ">
            {totalChildAges.map((item: any, i) => {
              return (
                <div key={i} className="flex items-center justify-between mb-4 gap-4">
                  <p className="text-xl font-medium xs:text-base md:text-base">{i + 1}人目</p>
                  {!isNaN(item) ? (
                    <p key={i} className={styles.childAgeItem}>
                      {getAgeLabel(item) || ""}
                    </p>
                  ) : (
                    <p key={i} className={styles.childAgeItem}>
                      {item.age ? `${item.age} ${AGE_UNIT_OPTIONS.find(({ value }) => value === item.unit)?.label}` : ""}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {isReachedOverMaximumChildQuantity && !hasMainBookingId && (
          <div className="text-red-color">
            ※子どもの規定人数を超えております。子どもの人数は{maximumChildQuantity}名まで追加可能です。これ以上を追加したい場合は先におとなを追加してください。
          </div>
        )}
      </div>
      <div className={`${styles.footer} px-14 md:px-8 xs:px-4`}>
        <div className={`${styles.totalPrice} flex justify-between pt-4 text-xl xs:text-lg`}>
          <p>金額</p>
          <p>{formatThousands(totalOriginalAmount)}円</p>
        </div>
        <div className={`${styles.totalPrice} flex justify-between pt-2 text-xl xs:text-lg`}>
          <p>割引金額</p>
          <p>- {formatThousands(totalDiscount)}円</p>
        </div>
        <div className={`${styles.totalPrice} flex justify-between py-2 text-xl font-bold xs:text-lg`}>
          <p>合計金額</p>
          <p>{formatThousands(totalAmountAfterDiscount)}円</p>
        </div>
        {renderTotalPlanAmount()}
      </div>
    </div>
  );
}
