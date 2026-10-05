import { useRouter } from "next/router";

import Layout from "components/common/Layout";
import PaymentOnlineBookingForm from "components/CreateBooking/PaymentOnlineBookingForm";
import { getBookingDaysFromQuery } from "constants/booking";

export default function BookingPage() {
  const router = useRouter();

  const tenantCode = router.query.tenantCode as string;
  const bookingDate = router.query.date as string;
  const ticketId = +router.query.ticketId;
  const allowInactiveTenantCode = router.query.allowInactiveTenantCode === "true";
  const bookingDays = getBookingDaysFromQuery(router.query);
  return (
    <Layout breadcrumbData={[{ title: "予約・オンライン購入" }]}>
      <section className="relative mx-20 my-24 text-color xs:mx-4 xs:my-4 md:my-8 md:mx-8 pb-16">
        <PaymentOnlineBookingForm
          tenantCode={tenantCode}
          bookingDate={bookingDate}
          ticketId={ticketId}
          allowInactiveTenantCode={allowInactiveTenantCode}
          bookingDays={bookingDays}
        />
      </section>
    </Layout>
  );
}
