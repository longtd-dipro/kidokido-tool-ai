import { useSession } from "next-auth/react";
import Image from "next/legacy/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import Error from "components/common/Error";
import Spinner from "components/common/Spinner";
import { VACANCY_STATUS } from "constants/common";
import { ROUTE } from "constants/route";
import { Tenant } from "models/Entity";
import { addFavorite, removeFavorite } from "services/api-client/user.service";
import CircleOutlineIcon from "statics/images/circle-outline.svg";
import CrossRedIcon from "statics/images/cross-red.svg";
import TriangleImage from "statics/images/triangle-pc.svg";
import EmptyImage from "statics/images/empty-image.svg";
import HearthOutlineIcon from "statics/images/heart-outline.svg";
import HearthIcon from "statics/images/heart.svg";
import { getMessageFromError } from "utils/common";
import { checkTenantIsInSaleTime, getTenantImagePath } from "utils/tenant";
import { TenantVacancy } from "models/Vacancy";
import TenantTopPageNote from "components/TopPage/TenantTopPage/TenantTopPageNote";

import styles from "./index.module.scss";

type Props = {
  tenant: Tenant;
  isFavorite?: boolean;
  vacancy?: TenantVacancy;
};

export default function TenantTopPage(props: Props) {
  const { data: session } = useSession();
  const [errMsg, setErrMsg] = useState<string>();

  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(props.isFavorite ?? false);

  useEffect(() => {
    setIsFavorite(props.isFavorite);
  }, [props.isFavorite]);

  const handleFavorite = async () => {
    if (!session) {
      return;
    }

    try {
      setErrMsg("");
      setIsLoading(true);
      await addFavorite(props.tenant.code as string);
      setIsFavorite(true);
    } catch (err) {
      const message = getMessageFromError(err);
      setErrMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnFavorite = async () => {
    if (!session) {
      return;
    }

    try {
      setErrMsg("");
      setIsLoading(true);
      await removeFavorite(props.tenant.code as string);
      setIsFavorite(false);
    } catch (err) {
      const message = getMessageFromError(err);
      setErrMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTenantVacancyStatus = (vacancy: TenantVacancy) => {
    const statusIcons = {
      [VACANCY_STATUS.AVAILABLE]: CircleOutlineIcon,
      [VACANCY_STATUS.FULL]: TriangleImage,
      [VACANCY_STATUS.NOT_AVAILABLE]: CrossRedIcon,
    };

    const isTenantInSaleTime = checkTenantIsInSaleTime(props.tenant);
    if (isTenantInSaleTime === false) {
      return <p>営業時間外</p>;
    }

    const statusIcon = statusIcons[vacancy.status];
    return <Image src={statusIcon} alt="tenant-logo" width={25} height={25} />;
  };

  return (
    <div className={styles.card}>
      <div className="flex gap-[20px]">
        <div className="flex flex-col grow pl-[16px] pr-[16px] min-w-0">
          {/* DESKTOP HEADER */}
          <div className="xs:hidden">
            <div className="flex pb-4">
              <div className="w-full items-center">
                <div className="shrink-0 min-w-[20px] cursor-pointer float-right">
                  {isLoading ? (
                    <Spinner size={22} />
                  ) : (
                    <Image
                      src={isFavorite ? HearthIcon : HearthOutlineIcon}
                      alt="tenant-logo"
                      width={20}
                      height={22}
                      onClick={() => (isFavorite ? handleUnFavorite() : handleFavorite())}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="flex-col items-center flex pb-4">
              <div className="xs:hidden min-w-[180px] pb-4">
                <div className="w-[300px] h-[80px]">
                  <img
                    src={getTenantImagePath(props.tenant) ?? EmptyImage}
                    alt="tenant-logo"
                    style={{ borderRadius: 10, objectFit: "fill", width: "100%", height: "100%" }}
                  />
                </div>
              </div>
              <div className="shrink-0 break-words pb-4">
                <span className="font-bold text-[24px] leading-[32px] md:text-[18px] work-break">{props.tenant.name}</span>
              </div>
              <div className={`justify-end grow ${styles.cardHeaderUrl} md:text-[10px] text-[14px]`} title={props.tenant.siteUrl}>
                <a href={props.tenant.siteUrl} target="_blank" rel="noreferrer">
                  <span>ショップページ &nbsp;&nbsp;{props.tenant.siteUrl}</span>
                </a>
              </div>
            </div>
          </div>

          {/* MOBILE HEADER */}
          <div className="xs:block hidden">
            <div className={`${styles.cardHeaderUpdate}`}>
              <div>
                <div className="flex w-full m-auto ">
                  <div className="break-words ml-[20px]">
                    <span className="font-bold text-[18px] leading-[28px] work-break">{props.tenant.name}</span>
                  </div>
                  <div className="grow text-right min-w-[22px] mr-[25px]">
                    {isLoading ? (
                      <Spinner size={22} />
                    ) : (
                      <Image
                        src={isFavorite ? HearthIcon : HearthOutlineIcon}
                        alt="tenant-logo"
                        width={20}
                        height={23}
                        onClick={() => (isFavorite ? handleUnFavorite() : handleFavorite())}
                      />
                    )}
                  </div>
                </div>
                <div className="w-[300px] h-[80px] m-auto mt-[10px] ">
                  <img
                    src={getTenantImagePath(props.tenant) ?? EmptyImage}
                    alt="tenant-logo"
                    style={{ borderRadius: 10, objectFit: "fill", width: "100%", height: "100%" }}
                  />
                </div>
              </div>
              <div className="flex flex-col w-[307px] h-[40px] m-auto mt-[10px]">
                <div className="grow flex justify-center text-center text-[12px] leading-[20px] font-light ">
                  <span className={`${styles.cardHeaderUrl} w-[200px] `}>
                    ショップページ <br /> {props.tenant.siteUrl}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="h-[56px] w-full bg-white flex justify-center items-center xs:gap-[12px] gap-[60px] xs:px-[10px] px-[16px] ">
              <div>
                <span className="xs:text-[14px] text-[16px] md:text-[14px]">現在の受付状況</span>
              </div>
              <div className="flex">{props.vacancy && renderTenantVacancyStatus(props.vacancy)}</div>
              <div>
                <Link
                  href={{
                    pathname: ROUTE.USE_IN_DAY_BOOKING,
                    query: {
                      tenantCode: props.tenant.code,
                    },
                  }}
                  legacyBehavior
                >
                  <a className="user-button-blue-medium xs:h-[36px] xs:min-w-[116px] xs:text-[16px]">当日利用</a>
                </Link>
              </div>
            </div>
            <div className="my-[16px] xs:ml-[80px]">
              <TenantTopPageNote />
            </div>
            <div className="flex justify-center">
              <Link href={ROUTE.TENANT_DETAIL.replace("[code]", props.tenant.code)} legacyBehavior>
                <a className="user-button-outline-blue-medium">店舗詳細・事前予約をする</a>
              </Link>
            </div>
            <Error message={errMsg} className="text-center mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
