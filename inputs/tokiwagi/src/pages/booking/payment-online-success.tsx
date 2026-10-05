import Layout from "components/common/Layout";
import { ROUTE } from "constants/route";
import BookingCompletion from "components/CreateBooking/BookingCompletion";

export default function PaymentOnlineSuccess() {
  return (
    <Layout breadcrumbData={[{ title: "予約・オンライン購入" }]}>
      <section className="relative mx-20 my-24 text-color xs:mx-4 xs:my-4 md:my-8 md:mx-8 pb-16">
        <div className="flex flex-col w-[824px] xs:w-full mx-auto md:w-full">
          <BookingCompletion
            redirectUrl={ROUTE.USER_HISTORY_BOOKINGS}
            heading="購入/予約完了"
            title="ご登録のメールアドレスにご予約内容のメールをお送りしました。"
            content="当日、店頭にてメールに記載のあるバーコードをご提示ください。当日のご来場お待ちしております。"
          />
        </div>
      </section>
    </Layout>
  );
}
