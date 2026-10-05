import Layout from "components/common/Layout";
import TimesLimitBookingForm from "components/CreateBooking/TimesLimitBookingForm";

export default function BookingPage() {
  return (
    <Layout breadcrumbData={[{ title: "回数券購入" }]}>
      <section className="relative max-w-[825px] w-100 mx-auto mt-[75px] mb-28 md:mt-4">
        <TimesLimitBookingForm />
      </section>
    </Layout>
  );
}
