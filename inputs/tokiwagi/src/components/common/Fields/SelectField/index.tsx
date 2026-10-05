import { MenuItem, Select, SelectProps } from "@mui/material";
import { Controller , Control } from "react-hook-form";

interface Props extends SelectProps<any> {
  name: string;
  control: Control<any>;
  options: {
    value: any;
    label: string;
  }[];
  defaultValue?: unknown;
}

export default function SelectField(props: Props) {
  const { name, control, options, defaultValue, ...selectProps } = props;
  const defaultValueInput = defaultValue !== undefined ? defaultValue : "";

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValueInput}
      render={({ field }) => (
        <Select MenuProps={{ disablePortal: true }} {...selectProps} {...field}>
          {options.map(({ value, label }) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </Select>
      )}
    />
  );
}
