import { yupResolver } from "@hookform/resolvers/yup";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Dialog, DialogActions } from "@mui/material";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

import AdminButton from "components/common/Buttons/AdminButton";
import Error from "components/common/Error";
import PasswordInputField from "components/common/Fields/PasswordInputField";
import TextInputField from "components/common/Fields/TextInputField";
import { staffConfirmationSchema } from "libs/validation/schemas";
import { confirmCredentials } from "services/api-client/admin/auth.service";
import { NotificationType, showNotification } from "stores/reducers/notification";
import { ERROR_MESSAGES } from "constants/errors";

import styles from "./index.module.scss";

interface Props {
  loggedStaffId?: string;
  onAccept: any;
  onDismiss: any;
}

type FormData = {
  idOrEmail: string;
  password: string;
};

export default function CredentialsConfirmationDialog({ loggedStaffId, onAccept, onDismiss }: Props) {
  const dispatch = useDispatch();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(staffConfirmationSchema) });

  const onSubmit = async (values: FormData) => {
    try {
      if (loggedStaffId && loggedStaffId.toString() !== values.idOrEmail) {
        dispatch(showNotification({ type: NotificationType.ERROR, message: ERROR_MESSAGES.INVALID_CREDENTIAL }));
        return;
      }

      const payload = {
        idOrEmail: values.idOrEmail.toLowerCase(),
        password: values.password
      };

      const staffOrAdmin = await confirmCredentials(payload);
      onAccept(staffOrAdmin);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      dispatch(showNotification({ type: NotificationType.ERROR, message }));
    }
  };

  const handleDismiss = () => {
    onDismiss();
  };

  return (
    <Dialog disablePortal open={true} onClose={handleDismiss} className={`${styles.dialog} w-[607px] mx-auto`}>
      <div className="flex flex-col items-center justify-center py-6">
        <div>
          <div className={`${styles.icon} flex items-center justify-center`}>
            <WarningAmberIcon />
          </div>
        </div>
        <form id="credentials-confirmation" onSubmit={handleSubmit(onSubmit)} className="min-w-[366px]">
          <h2 className="my-8 text-base font-medium">操作を進めるために、従業員IDとパスワードの入力が必要です。</h2>

          {/* Id Or Email */}
          <div className="mb-4">
            <TextInputField className="w-full ad-input-field" placeholder="IDを入力してください" name="idOrEmail" control={control} />
            {errors.idOrEmail && <Error message={errors.idOrEmail.message} />}
          </div>

          {/* Password */}
          <div>
            <PasswordInputField className="w-full ad-input-field" placeholder="パスワードを入力してください" name="password" control={control} />
            {errors.password && <Error message={errors.password.message} />}
          </div>
        </form>

        <DialogActions className="flex gap-4 mt-6">
          <AdminButton onClick={handleDismiss} variant="outlined" className="w-[125px] h-[48px] !p-0">
            キャンセル
          </AdminButton>
          <AdminButton form="credentials-confirmation" type="submit" variant="contained" className="w-[125px] h-[48px]">
            次へ
          </AdminButton>
        </DialogActions>
      </div>
    </Dialog>
  );
}
