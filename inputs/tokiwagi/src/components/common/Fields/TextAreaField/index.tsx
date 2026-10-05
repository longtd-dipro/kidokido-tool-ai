import { Control , Controller } from "react-hook-form";
import { TextareaAutosize, TextareaAutosizeProps } from "@mui/material";

type Props = TextareaAutosizeProps & {
  name: string;
  className?: string;
  control: Control<any>;
  defaultValue?: unknown;
};

export default function TextAreaField(props: Props) {
  const { name, control, defaultValue, ...textFieldProps } = props;
  const defaultValueInput = defaultValue !== undefined ? defaultValue : "";

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValueInput}
      render={({ field }) => {
        return <TextareaAutosize {...textFieldProps} {...field} />;
      }}
    />
  );
}
