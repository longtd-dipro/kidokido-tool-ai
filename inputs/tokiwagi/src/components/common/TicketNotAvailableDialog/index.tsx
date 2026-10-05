import { Dialog, DialogActions, DialogContent } from "@mui/material";
import Image from "next/legacy/image";

import CloseIcon from "statics/images/close.svg";
import Button from "components/common/Buttons/Button";

interface Props {
  message?: string;
  text?: string;
  onDismiss: any;
}

export default function TicketNotAvailableDialog({ message, text, onDismiss }: Props) {
  return (
    <Dialog
      disablePortal
      open={true}
      onClose={onDismiss}
      aria-labelledby="responsive-dialog-title"
      className="!w-[640px] xs:!w-[330px] xsup:w-full mx-auto xs:mx-5"
    >
      <div className="flex flex-col items-center gap-[28px] justify-center pt-[20px] px-[18px] pb-[40px] xs:gap-0 xs:pb-[20px]">
        <div className="flex max-w-[900px] w-full flex-row items-start justify-end ">
          <Image src={CloseIcon} alt="close" onClick={onDismiss} className="cursor-pointer" />
        </div>

        <DialogContent className="p-0">
          <span className="flex ">
            <h3 className="text-[20px] leading-[28px] text-center font-medium text-color xs:text-base">{message}</h3>
          </span>
        </DialogContent>
        <DialogActions className="flex p-0">
          <Button variant="contained" onClick={onDismiss} className="w-[300px] h-[56px] xs:h-[48px] xs:!w-[120px] xs:!text-lg">
            {text}
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
}
