import React from "react";
import { CircularProgress, Tooltip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import UndoIcon from "@mui/icons-material/Undo";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import CurrencyYenOutlinedIcon from "@mui/icons-material/CurrencyYenOutlined";
import moment from "moment";

import { JP_SHORT_DATE } from "constants/common";
import ExtendedPricesList from "components/ExtendedPricesList";

import * as S from "../barcode-scanner.styles";
import { ScanResult } from "../barcode-scanner.types";

interface ScanStatusPanelProps {
  status: S.ScanStatus;
  errorMsg: string;
  result: ScanResult | null;
  isV2?: boolean;
}

const isSuccessStatus = (status: S.ScanStatus) =>
  status === "success-checkin" ||
  status === "success-checkout" ||
  status === "success-rollback-checkin" ||
  status === "success-rollback-checkout";

const isScanSuccessStatus = (status: S.ScanStatus) =>
  status === "success-checkin" || status === "success-checkout";

// Re-check-in on the same day, or a pass used again on a later day: either way the scan books no revenue.
// Compare against `false` — the flag is undefined for other ticket types.
const isRepeatUse = (b: ScanResult["bookings"][number]) =>
  b?.reCheckInCount > 0 || b?.isFirstTimeUsingMonthlyTicket === false;

function ScanStatusPanel({ status, errorMsg, result, isV2 = false }: ScanStatusPanelProps) {
  if (status === "idle") return null;

  const hasReCheckIn = result?.bookings.some((b) => b?.reCheckInCount > 0);

  return (
    <S.StatusArea status={status}>
      <S.StatusHeader status={status}>
        <div className="flex items-center gap-[4px]">
          {status === "loading" && (
            <CircularProgress size={18} sx={{ color: "#0068b7" }} />
          )}
          {status === "success-checkin" && (
            <LoginIcon sx={{ color: "#059669", fontSize: 20 }} />
          )}
          {status === "success-checkout" && (
            <LogoutIcon sx={{ color: "#ea580c", fontSize: 20 }} />
          )}
          {status === "success-rollback-checkin" && (
            <UndoIcon sx={{ color: "#7c3aed", fontSize: 20 }} />
          )}
          {status === "success-rollback-checkout" && (
            <UndoIcon sx={{ color: "#2563eb", fontSize: 20 }} />
          )}
          {status === "error" && (
            <WarningAmberIcon sx={{ color: "#dc2626", fontSize: 20 }} />
          )}

          <S.StatusTitle status={status}>
            {status === "loading" && "スキャン中..."}
            {status === "success-checkin" && "チェックイン完了"}
            {status === "success-checkout" && "チェックアウト完了"}
            {status === "success-rollback-checkin" && "入場取り消し完了"}
            {status === "success-rollback-checkout" && "退場取り消し完了"}
            {status === "error" && "エラー"}
          </S.StatusTitle>
        </div>
        {hasReCheckIn && isScanSuccessStatus(status) && (
          <S.DetailLabel
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: status === "success-checkin" ? "#0F926A" : "#F54D1D",
              width: "50%",
              textAlign: "right",
            }}
          >
            再入場のご利用
          </S.DetailLabel>
        )}
      </S.StatusHeader>

      {status === "error" && (
        <S.BookingDetail>
          <p style={{ color: "#F54D1D", fontSize: 13, margin: 0 }}>
            {errorMsg}
          </p>
        </S.BookingDetail>
      )}

      {isSuccessStatus(status) && result && (
        <S.BookingDetail>
          {result.bookings.map((b) => (
            <div
              key={b.id}
              style={{
                background: isRepeatUse(b) ? "rgba(0, 0, 0, 0.25)" : "#fff",
                borderRadius: 10,
                padding: "12px 14px",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {isV2 && b.shortBarCode && (
                <S.TicketNoLabel>
                  No.{b.shortBarCode} ({b.ticketIndex}/{b.ticketCount})
                </S.TicketNoLabel>
              )}
              <S.DetailRow>
                <Tooltip title="商品名">
                  <CheckCircleIcon
                    sx={{ fontSize: 14, color: "#0068b7", mt: "2px" }}
                  />
                </Tooltip>
                <S.DetailLabel>商品名</S.DetailLabel>
                <S.DetailValue>{b.ticketName}</S.DetailValue>
              </S.DetailRow>
              <S.DetailRow>
                <CalendarTodayIcon
                  sx={{ fontSize: 14, color: "#64748b", mt: "2px" }}
                />
                <S.DetailLabel>利用日</S.DetailLabel>
                <S.DetailValue>
                  {moment(b.date).format(JP_SHORT_DATE)}&nbsp; (
                  {moment(b.date).format("ddd")})
                </S.DetailValue>
              </S.DetailRow>
              <S.DetailRow>
                <PersonIcon
                  sx={{ fontSize: 14, color: "#64748b", mt: "2px" }}
                />
                <S.DetailLabel>人数</S.DetailLabel>
                <S.DetailValue>
                  おとな {b.adultQuantity}名{"  "}子ども {b.childQuantity}名
                </S.DetailValue>
              </S.DetailRow>
              {(status === "success-checkin" ||
                status === "success-rollback-checkout") &&
                b.checkedInAt &&
                <S.DetailRow>
                  <LoginIcon
                    sx={{ fontSize: 14, color: "#059669", mt: "2px" }}
                  />
                  <S.DetailLabel>入場時刻</S.DetailLabel>
                  <S.DetailValue
                    style={{ color: "#059669", fontWeight: 700 }}
                  >
                    {moment(b.checkedInAt).format("HH:mm")}
                  </S.DetailValue>
                </S.DetailRow>
              }
              {status === "success-checkout" && b.checkedOutAt && (
                <>
                  <S.DetailRow>
                    <CurrencyYenOutlinedIcon
                      sx={{ fontSize: 14, color: "#64748b", mt: "2px" }}
                    />
                    <S.DetailLabel>利用料金</S.DetailLabel>
                    <S.DetailValue>{b.formattedTotalAmount}円</S.DetailValue>
                  </S.DetailRow>

                  {b?.extendedPrices && (b.extendedPrices.child.length > 0 || b.extendedPrices.parent.length > 0) && (
                    <S.DetailRow>
                      <CurrencyYenOutlinedIcon
                        sx={{ fontSize: 14, color: "#64748b", mt: "2px" }}
                      />
                      <S.DetailLabel>延長料金</S.DetailLabel>
                      <S.DetailExtendedPrices>
                        <ExtendedPricesList extendedPrices={b.extendedPrices} />
                      </S.DetailExtendedPrices>
                    </S.DetailRow>
                  )}

                  {isV2 && b.partialCheckouts && b.partialCheckouts.length > 0 && (
                    <S.DetailRow>
                      <LogoutIcon
                        sx={{ fontSize: 14, color: "#ea580c", mt: "2px" }}
                      />
                      <S.DetailLabel>途中退場時刻</S.DetailLabel>
                      <S.DetailExtendedPrices>
                        {b.partialCheckouts.map((pc, index) => (
                          <S.PartialCheckoutEntry key={index}>
                            <S.PartialCheckoutTime>
                              {moment(pc.checkedOutAt).format("HH:mm")}
                            </S.PartialCheckoutTime>
                            <S.PartialCheckoutQuantity>
                              {pc.adultQuantity > 0 && <div>おとな{pc.adultQuantity}人</div>}
                              {pc.childQuantity > 0 && <div>こども{pc.childQuantity}人</div>}
                            </S.PartialCheckoutQuantity>
                          </S.PartialCheckoutEntry>
                        ))}
                      </S.DetailExtendedPrices>
                    </S.DetailRow>
                  )}

                  <S.DetailRow>
                    <LogoutIcon
                      sx={{ fontSize: 14, color: "#ea580c", mt: "2px" }}
                    />
                    <S.DetailLabel>退場時刻</S.DetailLabel>
                    <S.DetailValue
                      style={{ color: "#ea580c", fontWeight: 700 }}
                    >
                      {moment(b.checkedOutAt).format("HH:mm")}
                    </S.DetailValue>
                  </S.DetailRow>
                </>
              )}
              {status === "success-rollback-checkin" && (
                <S.DetailRow>
                  <UndoIcon
                    sx={{ fontSize: 14, color: "#7c3aed", mt: "2px" }}
                  />
                  <S.DetailLabel>状態</S.DetailLabel>
                  <S.DetailValue style={{ color: "#7c3aed", fontWeight: 700 }}>
                    入場取り消し済み
                  </S.DetailValue>
                </S.DetailRow>
              )}
              {status === "success-rollback-checkout" && (
                <S.DetailRow>
                  <UndoIcon
                    sx={{ fontSize: 14, color: "#2563eb", mt: "2px" }}
                  />
                  <S.DetailLabel>状態</S.DetailLabel>
                  <S.DetailValue style={{ color: "#2563eb", fontWeight: 700 }}>
                    退場取り消し済み
                  </S.DetailValue>
                </S.DetailRow>
              )}
            </div>
          ))}
          {isV2 && status === "success-checkout" && result.totalAmount && (
            <S.TotalAmountBlock>
              <S.DetailRow>
                <CurrencyYenOutlinedIcon sx={{ fontSize: 14, color: "#64748b", mt: "2px" }} />
                <S.DetailLabel>合計金額</S.DetailLabel>
                <S.DetailValue
                  style={{ color: "#313131", fontWeight: 600 }}
                >
                  {result.totalAmount}円
                </S.DetailValue>
              </S.DetailRow>
            </S.TotalAmountBlock>
          )}
        </S.BookingDetail>
      )}
    </S.StatusArea>
  );
}

export default ScanStatusPanel;
