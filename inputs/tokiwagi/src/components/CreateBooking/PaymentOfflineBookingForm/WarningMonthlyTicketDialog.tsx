import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import Image from "next/legacy/image";

import CloseIcon from "statics/images/close.svg";

interface Props {
  onDismiss: () => void;
}

export default function WarningMonthlyTicketDialog({ onDismiss }: Props) {
  return (
    <Dialog disablePortal disableAutoFocus={true} disableRestoreFocus={true}
      open={true} onClose={onDismiss} aria-labelledby="responsive-dialog-title" className="max-w-[640px] xsup:w-full mx-auto xs:mx-4">
      <div className="flex flex-col items-center gap-[16px] justify-center pt-[20px] pb-[40px] xs:pb-[20px]">
        <div className="flex w-full flex-row items-start justify-end px-[20px]">
          <Image src={CloseIcon} alt="close" onClick={onDismiss} className="cursor-pointer" />
        </div>

        <DialogTitle className="!text-2xl !font-medium text-center responsive-dialog-title">お持ちのフリーパス</DialogTitle>

        <DialogContent>
          <div className="w-full flex flex-col justify-center text-center">
            <p>全日年間パスの初回利用の場合、ご購入店舗でのみご予約可能です。</p>
            <p>2回目以降のご利用はその他店舗でご予約いただけます。</p>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
}
