import { Dialog } from "@mui/material";
import Image from "next/legacy/image";

import CloseIcon from "statics/images/close.svg";
import Button from "components/common/Buttons/Button";
import { ROUTE } from "constants/route";
import { useQrRedirect } from "libs/hooks/useQrRedirect";

interface Props {
  onDismiss: any;
}

export default function WarningLoginDialog({ onDismiss }: Props) {
  const { signInHref } = useQrRedirect();

  // /signin and /signup are IP-limited. Use a full-page navigation so the middleware
  // can redirect to /403 (router.push is client-side and won't follow that redirect).
  const handleRedirectToLogin = () => {
    window.location.href = signInHref;
  };

  const handleRedirectToSignUp = () => {
    window.location.href = ROUTE.SIGN_UP;
  };

  return (
    <Dialog disablePortal open={true} onClose={onDismiss} aria-labelledby="responsive-dialog-title" className="max-w-[540px] xsup:w-full mx-auto xs:mx-5">
      <div className="flex flex-col items-center justify-center pt-[20px] px-[3.156rem] xs:p-4 pb-[40px] xs:pb-[20px] ">
        <div className="flex max-w-[500px] w-full flex-row items-start justify-end ">
          <Image src={CloseIcon} alt="close" onClick={onDismiss} className="cursor-pointer" />
        </div>
        <h3 className="text-[20px] leading-[28px] text-center font-medium text-color ">ご利用ありがとうございます。<br/> まだアカウント登録がお済みでない方は下記からアカウント登録をお願いいたします。</h3>
        <Button variant="contained" onClick={handleRedirectToSignUp} className="!mt-7 w-[400px] h-[56px] xs:!w-[240px] xs:h-[68px] xs:!text-lg ">
            新規アカウント登録はこちら
        </Button>

        <h3 className="text-[20px] leading-[28px] text-center font-medium text-color my-7 ">すでにアカウントをお持ちの方は下記からログインいただけます。</h3>
        <Button variant="contained" onClick={handleRedirectToLogin} className="w-[400px] h-[56px] xs:!w-[240px] xs:!text-lg">
            ログインはこちら
        </Button>

      </div>
    </Dialog>
  );
}
