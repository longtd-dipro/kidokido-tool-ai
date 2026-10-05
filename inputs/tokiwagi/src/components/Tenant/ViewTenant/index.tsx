import moment from "moment";
import { useState } from "react";
import { useRouter } from "next/router";

import { Tenant } from "models/Entity";
import AdminButton from "components/common/Buttons/AdminButton";
import PasswordConfirmationDialog from "components/common/PasswordConfirmationDialog";
import { ROUTE } from "constants/route";
import { MEDIUM_TIME, JP_SHORT_TIME } from "constants/common";

interface Props {
  tenant: Tenant;
  filters?: string;
  page?: string;
}

export default function ViewTenant({ tenant, filters, page }: Props) {
  const [isShowPasswordConfirmationToRedirectDialog, setIsShowPasswordConfirmationToRedirectDialog] = useState<boolean>(false);
  const router = useRouter();

  const handleRedirectEditUser = (code) => {
    router.push(`${ROUTE.EDIT_TENANT}/${code}`);
  };

  const handleRedirectToManagement = () => {
    router.push({ pathname: ROUTE.TENANT_MANAGEMENT, query: { filters, page } });
  };

  const showPasswordConfirmationToRedirectDialog = () => {
    setIsShowPasswordConfirmationToRedirectDialog(true);
  };

  const hidePasswordConfirmationToRedirectDialog = () => {
    setIsShowPasswordConfirmationToRedirectDialog(false);
  };
  return (
    <div className="flex flex-col md:max-w-[631px] max-w-[810px] mx-auto gap-[32px] justify-center">
      <div className="flex flex-col gap-[24px] justify-center">
        <div className="flex flex-col items-center justify-center">
          <span className="text-[20px] leading-[28px] font-bold text-center text-color">施設詳細</span>
        </div>
        <div className="flex flex-col flex-start gap-[16px]">
          <h2 className="text-xl md:text-base md:leading-5 md:font-bold pb-4 border-b border-dotted border-[#D9D9D9] text-color">施設用アカウント</h2>
          <div className="flex flex-col gap-[12px] flex-start p-[16px]">
            <div className="flex flex-col gap-4 text-base leading-5 md:text-sm md:leading-4 text-color">
              <div className="flex w-full">
                <p className="w-1/3">メールアドレス</p>
                <p className="w-2/3 font-bold">{tenant?.AdminTenant.User.email}</p>
              </div>
              <div className="flex w-full">
                <p className="w-1/3">パスワード</p>
                <p className="w-2/3 font-bold">*************</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-start gap-[16px]">
          <h2 className="text-xl md:text-base md:leading-5 md:font-bold pb-4 border-b border-dotted border-[#D9D9D9] text-color">施設情報</h2>
          <div className="flex flex-col gap-[12px] flex-start p-[16px]">
            <div className="flex flex-col gap-4 text-base leading-5 md:text-sm md:leading-4 text-color">
              <div className="flex w-full">
                <p className="w-1/3">施設名</p>
                <p className="font-bold">{tenant?.name}</p>
              </div>
              <div className="flex w-full">
                <p className="w-1/3">施設コード</p>
                <p className="font-bold">{tenant?.code}</p>
              </div>
              <div className="flex w-full">
                <p className="w-1/3">電話番号</p>
                <p className="font-bold">{tenant?.phone}</p>
              </div>
              <div className="flex w-full">
                <p className="w-1/3">郵便番号</p>
                <p className="font-bold">{tenant?.postCode}</p>
              </div>
              <div className="flex w-full">
                <p className="w-1/3">住所</p>
                <p className="w-2/3 font-bold">{tenant?.address}</p>
              </div>
              <div className="flex w-full">
                <p className="w-1/3">営業時間</p>
                <p className="font-bold">
                  開店時間: {tenant?.openedAt ? moment(tenant?.openedAt).format(MEDIUM_TIME) : ""} &emsp; &emsp; &emsp; 閉店時間:{" "}
                  {tenant?.closedAt ? moment(tenant?.closedAt).format(MEDIUM_TIME) : ""}
                </p>
              </div>
              <div className="flex w-full">
                <p className="w-1/3">最終受付時間設定</p>
                <p className="font-bold">開店時間: {tenant?.servedUtil ? `${moment(tenant?.servedUtil).format(JP_SHORT_TIME)}` : ""}</p>
              </div>
              <div className="flex w-full">
                <p className="w-1/3">施設画像</p>
                <p className="w-2/3 break-words font-bold">{tenant?.imageUrl}</p>
              </div>
              <div className="flex w-full">
                <p className="w-1/3">公式サイトのURL</p>
                <p className="w-2/3 font-bold break-words">{tenant?.siteUrl}</p>
              </div>
              <div className="flex w-full">
                <p className="w-1/3">アクセス</p>
                <p className="w-2/3 font-bold break-words whitespace-pre-line">{tenant?.guide ? tenant?.guide : " "}</p>
              </div>
              <div className="flex w-full">
                <p className="w-1/3">連携のGMOアカウント</p>
                <p className="w-2/3 font-bold break-words whitespace-pre-line">{tenant?.GMOSetting?.name || " "}</p>
              </div>
              <div className="flex w-full">
                <p className="w-1/3">スマレジ契約ID</p>
                <p className="w-2/3 font-bold break-words whitespace-pre-line">{tenant?.smaregiContractId || " "}</p>
              </div>
              <div className="flex w-full">
                <p className="w-1/3">スマレジストアID</p>
                <p className="w-2/3 font-bold break-words whitespace-pre-line">{tenant?.smaregiStoreId || " "}</p>
              </div>
              <div className="flex w-full">
                <p className="w-1/3">スマレジ端末ID</p>
                <p className="w-2/3 font-bold break-words whitespace-pre-line">{tenant?.smaregiTerminalId || " "}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isShowPasswordConfirmationToRedirectDialog && (
        <PasswordConfirmationDialog onDismiss={hidePasswordConfirmationToRedirectDialog} onAccept={() => handleRedirectEditUser(tenant.code)} />
      )}
      <div className="flex justify-center gap-x-20">
        <AdminButton
          type="button"
          variant="outlined"
          onClick={handleRedirectToManagement}
          className="w-[230px] h-[56px] md:w-36 md:h-9 md:!text-sm mdup:!font-bold"
        >
          戻る
        </AdminButton>

        <AdminButton
          type="button"
          variant="contained"
          onClick={showPasswordConfirmationToRedirectDialog}
          className="w-[230px] h-[56px] md:w-36 md:h-9 md:!text-sm mdup:!font-bold"
        >
          編集する
        </AdminButton>
      </div>
    </div>
  );
}
