import { Dialog, DialogActions, DialogContent } from "@mui/material";
import Image from "next/legacy/image";

import CloseIcon from "statics/images/close.svg";
import Button from "components/common/Buttons/Button";
import UserSiteLoadingButton from "components/common/Buttons/LoadingButton";

interface Props {
  message?: string;
  dismissText?: string;
  acceptText?: string;
  onDismiss?: () => void;
  onAccept: () => void;
  onBack?: () => void;
  loading?: boolean;
  mobileButtonWidth?: number;
  mobileTextSize?: number;
}

export default function ConfirmationDialogUser({
  message,
  dismissText,
  acceptText,
  onDismiss,
  onAccept,
  onBack,
  loading = false,
  mobileButtonWidth = 120,
  mobileTextSize = 16,
}: Props) {
  return (
    <Dialog disablePortal open={true} onClose={onDismiss} aria-labelledby="responsive-dialog-title" className="max-w-[540px] xsup:w-full mx-auto xs:mx-5">
      <div className="flex flex-col items-center gap-[28px] justify-center pt-[20px] px-[20px] pb-[40px]">
        <div className="flex max-w-[500px] w-full flex-row items-start justify-end ">
          {onDismiss ? <Image src={CloseIcon} alt="close" onClick={onDismiss} className="cursor-pointer" /> : null}
        </div>

        <DialogContent className="!p-0">
          <span className="flex break-all">
            <h3 className={`text-xl text-center font-medium text-color xs:text-[${mobileTextSize}px]`} dangerouslySetInnerHTML={{ __html: message }}></h3>
          </span>
        </DialogContent>
        <DialogActions className="flex p-0 gap-[20px] xs:gap-4">
          {dismissText && (
            <Button variant="outlined" onClick={onBack ?? onDismiss} className="w-[200px] h-[56px] xs:!h-[48px] md:!text-lg xs:!w-[120px] xs:!text-lg">
              {dismissText}
            </Button>
          )}

          <UserSiteLoadingButton
            isLoading={loading}
            variant="contained"
            onClick={onAccept}
            className={`w-[200px] h-[56px] md:!text-lg xs:!h-[48px] xs:!w-[${mobileButtonWidth}px] xs:!text-lg xs:!px-[15px]`}
          >
            {acceptText}
          </UserSiteLoadingButton>
        </DialogActions>
      </div>
    </Dialog>
  );
}
