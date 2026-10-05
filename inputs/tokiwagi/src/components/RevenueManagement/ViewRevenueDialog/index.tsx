import { Dialog, DialogActions, DialogContent } from "@mui/material";
import React from "react";
import moment from "moment";
import { Role } from "@prisma/client";

import { Booking } from "models/Entity";
import AdminButton from "components/common/Buttons/AdminButton";
import { JP_SHORT_DATE, LONG_DATE_WITHOUT_SECOND, ROLE } from "constants/common";
import { getBookingStayDuration } from "utils/booking";
import { formatCurrency, formatCurrencyStrictMode } from "utils/number";
import { formatStayDurationTime } from "utils/date-time";

import styles from "./index.module.scss";

interface Props {
  onHide: () => void;
  booking: Booking;
  role: Role;
}
export default function ViewRevenueDialog(props: Props) {
  const isPrepay = props.booking.Ticket.paymentType === "Online";
  const isStaffRole = props.role === ROLE.STAFF;

  const coupons = Object.values(props.booking.coupons ?? []);
  const totalCouponAmount = coupons.reduce((acc, coupon) => {
    return acc + coupon.discountAmount;
  }, 0);

  return (
    <Dialog open={true} onClose={props.onHide} maxWidth="md" fullWidth className={"!w-[720px] mx-auto"} disablePortal>
      <div className="flex flex-col justify-center items-center">
        <DialogContent className="w-full !px-[72px] !py-[32px]">
          <div className={styles.modalHeader}>売上詳細</div>
          {isPrepay ? (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>売上管理</div>
              <div className={styles.sectionContent}>
                <div className={styles.sectionContentRow}>
                  <div className={styles.sectionContentTitle}>日付</div>
                  <div className={styles.sectionContentValue}>{moment(props.booking.date).format(JP_SHORT_DATE)}</div>
                </div>

                {!isStaffRole && (
                  <>
                    <div className={styles.sectionContentRow}>
                      <div className={styles.sectionContentTitle}>お名前</div>
                      <div className={styles.sectionContentValue}>{props.booking.User.name}</div>
                    </div>
                    <div className={styles.sectionContentRow}>
                      <div className={styles.sectionContentTitle}>電話番号</div>
                      <div className={styles.sectionContentValue}>{props.booking.User.phone}</div>
                    </div>
                  </>
                )}

                <div className={styles.sectionContentRow}>
                  <div className={styles.sectionContentTitle}>予約パス</div>
                  <div className={styles.sectionContentValue}>{props.booking.ticketId}</div>
                </div>
                <div className={styles.sectionContentRow}>
                  <div className={styles.sectionContentTitle}>大人利用人数</div>
                  <div className={styles.sectionContentValue}>{props.booking.adultQuantity}</div>
                </div>
                <div className={styles.sectionContentRow}>
                  <div className={styles.sectionContentTitle}>子供利用人数</div>
                  <div className={styles.sectionContentValue}>{props.booking.childQuantity}</div>
                </div>
                <div className={styles.sectionContentRow}>
                  <div className={styles.sectionContentTitle}>子ども年齢</div>
                  <div className={styles.sectionContentValue}>-</div>
                </div>
                <div className={styles.sectionContentRow}>
                  <div className={styles.sectionContentTitle}>入場時間</div>
                  <div className={styles.sectionContentValue}>
                    {props.booking.checkedInAt ? moment(props.booking.firstCheckedInAt || props.booking.checkedInAt).format(LONG_DATE_WITHOUT_SECOND) : "-"}
                  </div>
                </div>
                <div className={styles.sectionContentRow}>
                  <div className={styles.sectionContentTitle}>退場時間</div>
                  <div className={styles.sectionContentValue}>
                    {props.booking.checkedOutAt ? moment(props.booking.checkedOutAt).format(LONG_DATE_WITHOUT_SECOND) : "-"}
                  </div>
                </div>
                <div className={styles.sectionContentRow}>
                  <div className={styles.sectionContentTitle}>滞在時間</div>
                  <div className={styles.sectionContentValue}>
                    {props.booking.stayDuration ? formatStayDurationTime(props.booking.stayDuration) : getBookingStayDuration(props.booking)}
                  </div>
                </div>
                <div className={styles.sectionContentRow}>
                  <div className={styles.sectionContentTitle}>合計売上金額</div>
                  <div className={styles.sectionContentValue}>
                    {props.booking.parentBookingId ? formatCurrencyStrictMode(0) : formatCurrencyStrictMode(props.booking.totalAmount?.toString())}
                  </div>
                </div>
                {!isStaffRole && (
                  <div className={styles.sectionContentRow}>
                    <div className={styles.sectionContentTitle}>決済ID</div>
                    <div className={`${styles.sectionContentValue} break-all w-1/2`}>{props.booking.GMOTransactionId}</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>現地決済</div>
              <div className={styles.sectionContent}>
                <div className={styles.sectionContentRow}>
                  <div className={styles.sectionContentTitle}>日付</div>
                  <div className={styles.sectionContentValue}>{moment(props.booking.date).format(LONG_DATE_WITHOUT_SECOND)}</div>
                </div>

                {!isStaffRole && (
                  <>
                    <div className={styles.sectionContentRow}>
                      <div className={styles.sectionContentTitle}>お名前</div>
                      <div className={styles.sectionContentValue}>{props.booking.User.name}</div>
                    </div>
                    <div className={styles.sectionContentRow}>
                      <div className={styles.sectionContentTitle}>電話番号</div>
                      <div className={styles.sectionContentValue}>{props.booking.User.phone}</div>
                    </div>
                  </>
                )}

                <div className={styles.sectionContentRow}>
                  <div className={styles.sectionContentTitle}>予約パス</div>
                  <div className={styles.sectionContentValue}>{props.booking.ticketId}</div>
                </div>
                <div className={styles.sectionContentRow}>
                  <div className={styles.sectionContentTitle}>大人利用人数</div>
                  <div className={styles.sectionContentValue}>{props.booking.adultQuantity}</div>
                </div>
                <div className={styles.sectionContentRow}>
                  <div className={styles.sectionContentTitle}>子供利用人数</div>
                  <div className={styles.sectionContentValue}>{props.booking.childQuantity}</div>
                </div>
                <div className={styles.sectionContentRow}>
                  <div className={styles.sectionContentTitle}>クーポンCD</div>
                  <div className={styles.sectionContentValue}>
                    {coupons.map((coupon, i) => (
                      <div key={i}>{coupon.name || coupon.code}</div>
                    ))}
                  </div>
                </div>
                <div className={styles.sectionContentRow}>
                  <div className={styles.sectionContentTitle}>クーポン数枚</div>
                  <div className={styles.sectionContentValue}>{coupons.length}</div>
                </div>
                <div className={styles.sectionContentRow}>
                  <div className={styles.sectionContentTitle}>クーポン金額</div>
                  <div className={styles.sectionContentValue}>{formatCurrency(totalCouponAmount)}</div>
                </div>
                <div className={styles.sectionContentRow}>
                  <div className={styles.sectionContentTitle}>合計売上金額</div>
                  <div className={styles.sectionContentValue}>
                    {props.booking.parentBookingId ? formatCurrencyStrictMode(0) : formatCurrencyStrictMode(props.booking.totalAmount?.toString())}
                  </div>
                </div>
                <div className={styles.sectionContentRow}>
                  <div className={styles.sectionContentTitle}>支払方法</div>
                  <div className={styles.sectionContentValue}>-</div>
                </div>
                <div className={styles.sectionContentRow}>
                  <div className={styles.sectionContentTitle}>入場時間</div>
                  <div className={styles.sectionContentValue}>
                    {props.booking.checkedInAt ? moment(props.booking.firstCheckedInAt || props.booking.checkedInAt).format(LONG_DATE_WITHOUT_SECOND) : "-"}
                  </div>
                </div>
                <div className={styles.sectionContentRow}>
                  <div className={styles.sectionContentTitle}>退場時間</div>
                  <div className={styles.sectionContentValue}>
                    {props.booking.checkedOutAt ? moment(props.booking.checkedOutAt).format(LONG_DATE_WITHOUT_SECOND) : "-"}
                  </div>
                </div>
                <div className={styles.sectionContentRow}>
                  <div className={styles.sectionContentTitle}>滞在時間</div>
                  <div className={styles.sectionContentValue}>{formatStayDurationTime(props.booking.stayDuration)}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions className="my-4 flex gap-4">
          <AdminButton onClick={props.onHide} variant="contained" className="w-[125px] h-[48px]">
            OK
          </AdminButton>
        </DialogActions>
      </div>
    </Dialog>
  );
}
