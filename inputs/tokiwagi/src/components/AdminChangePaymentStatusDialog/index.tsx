import { useState } from "react";
import { Dialog, DialogActions, DialogContent, CircularProgress } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import TextInputField from "components/common/Fields/TextInputField";
import Error from "components/common/Error";
import AdminButton from "components/common/Buttons/AdminButton";
import { Booking } from "models/Entity";
import { updateBookingIsolatedPaymentData } from "services/api-client/admin/booking.service";
import { changePaymentStatus } from "libs/validation/changePaymentStatus";

type Props = {
  booking: Booking;
  onDismiss: () => void;
  onSuccess: () => void;
};

type FormData = {
  posTotalAmount: string;
  couponName: string;
  couponAmount: string;
};

export default function AdminChangePaymentStatusDialog(props: Props) {
  const { booking, onDismiss, onSuccess } = props;
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const initialCoupon = (booking.coupons as any[])?.[0] || {};
  const currentTotalAmount = booking.posTotalAmount ?? booking.webTotalAmount ?? booking.totalAmount;

  const { formState: { errors }, handleSubmit, control } = useForm<FormData>({
    defaultValues: {
      posTotalAmount: currentTotalAmount?.toString() || "",
      couponName: initialCoupon.code || "",
      couponAmount: initialCoupon.discountAmount?.toString() || "",
    },
    resolver: yupResolver(changePaymentStatus),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setErrorMsg("");

      const posTotalAmountVal = data.posTotalAmount !== undefined ? Number(data.posTotalAmount) : undefined;
      
      let coupons;
      if (data.couponName || data.couponAmount) {
        coupons = [
          {
            code: data.couponName,
            name: data.couponName,
            discountAmount: data.couponAmount ? Number(data.couponAmount) : 0,
          }
        ];
      } else {
        coupons = []; // clear coupons
      }

      await updateBookingIsolatedPaymentData(booking.id, {
        posTotalAmount: posTotalAmountVal,
        coupons: coupons,
      });

      onSuccess();
    } catch (e: any) {
      setErrorMsg(e.response?.data?.error || e.message || "エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open disablePortal onClose={onDismiss} PaperProps={{ className: "p-8 max-w-[640px]" }}>
      <p className="text-center font-bold text-2xl mb-8">支払状況変更</p>
      
      <Error message={errorMsg} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="!p-0 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-base">
              最終支払金額 <span className="text-red-500">[必須]</span>
            </label>
            <TextInputField
              name="posTotalAmount"
              control={control}
              className="ad-input-field w-full"
              placeholder="1240"
            />
            <div className="flex items-center gap-16 md:gap-6">
              {errors.posTotalAmount && <Error message={errors.posTotalAmount.message} />}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-base">クーポンコード名</label>
            <TextInputField
              name="couponName"
              control={control}
              className="ad-input-field w-full"
              placeholder="B12244"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-base">クーポン金額</label>
            <TextInputField
              name="couponAmount"
              control={control}
              className="ad-input-field w-full"
              placeholder="500"
            />
            <div className="flex items-center gap-16 md:gap-6">
              {errors.couponAmount && <Error message={errors.couponAmount.message} />}
            </div>
          </div>
        </DialogContent>
        <DialogActions className="!p-0 mt-8 flex !justify-center gap-4">
          <AdminButton
            variant="contained"
            onClick={onDismiss}
            className="w-[150px] !bg-[#1976d2] !text-white hover:!bg-blue-700"
          >
            キャンセル
          </AdminButton>
          <AdminButton
            type="submit"
            variant="outlined"
            disabled={loading}
            className="w-[150px] !border-[#1976d2] !text-[#1976d2]"
          >
            {loading ? <CircularProgress size={24} /> : "保存"}
          </AdminButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}