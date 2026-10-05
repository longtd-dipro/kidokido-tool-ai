import Image from "next/legacy/image";

import BluePlus from "statics/images/user/plus-blue.svg";
import GrayPlus from "statics/images/user/plus-gray.svg";
import Button from "components/common/Buttons/Button";

export interface Props {
  isDisable?: boolean;
  title: string;
  onClickButton: () => void;
}

export default function InsertNewBookingButton({ title, isDisable, onClickButton }: Props) {
  return (
    <div>
      <Button
        onClick={() => onClickButton()}
        variant="contained"
        className="w-[380px] !bg-transparent !shadow-none !text-base !px-4 mdonly:!w-[380px] md:w-[330px] !border-none"
        disabled={isDisable}
      >
        <div className="flex flex-col items-center justify-between w-full gap-0 md:!text-xl">
          <Image src={isDisable ? GrayPlus : BluePlus} alt="plus" />
          <p className={`${isDisable ? "text-gray-color" : "text-blue-color"} text-lg`}>{title}</p>
        </div>
      </Button>
    </div>
  );
}
