import { useRouter } from "next/router";

import Layout from "components/common/Layout";
import BookingCompletion from "components/CreateBooking/BookingCompletion";
import useWindowSize from "libs/hooks/useWindowSize";

export default function PaymentOnlineFailure() {
  const router = useRouter();
  const error = router.query.error as string;
  const redirectUrl = router.query.redirectUrl as string;

  const { isFromTabletSize } = useWindowSize();
  const secondContents = isFromTabletSize ? [
    "繰り返し失敗する場合は、別のカードをご利用いただくか、お使いのクレジットカード会社に",
    "お問い合わせください。"] : ["繰り返し失敗する場合は、別のカードをご利用いただくか、お使いのクレジットカード会社にお問い合わせください。"];

  return (
    <Layout breadcrumbData={[{ title: "予約・オンライン購入" }]}>
      <section className="relative mx-20 my-24 text-color xs:mx-4 xs:my-4 md:my-8 md:mx-8 pb-16">
        <div className="flex flex-col w-[824px] xs:w-full mx-auto md:w-full">
          <BookingCompletion
            redirectUrl={redirectUrl}
            heading="購入/予約に失敗しました"
            title="誠に恐れ入りますが、3Dセキュアの認証により購入に失敗しました。"
            content={["再度お手続きをお願いいたします。", ...secondContents]}
            buttonText="再度購入/予約を行う"
            error={error}
          />
        </div>
      </section>
    </Layout>
  );
}
