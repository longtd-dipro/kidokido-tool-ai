import { Dialog, DialogActions, DialogContent } from "@mui/material";
import Image from "next/legacy/image";
import moment from "moment";

import CloseIcon from "statics/images/close.svg";
import Button from "components/common/Buttons/Button";
import { formatCurrency } from "utils/number";
import { JP_LONG_DATE_TIME } from "constants/common";

interface Props {
  totalAdult: number;
  totalChild: number;
  totalAmount: number;
  originTotalAmount: number;
  transactionDate: string;
  transactionId: string;
  isOpen: boolean;
  onClose: () => void;
  onOk: () => void;
}

export default function BookingChangeReviewDialog(props: Props) {
  const isRefund = props.totalAmount < props.originTotalAmount;
  const refundAmount = props.originTotalAmount - props.totalAmount;

  return (
    <Dialog
      disablePortal
      open={props.isOpen}
      onClose={props.onClose}
      aria-labelledby="responsive-dialog-title"
      className="max-w-[616px] xsup:w-full mx-auto xs:mx-5"
    >
      <div className="flex flex-col items-center gap-[28px] justify-center pt-[20px] px-[20px] pb-[40px]">
        <div className="flex w-full flex-row items-start justify-end ">
          <Image src={CloseIcon} alt="close" onClick={props.onClose} className="cursor-pointer" />
        </div>

        <DialogContent className="p-0 w-full xs:!p-0">
          <div>
            <div className="text-center mb-[28px]">
              <div className="font-medium text-[24px] leading-[32px] mb-[8px] xs:text-lg">人数を変更する</div>
              <div className="font-light text-[16px] leading-[20px] xs:text-sm">決済情報</div>
            </div>
            <div className="w-full">
              <div className="flex xs:items-center">
                <div className="font-medium text-[20px] leading-[28px] grow xs:text-base">変更した人数</div>
                <div className="font-light text-[16px] leading-[20px] xs:text-sm">
                  おとな{props.totalAdult}人 子ども{props.totalChild}人
                </div>
              </div>
              <div className="border-b border-[#D9D9D9] w-full my-[24px]"></div>
            </div>
            {isRefund ? (
              <div className="w-full">
                <div className="flex xs:items-center">
                  <div className="font-medium text-[20px] leading-[28px] grow xs:text-base">返金額</div>
                  <div className="font-light text-[16px] leading-[20px] xs:text-sm">{formatCurrency(refundAmount)}</div>
                </div>
                <div className="border-b border-[#D9D9D9] w-full my-[24px]"></div>
              </div>
            ) : (
              <div className="w-full">
                <div className="flex xs:items-center">
                  <div className="font-medium text-[20px] leading-[28px] grow xs:text-base">支払い料金</div>
                  <div className="font-light text-[16px] leading-[20px] xs:text-sm">{formatCurrency(props.totalAmount - props.originTotalAmount)}</div>
                </div>
                <div className="border-b border-[#D9D9D9] w-full my-[24px]"></div>
              </div>
            )}

            <div className="w-full">
              <div className="flex xs:items-center">
                <div className="font-medium text-[20px] leading-[28px] grow xs:text-base">決済方式</div>
                <div className="font-light text-[16px] leading-[20px] xs:text-sm">クレジットカード</div>
              </div>
              <div className="border-b border-[#D9D9D9] w-full my-[24px]"></div>
            </div>
            <div className="w-full">
              <div className="flex xs:items-center">
                <div className="font-medium text-[20px] leading-[28px] grow xs:text-base">取引日時</div>
                <div className="font-light text-[16px] leading-[20px] xs:w-2/3 xs:text-sm">
                  {moment(props.transactionDate, "YYYYMMDDHHmm").format(JP_LONG_DATE_TIME)}
                </div>
              </div>
              <div className="border-b border-[#D9D9D9] w-full my-[24px]"></div>
            </div>
            <div className="w-full">
              <div className="flex xs:items-center">
                <div className="font-medium text-[20px] leading-[28px] grow xs:text-base">取引番号</div>
                <div className="font-light text-[16px] leading-[20px] xs:w-2/3 xs:text-sm break-words">{props.transactionId}</div>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions className="flex p-0 gap-[20px]">
          <Button variant="outlined" onClick={props.onClose} className="w-[200px] h-[56px] xs:h-[48px] xs:!w-[120px] xs:!text-lg">
            戻る
          </Button>
          <Button variant="contained" onClick={props.onOk} className="w-[200px] h-[56px] xs:h-[48px] xs:!w-[120px] xs:!text-lg">
            次へ
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
}
