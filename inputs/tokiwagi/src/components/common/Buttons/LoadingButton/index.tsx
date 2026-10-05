import { ReactNode } from "react";
import LoadingButton, { LoadingButtonProps } from "@mui/lab/LoadingButton";

type Props = {
  onClick?: () => void;
  type?: "submit" | "button";
  children: ReactNode;
  isLoading: boolean;
  variant?: LoadingButtonProps["variant"];
  className?: string;
  disabled?: boolean;
};

export default function UserSiteLoadingButton({ onClick, type = "button", children, isLoading, variant, className, disabled }: Props) {
  return (
    <div>
      <LoadingButton endIcon={null} loadingPosition="end" type={type} onClick={onClick} loading={isLoading} variant={variant} className={className}
        disabled={disabled}>
        {children}
      </LoadingButton>
    </div>
  );
}

UserSiteLoadingButton.defaultProps = {
  variant: "outlined",
};
