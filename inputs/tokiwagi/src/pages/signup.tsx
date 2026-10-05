import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import TextField from "@mui/material/TextField";
import Link from "next/link";
import Image from "next/legacy/image";
import router from "next/router";
import { usePostalJp } from "use-postal-jp";
import { signIn } from "next-auth/react";

import LineDottedHorizontal2 from "statics/images/line-dotted-horizontal-lg-mobile.svg";
import LineDottedHorizontal from "statics/images/line-dotted-horizontal-lg.svg";
import Error from "components/common/Error";
import TextInputField from "components/common/Fields/TextInputField";
import Label from "components/common/Admin/LabelFontLight";
import RadioButtonsField from "components/common/Fields/RadioButtonsField";
import DatePickerField from "components/common/Fields/DatePickerField";
import AutocompleteField from "components/common/Fields/AutocompleteField";
import PasswordInputField from "components/common/Fields/PasswordInputField";
import { PROVINCE_OPTIONS, NEWS_LETTER_OPTIONS, GENDER_OPTIONS, BASIC_EMAIL_REGEX } from "constants/common";
import { signupSchema } from "libs/validation/schemas";
import { UserForm } from "models/UserForm";
import ConfirmInfoUser from "components/User/ConfirmInfoUser";
import { ROUTE } from "constants/route";
import { signup } from "services/api-client/auth.service";
import Layout from "components/common/Layout";
import Breadcrumb from "components/common/UserLayout/Breadcrumb";
import Button from "components/common/Buttons/Button";
import { checkExistingEmail } from "services/api-client/user.service";
import ErrorDialog from "components/common/ErrorDialog";
import EmailNotVerifiedDialog from "components/common/EmailNotVerifiedDialog";
import { ERROR_MESSAGES } from "constants/errors";
import SignupWithLine from "statics/images/line-register.svg";
import SignupWithMail from "statics/images/mail-method.svg";
import { scrollToElementOnError } from "utils/ui";

