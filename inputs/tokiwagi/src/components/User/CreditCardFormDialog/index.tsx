import { Dialog, DialogContent } from "@mui/material";
import Image from "next/legacy/image";

import OnlyReadCreditCardForm from "components/common/OnlyReadCreditCardForm";
import { TransactionInfo } from "services/gmo.service";
import CloseIcon from "statics/images/close.svg";

export interface Props {
  transaction: TransactionInfo;
  onDismiss: () => void;
  onAccept: () => void;
}

export default function CreditCardFormDialog({ onDismiss, onAccept, transaction }: Props) {
  return (
    <Dialog disablePortal open={true} onClose={onDismiss} aria-labelledby="responsive-dialog-title" className="max-w-[640px] xsup:w-full mx-auto xs:mx-5">
      <div className="flex items-start justify-end w-full px-4 mt-4">
        <Image src={CloseIcon} alt="close" onClick={onDismiss} className="cursor-pointer" />
      </div>
      <DialogContent className="p-0">
        <div className="flex flex-row items-start justify-center w-full pb-4 font-medium">
          <h1 className="text-2xl">キャンセル手続き</h1>
        </div>
        <div className="px-8 mb-8">
          <OnlyReadCreditCardForm transaction={transaction} hideTitle={true} okLabel="次へ" onSave={onAccept} onBack={onDismiss} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
