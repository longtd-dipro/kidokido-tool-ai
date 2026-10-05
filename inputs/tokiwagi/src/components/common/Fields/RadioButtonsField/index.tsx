import { Control , Controller } from "react-hook-form";
import { FormControlLabel, Radio, RadioGroup, RadioGroupProps } from "@mui/material";

type Props = RadioGroupProps & {
  name: string;
  control: Control<any>;
  options: {
    value: string | number | boolean;
    label: string;
    disabled?: boolean;
  }[];
  defaultValue?: string | number | boolean;
};

export default function RadioButtonsField(props: Props) {
  const { name, control, options, defaultValue, ...radioGroupProps } = props;

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field }) => {
        return (
          <RadioGroup {...radioGroupProps} {...field}>
            {options.map(({ value, label, disabled }) => (
              <FormControlLabel 
                key={label} 
                value={value} 
                label={label} 
                control={<Radio size="small" disabled={disabled}/>} 
              />
            ))}
          </RadioGroup>
        );
      }}
    />
  );
}
