import { ReactNode } from "react";

type Props = {
  htmlFor?: string;
  className?: string;
  isRequired?: Boolean;
  id?: string;
  children: ReactNode;
};

export default function Label({ children, className = "", htmlFor = "", isRequired = false, ...rest }: Props) {
  return (
    <label htmlFor={htmlFor} className={`${className} text-sm font-bold ad-text-color`} {...rest}>
      {children} {isRequired ? <span className="ad-text-error text-base">[必須]</span> : ""}
    </label>
  );
}
