import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/legacy/image";
import { useRouter } from "next/router";

import Error from "components/common/Error";
import { forgotPasswordSchema } from "libs/validation/schemas";
import TextInputField from "components/common/Fields/TextInputField";
import UserLayout from "components/common/UserLayout";
import UnlockImage from "statics/images/user/icon-unlock.svg";
import Label from "components/common/Admin/Label";
import Button from "components/common/Buttons/Button";
import { ROUTE } from "constants/route";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { ROLE } from "constants/common";
import ErrorDialog from "components/common/ErrorDialog";
import { updatePassword } from "services/api-client/auth.service";
import { ALLOW_RESEND_EMAIL_INTERVAL_IN_SECONDS } from "constants/settings";

type FormData = {
  email: string;
};

function ChangePassword() {
  const [errMsg, setErrMsg] = useState<string>();
  const [isShowErrorDialog, setIsShowErrorDialog] = useState<boolean>(false);
  const router = useRouter();
  const [shouldDisableResend, setShouldDisableResend] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(ALLOW_RESEND_EMAIL_INTERVAL_IN_SECONDS);

  useEffect(() => {
    if (shouldDisableResend) {
      const interval = setInterval(() => {
        setCountdown((countdown) => {
          const newCountdown = --countdown;
          if (newCountdown === 0) {
            clearInterval(interval);
            setShouldDisableResend(false);
          }
          return countdown;
        });
      }, 1000);
    }
  }, [shouldDisableResend]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values) => {
    try {
      setShouldDisableResend(true);
      setCountdown(ALLOW_RESEND_EMAIL_INTERVAL_IN_SECONDS);
      await updatePassword(values);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
      showErrorDialog();
    }
  };

  const handleRedirect = () => {
    router.push(ROUTE.USER_PERSONAL_INFO);
  };

  const showErrorDialog = () => {
    setIsShowErrorDialog(true);
  };

  const hideErrorDialog = () => {
    setIsShowErrorDialog(false);
  };

  return (
    <UserLayout
      heading="アカウント情報の編集"
      title="マイページ"
      breadcrumbItems={[
        { label: "トップ", href: ROUTE.INDEX },
        { label: "アカウント情報の確認・編集", href: ROUTE.USER_PERSONAL_INFO },
        { label: "パスワード変更", href: ROUTE.USER_CHANGE_PASSWORD },
      ]}
    >
      <section className="container xs:pr-2 mdonly:pr-4  lg:max-w-5xl w-full mx-auto xs:!w-[335px] mdonly:!w-[688px]">
        {/* Heading */}
        <div className="pl-4 py-6 bg-[#fafafa] flex flex-row justify-between items-center gap-4 relative ">
          <div className="flex items-center justify-center gap-x-5">
            <Image src={UnlockImage} alt={UnlockImage} />
            <span className="font-medium text-2xl text-blue-color">パスワードの変更</span>
          </div>
          <div className="absolute inset-0 border-b-2 border-dotted border-[#979797]"></div>
          <div className="absolute top-[24.5rem] left-0 bottom-0 right-0 border-b-2 border-dotted border-[#979797]"></div>
        </div>

        {/* Body */}
        <div className="lg:max-w-2xl w-full mx-auto container mt-10 ">
          <div className="xs:text-[14px]">
            パスワードをリセットします。登録している <span className="font-bold">メールアドレス</span> を入力してください。
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/*Email*/}
            <div className="relative mb-4 mt-8">
              <Label htmlFor="email" className="xsup:!text-[20px] xs:!text-[16px] w-[140px]">
                メールアドレス
              </Label>
              <TextInputField
                name="email"
                control={control}
                className={`${STYLES.INPUT_FIELD} mdonly:!w-[600px] mdonly:!h-[52px]  !mt-5`}
                placeholder="abc@gmail.com"
              />
              {errors.email && <Error message={errors.email.message} />}
              <div className="font-light leading-5 mt-8">上記メールアドレスに再設定用のURLを送信します。</div>
            </div>
            {/* Buttons */}
            <div className="xs:hidden flex justify-center gap-x-12 mt-28">
              {/*Button Back*/}
              <Button className="usr-button-inline mdonly:!text-[18px] !min-w-[200px]" onClick={handleRedirect}>
                戻る
              </Button>
              {/*Button Save*/}
              <Button disabled={shouldDisableResend} type="submit" className="usr-button-contained mdonly:!text-[18px]  !min-w-[350px]" variant="contained">
                パスワード再設定用メール送信 {shouldDisableResend ? `(${countdown})` : ""}
              </Button>
            </div>
            {/* MOBILE */}
            <div className="xsup:hidden mt-20 ml-[-10px] ">
              {/*Button Save*/}
              <Button disableTouchRipple={shouldDisableResend} type="submit" className="usr-button-contained !text-[18px]  !min-w-[350px]" variant="contained">
                パスワード再設定用メール送信 {shouldDisableResend ? `(${countdown})` : ""}
              </Button>
              {/*Button Back*/}
              <div className="mt-4">
                <Button className="usr-button-inline !text-[18px] !min-w-[350px]" onClick={handleRedirect}>
                  戻る
                </Button>
              </div>
            </div>
          </form>
        </div>
        {/*Error*/}
        {isShowErrorDialog && <ErrorDialog text="次へ" message={errMsg} onDismiss={hideErrorDialog} />}
      </section>
    </UserLayout>
  );
}
export default withAuthentication(ChangePassword, [ROLE.USER]);

const STYLES = {
  INPUT_LABEL: "text-base leading-7",
  INPUT_FIELD: "w-full px-3 py-1 ad-input-field",
};
