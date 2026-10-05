import * as React from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Checkbox, FormControlLabel } from "@mui/material";

import { getAgeLabel } from "utils/ticket";

import styles from "./index.module.scss";

export interface Props {
  index: number;
  disabled?: boolean;
}

export default function ChildAgeItemCheckbox({ index, disabled = false }: Props) {
  const { control } = useFormContext();

  const age = useWatch({
    name: `childAges.${index}.childAgeInMonth`,
    control,
  });

  return (
    <div className={`flex items-center justify-center relative mb-5 xs:mb-2 ${styles.child_age_check_box}`}>
      <p className="absolute left-[-70px] xs:static xs:mr-4">{index + 1}人目</p>
      <div className="flex items-center relative min-w-[80px]">
        <FormControlLabel
          control={
            <Controller
              name={`childAges.${index}.isChecked`}
              control={control}
              render={({ field: props }) => (
                <Checkbox {...props} checked={props.value} onChange={(e) => props.onChange(e.target.checked)} disabled={disabled} />
              )}
            />
          }
          label={<span className="font-medium">{getAgeLabel(age)}</span>}
          labelPlacement="start"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
