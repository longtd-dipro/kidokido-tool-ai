import { yupResolver } from "@hookform/resolvers/yup";
import { Grid, TextField } from "@mui/material";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { usePostalJp } from "use-postal-jp";
import { signOut, useSession } from "next-auth/react";
import { cloneDeep, isNil } from "lodash";

import Label from "components/common/Admin/Label";
import Error from "components/common/Error";
import Button from "components/common/Buttons/Button";
import AutocompleteField from "components/common/Fields/AutocompleteField";
import DatePickerField from "components/common/Fields/DatePickerField";
import RadioButtonsField from "components/common/Fields/RadioButtonsField";
import TextInputField from "components/common/Fields/TextInputField";
import { GENDER_OPTIONS, NEWS_LETTER_OPTIONS, PROVINCE_OPTIONS } from "constants/common";
import { ROUTE } from "constants/route";
import { UserForm } from "models/UserForm";
import { checkExistingEmail, updateUser } from "services/api-client/user.service";
import UserSideActiveImage from "statics/images/user/user-active.svg";
import { updateLineUserSchema } from "libs/validation/schemas";
import ErrorDialog from "components/common/ErrorDialog";
import { User } from "models/Entity";
import { scrollToElementOnError } from "utils/ui";

import ConfirmInfoUserMyPage from "../ConfirmInfoUserMyPage";

type Props = {
  user: UserForm;
  changeHeading?: (heading: string) => void;
  onRefresh: () => void;
};

