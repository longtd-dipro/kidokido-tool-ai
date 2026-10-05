import Link from "next/link";

import { ROUTE } from "constants/route";
import { ERROR_MESSAGES } from "constants/errors";

interface ErrorProps {
  message: string;
  className?: string;
}

export default function Error(props: ErrorProps) {
  if (props.message) {
    return (
      <div className={`${props.className} error-message text-red-700 text-[13px] leading-[17px] whitespace-pre-line`}>
        {props.message && props.message === ERROR_MESSAGES.UNAUTHENTICATED ? (
          <>
            <p className="font-semibold">ログインしてからご利用ください。</p>
            <br />
            <p className="font-semibold leading-6">
              アカウント登録がお済みでない方は、
              <br />
              <Link passHref href={ROUTE.SIGN_UP} legacyBehavior>
                <a className="underline text-blue-color">こちら</a>
              </Link>{" "}
              から新規アカウント登録を行なってください。
            </p>
          </>
        ) : (
          props.message
        )}
      </div>
    );
  } else {
    return null;
  }
}
