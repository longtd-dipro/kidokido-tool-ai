import { useRouter } from "next/router";
import { useDispatch } from "react-redux";

import CreateOrUpdateGMOSetting from "components/GMOSetting/CreateOrUpdateGMOSetting";
import AdminLayout from "components/common/AdminLayout";
import { MESSAGES } from "constants/messages";
import { ROUTE } from "constants/route";
import { NotificationType, showNotification } from "stores/reducers/notification";

export default function CreateGMOAccountPage() {
  const router = useRouter();

  const dispatch = useDispatch();

  const handleSaveSuccess = () => {
    router.push(ROUTE.GMO_SETTINGS);
    dispatch(showNotification({ type: NotificationType.SUCCESS, message: MESSAGES.CREATE_GMO_SETTING_SUCCESSFUL }));
  };

  const handleCancel = () => {
    router.push(ROUTE.GMO_SETTINGS);
  };

  return (
    <AdminLayout heading="新規GMOアカウントの設定" breadcrumb={[{ title: "" }]}>
      <section className="ad-section-container ad-table-wrapper mb-12">
        <CreateOrUpdateGMOSetting onSuccess={handleSaveSuccess} onCancel={handleCancel} />
      </section>
    </AdminLayout>
  );
}
