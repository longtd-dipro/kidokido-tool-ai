import { useEffect, useState } from "react";

import AverageBookingTimesColumnChart from "components/Chart/AverageBookingTimesColumnChart";
import AverageStayDurationLineChart from "components/Chart/AverageStayDurationLineChart";
import TotalBookingsWithTicketColumnChart from "components/Chart/TotalBookingsWithTicketColumnChart";
import TotalBookingsWithTimesColumnChart from "components/Chart/TotalBookingsWithTimesColumnChart";
import TotalNewAndOldBookingUsersColumnChart from "components/Chart/TotalNewAndOldBookingUsersColumnChart";
import AdminLayout from "components/common/AdminLayout";
import { ROLE } from "constants/common";
import { withAuthentication } from "libs/hoc/withAuthentication";
import styles from "styles/dashboard.module.scss";
import { fetchTenants } from "services/api-client/admin/tenant.service";
import Error from "components/common/Error";
import { Tenant } from "models/Entity";

function DashboardManagement() {
  const [errMsg, setErrMsg] = useState<string>();
  const [tenants, setTenants] = useState<Tenant[]>();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setErrMsg("");
      const tenants = await fetchTenants();
      setTenants(tenants);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  return (
    <AdminLayout>
      <>
        {/*Error*/}
        <Error message={errMsg} className="mb-6" />

        <div>
          <div className={`${styles["highcharts-container"]} grid`}>
            <div className="shadow-md bg-white rounded-3xl px-10 mb-10 w-full">
              <div className="mb-10">
                <h2 className="text-xl font-semibold highcharts-container mt-10">各店舗平均滞在時間</h2>
                <div className="mdonly:w-[610px]">{tenants && <AverageStayDurationLineChart tenants={tenants} />}</div>
              </div>
            </div>
          </div>
          <div className={`${styles["highcharts-container"]} grid grid-cols-2 gap-x-5`}>
            <div className="shadow-md bg-white rounded-3xl px-10 mb-10 w-full">
              <div className="mb-10">
                <h2 className="text-xl font-semibold highcharts-container mt-10 mb-5">平均来店回数</h2>
                {tenants && <AverageBookingTimesColumnChart tenants={tenants} />}
              </div>
            </div>
            <div className="shadow-md bg-white rounded-3xl px-10 mb-10 w-full">
              <div className="mb-10">
                <h2 className="text-xl font-semibold highcharts-container mt-10 mb-5">施設ごと来店回数該当人数</h2>
                <TotalBookingsWithTimesColumnChart />
              </div>
            </div>
          </div>

          <div className={`${styles["highcharts-container"]} grid`}>
            <div className="shadow-md bg-white rounded-3xl px-10 mb-10 w-full">
              <div className="mb-10">
                <h2 className="text-xl font-semibold highcharts-container mt-10">施設毎の新規利用者数とリピート利用者数推移</h2>
                <TotalNewAndOldBookingUsersColumnChart />
              </div>
            </div>
          </div>

          <div className={`${styles["highcharts-container"]} grid`}>
            <div className="shadow-md bg-white rounded-3xl px-10 mb-10 w-full">
              <div className="mb-10">
                <h2 className="text-xl font-semibold highcharts-container mt-10">商品毎の利用者数</h2>
                <TotalBookingsWithTicketColumnChart />
              </div>
            </div>
          </div>
        </div>
      </>
    </AdminLayout>
  );
}
export default withAuthentication(DashboardManagement, [ROLE.SUPER_ADMIN]);
