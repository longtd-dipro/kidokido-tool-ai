import { Grid } from "@mui/material";
import { BookingStatus, PaymentStatus, TicketType } from "@prisma/client";

import { Barcode } from "components/common/Barcode";
import PaymentStatusSlider from "components/common/PaymentStatusSlider";
import { CHECK_IN_OUT_TENANT_VERSION } from "constants/common";
import { BookingSmaregiQRCodeInfo, SmaregiQRCodes } from "models/Booking";
import { Booking } from "models/Entity";
import styles from "pages/user/my-page/booking-history/index.module.scss";

type Props = {
  booking: Booking & { smaregiQRCodes?: SmaregiQRCodes };
  loading: boolean;
  onChangePaymentStatus: (paymentStatus: PaymentStatus, isSmaregiScanned: boolean) => void;
};

export default function SmaregiBarcodeSection({ booking, loading, onChangePaymentStatus }: Props) {
  if (!booking || booking.status !== BookingStatus.CheckedOut) {
    return null;
  }

  const smaregiQRCodes = booking.smaregiQRCodes;

  if (!smaregiQRCodes) {
    return null;
  }

  const { base, extendedPeriod, discount, hourlyExtraTimeDiscount } = smaregiQRCodes;

  const renderQrSection = (
    title: string,
    qrInfo?: BookingSmaregiQRCodeInfo,
    showAllItems: boolean = false,
    isDiscount: boolean = false,
  ) => {
    if (!qrInfo) return null;

    const qrList = showAllItems
      ? [
        ...qrInfo.child.map((item, index) => ({
          label: `子ども${index + (isDiscount ? 2 : 1)}`,
          qrUrl: item.qrUrl,
          count: 1,
        })),
        ...qrInfo.adult.map((item, index) => ({
          label: `おとな${index + (isDiscount ? 2 : 1)}`,
          qrUrl: item.qrUrl,
          count: 1,
        })),
      ]
      : ([
        qrInfo.child.length > 0
          ? {
            label: "子ども",
            qrUrl: qrInfo.child[0].qrUrl,
            count: qrInfo.child.length,
          }
          : null,
        qrInfo.adult.length > 0
          ? {
            label: "おとな",
            qrUrl: qrInfo.adult[0].qrUrl,
            count: qrInfo.adult.length,
          }
          : null,
      ].filter(Boolean) as {
        label: string;
        qrUrl: string;
        count: number;
      }[]);

    if (!qrList.length) return null;

    return (
      <div className="flex xs:flex-col items-start xs:gap-[20px] md:gap-[30px] gap-[67px] py-3 border-b last:border-b-0 border-[#00000026]">
        <p className="xs:w-auto w-[157px] shrink-0">{title}</p>

        <div className="flex flex-1 flex-col gap-4 xs:w-full">
          {qrList.map((item, index) => (
            <div
              key={`${title}-${index}`}
              className="flex xs:flex-col xs:gap-2 md:gap-6 gap-10"
            >
              <p className="whitespace-nowrap shrink-0">{item.label}</p>

              <div className="flex-1 flex items-center xs:gap-2 gap-3">
                <div className="xs:w-[100%] w-[80%] xs:h-[220px] h-[150px] shrink-0">
                  {item.qrUrl && (
                    <img
                      className="w-full h-full"
                      src={item.qrUrl}
                      alt={item.label}
                    />
                  )}
                </div>

                {!showAllItems && item.count > 1 && (
                  <span className="whitespace-nowrap w-[20%]">
                    x{item.count}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    booking.Tenant.allowedVersion === CHECK_IN_OUT_TENANT_VERSION ? (
      <>
        {!booking?.isSmaregiScanned && booking?.smaregiTransactionBarcode && (
          <Grid container className={styles.content_id}>
            <Grid item xs={12} md={6} lg={4}>
              <p className="text-xl font-medium xs:text-base xs:leading-5 xs:text-center xs:mb-[20px]">
                決済バーコード
              </p>
            </Grid>
            <Grid item xs={12} md={6} lg={8}>
              <Barcode
                includeText={true}
                code={booking.smaregiTransactionBarcode}
                backgroundcolor="ffffff"
                paddingheight={2}
                className="min-w-0 max-w-[260px] h-auto xs:w-full xs:mx-auto"
              />
            </Grid>
          </Grid>
        )}
      </>
    ) : (
      <Grid container className={styles.content_id}>
        {!booking?.isSmaregiScanned && (
          <>
            <Grid item xs={12} md={4} lg={4}>
              <p className="text-xl font-medium xs:text-base xs:leading-5 xs:text-center xs:mb-[20px]">
                決済バーコード
              </p>
            </Grid>
            <Grid item xs={12} md={8} lg={8}>
              <div>
                {renderQrSection("ご利用商品", base, true)}
                {renderQrSection(
                  booking.Ticket?.type === TicketType.Hourly
                    ? "延長利用"
                    : "延長時間設定",
                  extendedPeriod,
                  true,
                )}
                {renderQrSection("ベース金額の割引", discount, true, true)}
                {renderQrSection(
                  "延長時間の割引",
                  hourlyExtraTimeDiscount,
                  true,
                  true,
                )}
              </div>
            </Grid>
          </>
        )}

        <Grid item xs={12} md={12} lg={12} textAlign="center" marginTop="4px">
          <div className="mx-auto w-[280px] md:w-full">
            <PaymentStatusSlider
              leftLabel="未払い"
              rightLabel="支払い済み"
              value={booking.isSmaregiScanned ? "right" : "left"}
              disabled={loading}
              onChange={(next) =>
                onChangePaymentStatus(
                  next === "right"
                    ? PaymentStatus.Completed
                    : PaymentStatus.Pending,
                  next === "right",
                )
              }
            />
          </div>
        </Grid>
      </Grid>
    )
  );
}
