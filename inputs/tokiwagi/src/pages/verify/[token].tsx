import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

import Error from "components/common/Error";
import Layout from "components/common/Layout";
import { verifyToken } from "services/api-client/auth.service";
import Breadcrumb from "components/common/UserLayout/Breadcrumb";
import { ROUTE } from "constants/route";
import LoadingSpinner from "components/common/Admin/LoadingSpinner";
import { editEmailUser } from "services/api-client/user.service";
import Button from "components/common/Buttons/Button";

let autoLoginTimeout: any;
export default function VerifyToken() {
  const [errMsg, setErrMsg] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAlreadyVerified, setIsAlreadyVerified] = useState<boolean>(false);
  const [isErrorToken, setIsErrorToken] = useState<boolean>(false);

  const router = useRouter();
  const { token } = router.query;
  const email = router.query.email as string;

  useEffect(() => {
    if (token) {
      processVerifyToken(token as string);
    }
  }, [token]);

  const processVerifyToken = async (token: string) => {
    setErrMsg("");
    try {
      setIsLoading(true);
      email && (await editEmailUser(email, token));
      const { isAlreadyVerified } = await verifyToken(token);
      setIsAlreadyVerified(isAlreadyVerified);

      autoLoginTimeout = setTimeout(autoLogin, 5 * 1000);
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

  const handleAutoLoginThenRedirect = async () => {
    if (autoLoginTimeout) {
      clearTimeout(autoLoginTimeout);
    }
    await autoLogin();
  };

  const autoLogin = async () => {
    // Process login automatically
    const { error } = await signIn("token", {
      redirect: false,
      token: token,
    });

    if (error) {
      setErrMsg(error);
    } else {
      router.push(ROUTE.INDEX);
    }
  };

  return (
    <Layout>
      <div className="xs:hidden mdonly:ml-[40px] ml-[270px]">
        <Breadcrumb title="新規利用登録" />
      </div>
      <section className="flex flex-col gap-[48px] relative max-w-[544px] xs:mt-[18px] xs:mb-[431px] mt-[42px] xsup:mb-[1083px] mx-auto">
        <div className="flex flex-col justify-center gap-12 xs:gap-9 items-center xs:mx-5">
          {isLoading && <LoadingSpinner />}

          {!isLoading && !isErrorToken && (
            <>
              <div className="flex items-center">
                <h3 className="usr-title-line text-center xs:max-w-[224px]">
                  {isAlreadyVerified ? "すでにご登録は完了しております。" : "ご登録ありがとうございました。"}
                </h3>
              </div>
              <div className="flex flex-col gap-12 xs:gap-6 items-center">
                <div className="text-center text-base leading-7 text-color xs:font-medium xs:!text-left font-light">
                  <p>{isAlreadyVerified ? "あそび場をご利用いただける準備が整っております！" : "これであそび場をご利用いただける準備が整いました！"}</p>
                  <br />
                  <p>ぜひ、お子様と一緒に楽しみながら遊びの計画を立ててみてください。</p>
                  <p>5秒後にトップページに移ります。</p>
                </div>

                <Button type="submit" variant="contained"
                  onClick={handleAutoLoginThenRedirect} className="md:w-[290px] md:h-12 md:!text-[18px] mdup:w-[360px] mdup:h-[64px]">
                  トップページに移動する
                </Button>
                <Error message={errMsg} />
              </div>
            </>
          )}

          {!isLoading && isErrorToken && (
            <p className="text-center">リンクが違っております。再度に「アカウント登録メール認証のお知らせ」からリンクにクリックしてください。</p>
          )}
        </div>
      </section>
    </Layout>
  );
}
