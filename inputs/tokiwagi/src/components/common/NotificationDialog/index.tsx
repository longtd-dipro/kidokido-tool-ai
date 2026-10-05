import { Dialog, DialogActions, DialogContent } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckIcon from "@mui/icons-material/Check";

import styles from "./index.module.scss";

export type DialogVariant = "warning" | "success";

export interface DialogAction {
  label: string;
  onClick: () => void;
  styleType?: "outline" | "filled";
}

interface Props {
  message?: string;
  title?: string;
  variant?: DialogVariant;
  closeLabel?: string;
  actions?: DialogAction[];
  secondaryMessage?: string;
  secondaryActions?: DialogAction[];
  onClose: () => void;
}

export default function NotificationDialog({
  message,
  title,
  variant = "warning",
  closeLabel = "キャンセル",
  actions,
  secondaryMessage,
  secondaryActions,
  onClose,
}: Props) {
  const isSuccess = variant === "success";
  const dialogActions: DialogAction[] =
    actions && actions.length > 0 ? actions : [{ label: closeLabel, onClick: onClose, styleType: "outline" }];
  const hasSecondary = Boolean(secondaryMessage || (secondaryActions && secondaryActions.length > 0));

  const renderActions = (list: DialogAction[]) => (
    <DialogActions className="flex gap-4 !p-0">
      {list.map((action, index) => (
        <button
          key={index}
          type="button"
          onClick={action.onClick}
          className={`${action.styleType === "filled" ? styles.filledButton : styles.closeButton}
            min-w-[125px] h-[44px] px-5 text-base leading-5 font-bold whitespace-nowrap`}
        >
          {action.styleType === "filled" ? (
            <span className="text-white">{action.label}</span>
          ) : (
            <span className={styles.gradientText}>{action.label}</span>
          )}
        </button>
      ))}
    </DialogActions>
  );

  return (
    <Dialog
      disablePortal
      open={true}
      onClose={onClose}
      className={`${styles.dialog} max-w-[607px] mdonly:max-w-[607px] xs:px-5 mx-auto`}
      PaperProps={{ sx: { borderRadius: "10px", overflow: "hidden" } }}
    >
      <div className={`${styles.container} ${isSuccess ? styles.success : ""} flex flex-col items-center justify-center py-6`}>
        <div className={`${isSuccess ? styles.iconSuccess : styles.icon} flex items-center justify-center`}>
          {isSuccess ? <CheckIcon /> : <WarningAmberIcon />}
        </div>
        <DialogContent className="!py-8">
          {title && <h3 className="text-base leading-5 font-bold text-center mb-3">{title}</h3>}
          {message && <p className="text-base leading-6 text-center whitespace-pre-line">{message}</p>}
        </DialogContent>
        {renderActions(dialogActions)}
        {hasSecondary && (
          <div className="mt-8 flex w-full flex-col items-center gap-4">
            {secondaryMessage && (
              <p className="text-base leading-6 text-center whitespace-pre-line">{secondaryMessage}</p>
            )}
            {secondaryActions && secondaryActions.length > 0 && renderActions(secondaryActions)}
          </div>
        )}
      </div>
    </Dialog>
  );
}
