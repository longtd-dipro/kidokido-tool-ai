import { yupResolver } from "@hookform/resolvers/yup";
import { Box } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

import AdminLayout from "components/common/AdminLayout";
import Error from "components/common/Error";
import TextInputField from "components/common/Fields/TextInputField";
import Button from "components/common/Buttons/AdminButton";
import { ROLE } from "constants/common";
import { withAuthentication } from "libs/hoc/withAuthentication";
import { changeAdminPasswordSchema } from "libs/validation/schemas";
import { changePassword } from "services/api-client/auth.service";
import { NotificationType, showNotification } from "stores/reducers/notification";
import { MESSAGES } from "constants/messages";

type FormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

function ChangePassword() {
  const [errMsg, setErrMsg] = useState<string>();

  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(changeAdminPasswordSchema),
  });

  const onSubmit = async (values) => {
    setErrMsg("");
    try {
      await changePassword(values);
      dispatch(
        showNotification({
          type: NotificationType.SUCCESS,
          message: MESSAGES.CHANGE_PASSWORD_SUCCESSFUL,
        })
      );
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      reset();
    }
  };

  const onReset = async () => {
    reset();
    setErrMsg("");
  };

  return (
    <AdminLayout>
      <Box className="flex-1 w-4/5 mx-auto mt-[105px] justify-center ad-section-container">
        <div className="flex flex-col px-[35px] py-[45px]">
          <h2 className="flex justify-center mb-[34px] text-[20px] leading-[28px] font-bold">パスワード変更</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex max-w-[630px] mx-auto mb-[50px] gap-[28px] flex-nowrap">
              <div className="flex flex-col justify-between py-[14px] items-end gap-[60px] text-base leading-[20px] font-medium">
                <label htmlFor="currentPassword">現在パスワード</label>
                <label htmlFor="newPassword">新パスワード</label>
                <label htmlFor="confirmPassword">確認用パスワード</label>
              </div>
              <div className="flex flex-col grow gap-[32px]">
                {/*Current Password*/}
                <div className="flex flex-col">
                  <TextInputField
                    name="currentPassword"
                    control={control}
                    placeholder="現在パスワードを入力してください"
                    type="password"
                    className="w-full ad-input-field"
                    inputProps={{
                      maxLength: 256,
                    }}
                  />
                  {errors.currentPassword && <Error message={errors.currentPassword.message} />}
                </div>

                {/*New Password*/}
                <div className="flex flex-col">
                  <TextInputField
                    name="newPassword"
                    control={control}
                    placeholder="新パスワードを入力してください"
                    type="password"
                    className="w-full ad-input-field"
                    inputProps={{
                      maxLength: 256,
                    }}
                  />
                  {errors.newPassword && <Error message={errors.newPassword.message} />}
                </div>

                {/*Confirm Password*/}
                <div className="flex flex-col">
                  <TextInputField
                    name="confirmPassword"
                    control={control}
                    placeholder="確認用パスワードを入力してください"
                    type="password"
                    className="w-full ad-input-field"
                    inputProps={{
                      maxLength: 256,
                    }}
                  />
                  {errors.confirmPassword && <Error message={errors.confirmPassword.message} />}
                </div>
              </div>
            </div>

            {/*Submit*/}
            <div className="flex gap-[130px] xs:gap-20 mdonly:gap-12 mdonly:ml-[110px]  justify-between max-w-[530px] m-auto">
              <div className="flex ">
                <Button type="reset" variant="outlined" onClick={onReset} className="w-[200px] h-[48px] xs:w-[144px] xs:h-[36px] mdonly:w-[144px]">
                  リセット
                </Button>
              </div>
              <div className="flex">
                <Button type="submit" variant="contained" className="w-[200px] h-[48px] xs:w-[144px] xs:h-[36px] mdonly:w-[144px]">
                  保存する
                </Button>
              </div>
            </div>
          </form>

          {/*Error*/}
          <div className="flex justify-center mt-[15px]">
            <Error message={errMsg} />
          </div>
        </div>
      </Box>
    </AdminLayout>
  );
}

export default withAuthentication(ChangePassword, [ROLE.SUPER_ADMIN]);
