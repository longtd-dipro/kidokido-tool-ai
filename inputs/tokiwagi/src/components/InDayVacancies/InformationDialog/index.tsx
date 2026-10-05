import { Dialog, DialogActions, DialogContent } from "@mui/material";
import Image from "next/legacy/image";

import CloseIcon from "statics/images/close.svg";
import Button from "components/common/Buttons/Button";

interface Props {
  message?: string;
  people: number;
  minutes: number;
  text?: string;
  onAccept?: any;
  onDismiss: any;
  isShowButton?: boolean;
}

export default function InformationDialog({ message, text, onAccept, onDismiss, people, minutes, isShowButton }: Props) {
  return (
    <Dialog disablePortal open={true} onClose={onDismiss} aria-labelledby="responsive-dialog-title" className="max-w-[540px] xsup:w-full mx-auto xs:mx-5">
      <div className="flex flex-col items-center justify-center pt-[20px] px-[20px] pb-[40px] xs:pb-[20px]">
        <div className="flex max-w-[500px] w-full flex-row items-start justify-end ">
          <Image src={CloseIcon} alt="close" onClick={onDismiss} className="cursor-pointer" />
        </div>
        <h3 className="text-[20px] leading-[28px] text-center font-medium text-color">{message}</h3>
        <DialogContent className="p-0">
          <div className="flex gap-5">
            <span className="flex flex-col gap-y-[39px]">
              <span></span>
              <span>約</span>
            </span>
            <span className="flex flex-col gap-y-4">
              <span className="text-[#DC0404]">{people}</span>
              <span className="text-[#0068B7]">{minutes}</span>
            </span>
            <div className="flex flex-col gap-y-4">
              <span>組</span>
              <span>分</span>
            </div>
          </div>
        </DialogContent>
        <div className="w-full mb-4 text-center ">
          順番にお呼び出しいたします。
          <br />
          しばらくお待ちください。
        </div>
        {isShowButton && (
          <DialogActions className="flex p-0">
            <Button variant="contained" onClick={onAccept} className="w-[400px] h-[56px] xs:!w-[200px] xs:!text-lg">
              {text}
            </Button>
          </DialogActions>
        )}
      </div>
    </Dialog>
  );
}
