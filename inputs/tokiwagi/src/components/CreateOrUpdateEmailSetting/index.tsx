import { yupResolver } from "@hookform/resolvers/yup";
import { EmailSetting } from "@prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";

import Error from "components/common/Error";
import Label from "components/common/Admin/LabelFontLight";
import RichTextEditorField from "components/common/Fields/RichTextEditorField";
import TextInputField from "components/common/Fields/TextInputField";
import Button from "components/common/Buttons/AdminButton";
import { emailSettingScheme } from "libs/validation/schemas";
import { createEmailSetting, updateEmailSetting } from "services/api-client/admin/email-setting.service";
import EmailPreviewDialog from "components/CreateOrUpdateEmailSetting/EmailPreviewDialog";

interface Props {
  emailSetting?: EmailSetting;
  onCancel: () => void;
  onSuccess: () => void;
}

type FormData = {
  emailKey: string;
  name: string;
  title: string;
  content: string;
};

export default function CreateOrUpdateEmailSetting({ emailSetting, onCancel, onSuccess }: Props) {
  const isEditMode = !!emailSetting;
  const [errMsg, setErrMsg] = useState<string>();
  const [isShowPreviewDialog, setIsShowPreviewDialog] = useState<boolean>(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    resolver: yupResolver(emailSettingScheme),
    defaultValues: emailSetting,
  });

  const onSubmit = async (data) => {
    try {
      setErrMsg("");
      if (isEditMode) {
        await updateEmailSetting(data);
      } else {
        await createEmailSetting(data);
      }

      onSuccess();
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      setErrMsg(message);
    }
  };

  const showPreviewDialog = () => {
    setIsShowPreviewDialog(true);
  };

  const hidePreviewDialog = () => {
    setIsShowPreviewDialog(false);
  };

  const handleClickPreview = () => {
    showPreviewDialog();
  };

  return (
    <div className="px-[38px] py-[26px] xs:px-[26px] xs:pt-[23px] xs:pb-9">
      <Error message={errMsg} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-[44px] justify-center">
          <div className="flex flex-col w-4/5 gap-[44px]">
            {/*Email Key*/}
            <div className="relative">
              <label htmlFor="emailKey" className="flex text-base leading-[20px] ad-text-color font-medium mb-2">
                メールID
              </label>
              <TextInputField
                name="emailKey"
                control={control}
                inputProps={{
                  readOnly: isEditMode,
                  maxLength: 256,
                }}
                className="w-full ad-input-field ad-input-disable"
              />
              {errors.emailKey && <Error message={errors.emailKey.message} />}
            </div>

            {/*Name*/}
            <div className="relative">
              <label htmlFor="name" className="flex text-base leading-[20px] ad-text-color font-medium mb-2">
                メール名
              </label>
              <TextInputField
                name="name"
                control={control}
                inputProps={{
                  readOnly: isEditMode,
                  maxLength: 256,
                }}
                className="w-full ad-input-field ad-input-disable"
              />
              {errors.name && <Error message={errors.name.message} />}
            </div>

            {/*Title*/}
            <div className="relative">
              <Label htmlFor="title" isRequired={true} className="flex gap-[5px] mb-[8px] font-medium text-base leading-[20px]">
                メールのタイトル
              </Label>
              <TextInputField
                name="title"
                control={control}
                inputProps={{
                  maxLength: 256,
                }}
                className="w-full ad-input-field"
              />
              {errors.title && <Error message={errors.title.message} />}
            </div>
          </div>

          {/*Content Email*/}
          <div className="relative">
            <Label htmlFor="content" isRequired={true} className="flex gap-[5px] mb-[16px] font-medium text-base leading-[20px]">
              メールのコンテンツ
            </Label>
            <RichTextEditorField
              name="content"
              control={control}
              htmlEditButton={{
                prependSelector: "#create-update-email-setting .MuiDialog-container",
              }}
            />
            {errors.content && <Error message={errors.content.message} />}
          </div>

          {/* Buttons */}
          <div className="flex justify-center mb-[7px]">
            <div className="flex flex-row items-center justify-between h-[60px] gap-8">
              <Button variant="outlined" onClick={onCancel} className="w-[250px] h-[60px] mdonly:w-[170px] mdonly:h-[60px]">
                <h2 className="text-base leading-[20px] font-medium ad-text-color">キャンセル</h2>
              </Button>
              <Button variant="contained" onClick={handleClickPreview} className="w-[250px] h-[60px] mdonly:w-[170px] mdonly:h-[60px]">
                <h2 className="text-base leading-[20px] font-medium">レビュー</h2>
              </Button>
              <Button variant="contained" type="submit" className="w-[250px] h-[60px] mdonly:w-[170px] mdonly:h-[60px]">
                <h2 className="text-base leading-[20px] font-medium">保存する</h2>
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Preview Dialog */}
      {isShowPreviewDialog && (
        <EmailPreviewDialog emailKey={getValues("emailKey")} title={getValues("title")} htmlEmailContent={getValues("content")} onClose={hidePreviewDialog} />
      )}
    </div>
  );
}
