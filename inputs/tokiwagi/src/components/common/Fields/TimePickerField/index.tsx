import { Control , Controller } from "react-hook-form";
import { TimePicker, TimePickerProps } from "@mui/x-date-pickers/TimePicker";

interface Props extends Omit<TimePickerProps<any, any>, "onChange" | "value"> {
  name: string;
  control: Control<any>;
  defaultValue?: unknown;
}

export default function TimePickerField(props: Props) {
  const { name, control, defaultValue, ...timePickerProps } = props;
  const defaultValueInput = defaultValue !== undefined ? defaultValue : null;

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValueInput}
      render={({ field }) => {
        const { onChange, ...rest } = field;
        return <TimePicker onChange={(e) => onChange(e)} {...timePickerProps} {...rest} />;
      }}
    />
  );
}