export default function SignUp() {
  const [infoUser, setInfoUser] = useState<UserForm | undefined>();
  const [isShowConfirmInfo, setIsShowConfirmInfo] = useState<boolean>(false);
  const [isShowErrorDialog, setIsShowErrorDialog] = useState<boolean>(false);
  const [isShowEmailNotVerifiedDialog, setIsShowEmailNotVerifiedDialog] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string>();
  const formRef = useRef(null);

  const {
    handleSubmit,
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserForm>({
    resolver: yupResolver(signupSchema),
  });

  const email = watch("email");
  const postCode = watch("postCode");
  const ready = postCode ? String(postCode).length >= 7 : false;
  const [address] = usePostalJp(String(postCode), ready);

  useEffect(() => {
    if (address) {
      const { prefectureCode: province, address1: address1, address2: address2, address3: address3, address4: address4 } = address;
      setValue("province", province);
      setValue("address", address1 + address2 + address3 + address4);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const hideConfirmInfoDialog = () => {
    setInfoUser(undefined);
    setIsShowConfirmInfo(false);
  };

  const showErrorDialog = () => {
    setIsShowErrorDialog(true);
  };

  const hideErrorDialog = () => {
    setIsShowErrorDialog(false);
  };

  const openConfirmInfoDialog = async (user: UserForm) => {
    setInfoUser(user);
    setErrMsg("");
    try {
      const result = await checkExistingEmail(user.email);
      if (result.existing) {
        if (!result.verified) {
          setIsShowEmailNotVerifiedDialog(true);
          return;
        } else {
          setErrMsg(result.message);
          showErrorDialog();
          return;
        }
      }

      setIsShowConfirmInfo(true);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const onSubmit = async () => {
    setErrMsg("");
    try {
      await signup(infoUser);
      router.push({ pathname: ROUTE.SIGN_UP_SUCCESS, query: { email: infoUser?.email } });
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const checkIfEmailNotVerified = async () => {
    if (email && BASIC_EMAIL_REGEX.test(email)) {
      const result = await checkExistingEmail(email);
      if (result.existing && !result.verified) {
        setIsShowEmailNotVerifiedDialog(true);
      }
    }
  };

  const hideEmailNotVerifiedDialog = () => {
    setIsShowEmailNotVerifiedDialog(false);
  };

  const signInLine = async () => {
    await signIn("line", {
      callbackUrl: `${ROUTE.INDEX}`,
    });
  };

  const handleClickMailButton = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Layout>
      <div className="xs:hidden mdonly:ml-[40px] ml-[270px]">
        <Breadcrumb title="新規利用登録" />
      </div>
      {/* Show Error Dialog */}
      {isShowErrorDialog && <ErrorDialog text="戻る" message={errMsg} onDismiss={hideErrorDialog} />}

      {isShowEmailNotVerifiedDialog && (
        <EmailNotVerifiedDialog message={ERROR_MESSAGES.EMAIL_ALREADY_TAKEN_BUT_NOT_VERIFY} onDismiss={hideEmailNotVerifiedDialog} email={email} />
      )}

      {isShowConfirmInfo ? (
        <ConfirmInfoUser message={errMsg} data={infoUser} onHide={hideConfirmInfoDialog} onSubmit={onSubmit} />
      ) : (
        <section className="relative body-font">
          <div className="container flex flex-col xs:px-5 justify-center mx-auto mt-[89px] mb-[237px] xs:mb-[116px] xs:mt-[18px]">
            <div className="flex flex-col items-center mb-20 md:mb-16 xs:mb-12">
              <h2 className="usr-title-line text-center">アカウント作成はこちら</h2>
              <span
                className="mt-4 text-base xs:text-sm xs:leading-6 text-blue-color break-words font-medium leading-[20px]
                   mdonly:text-[14px] text-center"
              >
                ご希望の方法を選択してアカウント作成に進んで
                <br className="xsup:hidden" />
                ください。
              </span>

              {/*Login With LINE*/}
              <div className="mx-auto mb-2 mt-12 xs:mt-8">
                <div className="cursor-pointer" onClick={signInLine}>
                  <Image src={SignupWithLine} alt="Signup With Line" width={430} height={75} />
                </div>
              </div>
              {/* Register by Mail button */}
              <div>
                <div className="cursor-pointer" onClick={handleClickMailButton}>
                  <Image src={SignupWithMail} alt="Signup With Mail" width={430} height={75} />
                </div>
              </div>
            </div>

            {/*Signup Form*/}
            <form ref={formRef} onSubmit={handleSubmit(openConfirmInfoDialog, scrollToElementOnError)}>
              {/* Login Information */}
              <div className="xsup:w-[600px] mdonly:w-[688px] mx-auto">
                <div className="flex items-center justify-center">
                  <span className="usr-title-line text-center">ログイン情報⼊⼒</span>
                </div>
                <div className="flex flex-col xsup:w-[600px] gap-[32px] mx-auto mt-12">
                  {/*Email*/}
                  <div className="relative">
                    <Label
                      htmlFor="email"
                      isRequired={true}
                      className="flex mb-[10px] font-medium text-[20px] xs:text-base !leading-7 xs:gap-[10px] gap-[20px] text-color"
                    >
                      メールアドレス
                    </Label>
                    <TextInputField
                      name="email"
                      control={control}
                      placeholder="abc@gmail.com"
                      inputProps={{
                        className: `border-0 usr-input-field !py-[16.5px] !px-[16px] ${errors.email ? "text-field-with-error" : ""}`,
                        maxLength: 256,
                        onBlur: () => checkIfEmailNotVerified(),
                      }}
                      className="w-full usr-input-field"
                    />
                    {errors.email && <Error message={errors.email.message} />}
                  </div>

                  {/*Password*/}
                  <div className="relative">
                    <Label
                      htmlFor="message"
                      isRequired={true}
                      className="flex mb-[10px] font-medium text-[20px] xs:text-base !leading-7 xs:gap-[10px] gap-[20px] text-color"
                    >
                      パスワード
                    </Label>
                    <div className="text-[14px] leading-4 mb-[4px] text-color font-medium xs:text-xs xs:leading-5 xs:font-light">
                      <p>※半角記号英数字8文字以上</p>
                      <p>※アルファベットの文字、数字をそれぞれ1文字以上使用してください。</p>
                    </div>
                    <PasswordInputField
                      name="password"
                      placeholder="半角英数字8文字以上"
                      control={control}
                      inputProps={{
                        className: "border-0 usr-input-field !py-[16.5px] !px-[16px]",
                        maxLength: 256,
                      }}
                      className={`w-full usr-input-field ${errors.password ? "text-field-with-error" : ""}`}
                    />
                    {errors.password && <Error message={errors.password.message} />}
                  </div>

                  {/*Confirm Password*/}
                  <div className="relative">
                    <Label
                      htmlFor="message"
                      isRequired={true}
                      className="flex mb-[10px] font-medium text-[20px] xs:text-base !leading-7 xs:gap-[10px] gap-[20px] text-color"
                    >
                      パスワード確認
                    </Label>
                    <PasswordInputField
                      name="confirmationPassword"
                      placeholder="半角英数字8文字以上"
                      control={control}
                      inputProps={{
                        className: "border-0 usr-input-field !py-[16.5px] !px-[16px]",
                        maxLength: 256,
                      }}
                      className={`w-full usr-input-field  ${errors.confirmationPassword ? "text-field-with-error" : ""}`}
                    />
                    {errors.confirmationPassword && <Error message={errors.confirmationPassword.message} />}
                  </div>
                </div>
              </div>

              <li className="xs:hidden flex flex-col items-center justify-center w-full max-w-[900px] mt-[64px] mx-auto">
                <Image src={LineDottedHorizontal} alt="Line Dotted Vertical" className="xs:h-[3px]" />
              </li>
              <li className="xsup:hidden flex flex-col items-center justify-center w-full max-w-[900px] mt-[64px] mx-auto">
                <Image src={LineDottedHorizontal2} alt="Line Dotted Vertical" className="xs:h-[3px]" />
              </li>

              {/* User Information */}
              <div className="mt-10 mdup:w-[600px] mdonly:w-[688px] mx-auto">
                <div className="flex flex-col items-center justify-center">
                  <span className="usr-title-line text-center">お客様情報入力</span>
                  <span
                    className="mt-4 text-base xs:text-sm xs:leading-6 text-color break-words font-medium leading-[20px]
                  md:text-blue-color mdonly:text-[14px]"
                  >
                    ※登録は保護者の方の情報を入力ください。
                  </span>
                </div>
                <div className="flex flex-col gap-8 xs:gap-6 xsup:w-[600px] mx-auto mt-6">
                  <div className="flex gap-[20px] xs:gap-[14px]">
                    {/*LastName*/}
                    <div className="xsup:w-[290px] xs:mb-[20px]">
                      <Label
                        htmlFor="lastName"
                        isRequired={true}
                        className="flex mb-[10px] font-medium text-[20px] xs:text-base !leading-7 xs:gap-[10px] gap-[20px] text-color"
                      >
                        姓
                      </Label>
                      <TextInputField
                        id="lastName"
                        name="lastName"
                        placeholder="山田"
                        control={control}
                        inputProps={{
                          className: `border-0 usr-input-field !py-[16.5px] !px-[16px] ${errors.lastName ? "text-field-with-error" : ""}`,
                          maxLength: 256,
                        }}
                        className="w-full usr-input-field"
                      />
                      {errors.lastName && <Error message={errors.lastName.message} />}
                    </div>

                    {/*FirstName*/}
                    <div className="xsup:w-[290px] xs:mb-[20px]">
                      <Label
                        htmlFor="firstName"
                        isRequired={true}
                        className="flex mb-[10px] font-medium text-[20px] xs:text-base !leading-7 xs:gap-[10px] gap-[20px] text-color"
                      >
                        名
                      </Label>
                      <TextInputField
                        name="firstName"
                        placeholder="太郎"
                        control={control}
                        inputProps={{
                          className: `border-0 usr-input-field !py-[16.5px] !px-[16px] ${errors.firstName ? "text-field-with-error" : ""}`,
                          maxLength: 256,
                        }}
                        className="w-full usr-input-field"
                      />
                      {errors.firstName && <Error message={errors.firstName.message} />}
                    </div>
                  </div>

                  <div className="flex gap-[20px] xs:gap-[14px]">
                    {/*LastName Furigana*/}
                    <div className="xsup:w-[290px] mb-[20px]">
                      <Label
                        htmlFor="lastNameFurigana"
                        isRequired={true}
                        className="flex mb-[10px] font-medium text-[20px] xs:text-base !leading-7 xs:gap-[10px] gap-[20px] text-color"
                      >
                        セイ（カナ）
                      </Label>
                      <TextInputField
                        name="lastNameFurigana"
                        placeholder="ヤマダ"
                        control={control}
                        inputProps={{
                          className: `border-0 usr-input-field !py-[18.5px] !px-[16px] ${errors.lastNameFurigana ? "text-field-with-error" : ""}`,
                          maxLength: 256,
                        }}
                        className="w-full usr-input-field"
                      />
                      {errors.lastNameFurigana && <Error message={errors.lastNameFurigana.message} />}
                    </div>

                    {/*FistName Furigana*/}
                    <div className="xsup:w-[290px] xs:mb-[20px]">
                      <Label
                        htmlFor="firstNameFurigana"
                        isRequired={true}
                        className="flex mb-[10px] font-medium text-[20px] xs:text-base !leading-7 xs:gap-[10px] gap-[20px] text-color"
                      >
                        メイ（カナ）
                      </Label>
                      <TextInputField
                        name="firstNameFurigana"
                        placeholder="タロウ"
                        control={control}
                        inputProps={{
                          className: `border-0 usr-input-field !py-[18.5px] !px-[16px] ${errors.firstNameFurigana ? "text-field-with-error" : ""}`,
                          maxLength: 256,
                        }}
                        className="w-full usr-input-field"
                      />
                      {errors.firstNameFurigana && <Error message={errors.firstNameFurigana.message} />}
                    </div>
                  </div>

                  {/*Birthday*/}
                  <div className="">
                    <Label
                      htmlFor="birthday"
                      isRequired={true}
                      className="flex mb-[10px] font-medium text-[20px] xs:text-base !leading-7 xs:gap-[10px] gap-[20px] text-color"
                    >
                      生年月日
                    </Label>
                    <DatePickerField
                      name="birthday"
                      control={control}
                      defaultValue={null}
                      disableFuture={true}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="YYYY/MM/DD"
                          inputProps={{
                            className: "border-0 usr-input-field !py-[15px] !px-[16px]",
                            ...params.inputProps,
                          }}
                          className={`flex justify-between w-full usr-input-field ${errors.birthday ? "text-field-with-error" : ""}`}
                        />
                      )}
                    />
                    {errors.birthday && <Error message={errors.birthday.message} />}
                  </div>

                  {/*Gender*/}
                  <div className="gap-[10px]">
                    <Label
                      htmlFor="gender"
                      isRequired={true}
                      className="flex mb-[10px] font-medium text-[20px] xs:text-base !leading-7 xs:gap-[10px] gap-[20px] text-color"
                    >
                      性別
                    </Label>
                    <RadioButtonsField
                      name="gender"
                      control={control}
                      options={GENDER_OPTIONS}
                      sx={{
                        "& .MuiSvgIcon-root:not(.MuiSvgIcon-root ~ .MuiSvgIcon-root)": {
                          color: `${errors.gender ? "#dc0404" : ""}`,
                        },
                      }}
                      className={"!inline-block w-full usr-radio-checkbox checkbox"}
                    />
                    {errors.gender && <Error message={errors.gender.message} />}
                  </div>

                  {/*Phone*/}
                  <div className="">
                    <Label
                      htmlFor="phone"
                      isRequired={true}
                      className="flex mb-[10px] font-medium text-[20px] xs:text-base !leading-7 xs:gap-[10px] gap-[20px] text-color"
                    >
                      電話番号
                    </Label>
                    <span className="text-[14px] xs:text-xs xs:leading-5 xs:font-light leading-[16px] font-medium text-color">ハイフンなしで入力する</span>
                    <div>
                      <TextInputField
                        name="phone"
                        type="phone"
                        placeholder="00000000000"
                        control={control}
                        inputProps={{
                          className: `border usr-input-field !py-[14.5px] !px-[16px] ${errors.phone ? "text-field-with-error" : ""}`,
                          maxLength: 11,
                        }}
                        className="w-full xsup:w-[290px] usr-input-field"
                      />
                    </div>
                    {errors.phone && <Error message={errors.phone.message} />}
                  </div>

                  <div className="flex xsup:gap-[20px] xs:flex-col">
                    {/*PostCode*/}
                    <div className="xsup:w-[290px]">
                      <Label
                        htmlFor="postCode"
                        isRequired={true}
                        className="flex mb-[10px] font-medium text-[20px] xs:text-base !leading-7 xs:gap-[10px] gap-[20px] text-color"
                      >
                        郵便番号
                      </Label>
                      <span className="text-[14px] xs:text-xs xs:leading-5 xs:font-light leading-[16px] font-medium text-color">ハイフンなしで入力する</span>
                      <TextInputField
                        name="postCode"
                        control={control}
                        placeholder="0000000"
                        inputProps={{
                          className: `border-0 usr-input-field !py-[16.5px] !px-[16px] ${errors.postCode ? "text-field-with-error" : ""}`,
                          maxLength: 7,
                        }}
                        className="w-full usr-input-field"
                      />
                      {errors.postCode && <Error message={errors.postCode.message} />}
                    </div>

                    {/*Province*/}
                    <div className="xsup:w-[290px] mt-[25px]">
                      <Label
                        htmlFor="province"
                        isRequired={true}
                        className="flex mb-[10px] font-medium text-[20px] xs:text-base !leading-7 xs:gap-[10px] gap-[20px] text-color"
                      >
                        都道府県
                      </Label>
                      <AutocompleteField
                        placeholder="選択してください"
                        id="province"
                        name="province"
                        control={control}
                        className={`usr-dropdown-field ${errors.province ? "dropdown-field-with-error" : ""}`}
                        options={Object.values(PROVINCE_OPTIONS).map((item) => item.value)}
                        getOptionLabel={(option) => Object.values(PROVINCE_OPTIONS).find((item) => item.value === option)?.label || ""}
                        renderInput={(params) => (
                          <TextField
                            placeholder="選択してください"
                            InputProps={{
                              className: "usr-dropdown-field py-[6px] ",
                            }}
                            {...params}
                          />
                        )}
                      />
                      {errors.province && <Error message={errors.province.message} />}
                    </div>
                  </div>

                  {/*Address*/}
                  <div className="">
                    <Label
                      htmlFor="address"
                      isRequired={true}
                      className="flex mb-[10px] font-medium text-[20px] xs:text-base !leading-7 xs:gap-[10px] gap-[20px] text-color"
                    >
                      住所（町名以下は入力不要です）
                    </Label>
                    <TextInputField
                      name="address"
                      control={control}
                      placeholder="○○市○○区○○町"
                      inputProps={{
                        className: `border-0 usr-input-field !py-[18.5px] !px-[16px] ${errors.address ? "text-field-with-error" : ""}`,
                        maxLength: 256,
                      }}
                      className="w-full usr-input-field"
                    />
                    {errors.address && <Error message={errors.address.message} />}
                  </div>

                  {/*Mail Magazine*/}
                  <div>
                    <Label
                      htmlFor="address"
                      isRequired={true}
                      className="flex mb-[10px] font-medium text-[20px] xs:text-base !leading-7 xs:gap-[10px] gap-[20px] text-color"
                    >
                      ボーネルンドからの情報を希望する
                    </Label>
                    <RadioButtonsField
                      name="allowedNewsletter"
                      control={control}
                      options={NEWS_LETTER_OPTIONS}
                      sx={{
                        "& .MuiSvgIcon-root:not(.MuiSvgIcon-root ~ .MuiSvgIcon-root)": {
                          color: `${errors.allowedNewsletter ? "#dc0404" : ""}`,
                        },
                      }}
                      className="!inline-block w-full usr-radio-checkbox"
                      defaultValue={true}
                    />
                    {errors.allowedNewsletter && <Error message={errors.allowedNewsletter.message} />}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center mt-[49px] xs:mt-9">
                {/*Agree Privacy*/}
                <div className="flex flex-col text-center p-0 gap-[16px] mb-[18px] xs:mb-9">
                  <div className="flex text-left p-0 gap-[16px] xs:text-[13px] xs:leading-6">
                    <input
                      type="checkbox"
                      className={`w-[24px] h-[24px] rounded-[5px] ${errors.address ? "border-[#dc0404]" : ""}`}
                      {...register("agreePrivacy")}
                    ></input>
                    <label htmlFor="agreePrivacy">
                      <Link passHref href={`${ROUTE.TERMS_OF_USE}?isFromSignUp=true`} legacyBehavior>
                        <a className="text-blue-color cursor-pointer" target="_blank">
                          利用規約
                        </a>
                      </Link>
                      と
                      <Link passHref href={`${ROUTE.PRIVACY_POLICY}?isFromSignUp=true`} legacyBehavior>
                        <a className="text-blue-color" target="_blank">
                          プライバシーポリシー
                        </a>
                      </Link>
                      に同意します。
                    </label>
                  </div>
                  {errors.agreePrivacy && <Error message={errors.agreePrivacy.message} />}
                </div>

                {/*Confirm Info*/}
                <Button type="submit" variant="contained" className="xs:w-[290px] md:h-12 md:!text-[18px] w-[300px] h-[64px]">
                  次へ
                </Button>
              </div>
            </form>
            <div className="text-center mt-2">
              {Object.keys(errors).length === 0 || (Object.keys(errors).length === 1 && !!errors.agreePrivacy) ? (
                ""
              ) : (
                <Error message={"ご入力いただいた項目に不備があります。再度ご確認とご入力の上送信ボタンを押してください。"} />
              )}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
