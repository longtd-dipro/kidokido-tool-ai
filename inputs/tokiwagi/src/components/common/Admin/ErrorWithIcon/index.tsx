import Image from "next/legacy/image";

import DangerIcon from "statics/images/danger.svg";

interface ErrorProps {
  message: string;
}

export default function ErrorWithIcon(props: ErrorProps) {
  if (props.message) {
    return (
      <div className="flex justify-center items-center">
        <Image src={DangerIcon} alt={props.message} height={24} width={24} />
        <p className="text-center leading-[20px] text-[12px] font-normal ad-text-error ml-[10px]">{props.message}</p>
      </div>
    );
  } else {
    return null;
  }
}
