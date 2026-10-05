import { Pagination } from "@mui/material";
import { Tenant } from "@prisma/client";
import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

import Error from "components/common/Error";
import TenantTopPage from "components/TopPage/TenantTopPage";
import { useCachedPagination } from "libs/hooks/useCachedPagination";
import { getMessageFromError } from "utils/common";
import { fetchTenantFavorites, fetchTotalTenantFavorites } from "services/api-client/user.service";
import { fetchBookingVacanciesStatus } from "services/api-client/booking.service";
import Spinner from "components/common/Spinner";
import UserLayout from "components/common/UserLayout";
import { ROUTE } from "constants/route";
import { TenantVacancy } from "models/Vacancy";

const DEFAULT_LIMIT = 5;

export default function FavoriteTenants() {
  const { data: session } = useSession();

  const [errMsg, setErrMsg] = useState<string>();
  const [favoriteTenants, setFavoriteTenants] = useState<{ tenantCode: string; Tenant: Tenant }[]>([]);
  const [totalTenants, setTotalTenants] = useState<number>(1);
  const [tenantVacancies, setTenantVacancies] = useState<{ [tenantCode: string]: TenantVacancy }>(null);

  const isInitialFetchRef = useRef(true);

  const pagination = useCachedPagination({});

  const fetchTotal = async () => {
    try {
      const totalData = await fetchTotalTenantFavorites();
      setTotalTenants(totalData.total);
    } catch (error) {
      const message = getMessageFromError(error);
      setErrMsg(message);
    }
  };

  const fetchFavoriteTenants = async () => {
    try {
      const response = await fetchTenantFavorites({
        page: pagination.page ?? 1,
        limit: DEFAULT_LIMIT,
      });

      setFavoriteTenants(response);
    } catch (err) {
      const message = getMessageFromError(err);
      setErrMsg(message);
    }
  };

  const fetchBookingVacanciesData = async () => {
    if (!favoriteTenants?.length) return;

    try {
      const vacancies = await fetchBookingVacanciesStatus({
        tenantCodes: favoriteTenants.map((item) => item.tenantCode),
      });
      setTenantVacancies(vacancies.inDayTenantStatus);
    } catch (err) {
      const message = getMessageFromError(err);
      setErrMsg(message);
    }
  };

  const onPaginationChange = (event: React.ChangeEvent<unknown>, page: number) => {
    pagination.setPage(page);
    if (!isInitialFetchRef.current) {
      document.getElementById("tenantList").scrollIntoView({ behavior: "smooth" });
    }

    isInitialFetchRef.current = false;
  };

  useEffect(() => {
    if (session) {
      fetchTotal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    fetchFavoriteTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  useEffect(() => {
    fetchBookingVacanciesData();
  }, [favoriteTenants]);

  return (
    <UserLayout
      title="マイページ"
      breadcrumbItems={[
        { label: "トップ", href: ROUTE.INDEX },
        { label: "お気に入り店舗一覧", href: ROUTE.USER_FAVORITE_TENANTS },
      ]}
    >
      <Error message={errMsg} />
      {/*Main*/}
      <main className="flex-1">
        <section id="tenantList" className="xs:w-auto md:w-full w-[856px] mx-auto">
          <div className="grid grid-cols-1 xs:gap-[36px] gap-4 pb-[32px]">
            {favoriteTenants === null && (
              <div className="text-center">
                <Spinner />
              </div>
            )}
            {favoriteTenants?.length !== 0 &&
              tenantVacancies &&
              favoriteTenants?.map((favoriteTenant) => {
                const vacancy = tenantVacancies?.[favoriteTenant.tenantCode];

                return <TenantTopPage key={favoriteTenant.Tenant.code} tenant={favoriteTenant.Tenant} isFavorite={true} vacancy={vacancy} />;
              })}
            {favoriteTenants !== null && favoriteTenants?.length === 0 && (
              <div className="text-center">
                <p className="text-[20px] font-medium">お気に入りの施設がございません</p>
              </div>
            )}
          </div>
          {favoriteTenants?.length > 0 && (
            <div className="flex justify-center">
              <Pagination
                className="user-pagination"
                count={totalTenants ? Math.ceil(totalTenants / DEFAULT_LIMIT) : 0}
                variant="outlined"
                shape="rounded"
                page={pagination.page}
                onChange={onPaginationChange}
              />
            </div>
          )}
        </section>
      </main>
    </UserLayout>
  );
}
