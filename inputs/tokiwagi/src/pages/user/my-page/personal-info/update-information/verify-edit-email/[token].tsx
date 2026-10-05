import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

import Error from "components/common/Error";
import Layout from "components/common/Layout";
import Button from "components/common/Buttons/Button";
import { verifyToken } from "services/api-client/auth.service";
import Breadcrumb from "components/common/UserLayout/Breadcrumb";
import { ROUTE } from "constants/route";
import { editEmailUser } from "services/api-client/user.service";
import Spinner from "components/common/Spinner";

export default function VerifyToken() {
  const [errMsg, setErrMsg] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(true);

  const router = useRouter();
  const token = router.query.token as string;
  const email = router.query.email as string;

  let updateEmailSpaceToPlus;
  if (email?.includes(" ")) {
    updateEmailSpaceToPlus = email?.replace(" ", "+");
  } else {
    updateEmailSpaceToPlus = email;
  }

  useEffect(() => {
    if (token) {
      processVerifyToken(token as string);
    }
  }, [token]);

  const processVerifyToken = async (token: string) => {
    setIsSubmitting(true);
    setErrMsg("");
    try {
      await verifyToken(token);
      await editEmailUser(updateEmailSpaceToPlus, token);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const backToSignIn = async () => {
    await signOut({ callbackUrl: ROUTE.SIGN_IN });
  };

  return (
    <Layout>
      <div className="xs:hidden mdonly:ml-[40px] ml-[270px]">
        <Breadcrumb title="新規利用登録" />
      </div>
      {!isSubmitting ? (
        <section className="flex flex-col gap-[48px] relative max-w-[544px] xs:mt-[18px] xs:mb-[431px] mt-[42px] xsup:mb-[1083px] mx-auto">
          <div className="flex flex-col justify-center gap-12 xs:gap-9 items-center xs:mx-5">
            {!errMsg ? <>
              <div className="flex items-center">
                <h3 className="usr-title-line text-center xs:max-w-[224px]">メールアドレスの変更が完了しました</h3>
              </div>
              <div className="flex flex-col gap-12 xs:gap-6 items-center">
                <div className="text-center text-base leading-7 text-color xs:font-medium xs:!text-left font-light">
                  <p>これであそび場をご利用いただける準備が整いました！</p>
                  <br />
                  <p>ぜひ、お子様と一緒に楽しみながら、あそびの計画を立ててみてください。このままログインされる場合は、ログイン画面へ進んでください。</p>
                </div>
                {/*Back To SignIn*/}
                <Button type="submit" variant="contained" onClick={backToSignIn} className="md:w-[290px] md:h-12 md:!text-[18px] mdup:w-[360px] mdup:h-[64px]">
                  ログイン
                </Button>
              </div>
            </> :
              <Error message={errMsg} />
            }
          </div>
        </section>
      ) : (
        <div className="flex justify-center items-center">
          <Spinner />
        </div>
      )}
    </Layout>
  );
}
