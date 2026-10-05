import { useRouter } from "next/router";
import { useDispatch } from "react-redux";

import AdminLayout from "components/common/AdminLayout";
import CreateOrUpdateNews from "components/CreateOrUpdateNews";
import { MESSAGES } from "constants/messages";
import { ROUTE } from "constants/route";
import { NotificationType, showNotification } from "stores/reducers/notification";

export default function CreateNewsPage() {
  const router = useRouter();

  const dispatch = useDispatch();

  const handleSaveSuccess = () => {
    router.push(ROUTE.NEWS_MANAGEMENT);
    dispatch(showNotification({ type: NotificationType.SUCCESS, message: MESSAGES.SETTING_EMAIL_SUCCESSFUL }));
  };

  const handleCancel = () => {
    router.push(ROUTE.NEWS_MANAGEMENT);
  };

  return (
    <AdminLayout heading="お知らせの設定" breadcrumb={[{ title: "" }]}>
      <section className="ad-section-container ad-table-wrapper mb-12">
        <CreateOrUpdateNews onSuccess={handleSaveSuccess} onCancel={handleCancel} />
      </section>
    </AdminLayout>
  );
}
