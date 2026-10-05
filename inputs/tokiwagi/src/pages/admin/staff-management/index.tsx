import { useState } from "react";
import { useSelector } from "react-redux";
import { useSession } from "next-auth/react";

import AdminCredentialsConfirmation from "components/AdminCredentialsConfirmation";
import StaffManagement from "components/StaffManagement";
import AdminLayout from "components/common/AdminLayout";
import { ROLE } from "constants/common";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { selectStaffManagement } from "stores/reducers/staff-management";

enum StaffManagementStep {
  S1_CONFIRM_ACCOUNT,
  S2_STAFF_MANAGEMENT,
}

function StaffManagementPage() {
  const { isSkipCredentialsStep } = useSelector(selectStaffManagement());
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === ROLE.SUPER_ADMIN;

  const [step, setStep] = useState<StaffManagementStep>(
    isSkipCredentialsStep || isSuperAdmin ? StaffManagementStep.S2_STAFF_MANAGEMENT : StaffManagementStep.S1_CONFIRM_ACCOUNT
  );

  const handleConfirmSuccess = () => {
    setStep(StaffManagementStep.S2_STAFF_MANAGEMENT);
  };

  return (
    <AdminLayout breadcrumb={[{ title: "" }]}>
      <section className="relative text-gray-600 body-font">
        {step === StaffManagementStep.S1_CONFIRM_ACCOUNT && <AdminCredentialsConfirmation onAccept={handleConfirmSuccess} />}
        {step === StaffManagementStep.S2_STAFF_MANAGEMENT && <StaffManagement />}
      </section>
    </AdminLayout>
  );
}

export default withAuthentication(StaffManagementPage, [ROLE.ADMIN, ROLE.SUPER_ADMIN]);
