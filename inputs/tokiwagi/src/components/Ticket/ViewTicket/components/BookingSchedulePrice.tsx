import { TicketBookingSchedule } from "@prisma/client";

import { PRICE_UNIT_OPTIONS } from "constants/ticket";

import SmaregiQRCode from "./SmaregiQRCode";

interface Props {
  item: TicketBookingSchedule;
  isEnabledSmaregi?: boolean;
}

function findPriceUnitLabel(unit: string): string {
  return PRICE_UNIT_OPTIONS.find(({ value }) => value === unit).label;
}

function BookingSchedulePriceSmaregi({ item }: Props) {
  return (
    <div className="flex flex-col gap-6 font-bold w-2/3">
      <div className="min-w-[400px] mdonly:min-w-[200px]">
        <p>ベース利用時間</p>
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex gap-[13px] items-center">
            <span className="block min-w-[200px]">
              おとな: {+item.baseAdultPeriodPrice} 円 / {+item.baseAdultPeriod} {findPriceUnitLabel(item.baseAdultPeriodUnit)}
            </span>
            {item.baseAdultSmaregiQRCodeUrl && (
              <SmaregiQRCode src={item.baseAdultSmaregiQRCodeUrl} alt="Adult Smaregi QR Code" />
            )}
            {
              item.baseAdultObicCode &&
              <span className="block min-w-[200px]">OBIC: {item.baseAdultObicCode}</span>
            }
          </div>
          <div className="flex gap-[13px] items-center">
            <span className="block min-w-[200px]">
              子ども: {+item.baseChildPeriodPrice} 円 / {+item.baseChildPeriod} {findPriceUnitLabel(item.baseChildPeriodUnit)}
            </span>
            {item.baseChildSmaregiQRCodeUrl && (
              <SmaregiQRCode src={item.baseChildSmaregiQRCodeUrl} alt="Child Smaregi QR Code" />
            )}
            {item.baseChildObicCode &&
              <span className="block min-w-[200px]">OBIC: {item.baseChildObicCode}</span>
            }
          </div>
        </div>
      </div>
      {item.extendedChildPeriodUnit && (
        <div className="min-w-[400px] mdonly:min-w-[200px]">
          <p>延長金額時間</p>
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex gap-[13px] items-center">
              <span className="block min-w-[200px]">
                おとな: {+item.extendedAdultPeriodPrice} 円 / {+item.extendedAdultPeriod} {findPriceUnitLabel(item.extendedAdultPeriodUnit)}
              </span>
              {item.extendedAdultSmaregiQRCodeUrl && (
                <SmaregiQRCode src={item.extendedAdultSmaregiQRCodeUrl} alt="Adult Smaregi QR Code" />
              )}
              {item.extendedAdultObicCode &&
                <span className="block min-w-[200px]">OBIC: {item.extendedAdultObicCode}</span>
              }
            </div>
            <div className="flex gap-[13px] items-center">
              <span className="block min-w-[200px]">
                子ども: {+item.extendedChildPeriodPrice} 円 / {+item.extendedChildPeriod} {findPriceUnitLabel(item.extendedChildPeriodUnit)}
              </span>
              {item.extendedChildSmaregiQRCodeUrl && (
                <SmaregiQRCode src={item.extendedChildSmaregiQRCodeUrl} alt="Child Smaregi QR Code" />
              )}
              {item.extendedChildObicCode &&
                <span className="block min-w-[200px]">OBIC: {item.extendedChildObicCode}</span>
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingSchedulePrice({ item, isEnabledSmaregi }: Props) {
  return <BookingSchedulePriceSmaregi item={item} isEnabledSmaregi={isEnabledSmaregi} />;
}
