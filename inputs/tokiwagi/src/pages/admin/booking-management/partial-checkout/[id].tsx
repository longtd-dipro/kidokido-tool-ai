import AdminLayout from "components/common/AdminLayout";
import { ROLE } from "constants/common";
import { withAuthentication } from "libs/hoc/withAuthentication";
import AdminPartialCheckoutForm from "components/AdminPartialCheckoutForm";

function AdminPartialCheckoutBooking() {
  return (
    <AdminLayout>
      <div className="pt-16 pb-24 ad-section-container admin">
        <AdminPartialCheckoutForm />
      </div>
    </AdminLayout>
  );
}

export default withAuthentication(AdminPartialCheckoutBooking, [ROLE.ADMIN, ROLE.SUPER_ADMIN]);
