import { Dialog } from "@mui/material";
import Image from "next/legacy/image";
import React from "react";

import WarningIcon from "statics/images/warning-circle-yellow.svg";

interface Props {
  isOpen: boolean;
  message: string;
  onYes: () => void;
  onNo: () => void;
}

const BLUE_GRADIENT = "bg-gradient-to-b from-[#5AA7F2] to-[#006DC6]";

const BUTTON_BASE = [
  "min-w-[125px] h-[44px] px-[24px] py-[12px] rounded-[6px]",
  "border border-solid border-transparent",
  "text-[16px] leading-[20px] font-semibold whitespace-nowrap cursor-pointer",
  "shadow-[1px_3px_4px_rgba(38,36,44,0.18)]",
  "xs:min-w-0 xs:flex-1 xs:px-2",
].join(" ");

/** Gradient border: white padding-box layer over a gradient border-box layer. */
const GRADIENT_BORDER =
  "[background:linear-gradient(#fff,#fff)_padding-box,linear-gradient(180deg,#5AA7F2,#006DC6)_border-box]";

/** Asks staff to confirm before processing a barcode that was already scanned just now. */
export default function ConfirmDuplicateDialog({
  isOpen,
  message,
  onYes,
  onNo,
}: Props) {
  return (
    <Dialog
      disablePortal
      open={isOpen}
      onClose={onNo}
      aria-labelledby="confirm-duplicate-title"
      BackdropProps={{ className: "!bg-black/25" }}
      PaperProps={{
        className:
          "!max-w-[unset] !m-0 !border !border-solid !border-[#FF8100] !rounded-[10px] !shadow-none",
        style: { width: "min(607px, calc(100vw - 40px))" },
      }}
    >
      <div className="flex flex-col items-center gap-[32px] pt-[24px] px-[16px] pb-[33px]">
        <Image src={WarningIcon} alt="" width={70} height={70} />

        <p
          id="confirm-duplicate-title"
          className="m-0 whitespace-pre-line text-center text-[16px] leading-[20px] font-semibold text-[#313035]"
        >
          {message}
        </p>

        <div className="flex gap-[24px]">
          {/* The gradient border already owns this button's background, so the
              gradient label needs its own element to background-clip against. */}
          <button
            type="button"
            onClick={onNo}
            className={`${BUTTON_BASE} ${GRADIENT_BORDER}`}
          >
            <span className={`${BLUE_GRADIENT} bg-clip-text text-transparent`}>
              いいえ
            </span>
          </button>
          <button
            type="button"
            onClick={onYes}
            className={`${BUTTON_BASE} ${BLUE_GRADIENT} text-[#F5F5F5]`}
          >
            はい
          </button>
        </div>
      </div>
    </Dialog>
  );
}
