import { Dialog, DialogActions } from "@mui/material";

import UserSiteLoadingButton from "components/common/Buttons/LoadingButton";

import AdminButton from "../Buttons/AdminButton";

interface Props {
  onClose: any;
  onBack: any;
  isOpen?: boolean;
}

export default function ExpiredCreditCardDialog({
  isOpen,
  onClose,
  onBack,
}: Props) {
  return (
    <Dialog
      disablePortal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="responsive-dialog-title"
      className={"max-w-[616px] xsup:w-full mx-auto xs:mx-5"}
    >
      <div className="flex flex-col items-center justify-center py-6">
        <div className="py-5 px-1">
          <div className="flex flex-row xs:flex-col xs:items-center">
            <p>クレジットカードの有効期限が切れて</p>
            <p>おります。</p>
          </div>
        </div>
        <DialogActions className="flex gap-4 xs:flex-col lg:flex md:flex">
          <AdminButton
            variant="outlined"
            onClick={onBack}
            className="w-[200px] h-[48px]"
          >
            今すぐ更新する
          </AdminButton>
          <UserSiteLoadingButton
            onClick={onClose}
            variant="contained"
            className="w-[200px] h-[48px] !text-white"
            isLoading={false}
          >
            閉じる
          </UserSiteLoadingButton>
        </DialogActions>
      </div>
    </Dialog>
  );
}
