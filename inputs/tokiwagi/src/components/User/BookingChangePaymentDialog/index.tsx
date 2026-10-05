import { Dialog, DialogContent } from "@mui/material";
import Image from "next/legacy/image";

import CloseIcon from "statics/images/close.svg";
import { TransactionInfo } from "services/gmo.service";
import OnlyReadCreditCardForm from "components/common/OnlyReadCreditCardForm";

interface Props {
  transaction: TransactionInfo;
  isOpen: boolean;
  onClose: () => void;
  onOk: () => void;
}

export default function BookingChangePaymentDialog(props: Props) {
  return (
    <Dialog
      disablePortal
      open={props.isOpen}
      onClose={props.onClose}
      aria-labelledby="responsive-dialog-title"
      className="max-w-[616px] xsup:w-full mx-auto xs:mx-5"
    >
      <div id="scrollTop" className="flex flex-col items-center gap-[28px] justify-center pt-[20px] px-[20px] pb-[40px]">
        <div className="flex w-full flex-row items-start justify-end ">
          <Image src={CloseIcon} alt="close" onClick={props.onClose} className="cursor-pointer" />
        </div>

        <DialogContent className="!p-0 w-full">
          <div>
            <div className="text-center mb-[24px] xs:mb-4">
              <div className="font-medium text-[24px] leading-[32px] xs:text-lg">クレジットカード情報の入力</div>
            </div>
            <OnlyReadCreditCardForm
              transaction={props.transaction}
              hideTitle={true}
              okLabel="次へ"
              buttonClassName="!min-w-[150px] !h-[56px] xs:!w-full xs:!h-[48px]"
              onSave={props.onOk}
              onBack={props.onClose}
            />
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
}
