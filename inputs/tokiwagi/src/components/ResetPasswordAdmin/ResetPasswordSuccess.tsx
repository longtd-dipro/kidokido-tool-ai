import Image from "next/legacy/image";

import { ROUTE } from "constants/route";
import Button from "components/common/Buttons/AdminButton";
import LogoAdmin from "statics/images/logo-login-admin.svg";

export default function ResetPasswordSuccess() {
  return (
    <section className="admin h-screen flex relative">
      <div className="flex flex-col justify-center items-center content-center mx-auto">
        <div className="ad-section-container max-w-[525px] p-[24px]">
          <div className="flex justify-center">
            <Image src={LogoAdmin} alt="Logo" />
          </div>
          <div className="flex flex-col gap-[48px] pt-[46px] pb-[43px]">
            <h2 className="flex-none order-0 shrink-0 text-[24px] leading-[32px] font-bold ad-text-color-3 text-center">
            パスワードを変更しました
            </h2>
            <div className="flex max-w-[477px]">
              <h3 className="text-base leading-[20px] font-medium text-center ad-text-color-3">
              パスワードを変更が完了しました。 <br/>
              このままログインされる場合は、ログイン画面へ進んでください。
              </h3>
            </div>
          </div>
          <div className="flex justify-center">
            {/*Submit*/}

            <Button href={ROUTE.ADMIN_SIGN_IN} type="submit" variant="contained">
              <h2 className="text-center text-base font-bold leading-[20px] px-[57px] py-[8px]">
              ログイン
              </h2>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
