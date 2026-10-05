import { Control , Controller } from "react-hook-form";
import { TextField, TextFieldProps } from "@mui/material";
import { KeyboardEvent, WheelEvent } from "react";

type Props = TextFieldProps & {
  name: string;
  className?: string;
  control: Control<any>;
  defaultValue?: unknown;
};

export default function TextInputField(props: Props) {
  const { name, control, defaultValue, ...textFieldProps } = props;
  const defaultValueInput = defaultValue !== undefined ? defaultValue : "";

  const preventNumberValueOnWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (props.type === "number") {
      event.target instanceof HTMLElement && event.target.blur();
    }
  };

  const preventNumberValueOnKeyDown = (
    event: KeyboardEvent<HTMLDivElement>
  ) => {
    if (
      props.type === "number" &&
      ["ArrowUp", "ArrowDown"].includes(event.code)
    ) {
      event.preventDefault();
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValueInput}
      render={({ field }) => {
        return (
          <TextField
            {...textFieldProps}
            {...field}
            onWheel={preventNumberValueOnWheel}
            onKeyDown={preventNumberValueOnKeyDown}
          />
        );
      }}
    />
  );
}
