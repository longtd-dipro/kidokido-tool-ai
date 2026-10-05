import { useRouter } from "next/router";

import Layout from "components/common/Layout";
import Breadcrumb from "components/common/UserLayout/Breadcrumb";
import useResendVerificationEmail from "libs/hooks/useResendVerificationEmail";
import Button from "components/common/Buttons/Button";

export default function SignUpSuccess() {
  const router = useRouter();

  const email = router.query.email as string;
  const token = router.query.token as string;

  const { countdown, handleResendEmail, shouldDisableResend } = useResendVerificationEmail({ email, token });

  return (
    <Layout>
      <div className="xs:hidden mdonly:ml-[40px] ml-[270px]">
        <Breadcrumb title="新規利用登録" />
      </div>
      <div className="flex flex-col items-center max-w-[541px] gap-12 xs:gap-6 xs:px-5 mt-[43px] mb-[886px] mx-auto text-center xs:mt-[18px] xs:mb-[451px]">
        <h3 className="usr-title-line text-center">仮登録を受付けました</h3>
        <div className="text-base leading-[24px] font-medium title-font">
          <div className="flex flex-col text-base text-color xs:font-medium font-light xs:mt-3 xs:!text-left">
            <p>まだ登録は完了しておりません。</p>
            <p>登録いただいたメールアドレスに、仮登録完了メールを送信しました。</p>
            <p>メールを確認後、本登録を完了してください。</p>
          </div>
        </div>
        <div className="flex flex-col gap-6 xs:gap-9">
          <Button
            onClick={handleResendEmail}
            disabled={shouldDisableResend}
            type="submit"
            variant="contained"
            className="md:w-[290px] md:h-12 md:!text-[18px] mdup:w-[360px] mdup:h-[64px] px-[30] py-[12px]"
          >
            メールを再送信する {shouldDisableResend ? `(${countdown})` : ""}
          </Button>
          <p className="xs:text-sm xs:leading-6 text-xs leading-[14px] font-light text-left">
            ※ドメイン設定をされている方は「bornelund.co.jp」を受信できるように設定してください。
          </p>
        </div>
      </div>
    </Layout>
  );
}
