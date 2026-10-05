import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "@mui/material";
import { useSession } from "next-auth/react";

import AdminLayout from "components/common/AdminLayout";
import Error from "components/common/Error";
import CreateOrUpdateUser from "components/User/CreateOrUpdateUser";
import { ROUTE } from "constants/route";
import { User } from "models/Entity";
import { fetchUserById } from "services/api-client/admin/user.service";
import { NotificationType, showNotification } from "stores/reducers/notification";
import { MESSAGES } from "constants/messages";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { ROLE } from "constants/common";
import { getUrlQueryValue } from "utils/url";
import { selectStaffManagement } from "stores/reducers/staff-management";
import { confirmCredentials, confirmPassword } from "utils/ui";

function EditUserPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session } = useSession();

  const [errMsg, setErrMsg] = useState<string>();
  const [user, setUser] = useState<User>();
  const [shouldConfirmCredentials, setShouldConfirmCredentials] = useState<boolean>(false);

  const userId = +router.query.userId;
  const filters = getUrlQueryValue("filters");
  const page = getUrlQueryValue("page");
  const staffId = getUrlQueryValue("staffId");
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  });

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

  const handleSaveSuccess = () => {
    redirectToUserManagement();
    dispatch(showNotification({ type: NotificationType.SUCCESS, message: MESSAGES.CREATE_USER_SUCCESSFUL }));
  };

  const handleCancel = () => {
    redirectToUserManagement();
  };

  const redirectToUserManagement = () => {
    router.push({
      pathname: ROUTE.USER_MANAGEMENT,
      query: {
        filters,
        page,
        ...(staffOrAdminId && { staffOrAdminId }),
      },
    });
  };

  return (
    <AdminLayout breadcrumb={[{ title: "" }]}>
      <Card className="border-t-2 border-x-2 border-[#D9D9D9]">
        <section className="relative mx-32 my-10 text-gray-600 body-font">
          {/*Error*/}
          <Error message={errMsg} />

          {shouldConfirmCredentials ? (
            <div className="min-h-screen"></div>
          ) : (
            <>{user && <CreateOrUpdateUser user={user} isStaffMode={!!staffId} onSuccess={handleSaveSuccess} onCancel={handleCancel} />}</>
          )}
        </section>
      </Card>
    </AdminLayout>
  );
}
export default withAuthentication(EditUserPage, [ROLE.ADMIN, ROLE.SUPER_ADMIN]);
