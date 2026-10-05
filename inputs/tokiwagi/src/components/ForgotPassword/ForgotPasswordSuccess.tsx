import { useEffect, useState } from "react";

import { ALLOW_RESEND_EMAIL_INTERVAL_IN_SECONDS } from "constants/settings";
import Button from "components/common/Buttons/Button";

type Props = {
  onResendEmail: () => void;
};

export default function ForgotPasswordSuccess({ onResendEmail }: Props) {
  const [shouldDisableResend, setShouldDisableResend] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(ALLOW_RESEND_EMAIL_INTERVAL_IN_SECONDS);

  useEffect(() => {
    if (shouldDisableResend) {
      const interval = setInterval(() => {
        setCountdown((countdown) => {
          const newCountdown = --countdown;
          if (newCountdown === 0) {
            clearInterval(interval);
            setShouldDisableResend(false);
          }
          return newCountdown;
        });
      }, 1000);
    }
  }, [shouldDisableResend]);

  const handleResendEmail = () => {
    setShouldDisableResend(true);
    setCountdown(ALLOW_RESEND_EMAIL_INTERVAL_IN_SECONDS);
    onResendEmail();
  };

  return (
    <section className="flex flex-col gap-[48px] relative max-w-[600px] xs:mb-[403px] md:mb-[1073px] mb-[892px] mx-auto">
      <div className="flex flex-col justify-center items-center xs:mx-5">
        <div className="relative z-10 flex flex-col gap-[48px] mt-10 md:mt-8 xs:mt-[18px]">
          <div className="flex flex-col gap-[48px] md:gap-9 xs:gap-6 items-center">
            <h2 className="usr-title-line text-center xs:text-[28px]">
              メールを送信しました。
            </h2>
            <div className="text-center text-base text-color font-light xs:leading-7 xs:font-medium xs:mt-3">
              <p className="xs:tracking-[-0.030em]">パスワード再設定に必要なメールを送信します。</p>
              <p>
                メール記載のリンクをクリックし、
                パスワードの再設定に進んでください。
              </p>
              <br />
              <p>
                メールが届かない場合や紛失した場合は、以下より再度送信してください。
              </p>
            </div>
            <Button
              type="button"
              variant="contained"
              className="md:w-[290px] md:h-12 md:!text-[18px] w-[360px] h-[64px]"
              onClick={handleResendEmail}
              disabled={shouldDisableResend}
            >
              メールを再送信する {shouldDisableResend ? `(${countdown})` : ""}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
