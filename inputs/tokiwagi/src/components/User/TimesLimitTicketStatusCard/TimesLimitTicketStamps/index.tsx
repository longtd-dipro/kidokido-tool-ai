import React, { useMemo } from "react";
import Image from "next/legacy/image";
import { Booking } from "@prisma/client";
import moment from "moment";

import * as Icons from "statics/icons";

const iconMap: Record<number, any> = {
  1: Icons.TimesLimitStamp1,
  2: Icons.TimesLimitStamp2,
  3: Icons.TimesLimitStamp3,
  4: Icons.TimesLimitStamp4,
  5: Icons.TimesLimitStamp5,
  6: Icons.TimesLimitStamp6,
  7: Icons.TimesLimitStamp7,
  8: Icons.TimesLimitStamp8,
  9: Icons.TimesLimitStamp9,
  10: Icons.TimesLimitStamp10
};

const RANDOMISED_ICON_NUMBERS = [
  2,
  4,
  6,
  8,
  10,
  1,
  3,
  5,
  7,
  9,

  4,
  2,
  8,
  6,
  10,
  3,
  1,
  5,
  9,
  7,

  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,

  9,
  7,
  5,
  3,
  1,
  10,
  8,
  6,
  4,
  2
];

type TimesLimitTicketStampProps = {
  usageBookings: Partial<Booking>[];
  limitTimes: number;
  extraTimes: number;
  usageTimes: number;
};
type Stamp = {
  isUsed: boolean;
  iconNumber?: number; 
  usageDate?: string;
}
const UsedStamp = ({ icon, date }: { icon: any; date: string }) => (
  <div className="opacity-30 w-[100px] h-[100px] rounded-[50%] border-[3px] border-[#0068B7] grid place-items-center relative">
    <Image src={icon} width={68} height={72} alt="stamp" />
    <div className="absolute bottom-[-10px] px-[10px] py-[2px] bg-white font-semibold text-[#0068B7]">
      {date}
    </div>
  </div>
);

const UnusedStamp = () => (
  <div className="w-[100px] h-[100px] rounded-[50%] border-[2px] border-[#FFA806] grid place-items-center bg-white">
    <div className="font-semibold">未利用</div>
  </div>
);

function TimesLimitTicketStamps({ usageBookings, limitTimes, extraTimes, usageTimes }: TimesLimitTicketStampProps) {
  const getUsageBookingIconNumber = (index: number): number => {
    return RANDOMISED_ICON_NUMBERS[index % RANDOMISED_ICON_NUMBERS.length];
  };

  const transformedStamps = useMemo(() => {
    const totalTimes = limitTimes + (extraTimes || 0);
    const stamps: Stamp[] = [];
    for (let i = 0; i < totalTimes; i += 1) {
      const usageBooking = usageBookings?.[i];
      if (!usageBooking) {
        stamps.push({
          isUsed: false
        });
      } else {
        const iconNumber = getUsageBookingIconNumber(i);
        stamps.push({
          isUsed: true,
          iconNumber,
          usageDate: moment(usageBooking.createdAt).format("MM/DD"),
        });
      }
    }
    return stamps;
  }, [usageBookings, limitTimes, extraTimes, usageTimes]);

  return (
    <div className="mt-[20px] px-[108px] md:px-[60px] xs:px-[30px]">
      <div className="grid grid-cols-5 md:grid-cols-3 xs:grid-cols-2 gap-[24px]">
        {
          transformedStamps.map((stamp: Stamp, idx) => 
            stamp.isUsed ? (
              <UsedStamp key={idx} icon={iconMap[stamp.iconNumber!]} date={stamp.usageDate!} />
            ) : (
              <UnusedStamp key={idx} />
            )
          )
        }
      </div>
    </div>
  );
}

export default TimesLimitTicketStamps;
