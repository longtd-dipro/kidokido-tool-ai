import { yupResolver } from "@hookform/resolvers/yup";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { GMOSetting } from "@prisma/client";
import Image from "next/legacy/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { usePostalJp } from "use-postal-jp";

import Label from "components/common/Admin/Label";
import AdminButton from "components/common/Buttons/AdminButton";
import Error from "components/common/Error";
import ErrorDialog from "components/common/ErrorDialog";
import AutocompleteField from "components/common/Fields/AutocompleteField";
import PasswordInputField from "components/common/Fields/PasswordInputField";
import RadioButtonsField from "components/common/Fields/RadioButtonsField";
import TextAreaField from "components/common/Fields/TextAreaField";
import TextInputField from "components/common/Fields/TextInputField";
import TimePickerField from "components/common/Fields/TimePickerField";
import { TENANT_ACTIVE_OPTIONS } from "constants/common";
import { ERROR_MESSAGES } from "constants/errors";
import { tenantSchema } from "libs/validation/schemas";
import { Tenant } from "models/Entity";
import { fetchGMOSettings } from "services/api-client/admin/gmo-setting.service";
import { createTenant, updateTenant, updateTenantImageUrl } from "services/api-client/admin/tenant.service";
import { upload } from "services/api-client/upload.service";
import PictureUpload from "statics/images/upload-image.svg";
import XIcon from "statics/images/x.svg";
import { NotificationType, showNotification } from "stores/reducers/notification";

interface Props {
  tenant?: Tenant;
  onCancel: () => void;
  onSuccess: () => void;
}

type FormData = {
  email: string;
  confirmationPassword: string;
  password: string;
  code: string;
  name: string;
  fullName: string;
  imageUrl: string;
  siteUrl: string;
  address: string;
  postCode: string;
  phone: string;
  guide?: string;
  openedAt?: Date;
  closedAt?: Date;
  servedUtil?: Date;
  active?: boolean;
  note?: string;
  gmoSetting?: GMOSetting;
  smaregiStoreId?: string;
  smaregiContractId?: string;
  smaregiTerminalId?: string;
};

