import { useEffect, useState } from "react";

import { ALLOW_RESEND_EMAIL_INTERVAL_IN_SECONDS } from "constants/settings";
import { resendVerificationEmail } from "services/api-client/auth.service";

type Params = {
  email: string;
  token?: string;
};

export default function useResendVerificationEmail({ email, token }: Params) {
  const [shouldDisableResend, setShouldDisableResend] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(ALLOW_RESEND_EMAIL_INTERVAL_IN_SECONDS);
  const [error, setError] = useState<string>();

  const onResendEmail = async () => {
    try {
      await resendVerificationEmail({ email, token });
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setError(message);
    }
  };

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

  return {
    countdown,
    handleResendEmail,
    shouldDisableResend,
    error,
  };
}
