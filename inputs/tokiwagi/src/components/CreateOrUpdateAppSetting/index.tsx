import { Button, Dialog, DialogContent, TextField } from "@mui/material";
import { AppSetting, DataType } from "@prisma/client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";

import { appSettingSchema } from "libs/validation/schemas";
import Error from "components/common/Error";
import { createAppSetting, updateAppSetting } from "services/api-client/admin/app-setting.service";
import AutocompleteField from "components/common/Fields/AutocompleteField";
import RichTextEditorField from "components/common/Fields/RichTextEditorField";
import TextInputField from "components/common/Fields/TextInputField";

interface Props {
  appSetting?: AppSetting;
  onHide: () => void;
  onSuccess: () => void;
}

type FormData = {
  settingKey: string;
  name: string;
  value: string;
  dataType: string;
};

export default function CreateOrUpdateAppSetting({ appSetting, onHide, onSuccess }: Props) {
  const isEditMode = !!appSetting;
  const [errMsg, setErrMsg] = useState<string>();

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(appSettingSchema),
    defaultValues: appSetting,
  });

  const [dataType] = watch(["dataType"]);

  const onSubmit = async (data) => {
    try {
      setErrMsg("");
      if (isEditMode) {
        await updateAppSetting(data);
      } else {
        await createAppSetting(data);
      }

      onSuccess();
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setErrMsg(message);
    }
  };

  return (
    <Dialog
      id="create-update-app-setting"
      fullScreen={true}
      open={true}
      onClose={onHide}
      aria-labelledby="responsive-dialog-title"
    >
      <DialogContent>
        <h2 className="mb-1 text-lg font-medium text-gray-900 title-font">
          {isEditMode ? "Update" : "Create"}
        </h2>
        <Error message={errMsg} />
        <form onSubmit={handleSubmit(onSubmit)}>
          {/*Setting Key*/}
          <div className="relative mb-4">
            <label
              htmlFor="settingKey"
              className="text-sm leading-7 text-gray-600"
            >
              Setting Key
              <TextInputField
                name="settingKey"
                control={control}
                inputProps={{
                  readOnly: isEditMode
                }}
                className="w-full px-3 py-1 text-base leading-8 text-gray-700 transition-colors 
                duration-200 ease-in-out bg-white border border-gray-300 rounded outline-none 
                focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </label>
            {errors.settingKey && (
              <Error message={errors.settingKey.message} />
            )}
          </div>

          {/*Name*/}
          <div className="relative mb-4">
            <label
              htmlFor="name"
              className="text-sm leading-7 text-gray-600"
            >
              Name
              <TextInputField
                name="name"
                control={control}
                className="w-full px-3 py-1 text-base leading-8 text-gray-700 transition-colors 
                duration-200 ease-in-out bg-white border border-gray-300 rounded outline-none 
                focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </label>
            {errors.name && (
              <Error message={errors.name.message} />
            )}
          </div>

          {/*Data Type*/}
          <div className="relative mb-4">
            <label
              htmlFor="dataType"
              className="text-sm leading-7 text-gray-600"
            >
              Data Type
              <AutocompleteField
                name="dataType"
                control={control}
                options={Object.values(DataType)}
                renderInput={(params) => <TextField {...params} />}
              />
            </label>
            {errors.dataType && (
              <Error message={errors.dataType.message} />
            )}
          </div>

          {/*Value*/}
          <div className="relative mb-4">
            <label
              htmlFor="value"
              className="text-sm leading-7 text-gray-600"
            >
              Value
              {dataType === DataType.RichText && <RichTextEditorField
                name="value"
                control={control}
                htmlEditButton={{ prependSelector: "#create-update-app-setting .MuiDialog-container" }}
              />}

              {dataType === DataType.Text && <TextInputField
                name="value"
                control={control}
                className="w-full px-3 py-1 text-base leading-8 text-gray-700 transition-colors duration-200 ease-in-out bg-white border border-gray-300 
                rounded outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />}

              {dataType === DataType.Number && <TextInputField
                name="value"
                type="number"
                defaultValue={0}
                control={control}
                className="w-full px-3 py-1 text-base leading-8 text-gray-700 transition-colors duration-200 ease-in-out
                 bg-white border border-gray-300 rounded outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />}
            </label>
            {errors.value && (
              <Error message={errors.value.message} />
            )}
          </div>

          {/*Buttons*/}
          <div className="flex justify-end">
            <Button onClick={onHide}>
              Cancel
            </Button>
            <Button type="submit" >
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
