import { GMOSetting } from "@prisma/client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import ViewGMOSetting from "components/GMOSetting/ViewGMOSetting";
import AdminLayout from "components/common/AdminLayout";
import Error from "components/common/Error";
import { ROLE } from "constants/common";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { fetchGMOSettingById } from "services/api-client/admin/gmo-setting.service";
import { getUrlQueryValue } from "utils/url";

function ViewGMOSettingPage() {
  const router = useRouter();
  const [errMsg, setErrMsg] = useState<string>();
  const [gmoSetting, setGMOSetting] = useState<GMOSetting>();

  const id = +router.query.id;

  const page = getUrlQueryValue("page");

  useEffect(() => {
    id && fetchData(id);
  }, [id]);

  const fetchData = async (id: number) => {
    try {
      setErrMsg("");
      const gmoSetting = await fetchGMOSettingById(id);
      setGMOSetting(gmoSetting);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  return (
    <AdminLayout heading="GMOアカウント管理" breadcrumb={[{ title: "施設管理" }, { title: "GMOアカウント管理/アカウント詳細" }]}>
      <section className="ad-section-container md:mb-44 pt-[45px] pb-[36px]">
        {/*Error*/}
        <Error message={errMsg} />
        {gmoSetting && <ViewGMOSetting gmoSetting={gmoSetting} page={page} />}
      </section>
    </AdminLayout>
  );
}

export default withAuthentication(ViewGMOSettingPage, [ROLE.SUPER_ADMIN]);
