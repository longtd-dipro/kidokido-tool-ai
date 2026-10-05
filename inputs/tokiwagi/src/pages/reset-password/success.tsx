import { useRouter } from "next/router";

import Layout from "components/common/Layout";
import Button from "components/common/Buttons/Button";
import { ROUTE } from "constants/route";
import Breadcrumb from "components/common/UserLayout/Breadcrumb";

export default function ResetPasswordSuccess() {
  const router = useRouter();

  const handleRedirect = () => {
    router.push(ROUTE.SIGN_IN);
  };

  return (
    <Layout>
      <div className="xs:hidden mdonly:ml-[40px] ml-[270px]">
        <Breadcrumb title="ログイン" />
      </div>
      <section className="flex flex-col gap-12 relative max-w-[600px] mb-[960px] md:mb-[1140px] xs:mb-[460px] mx-auto">
        <div className="flex flex-col justify-center xs:mx-5">
          <div className="relative flex flex-col gap-12 md:gap-9 xs:gap-6 mt-10 md:mt-8 xs:mt-[18px]">
            <div className="flex flex-col items-center">
              <h2 className="usr-title-line text-center">
                パスワードを変更しました
              </h2>
            </div>
            <div className="text-base text-center leading-7 xs:font-medium font-light text-color xs:mt-3">
              <p>パスワードを変更が完了しました。</p> 
              <div className="xsup:hidden"><br /></div>
              <p>
                このままログインされる場合は、ログイン画面へ進んでください。
              </p>
            </div>
            <div className="w-full flex flex-col items-center">
              <Button
                type="button"
                variant="contained"
                className="md:w-[290px] md:h-12 md:!text-[18px] w-[300px] h-[64px]"
                onClick={handleRedirect}
              >
                ログイン
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
