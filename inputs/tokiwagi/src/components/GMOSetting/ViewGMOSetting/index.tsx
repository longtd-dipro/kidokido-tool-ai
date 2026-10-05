import { GMOSetting } from "@prisma/client";
import { useRouter } from "next/router";
import { useState } from "react";

import AdminButton from "components/common/Buttons/AdminButton";
import PasswordConfirmationDialog from "components/common/PasswordConfirmationDialog";
import { ROUTE } from "constants/route";

interface Props {
  gmoSetting: GMOSetting;
  page?: string;
}

export default function ViewGMOSetting({ gmoSetting, page }: Props) {
  const [isShowPasswordConfirmationToRedirectDialog, setIsShowPasswordConfirmationToRedirectDialog] = useState<boolean>(false);
  const router = useRouter();

  const handleRedirectEditPage = (id: number) => {
    router.push(`${ROUTE.GMO_SETTINGS_EDIT}/${id}`);
  };

  const handleRedirectToManagement = () => {
    router.push({ pathname: ROUTE.GMO_SETTINGS, query: { page } });
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
          <span className="text-[20px] leading-[28px] font-bold text-center text-color">GMOアカウント詳細</span>
        </div>

        <div className="flex flex-col flex-start gap-[16px]">
          <h2 className="text-xl md:text-base md:leading-5 md:font-bold pb-4 border-b border-dotted border-[#D9D9D9] text-color">GMOアカウント情報</h2>
          <div className="flex flex-col gap-[12px] flex-start p-[16px]">
            <div className="flex flex-col gap-4 text-base leading-5 md:text-sm md:leading-4 text-color">
              {/* Name */}
              <div className="flex w-full">
                <p className="w-1/3">アカウント名</p>
                <p className="w-2/3 font-bold">{gmoSetting?.name}</p>
              </div>
              {/* Shop Id */}
              <div className="flex w-full">
                <p className="w-1/3">ショップID</p>
                <p className="w-2/3 font-bold">{gmoSetting?.shopId}</p>
              </div>
              {/* Shop Pass */}
              <div className="flex w-full">
                <p className="w-1/3">ショップパスワード</p>
                <p className="w-2/3 font-bold">{gmoSetting?.shopPass}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isShowPasswordConfirmationToRedirectDialog && (
        <PasswordConfirmationDialog onDismiss={hidePasswordConfirmationToRedirectDialog} onAccept={() => handleRedirectEditPage(gmoSetting.id)} />
      )}

      <div className="flex justify-center gap-x-20 mt-8">
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
