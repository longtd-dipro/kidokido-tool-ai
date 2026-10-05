/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import Image from "next/legacy/image";

import DisclaimerOption from "components/CreateOrUpdateDisclaimers/DisclaimerOption";
import Label from "components/common/Admin/Label";
import CloseIcon from "statics/images/close.svg";
import Error from "components/common/Error";
import { DEFAULT_DISCLAIMER_OPTION_VALUE } from "constants/disclaimer";
import TextAreaField from "components/common/Fields/TextAreaField";

import styles from "./index.module.scss";

type Props = {
  groupIndex: number;
  onRemove: (groupIndex: number) => void;
};

export const DisclaimerGroup = ({ groupIndex, onRemove }: Props) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const { fields, remove, insert } = useFieldArray({
    control,
    name: `disclaimers.${groupIndex}.options`,
  });

  const isDisableDeleteOptionButton = fields.length === 1;

  const handleDeleteOption = (optionIndex: number) => {
    remove(optionIndex);
  };

  const handleInsertOption = (optionIndex: number) => {
    insert(optionIndex + 1, DEFAULT_DISCLAIMER_OPTION_VALUE);
  };

  return (
    <div className={styles.group}>
      <div>
        <button type="button" onClick={() => onRemove(groupIndex)} className="float-right">
          <Image src={CloseIcon} alt="close" />
        </button>
      </div>
      <div className="mx-12 my-4 md:mx-4">
        {/*Title*/}
        <div className="mb-6">
          <div className="flex items-center gap-16 md:gap-6">
            <Label className="text-base min-w-[200px] text-right md:min-w-[180px]" isRequired={true}>
              <span className="mr-2">本文</span>
            </Label>
            <div className="flex-1">
              <TextAreaField
                name={`disclaimers.${groupIndex}.title`}
                control={control}
                placeholder="本文のフリーテキストを入力してください"
                className="w-3/4 ad-input-field border-0"
              />
              {errors.disclaimers?.[groupIndex]?.title && <Error className="mt-2" message={errors.disclaimers?.[groupIndex]?.title.message} />}
            </div>
          </div>
        </div>

        {/* Options */}
        <div>
          <div className="flex items-start gap-16 md:gap-6">
            <Label className="text-base min-w-[200px] text-right md:min-w-[180px]" isRequired={true}>
              <span className="mr-2">チェックボックス</span>
            </Label>
            <div className="flex flex-col gap-4 flex-1">
              {fields.map((field, index) => (
                <DisclaimerOption
                  optionIndex={index}
                  name={`disclaimers.${groupIndex}.options.${index}.content`}
                  key={field.id}
                  isDisableDeleteOptionButton={isDisableDeleteOptionButton}
                  errorMsg={errors.disclaimers?.[groupIndex]?.options?.[index]?.content?.message}
                  onDeleteOption={handleDeleteOption}
                  onInsertOption={handleInsertOption}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
