import { useRouter } from "next/router";

import Layout from "components/common/Layout";
import BookingCompletionMonthly from "components/CreateBooking/BookingCompletion/BookingCompletionMonthly";

export default function PaymentOnlineMonthlyTicketSuccess() {
  const router = useRouter();
  const tenantCode = router.query.tenantCode as string;

  return (
    <Layout breadcrumbData={[{ title: "フリーパス購入" }]}>
      <section className="relative max-w-[825px] w-100 mx-auto mt-[75px] mb-28 md:mt-4">
        <div className="md:px-5 mx-auto">
          <BookingCompletionMonthly tenantCode={tenantCode} />
        </div>
      </section>
    </Layout>
  );
}
