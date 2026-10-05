import { Dialog, DialogActions, DialogContent } from "@mui/material";
import Image from "next/legacy/image";

import CloseIcon from "statics/images/close.svg";
import Button from "components/common/Buttons/Button";

interface Props {
  message?: string;
  text?: string;
  onDismiss: any;
}

export default function ErrorDialog({ message, text, onDismiss }: Props) {
  return (
    <Dialog disablePortal open={true} onClose={onDismiss} aria-labelledby="responsive-dialog-title" className="max-w-[540px] xsup:w-full mx-auto xs:mx-5">
      <div className="flex flex-col items-center gap-[14px] justify-center pt-[20px] px-[20px] pb-[40px] xs:pb-[20px]">
        <div className="flex max-w-[500px] w-full flex-row items-start justify-end ">
          <Image src={CloseIcon} alt="close" onClick={onDismiss} className="cursor-pointer" />
        </div>

        <DialogContent className="!p-0">
          <span className="flex ">
            <h3 className="text-[20px] leading-[28px] text-center font-medium text-color xs:text-base whitespace-pre-line">{message}</h3>
          </span>
        </DialogContent>
        <DialogActions className="flex p-0">
          <Button variant="contained" onClick={onDismiss} className="w-[300px] h-[56px] xs:w-[200px] xs:!text-lg xs:h-[48px]">
            {text}
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
}
