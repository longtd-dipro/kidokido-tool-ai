import { Button as MUIButton, ButtonProps } from "@mui/material";

export default function AdminButton(props: ButtonProps) {
  return (
    <div>
      <MUIButton {...props}></MUIButton>
    </div>
  );
}
