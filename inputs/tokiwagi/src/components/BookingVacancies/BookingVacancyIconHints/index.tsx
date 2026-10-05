import * as React from "react";
import Image from "next/legacy/image";

import OImg from "statics/images/user/circle-blue.svg";
import TriangleImage from "statics/images/triangle-pc.svg";
import XImg from "statics/images/user/x-red.svg";

type Props = {
  marginTop?: number;
  marginBottom?: number;
};

export default function BookingVacancyIconHints({ marginTop = 6, marginBottom }: Props) {
  return (
    <div className="flex justify-center items-center">
      <div className={`flex flex-col justify-center gap-[1.25rem] xs:gap-y-2 mx-auto mt-${marginTop} mb-${marginBottom} 
      text-base font-normal md:text-sm md:leading-6`}>
        <div className="flex items-center gap-2">
          <div className="md:w-4 md:h-4 flex w-[23px] xs:w-[10px] xs:h-[10px]">
            <Image src={OImg} alt="o" />
          </div>
          <span>販売中</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="md:w-4 md:h-4 flex w-[23px] xs:w-[10px] xs:h-[10px]">
            <Image src={TriangleImage} alt="TriangleImage" />
          </div>
          <span>入場制限中。お待ちいただきます</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="md:w-4 md:h-4 flex w-[23px] xs:w-[10px] xs:h-[10px]">
            <Image src={XImg} alt="x" />
          </div>
          <span>完売</span>
        </div>
      </div>
    </div>
  );
}
