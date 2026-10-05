import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/legacy/image";

import Vector from "statics/images/vector-bottom.svg";
import Layout from "components/common/Layout";
import TenantVacancies from "components/TenantVacancies";
import { fetchTenants } from "services/api-client/tenant.service";
import Spinner from "components/common/Spinner";
import { fetchBookingVacanciesStatus } from "services/api-client/booking.service";
import InDayVacancy from "components/InDayVacancies";
import Error from "components/common/Error";
import { Tenant } from "models/Entity";
import { getBookingDaysFromQuery } from "constants/booking";

export default function VacancyStatus() {
  const [errMsg, setErrMsg] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tenantVacancies, setTenantVacancies] = useState<any>({});
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const useOneDayTicketRef = useRef(null);
  const useMonthlyTicketRef = useRef(null);
  const router = useRouter();
  const bookingDays = getBookingDaysFromQuery(router.query);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingDays]);

  const fetchData = async () => {
    try {
      setErrMsg("");
      setIsLoading(true);
      const tenants = await fetchTenants();
      setTenants(tenants);
      const vacancies = await fetchBookingVacanciesStatus({
        tenantCodes: tenants.map((item) => item.code),
        sortTicketsBy: "displayOrder.asc",
        bookingDays,
      });
      setTenantVacancies(vacancies);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <section className="relative mx-20 my-24 text-gray-600 body-font text-color xs:mx-4 xs:my-4">
        <h2 className="usr-title-line vacancy-heading mx-auto xs:text-xl xs:font-medium xs:mb-0 ">
          待ち時間/販売状況
        </h2>
        {/* Button */}
        <div className="hidden xs:flex xs:pt-[1.875rem] xs:gap-[17px] xs:pb-6 xs:justify-center">
          {/* Button Scroll In Day Vacancy Status */}
          <div
            onClick={() =>
              useOneDayTicketRef.current.scrollIntoView({ behavior: "smooth" })
            }
            className="p-3 text-lg font-bold leading-7 text-[#0068B7] bg-white w-[9.938rem] rounded-[10px] border-2 border-[#0068B7] text-center"
          >
            <h1 className="mb-2">
              当日利用 <br /> 待ち時間の確認
            </h1>
            <Image src={Vector} alt="Vector" />
          </div>

          {/* Button Scroll One Day Vacancy Status */}
          <div
            onClick={() =>
              useMonthlyTicketRef.current.scrollIntoView({ behavior: "smooth" })
            }
            className="p-3 text-lg font-bold leading-7 text-[#0068B7] bg-white w-[9.938rem] rounded-[10px] border-2 border-[#0068B7] text-center"
          >
            <h1 className="mb-2">
              事前予約 <br /> 販売状況の確認
            </h1>
            <Image src={Vector} alt="Vector" />
          </div>
        </div>
        <div className="relative z-10 flex flex-col w-[824px] md:w-full  xs:w-full mx-auto mt-18 xs:mb-8">
          {isLoading && (
            <div className="flex justify-center mt-10">
              <Spinner />
            </div>
          )}

          {/* Booking In Day  */}
          {!isLoading && (
            <InDayVacancy
              useOneDayTicketRef={useOneDayTicketRef}
              inDay={tenantVacancies?.inDayTenantStatus}
              tenants={tenants}
            />
          )}

          {/* Booking One Day  */}
          {!isLoading && (
            <div className="mt-2">
              <TenantVacancies
                useMonthlyTicketRef={useMonthlyTicketRef}
                oneDay={tenantVacancies?.oneDayOnlineTenantStatus}
                bookingDays={bookingDays}
              />
            </div>
          )}

          {/* Error */}
          <Error message={errMsg} />
        </div>
      </section>
    </Layout>
  );
}
