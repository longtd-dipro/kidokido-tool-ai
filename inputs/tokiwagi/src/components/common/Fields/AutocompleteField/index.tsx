import { Control , Controller } from "react-hook-form";
import { Autocomplete } from "@mui/material";
import { AutocompleteProps } from "@mui/material/Autocomplete/Autocomplete";

interface Props extends AutocompleteProps<any, any, any, any> {
  name: string;
  control: Control<any>;
  defaultValue?: unknown;
  handleChange?: (data: any) => void;
}

export default function AutocompleteField(props: Props) {
  const { name, control, defaultValue, handleChange, ...autocompleteProps } = props;
  let defaultValueInput = defaultValue;
  if (!defaultValue) {
    defaultValueInput = autocompleteProps.multiple ? undefined: "";
  }

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValueInput}
      render={({ field }) => {
        const { onChange, ...rest } = field;
        return (
          <Autocomplete
            onChange={(e, data) => {
              onChange(data);
              handleChange && handleChange(data);
            }}
            {...autocompleteProps}
            {...rest}
          />
        );
      }}
    />
  );
}
