import { useRouter } from "next/router";

import AdminLayout from "components/common/AdminLayout";
import { ROLE } from "constants/common";
import { withAuthentication } from "libs/hoc/withAuthentication";
import AdminUpdateBookingFormBeforeCheckIn from "components/AdminUpdateBookingFormBeforeCheckIn";
import AdminUpdateBookingFormAfterCheckIn from "components/AdminUpdateBookingAfterCheckIn";

function BookingManagementDetail() {
  const router = useRouter();
  const isCheckingIn = router.query.checking_in === "true";

  return (
    <AdminLayout>
      <div className="pt-16 pb-24 ad-section-container admin">
        {isCheckingIn ? <AdminUpdateBookingFormAfterCheckIn /> : <AdminUpdateBookingFormBeforeCheckIn />}
      </div>
    </AdminLayout>
  );
}

export default withAuthentication(BookingManagementDetail, [ROLE.ADMIN, ROLE.SUPER_ADMIN]);
