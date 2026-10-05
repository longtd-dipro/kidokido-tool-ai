import { yupResolver } from "@hookform/resolvers/yup";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Dialog, DialogActions } from "@mui/material";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useSession } from "next-auth/react";

import AdminButton from "components/common/Buttons/AdminButton";
import Error from "components/common/Error";
import PasswordInputField from "components/common/Fields/PasswordInputField";
import { passwordSchema } from "libs/validation/schemas";
import { confirmAdminPassword } from "services/api-client/admin/auth.service";
import { NotificationType, showNotification } from "stores/reducers/notification";
import { ERROR_MESSAGES } from "constants/errors";
import { ROLE } from "constants/common";

import styles from "./index.module.scss";

interface Props {
  onAccept: any;
  onDismiss: any;
}

type FormData = {
  password: string;
};

export default function PasswordConfirmationDialog({ onAccept, onDismiss }: Props) {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const user = session?.user;
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(passwordSchema) });

  const onSubmit = async (values) => {
    try {
      const admin = await confirmAdminPassword(values);
      onAccept(admin);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      dispatch(showNotification({ type: NotificationType.ERROR, message }));
    }
  };

  const handleDismiss = () => {
    onDismiss();
  };

  const getPlaceholder = () => {
    const placeholder = user?.role === ROLE.SUPER_ADMIN ? "パスワードを入力する" : "施設アカウントのパスワードを入力す";
    return placeholder;
  };

  return (
    <Dialog disablePortal open={true} onClose={handleDismiss} className={`${styles.dialog} w-[607px] mx-auto`}>
      <div className="flex flex-col items-center justify-center py-6">
        <div>
          <div className={`${styles.icon} flex items-center justify-center`}>
            <WarningAmberIcon />
          </div>
        </div>
        <form id="password-confirmation" onSubmit={handleSubmit(onSubmit)}>
          <h2 className="my-8 text-base font-medium">操作を進めるために、パスワード入力が必要です。</h2>
          <PasswordInputField className="w-full ad-input-field" placeholder={getPlaceholder()} name="password" control={control} />
          {errors.password && <Error message={ERROR_MESSAGES.PASSWORD_FIELD_IS_REQUIRED} />}
        </form>

        <DialogActions className="flex gap-4 mt-6">
          <AdminButton onClick={handleDismiss} variant="outlined" className="w-[125px] h-[48px] !p-0">
            キャンセル
          </AdminButton>
          <AdminButton form="password-confirmation" type="submit" variant="contained" className="w-[125px] h-[48px]">
            次へ
          </AdminButton>
        </DialogActions>
      </div>
    </Dialog>
  );
}