const UpdateUserForm = ({ user, onRefresh, changeHeading }: Props) => {
  const [infoUserUpdate, setInfoUserUpdate] = useState<UserForm>();
  const [isShowConfirmInfoDialog, setIsShowConfirmInfoDialog] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string>("");
  const [isShowPopupDialog, setIsShowPopupDialog] = useState<boolean>(false);
  const [isShowErrorDialog, setIsShowErrorDialog] = useState<boolean>(false);

  const router = useRouter();
  const isLineSignUpMode = router.query.line_signup;
  const { data: session } = useSession();

  const transformUserDefaultValues = (user: UserForm) => {
    const result: any = cloneDeep(user);
    result.gender = isNil(result.gender) ? "" : result.gender;
    return result;
  };

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserForm>({
    resolver: yupResolver(updateLineUserSchema),
    defaultValues: transformUserDefaultValues(user),
  });

  const postCode = watch("postCode");
  const [address] = usePostalJp(String(postCode), String(postCode).length >= 7);

  useEffect(() => {
    if (user !== undefined && !user?.firstName) {
      handleShowPopupDialog();
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [isShowConfirmInfoDialog, isShowPopupDialog]);

  const openConfirmInfoDialog = async (userForm: UserForm) => {
    setErrMsg("");
    setInfoUserUpdate(userForm);
    changeHeading && changeHeading("アカウント情報の確認・編集");

    try {
      if (!user.email || (user.email && user.email != userForm.email)) {
        const result = await checkExistingEmail(userForm.email);
        if (result.existing) {
          setErrMsg(result.message);
          showErrorDialog();
          return;
        }
      }

      setIsShowConfirmInfoDialog(true);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const hideConfirmInfoDialog = () => {
    setInfoUserUpdate(undefined);
    changeHeading && changeHeading("アカウント情報の編集");
    setIsShowConfirmInfoDialog(false);
  };

  const showErrorDialog = () => {
    setIsShowErrorDialog(true);
  };

  const hideErrorDialog = () => {
    setIsShowErrorDialog(false);
  };

  useEffect(() => {
    if (address) {
      const { prefectureCode: province, address1: address1, address2: address2, address3: address3, address4: address4 } = address;
      if (!user) {
        setValue("province", province, { shouldValidate: true });
        setValue("address", address1 + address2 + address3 + address4, { shouldValidate: true });
      } else {
        if (postCode != user.postCode) {
          setValue("province", province, { shouldValidate: true });
          setValue("address", address1 + address2 + address3 + address4, { shouldValidate: true });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const handleShowPopupDialog = () => {
    setIsShowPopupDialog(true);
  };

  const handleHidePopupDialog = () => {
    setIsShowPopupDialog(false);
  };

  const prepareUserInfoToUpdate = () => {
    const { updatedAt, ...result } = infoUserUpdate as any;

    return { ...result, isLineSignUpMode };
  };

  const onSubmit = async () => {
    try {
      setErrMsg("");
      const dataToUpdate = prepareUserInfoToUpdate();
      const updatedUser = await updateUser(dataToUpdate);
      await onRefresh();
      hideConfirmInfoDialog();
      handleRedirectSuccess(updatedUser);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const handleRedirectSuccess = (updatedUser?: User) => {
    if (isLineSignUpMode) {
      return signOut({ callbackUrl: `${ROUTE.SIGN_UP_SUCCESS}?token=${updatedUser.token}&email=${infoUserUpdate.email}` });
    }

    if (session.user.email === infoUserUpdate.email) {
      return router.push(ROUTE.USER_UPDATE_INFORMATION_SUCCESS);
    } else {
      return signOut({ callbackUrl: ROUTE.SIGN_UP_SUCCESS });
    }
  };

  const handleRedirectBack = () => {
    router.push(ROUTE.USER_PERSONAL_INFO);
  };

  return (
    <section>
      {/* Heading */}
      <div className="pl-4 py-6 bg-[#fafafa] flex flex-row justify-between items-center gap-4 relative xs:mx-5">
        <div className="flex items-center justify-center gap-x-5">
          <Image src={UserSideActiveImage} alt={UserSideActiveImage} />
          <span className="font-medium text-2xl text-blue-color">基本情報</span>
        </div>

        <div className="absolute inset-0 border-b-2 border-dotted border-[#979797]"></div>
      </div>

      {/* Show Error Dialog */}
      {isShowErrorDialog && <ErrorDialog text="戻る" message={errMsg} onDismiss={hideErrorDialog} />}

      {/* Confirm Dialog */}
      {isShowConfirmInfoDialog && (
        <ConfirmInfoUserMyPage textConfirm="確定" data={infoUserUpdate} message={errMsg} onHide={hideConfirmInfoDialog} onSubmit={onSubmit} />
      )}

      {/* Notification Error */}
      {isShowPopupDialog && <ErrorDialog onDismiss={handleHidePopupDialog} message="必要なアカウント情報を入力してください" text="次へ" />}

      {!isShowConfirmInfoDialog && (
        <div className="relative xsup:px-[40px] xsup:py-4 mdup:!px-[80px] xs:px-5">
          {/*Separator Line*/}
          <div
            className="absolute  top-0 left-0 right-0 bottom-32 xs:bottom-[150px] xs:mx-5 border-b-2 border-dotted border-[#979797] 
          mb-10 mdonly:mb-5 xs:mb-14"
          ></div>

          <form onSubmit={handleSubmit(openConfirmInfoDialog, scrollToElementOnError)}>
            {/*  First Name Last Name */}
            <div className="relative mt-6 w-[600px] mx-auto xs:w-full">
              <Grid container spacing={4}>
                {/* Last Name */}
                <Grid item xs={6}>
                  <Label htmlFor="lastName" isRequired={true} className={`${STYLES.INPUT_LABEL} !text-[20px] xs:!text-[16px]`}>
                    姓
                  </Label>
                  <div className="mt-2 ">
                    <TextInputField
                      id="lastName"
                      name="lastName"
                      control={control}
                      inputProps={{ maxLength: 256 }}
                      className={`${STYLES.INPUT_FIELD}`}
                      placeholder="山田"
                    />
                  </div>
                  {errors.lastName && <Error message={errors.lastName.message} />}
                </Grid>

                {/* First Name */}
                <Grid item xs={6}>
                  <Label htmlFor="firstName" isRequired={true} className={`${STYLES.INPUT_LABEL} !text-[20px] xs:!text-[16px]`}>
                    名
                  </Label>
                  <div className="mt-2">
                    <TextInputField
                      id="firstName"
                      name="firstName"
                      control={control}
                      inputProps={{ maxLength: 256 }}
                      className={`${STYLES.INPUT_FIELD}`}
                      placeholder="太郎"
                    />
                  </div>
                  {errors.firstName && <Error message={errors.firstName.message} />}
                </Grid>
              </Grid>
            </div>
            {/*  First Name Last Name Katakana */}
            <div className="relative mt-6 w-[600px] mx-auto xs:w-full">
              <Grid container spacing={4} className="">
                {/* First Name */}
                <Grid item xs={6}>
                  <Label htmlFor="lastNameFurigana" isRequired={true} className={`${STYLES.INPUT_LABEL} !text-[20px] xs:!text-[16px]`}>
                    セイ（カナ）
                  </Label>
                  <div className="mt-2">
                    <TextInputField
                      id="lastNameFurigana"
                      name="lastNameFurigana"
                      control={control}
                      className={`${STYLES.INPUT_FIELD}`}
                      inputProps={{ maxLength: 256 }}
                      placeholder="ヤマダ"
                    />
                  </div>
                  {errors.lastNameFurigana && <Error message={errors.lastNameFurigana.message} />}
                </Grid>

                {/* Last Name */}
                <Grid item xs={6}>
                  <Label htmlFor="firstNameFurigana" isRequired={true} className={`${STYLES.INPUT_LABEL} !text-[20px] xs:!text-[16px]`}>
                    メイ（カナ）
                  </Label>
                  <div className="mt-2">
                    <TextInputField
                      id="firstNameFurigana"
                      name="firstNameFurigana"
                      control={control}
                      className={`${STYLES.INPUT_FIELD}`}
                      inputProps={{ maxLength: 256 }}
                      placeholder="タロウ"
                    />
                  </div>
                  {errors.firstNameFurigana && <Error message={errors.firstNameFurigana.message} />}
                </Grid>
              </Grid>
            </div>

            {/* Birthday */}
            <div className="relative mt-6 w-[600px] mx-auto xs:w-full">
              <Grid container>
                <Grid item xs={12}>
                  <Label htmlFor="birthday" isRequired={true} className={`${STYLES.INPUT_LABEL} !text-[20px] xs:!text-[16px]`}>
                    生年月日
                  </Label>
                  <div className="w-full mt-3">
                    <DatePickerField
                      disableFuture={true}
                      name="birthday"
                      control={control}
                      renderInput={(params) => <TextField {...params} className="flex justify-between w-full ad-input-field" placeholder="1998/2/20" />}
                    />
                  </div>
                  {errors.birthday && <Error message={errors.birthday.message} />}
                </Grid>
              </Grid>
            </div>

            {/*Gender*/}
            <div className="relative mt-6 w-[600px] mx-auto xs:w-full">
              <Grid container>
                <Grid item xs={12}>
                  <Label htmlFor="gender" className={`${STYLES.INPUT_LABEL} !text-[20px] xs:!text-[16px]`}>
                    性別
                  </Label>
                  <RadioButtonsField id="gender" name="gender" control={control} options={GENDER_OPTIONS} className="!block mt-2" />
                </Grid>
              </Grid>
            </div>

            {/* PhoneNumber */}
            <div className="relative mt-6 w-[600px] mx-auto xs:w-full">
              <Grid container spacing={4}>
                <Grid item md={6} xs={12}>
                  <Label htmlFor="phone" isRequired={true} className={`${STYLES.INPUT_LABEL} !text-[20px] xs:!text-[16px]`}>
                    電話番号
                  </Label>
                  <p className="pt-3 text-sm font-medium">ハイフンなしで入力する</p>

                  <div className="mt-2">
                    <TextInputField
                      id="phone"
                      name="phone"
                      type="text"
                      control={control}
                      inputProps={{ maxLength: 11 }}
                      className={STYLES.INPUT_FIELD}
                      placeholder="0000 000 000"
                    />
                  </div>
                  {errors.phone && <Error message={errors.phone.message} />}
                </Grid>
              </Grid>
            </div>

            {/* PostCode and Province */}
            <div className="relative mt-6 w-[600px] mx-auto xs:w-full">
              {/* PostCode */}
              <Grid container spacing={4}>
                <Grid item md={6} xs={12}>
                  <Label htmlFor="postCode" isRequired={true} className={`${STYLES.INPUT_LABEL} !text-[20px] xs:!text-[16px]`}>
                    郵便番号
                  </Label>
                  <p className="pt-3 text-sm font-medium block">ハイフンなしで入力する</p>

                  <div className="mt-2">
                    <TextInputField
                      id="postCode"
                      name="postCode"
                      control={control}
                      inputProps={{ maxLength: 7 }}
                      className={`${STYLES.INPUT_FIELD}`}
                      placeholder="1500001"
                    />
                  </div>
                  {errors.postCode && <Error message={errors.postCode.message} />}
                </Grid>

                {/* Province */}
                <Grid item md={6} xs={12} className="xs:!pt-6">
                  <Label htmlFor="province" isRequired={true} className={`${STYLES.INPUT_LABEL} !text-[20px] xs:!text-[16px]`}>
                    都道府県
                  </Label>
                  <p className="pt-3 text-sm font-medium invisible xs:hidden">ハイフンなしで入力する</p>
                  <div className="mt-2">
                    <AutocompleteField
                      placeholder="選択してください"
                      id="province"
                      name="province"
                      control={control}
                      className="ad-dropdown-field"
                      options={Object.values(PROVINCE_OPTIONS).map((item) => item.value)}
                      getOptionLabel={(option) => Object.values(PROVINCE_OPTIONS).find((item) => item.value === option)?.label || ""}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          InputProps={{
                            ...params.InputProps,
                            className: "ad-dropdown-field",
                          }}
                          placeholder="選択してください"
                        />
                      )}
                    />
                  </div>
                  {errors.province && <Error message={errors.province.message} />}
                </Grid>
              </Grid>
            </div>

            {/*  Address */}
            <div className="relative mt-6 w-[600px] mx-auto xs:w-full mb-8">
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Label htmlFor="address" isRequired={true} className={`${STYLES.INPUT_LABEL} !text-[20px] xs:!text-[16px]`}>
                    住所（町名以下は入力不要です）
                  </Label>
                  <div className="mt-2">
                    <TextInputField
                      id="address"
                      name="address"
                      control={control}
                      className={`${STYLES.INPUT_FIELD}`}
                      placeholder="○○市○○区○○町"
                      inputProps={{ maxLength: 256 }}
                    />
                  </div>
                  {errors.address && <Error message={errors.address.message} />}
                </Grid>
              </Grid>
            </div>

            {/*  Email */}
            <div className="relative mt-6 w-[600px] mx-auto xs:w-full mb-8">
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Label htmlFor="email" isRequired={true} className={`${STYLES.INPUT_LABEL} !text-[20px] xs:!text-[16px]`}>
                    メールアドレス
                  </Label>
                  <div className="mt-2">
                    <TextInputField
                      id="email"
                      name="email"
                      control={control}
                      className={`${STYLES.INPUT_FIELD}`}
                      placeholder="dipro@dipro-tech.com"
                      inputProps={{ maxLength: 256 }}
                    />
                  </div>
                  {errors.email && <Error message={errors.email.message} />}
                </Grid>
              </Grid>
            </div>

            {/*  News letter */}
            <div className="relative mt-6 w-[600px] mx-auto xs:w-full mb-24">
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Label htmlFor="allowedNewsletter" className={`${STYLES.INPUT_LABEL} !text-[20px] xs:!text-[16px]`}>
                    ボーネルンドからの情報
                  </Label>
                  <RadioButtonsField id="allowedNewsletter" name="allowedNewsletter" control={control} options={NEWS_LETTER_OPTIONS} className="!block mt-4" />
                </Grid>
              </Grid>
            </div>
            <Error message={errMsg} className="mb-4 text-center" />

            {/* Buttons */}
            <div className="flex xs:flex-col-reverse xs:gap-0 items-center justify-between xs:mt-9 mt-12">
              {/*Button Back*/}
              <Button
                className="xs:w-[290px] xs:!mt-4 mdonly:w-[260px] md:h-12 md:!text-[18px] w-[200px] h-[64px]"
                variant="outlined"
                onClick={handleRedirectBack}
              >
                戻る
              </Button>
              {/*Button Save*/}
              <Button type="submit" className="xs:w-[290px] mdonly:w-[260px] md:h-12 md:!text-[18px] w-[200px] h-[64px]" variant="contained">
                編集
              </Button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

export default UpdateUserForm;

const STYLES = {
  INPUT_CARD: "relative mb-4",
  INPUT_LABEL: "text-xl font-medium",
  INPUT_FIELD: "w-full px-3 py-1 ad-input-field",
  NOTIFY: "w-full",
};
