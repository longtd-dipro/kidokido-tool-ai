import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import Layout from "components/common/Layout";
import PaymentOfflineBookingForm from "components/CreateBooking/PaymentOfflineBookingForm";
import { SESSION_STATUS } from "constants/common";

export default function BookingPage() {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const tenantCode = (router.query?.tenantCode ? router.query.tenantCode : undefined) as string;
  const parentBookingId = router.query?.parentBookingId ? Number(router.query?.parentBookingId) : undefined;
  const mainBookingId = router.query?.mainBookingId ? Number(router.query?.mainBookingId) : undefined;
  const allowInactiveTenantCode = router.query?.allowInactiveTenantCode === "true";

  return (
    <Layout breadcrumbData={[{ title: "当日利用" }]}>
      <section className="mx-20 my-20 mt-20 xs:mx-5 xs:my-4 md:my-8 md:mx-8 pb-16">
        {router.isReady && sessionStatus != SESSION_STATUS.LOADING
          && <PaymentOfflineBookingForm 
            tenantCode={tenantCode} 
            parentBookingId={parentBookingId} 
            mainBookingId={mainBookingId} 
            allowInactiveTenantCode={allowInactiveTenantCode} 
          />}
      </section>
    </Layout>
  );
}
