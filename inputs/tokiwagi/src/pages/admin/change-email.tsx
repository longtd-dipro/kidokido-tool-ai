import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Box } from "@mui/material";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";

import AdminLayout from "components/common/AdminLayout";
import { emailSchema } from "libs/validation/schemas";
import TextInputField from "components/common/Fields/TextInputField";
import Button from "components/common/Buttons/AdminButton";
import Error from "components/common/Error";
import { changeEmail } from "services/api-client/auth.service";
import {
  NotificationType,
  showNotification,
} from "stores/reducers/notification";
import { MESSAGES } from "constants/messages";
import { ROLE } from "constants/common";
import { withAuthentication } from "libs/hoc/withAuthentication";

type FormData = {
  email: string;
};

function UpdateSuperAdminEmail() {
  const [errMsg, setErrMsg] = useState<string>();
  const { data: session } = useSession();

  const dispatch = useDispatch();

  const currentEmail = session?.user.email;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(emailSchema),
  });

  const onSubmit = async (values) => {
    setErrMsg("");
    try {
      await changeEmail(values);
      dispatch(
        showNotification({
          type: NotificationType.SUCCESS,
          message: MESSAGES.CHANGE_EMAIL_SUCCESSFUL,
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
  };

  return (
    <AdminLayout>
      <Box className="flex w-4/5 h-[550px] mx-auto mt-[76px] justify-center ad-section-container">
        <div className="flex flex-col w-[530px] h-[235px] m-auto">
          <h2 className="flex justify-center mb-[34px] text-[20px] leading-[28px] font-bold">
            メール変更
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col max-w-[530px] mx-auto mb-[50px] gap-[79px]">
              {/*Email*/}
              <div className="flex flex-col mx-[28px]">
                <TextInputField
                  name="email"
                  control={control}
                  defaultValue={null}
                  placeholder={currentEmail}
                  className="w-full ad-input-field"
                />
                {errors.email && <Error message={errors.email.message} />}
              </div>

              <div className="flex gap-[130px] xs:gap-20 justify-between max-w-[530px]">
                <Button
                  type="reset"
                  variant="outlined"
                  onClick={onReset}
                  className="w-[200px] h-[48px] xs:w-[144px] xs:h-[36px]"
                >
                  リセット
                </Button>
                {/*Submit*/}
                <Button
                  type="submit"
                  variant="contained"
                  className="w-[200px] h-[48px] xs:w-[144px] xs:h-[36px]"
                >
                  保存する
                </Button>
              </div>
            </div>
          </form>

          {/*Error*/}
          <Error message={errMsg} />
        </div>
      </Box>
    </AdminLayout>
  );
}

export default withAuthentication(UpdateSuperAdminEmail, [ROLE.SUPER_ADMIN]);
