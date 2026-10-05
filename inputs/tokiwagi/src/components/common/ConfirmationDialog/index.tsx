import { Dialog, DialogActions, DialogContent } from "@mui/material";
import Image from "next/legacy/image";

import TrashIcon from "statics/images/confirmation-trash-red.svg";
import UserSiteLoadingButton from "components/common/Buttons/LoadingButton";

import AdminButton from "../Buttons/AdminButton";

import styles from "./index.module.scss";

interface Props {
  title?: string;
  prefixMessage?: string;
  message?: string;
  onAccept: any;
  onDismiss: any;
  fullScreen?: boolean;
  isSubmitting?: boolean;
}

export default function ConfirmationDialog({ title, prefixMessage, message, isSubmitting, onAccept, onDismiss }: Props) {
  return (
    <Dialog disablePortal open={true} onClose={onDismiss} aria-labelledby="responsive-dialog-title" className={`${styles.dialog} max-w-[607px] w-full mx-auto`}>
      <div className="flex flex-col items-center justify-center py-6">
        <Image src={TrashIcon} alt="trash" />
        <h2 className="mt-4 text-xl font-bold">{title || "Confirmation"}</h2>
        <DialogContent>
          <span>
            {prefixMessage && <span className="text-base font-bold">{prefixMessage}</span>}
            <span className="text-base text-center font-medium" dangerouslySetInnerHTML={{ __html: message || "Are you sure to delete this item ?" }}></span>
          </span>
        </DialogContent>
        <DialogActions className="flex gap-4 mt-6">
          <AdminButton variant="outlined" onClick={onDismiss} className="w-[145px] h-[48px]">
            キャンセル
          </AdminButton>
          <UserSiteLoadingButton isLoading={isSubmitting} onClick={onAccept} variant="contained" className="w-[145px] h-[48px] !text-white">
            削除する
          </UserSiteLoadingButton>
        </DialogActions>
      </div>
    </Dialog>
  );
}
