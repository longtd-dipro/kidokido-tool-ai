import { Dialog } from "@mui/material";
import { groupBy } from "lodash";
import moment from "moment";
import Image from "next/legacy/image";
import { useEffect, useState } from "react";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import LoginIcon from "@mui/icons-material/Login";

import CloseIcon from "statics/images/close.svg";
import { ArrowUpIcon } from "components/common/ArrowUpIcon";
import { Barcode } from "components/common/Barcode";
import { JP_SHORT_DATE, SHORT_TIME } from "constants/common";
import { Booking } from "models/Entity";
import { calculateBookingsPriceMap, getShortBarCode } from "utils/booking";
import { getAgeLabel } from "utils/ticket";

type BookingListModalVariant = "checkin" | "checkout";

interface Props {
  bookings: Booking[];
  variant?: BookingListModalVariant;
  filterBarCode?: string;
  onDismiss: () => void;
}

const ACCENT_COLOR: Record<BookingListModalVariant, { headerBackground: string; headerTextColor: string; title: string; background: string }> = {
  checkin: {
    headerBackground: "#1F68B7",
    headerTextColor: "#ffffff",
    title: "#DFEFFB",
    background: "#f4faff",
  },
  checkout: {
    headerBackground: "#1F68B7",
    headerTextColor: "#ffffff",
    title: "#FFE0C8",
    background: "#fff1e0",
  },
};

const setDefaultCollapsedItem = (items, index) => {
  return items.length > 1 ? true : index !== 0;
};

