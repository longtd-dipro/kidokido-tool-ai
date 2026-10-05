import React, { useCallback, useEffect, useState } from "react";
import Image from "next/legacy/image";
import { debounce } from "lodash";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useRouter } from "next/router";

import ArrowDownMobileIcon from "statics/images/arrow-down-mobile.svg";
import SearchMobileIcon from "statics/images/search-mobile-icon.svg";
import styles from "styles/top-page.module.scss";
import SearchIcon from "statics/images/search-icon.svg";
import ArrowDownIcon from "statics/images/arrow-down.svg";
import { getUrlQueryValue } from "utils/url";
import Error from "components/common/Error";
import { Tenant } from "models/Entity";
import { fetchTenants } from "services/api-client/tenant.service";
import { getMessageFromError } from "utils/common";
import { getTenantOptions, sortTenantsByFirstCharacterThenCreatedAt } from "utils/tenant";
import { ROUTE } from "constants/route";

type Props = {
  isAutoSubmit?: boolean;
  onSearch?: (value: string) => void;
  hideHeader?: boolean;
};

export default function SearchTenantArea(props: Props) {
  const router = useRouter();

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [defaultSearchValue] = React.useState(getUrlQueryValue("search") ?? "");
  const [errMsg, setErrMsg] = useState<string>();
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const onSearchChange = useCallback(
    debounce((searchValue) => {
      if (props.isAutoSubmit) {
        props.onSearch?.(searchValue.trim());
      }
    }, 500),
    []
  );

  const onSearchSubmit = () => {
    const searchValue = searchInputRef.current?.value ?? "";

    // Trim space when input tenant
    props.onSearch?.(searchValue.trim());
  };

  useEffect(() => {
    fetchTenantData();
  }, []);

  const fetchTenantData = async () => {
    try {
      setErrMsg("");
      const response = await fetchTenants();
      setTenants(sortTenantsByFirstCharacterThenCreatedAt(response));
    } catch (err) {
      const message = getMessageFromError(err);
      setErrMsg(message);
    }
  };

  const onTenantChange = (e: SelectChangeEvent<string>) => {
    const tenantCode = e.target.value as string;
    const tenant = tenants.find((t) => t.code === tenantCode);
    const nextRoute = ROUTE.TENANT_DETAIL.replace("[code]", tenant?.code);
    router.push(nextRoute);
  };

  const options = getTenantOptions(tenants);

  return (
    <div className={`${styles.search__tenant} xs:pt-6 pt-20 md:pt-6`}>
      <Error message={errMsg} />
      <div className={"flex flex-col w-full xs:max-w-[391px] max-w-4xl mx-auto md:gap-3 mdup:gap-y-[30px] px-7 xs:px-5 text-center"}>
        {!props.hideHeader && (
          <>
            <div className="">
              <h1 className={`${styles.heading_information} xs:!text-[32px] md:!text-[32px] mb-4 md:mb-2`}>利用店舗を探す</h1>
              <span className={`${styles.information} xs:!text-[14px]`}>SEARCH</span>
            </div>
            <div className="flex items-center flex-shrink-0 pt-[10px] md:p-0 xs:w-[335px]">
              <label htmlFor="" className={`${styles.search_title} xs:hidden mdup:!max-h-[72px] mdup:!max-w-[365px] mdup:!py-5 rounded-l-full mdup:!text-2xl `}>
                <span className="">キーワードから探す</span>
              </label>
              <div className="relative w-full md:p-0">
                <input
                  ref={searchInputRef}
                  className={`${styles.input_search} w-full xs:py-3 md:py-4 mdup:!text-xl mdup:py-[21px] border border-[#D9D9D9]  
                  xs:rounded-full rounded-r-full xs:px-9`}
                  type="text"
                  placeholder="店舗名、住所、駅"
                  onChange={(e) => onSearchChange(e.target.value)}
                  defaultValue={defaultSearchValue}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onSearchSubmit();
                    }
                  }}
                />
                {/* Search mobile Icon In Desktop */}
                <div onClick={onSearchSubmit} className="cursor-pointer">
                  <div className="absolute right-0 translate-y-[-50%] top-1/2 pr-4 xs:hidden flex">
                    <Image src={SearchIcon} className="min-w-[90%]" alt="SearchIcon" width={32} height={32} />
                  </div>
                  {/* Search mobile Icon In MOBILE */}
                  <div className="absolute right-4  pr-10 translate-y-[-50%] top-1/2 md:pr-4 xs:flex hidden">
                    <Image src={SearchMobileIcon} className="min-w-[90%]" alt="SearchMobileIcon" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center flex-shrink-0 xs:hidden pb-[99px] md:pb-9">
              <label htmlFor="" className={`${styles.search_title} xs:hidden mdup:!max-h-[72px] mdup:!max-w-[365px] mdup:!py-5 rounded-l-full mdup:!text-2xl`}>
                <span className="">店舗から探す</span>
              </label>
              <div className="relative w-full">
                <Select
                  MenuProps={{ disablePortal: true }}
                  className={"bg-[white] w-full border border-[#D9D9D9] relative z-0 !rounded-r-full h-[72px] mdup:!text-xl py-[21px] md:h-[54px] text-left"}
                  displayEmpty={true}
                  defaultValue={""}
                  IconComponent={() => (
                    <div className="absolute right-0 translate-y-[-50%] top-1/2 pr-4 flex">
                      <Image src={ArrowDownIcon} alt="ArrowDownIcon" width={32} height={32} />
                    </div>
                  )}
                  onChange={onTenantChange}
                  SelectDisplayProps={{
                    className: "z-10",
                  }}
                >
                  <MenuItem value="" className="!hidden">
                    <span className="text-placeholder !text-left">店舗を選択してください</span>
                  </MenuItem>
                  {options.map(({ value, label }) => (
                    <MenuItem className="xs:!text-[0.8rem]" key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div>
          </>
        )}

        {props.hideHeader && (
          <>
            <div className="flex items-center flex-shrink-0 md:p-0 xs:w-[335px]">
              <label htmlFor="" className={`${styles.search_title} block xs:hidden rounded-l-full font-bold `}>
                <span className="">キーワードから探す</span>
              </label>
              <div className="relative w-full md:p-0">
                <input
                  ref={searchInputRef}
                  className={`${styles.input_search} w-full xs:py-3 md:py-4 py-[19px] border border-[#D9D9D9]  
                  xs:rounded-full rounded-r-full xs:px-9`}
                  type="text"
                  placeholder="店舗名、住所、駅"
                  onChange={(e) => onSearchChange(e.target.value)}
                  defaultValue={defaultSearchValue}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onSearchSubmit();
                    }
                  }}
                />
                {/* Search mobile Icon In Desktop */}
                <div onClick={onSearchSubmit} className="cursor-pointer">
                  <div className="absolute right-0 translate-y-[-50%] top-1/2 pr-4 xs:hidden flex">
                    <Image src={SearchIcon} className="min-w-[90%]" alt="SearchIcon" width={32} height={32} />
                  </div>
                  {/* Search mobile Icon In MOBILE */}
                  <div className="absolute right-4  pr-10 translate-y-[-50%] top-1/2 md:pr-4 xs:flex hidden">
                    <Image src={SearchMobileIcon} className="min-w-[90%]" alt="SearchMobileIcon" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center flex-shrink-0 xs:hidden pb-20 mdup:mt-[-10px]">
              <label htmlFor="" className={`${styles.search_title} rounded-l-full shrink-0 xs:text-xl font-bold `}>
                <span className="">店舗から探す</span>
              </label>
              <div className="relative w-full">
                <Select
                  MenuProps={{ disablePortal: true }}
                  className={"bg-[white] w-full border border-[#D9D9D9] relative z-0 !rounded-r-full h-[60px] md:h-[54px] text-left"}
                  displayEmpty={true}
                  defaultValue={""}
                  IconComponent={() => (
                    <div className="absolute right-0 translate-y-[-50%] top-1/2 pr-4 flex">
                      <Image src={ArrowDownIcon} alt="ArrowDownIcon" width={32} height={32} />
                    </div>
                  )}
                  onChange={onTenantChange}
                  SelectDisplayProps={{
                    className: "z-10",
                  }}
                >
                  <MenuItem value="" className="!hidden">
                    <span className="text-placeholder !text-left">店舗を選択してください</span>
                  </MenuItem>
                  {options.map(({ value, label }) => (
                    <MenuItem className="xs:!text-[0.8rem]" key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div>
          </>
        )}

        {/* Dropdown MOBILE */}
        <div className="hidden pb-6 xs:block">
          <div className="relative px-5 text-white md:px-0 xs:w-[335px]">
            <div className={`${styles.search_title} !p-0 max-w-full w-full rounded-full text-white xs:flex xs:justify-center xs:items-center`}>
              <Select
                MenuProps={{ disablePortal: true }}
                className="top-page-tenant-select-mobile w-full h-[48px]"
                displayEmpty={true}
                defaultValue={""}
                IconComponent={() => (
                  <div className="absolute right-8 translate-y-[-50%] top-1/2 flex">
                    <Image src={ArrowDownMobileIcon} alt="ArrowDownMobileIcon" className="text-white" />
                  </div>
                )}
                onChange={onTenantChange}
                SelectDisplayProps={{
                  className: "z-10",
                }}
              >
                <MenuItem value="" className="hidden">
                  <span className="text-[20px] leading-[28px] font-bold float-left pl-7">店舗から探す</span>
                </MenuItem>
                {options.map(({ value, label }) => (
                  <MenuItem className="xs:!text-[0.8rem]" key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
