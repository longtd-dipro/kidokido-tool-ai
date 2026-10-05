import { Button, Dialog, DialogActions, DialogContent, TextField } from "@mui/material";

import { TransactionInfo } from "services/gmo.service";

interface Props {
  transaction: TransactionInfo;
  userOwnerId: number;
  isOpen: boolean;
  onClose: () => void;
  onOk: () => void;
}

export default function AdminBookingCreditCardDialog(props: Props) {
  return (
    <Dialog
      disablePortal
      open={props.isOpen}
      onClose={props.onClose}
      aria-labelledby="responsive-dialog-title"
      className="max-w-[616px] xsup:w-full mx-auto xs:mx-5"
    >
      <div className="flex flex-col items-center gap-[28px] justify-center px-[20px] py-[32px]">
        <DialogContent className="!p-0 w-full">
          <div>
            <div className="text-center mb-[64px]">
              <div className="font-medium text-[24px] leading-[32px]">クレジットカード情報</div>
            </div>
            <div>
              <div className="relative mb-4">
                <label className="block mb-2 label">カード番号</label>
                <TextField
                  value={props.transaction.CardNo}
                  disabled={true}
                  className="ad-input-field w-full"
                  placeholder=""
                  inputProps={{ className: "!font-light" }}
                />
              </div>

              <div className="flex gap-[20px]">
                <div className="relative mb-4 grow">
                  <label className="block mb-2 label">月</label>
                  <TextField
                    value={props.transaction?.Expire?.substring(2, 4)}
                    disabled={true}
                    className="ad-input-field w-full"
                    placeholder=""
                    inputProps={{ className: "!font-light" }}
                  />
                </div>
                <div className="relative mb-4 grow">
                  <label className="block mb-2 label">年</label>
                  <TextField
                    value={props.transaction?.Expire?.substring(0, 2)}
                    disabled={true}
                    className="ad-input-field w-full"
                    placeholder=""
                    inputProps={{ className: "!font-light" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions className="flex !p-0 gap-[20px]">
          <Button variant="outlined" onClick={props.onClose} className="w-[200px] h-[56px]">
            戻る
          </Button>
          <Button variant="contained" onClick={props.onOk} className="w-[200px] h-[56px]">
            次へ
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
}
