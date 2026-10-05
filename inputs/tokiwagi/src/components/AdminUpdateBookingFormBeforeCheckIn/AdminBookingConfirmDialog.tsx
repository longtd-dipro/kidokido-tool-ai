import { LoadingButton } from "@mui/lab";
import { Dialog, DialogActions, DialogContent } from "@mui/material";

import Button from "components/common/Buttons/Button";
import Spinner from "components/common/Spinner";

interface Props {
  loading?: boolean;
  message?: string;
  dismissText?: string;
  acceptText?: string;
  warningMessage?: string;
  onDismiss: () => void;
  onAccept: () => void;
  onBack?: () => void;
}

export default function AdminBookingConfirmDialog({ message, dismissText, acceptText, warningMessage, onDismiss, onAccept, onBack, loading = false }: Props) {
  return (
    <Dialog disablePortal open={true} onClose={onDismiss} aria-labelledby="responsive-dialog-title" className="max-w-[540px] xsup:w-full mx-auto xs:mx-5">
      <div className="flex flex-col items-center gap-[28px] justify-center px-[20px] py-[32px]">
        <DialogContent className="!p-0">
          <div>
            <h3 className="text-[20px] leading-[28px] text-center font-medium text-color mb-3">{message}</h3>
            <h6 className="text-center mdonly:px-2">{warningMessage}</h6>
          </div>
        </DialogContent>
        <DialogActions className="flex !p-0 gap-[20px]">
          <Button variant="outlined" onClick={onBack ?? onDismiss} className="w-[200px] h-[56px]">
            {dismissText}
          </Button>
          <LoadingButton
            variant="contained"
            onClick={onAccept}
            className="w-[200px] h-[56px]"
            loading={loading}
            loadingPosition="end"
            loadingIndicator={<Spinner size={20} />}
          >
            {acceptText}
          </LoadingButton>
        </DialogActions>
      </div>
    </Dialog>
  );
}
