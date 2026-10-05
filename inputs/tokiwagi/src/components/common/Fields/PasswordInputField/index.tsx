import { Control , Controller } from "react-hook-form";
import { IconButton, InputAdornment, TextField, TextFieldProps } from "@mui/material";
import React, { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";

type Props = TextFieldProps & {
  name: string;
  control: Control<any>;
  defaultValue?: unknown;
};

export default function PasswordInputField(props: Props) {
  const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
  const { name, control, defaultValue, ...inputProps } = props;
  const defaultValueInput = defaultValue !== undefined ? defaultValue : "";

  const handleClickShowPassword = () => {
    setIsShowPassword(!isShowPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValueInput}
      render={({ field }) => {
        return (
          <TextField
            type={isShowPassword ? "text" : "password"}
            {...inputProps}
            {...field}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    className="!mr-[-12px] !pr-2"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {isShowPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        );
      }}
    />
  );
}
