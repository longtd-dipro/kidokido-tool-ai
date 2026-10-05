import { useRouter } from "next/router";

import Button from "components/common/Buttons/Button";
import { ROUTE } from "constants/route";
import UserLayout from "components/common/UserLayout";

export default function ResetPasswordSuccess() {
  const router = useRouter();

  const handleRedirect = () => {
    router.push(ROUTE.SIGN_IN);
  };

  return (
    <UserLayout heading="アカウント情報の編集" title="マイページ">
      <section className="flex flex-col gap-[48px] relative max-w-[600px] xsup:mt-[40px] xsup:mb-[250px] mx-auto">
        <div className="flex flex-col justify-center xs:mx-5">
          <div className="relative flex flex-col gap-[48px] mt-10">
            <div className="flex flex-col items-center">
              <h2 className="usr-title-line text-center">
                パスワードを変更しました
              </h2>
            </div>
            <div className="text-base text-center font-light text-color">
              <p>パスワードを変更が完了しました。</p>
              <p>
                このままログインされる場合は、ログイン画面へ進んでください。
              </p>
            </div>
            <div className="w-full flex flex-col items-center">
              <Button
                type="button"
                variant="contained"
                className="xs:w-[300px] w-[360px] h-[64px]"
                onClick={handleRedirect}
              >
                ログイン
              </Button>
            </div>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}