export default function CreateOrUpdateTenant({ tenant, onCancel, onSuccess }: Props) {
  const isEditMode = !!tenant;
  const dispatch = useDispatch();
  const [errMsg, setErrMsg] = useState<string>();
  const [shouldUploadImage, setShouldUploadImage] = useState<boolean>(false);
  const [gmoSettings, setGMOSettings] = useState<GMOSetting[]>([]);
  const [isShowErrorDialog, setIsShowErrorDialog] = useState<boolean>(false);

  const {
    handleSubmit,
    watch,
    reset,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(tenantSchema),
    defaultValues: {
      ...tenant,
      email: tenant?.AdminTenant?.User?.email,
      password: tenant?.AdminTenant?.User?.password,
      confirmationPassword: tenant?.AdminTenant?.User?.password,
      gmoSetting: tenant?.GMOSetting,
    },
  });

  const postCode = watch("postCode");
  const ready = postCode ? String(postCode).length >= 7 : false;
  const [address] = usePostalJp(String(postCode), ready);
  const imageUrl = watch("imageUrl") as any;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (address) {
      const { address1: address1, address2: address2, address3: address3, address4: address4 } = address;
      if (!tenant) {
        setValue("address", address1 + address2 + address3 + address4);
      } else {
        if (postCode != tenant.postCode) {
          setValue("address", address1 + address2 + address3 + address4);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const fetchData = async () => {
    try {
      setErrMsg("");
      const gmoSettings = await fetchGMOSettings();
      setGMOSettings(gmoSettings);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  const onFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setValue("imageUrl", file, { shouldValidate: true });
      setShouldUploadImage(true);
    }
  };

  const uploadImageFile = async (tenantCode: string, ImageFile: any) => {
    const fileName = `${tenantCode}.${ImageFile.name.split(".").pop()}`;
    try {
      if (ImageFile) {
        const res = await upload(ImageFile, fileName);
        await updateTenantImageUrl(tenantCode, res.fileName);
      }
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      dispatch(showNotification({ type: NotificationType.ERROR, message }));
    }
  };

  const prepareDataToSubmit = (data: FormData) => {
    const { gmoSetting, ...dataToSubmit } = data;
    dataToSubmit["GMOSetting"] && delete dataToSubmit["GMOSetting"];
    return {
      ...dataToSubmit,
      gmoId: gmoSetting?.id || undefined,
      User: {
        email: data.email,
        password: data.password,
      },
    };
  };

  const showErrorDialog = () => setIsShowErrorDialog(true);
  const hideErrorDialog = () => setIsShowErrorDialog(false);

  const onSubmit = async (data) => {
    const dataToSubmit = prepareDataToSubmit(data);

    try {
      let tenantCode;
      setErrMsg("");
      if (isEditMode) {
        await updateTenant(dataToSubmit as any);
        tenantCode = tenant.code;
      } else {
        const res = await createTenant(dataToSubmit as any);
        tenantCode = res.code;
      }

      if (shouldUploadImage && imageUrl) {
        await uploadImageFile(tenantCode, imageUrl);
      }
      onSuccess();
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      if (message === ERROR_MESSAGES.CANNOT_EDIT_GMO_SETTING) {
        showErrorDialog();
        return;
      }
      setErrMsg(message);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="shadow-[0px_2px_10px rgba(76,_78,_100,_0.22)]">
          <div className="w-full border border-[#D9D9D9]">
            <h1 className="pl-12 md:pl-6 my-6 text-3xl font-bold md:text-base md:leading-5">施設用アカウント情報</h1>
          </div>
          <div className="flex flex-col w-full px-[63px] md:px-12 pt-[24px] pb-[39px] gap-[24px] border border-[#D9D9D9]">
            {/* Email */}
            <div className="relative">
              <Label htmlFor="email" isRequired={true} className="text-[14px] leading-[16px] gap-[16px] text-color ">
                メールアドレス
              </Label>
              <TextInputField
                id="email"
                name="email"
                control={control}
                inputProps={{
                  className: "ad-input-field !py-[12.5px] !px-[16px]",
                  maxLength: 256,
                }}
                className={`${STYLES.INPUT_FIELD}`}
                placeholder="abc@gmail.com"
              />
              {errors.email && <Error message={errors.email.message} />}
            </div>
            {/* Password */}
            <div className="relative">
              <Label htmlFor="password" isRequired={true} className="text-[14px] leading-[16px] gap-[16px] text-color">
                パスワード
              </Label>

              <div className="flex flex-col gap-[4px] mt-[10px]">
                <p className="text-xs leading-[14px] font-medium">※大文字、小文字、数字をそれぞれ1⽂字以上使⽤してください。（半⾓記号英数字8⽂字以上）</p>
                <PasswordInputField
                  id="password"
                  name="password"
                  inputProps={{
                    className: "ad-input-field !py-[12.5px] !px-[16px]",
                    maxLength: 256,
                  }}
                  className={`${STYLES.INPUT_FIELD}`}
                  placeholder="*********"
                  control={control}
                />
              </div>
              {errors.password && <Error message={errors.password.message} />}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Label htmlFor="confirmationPassword" isRequired={true} className="text-[14px] leading-[16px] gap-[16px] text-color">
                パスワード確認
              </Label>
              <PasswordInputField
                placeholder="*********"
                id="confirmationPassword"
                name="confirmationPassword"
                inputProps={{
                  className: "ad-input-field !py-[12.5px] !px-[16px]",
                  maxLength: 256,
                }}
                control={control}
                className={`${STYLES.INPUT_FIELD}`}
              />
              {errors.confirmationPassword && <Error message={errors.confirmationPassword.message} />}
            </div>
          </div>
        </div>

        <div className="mt-8 md:mt-6">
          {/*TENANT*/}
          <div className="border border-[#D9D9D9]">
            <h1 className="pl-12 md:pl-6 my-6 text-3xl font-bold md:text-base md:leading-5">施設情報</h1>
          </div>
          <div className="flex flex-col w-full md:px-12 px-[63px] pt-[29px] pb-[37px] gap-[24px] border border-[#D9D9D9]">
            {/*Name*/}
            <div className="flex flex-col gap-[10px]">
              <Label
                htmlFor="name"
                isRequired={true}
                className="flex mb-[10px] font-medium text-[14px] xs:text-base items-center !leading-[16px] gap-[16px] text-color"
              >
                施設名
              </Label>
              <div className="">
                <TextInputField
                  id="name"
                  name="name"
                  control={control}
                  inputProps={{
                    className: "ad-input-field !py-[12.5px] !px-[16px]",
                    maxLength: 256,
                  }}
                  className={`${STYLES.INPUT_FIELD}`}
                  placeholder="施設名"
                />
                {errors.name && <Error message={errors.name.message} />}
              </div>
            </div>

            {/* Active Tenant */}
            <div className="flex flex-row items-center gap-[45px]">
              <Label
                htmlFor="active"
                isRequired={true}
                className="flex font-medium text-[14px] xs:text-base items-center !leading-[16px] gap-[16px] mr- text-color"
              >
                施設表示
              </Label>
              <RadioButtonsField
                id="active"
                name="active"
                control={control}
                options={TENANT_ACTIVE_OPTIONS}
                className=" min-width-0 items-center !flex-row !gap-5"
              />
            </div>

            <div className="flex flex-row w-full gap-[20px]">
              <Grid container spacing={2}>
                {/*ImageUrl Tenant*/}
                <Grid item xs={6}>
                  <Label
                    htmlFor="imageUrl"
                    isRequired={true}
                    className="flex mb-[10px] font-medium text-[14px] xs:text-base items-center !leading-[16px] gap-[16px] text-color"
                  >
                    施設画像
                  </Label>
                  <label htmlFor={imageUrl ? "" : "filePicker"} className="border border-[#D9D9D9] ad-input-field flex items-center py-[11px] px-[16px] gap-4">
                    <label htmlFor="filePicker" className="flex-1 max-h-[30px] min-h-[20px] truncate" id="imageUrl">
                      {imageUrl?.name || imageUrl}
                    </label>
                    <Image
                      src={imageUrl ? XIcon : PictureUpload}
                      alt="icon"
                      onClick={() => {
                        imageUrl && reset({ ...getValues(), imageUrl: null });
                      }}
                      className={`${imageUrl} cursor-pointer items-end`}
                    />
                  </label>
                  <input accept="image/*" type="file" onChange={onFileChange} style={{ display: "none" }} id="filePicker" />
                  {errors.imageUrl && <Error message={errors.imageUrl.message} />}
                </Grid>

                {/*Link URL*/}
                <Grid item xs={6}>
                  <Label
                    htmlFor="siteUrl"
                    isRequired={true}
                    className="flex mb-[10px] font-medium text-[14px] xs:text-base items-center !leading-[16px] gap-[16px] text-color"
                  >
                    公式サイトのURL
                  </Label>
                  <TextInputField
                    name="siteUrl"
                    placeholder="https://kidokid.bornelund.co.jp/......"
                    control={control}
                    inputProps={{
                      className: "ad-input-field !py-[12.5px] !px-[16px]",
                      maxLength: 256,
                    }}
                    className={`${STYLES.INPUT_FIELD}`}
                  />
                  {errors.siteUrl && <Error message={errors.siteUrl.message} />}
                </Grid>
              </Grid>
            </div>
            <div className="flex flex-row w-full gap-[20px]">
              {/*Code*/}
              <div className="basis-1/2">
                <Label
                  htmlFor="code"
                  isRequired={true}
                  className="flex mb-[10px] font-medium text-[14px] xs:text-base items-center !leading-[16px] gap-[16px] text-color"
                >
                  施設コード
                </Label>
                <TextInputField
                  id="code"
                  name="code"
                  placeholder="DN"
                  control={control}
                  inputProps={{
                    className: "ad-input-field !py-[12.5px] !px-[16px]",
                    maxLength: 5,
                  }}
                  disabled={isEditMode}
                  className={`${STYLES.INPUT_FIELD}`}
                />
                {errors.code && <Error message={errors.code.message} />}
              </div>

              {/*Phone*/}
              <div className="basis-1/2">
                <Label
                  htmlFor="phone"
                  isRequired={true}
                  className="flex mb-[10px] font-medium text-[14px] xs:text-base items-center !leading-[16px] gap-[16px] text-color"
                >
                  電話番号
                </Label>
                <TextInputField
                  name="phone"
                  placeholder="1234-567-890"
                  control={control}
                  inputProps={{
                    className: "ad-input-field !py-[12.5px] !px-[16px]",
                    maxLength: 13,
                  }}
                  className={`${STYLES.INPUT_FIELD}`}
                />
                {errors.phone && <Error message={errors.phone.message} />}
              </div>
            </div>
            <div className="flex flex-nowrap flex-row w-full gap-[20px]">
              {/*PostCode*/}
              <div className="basis-1/2">
                <Label
                  htmlFor="postCode"
                  isRequired={true}
                  className="flex mb-[10px] font-medium text-[14px] xs:text-base items-center !leading-[16px] gap-[16px] text-color"
                >
                  郵便番号
                </Label>
                <TextInputField
                  name="postCode"
                  control={control}
                  placeholder="0000000"
                  inputProps={{
                    className: "ad-input-field !py-[12.5px] !px-[16px]",
                    maxLength: 256,
                  }}
                  className={`${STYLES.INPUT_FIELD}`}
                />
                {errors.postCode && <Error message={errors.postCode.message} />}
              </div>
            </div>
            {/*Address*/}
            <div className="flex flex-col gap-[10px]">
              <Label
                htmlFor="address"
                isRequired={true}
                className="flex mb-[10px] font-medium text-[14px] xs:text-base items-center !leading-[16px] gap-[16px] text-color"
              >
                住所
              </Label>
              <div>
                <TextInputField
                  name="address"
                  control={control}
                  placeholder="○○市○○区○○町."
                  inputProps={{
                    className: "ad-input-field !py-[12.5px] !px-[16px]",
                    maxLength: 256,
                  }}
                  className={`${STYLES.INPUT_FIELD}`}
                />
                {errors.address && <Error message={errors.address.message} />}
              </div>
            </div>
            {/*Guide*/}
            <div className="flex flex-col gap-[10px]">
              <Label
                htmlFor="guide"
                isRequired={false}
                className="flex mb-[10px] font-medium text-[14px] xs:text-base items-center !leading-[16px] gap-[16px] text-color"
              >
                アクセス
              </Label>
              <div>
                <TextAreaField name="guide" control={control} placeholder="〇〇〇駅から徒歩5分" className={`${STYLES.INPUT_AREA_FIELD}`} />
              </div>
            </div>

            {/*Time Active*/}
            <div className="flex flex-nowrap flex-row w-full gap-[47px]">
              {/*Open Time*/}
              <div className="basis-1/2">
                <Label
                  htmlFor="openedAt"
                  isRequired={false}
                  className="flex mb-[10px] font-medium text-[14px] xs:text-base items-center !leading-[16px] gap-[16px] text-color"
                >
                  営業時間設定
                </Label>
                <div className="flex flex-row gap-[10px]">
                  <div className="flex gap-[10px] min-w-[60px] items-center">
                    <label htmlFor="" className="text-[14px] leading-[16px]">
                      開店時間:
                    </label>
                  </div>
                  <div className="flex gap-[10px] items-center">
                    <TimePickerField
                      name="openedAt"
                      control={control}
                      defaultValue={null}
                      renderInput={(params) => (
                        <TextField
                          placeholder="7:00"
                          className="ad-input-field"
                          {...params}
                          inputProps={{
                            ...params.inputProps,
                            placeholder: "7:30",
                            className: "ad-input-field",
                          }}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="ml-[70px]">{errors.openedAt && <Error message={errors.openedAt.message} />}</div>
              </div>

              {/*Close time*/}
              <div className="flex flex-col basis-1/2 self-end">
                <div className="flex flex-row gap-[10px]">
                  <div className="flex gap-[10px] min-w-[60px] items-center">
                    <label htmlFor="closedAt" className="text-[14px] leading-[16px]">
                      終了時間:
                    </label>
                  </div>
                  <div className="flex gap-[10px] items-center">
                    <TimePickerField
                      name="closedAt"
                      control={control}
                      defaultValue={null}
                      className="ad-input-field"
                      renderInput={(params) => (
                        <TextField
                          className="ad-input-field"
                          {...params}
                          inputProps={{
                            ...params.inputProps,
                            placeholder: "18:30",
                            className: "ad-input-field",
                          }}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="ml-[70px]">{errors.closedAt && <Error message={errors.closedAt.message} />}</div>
              </div>
            </div>

            {/*Served Util*/}
            <div className="basis-1/2">
              <Label
                htmlFor="servedUtil"
                isRequired={false}
                className="flex mb-[10px] font-medium text-[14px] xs:text-base items-center !leading-[16px] gap-[16px] text-color"
              >
                最終入場受付時間設定
              </Label>
              <div className="flex flex-row gap-[10px] basis-1/2">
                <div className="flex gap-[10px] min-w-[116px] items-center">
                  <label className="text-[14px] leading-[16px]">最終入場受付時間:</label>
                </div>
                <div className="flex gap-[10px] items-center">
                  <TimePickerField
                    name="servedUtil"
                    control={control}
                    defaultValue={null}
                    renderInput={(params) => (
                      <TextField
                        className="ad-input-field"
                        {...params}
                        inputProps={{
                          ...params.inputProps,
                          placeholder: "18:30",
                          className: "ad-input-field",
                        }}
                      />
                    )}
                  />
                </div>
              </div>
              <div className="ml-[126px]">{errors.servedUtil && <Error message={errors.servedUtil.message} />}</div>
            </div>

            {/*Note*/}
            <div className="flex flex-col gap-[10px]">
              <Label className="flex mb-[10px] font-medium text-[14px] xs:text-base items-center !leading-[16px] gap-[16px] text-color">お知らせ</Label>
              <div>
                <TextAreaField name="note" control={control} className={`${STYLES.INPUT_AREA_FIELD}`} />
              </div>
            </div>

            {/*GMO Id*/}
            <div className="flex flex-col gap-[10px]">
              <Label isRequired={true} className="flex mb-[10px] font-medium text-[14px] xs:text-base items-center !leading-[16px] gap-[16px] text-color">
                連携のGMOアカウント設定
              </Label>
              <div>
                <AutocompleteField
                  disablePortal
                  name="gmoSetting"
                  control={control}
                  options={gmoSettings}
                  getOptionLabel={(option) => option.name || ""}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      className="ad-input-field w-[256px] font-medium"
                      placeholder="施設名"
                      error={!!errors.gmoSetting}
                      inputProps={{ ...params.inputProps, readOnly: true }}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  disableClearable
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-[20px]">
              {/*Smaregi Contract Id*/}
              <div className="flex flex-col gap-[10px]">
                <Label
                  htmlFor="smaregiContractId"
                  className="flex mb-[10px] font-medium text-[14px] xs:text-base items-center !leading-[16px] gap-[16px] text-color"
                >
                  スマレジ契約ID
                </Label>
                <div className="">
                  <TextInputField
                    id="smaregiContractId"
                    name="smaregiContractId"
                    control={control}
                    inputProps={{
                      className: "ad-input-field !py-[12.5px] !px-[16px]",
                      maxLength: 100,
                    }}
                    className={`${STYLES.INPUT_FIELD}`}
                    placeholder="スマレジ契約ID"
                  />
                  {errors.smaregiContractId && <Error message={errors.smaregiContractId.message} />}
                </div>
              </div>
              {/*Smaregi Store Id*/}
              <div className="flex flex-col gap-[10px]">
                <Label
                  htmlFor="smaregiStoreId"
                  className="flex mb-[10px] font-medium text-[14px] xs:text-base items-center !leading-[16px] gap-[16px] text-color"
                >
                  スマレジ店舗ID
                </Label>
                <div className="">
                  <TextInputField
                    id="smaregiStoreId"
                    name="smaregiStoreId"
                    control={control}
                    inputProps={{
                      className: "ad-input-field !py-[12.5px] !px-[16px]",
                      maxLength: 256,
                    }}
                    className={`${STYLES.INPUT_FIELD}`}
                    placeholder="スマレジ店舗ID"
                  />
                  {errors.smaregiStoreId && <Error message={errors.smaregiStoreId.message} />}
                </div>
              </div>
              {/*Smaregi Terminal Id*/}
              <div className="flex flex-col gap-[10px]">
                <Label
                  htmlFor="smaregiTerminalId"
                  className="flex mb-[10px] font-medium text-[14px] xs:text-base items-center !leading-[16px] gap-[16px] text-color"
                >
                  スマレジ端末ID
                </Label>
                <div className="">
                  <TextInputField
                    id="smaregiTerminalId"
                    name="smaregiTerminalId"
                    control={control}
                    inputProps={{
                      className: "ad-input-field !py-[12.5px] !px-[16px]",
                      maxLength: 100,
                    }}
                    className={`${STYLES.INPUT_FIELD}`}
                    placeholder="スマレジ端末ID"
                  />
                  {errors.smaregiTerminalId && <Error message={errors.smaregiTerminalId.message} />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*Buttons*/}
        <div className="flex justify-center gap-x-20 mt-14">
          <AdminButton type="button" onClick={onCancel} variant="outlined" className="w-[200px] h-[48px] !font-bold">
            キャンセル
          </AdminButton>
          <AdminButton type="submit" variant="contained" className="w-[200px] h-[48px] !font-bold">
            {isEditMode ? "保存する" : "登録する"}
          </AdminButton>
        </div>
      </form>
      <div className="flex justify-center mt-4">
        <Error message={errMsg} />
      </div>

      {/*Error Dialog*/}
      {isShowErrorDialog && <ErrorDialog message="予約・オンライン購入が入っているため、こちらの情報が変更できません" text="OK" onDismiss={hideErrorDialog} />}
    </>
  );
}

const STYLES = {
  INPUT_FIELD: "w-full  ad-input-field",
  INPUT_AREA_FIELD: "w-full  ad-input-area-field",
  RADIO: "inline-block",
};
