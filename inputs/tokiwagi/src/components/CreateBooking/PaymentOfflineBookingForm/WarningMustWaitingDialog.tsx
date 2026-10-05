import { Dialog, DialogActions } from "@mui/material";
import Image from "next/legacy/image";

import Button from "components/common/Buttons/Button";
import CloseIcon from "statics/images/close.svg";

interface Props {
  totalMinutesMustWait: number;
  questionText?: string;
  onDismiss: () => void;
  onAccept: () => void;
}

export default function WarningMustWaitingDialog({ totalMinutesMustWait, questionText, onDismiss, onAccept }: Props) {
  return (
    <Dialog disablePortal open={true} onClose={onDismiss} aria-labelledby="responsive-dialog-title" className="max-w-[570px] xsup:w-full mx-auto xs:mx-7">
      <div className="flex flex-col items-center gap-[28px] justify-center pt-[20px] px-[20px] pb-[40px] xs:pb-[20px]">
        <div className="flex max-w-[500px] w-full flex-row items-start justify-end ">
          <Image src={CloseIcon} alt="close" onClick={onDismiss} className="cursor-pointer" />
        </div>

        <h3 className="text-[20px] leading-[28px] text-center font-medium text-color xs:text-base">ご不便をおかけして申し訳ありません。</h3>
        <h3 className="text-[20px] leading-[28px] text-center font-medium text-color xs:text-base">現在待機列が発生しております。</h3>
        <h3 className="text-[20px] leading-[28px] text-center font-medium text-color xs:text-base">
          入場案内まで最大{totalMinutesMustWait}分程お待ちいただきますが、{questionText ? questionText : "購入を続けますか？"}
        </h3>

        <DialogActions className="flex gap-8 p-0 xs:flex-col-reverse xs:gap-0">
          <Button variant="outlined" onClick={onDismiss} className="w-[200px] h-[64px] xs:h-[48px] xs:!mt-4">
            <span className="xs:text-lg">いいえ</span>
          </Button>
          <Button variant="contained" onClick={onAccept} className="w-[200px] h-[64px] xs:h-[48px]">
            <span className="xs:text-lg">はい</span>
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
}
