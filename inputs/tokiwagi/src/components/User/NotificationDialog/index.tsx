import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import Image from "next/legacy/image";
import React from "react";

import CloseIcon from "statics/images/close.svg";

interface Props {
  width?: number;
  message: string | React.ReactNode;
  okLabel: string;
  isOpen: boolean;
  onClose: () => void;
  onOk?: () => void;
  hiddenCloseIcon?: boolean;
  paperClassName?: string;
  buttonClassName?: string;
  contentClassName?: string;
  disablePortal?: boolean;
  paperWidth?: number;
  paperHeight?: number;
}

export default function NotificationDialog(props: Props) {
  const width = props.width ?? 500;

  return (
    <Dialog
      disablePortal={props.disablePortal ?? true}
      open={props.isOpen}
      onClose={props.onClose}
      aria-labelledby="responsive-dialog-title"
      className={`max-w-[${width}px] min-w-unset xsup:w-full mx-auto xs:mx-5`}
      PaperProps={{
        className: `!max-w-[unset] ${props.paperClassName ?? ""}`,
        style: {
          ...(props.paperWidth !== undefined ? { width: `min(${props.paperWidth}px, calc(100vw - 40px))` } : {}),
          ...(props.paperHeight !== undefined ? { height: props.paperHeight } : {}),
        },
      }}
    >
      <div
        className={`flex flex-col items-center gap-[28px] justify-center pt-[20px] px-[20px] pb-[40px] xs:pb-[20px] ${
          props.contentClassName ?? ""
        }`}
      >
        {!props.hiddenCloseIcon && (
          <div className={`flex max-w-[${width}px] w-full flex-row items-start justify-end `}>
            <Image src={CloseIcon} alt="close" onClick={props.onClose} className="cursor-pointer" />
          </div>
        )}
        <DialogContent className="!p-0 w-full">
          {typeof props.message === "string" ? (
            <p className="text-center text-[20px] leading-[28px] font-medium xs:text-base">{props.message}</p>
          ) : (
            props.message
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={props.onOk ?? props.onClose}
            className={props.buttonClassName ?? "!w-[300px] h-[56px] xs:!w-[120px] xs:h-[48px]"}
          >
            {props.okLabel ?? "次へ"}
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
}
