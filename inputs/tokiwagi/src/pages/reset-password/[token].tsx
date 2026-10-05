import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";

import Error from "components/common/Error";
import PasswordInputField from "components/common/Fields/PasswordInputField";
import Button from "components/common/Buttons/Button";
import Layout from "components/common/Layout";
import Breadcrumb from "components/common/UserLayout/Breadcrumb";
import { ROUTE } from "constants/route";
import { resetPasswordSchema } from "libs/validation/schemas";
import { resetPassword } from "services/api-client/auth.service";

type FormData = {
  password: string;
  confirmedPassword: string;
};

export default function ResetPassword() {
  const [errMsg, setErrMsg] = useState<string>();
  const router = useRouter();
  const { token } = router.query;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(resetPasswordSchema),
  });

  const onSubmit = async (values) => {
    setErrMsg("");
    try {
      await resetPassword({ token, ...values });
      router.push(ROUTE.RESET_PASSWORD_SUCCESS);
      
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
      <section className="flex flex-col gap-[48px] relative max-w-[600px] mb-[726px] xs:mb-[253px] md:mb-[909px] mx-auto">
        <div className="flex flex-col justify-center xs:mx-5">
          <div className="relative flex flex-col gap-12 md:gap-9 mt-10 md:mt-8 xs:mt-[18px]">
            <div className="flex flex-col gap-[16px] md:gap-[10px] items-center">
              <h2 className="usr-title-line text-center">パスワードの再設定</h2>
              <p className="text-base leading-[20px] md:text-sm md:leading-6 text-center md:font-light font-medium md:text-blue-color">新しいパスワードを入力してください</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/*Password*/}
              <div className="flex flex-col gap-[24px]">
                <div>
                  <label
                    htmlFor="message"
                    className="text-[20px] !leading-7 text-color font-medium xs:text-base"
                  >
                    新しいパスワード
                  </label>
                  <div className="text-sm leading-[20px] font-medium text-color xs:text-xs xs:font-light xs:mt-2 md:mt-[10px]">
                    <p>※半角記号英数字8文字以上</p>
                    <p>
                      ※アルファベットの文字、数字をそれぞれ1文字以上使用してください。
                    </p>
                  </div>

                  <PasswordInputField
                    name="password"
                    placeholder="新しいパスワードを入力してください"
                    control={control}
                    inputProps={{
                      className: "border-0 usr-input-field p-[16.5px]",
                      maxLength: 256,
                    }}
                    className="w-full usr-input-field mt-[10px] xs:mt-2"
                  />
                  {errors.password && (
                    <Error message={errors.password.message} />
                  )}
                </div>
                <div>
                  {/*Confirm password*/}
                  <div className="relative">
                    <label
                      htmlFor="message"
                      className="text-[20px] !leading-7 text-color font-medium xs:text-base"
                    >
                      新しいパスワード（確認）
                    </label>
                    <PasswordInputField
                      name="confirmedPassword"
                      placeholder="もう一度入力してください"
                      control={control}
                      inputProps={{
                        className:
                          "border-0 usr-input-field p-[16.5px]",
                        maxLength: 256,
                      }}
                      className="w-full usr-input-field mt-[10px] xs:mt-2"
                    />
                    {errors.confirmedPassword && (
                      <Error message={errors.confirmedPassword.message} />
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full flex flex-col items-center mt-12 xs:mt-6">
                {/*Submit*/}
                <Button
                  type="submit"
                  variant="contained"
                  className="md:w-[290px] md:h-12 md:!text-[18px] w-[360px] h-[64px]"
                >
                  変更する
                </Button>
              </div>
            </form>
            {/*Error*/}
            <Error message={errMsg} />
          </div>
        </div>
      </section>
    </Layout>
  );
}
