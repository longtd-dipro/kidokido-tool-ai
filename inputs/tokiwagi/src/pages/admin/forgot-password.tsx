import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/legacy/image";

import Error from "components/common/Error";
import { ROUTE } from "constants/route";
import { forgotPasswordSchema } from "libs/validation/schemas";
import { forgotPassword } from "services/api-client/auth.service";
import Button from "components/common/Buttons/AdminButton";
import TextInputField from "components/common/Fields/TextInputField";

import LogoAdmin from "../../statics/images/logo-login-admin.svg";

type FormData = {
  email: string;
};

enum ForgotPasswordStep {
  InputEmail,
  Completion,
}

export default function ForgotPassword() {
  const [errMsg, setErrMsg] = useState<string>();
  const [step, setStep] = useState<ForgotPasswordStep>(
    ForgotPasswordStep.InputEmail
  );
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values) => {
    setErrMsg("");
    try {
      await forgotPassword(values);
      setStep(ForgotPasswordStep.Completion);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  return (
    <>
      {step === ForgotPasswordStep.InputEmail && (
        <section className="admin h-screen flex relative">
          <div className="flex flex-col justify-center items-center mx-auto">
            <div className="flex flex-col gap-[43px] ad-section-container xsup:w-[450px] px-[28px] pt-[48px] pb-[36px]" >
              <div className="flex justify-center">
                <Image src={LogoAdmin} alt="Logo" />
              </div>
              <div className="flex flex-col gap-[24px] mb-[116px]">
                <div className="text-center flex flex-col gap-[8px]">
                  <h2 className="text-[18px] leading-[24px] text-color-3 font-bold h-[30px]">
                    パスワードを忘れた場合
                  </h2>
                  <p className="text-base leading-[20px] font-medium">
                    メールアドレスを入力してください
                  </p>
                </div>

                <form id="forgot-password" onSubmit={handleSubmit(onSubmit)}>
                  {/*Email*/}
                  <div className="relative">
                    <TextInputField
                      name="email"
                      control={control}
                      placeholder="メールアドレスを入力してください"
                      inputProps={{
                        className: "pt-[17px] pb-[16px] px-[12px]",
                        maxLength: 256
                      }}
                      className="w-full ad-input-field mb-3"
                    />
                    {errors.email && <Error message={errors.email.message} />}

                  </div>
                </form>
                <div className="flex justify-center">
                  {/*Submit*/}
                  <Button
                    form="forgot-password"
                    type="submit"
                    variant="contained"
                    className="flex w-[230px] h-[56px]"
                  >
                    <h3 className="text-center text-base font-bold leading-[20px] ad-white-color">
                      メール送信
                    </h3>
                  </Button>
                </div>
                {/*Error*/}
                <div className="text-center">
                  <Error message={errMsg} />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {step === ForgotPasswordStep.Completion && (
        <section className="admin h-screen flex relative">
          <div className="flex flex-col justify-center items-center mx-auto">
            <div className="flex flex-col gap-[43px] ad-section-container max-w-[526px] p-[24px]" >
              <div className="flex justify-center">
                <Image src={LogoAdmin} className="mr-3 h-8 sm:h-9" alt="Logo" />
              </div>
              <div className="flex flex-col gap-[24px]">
                <h2 className="flex-none order-0 shrink-0 text-[24px] leading-[32px] font-bold ad-text-color-3 text-center">
                承認メール
                </h2>
                <div>
                  <h3 className="text-base leading-[20px] font-medium text-center ad-text-color-3">
                  メールアドレスに認証URLを送信しました。
                    <br/>
                  URLリンクをクリクしてパスワードの再設定画面に遷移します。
                  </h3>
                </div>
              </div>
              <div className="flex justify-center">
                {/*Submit*/}

                <Button
                  href={ROUTE.ADMIN_SIGN_IN}
                  type="submit"
                  variant="contained"
                  className="flex w-[230px] h-[56px]"
                >
                  <h2 className="text-center text-base font-bold leading-[20px] px-[57px] py-[8px] ad-white-color">
                    ログイン
                  </h2>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
