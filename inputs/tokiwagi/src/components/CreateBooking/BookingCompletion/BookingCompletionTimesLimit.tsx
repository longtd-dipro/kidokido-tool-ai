import { useRouter } from "next/router";
import { useEffect } from "react";

import Button from "components/common/Buttons/Button";
import { ROUTE } from "constants/route";
import { scrollToTop } from "utils/common";

type Props = {
  tenantCode: string;
};

export default function BookingCompletionTimesLimit({ tenantCode }: Props) {
  const router = useRouter();

  const handleRedirectToUseInDayBooking = () => {
    router.push({ pathname: ROUTE.USE_IN_DAY_BOOKING, query: { tenantCode } });
  };

  const handleRedirectUserTimesLimitBooking = () => {
    router.push(ROUTE.USER_TIMES_LIMIT_TICKET);
  };

  useEffect(() => {
    scrollToTop();
  }, []);

  return (
    <div className={"mx-auto"}>
      <h2 className="usr-title-line mx-auto xs:!text-[28px] mb-[32px]">購入完了</h2>
      <div className="px-16 xs:px-0 mb-[48px] text-center">
        <p className="mb-[28px] leading-[28px] font-medium text-lg">購入が完了しました。ご来場お待ちしております。</p>
        <p className="font-light leading-[28px] md:text-sm">
          ご利用の際は、当日利用の手続きが必要になります。
          <br />
          購入完了メールでお送りした回数券のバーコードと合わせて受付にてご提示ください。
          <br />
          ご来店をお待ちしております。
        </p>
      </div>

      <div className="flex xs:flex-col xs:gap-4 items-center justify-center gap-[48px] mb-4">
        <Button
          type="button"
          variant="contained"
          onClick={handleRedirectToUseInDayBooking}
          className="xs:w-[290px] md:h-12 md:!text-[18px] w-[360px] h-[64px] md:w-[300px]"
        >
          当日利用の手続きへ進む
        </Button>
        <Button
          type="button"
          variant="contained"
          onClick={handleRedirectUserTimesLimitBooking}
          className="xs:w-[290px] md:h-12 md:!text-[18px] w-[360px] h-[64px] md:w-[300px]"
        >
          購入履歴を確認する
        </Button>
      </div>
    </div>
  );
}
