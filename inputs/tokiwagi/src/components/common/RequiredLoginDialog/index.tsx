import { Dialog, DialogActions } from "@mui/material";
import Image from "next/legacy/image";
import { useRouter } from "next/router";

import CloseIcon from "statics/images/close.svg";
import Button from "components/common/Buttons/Button";
import { ROUTE } from "constants/route";

interface Props {
  onDismiss: any;
  shouldBlockDismiss?: boolean;
}

export default function RequiredLoginDialog({ onDismiss, shouldBlockDismiss }: Props) {
  const router = useRouter();

  // /signin and /signup are IP-limited. Use a full-page navigation so the middleware
  // can redirect to /403 (router.push is client-side and won't follow that redirect).
  const redirectToSignUp = () => {
    window.location.href = ROUTE.SIGN_UP;
  };

  const redirectToSignIn = () => {
    window.location.href = `${ROUTE.SIGN_IN}?redirect=${router.asPath}`;
  };

  return (
    <Dialog disablePortal open={true} onClose={onDismiss} aria-labelledby="responsive-dialog-title" className="max-w-[570px] xsup:w-full mx-auto xs:mx-7">
      <div className="flex flex-col items-center gap-[28px] justify-center pt-[20px] px-[20px] pb-[40px] xs:pb-[20px]">
        <div className="flex max-w-[500px] w-full flex-row items-start justify-end ">
          {!shouldBlockDismiss ? <Image src={CloseIcon} alt="close" onClick={onDismiss} className="cursor-pointer" /> : null}
        </div>

        <h3 className="text-[20px] leading-[28px] text-center font-medium text-color xs:text-base">お手続きのためにはアカウント登録/ログインが必要です。</h3>

        <DialogActions className="flex gap-8 p-0 xs:flex-col-reverse xs:gap-0">
          <Button variant="outlined" onClick={redirectToSignUp} className="w-[200px] h-[64px] xs:h-[48px] xs:!mt-4">
            <span className="xs:text-lg">アカウント登録</span>
          </Button>
          <Button variant="contained" onClick={redirectToSignIn} className="w-[200px] h-[64px] xs:h-[48px]">
            <span className="xs:text-lg">ログイン</span>
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
}
