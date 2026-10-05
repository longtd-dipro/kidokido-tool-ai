import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";

import Button from "components/common/Buttons/AdminButton";
import Error from "components/common/Error";
import PasswordInputField from "components/common/Fields/PasswordInputField";
import TextInputField from "components/common/Fields/TextInputField";
import { signInSchema } from "libs/validation/schemas";
import { confirmAdminCredentials } from "services/api-client/admin/auth.service";

type FormData = {
  email: string;
  password: string;
};

type Props = {
  onAccept: () => void;
};

export default function AdminCredentialsConfirmation({ onAccept }: Props) {
  // Variable
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(signInSchema),
  });

  // State
  const [errMsg, setErrMsg] = useState<string>();

  // Function
  const onSubmit = async (data: FormData) => {
    setErrMsg("");
    try {
      await confirmAdminCredentials(data);
      onAccept();
    } catch (err) {
      const message = err.response?.data?.error || err.message;

      setErrMsg(message);
    }
  };

  const removeErrMsg = () => {
    setErrMsg("");
  };

  // Render
  return (
    <section className="ad-section-container ad-table-wrapper mb-12 w-[650px] mx-auto pt-12 pb-9 px-7">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-[12px]">
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
              placeholder="パスワードを入力してください"
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

          {/*Submit*/}
          <div className="flex justify-center order-4">
            <Button type="submit" variant="contained" className="flex w-[230px] h-[56px]">
              <h2 className="text-center text-base font-bold leading-[20px] px-[57px] py-[8px] ad-white-color">次へ</h2>
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
