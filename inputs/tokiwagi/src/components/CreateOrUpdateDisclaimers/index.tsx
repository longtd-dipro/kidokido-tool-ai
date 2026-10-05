import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/legacy/image";
import { useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";

import Button from "components/common/Buttons/AdminButton";
import Error from "components/common/Error";
import { DisclaimerGroup } from "components/CreateOrUpdateDisclaimers/DisclaimerGroup";
import { disclaimerSchema } from "libs/validation/disclaimerSchema";
import { upsertDisclaimers } from "services/api-client/admin/disclaimer.service";
import AddCircleImage from "statics/images/add-circle.svg";
import UserSiteLoadingButton from "components/common/Buttons/LoadingButton";
import { DEFAULT_DISCLAIMER_GROUP_VALUE } from "constants/disclaimer";

import styles from "./index.module.scss";

type Props = {
  disclaimers: DisclaimerGroupFormData[];
  onSaveSuccess: () => void;
};

type FormData = {
  disclaimers: DisclaimerGroupFormData[];
};

type DisclaimerGroupFormData = {
  title: string;
  options: { content: string }[];
};

export default function CreateOrUpdateDisclaimers({ disclaimers, onSaveSuccess }: Props) {
  const [errMsg, setErrMsg] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const methods = useForm<FormData>({
    resolver: yupResolver(disclaimerSchema),
    defaultValues: { disclaimers },
  });

  const { handleSubmit, control } = methods;

  const { append, remove, fields, replace } = useFieldArray({
    control,
    name: "disclaimers",
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setErrMsg("");

      await upsertDisclaimers(data);
      onSaveSuccess();
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      setErrMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    replace(disclaimers);
  };

  const handleAddDisclaimerGroup = () => {
    append(DEFAULT_DISCLAIMER_GROUP_VALUE);
  };

  const handleRemoveDisclaimerGroup = (groupIndex: number) => {
    remove(groupIndex);
  };

  return (
    <div className="px-[88px] py-[26px] md:px-[48px] xs:px-[26px] xs:pt-[23px] xs:pb-9">
      <Error message={errMsg} />
      <h1 className="text-center text-xl font-bold mb-16 md:mb-8">免責事項設定</h1>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-[44px] justify-center">
            {/* Disclaimer Groups */}
            {fields.map((group, index) => (
              <DisclaimerGroup groupIndex={index} key={group.id} onRemove={handleRemoveDisclaimerGroup} />
            ))}

            {/* Add Button */}
            <Button type="button" className={`${styles.add_button} mt-4`} onClick={handleAddDisclaimerGroup}>
              <div className="flex items-center justify-center gap-4 text-xl font-medium">
                <Image src={AddCircleImage} alt="add-icon" />
                <span>追加</span>
              </div>
            </Button>

            {/* Submit or Reset Buttons */}
            <div className="flex justify-center mb-[7px] mt-8">
              <div className="flex flex-row items-center justify-between w-[600px] h-[60px] md:justify-center md:gap-8">
                <Button variant="outlined" onClick={handleReset} className="w-[250px] h-[60px] mdonly:w-[170px] mdonly:h-[60px]">
                  <h2 className="text-base leading-[20px] font-medium ad-text-color">キャンセル</h2>
                </Button>
                <UserSiteLoadingButton
                  isLoading={isSubmitting}
                  variant="contained"
                  type="submit"
                  className="w-[250px] h-[60px] mdonly:w-[170px] mdonly:h-[60px]"
                >
                  <h2 className="text-base leading-[20px] font-medium">保存する</h2>
                </UserSiteLoadingButton>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
