import { yupResolver } from "@hookform/resolvers/yup";
import { Card, Grid, TextField } from "@mui/material";
import { User } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { usePostalJp } from "use-postal-jp";
import { useRouter } from "next/router";
import { cloneDeep, isNil } from "lodash";

import Error from "components/common/Error";
import RadioButtonsField from "components/common/Fields/RadioButtonsField";
import TextInputField from "components/common/Fields/TextInputField";
import { GENDER_OPTIONS, NEWS_LETTER_OPTIONS, PROVINCE_OPTIONS } from "constants/common";
import { createUserSchema, updateUserSchema, updateUserSchemaForStaff } from "libs/validation/schemas";
import { createUser, updateUser } from "services/api-client/admin/user.service";
import DatePickerField from "components/common/Fields/DatePickerField";
import AutocompleteField from "components/common/Fields/AutocompleteField";
import PasswordInputField from "components/common/Fields/PasswordInputField";
import AdminButton from "components/common/Buttons/AdminButton";
import Label from "components/common/Admin/Label";
import { ROUTE } from "constants/route";

import ConfirmInfoUserAdmin from "../ConfirmInfoUserAdmin";

interface Props {
  user?: User;
  isStaffMode?: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

type UserFormData = {
  id?: number;
  lastName: string;
  firstName: string;
  lastNameFurigana: string;
  firstNameFurigana: string;
  email: string;
  confirmationEmail: string;
  password: string;
  confirmationPassword: string;
  phone: string;
  postCode: string;
  province: string;
  address: string;
  gender?: boolean | string;
  birthday?: Date;
  allowedNewsletter?: boolean;
};

enum Step {
  InputForm,
  Confirmation,
}

export default function CreateOrUpdateUser({ user, isStaffMode = false, onCancel, onSuccess }: Props) {
  const [step, setStep] = useState<Step>(Step.InputForm);
  const [userPayload, setUserPayload] = useState<UserFormData>();

  const transformUserDefaultValues = (user: User) => {
    const result: any = cloneDeep(user);
    result.confirmationPassword = user.password;
    result.gender = isNil(result.gender) ? "" : result.gender;
    return result;
  };

  const isEditMode = !!user;
  const router = useRouter();

  const [errMsg, setErrMsg] = useState<string>();
  const validationSchema = isEditMode ? (isStaffMode ? updateUserSchemaForStaff : updateUserSchema) : createUserSchema;
  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: user ? transformUserDefaultValues(user) : user,
  });

  const postCode = watch("postCode");
  const [address] = usePostalJp(String(postCode), String(postCode).length >= 7);

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

  const onSubmit = async (data: UserFormData) => {
    if (isStaffMode) {
      handleStaffSubmitUpdateUser(data);
      return;
    }
    setUserPayload(data);
    setStep(Step.Confirmation);
  };

  const prepareUserInfoToUpdate = () => {
    const { updatedAt, ...result } = userPayload as any;
    return result;
  };

  const handleConfirm = async () => {
    try {
      setErrMsg("");
      if (isEditMode) {
        const userInfoToUpdate = prepareUserInfoToUpdate();
        await updateUser(userInfoToUpdate.id, userInfoToUpdate);
      } else {
        const { confirmationEmail, ...data } = userPayload;
        await createUser(data);
      }
      onSuccess();
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const handleStaffSubmitUpdateUser = async (data: UserFormData) => {
    try {
      setErrMsg("");
      if (isEditMode) {
        const { updatedAt, ...userInfoToUpdate } = data as any;
        await updateUser(userInfoToUpdate.id, { ...userInfoToUpdate, fromStaff: true });
        onSuccess();
      }
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const handleRedirect = () => {
    router.push(ROUTE.USER_MANAGEMENT);
  };

  return (
    <>
      {Step.Confirmation === step && userPayload && (
        <ConfirmInfoUserAdmin user={userPayload} onSuccess={handleConfirm} onCancel={handleRedirect} message={errMsg} />
      )}
      {Step.InputForm === step && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="border-t-2 border-x-2 border-[#D9D9D9] pb-8">
            <div className="w-full border-b-2 border-[#D9D9D9]">
              <h1 className="pl-12 my-6 text-xl font-bold">ログイン情報⼊⼒</h1>
            </div>
            {/* Email */}
            <div className="relative px-16 mt-6">
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Label htmlFor="email" isRequired={true}>
                    メールアドレス
                  </Label>
                  <div className="mt-2">
                    <TextInputField
                      id="email"
                      name="email"
                      control={control}
                      className={`${STYLES.INPUT_FIELD}`}
                      placeholder="abc@gmail.com"
                      inputProps={{
                        maxLength: 256,
                      }}
                    />
                  </div>
                  {errors.email && <Error message={errors.email.message} />}
                </Grid>
              </Grid>
            </div>

            {!isStaffMode && (
              <>
                {/* Password */}
                <div className="relative px-16 mt-6">
                  <Grid container spacing={4}>
                    <Grid item xs={12}>
                      <Label htmlFor="password" isRequired={true} className="">
                        パスワード
                      </Label>
                      <p className="px-2 pt-3 text-xs font-medium"> ※大文字、小文字、数字をそれぞれ1⽂字以上使⽤してください。（半⾓記号英数字8⽂字以上）</p>
                      <div className="mt-2">
                        <PasswordInputField
                          id="password"
                          name="password"
                          className="w-full ad-input-field"
                          placeholder="*********"
                          control={control}
                          inputProps={{
                            maxLength: 256,
                          }}
                        />
                      </div>
                      {errors.password && <Error message={errors.password.message} />}
                    </Grid>
                  </Grid>
                </div>

                {/* Confirm Password */}
                <div className="relative px-16 mt-6">
                  <Grid container spacing={4}>
                    <Grid item xs={12}>
                      <Label htmlFor="confirmationPassword" isRequired={true}>
                        パスワード確認
                      </Label>

                      <div className="mt-2">
                        <PasswordInputField
                          className="w-full ad-input-field"
                          placeholder="*********"
                          id="confirmationPassword"
                          name="confirmationPassword"
                          InputProps={{
                            readOnly: isEditMode,
                            disabled: isEditMode,
                          }}
                          control={control}
                          inputProps={{
                            maxLength: 256,
                          }}
                        />
                      </div>
                      {errors.confirmationPassword && <Error message={errors.confirmationPassword.message} />}
                    </Grid>
                  </Grid>
                </div>
              </>
            )}
          </Card>

          <Card className="border-t-2 border-x-2 border-[#D9D9D9] mt-8 pb-8">
            <div className="w-full mb-8 border-b-2 border-[#D9D9D9]">
              <h1 className="pl-12 my-6 text-xl font-bold">お客様情報入力</h1>
            </div>
            {/*  First Name Last Name */}
            <div className="relative px-16 mt-6">
              <Grid container spacing={4}>
                {/* Last Name */}
                <Grid item xs={6}>
                  <Label htmlFor="lastName" isRequired={true}>
                    姓
                  </Label>
                  <div className="mt-2">
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
                  <Label htmlFor="firstName" isRequired={true}>
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
            <div className="relative px-16 mt-6">
              <Grid container spacing={4} className="">
                {/* First Name */}
                <Grid item xs={6}>
                  <Label htmlFor="lastNameFurigana" isRequired={true}>
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
                  <Label htmlFor="firstNameFurigana" isRequired={true}>
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

            {!isStaffMode && (
              <>
                {/* Birthday */}
                <div className="relative px-16 mt-6">
                  <Grid container>
                    <Grid item xs={12}>
                      <Label htmlFor="birthday" isRequired={true}>
                        生年月日
                      </Label>
                      <div className="max-w-[467px] mt-3">
                        <DatePickerField
                          name="birthday"
                          control={control}
                          disableFuture={true}
                          renderInput={(params) => <TextField {...params} className="flex justify-between w-full ad-input-field" placeholder="1998/2/20" />}
                        />
                      </div>
                      {errors.birthday && <Error message={errors.birthday.message} />}
                    </Grid>
                  </Grid>
                </div>

                <div className="relative px-16 mt-6">
                  <Grid container>
                    <Grid item xs={12}>
                      <Label htmlFor="gender" isRequired={true}>
                        性別
                      </Label>
                      <RadioButtonsField id="gender" name="gender" control={control} options={GENDER_OPTIONS} className="!block mt-2 min-width-0" />
                      {errors.gender && <Error message={errors.gender.message} />}
                    </Grid>
                  </Grid>
                </div>

                {/* PhoneNumber */}
                <div className="relative px-16 mt-6">
                  <Grid container>
                    <Grid item xs={12}>
                      <Label htmlFor="phone" isRequired={true}>
                        電話番号
                      </Label>
                      <p className="px-2 pt-3 text-xs font-medium">ハイフンなしで入力する</p>

                      <div className="mt-2">
                        <TextInputField
                          id="phone"
                          name="phone"
                          type="text"
                          inputProps={{ maxLength: 11 }}
                          control={control}
                          className={STYLES.INPUT_FIELD}
                          placeholder="0000 000 000"
                        />
                      </div>
                      {errors.phone && <Error message={errors.phone.message} />}
                    </Grid>
                  </Grid>
                </div>

                {/* PostCode and Province */}
                <div className="relative px-16 mt-6">
                  {/* PostCode */}
                  <Grid container spacing={4}>
                    <Grid item xs={6}>
                      <Label htmlFor="postCode" isRequired={true}>
                        郵便番号
                      </Label>
                      <div className="mt-2">
                        <TextInputField
                          id="postCode"
                          name="postCode"
                          control={control}
                          inputProps={{ maxLength: 7 }}
                          className={`${STYLES.INPUT_FIELD}`}
                          placeholder="00000"
                        />
                      </div>
                      {errors.postCode && <Error message={errors.postCode.message} />}
                    </Grid>

                    {/* Province */}
                    <Grid item xs={6}>
                      <Label htmlFor="province" isRequired={true}>
                        都道府県
                      </Label>
                      <div className="mt-2">
                        <AutocompleteField
                          id="province"
                          name="province"
                          control={control}
                          className="ad-dropdown-field"
                          options={Object.values(PROVINCE_OPTIONS).map((item) => item.value)}
                          getOptionLabel={(option) => Object.values(PROVINCE_OPTIONS).find((item) => item.value === option)?.label || ""}
                          renderInput={(params) => <TextField placeholder="選択してください" {...params} />}
                        />
                      </div>
                      {errors.province && <Error message={errors.province.message} />}
                    </Grid>
                  </Grid>
                </div>

                {/*  Address */}
                <div className="relative px-16 mt-6 mb-8">
                  <Grid container spacing={4}>
                    <Grid item xs={12}>
                      <Label htmlFor="address" isRequired={true}>
                        住所
                      </Label>
                      <div className="mt-2">
                        <TextInputField
                          id="address"
                          name="address"
                          control={control}
                          className={`${STYLES.INPUT_FIELD}`}
                          placeholder="○○市○○区○○町"
                          inputProps={{
                            maxLength: 256,
                          }}
                        />
                      </div>
                      {errors.address && <Error message={errors.address.message} />}
                    </Grid>
                  </Grid>
                </div>

                {/*  News letter */}
                <div className="relative px-16 mt-6">
                  <Grid container spacing={4}>
                    <Grid item xs={12}>
                      <Label htmlFor="allowedNewsletter" isRequired={true}>
                        ボーネルンドからの情報
                      </Label>
                      <RadioButtonsField
                        id="allowedNewsletter"
                        name="allowedNewsletter"
                        control={control}
                        options={NEWS_LETTER_OPTIONS}
                        className="!block mt-4 min-width-0"
                      />
                      {errors.allowedNewsletter && <Error message={errors.allowedNewsletter.message} />}
                    </Grid>
                  </Grid>
                </div>
              </>
            )}
          </Card>

          <div className="flex justify-center gap-x-20 mt-14">
            <AdminButton type="button" onClick={onCancel} variant="outlined" className="w-[230px] h-[56px] mdonly:w-[170px] !font-bold">
              キャンセル
            </AdminButton>
            <AdminButton type="submit" variant="contained" className="w-[230px] h-[56px] mdonly:w-[170px] !font-bold">
              {!isEditMode ? "次へ" : "保存する"}
            </AdminButton>
          </div>
          <div className="flex justify-center mt-8">
            <Error message={errMsg} />
          </div>
        </form>
      )}
    </>
  );
}

const STYLES = {
  INPUT_FIELD: "w-full px-3 py-1 ad-input-field",
  RADIO: "inline-block",
};
