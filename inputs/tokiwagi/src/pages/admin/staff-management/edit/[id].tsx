import { Staff } from "@prisma/client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import CreateOrUpdateStaff from "components/StaffManagement/CreateOrUpdateStaff";
import AdminLayout from "components/common/AdminLayout";
import Error from "components/common/Error";
import { ROLE } from "constants/common";
import { MESSAGES } from "constants/messages";
import { ROUTE } from "constants/route";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { fetchStaffById } from "services/api-client/admin/staff.service";
import { NotificationType, showNotification } from "stores/reducers/notification";
import { getUrlQueryValue } from "utils/url";
import { skipCredentialsStep } from "stores/reducers/staff-management";

function EditStaffPage() {
  const [errMsg, setErrMsg] = useState<string>();
  const [staff, setStaff] = useState<Staff>();

  const router = useRouter();
  const dispatch = useDispatch();
  const staffId = router.query.id as string;
  const filters = getUrlQueryValue("filters");
  const page = getUrlQueryValue("page");

  useEffect(() => {
    staffId && fetchData(staffId);
  }, [staffId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  });

  const fetchData = async (staffId: string) => {
    try {
      setErrMsg("");
      const staff = await fetchStaffById(staffId);
      setStaff(staff);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const handleSaveSuccess = () => {
    dispatch(skipCredentialsStep());
    dispatch(
      showNotification({
        type: NotificationType.SUCCESS,
        message: MESSAGES.UPDATE_STAFF_SUCCESSFUL,
      })
    );
    router.push({ pathname: ROUTE.STAFF_MANAGEMENT, query: { filters, page } });
  };

  const handleError = (message: string) => {
    dispatch(showNotification({ type: NotificationType.ERROR, message }));
  };

  const handleCancel = () => {
    dispatch(skipCredentialsStep());
    router.push({ pathname: ROUTE.STAFF_MANAGEMENT, query: { filters, page } });
  };

  return (
    <AdminLayout breadcrumb={[{ title: "" }]}>
      <section className="ad-section-container mb-12 mt-16">
        {/*Error*/}
        <Error message={errMsg} />

        {staff && <CreateOrUpdateStaff staff={staff} onSuccess={handleSaveSuccess} onCancel={handleCancel} onError={handleError} />}
      </section>
    </AdminLayout>
  );
}
export default withAuthentication(EditStaffPage, [ROLE.ADMIN, ROLE.SUPER_ADMIN]);
