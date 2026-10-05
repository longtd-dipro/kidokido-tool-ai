import * as React from "react";
import { isNil } from "lodash";
import { TicketBookingSchedule, TicketDetail, TicketType } from "@prisma/client";

import QuantityAndAgesInfoFields from "components/CreateBooking/QuantityAndAgesInfoFields";
import { ChildAgeItem } from "models/Booking";
import { formatThousands } from "utils/common";
import { DiscountInfo } from "models/Discount";
import { isTimesLimitTicket } from "utils/booking";

import styles from "./index.module.scss";

export interface Props {
  control: any;
  fields: any;
  append: any;
  remove: any;
  errors: any;
  setValue: any;
  adultQuantity: any;
  childQuantity: any;
  bookingScheduleInfo?: TicketBookingSchedule;
  ticketDetail?: TicketDetail;
  totalAmount?: number;
  totalDiscount?: number;
  discountInfo?: DiscountInfo;
  ageOptions?: ChildAgeItem[];
  maxChildPerAdult?: number;
  ticketType?: TicketType;
  minAdultQuantity?: number;
  minChildQuantity?: number;
  headerText?: string;
  headerDescription?: string;
  shouldHideAdultQuantity?: boolean;
  showMonthlyChildAgeHintMessage?: boolean;
  showTotalAmountOnly?: boolean;
}

export default function BookingQuantityPriceAndTotalAmountInfo({
  control,
  fields,
  append,
  remove,
  errors,
  setValue,
  adultQuantity,
  childQuantity,
  bookingScheduleInfo,
  totalAmount,
  totalDiscount,
  discountInfo,
  ageOptions,
  maxChildPerAdult,
  ticketType,
  minAdultQuantity,
  minChildQuantity,
  headerText,
  headerDescription,
  shouldHideAdultQuantity,
  showMonthlyChildAgeHintMessage,
  showTotalAmountOnly,
}: Props) {
  const renderTicketBookingSchedulePrices = (discountInfo?: DiscountInfo) => {
    const { baseAdultPeriodPrice, baseChildPeriodPrice } = bookingScheduleInfo;
    const { adultDiscountDetails = {}, childDiscountDetails = {} } = discountInfo || {};

    const adultPrices = Array(adultQuantity).fill(0).map((item, index) => {
      return +baseAdultPeriodPrice - (adultDiscountDetails[index + 1] || 0);
    });

    const childPrices = Array(childQuantity).fill(0).map((item, index) => {
      return +baseChildPeriodPrice - (childDiscountDetails[index + 1] || 0);
    });

    return (
      <div className="flex justify-center gap-20 pb-6 mt-8 text-base font-light xs:flex-col xs:gap-4 xs:mt-4">
        <div>
          {adultPrices.map((adultPrice, index) => (
            <div className="flex justify-between gap-4 mb-1 xs:justify-start" key={index}>
              <p>おとな{index + 1}人目</p>
              <p>{formatThousands(adultPrice)}円</p>
            </div>
          ))}
        </div>
        <div>
          {childPrices.map((childPrice, index) => (
            <div className="flex justify-between gap-4 mb-1 xs:justify-start" key={index}>
              <p>子ども{index + 1}人目</p>
              <p>{formatThousands(childPrice)}円</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    isTimesLimitTicket(ticketType)
      ?
      (
        !isNil(totalAmount) &&
        <div className="mt-[32px] xs:mt-20">
          <div className="mb-[32px] border-b-[4px] border-dotted border-b-[#313131]" />
          <div className="flex w-full">
            <div className="grow text-[20px] leading-[24px] xs:text-lg">合計金額</div>
            <div className="text-[20px] leading-[28px] xs:text-base xs:font-bold">{formatThousands(totalAmount)}円</div>
          </div>
        </div>
      )
      :
      (
        <div className="mt-[64px] xs:mt-20">
          <div className={styles.wrapper}>
            <h2 className={`${styles.heading} py-4 text-center font-bold  text-2xl xs:text-xl md:text-2xl`}>
              {headerText ?? "支払予定金額"}
              {headerDescription && (
                <>
                  <br />
                  <span className="text-[14px] font-light mt-[8px] inline-flex leading-[16px] md:font-medium xs:max-w-[280px] xs:leading-6">
                    {headerDescription}
                  </span>
                </>
              )}
            </h2>
            {!showTotalAmountOnly && (
              <div className="flex justify-between px-12 py-4 xs:px-4">
                <QuantityAndAgesInfoFields
                  control={control}
                  fields={fields}
                  append={append}
                  remove={remove}
                  errors={errors}
                  setValue={setValue}
                  adultQuantity={adultQuantity}
                  childQuantity={childQuantity}
                  ageOptions={ageOptions}
                  maxChildPerAdult={maxChildPerAdult}
                  minAdultQuantity={minAdultQuantity}
                  minChildQuantity={minChildQuantity}
                  shouldHideAdultQuantity={shouldHideAdultQuantity}
                  showMonthlyChildAgeHintMessage={showMonthlyChildAgeHintMessage}
                />
              </div>
            )}
            {!isNil(totalAmount) && (
              <div className={`${styles.footer} px-12 xs:px-4`}>
                <div className="py-4 text-xl font-bold">
                  <div className="flex w-full mb-[10px]">
                    <div className="grow font-medium text-[18px] leading-[24px] xs:text-base">金額</div>
                    <div className="font-medium text-[18px] leading-[24px] xs:text-sm xs:font-light">{formatThousands(totalAmount + totalDiscount)}円</div>
                  </div>
                  <div className="flex w-full mb-[10px]">
                    <div className="grow font-medium text-[18px] leading-[24px] xs:text-base">割引金額</div>
                    <div className="font-medium text-[18px] leading-[24px] xs:text-sm xs:font-light">- {formatThousands(totalDiscount)}円</div>
                  </div>
                  <div className={`mb-[10px] ${styles.totalPrice}`} />
                  <div className="flex w-full">
                    <div className="grow text-[20px] leading-[24px] xs:text-lg">合計金額</div>
                    <div className="text-[20px] leading-[28px] xs:text-base xs:font-bold">{formatThousands(totalAmount)}円</div>
                  </div>
                </div>

                {/*Only for one day online ticket */}
                {ticketType != TicketType.Monthly && (
                  <div>{renderTicketBookingSchedulePrices(discountInfo)}</div>
                )}
              </div>
            )}
          </div >
        </div>
      )
  );
}
