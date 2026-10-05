import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import AdminLayout from "components/common/AdminLayout";
import CreateOrUpdateDisclaimers from "components/CreateOrUpdateDisclaimers";
import { ROLE } from "constants/common";
import { withAuthentication } from "libs/hoc/withAuthentication";
import Error from "components/common/Error";
import { fetchDisclaimers } from "services/api-client/admin/disclaimer.service";
import { Disclaimer } from "models/Entity";
import { NotificationType, showNotification } from "stores/reducers/notification";
import { MESSAGES } from "constants/messages";

function DisclaimerManagement() {
  const dispatch = useDispatch();

  const [errMsg, setErrMsg] = useState<string>();
  const [disclaimers, setDisclaimers] = useState<Disclaimer[]>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setErrMsg("");
      const disclaimers = await fetchDisclaimers();
      setDisclaimers(disclaimers);
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      setErrMsg(message);
    }
  };

  const transformDisclaimerDefaultValues = (disclaimers: Disclaimer[]) => {
    return disclaimers?.map((disclaimer) => {
      const options = disclaimer.DisclaimerOption.map((item) => ({ content: item.content }));
      return { title: disclaimer.title, options };
    });
  };

  const handleSaveSuccess = () => {
    dispatch(showNotification({ type: NotificationType.SUCCESS, message: MESSAGES.CREATE_DISCLAIMERS_SUCCESS }));
    fetchData();
  };

  return (
    <AdminLayout>
      <section className="flex flex-col justify-center ad-section-container">
        {/*Error*/}
        <Error message={errMsg} />

        {/* Disclaimer Form */}
        {disclaimers && <CreateOrUpdateDisclaimers disclaimers={transformDisclaimerDefaultValues(disclaimers)} onSaveSuccess={handleSaveSuccess} />}
      </section>
    </AdminLayout>
  );
}

export default withAuthentication(DisclaimerManagement, [ROLE.SUPER_ADMIN]);
