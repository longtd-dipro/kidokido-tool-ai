import { PaymentType, TicketType } from "@prisma/client";
import moment from "moment";
import { useEffect } from "react";

import Button from "components/common/Buttons/Button";
import UserSiteLoadingButton from "components/common/Buttons/LoadingButton";
import { JP_SHORT_DATE } from "constants/common";
import { BookingPayload } from "models/Booking";
import { Tenant, Ticket } from "models/Entity";
import { formatThousands } from "utils/common";
import { getTenantByCode } from "utils/tenant";
import { getAgeLabel, getTicketById } from "utils/ticket";
import { isTimesLimitTicket } from "utils/booking";

import styles from "./index.module.scss";

export interface Props {
  ticketType?: TicketType;
  bookingPayload: BookingPayload;
  tenants: Tenant[];
  tickets: Ticket[];

  totalAdultPrice?: number;
  totalChildPrice?: number;

  isSubmitting?: boolean;
  shouldRenderChildFirst?: boolean;

  onConfirm: () => void;
  onBack: () => void;
}

export default function BookingConfirmation({
  bookingPayload,
  tenants,
  tickets,
  onConfirm,
  onBack,
  ticketType,
  totalAdultPrice,
  totalChildPrice,
  isSubmitting,
  shouldRenderChildFirst = false,
}: Props) {
  const { tenantCode, ticketId, date, totalAmount, adultQuantity, childAges } = bookingPayload;

  const tenantName = getTenantByCode(tenantCode, tenants).name;
  const { name: ticketName, paymentType, TicketDetail } = getTicketById(ticketId, tickets);
  const isTimesLimitTicketType = isTimesLimitTicket(ticketType);
  const handleConfirm = () => {
    onConfirm();
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <div>
      <div className={styles.card}>
        <div className="py-[40px] px-[25px] border-b-[3px] border-dotted border-[#979797] flex flex-col gap-[16px] ">
          <div className="flex items-center">
            <p className="w-1/3 text-[20px] leading-[28px] font-medium xs:text-base xs:w-1/2 shrink-0">店舗</p>
            <p className={`${styles.oneLine} font-light xs:text-sm`}>{tenantName}</p>
          </div>
          <div className="flex items-center my-2">
            <p className="w-1/3 text-[20px] leading-[28px] font-medium xs:text-base xs:w-1/2 shrink-0">商品</p>
            <p className={`${styles.oneLine} font-light xs:text-sm`}>{ticketName}</p>
          </div>
          {([TicketType.Monthly, TicketType.DailyTimesLimit, TicketType.HourlyTimesLimit] as string[]).includes(ticketType) ? (
            <>
              <div className="flex items-center">
                <p className="w-1/3 text-[20px] leading-[28px] font-medium xs:text-base xs:w-1/2">購入日時</p>
                <p className="font-light xs:text-sm">
                  {moment().format(JP_SHORT_DATE)} ({moment().format("ddd")})
                </p>
              </div>
              <div className="flex items-center">
                <p className="w-1/3 text-[20px] leading-[28px] font-medium xs:text-base xs:w-1/2">利用開始日</p>
                <p className="font-light xs:text-sm">
                  {moment(date).format(JP_SHORT_DATE)} ({moment(date).format("ddd")})
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center">
              <p className="w-1/3 text-[20px] leading-[28px] font-medium xs:text-base xs:w-1/2">日時</p>
              <p className="font-light xs:text-sm">
                {moment(date).format(JP_SHORT_DATE)} ({moment(date).format("ddd")})
              </p>
            </div>
          )}
          {isTimesLimitTicketType && (
            <>
              <div className="flex items-center">
                <p className="w-1/3 text-[20px] leading-[28px] font-medium xs:text-base xs:w-1/2">利用可能回数</p>
                <p className="font-light xs:text-sm">
                  {TicketDetail.limitTimes + (TicketDetail.extraTimes || 0)}回
                </p>
              </div>
            </>
          )}
        </div>

        {
          !isTimesLimitTicketType && 
          <div className={`${styles.info} py-[40px] px-[25px] flex flex-col gap-[16px]`}>
            <div className={`${shouldRenderChildFirst ? "order-2" : null} flex items-center`}>
              <p className="w-1/3 text-[20px] leading-[28px] font-medium xs:text-base xs:w-1/2">おとなの人数</p>
              <p className="font-light xs:text-sm">{adultQuantity}人</p>
            </div>
            <div className={`${shouldRenderChildFirst ? "order-1" : null} flex items-center my-2`}>
              <p className="w-1/3 text-[20px] leading-[28px] font-medium xs:text-base xs:w-1/2">子どもの人数・年齢</p>
              <div className="font-light xs:text-sm">
                {childAges.map((age, i) => (
                  <p key={i}>1人 x {getAgeLabel(age)}</p>
                ))}
              </div>
            </div>
          </div>
        }

        <div className="py-[40px]  px-[25px] flex flex-col gap-[16px]">
          <div className="flex items-center xs:items-start">
            <p className="w-1/3 text-[20px] leading-[28px] font-medium xs:text-base xs:w-1/2">支払金額</p>
            {ticketType === TicketType.Monthly ? (
              <p className="font-light xs:text-sm">
                {totalAdultPrice && totalAdultPrice !== 0 ? (
                  <div>
                    {bookingPayload.adultQuantity}枚目 (おとな)：{formatThousands(totalAdultPrice)}円 &nbsp;
                  </div>
                ) : (
                  ""
                )}
                <div className="xsup:hidden h-0">
                  <br />
                </div>
                {bookingPayload.childQuantity}枚目 (子ども)：{formatThousands(totalChildPrice)}円
              </p>
            ) : (
              <p className="font-light xs:text-sm">{formatThousands(totalAmount)}円</p>
            )}
          </div>
          <div className="flex items-center my-2">
            <p className="w-1/3 text-[20px] leading-[28px] font-medium xs:text-base xs:w-1/2">支払方法</p>
            <p className="font-light xs:text-sm">{paymentType === PaymentType.Online ? "クレジットカード" : "退場時に精算"}</p>
          </div>
        </div>
        {ticketType === TicketType.Monthly && (
          <div className={styles.footer}>
            <div className="py-[20px] px-[25px]">
              <div className="flex w-full font-bold">
                <div className="grow text-[20px] leading-[24px]">合計金額</div>
                <div className="text-[20px] leading-[28px] xs:text-base">{formatThousands(totalAmount)}円</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {ticketType !== TicketType.Monthly && (
        <p className="my-8 text-lg font-medium xs:text-sm xs:font-light text-center xs:text-left">
          ※予約確定を押すと、クレジットカードの決済も完了となります。
        </p>
      )}

      {/*Buttons*/}
      <div className="flex justify-center xs:items-center mb-4 gap-[200px] md:gap-[168px] mt-[56px] xs:flex-col-reverse xs:gap-2 xs:mx-8 md:mb-10">
        <Button
          type="button"
          variant="outlined"
          onClick={onBack}
          className="w-[200px] h-[64px] md:!text-lg xs:h-[48px] xs:!mt-4 md:h-[48px]
         xs:w-[290px] md:w-[260px] xs:shadow-[0px 1px 3px 0px rgb(53_48_46 / 21%)] !xs:border-none"
        >
          戻る
        </Button>
        <UserSiteLoadingButton
          isLoading={isSubmitting}
          type="button"
          onClick={handleConfirm}
          className="w-[200px] h-[64px] xs:h-[48px] md:!text-lg md:h-[48px] xs:w-[290px] md:w-[260px] !xs:border-none"
          variant="contained"
        >
          <span className="md:text-lg xs:text-lg">購入内容確定</span>
        </UserSiteLoadingButton>
      </div>
    </div>
  );
}
