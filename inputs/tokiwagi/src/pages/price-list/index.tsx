import { TextField } from "@mui/material";
import moment from "moment";
import Image from "next/legacy/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import Error from "components/common/Error";
import AutocompleteField from "components/common/Fields/AutocompleteField";
import Layout from "components/common/Layout";
import Spinner from "components/common/Spinner";
import Breadcrumb from "components/common/UserLayout/Breadcrumb";
import PriceTicket from "components/PriceTicket";
import PriceTicketMobile from "components/PriceTicketMobile";
import { SHORT_DATE } from "constants/common";
import { Tenant, Ticket } from "models/Entity";
import { fetchTenants } from "services/api-client/tenant.service";
import { fetchTickets } from "services/api-client/ticket.service";
import ChevronDown from "statics/images/user/chevron-down-white.svg";
import { getTicketBookingSchedule } from "utils/ticket";
import { sortTenantsByFirstCharacterThenCreatedAt } from "utils/tenant";
import { SourcePage } from "models/common";

import styles from "./index.module.scss";

const PriceList = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string>();

  const canBookingInAdvanceTickets = tickets.filter((ticket) => ticket.canBookInAdvance);
  const useInDayTickets = tickets.filter((ticket) => !ticket.canBookInAdvance);

  const {
    control,
    watch,
    formState: { errors },
  } = useForm();
  const tenant = watch("tenant");

  useEffect(() => {
    fetchTenantData();
  }, []);

  useEffect(() => {
    tenant && fetchTicketsData();
  }, [tenant]);

  const fetchTenantData = async () => {
    try {
      setErrMsg("");
      setLoading(true);
      const response = await fetchTenants();
      setTenants(sortTenantsByFirstCharacterThenCreatedAt(response));
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketsData = async () => {
    try {
      setErrMsg("");
      setLoading(true);
      const response = await fetchTickets({ tenantCode: tenant.code, sort_by: "displayOrder.asc", sourcePage: SourcePage.PRICE_LIST });

      const availableTickets = response.filter((ticket) => {
        const currentDate = moment().utc(true).format(SHORT_DATE);
        const bookingSchedule = getTicketBookingSchedule(currentDate, ticket);
        return !!bookingSchedule;
      });

      if (availableTickets.length === 0) {
        setErrMsg("現在販売できる商品はございません");
      }
      setTickets(availableTickets);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Layout>
      <div className="max-w-[1083px] w-full mx-auto mb-40 md:px-10 xs:px-0">
        {/* Heading */}
        <div className="ml-6">
          <Breadcrumb title="料金プラン" />
        </div>

        <h2 className="mx-auto mt-20 mb-16 usr-title-line xs:mb-9 md:mt-8">料金プラン</h2>
        <div className="xs:flex xs:mx-5 ">
          <form>
            {/* Body */}
            <AutocompleteField
              componentsProps={{ paper: { className: styles.paperContainer } }}
              disablePortal
              name="tenant"
              control={control}
              options={tenants}
              getOptionLabel={(option) => option.name || ""}
              className={`${styles["usr-dropdown-field-price"]} max-w-[335px] w-full
               xs:w-[335px] xs:!min-h-[48px] xs:!px-[10px] xs:!bg-[#0068b7]`}
              renderInput={(params) => (
                <TextField
                  multiline
                  {...params}
                  className={`first-letter:flex justify-center min-h-[40px] 
                  rounded-[10px]`}
                  placeholder="店舗選択"
                  InputProps={{
                    ...params.InputProps,
                    className: "!py-0 !pr-[32px] !pl-[4px]",
                  }}
                  inputProps={{
                    ...params.inputProps,
                    className: "!py-0 xs:!pr-0 xs:!pl-1",
                    readOnly: true,
                  }}
                />
              )}
              disableClearable
              popupIcon={
                <span className="flex mr-[4px]">
                  <Image src={ChevronDown} alt="arrow-down" width={15} className="xs:!hidden xs:w-0 xs:h-0" height={12} />
                  <Image src={ChevronDown} alt="arrow-down" width={15} className="xsup:!hidden xs:w-0 xs:h-0" height={12} />
                </span>
              }
              isOptionEqualToValue={(option, value) => option.code === value.code || value === ""}
            />
            {errors.tenant && <Error message={errors.tenant.message} className="mt-3" />}
          </form>
        </div>
        {/* Body */}
        {/* Desktop & Tablet */}
        {!loading && tickets.length > 0 ? (
          <>
            <div className="xs:hidden">
              {/* Ticket Use in Day */}
              <PriceTicket tickets={useInDayTickets} title="当日利用" />

              {/* Ticket One Day */}
              <PriceTicket tickets={canBookingInAdvanceTickets} title="事前購入" />
            </div>
            {/* Mobile */}
            <div className="hidden xs:flex xs:flex-col xs:gap-8 xs:mt-10">
              <PriceTicketMobile tickets={useInDayTickets} title="当日利用" />
              <PriceTicketMobile tickets={canBookingInAdvanceTickets} title="事前購入" />
            </div>
            {/* Footer */}
            <div className="my-8 xs:ml-6 text-xl xs:font-semibold">
              <div>
                <span>キドキドの料金詳細は</span>
                <Link href={"https://kidokid.bornelund.co.jp/price/"} passHref legacyBehavior>
                  <a className="underline">こちら</a>
                </Link>
              </div>
            </div>

            <div className="mb-8 xs:ml-6 text-xl xs:font-semibold">
              <div>
                <span>プレイヴィルの料金詳細は</span>
                <Link href={"https://playville.bornelund.co.jp/price/"} passHref legacyBehavior>
                  <a className="underline">こちら</a>
                </Link>
              </div>
            </div>
          </>
        ) : errMsg === "" ? (
          <div className="xs:mt-[34px] text-xxl flex justify-center mdonly:mt-4">店舗を選択してください</div>
        ) : (
          <div className="xs:mt-[34px] text-xxl flex justify-center mdonly:!mt-4">{errMsg}</div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center mt-8">
            <Spinner />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PriceList;
