import { Dialog, DialogActions, DialogContent } from "@mui/material";
import Image from "next/legacy/image";

import useResendVerificationEmail from "libs/hooks/useResendVerificationEmail";
import CloseIcon from "statics/images/close.svg";
import Button from "components/common/Buttons/Button";

interface Props {
  message: string;
  email: string;
  onDismiss: any;
}

export default function EmailNotVerifiedDialog({ message, onDismiss, email }: Props) {
  const { shouldDisableResend, countdown, handleResendEmail } = useResendVerificationEmail({ email });

  return (
    <Dialog disablePortal open={true} onClose={onDismiss} aria-labelledby="responsive-dialog-title" className="max-w-[540px] xsup:w-full mx-auto xs:mx-5">
      <div className="flex flex-col items-center gap-[28px] justify-center pt-[20px] px-[20px] pb-[40px] xs:pb-[20px]">
        <div className="flex max-w-[500px] w-full flex-row items-start justify-end ">
          <Image src={CloseIcon} alt="close" onClick={onDismiss} className="cursor-pointer" />
        </div>

        <DialogContent className="p-0">
          <span className="flex ">
            <h3 className="text-[20px] leading-[28px] text-center font-medium text-color xs:text-base">{message}</h3>
          </span>
        </DialogContent>
        <DialogActions className="flex p-0">
          <Button
            onClick={handleResendEmail}
            disabled={shouldDisableResend}
            type="submit"
            variant="contained"
            className="md:w-[290px] md:h-12 md:!text-[16px] mdup:w-[360px] mdup:h-[64px] px-[30] py-[12px]">
            メールを再送信する {shouldDisableResend ? `(${countdown})` : ""}
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
}
