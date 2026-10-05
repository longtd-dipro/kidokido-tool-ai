import { Dialog, DialogActions, DialogContent } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import AdminButton from "components/common/Buttons/AdminButton";

import styles from "./index.module.scss";

interface Props {
  onAccept: any;
  onDismiss: any;
}

export default function ConfirmationSignOut({ onAccept, onDismiss }: Props) {
  return (
    <Dialog
      disablePortal
      open={true}
      onClose={onDismiss}
      className={`${styles.dialog} max-w-[607px] mdonly:max-w-[607px] xs:px-5 mx-auto`}
    >
      <div className={`${styles.container} flex flex-col items-center justify-center py-6`}>
        <div className={`${styles.icon} flex items-center justify-center`}>
          <WarningAmberIcon />
        </div>
        <DialogContent className="!py-8">
          <h3 className="text-base leading-5 font-bold">
            ログアウトしますか？
          </h3>
        </DialogContent>
        <DialogActions className="flex gap-4 !p-0">
          <AdminButton
            variant="outlined"
            onClick={onDismiss}
            className="w-[125px] !p-0 !text-base !leading-5 h-[44px]"
          >
            キャンセル
          </AdminButton>
          <AdminButton
            onClick={onAccept}
            variant="contained"
            className="w-[125px] !text-base !leading-5 h-[44px] !text-white"
          >
            Ok
          </AdminButton>
        </DialogActions>
      </div>
    </Dialog>
  );
}
