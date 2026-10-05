import Image from "next/legacy/image";

import Plus from "statics/images/plus-circle-white-plus-blue.svg";
import Button from "components/common/Buttons/Button";

export interface Props {
  title: string;
  onClickButton: () => void;
}

export default function InsertNewDiscountSetting({ title, onClickButton }: Props) {
  return (
    <div>
      <Button
        onClick={() => onClickButton()}
        className="!bg-transparent !shadow-none !text-base !px-4 !border-none"
      >
        <div className="flex items-center w-full gap-0 md:!text-xl">
          <Image src={Plus} alt="plus" />
          <p className={"text-blue-color font-bold text-lg ml-2"}>{title}</p>
        </div>
      </Button>
    </div>
  );
}
