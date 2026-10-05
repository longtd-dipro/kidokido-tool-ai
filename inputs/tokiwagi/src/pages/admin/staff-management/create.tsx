import { useRouter } from "next/router";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import CreateOrUpdateStaff from "components/StaffManagement/CreateOrUpdateStaff";
import AdminLayout from "components/common/AdminLayout";
import { ROLE } from "constants/common";
import { MESSAGES } from "constants/messages";
import { ROUTE } from "constants/route";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { NotificationType, showNotification } from "stores/reducers/notification";
import { skipCredentialsStep } from "stores/reducers/staff-management";

function CreateStaffPage() {
  useEffect(() => {
    if (window.pageYOffset > 0) window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const dispatch = useDispatch();
  const router = useRouter();

  const handleSaveSuccess = () => {
    dispatch(skipCredentialsStep());
    dispatch(showNotification({ type: NotificationType.SUCCESS, message: MESSAGES.CREATE_STAFF_SUCCESSFUL }));
    router.push(ROUTE.STAFF_MANAGEMENT);
  };

  const handleError = (message: string) => {
    dispatch(showNotification({ type: NotificationType.ERROR, message }));
  };

  const handleCancel = () => {
    dispatch(skipCredentialsStep());
    router.push(ROUTE.STAFF_MANAGEMENT);
  };

  return (
    <AdminLayout breadcrumb={[{ title: "従業員管理" }, { title: "新規従業員登録" }]}>
      <section className="ad-section-container mb-12 mt-16">
        <CreateOrUpdateStaff onSuccess={handleSaveSuccess} onCancel={handleCancel} onError={handleError} />
      </section>
    </AdminLayout>
  );
}
export default withAuthentication(CreateStaffPage, [ROLE.ADMIN, ROLE.SUPER_ADMIN]);
