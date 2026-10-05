import { DateTimePicker, DateTimePickerProps } from "@mui/x-date-pickers";
import { Controller , Control } from "react-hook-form";

interface Props extends Omit<DateTimePickerProps<any, any>, "onChange" | "value"> {
  name: string;
  control: Control<any>;
}

export default function DateTimePickerField(props: Props) {
  const { name, control, ...dateTimePickerProps } = props;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const { onChange, ...rest } = field;
        return <DateTimePicker onChange={(e) => onChange(e)} {...dateTimePickerProps} {...rest} />;
      }}
    />
  );
}
