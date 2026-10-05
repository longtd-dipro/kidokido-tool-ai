import { useRouter } from "next/router";

import Button from "components/common/Buttons/Button";
import { ROUTE } from "constants/route";
import UserLayout from "components/common/UserLayout";

export default function UpdateCreditSuccess() {
  const router = useRouter();

  const handleRedirect = () => {
    router.push(ROUTE.USER_PERSONAL_INFO);
  };

  return (
    <UserLayout heading="アカウント情報の編集" title="マイページ">
      <section className="flex flex-col gap-[48px] relative max-w-[600px] xsup:mt-[40px] xsup:mb-[250px] mx-auto">
        <div className="flex flex-col justify-center xs:mx-5">
          <div className="relative flex flex-col gap-[48px] mt-10">
            <div className="flex flex-col items-center">
              <h2 className="usr-title-line text-center xs:!w-full">アカウント情報を更新しました</h2>
            </div>
            <div className="w-full flex flex-col items-center">
              <Button type="button" variant="contained" className="xs:w-[300px] w-[360px] h-[64px]" onClick={handleRedirect}>
                マイページに戻る
              </Button>
            </div>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}
