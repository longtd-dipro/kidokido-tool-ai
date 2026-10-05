import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/legacy/image";

import LoadingSpinner from "components/common/Admin/LoadingSpinner";
import Error from "components/common/Error";
import { unlockAccount } from "services/api-client/auth.service";
import LogoAdmin from "statics/images/logo-login-admin.svg";
import Button from "components/common/Buttons/Button";
import { ROUTE } from "constants/route";

export default function UnlockAccount() {
  const [errMsg, setErrMsg] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAlreadyUnlocked, setIsAlreadyUnlocked] = useState<boolean>(false);
  const [isErrorToken, setIsErrorToken] = useState<boolean>(false);

  const router = useRouter();
  const token = router.query.token as string;

  useEffect(() => {
    if (token) {
      processUnlockAccount(token);
    }
  }, [token]);

  const processUnlockAccount = async (token: string) => {
    setErrMsg("");
    try {
      setIsLoading(true);
      await unlockAccount({ token });
      setIsAlreadyUnlocked(true);
    } catch (err) {
      const isInvalidToken = err.response?.data?.data?.isInvalidToken;
      if (isInvalidToken) {
        setIsErrorToken(true);
        return;
      }
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <section className="admin h-screen flex relative">
        <div className="flex flex-col justify-center items-center mx-auto">
          <div className="flex flex-col gap-[43px] ad-section-container w-[526px] p-[24px]">
            <div className="flex justify-center">
              <Image src={LogoAdmin} className="mr-3 h-8 sm:h-9" alt="Logo" />
            </div>
            <div className="flex flex-col gap-[24px]">
              {isLoading && <LoadingSpinner />}

              {!isLoading && (
                <>
                  <h2 className="flex-none order-0 shrink-0 text-[20px] leading-[32px] font-bold ad-text-color-3 text-center">
                    {isAlreadyUnlocked ? "運営側のアカウントのロック解除が完了しました" : "運営側のアカウントのロック解除が失敗しました"}
                  </h2>
                  <div className="text-center text-base leading-7 text-color xs:font-medium xs:!text-left font-light">
                    {isAlreadyUnlocked && <p>引き続きログインされる場合は、ログイン画面へ進んでください。</p>}

                    {isErrorToken && (
                      <p className="text-center">
                        再度メールアドレスに届いた認証URLにクリックするか、もう一度ログインを行なってメールアドレスに認証URLを送信してください。
                      </p>
                    )}

                    <Error message={errMsg} />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-center">
              {/*Submit*/}
              <Button href={ROUTE.ADMIN_SIGN_IN} type="submit" variant="contained" className="flex w-[230px] h-[56px]">
                <h2 className="text-center text-base font-bold leading-[20px] px-[57px] py-[8px] ad-white-color">ログイン</h2>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
