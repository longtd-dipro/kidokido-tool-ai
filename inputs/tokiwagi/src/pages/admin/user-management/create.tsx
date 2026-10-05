import { useRouter } from "next/router";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Card } from "@mui/material";

import { NotificationType, showNotification } from "stores/reducers/notification";
import { MESSAGES } from "constants/messages";
import AdminLayout from "components/common/AdminLayout";
import CreateOrUpdateUser from "components/User/CreateOrUpdateUser";
import { ROUTE } from "constants/route";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { ROLE } from "constants/common";

function CreateUserPage() {
  useEffect(() => {
    if (window.pageYOffset > 0) window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const dispatch = useDispatch();
  const router = useRouter();

  const handleSaveSuccess = () => {
    router.push(ROUTE.USER_MANAGEMENT);
    dispatch(showNotification({ type: NotificationType.SUCCESS, message: MESSAGES.CREATE_USER_SUCCESSFUL }));
  };

  const handleCancel = () => {
    router.push(ROUTE.USER_MANAGEMENT);
  };

  return (
    <AdminLayout breadcrumb={[{ title: "" }]}>
      <Card className="border-t-2 border-x-2 border-[#D9D9D9]">
        <section className="relative mx-32 my-10 text-gray-600 body-font">
          <CreateOrUpdateUser onSuccess={handleSaveSuccess} onCancel={handleCancel} />
        </section>
      </Card>
    </AdminLayout>
  );
}
export default withAuthentication(CreateUserPage, [ROLE.ADMIN, ROLE.SUPER_ADMIN]);
