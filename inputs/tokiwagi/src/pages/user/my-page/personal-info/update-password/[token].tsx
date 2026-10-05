import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/legacy/image";

import Error from "components/common/Error";
import UnlockImage from "statics/images/user/icon-unlock.svg";
import PasswordInputField from "components/common/Fields/PasswordInputField";
import Button from "components/common/Buttons/Button";
import { ROUTE } from "constants/route";
import { resetPasswordSchema } from "libs/validation/schemas";
import { resetPassword } from "services/api-client/auth.service";
import UserLayout from "components/common/UserLayout";

type FormData = {
  password: string;
  confirmedPassword: string;
};

export default function UpdatePassword() {
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
      router.push(ROUTE.USER_UPDATE_PASSWORD_SUCCESS);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  return (
    <UserLayout heading="アカウント情報の編集" title="マイページ">
      <section className="container lg:max-w-5xl w-full mx-auto">
        {/* Heading */}
        <div className="pl-4 py-6 bg-[#fafafa] flex flex-row justify-between items-center gap-4 relative">
          <div className="flex items-center justify-center gap-x-5">
            <Image src={UnlockImage} alt={UnlockImage} />
            <span className="font-medium text-2xl text-blue-color">パスワードの変更</span>
          </div>
          <div className="absolute inset-0 border-b-2 border-dotted border-[#979797]"></div>
          <div className="absolute top-[30.5rem] left-0 bottom-0 right-0 border-b-2 border-dotted border-[#979797]"></div>
        </div>
        <section className="flex flex-col gap-[48px] relative max-w-[600px] xsup:mt-[40px] xsup:mb-[250px] mx-auto">
          <div className="flex flex-col justify-center xs:mx-5">
            <div className="relative flex flex-col gap-[48px]">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-8 font-light">新しいパスワードを入力してください</div>
                {/*Password*/}
                <div className="flex flex-col gap-[24px]">
                  <div>
                    <label htmlFor="message" className="text-[20px] leading-[28px] text-color font-medium">
                      新しいパスワード
                    </label>
                    <div className="text-[14px] leading-[20px] font-medium text-color mt-3">
                      <p>※半角記号英数字8文字以上</p>
                      <p>※アルファベットの文字、数字をそれぞれ1文字以上使用してください。</p>
                    </div>
                    <PasswordInputField
                      name="password"
                      placeholder="新しいパスワードを入力してください"
                      control={control}
                      inputProps={{
                        className: "border-0 usr-input-field py-[18px] px-[16px]",
                        maxLength: 256,
                      }}
                      className="w-full usr-input-field mt-[10px]"
                    />
                    {errors.password && <Error message={errors.password.message} />}
                  </div>
                  <div>
                    {/*Confirm password*/}
                    <div className="relative">
                      <label htmlFor="message" className="text-[20px] leading-[28px] text-color font-medium">
                        新しいパスワード（確認）
                      </label>
                      <PasswordInputField
                        name="confirmedPassword"
                        placeholder="もう一度入力してください"
                        control={control}
                        inputProps={{
                          className: "border-0 usr-input-field py-[18px] px-[16px]",
                          maxLength: 256,
                        }}
                        className="w-full usr-input-field mt-[10px]"
                      />
                      {errors.confirmedPassword && <Error message={errors.confirmedPassword.message} />}
                    </div>
                  </div>
                </div>

                <div className="w-full flex flex-col items-center mt-28">
                  {/*Submit*/}
                  <Button type="submit" variant="contained" className="w-[360px] xs:w-[300px] h-[64px]">
                    変更
                  </Button>
                </div>
              </form>
              {/*Error*/}
              <Error message={errMsg} />
            </div>
          </div>
        </section>
      </section>
    </UserLayout>
  );
}
