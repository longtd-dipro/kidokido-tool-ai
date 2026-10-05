import { GMOSetting } from "@prisma/client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import CreateOrUpdateGMOSetting from "components/GMOSetting/CreateOrUpdateGMOSetting";
import AdminLayout from "components/common/AdminLayout";
import Error from "components/common/Error";
import { MESSAGES } from "constants/messages";
import { ROUTE } from "constants/route";
import { fetchGMOSettingById } from "services/api-client/admin/gmo-setting.service";
import { NotificationType, showNotification } from "stores/reducers/notification";
import { getUrlQueryValue } from "utils/url";

export default function EditGMOSettingPage() {
  const router = useRouter();
  const [errMsg, setErrMsg] = useState<string>();
  const [gmoSetting, setGMOSetting] = useState<GMOSetting>();

  const dispatch = useDispatch();

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

  const handleSaveSuccess = () => {
    router.push(ROUTE.GMO_SETTINGS);
    dispatch(showNotification({ type: NotificationType.SUCCESS, message: MESSAGES.EDIT_GMO_SETTING_SUCCESSFUL }));
  };

  const handleCancel = () => {
    router.push({ pathname: ROUTE.GMO_SETTINGS, query: { page } });
  };

  return (
    <AdminLayout heading="GMOアカウントの編集" breadcrumb={[{ title: "" }]}>
      <section className="ad-section-container ad-table-wrapper mb-12">
        {/*Error*/}
        <Error message={errMsg} />

        {gmoSetting && <CreateOrUpdateGMOSetting gmoSetting={gmoSetting} onSuccess={handleSaveSuccess} onCancel={handleCancel} />}
      </section>
    </AdminLayout>
  );
}
