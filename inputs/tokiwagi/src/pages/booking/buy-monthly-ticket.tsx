import Layout from "components/common/Layout";
import MonthlyBookingForm from "components/CreateBooking/MonthlyBookingForm";

export default function BookingPage() {
  return (
    <Layout breadcrumbData={[{ title: "フリーパス購入" }]}>
      <section className="relative max-w-[825px] w-100 mx-auto mt-[75px] mb-28 md:mt-4">
        <MonthlyBookingForm />
      </section>
    </Layout>
  );
}
