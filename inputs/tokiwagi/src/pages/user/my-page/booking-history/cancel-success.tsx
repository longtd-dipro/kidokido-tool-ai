import { useRouter } from "next/router";

import UserLayout from "components/common/UserLayout";
import { ROLE } from "constants/common";
import { withAuthentication } from "libs/hoc/withAuthentication";
import Button from "components/common/Buttons/Button";
import { ROUTE } from "constants/route";

function BookingHistory() {
  const router = useRouter();
  const bookingId = router.query.bookingId as string;

  const handleRedirect = () => {
    router.push(ROUTE.USER_HISTORY_BOOKINGS);
  };

  return (
    <UserLayout
      title="マイページ" breadcrumbItems={[
        { label: "トップ", href: ROUTE.INDEX },
        { label: "予約履歴", href: ROUTE.USER_HISTORY_BOOKINGS },
        {
          label: "予約詳細",
          href: ROUTE.USER_HISTORY_BOOKINGS_DETAIL.replace("[id]", bookingId),
        },
        {
          label: "予約キャンセル",
          href: ROUTE.USER_CANCEL_BOOKING_SUCCESS
        }
      ]}
    >
      <div className="container mx-auto">
        <h2 className="usr-title-line text-center xs:text-[30px] mx-auto mb-8 xs:mb-8 pt-8 font bold">予約をキャンセルしました</h2>
      </div>
      <section className="font-light text-center xs:mx-5">
        <p>キャンセル内容が反映されているかは、マイページ「予約履歴・変更・キャンセ</p>
        <p>ル」よりご確認いただけます。</p>
      </section>
      <div className="flex justify-center mt-8">
        <Button variant="contained" className="xs:w-[290px] md:h-12 md:!text-[18px] w-[403px] h-[64px]" onClick={handleRedirect}>
          マイページに戻る
        </Button>
      </div>
    </UserLayout>
  );
}

export default withAuthentication(BookingHistory, [ROLE.USER]);
