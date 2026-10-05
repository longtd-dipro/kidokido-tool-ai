import { Dialog, DialogActions, DialogContent } from "@mui/material";
import Image from "next/legacy/image";

import CloseIcon from "statics/images/close.svg";
import Button from "components/common/Buttons/Button";

interface Props {
  message?: string;
  text?: string;
  onAccept: any;
  onDismiss: any;
  hideDismissButton?: boolean;
  dismissText?: string;
  hideCloseButton?: boolean;
}

export default function WarningDialog({ message, text, hideDismissButton = false, dismissText, onAccept, onDismiss, hideCloseButton = false }: Props) {
  return (
    <Dialog disablePortal open={true} onClose={onDismiss} aria-labelledby="responsive-dialog-title" className="max-w-[540px] xsup:w-full mx-auto xs:mx-5">
      <div className="flex flex-col items-center gap-[28px] justify-center pt-[20px] px-[20px] pb-[40px] xs:pb-[20px] xs:gap-[10px]">
        <div className="flex max-w-[500px] w-full flex-row items-start justify-end ">
          {!hideCloseButton && <Image src={CloseIcon} alt="close" onClick={onDismiss} className="cursor-pointer" />}
        </div>

        <DialogContent className="!p-0">
          <span className="flex ">
            <h3
              dangerouslySetInnerHTML={{ __html: message }}
              className="text-[20px] leading-[28px] text-center font-medium text-color xs:text-base whitespace-pre-line">
            </h3>
          </span>
        </DialogContent>
        <DialogActions className="flex gap-8 p-0">
          {!hideDismissButton && (
            <Button variant="outlined" onClick={onDismiss} className="w-[200px] h-[56px] xs:w-[120px] xs:h-[48px]">
              {dismissText || "戻る"}
            </Button>
          )}

          <Button variant="contained" onClick={onAccept} className="w-[200px] h-[56px] xs:w-[120px] xs:h-[48px]">
            {text}
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
}