export default function BookingListModal({ bookings, variant = "checkin", filterBarCode, onDismiss }: Props) {
  const accentColor = ACCENT_COLOR[variant];

  const visibleBookings = filterBarCode ? bookings.filter((b) => b.barCode === filterBarCode) : bookings;

  const { sortedBookings } = calculateBookingsPriceMap(visibleBookings);
  const groups = Object.values(groupBy(sortedBookings, "barCode"));

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCollapsedGroups(
      groups.reduce((acc, group, index) => {
        acc[group[0].barCode] = setDefaultCollapsedItem(groups, index);
        return acc;
      }, {} as Record<string, boolean>)
    );
  }, [filterBarCode]);

  const toggleCollapse = (barCode: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [barCode]: !prev[barCode] }));
  };

  return (
    <Dialog
      disablePortal
      open={true}
      onClose={onDismiss}
      aria-labelledby="booking-list-dialog"
      PaperProps={{
        sx: {
          width: { xs: "calc(100% - 40px)", md: "80%" },
          maxWidth: { xs: "calc(100% - 40px)", md: 680 },
          m: { xs: "20px", md: 2 },
        },
      }}
    >
      <div className="relative p-5 xs:p-3">
        <div className="flex justify-end mb-7">
          <Image src={CloseIcon} alt="close" width={24} height={24} onClick={onDismiss} className="cursor-pointer" />
        </div>

        <div className="flex flex-col gap-4">
          {groups.map((group) => {
            const head = group[0];
            const totalAdult = group.reduce((sum, b) => sum + (b.adultQuantity || 0), 0);
            const totalChild = group.reduce((sum, b) => sum + (b.childQuantity || 0), 0);

            const isCheckedOutPending =
              variant === "checkout" &&
              head.status === BookingStatus.CheckedOut &&
              head.paymentStatus === PaymentStatus.Pending;
            const showHeaderBarcode = !isCheckedOutPending;
            const showPaymentBarcode = isCheckedOutPending && !!head.smaregiTransactionBarcode;

            return (
              <div key={head.barCode} className="overflow-hidden rounded-[10px] border border-[#00000026]">
                {collapsedGroups[head.barCode] ? (
                  <div
                    className="relative flex items-start justify-between gap-4 p-4 xs:flex-col"
                    style={{ backgroundColor: accentColor.headerBackground, color: accentColor.headerTextColor }}>
                    <div className="flex flex-col gap-2 text-[16px]">
                      <div className="text-base font-semibold">No.{getShortBarCode(head.barCode)}</div>
                      <div className="flex">
                        <span className="w-[88px] shrink-0 font-semibold">利用日時：</span>
                        <span className="font-light">
                          {`${moment(head.date).format(JP_SHORT_DATE)} (${moment(head.date).format("ddd")})`}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="w-[88px] shrink-0 font-semibold">施設名：</span>
                        <span className="font-light break-all">{head.Tenant?.name}</span>
                      </div>
                      <div className="flex">
                        <span className="w-[88px] shrink-0 font-semibold">予約人数：</span>
                        <span className="font-light">
                          おとな{totalAdult}名{"　"}子ども{totalChild}名
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 xs:w-full xs:justify-between xs:self-center">
                      {showHeaderBarcode && (
                        <Barcode includeText={true} code={head.barCode} backgroundcolor="ffffff" paddingheight={2} paddingwidth={8} />
                      )}
                      <button
                        type="button"
                        onClick={() => toggleCollapse(head.barCode)}
                        aria-label="折りたたむ"
                        className="flex items-center text-white xs:absolute xs:right-4 xs:top-4"
                      >
                        <span className="flex rotate-180">
                          <ArrowUpIcon fill="white" className="w-6 h-6 xs:w-[18px] xs:h-[18px]" />
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div
                      className="relative flex items-start justify-between gap-4 p-4 xs:flex-col"
                      style={{ backgroundColor: accentColor.headerBackground, color: accentColor.headerTextColor }}>
                      <div className="flex flex-col gap-2 text-[16px]">
                        <div className="text-base font-semibold">No.{getShortBarCode(head.barCode)}</div>
                        <div className="flex">
                          <span className="w-[88px] shrink-0 font-semibold">利用日時：</span>
                          <span className="font-light">
                            {`${moment(head.date).format(JP_SHORT_DATE)} (${moment(head.date).format("ddd")})`}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="w-[88px] shrink-0 font-semibold">施設名：</span>
                          <span className="font-light break-all">{head.Tenant?.name}</span>
                        </div>
                        <div className="flex">
                          <span className="w-[88px] shrink-0 font-semibold">予約人数：</span>
                          <span className="font-light">
                            おとな{totalAdult}名{"　"}子ども{totalChild}名
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 xs:w-full xs:justify-between xs:self-center">
                        {showHeaderBarcode && (
                          <Barcode includeText={true} code={head.barCode} backgroundcolor="ffffff" paddingheight={2} paddingwidth={8} />
                        )}
                        <button
                          type="button"
                          onClick={() => toggleCollapse(head.barCode)}
                          aria-label="折りたたむ"
                          className="flex items-center text-white xs:absolute xs:right-4 xs:top-4"
                        >
                          <ArrowUpIcon fill="white" className="w-6 h-6 xs:w-[18px] xs:h-[18px]" />
                        </button>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="flex flex-col gap-3 bg-white p-4 text-[#313035]">
                      {showPaymentBarcode && (
                        <div className="relative flex items-center justify-center gap-4 xs:flex-col xs:items-center xs:gap-2">
                          <span className="shrink-0 text-[18px] font-medium xs:text-base notxs:absolute notxs:left-0 notxs:top-1/2 notxs:-translate-y-1/2">
                            決済バーコード
                          </span>
                          <Barcode
                            includeText={true}
                            code={head.smaregiTransactionBarcode}
                            backgroundcolor="ffffff"
                            paddingheight={2}
                            paddingwidth={8}
                            className="min-w-0 max-w-[260px] h-auto xs:w-full"
                          />
                        </div>
                      )}
                      {group.map((booking, index) => {
                        const childAges = groupBy(booking?.BookingChildAgeInfo, "childAgeInMonth");
                        const childAgeKeys = Object.keys(childAges);
                        return (
                          <div key={booking.id}>
                            <div
                              className={
                                "flex items-center justify-between gap-2 px-4 py-3 text-[#1a1a1a] border border-[#00000026] " +
                                "rounded-t-md text-[18px] font-semibold"
                              }
                              style={{ backgroundColor: accentColor.title }}
                            >
                              <span>
                                No.{getShortBarCode(booking.barCode)} ({index + 1}/{group.length}){"　"}{booking.Ticket?.name}
                              </span>
                            </div>
                            <div
                              className="rounded-b-md border-[0.5px] border-t-0 border-[#D9D9D9] p-2"
                              style={{ backgroundColor: accentColor.background }}
                            >
                              <div className="rounded-lg p-2 border border-[#00000026] bg-white">
                                <div className="flex py-1 text-[16px] gap-6 xs:gap-2">
                                  <span className="w-[160px] shrink-0 text-[#979797]">利用料金：</span>
                                  <span>{booking?.formattedTotalAmount}円</span>
                                </div>
                                <div className="flex py-1 text-[16px] gap-6 xs:gap-2">
                                  <span className="w-[160px] shrink-0 text-[#979797]">おとなの人数：</span>
                                  <span>{booking.adultQuantity}人</span>
                                </div>
                                <div className="flex py-1 text-[16px] gap-6 xs:gap-2">
                                  <span className="w-[160px] shrink-0 text-[#979797]">子どもの人数・年齢：</span>
                                  <span>
                                    <div className="font-light xs:text-[14px]">
                                      {childAgeKeys.map((key) => {
                                        const childAge = childAges[key];
                                        return (
                                          <div key={key}>
                                            {childAge.length}人 x {getAgeLabel(+key)}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </span>
                                </div>
                                {variant === "checkout" && !!booking.checkedInAt && (
                                  <div className="flex py-1 text-[16px] gap-6 xs:gap-2">
                                    <span className="flex items-center w-[160px] shrink-0 text-[#979797]">
                                      <LoginIcon sx={{ fontSize: 20, color: "#059669", mr: "2px" }} />
                                      入場時刻：
                                    </span>
                                    <span className="font-semibold text-[#059669]">{moment(booking.checkedInAt).format(SHORT_TIME)}</span>
                                  </div>
                                )}
                                {variant === "checkout" && !!booking.checkedOutAt && booking.checkedOutAt > booking.checkedInAt && (
                                  <div className="flex py-1 text-[16px] gap-6 xs:gap-2">
                                    <span className="flex items-center w-[160px] shrink-0 text-[#979797]">
                                      <LoginIcon sx={{ fontSize: 20, color: "#ea580c", mr: "2px" }} />
                                      退場時刻：
                                    </span>
                                    <span className="font-semibold text-[#ea580c]">{moment(booking.checkedOutAt).format(SHORT_TIME)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Dialog>
  );
}
