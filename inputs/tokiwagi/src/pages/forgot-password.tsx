import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";

import Error from "components/common/Error";
import Layout from "components/common/Layout";
import Button from "components/common/Buttons/Button";
import TextInputField from "components/common/Fields/TextInputField";
import ForgotPasswordSuccess from "components/ForgotPassword/ForgotPasswordSuccess";
import { forgotPasswordSchema } from "libs/validation/schemas";
import { forgotPassword } from "services/api-client/auth.service";
import Breadcrumb from "components/common/UserLayout/Breadcrumb";
import ErrorDialog from "components/common/ErrorDialog";

type FormData = {
  email: string;
};

enum ForgotPasswordStep {
  InputEmail,
  Completion,
}

export default function ForgotPassword() {
  const [errMsg, setErrMsg] = useState<string>();
  const [isShowErrorDialog, setIsShowErrorDialog] = useState<boolean>(false);
  const [step, setStep] = useState<ForgotPasswordStep>(ForgotPasswordStep.InputEmail);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
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
      showErrorDialog();
    }
  };

  const showErrorDialog = () => {
    setIsShowErrorDialog(true);
  };

  const hideErrorDialog = () => {
    setIsShowErrorDialog(false);
  };

  const handleResendEmail = async () => {
    try {
      await forgotPassword(getValues());
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  return (
    <Layout>
      <div className="xs:hidden mdonly:ml-[40px] ml-[270px]">
        <Breadcrumb title="ログイン" />
      </div>
      {step === ForgotPasswordStep.InputEmail && (
        <section className="flex flex-col gap-[48px] relative max-w-[600px] xs:px-5 xs:mb-[365px] md:mb-[1023px] mb-[840px] mx-auto">
          <div className="flex flex-col justify-center">
            <div className="relative z-10 flex flex-col gap-[48px] xs:gap-9 mt-10 md:mt-8 xs:mt-[18px]">
              <div className="flex flex-col gap-4 xs:gap-[10px] items-center">
                <h2 className="usr-title-line text-center">パスワードを忘れた場合</h2>
                <p className="text-base leading-[20px] md:text-sm md:leading-6 text-center md:font-light font-medium text-blue-color">
                  パスワードを再設定します。
                  <div className="xsup:hidden h-0">
                    <br />
                  </div>
                  登録しているメールアドレスを入力してください。
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                {/*Email*/}
                <div className="flex flex-col flex-start">
                  <label htmlFor="email" className="text-[20px] !leading-7 text-color font-medium xs:text-base">
                    メールアドレス
                  </label>
                  <TextInputField
                    name="email"
                    id="email"
                    control={control}
                    placeholder="abc@gmail.com"
                    inputProps={{
                      className: "border-0 usr-input-field p-[16.5px]",
                      maxLength: 256,
                    }}
                    className="w-full usr-input-field mt-[10px] xs:mt-2"
                  />
                  {errors.email && <Error message={errors.email.message} />}
                  <p className="mt-6 xs:text-sm md:text-base md:leading-6 xs:font-semibold font-light xs:tracking-tight">
                    上記メールアドレスに再設定用のURLを送信します。
                  </p>
                </div>

                <div className="flex flex-col items-center mt-12 xs:mt-6">
                  {/*Submit*/}
                  <Button type="submit" variant="contained" className="md:w-[290px] md:h-12 md:!text-[18px] w-[360px] h-[64px]">
                    パスワードを忘れた場合
                  </Button>
                </div>
              </form>

              {/*Error*/}
              {isShowErrorDialog && <ErrorDialog text="OK" message={errMsg} onDismiss={hideErrorDialog} />}
            </div>
          </div>
        </section>
      )}

      {step === ForgotPasswordStep.Completion && <ForgotPasswordSuccess onResendEmail={handleResendEmail} />}
    </Layout>
  );
}
