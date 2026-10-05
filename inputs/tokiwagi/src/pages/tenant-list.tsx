import { Pagination } from "@mui/material";
import { Tenant } from "@prisma/client";
import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import Error from "components/common/Error";
import Layout from "components/common/Layout";
import TenantTopPage from "components/TopPage/TenantTopPage";
import { fetchTenants } from "services/api-client/tenant.service";
import SearchTenantArea from "components/TopPage/SearchTenantArea";
import { getMessageFromError } from "utils/common";
import { fetchTenantFavorites } from "services/api-client/user.service";
import { changeRouterQuery, getUrlQueryValue } from "utils/url";
import { fetchBookingVacanciesStatus } from "services/api-client/booking.service";
import Spinner from "components/common/Spinner";
import { sortTenantsByAddressAndGuide } from "utils/tenant";
import { TenantVacancy } from "models/Vacancy";

const DEFAULT_LIMIT = 5;

export default function TenantList() {
  const { data: session } = useSession();

  const router = useRouter();

  const [errMsg, setErrMsg] = useState<string>();
  const [allTenants, setAllTenants] = useState<Tenant[]>([]);
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [favoriteTenants, setFavoriteTenants] = useState<{ tenantCode: string }[]>([]);
  const [totalTenants, setTotalTenants] = useState<number>(1);
  const [tenantVacancies, setTenantVacancies] = useState<{ [tenantCode: string]: TenantVacancy }>(null);
  const [page, setPage] = useState<number>(1);

  const [searchText, setSearchText] = useState<string>(getUrlQueryValue("search") ?? "");

  const isInitialFetchRef = useRef(true);

  const fetchData = async () => {
    try {
      setErrMsg("");
      const tenants = await fetchTenants({
        search: searchText,
      });

      setPage(1);
      const sortedTenants = sortTenantsByAddressAndGuide(tenants, searchText);
      setAllTenants(sortedTenants);
      setTotalTenants(sortedTenants.length);
      setTenants(sortedTenants.slice(0, DEFAULT_LIMIT));
    } catch (err) {
      const message = getMessageFromError(err);
      setErrMsg(message);
    }
  };

  const fetchFavoriteTenants = async () => {
    try {
      const response = await fetchTenantFavorites({ includeTenant: false });
      setFavoriteTenants(response);
    } catch (err) {
      const message = getMessageFromError(err);
      setErrMsg(message);
    }
  };

  const fetchBookingVacanciesData = async (tenants: Tenant[]) => {
    if (tenants.length === 0) return;

    try {
      const vacancies = await fetchBookingVacanciesStatus({
        tenantCodes: tenants.map((item) => item.code),
      });
      setTenantVacancies(vacancies.inDayTenantStatus);
    } catch (err) {
      const message = getMessageFromError(err);
      setErrMsg(message);
    }
  };

  const onPaginationChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setPage(page);
    const start = (page - 1) * DEFAULT_LIMIT;
    const end = page * DEFAULT_LIMIT;
    setTenants(allTenants.slice(start, end));

    if (!isInitialFetchRef.current) {
      document.getElementById("tenantList").scrollIntoView({ behavior: "smooth" });
    }

    isInitialFetchRef.current = false;
  };

  useEffect(() => {
    if (session) {
      fetchFavoriteTenants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    changeRouterQuery("search", searchText, router);
    fetchData();
  }, [searchText]);

  useEffect(() => {
    if (tenants?.length > 0) {
      fetchBookingVacanciesData(tenants);
    }
  }, [tenants]);

  return (
    <Layout breadcrumbData={[{ title: "店舗一覧" }]}>
      <SearchTenantArea isAutoSubmit={true} onSearch={setSearchText} hideHeader={true} />

      <div>
        <Error message={errMsg} className="text-center text-[14px]" />
        {/*Main*/}
        <main className="flex-1">
          <div className="top-page-title-wrapper">
            <h1 className="top-page-title">店舗一覧</h1>
          </div>
          <section id="tenantList" className="xs:w-auto mdonly:px-10 max-w-[856px] mx-auto">
            <div className="grid grid-cols-1 xs:gap-[36px] gap-12 pb-[32px]">
              {tenants === null && (
                <div className="text-center">
                  <Spinner />
                </div>
              )}
              {tenants?.length !== 0 &&
                tenantVacancies &&
                tenants?.map((tenant) => {
                  const isFavorite = favoriteTenants?.some((favoriteTenant) => favoriteTenant.tenantCode === tenant.code);
                  const vacancy = tenantVacancies?.[tenant.code];

                  return <TenantTopPage key={tenant.code} tenant={tenant} isFavorite={isFavorite} vacancy={vacancy} />;
                })}
              {tenants !== null && tenants?.length === 0 && (
                <div className="text-center">
                  <p className="text-[20px] font-medium">一致する結果が見つかりませんでした。</p>
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <Pagination
                className="user-pagination"
                count={totalTenants ? Math.ceil(totalTenants / DEFAULT_LIMIT) : 0}
                variant="outlined"
                shape="rounded"
                page={page}
                onChange={onPaginationChange}
              />
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
}
