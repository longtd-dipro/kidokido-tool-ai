import { yupResolver } from "@hookform/resolvers/yup";
import { GMOSetting } from "@prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";

import Label from "components/common/Admin/LabelFontLight";
import Button from "components/common/Buttons/AdminButton";
import Error from "components/common/Error";
import ErrorDialog from "components/common/ErrorDialog";
import TextInputField from "components/common/Fields/TextInputField";
import { ERROR_MESSAGES } from "constants/errors";
import { gmoSettingSchema } from "libs/validation/gmoSettingSchema";
import { createGMOSetting, updateGMOSetting } from "services/api-client/admin/gmo-setting.service";

interface Props {
  gmoSetting?: GMOSetting;
  onCancel: () => void;
  onSuccess: () => void;
}

export type GMOSettingFormData = {
  name: string;
  shopId: string;
  shopPass: string;
};

export default function CreateOrUpdateGMOSetting({ gmoSetting, onCancel, onSuccess }: Props) {
  const isEditMode = !!gmoSetting;
  const [errMsg, setErrMsg] = useState<string>();
  const [isShowErrorDialog, setIsShowErrorDialog] = useState<boolean>(false);
  const [dialogErrMsg, setDialogErrMsg] = useState<string>();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<GMOSettingFormData>({
    resolver: yupResolver(gmoSettingSchema),
    defaultValues: gmoSetting,
  });

  const showErrorDialog = () => setIsShowErrorDialog(true);
  const hideErrorDialog = () => setIsShowErrorDialog(false);

  const onSubmit = async (data: GMOSettingFormData) => {
    try {
      setErrMsg("");
      if (isEditMode) {
        await updateGMOSetting(gmoSetting.id, data);
      } else {
        await createGMOSetting(data);
      }
      onSuccess();
    } catch (error) {
      const message = error.response?.data?.error || error.message;

      if ([ERROR_MESSAGES.CANNOT_EDIT_GMO_SETTING, ERROR_MESSAGES.SHOP_ID_ALREADY_EXIST].includes(message)) {
        setDialogErrMsg(message);
        showErrorDialog();
        return;
      }

      setErrMsg(message);
    }
  };

  return (
    <div className="px-[38px] py-[26px] xs:px-[26px] xs:pt-[23px] xs:pb-9">
      <Error message={errMsg} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-[44px] justify-center">
          <div className="flex flex-col w-4/5 md:w-full gap-[44px]">
            {/* Name */}
            <div className="relative">
              <Label isRequired={true} className="flex gap-[5px] mb-[8px] font-medium text-base leading-[20px]">
                アカウント名
              </Label>
              <TextInputField
                name="name"
                control={control}
                inputProps={{
                  maxLength: 256,
                }}
                className="w-full ad-input-field"
              />
              {errors.name && <Error message={errors.name.message} className="mt-2" />}
            </div>
          </div>

          <div className="flex flex-col w-4/5 md:w-full gap-[44px]">
            {/* Shop Id */}
            <div className="relative">
              <Label isRequired={true} className="flex gap-[5px] mb-[8px] font-medium text-base leading-[20px]">
                ショップID
              </Label>
              <TextInputField
                name="shopId"
                control={control}
                inputProps={{
                  maxLength: 256,
                }}
                className="w-full ad-input-field"
              />
              {errors.shopId && <Error message={errors.shopId.message} className="mt-2" />}
            </div>
          </div>

          <div className="flex flex-col w-4/5 md:w-full gap-[44px]">
            {/* Shop Pass */}
            <div className="relative">
              <Label isRequired={true} className="flex gap-[5px] mb-[8px] font-medium text-base leading-[20px]">
                ショップパスワード
              </Label>
              <TextInputField
                name="shopPass"
                control={control}
                inputProps={{
                  maxLength: 256,
                }}
                className="w-full ad-input-field"
              />
              {errors.shopPass && <Error message={errors.shopPass.message} className="mt-2" />}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center mb-[7px]">
            <div className="flex flex-row items-center justify-between w-[600px] h-[60px]">
              <Button variant="outlined" onClick={onCancel} className="w-[250px] h-[60px] mdonly:w-[170px] mdonly:h-[60px]">
                <h2 className="text-base leading-[20px] font-medium ad-text-color">キャンセル</h2>
              </Button>
              <Button variant="contained" type="submit" className="w-[250px] h-[60px] mdonly:w-[170px] mdonly:h-[60px]">
                <h2 className="text-base leading-[20px] font-medium">保存する</h2>
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/*Error Dialog*/}
      {isShowErrorDialog && <ErrorDialog message={dialogErrMsg} text="OK" onDismiss={hideErrorDialog} />}
    </div>
  );
}
