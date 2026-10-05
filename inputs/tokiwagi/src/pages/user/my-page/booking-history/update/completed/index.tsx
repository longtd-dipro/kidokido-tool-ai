import { useRouter } from "next/router";

import { withAuthentication } from "libs/hoc/withAuthentication";
import { ROLE } from "constants/common";
import Button from "components/common/Buttons/Button";
import UserLayout from "components/common/UserLayout";
import { ROUTE } from "constants/route";

function BookingDetail() {
  const router = useRouter();
  const bookingId = router.query.bookingId as string;
  return (
    <UserLayout
      breadcrumbItems={[
        { label: "トップ", href: ROUTE.INDEX },
        { label: "予約履歴", href: ROUTE.USER_HISTORY_BOOKINGS },
        {
          label: "予約詳細",
          href: ROUTE.USER_HISTORY_BOOKINGS_DETAIL.replace("[id]", String(bookingId)),
        },
        {
          label: "予約変更",
          href: "",
        },
      ]}
    >
      <div className="mdonly:min-h-[420px]">
        <h2 className="usr-title-line mx-auto xs:mb-9 mb-12">予約の内容を変更しました</h2>
        <p className="text-[16px] leading-[24px] font-light text-center pb-[48px] xs:mx-4">
          変更内容が反映されているかマイページよりご確認ください。 <br />
          またご利用の際は、初回予約時にお送りしたメールのバーコードを店頭でご提示ください。
          <br />
          引き続きボーネルンドのあそび場をお楽しみください。
        </p>
        <div className="text-center">
          <Button href={ROUTE.USER_HISTORY_BOOKINGS} variant="contained" className="xs:w-[290px] md:h-12 md:!text-[18px] w-[300px] h-[64px]">
            マイページに戻る
          </Button>
        </div>
      </div>
    </UserLayout>
  );
}

export default withAuthentication(BookingDetail, [ROLE.USER]);
