import { Dialog, DialogActions, DialogContent } from "@mui/material";
import moment from "moment";

import Button from "components/common/Buttons/Button";
import { formatCurrency } from "utils/number";
import { JP_LONG_DATE_TIME } from "constants/common";

interface Props {
  ticketName?: string;
  useDate?: string;
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

export default function AdminUpdateBookingReviewDialog(props: Props) {
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
      <div className="flex flex-col items-center gap-[28px] justify-center py-[32px] px-[20px]">
        <DialogContent className="!p-0 w-full">
          <div>
            <div className="text-center mb-[28px]">
              <div className="font-medium text-[24px] leading-[32px] mb-[8px]">人数を変更する</div>
              <div className="font-light text-[16px] leading-[20px] text-[#B4B2B7]">決済情報</div>
            </div>
            <div className="w-full">
              <div className="flex px-[8px]">
                <div className="font-medium text-[16px] leading-[20px] grow">変更した人数</div>
                <div className="font-bold text-[16px] leading-[20px]">
                  おとな{props.totalAdult}人 子ども{props.totalChild}人
                </div>
              </div>
              <div className="border-b border-[#D9D9D9] w-full my-[24px]"></div>
            </div>
            {isRefund ? (
              <div className="w-full">
                <div className="flex px-[8px]">
                  <div className="font-medium text-[16px] leading-[20px] grow">返金額</div>
                  <div className="font-bold text-[16px] leading-[20px]">{formatCurrency(refundAmount)}</div>
                </div>
                <div className="border-b border-[#D9D9D9] w-full my-[24px]"></div>
              </div>
            ) : (
              <div className="w-full">
                <div className="flex px-[8px]">
                  <div className="font-medium text-[16px] leading-[20px] grow">支払い料金</div>
                  <div className="font-bold text-[16px] leading-[20px]">{formatCurrency(props.totalAmount - props.originTotalAmount)}</div>
                </div>
                <div className="border-b border-[#D9D9D9] w-full my-[24px]"></div>
              </div>
            )}

            <div className="w-full">
              <div className="flex px-[8px]">
                <div className="font-medium text-[16px] leading-[20px] grow">決済方式</div>
                <div className="font-bold text-[16px] leading-[20px]">クレジットカード</div>
              </div>
              <div className="border-b border-[#D9D9D9] w-full my-[24px]"></div>
            </div>
            <div className="w-full">
              <div className="flex px-[8px]">
                <div className="font-medium text-[16px] leading-[20px] grow">取引日時</div>
                <div className="font-bold text-[16px] leading-[20px]">{moment(props.transactionDate, "YYYYMMDDHHmm").format(JP_LONG_DATE_TIME)}</div>
              </div>
              <div className="border-b border-[#D9D9D9] w-full my-[24px]"></div>
            </div>
            <div className="w-full">
              <div className="flex px-[8px]">
                <div className="font-medium text-[16px] leading-[20px] grow">取引番号</div>
                <div className="font-bold text-[16px] leading-[20px]">{props.transactionId}</div>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions className="flex !p-0 gap-[20px]">
          <Button variant="outlined" onClick={props.onClose} className="w-[200px] h-[56px]">
            戻る
          </Button>
          <Button variant="contained" onClick={props.onOk} className="w-[200px] h-[56px]">
            次へ
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
}
