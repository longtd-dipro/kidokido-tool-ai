import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/legacy/image";

import ResetPasswordSuccess from "components/ResetPasswordAdmin/ResetPasswordSuccess";
import Error from "components/common/Error";
import { resetPasswordSchema } from "libs/validation/schemas";
import { resetPassword } from "services/api-client/auth.service";
import Button from "components/common/Buttons/AdminButton";
import PasswordInputField from "components/common/Fields/PasswordInputField";
import LogoAdmin from "statics/images/logo-login-admin.svg";

enum ResetPasswordStep {
  ConfirmPassword,
  Completion,
}

type FormData = {
  password: string;
  confirmedPassword: string;
};

export default function ResetPassword() {
  const [errMsg, setErrMsg] = useState<string>();
  const [step, setStep] = useState<ResetPasswordStep>(
    ResetPasswordStep.ConfirmPassword
  );
  const router = useRouter();
  const { token } = router.query;

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(resetPasswordSchema),
  });

  const onSubmit = async (values) => {
    setErrMsg("");
    try {
      await resetPassword({ token, ...values });
      setStep(ResetPasswordStep.Completion);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  return (
    <>
      {step === ResetPasswordStep.ConfirmPassword && (
        <section className="admin h-screen flex relative">
          <div className="flex flex-col justify-center items-center mx-auto">
            <div className="ad-section-container max-w-[450px] px-[28px] pt-[48px] pb-[36px]">
              <div className="flex justify-center">
                <Image src={LogoAdmin} alt="Logo" />
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-[24px] mt-[43px] mb-[68px]">
                  <div className="flex flex-col">
                    <h2 className="flex justify-center h-[38px] items-center text-[18px] leading-[24px] font-bold text-center">
                      パスワードの再設定
                    </h2>
                  </div>
                  {/*Password*/}
                  <div className="relative">
                    <label
                      htmlFor="message"
                      className="text-base leading-[20px] text-color-3 font-medium"
                    >
                      新しいパスワード
                    </label>
                    <PasswordInputField
                      name="password"
                      placeholder="**************"
                      control={control}
                      inputProps={{
                        className: "pt-[17px] pb-[16px] px-[12px]",
                        maxLength: 256,
                      }}
                      className="w-full ad-input-field mt-[16px]"
                    />
                    {errors.password && (
                      <Error message={errors.password.message} />
                    )}
                  </div>

                  {/*Confirm password*/}
                  <div className="relative">
                    <label
                      htmlFor="message"
                      className="text-base leading-[20px] text-color-3 font-medium"
                    >
                      新しいパスワードの確認
                    </label>
                    <PasswordInputField
                      name="confirmedPassword"
                      placeholder="**************"
                      control={control}
                      inputProps={{
                        className: "pt-[17px] pb-[16px] px-[12px]",
                        maxLength: 256,
                      }}
                      className="w-full ad-input-field mt-[16px]"
                    />
                    {errors.confirmedPassword && (
                      <Error message={errors.confirmedPassword.message} />
                    )}
                  </div>

                  <div className="flex justify-center">
                    {/*Submit*/}
                    <Button
                      type="submit"
                      variant="contained"
                      className="flex w-[230px] h-[56px]"
                    >
                      <h2 className="text-center text-base font-bold leading-[20px] px-[57px] py-[8px]">
                        設定
                      </h2>
                    </Button>
                  </div>
                </div>
              </form>
              {/*Error*/}
              <Error message={errMsg} />
            </div>
          </div>
        </section>
      )}
      {step === ResetPasswordStep.Completion && <ResetPasswordSuccess />}
    </>
  );
}
