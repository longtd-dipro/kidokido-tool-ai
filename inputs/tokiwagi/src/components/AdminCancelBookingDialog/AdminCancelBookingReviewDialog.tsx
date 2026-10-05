import { Dialog, DialogActions, DialogContent } from "@mui/material";
import moment from "moment";
import { LoadingButton } from "@mui/lab";

import Button from "components/common/Buttons/Button";
import { formatCurrency } from "utils/number";
import { JP_LONG_DATE_TIME, JP_SHORT_DATE } from "constants/common";
import Error from "components/common/Error";

interface Props {
  ticketName?: string;
  useDate?: string | Date;
  totalAdult: number;
  totalChild: number;
  refundAmount: number;
  transactionDate: string;
  transactionId: string;
  isOpen: boolean;
  onClose: () => void;
  onOk: () => void;
  errorMsg?: string;
  isLoading?: boolean;
}

export default function AdminCancelBookingReviewDialog(props: Props) {
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
              <div className="font-medium text-[24px] leading-[32px] mb-[8px]">返金手続き</div>
            </div>
            <div className="text-[20px] leading-[28px] px-[8px] font-medium">返金内容</div>
            <div className="w-full my-[24px]">
              <div className="flex px-[8px]">
                <div className="font-medium text-[16px] leading-[20px] grow">商品名</div>
                <div className="font-light text-[16px] leading-[20px]">{props.ticketName}</div>
              </div>
            </div>
            <div className="w-full my-[24px]">
              <div className="flex px-[8px]">
                <div className="font-medium text-[16px] leading-[20px] grow">利用日時</div>
                <div className="font-light text-[16px] leading-[20px]">{moment(props.useDate).format(JP_SHORT_DATE)}</div>
              </div>
            </div>
            <div className="w-full">
              <div className="flex px-[8px]">
                <div className="font-medium text-[16px] leading-[20px] grow">変更した人数</div>
                <div className="font-light text-[16px] leading-[20px]">
                  おとな{props.totalAdult}人 子ども{props.totalChild}人
                </div>
              </div>
              <div className="border border-[#D9D9D9] w-full my-[24px]"></div>
            </div>
            <div className="w-full">
              <div className="flex px-[8px]">
                <div className="font-medium text-[16px] leading-[20px] grow">返金額</div>
                <div className="font-light text-[16px] leading-[20px]">{formatCurrency(props.refundAmount)}</div>
              </div>
              <div className="border border-[#D9D9D9] w-full my-[24px]"></div>
            </div>
            <div className="w-full">
              <div className="flex px-[8px]">
                <div className="font-medium text-[16px] leading-[20px] grow">決済方式</div>
                <div className="font-light text-[16px] leading-[20px]">クレジットカード</div>
              </div>
              <div className="border border-[#D9D9D9] w-full my-[24px]"></div>
            </div>
            <div className="w-full">
              <div className="flex px-[8px]">
                <div className="font-medium text-[16px] leading-[20px] grow">取引日時</div>
                <div className="font-light text-[16px] leading-[20px]">
                  {props.transactionDate ? moment(props.transactionDate, "YYYYMMDDHHmm").format(JP_LONG_DATE_TIME) : "-"}
                </div>
              </div>
              <div className="border border-[#D9D9D9] w-full my-[24px]"></div>
            </div>
            <div className="w-full">
              <div className="flex px-[8px]">
                <div className="font-medium text-[16px] leading-[20px] grow">取引番号</div>
                <div className="font-light text-[16px] leading-[20px]">{props.transactionId ?? "-"}</div>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions className="flex !p-0 gap-[20px]">
          <Button variant="outlined" onClick={props.onClose} className="w-[200px] h-[56px]">
            戻る
          </Button>
          <LoadingButton variant="contained" onClick={props.onOk} className="w-[200px] h-[56px]" loading={props.isLoading} loadingPosition="end">
            返金依頼
          </LoadingButton>
        </DialogActions>
        {props.errorMsg && <Error message={props.errorMsg} className="text-center text-[14px]" />}
      </div>
    </Dialog>
  );
}
