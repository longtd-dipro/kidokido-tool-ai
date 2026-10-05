import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { NotificationType, showNotification } from "stores/reducers/notification";
import { MESSAGES } from "constants/messages";
import Error from "components/common/Error";
import CreateOrUpdateTenant from "components/Tenant/CreateOrUpdateTenant";
import { ROUTE } from "constants/route";
import { Tenant } from "models/Entity";
import { fetchTenantByCode } from "services/api-client/admin/tenant.service";
import AdminLayout from "components/common/AdminLayout";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { ROLE } from "constants/common";
import { getUrlQueryValue } from "utils/url";

function EditTenantPage() {
  const router = useRouter();
  const [errMsg, setErrMsg] = useState<string>();
  const [tenant, setTenant] = useState<Tenant>();

  const dispatch = useDispatch();
  const tenantCode = router.query.tenantCode as string;

  const filters = getUrlQueryValue("filters");
  const page = getUrlQueryValue("page");

  useEffect(() => {
    tenantCode && fetchData(tenantCode);
  }, [tenantCode]);

  const fetchData = async (tenantCode: string) => {
    try {
      setErrMsg("");
      const tenant = await fetchTenantByCode(tenantCode);
      setTenant(tenant);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const handleSaveSuccess = () => {
    router.push(ROUTE.TENANT_MANAGEMENT);
    dispatch(showNotification({ type: NotificationType.SUCCESS, message: MESSAGES.EDIT_TENANT_SUCCESSFUL }));
  };

  const handleCancel = () => {
    router.push({ pathname: ROUTE.TENANT_MANAGEMENT, query: { filters, page } });
  };

  return (
    <AdminLayout heading="施設編集" breadcrumb={[{ title: "施設管理" }, { title: "施設編集" }]}>
      <section className="ad-section-container md:px-[22px] md:py-5 px-20 mdup:py-10">
        {/*Error*/}
        <Error message={errMsg} />
        {tenant && <CreateOrUpdateTenant tenant={tenant} onSuccess={handleSaveSuccess} onCancel={handleCancel} />}
      </section>
    </AdminLayout>
  );
}
export default withAuthentication(EditTenantPage, [ROLE.SUPER_ADMIN]);
