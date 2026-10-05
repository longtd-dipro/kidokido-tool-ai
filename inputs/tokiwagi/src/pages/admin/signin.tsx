import { yupResolver } from "@hookform/resolvers/yup";
import { useSession } from "next-auth/react";
import Image from "next/legacy/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import AdminConfirmSecurityAnswerDialog from "components/AdminConfirmSecurityAnswerDialog";
import Button from "components/common/Buttons/AdminButton";
import Error from "components/common/Error";
import PasswordInputField from "components/common/Fields/PasswordInputField";
import TextInputField from "components/common/Fields/TextInputField";
import { ROLE } from "constants/common";
import { ERROR_MESSAGES } from "constants/errors";
import WarningDialog from "components/common/WarningDialog";
import { requestUnlockAccount, checkCredentials } from "services/api-client/auth.service";
import { ROUTE } from "constants/route";
import { signInSchema } from "libs/validation/schemas";
import { User } from "models/Entity";

import LogoAdmin from "../../statics/images/logo-login-admin.svg";

type FormData = {
  email: string;
  password: string;
};

export default function SignIn() {
  const [errMsg, setErrMsg] = useState<string>();
  const [isShowLockedAdminDialog, setIsShowLockedAdminDialog] = useState<boolean>(false);
  const [isShowLockedSuperAdminDialog, setIsShowLockedSuperAdminDialog] = useState<boolean>(false);

  const [isShowConfirmSecurityAnswerDialog, setIsShowConfirmSecurityAnswerDialog] = useState<boolean>(false);
  const [enteredUser, setEnteredUser] = useState<User>();
  const router = useRouter();

  const { data: session } = useSession();
  const user = session?.user;

  useEffect(() => {
    if (user) {
      if (user.role === ROLE.USER) {
        router.push(ROUTE.INDEX);
      } else {
        router.push(ROUTE.ADMIN_INDEX);
      }
    }
  }, [user]);

  const {
    handleSubmit,
    control,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(signInSchema),
  });

  const onSubmit = async (values) => {
    setErrMsg("");
    try {
      const user: User = await checkCredentials({ email: values.email, password: values.password });
      setEnteredUser(user);
      showConfirmSecurityAnswerDialog();
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      if (message === ERROR_MESSAGES.LOCKED_ADMIN) {
        showLockedAdminDialog();
        return;
      }

      if (message === ERROR_MESSAGES.LOCKED_SUPER_ADMIN) {
        showLockedSuperAdminDialog();
        return;
      }

      setErrMsg(message);
    }
  };

  const showLockedAdminDialog = () => setIsShowLockedAdminDialog(true);
  const hideLockedAdminDialog = () => setIsShowLockedAdminDialog(false);

  const showLockedSuperAdminDialog = () => setIsShowLockedSuperAdminDialog(true);
  const hideLockedSuperAdminDialog = () => setIsShowLockedSuperAdminDialog(false);

  const removeErrMsg = () => {
    setErrMsg("");
  };

  const handleRequestUnlockAccount = async () => {
    hideLockedSuperAdminDialog();
    try {
      setErrMsg("");
      await requestUnlockAccount({ email: getValues("email") });
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const showConfirmSecurityAnswerDialog = () => setIsShowConfirmSecurityAnswerDialog(true);
  const hideConfirmSecurityAnswerDialog = () => setIsShowConfirmSecurityAnswerDialog(false);

  return (
    <section className="admin h-screen flex relative">
      <div className="flex flex-col justify-center items-center mx-auto">
        <div className="ad-section-container max-w-[450px] px-[28px] pt-[48px] pb-[36px]">
          <div className="flex justify-center">
            <Image src={LogoAdmin} alt="Logo" />
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-[12px] mt-[43px] mb-[68px">
              <h2 className="flex justify-center h-[38px] items-center text-base leading-[20px] font-bold text-center">
                メールアドレスとパスワードでログインしてください
              </h2>
              {/*Email*/}
              <div className="relative">
                <TextInputField
                  name="email"
                  control={control}
                  placeholder="メールアドレスを入力してください"
                  inputProps={{
                    className: "pt-[17px] pb-[16px] px-[12px]",
                    maxLength: 256,
                  }}
                  onChangeCapture={removeErrMsg}
                  className="w-full ad-input-field"
                />
                {errors.email && <Error message={errors.email.message} />}
              </div>
              {/*Password*/}
              <div className="relative">
                <PasswordInputField
                  name="password"
                  placeholder="*********"
                  control={control}
                  inputProps={{
                    className: "pt-[17px] pb-[16px] px-[12px]",
                    maxLength: 256,
                  }}
                  onChangeCapture={removeErrMsg}
                  className="w-full ad-input-field mb-3"
                />
                {errors.password && <Error message={errors.password.message} />}
              </div>
              {/*Error*/}
              <div className="text-center mt-3">
                <Error message={errMsg} />
              </div>
              {/* Forgot password */}
              <div className="flex justify-center items-center h-[34px] order-3">
                <Link href={ROUTE.ADMIN_FORGOT_PASSWORD} legacyBehavior>
                  <a className="block underline text-[14px] leading-[34px] ad-text-link">パスワードを忘れた場合</a>
                </Link>
              </div>

              {/*Submit*/}
              <div className="flex justify-center order-4">
                <Button type="submit" variant="contained" className="flex w-[230px] h-[56px]">
                  <h2 className="text-center text-base font-bold leading-[20px] px-[57px] py-[8px] ad-white-color">ログイン</h2>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Error Dialogs */}
      {isShowLockedAdminDialog && (
        <WarningDialog
          text="OK"
          message="ログイン回数の上限を越えたのでアカウントがロックされました。解除するために運営管理者にご連絡ください。"
          hideDismissButton
          onDismiss={hideLockedAdminDialog}
          onAccept={hideLockedAdminDialog}
        />
      )}

      {isShowLockedSuperAdminDialog && (
        <WarningDialog
          text="送信する"
          message="ログイン回数の上限を越えたのでアカウントがロックされました。解除するために以下の「送信」ボタンにクリックしてください。メールアドレスに認証URLを送信します。URLリンクをクリックしてアカウントのロックを解除できます。"
          hideDismissButton
          onDismiss={hideLockedSuperAdminDialog}
          onAccept={handleRequestUnlockAccount}
        />
      )}

      {/* Admin Confirm Security Answer Dialog */}
      {isShowConfirmSecurityAnswerDialog && (
        <AdminConfirmSecurityAnswerDialog
          email={enteredUser?.email}
          password={getValues("password")}
          onLockAdmin={() => {
            hideConfirmSecurityAnswerDialog();
            showLockedAdminDialog();
          }}
          onLockSuperAdmin={() => {
            hideConfirmSecurityAnswerDialog();
            showLockedSuperAdminDialog();
          }}
        />
      )}
    </section>
  );
}
