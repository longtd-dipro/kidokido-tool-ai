import { Button, Dialog, DialogActions, Grid } from "@mui/material";
import { PaymentType } from "@prisma/client";
import moment from "moment";
import Image from "next/legacy/image";

import { JP_LONG_DATE_TIME, JP_SHORT_DATE } from "constants/common";
import CloseIcon from "statics/images/close.svg";
import { formatCurrency } from "utils/number";
import { Booking } from "models/Entity";

interface Props {
  booking: Booking;
  transactionDate: string;
  transactionId: string;
  onDismiss: () => void;
  onAccept: () => void;
}

export default function ConfirmationCancelBookingDialog({ booking, transactionDate, transactionId, onDismiss, onAccept }: Props) {
  return (
    <Dialog disablePortal open={true} onClose={onDismiss} aria-labelledby="responsive-dialog-title" className="max-w-[620px] xsup:w-full mx-auto xs:mx-5">
      <div className="flex items-start justify-end w-full px-4 my-4">
        <Image src={CloseIcon} alt="close" onClick={onDismiss} className="cursor-pointer" />
      </div>
      <div className="container pb-8 mx-auto">
        <h1 className="mx-auto mt-4 mb-4 text-2xl font-medium text-center xs:mb-2 xs:text-xl">キャンセル手続き</h1>
        <div className="px-12 py-4 gird break-all xs:px-5">
          <Grid container>
            <Grid item xs={8} className="pb-4">
              <p className="text-xl font-medium xs:text-lg">キャンセル内容</p>
            </Grid>
            <Grid item xs={4}></Grid>

            <Grid item xs={4} md={6} className="pb-2 text-lg xs:text-base font-medium">
              <p>商品名</p>
            </Grid>
            <Grid item xs={8} md={6} className="pb-2 font-light xs:text-sm text-right">
              {booking?.Ticket?.name}
            </Grid>

            <Grid item xs={4} md={6} className="pb-2 text-lg xs:text-base font-medium">
              <p>利用日時</p>
            </Grid>
            <Grid item xs={8} md={6} className="pb-2 font-light xs:text-sm text-right">
              {booking?.date && `${moment(booking?.date).format(JP_SHORT_DATE)} (${moment(booking?.date).format("ddd")})`}
            </Grid>

            <Grid item xs={4} md={6} className="pb-2 text-lg xs:text-base font-medium">
              <p>人数</p>
            </Grid>
            <Grid item xs={8} md={6} className="pb-2 font-light xs:text-sm text-right">
              {`${booking?.adultQuantity}大人  ${booking?.childQuantity} 子供`}
            </Grid>

            <hr className="w-full" />

            <Grid item xs={4} md={6} className="py-4 text-lg xs:text-base font-medium">
              <p>返金額</p>
            </Grid>
            <Grid item xs={8} md={6} className="py-4 font-light xs:text-sm text-right">
              {formatCurrency(+booking?.totalAmount)}
            </Grid>

            <hr className="w-full" />

            <Grid item xs={4} md={6} className="py-4 text-lg xs:text-base font-medium">
              <p>決済方式</p>
            </Grid>
            <Grid item xs={8} md={6} className="py-4 font-light xs:text-sm text-right">
              {booking?.Ticket?.paymentType === PaymentType.Online ? "クレジットカード" : "退場時に精算"}
            </Grid>

            <hr className="w-full" />

            <Grid item xs={4} md={6} className="py-4 text-lg xs:text-base font-medium">
              <p>取引日時</p>
            </Grid>
            <Grid item xs={8} md={6} className="py-4 font-light xs:text-sm text-right">
              {moment(transactionDate, "YYYYMMDDHHmm").format(JP_LONG_DATE_TIME)}
            </Grid>

            <hr className="w-full" />

            <Grid item xs={4} md={6} className="py-4 text-lg xs:text-base font-medium">
              <p>取引番号</p>
            </Grid>
            <Grid item xs={8} md={6} className="py-4 font-light xs:text-sm text-right">
              {transactionId}
            </Grid>
          </Grid>
          <DialogActions className="flex !justify-center gap-8 p-0 pt-4 xs:flex-col-reverse xs:gap-0">
            <Button variant="outlined" onClick={onDismiss} className="h-[56px] md:h-12 w-[200px] xs:w-[200px] xs:!mt-4 text-xl md:!text-lg mdup:!leading-7">
              <p className="xs:text-lg">戻る</p>
            </Button>
            <Button variant="contained" onClick={onAccept} className="h-[56px] md:h-12 w-[200px] xs:w-[200px] text-xl md:!text-lg mdup:!leading-7">
              <p className="xs:text-lg">キャンセル依頼</p>
            </Button>
          </DialogActions>
        </div>
      </div>
    </Dialog>
  );
}
