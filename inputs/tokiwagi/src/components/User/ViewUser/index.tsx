import { User } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/router";
import moment from "moment";

import AdminButton from "components/common/Buttons/AdminButton";
import { ROUTE } from "constants/route";
import PasswordConfirmationDialog from "components/common/PasswordConfirmationDialog";
import { JP_SHORT_DATE, NEWS_LETTER_OPTIONS } from "constants/common";
import { getIncludedProvinceAddress, getUserGenderLabel } from "utils/user";

interface Props {
  user?: User;
  filters?: string;
  page?: string;
  staffOrAdminId?: string;
}

export default function ViewUser({ user, filters, page, staffOrAdminId }: Props) {
  const [isShowPasswordConfirmationToRedirectDialog, setIsShowPasswordConfirmationToRedirectDialog] = useState<boolean>(false);
  const router = useRouter();

  const handleRedirectEditUser = (id) => {
    router.push(`${ROUTE.EDIT_USER}/${id}`);
  };

  const showPasswordConfirmationToRedirectDialog = () => {
    setIsShowPasswordConfirmationToRedirectDialog(true);
  };

  const hidePasswordConfirmationToRedirectDialog = () => {
    setIsShowPasswordConfirmationToRedirectDialog(false);
  };

  const handleRedirect = () => {
    router.push({
      pathname: ROUTE.USER_MANAGEMENT,
      query: {
        filters,
        page,
        ...(staffOrAdminId && { staffOrAdminId }),
      },
    });
  };

  return (
    <div className="ad-section-container">
      {/*Data */}
      {user && (
        <div className="flex flex-col items-center justify-center max-w-[563px] mdonly:w-full mdonly:pl-4 mdonly:pr-4  mx-auto ad-text-color">
          <h1 className="my-4 mt-9 text-xl font-bold text-center">ユーザー詳細</h1>
          <div className="w-full mt-4">
            <h2 className="pb-2 text-xl font-medium">ログイン情報</h2>
            <div className="border border-[#D9D9D9]"></div>
            <div className="flex mx-4 my-8 gap-20">
              <div className="flex flex-col gap-4">
                <p>メールアドレス</p>
                <p>パスワード</p>
              </div>
              <div className="flex flex-col gap-4">
                <p className="font-bold">{user.email ? user.email : ""}</p>
                <p className="font-bold">*********</p>
              </div>
            </div>
          </div>

          <div className="w-full mt-4 mb-4">
            <h2 className="pb-2 text-xl font-medium">基本情報</h2>
            <div className="border border-[#D9D9D9]"></div>
            <div className="grid text-base font-medium mx-4 my-8">
              <div className="grid grid-cols-2 gap-4">
                <p>お名前</p>
                <span className="max-w-[244px] font-bold">
                  {user.lastName ? user.lastName : ""} {user.firstName ? user.firstName : ""}
                </span>
                <p>お名前（カナ）</p>
                <span className="max-w-[244px] font-bold">
                  {user.lastNameFurigana ? user.lastNameFurigana : ""} {user.firstNameFurigana ? user.firstNameFurigana : ""}
                </span>
                <p>性別</p>
                <span className="break-words max-w-[144px] font-bold">{getUserGenderLabel(user.gender)}</span>
                <p>電話番号</p>
                <span className="break-words max-w-[144px] font-bold">{user.phone ? user.phone : ""}</span>
                <p>郵便番号</p>
                <span className="break-words max-w-[144px] font-bold">{user.postCode ? user.postCode : ""}</span>
                <p>住所</p>
                <span className="break-words max-w-[144px] font-bold">{user.address ? getIncludedProvinceAddress(user) : ""}</span>
                <p>生年月日</p>
                <span className="break-words max-w-[144px] font-bold">{user.birthday ? moment(user.birthday).format(JP_SHORT_DATE) : ""}</span>
                <p>ボーネルンドからの情報</p>
                <span className="break-words max-w-[144px] font-bold">{NEWS_LETTER_OPTIONS.find((item) => item.value === user.allowedNewsletter).label}</span>
              </div>
            </div>
          </div>

          {isShowPasswordConfirmationToRedirectDialog && (
            <PasswordConfirmationDialog onDismiss={hidePasswordConfirmationToRedirectDialog} onAccept={() => handleRedirectEditUser(user.id)} />
          )}

          <div className="flex gap-x-20 mb-16">
            <AdminButton type="button" onClick={handleRedirect} variant="outlined" className="w-[230px] h-[56px] mdonly:w-[170px] mdup:w-[170px] !font-bold">
              戻る
            </AdminButton>

            <AdminButton
              onClick={showPasswordConfirmationToRedirectDialog}
              type="button"
              variant="contained"
              className="w-[230px] h-[56px] mdonly:w-[170px] mdup:w-[170px] !font-bold"
            >
              編集する
            </AdminButton>
          </div>
        </div>
      )}
    </div>
  );
}
