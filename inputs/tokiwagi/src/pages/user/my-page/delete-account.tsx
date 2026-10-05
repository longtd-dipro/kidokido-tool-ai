import React, { useState } from "react";
import { signOut } from "next-auth/react";

import Button from "components/common/Buttons/Button";
import { ROUTE } from "constants/route";
import Error from "components/common/Error";
import ConfirmationDialog from "components/User/ConfirmationDialogUser";
import UserLayout from "components/common/UserLayout";
import { deleteUser } from "services/api-client/user.service";

enum DeleteAccountMode {
  Confirmation,
  Completion,
}

export default function StatusMonthlyTicket() {
  const [errMsg, setErrMsg] = useState<string>();
  const [isShowConfirmDialog, setIsShowConfirmDialog] = useState<boolean>(false);
  const [mode, setMode] = useState<DeleteAccountMode>(DeleteAccountMode.Confirmation);

  const showConfirmationDialog = () => {
    setIsShowConfirmDialog(true);
  };

  const hideConfirmationDialog = () => {
    setIsShowConfirmDialog(false);
  };

  const handleRedirectTopPage = async () => {
    signOut({ callbackUrl: ROUTE.INDEX });
  };

  const handleDelete = async () => {
    try {
      setErrMsg("");
      await deleteUser();
      hideConfirmationDialog();
      setMode(DeleteAccountMode.Completion);
      setTimeout(handleRedirectTopPage, 5000);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  return (
    <UserLayout
      title="マイページ"
      breadcrumbItems={[
        { label: "トップ", href: ROUTE.INDEX },
        { label: "アカウント削除", href: ROUTE.USER_DELETE_ACCOUNT },
      ]}
    >
      {mode === DeleteAccountMode.Confirmation && (
        <section className="flex flex-col gap-[48px] relative max-w-[756px] mt-[18px] xsup:mb-[250px] mx-auto">
          <div className="xs:w-[375px] md:max-w-[600px] mx-auto">
            <div className="flex flex-col items-center gap-12 xs:gap-6 px-5 pb-24 mx-auto text-center">
              <div className="flex flex-col items-center gap-[32px]">
                <h3 className="usr-title-line text-center xs:max-w-[340px] ">アカウント削除の前にご確認ください</h3>
                <div className="text-base leading-[24px] font-light text-color">
                  <p className="w-[700px] xs:w-[350px]">
                    アカウント削除を行うと、現在保存されているお客様の情報やご利用履歴、フリーパスや事前予約情報など全て削除されます。
                    <br />
                    同じアドレス・LINEアカウントでの登録はできなくなるため、再度、ご利用いただく際は、別のアドレス・LINEアカウントで再登録・ご購入が必要となります。
                    <br />
                    このままお手続きを進めてよろしいでしょうか。
                  </p>
                </div>
              </div>
              <div>
                <Button type="submit" variant="contained" onClick={showConfirmationDialog} className="xs:w-[290px] w-[403px] xs:h-12 h-16 md:!text-lg">
                  アカウントを削除する
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
      {isShowConfirmDialog && (
        <ConfirmationDialog
          dismissText="戻る"
          acceptText="削除する"
          message="アカウントを削除します。 <br>
          よろしいでしょうか？"
          onDismiss={hideConfirmationDialog}
          onAccept={handleDelete}
        />
      )}
      {/*Error*/}
      <Error message={errMsg} />
      {mode === DeleteAccountMode.Completion && (
        <section className="flex flex-col gap-[48px] relative max-w-[550px] mt-[47px] xsup:mb-[250px] mx-auto">
          <div className="flex flex-col items-center  gap-12 xs:gap-6 px-5 pb-24 mx-auto text-center">
            <div className="flex flex-col items-center gap-[32px]">
              <h3 className="usr-title-line text-center  ">アカウントを削除しました</h3>
              <div className="text-base leading-[24px] font-light text-color">
                <p>ご利用ありがとうございました。またのお越しをお待ちしております。</p>
              </div>
            </div>
            <div>
              <Button variant="contained" onClick={handleRedirectTopPage} className="xs:w-[290px] w-[403px] xs:h-12 h-16 md:!text-lg">
                TOPページに戻る
              </Button>
            </div>
          </div>
        </section>
      )}
    </UserLayout>
  );
}
