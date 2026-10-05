import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import Error from "components/common/Error";
import ViewTenant from "components/Tenant/ViewTenant";
import { Tenant } from "models/Entity";
import { fetchTenantByCode } from "services/api-client/admin/tenant.service";
import AdminLayout from "components/common/AdminLayout";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { ROLE } from "constants/common";
import { getUrlQueryValue } from "utils/url";

function ViewTenantPage() {
  const router = useRouter();
  const [errMsg, setErrMsg] = useState<string>();
  const [tenant, setTenant] = useState<Tenant>();

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

  return (
    <AdminLayout heading="施設詳細" breadcrumb={[{ title: "施設管理" }, { title: "施設詳細" }]}>
      <section className="ad-section-container md:mb-44 pt-[45px] pb-[36px]">
        {/*Error*/}
        <Error message={errMsg} />
        {tenant && <ViewTenant tenant={tenant} filters={filters} page={page} />}
      </section>
    </AdminLayout>
  );
}

export default withAuthentication(ViewTenantPage, [ROLE.SUPER_ADMIN]);
