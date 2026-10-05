import { Control , Controller } from "react-hook-form";
import { DesktopDatePicker, DesktopDatePickerProps } from "@mui/x-date-pickers/DesktopDatePicker";
import moment from "moment";

import { CalendarIcon } from "statics/images/components/CalendarIcon";

interface Props extends Omit<DesktopDatePickerProps<any, any>, "onChange" | "value"> {
  name: string;
  className?: string;
  control: Control<any>;
  defaultValue?: unknown;
  mask?: string;
}

export default function DatePickerField(props: Props) {
  const { name, control, defaultValue, mask, ...desktopDatePickerProps } = props;
  const defaultValueInput = defaultValue !== undefined ? defaultValue : null;

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValueInput}
      render={({ field }) => {
        const { onChange, ...rest } = field;
        return (
          <DesktopDatePicker
            mask={mask || "____/__/__"}
            PopperProps={{ disablePortal: true }}
            components={{
              OpenPickerIcon: CalendarIcon,
            }}
            onChange={(e) => {
              const utcDate = e ? moment(e).utc(true) : null;
              onChange(utcDate);
            }}
            {...desktopDatePickerProps}
            {...rest}
          />
        );
      }}
    />
  );
}
