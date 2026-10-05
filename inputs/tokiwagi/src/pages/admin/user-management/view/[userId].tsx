import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";

import ViewUser from "components/User/ViewUser";
import AdminLayout from "components/common/AdminLayout";
import Error from "components/common/Error";
import { ROLE } from "constants/common";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { User } from "models/Entity";
import { fetchUserById } from "services/api-client/admin/user.service";
import { getUrlQueryValue } from "utils/url";
import { selectStaffManagement } from "stores/reducers/staff-management";
import { confirmCredentials, confirmPassword } from "utils/ui";
import { ROUTE } from "constants/route";

function ViewUserPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: session } = useSession();

  const [errMsg, setErrMsg] = useState<string>();
  const [user, setUser] = useState<User>();
  const [shouldConfirmCredentials, setShouldConfirmCredentials] = useState<boolean>(false);

  const userId = +router.query.userId;

  const filters = getUrlQueryValue("filters");
  const page = getUrlQueryValue("page");
  const staffOrAdminId = getUrlQueryValue("staffOrAdminId");

  const { staffOrAdmin: loggedStaffOrAdmin } = useSelector(selectStaffManagement());

  useEffect(() => {
    if (loggedStaffOrAdmin && staffOrAdminId !== loggedStaffOrAdmin.id.toString()) {
      setShouldConfirmCredentials(true);
      showConfirmPopup();
    }
    userId && fetchData(userId);
  }, [userId]);

  const showConfirmPopup = async () => {
    try {
      const isOriginalAdminId = session?.user?.id?.toString() === staffOrAdminId;
      isOriginalAdminId ? await confirmPassword(dispatch) : await confirmCredentials(dispatch, staffOrAdminId);
      setShouldConfirmCredentials(false);
    } catch (e) {
      router.push(ROUTE.USER_MANAGEMENT);
    }
  };

  const fetchData = async (userId: number) => {
    try {
      setErrMsg("");
      const user = await fetchUserById(userId);
      setUser(user);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  return (
    <AdminLayout>
      <section className="relative text-gray-600 body-font">
        {/*Error*/}
        <Error message={errMsg} />

        {shouldConfirmCredentials ? (
          <div className="min-h-screen"></div>
        ) : (
          <>{user && <ViewUser user={user} filters={filters} page={page} staffOrAdminId={staffOrAdminId} />}</>
        )}
      </section>
    </AdminLayout>
  );
}
export default withAuthentication(ViewUserPage, [ROLE.ADMIN, ROLE.SUPER_ADMIN]);
