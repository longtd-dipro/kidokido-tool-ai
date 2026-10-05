import { Button as MUIButton, ButtonProps } from "@mui/material";

export default function Button(props: ButtonProps) {
  return (
    <div>
      <MUIButton {...props}></MUIButton>
    </div>
  );
}
