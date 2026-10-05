import { yupResolver } from "@hookform/resolvers/yup";
import { TextField } from "@mui/material";
import { News } from "@prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";

import Label from "components/common/Admin/LabelFontLight";
import Button from "components/common/Buttons/AdminButton";
import Error from "components/common/Error";
import DatePickerField from "components/common/Fields/DatePickerField";
import RichTextEditorField from "components/common/Fields/RichTextEditorField";
import TextInputField from "components/common/Fields/TextInputField";
import { newsSchema } from "libs/validation/schemas";
import { createNews, updateNews } from "services/api-client/admin/news.service";

interface Props {
  news?: News;
  onCancel: () => void;
  onSuccess: () => void;
}

type FormData = {
  date: Date;
  title: string;
  content: string;
};

export default function CreateOrUpdateNews({ news, onCancel, onSuccess }: Props) {
  const isEditMode = !!news;
  const [errMsg, setErrMsg] = useState<string>();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(newsSchema),
    defaultValues: news,
  });

  const onSubmit = async (data) => {
    try {
      setErrMsg("");
      if (isEditMode) {
        await updateNews(data);
      } else {
        await createNews(data);
      }

      onSuccess();
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      setErrMsg(message);
    }
  };

  return (
    <div className="px-[38px] py-[26px] xs:px-[26px] xs:pt-[23px] xs:pb-9">
      <Error message={errMsg} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-[44px] justify-center">
          <div className="flex flex-col w-4/5 md:w-full gap-[44px]">
            {/*Date*/}
            <div className="relative">
              <Label isRequired={true} className="flex text-base leading-[20px] ad-text-color font-medium mb-2">
                掲載日時
              </Label>
              <DatePickerField
                name="date"
                control={control}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    className="flex justify-between block !w-full ad-input-field"
                    inputProps={{
                      ...params.inputProps,
                      readOnly: true,
                    }}
                  />
                )}
              />

              {errors.date && <Error message={errors.date.message} className="mt-2" />}
            </div>

            {/*Title*/}
            <div className="relative">
              <Label isRequired={true} className="flex gap-[5px] mb-[8px] font-medium text-base leading-[20px]">
                タイトル
              </Label>
              <TextInputField
                name="title"
                control={control}
                inputProps={{
                  maxLength: 256,
                }}
                className="w-full ad-input-field"
              />
              {errors.title && <Error message={errors.title.message} className="mt-2" />}
            </div>
          </div>

          {/*Content*/}
          <div className="relative">
            <Label isRequired={true} className="flex gap-[5px] mb-[16px] font-medium text-base leading-[20px]">
              掲載内容
            </Label>
            <RichTextEditorField
              name="content"
              control={control}
              htmlEditButton={{
                prependSelector: "#create-update-email-setting .MuiDialog-container",
              }}
            />
            {errors.content && <Error message={errors.content.message} className="mt-2" />}
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
    </div>
  );
}
