import { useRouter } from "next/router";
import { useDispatch } from "react-redux";

import { NotificationType, showNotification } from "stores/reducers/notification";
import { MESSAGES } from "constants/messages";
import { ROUTE } from "constants/route";
import AdminLayout from "components/common/AdminLayout";
import CreateOrUpdateTenant from "components/Tenant/CreateOrUpdateTenant";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { ROLE } from "constants/common";

function CreateTenantPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSaveSuccess = () => {
    router.push(ROUTE.TENANT_MANAGEMENT);
    dispatch(showNotification({ type: NotificationType.SUCCESS, message: MESSAGES.CREATE_TENANT_SUCCESSFUL }));
  };

  const handleCancel = () => {
    router.push(ROUTE.TENANT_MANAGEMENT);
  };

  return (
    <AdminLayout heading="新規施設登録" breadcrumb={[{ title: "施設管理" }, { title: "新規施設登録" }]}>
      <section className="ad-section-container md:px-[22px] md:py-5 px-20 mdup:py-10">
        <CreateOrUpdateTenant onSuccess={handleSaveSuccess} onCancel={handleCancel} />
      </section>
    </AdminLayout>
  );
}
export default withAuthentication(CreateTenantPage, [ROLE.SUPER_ADMIN]);
