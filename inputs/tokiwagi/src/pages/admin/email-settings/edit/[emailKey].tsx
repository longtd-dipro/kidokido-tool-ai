import { EmailSetting } from "@prisma/client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import AdminLayout from "components/common/AdminLayout";
import Error from "components/common/Error";
import CreateOrUpdateEmailSetting from "components/CreateOrUpdateEmailSetting";
import { ROUTE } from "constants/route";
import { fetchEmailSettingByKey } from "services/api-client/admin/email-setting.service";
import { NotificationType, showNotification } from "stores/reducers/notification";
import { MESSAGES } from "constants/messages";
import { getUrlQueryValue } from "utils/url";

export default function EditEmailSettingPage() {
  const router = useRouter();
  const [errMsg, setErrMsg] = useState<string>();
  const [emailSetting, setEmailSetting] = useState<EmailSetting>();

  const dispatch = useDispatch();
  const emailKey = router.query.emailKey as string;

  const page = getUrlQueryValue("page");

  useEffect(() => {
    emailKey && fetchData(emailKey);
  }, [emailKey]);

  const fetchData = async (emailKey: string) => {
    try {
      setErrMsg("");
      const emailSetting = await fetchEmailSettingByKey(emailKey);
      setEmailSetting(emailSetting);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const handleSaveSuccess = () => {
    router.push(ROUTE.EMAIL_SETTING_MANAGEMENT);
    dispatch(showNotification({ type: NotificationType.SUCCESS, message: MESSAGES.SETTING_EMAIL_SUCCESSFUL }));
  };

  const handleCancel = () => {
    router.push({ pathname: ROUTE.EMAIL_SETTING_MANAGEMENT, query: { page } });
  };

  return (
    <AdminLayout heading="自動返信メール設定" breadcrumb={[{ title: "" }]}>
      <section className="ad-section-container ad-table-wrapper mb-12">
        {/*Error*/}
        <Error message={errMsg} />

        {emailSetting && <CreateOrUpdateEmailSetting emailSetting={emailSetting} onSuccess={handleSaveSuccess} onCancel={handleCancel} />}
      </section>
    </AdminLayout>
  );
}
