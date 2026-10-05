import { Checkbox, FormControlLabel } from "@mui/material";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import styles from "./index.module.scss";

type Props = {
  value: string;
  groupIndex: number;
  checkboxIndex: number;
};

export default function DisclaimerTermsCheckbox({ value, groupIndex, checkboxIndex }: Props) {
  const { control } = useFormContext();

  const content = useWatch({
    name: `disclaimers.${groupIndex}.options.${checkboxIndex}.content`,
    control,
  });

  return (
    <div className={`${styles.disclaimerTermCheckbox} mx-2`}>
      <div className="px-4 py-2 mx-8 mb-4 item-bg xs:mx-0">
        <FormControlLabel
          control={
            <Controller
              name={value}
              control={control}
              render={({ field: props }) => <Checkbox {...props} checked={props.value} onChange={(e) => props.onChange(e.target.checked)} />}
            />
          }
          label={<span className="font-medium">{content}</span>}
        />
      </div>
    </div>
  );
}
