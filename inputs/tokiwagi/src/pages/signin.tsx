import { yupResolver } from "@hookform/resolvers/yup";
import { Checkbox, FormControlLabel } from "@mui/material";
import { signIn, useSession } from "next-auth/react";
import Image from "next/legacy/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import Button from "components/common/Buttons/Button";
import EmailNotVerifiedDialog from "components/common/EmailNotVerifiedDialog";
import Error from "components/common/Error";
import ErrorDialog from "components/common/ErrorDialog";
import PasswordInputField from "components/common/Fields/PasswordInputField";
import TextInputField from "components/common/Fields/TextInputField";
import Layout from "components/common/Layout";
import Breadcrumb from "components/common/UserLayout/Breadcrumb";
import { ROLE, QR_REDIRECT_QUERY_KEY } from "constants/common";
import { ERROR_MESSAGES } from "constants/errors";
import { ROUTE } from "constants/route";
import { getForbiddenRedirect } from "utils/forbiddenSignIn";
import { signInSchema } from "libs/validation/schemas";
import LoginWithLine from "statics/images/login-with-line.svg";
import LoginWithMail from "statics/images/login-with-mail.svg";
import LineDottedHorizontalMobile from "statics/images/line-dotted-horizontal-lg-mobile.svg";
import LineDottedHorizontal from "statics/images/line-dotted-horizontal-lg.svg";

type FormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export default function SignIn() {
  const [errMsg, setErrMsg] = useState<string>();
  const [isShowErrorDialog, setIsShowErrorDialog] = useState<boolean>(false);
  const [isShowEmailNotVerifiedDialog, setIsShowEmailNotVerifiedDialog] = useState<boolean>(false);
  const router = useRouter();
  const formRef = useRef(null);

  const { data: session } = useSession();
  const user = session?.user;

  const getRedirectTarget = () => {
    if (router.query.redirect) return router.query.redirect as string;
    if (router.query[QR_REDIRECT_QUERY_KEY]) return `${ROUTE.INDEX}?${QR_REDIRECT_QUERY_KEY}=true`;
    return ROUTE.INDEX;
  };

  useEffect(() => {
    if (user) {
      if (user.role === ROLE.USER) {
        router.push(getRedirectTarget());
      } else {
        router.push(ROUTE.ADMIN_INDEX);
      }
    }
  }, [user]);

  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(signInSchema),
    defaultValues: { rememberMe: true },
  });

  const email = watch("email");

  const showErrorDialog = () => {
    setIsShowErrorDialog(true);
  };

  const hideErrorDialog = () => {
    setIsShowErrorDialog(false);
  };

  const hideEmailNotVerifiedDialog = () => {
    setIsShowEmailNotVerifiedDialog(false);
  };

  const onSubmit = async (values) => {
    setErrMsg("");
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });

      // signIn bypasses the axios 403 interceptor, so handle an IP-block 403 here.
      const forbiddenRedirect = getForbiddenRedirect(result);
      if (forbiddenRedirect) {
        router.push(forbiddenRedirect);
        return;
      }

      const error = result?.error;
      if (error) {
        if (error === ERROR_MESSAGES.ACCOUNT_NOT_VERIFY) {
          setIsShowEmailNotVerifiedDialog(true);
        } else {
          setErrMsg(error);
          showErrorDialog();
        }
      } else {
        router.push(getRedirectTarget());
      }
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const signInLine = async () => {
    const callbackUrl = router.query[QR_REDIRECT_QUERY_KEY]
      ? `${ROUTE.INDEX}?${QR_REDIRECT_QUERY_KEY}=true`
      : ROUTE.INDEX;
    await signIn("line", { callbackUrl });
  };

  const handleClickMailButton = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Layout>
      <div className="xs:hidden mdonly:ml-[40px] ml-[270px]">
        <Breadcrumb title="ログイン" />
      </div>
      <section className="flex flex-col gap-[48px] xs:gap-9 max-w-[900px] relative xs:px-5 md:mb-[200px] mb-[415px] mx-auto xs:mb-12">
        <div className="flex flex-col justify-center">
          <div className="relative z-10 flex flex-col gap-12 md:gap-9 mt-10 md:mt-8 xs:mt-[18px]">
            <div className="flex flex-col gap-4 md:gap-[10px] items-center">
              <h2 className="usr-title-line text-center xs:!text-[26px]">ログイン方法を選択</h2>
              <p className="text-base leading-[20px] md:text-sm md:leading-6 md:font-light font-medium text-blue-color">
                ご希望のログイン方法を選択してください。
              </p>
            </div>

            <div className="mx-auto mb-4 xs:mb-0">
              <div className="cursor-pointer" onClick={handleClickMailButton} ref={formRef}>
                <Image src={LoginWithMail} alt="Login With Mail" width={430} height={75} />
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center">
              <div className="flex flex-col gap-[24px] md:w-full mdonly:w-[600px] lg:w-[600px]">
                {/*Email*/}
                <div className="relative">
                  <label htmlFor="email" className="text-[20px] !leading-7 text-color font-medium xs:text-base">
                    メールアドレス
                  </label>
                  <TextInputField
                    name="email"
                    id="email"
                    control={control}
                    placeholder="abc@gmail.com"
                    inputProps={{
                      className: "border-0 usr-input-field p-[16.5px]",
                      maxLength: 256,
                    }}
                    className="w-full usr-input-field mt-[10px] xs:mt-2"
                  />
                  {errors.email && <Error message={errors.email.message} />}
                </div>

                {/*Password*/}
                <div className="relative">
                  <label htmlFor="message" className="text-[20px] !leading-7 text-color font-medium xs:text-base">
                    パスワード
                  </label>
                  <PasswordInputField
                    name="password"
                    placeholder="*********"
                    control={control}
                    inputProps={{
                      className: "border-0 usr-input-field p-[16.5px]",
                      maxLength: 256,
                    }}
                    className="w-full usr-input-field mt-[10px] xs:mt-2"
                  />
                  {errors.password && <Error message={errors.password.message} />}
                </div>

                <div className="flex flex-col flex-start items-center">
                  {/*Remember me*/}
                  <div className="relative mb-4 xs:mb-6">
                    <FormControlLabel
                      control={
                        <Controller
                          name="rememberMe"
                          control={control}
                          render={({ field: props }) => <Checkbox {...props} checked={props.value} onChange={(e) => props.onChange(e.target.checked)} />}
                        />
                      }
                      label="ログイン情報を保存する"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-[48px] xs:gap-9">
                {/*Submit*/}
                <Button type="submit" variant="contained" className="md:w-[290px] md:h-12 md:!text-[18px] w-[300px] h-[64px]">
                  ログイン
                </Button>

                <li className="xs:hidden flex flex-col items-center justify-center w-full max-w-[900px] mx-auto">
                  <Image src={LineDottedHorizontal} alt="Line Dotted Vertical" className="xs:h-[3px]" />
                </li>
                <li className="xsup:hidden flex flex-col items-center justify-center w-full max-w-[900px] mx-auto">
                  <Image src={LineDottedHorizontalMobile} alt="Line Dotted Vertical" className="xs:h-[3px]" />
                </li>
                <div className="flex flex-col items-center gap-4 text-base !leading-[20px] xs:text-sm underline font-medium text-color">
                  <div className="mx-auto mb-4 xs:mb-0">
                    <div className="cursor-pointer mb-4" onClick={signInLine}>
                      <Image src={LoginWithLine} alt="Login With Line" width={430} height={75} />
                    </div>
                  </div>
                  {/* Forgot password */}
                  <Link href={ROUTE.FORGOT_PASSWORD} legacyBehavior>
                    <a className="block">パスワードを忘れた方はこちら</a>
                  </Link>
                  {/*
                    /signup is IP-limited. Use a full-page navigation (plain <a>) instead of
                    next/link client routing: a client-side transition only fetches the page data
                    and does not reliably follow the middleware's redirect to /403, so a blocked
                    user would still land on signup. A document request lets middleware redirect.
                  */}
                  <a href={ROUTE.SIGN_UP} className="block">会員登録をされていない方はこちら</a>
                </div>
              </div>
              {/*Error*/}
              {isShowErrorDialog && <ErrorDialog text="OK" message={errMsg} onDismiss={hideErrorDialog} />}
              {isShowEmailNotVerifiedDialog && (
                <EmailNotVerifiedDialog message={ERROR_MESSAGES.EMAIL_ALREADY_TAKEN_BUT_NOT_VERIFY} onDismiss={hideEmailNotVerifiedDialog} email={email} />
              )}
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
}
