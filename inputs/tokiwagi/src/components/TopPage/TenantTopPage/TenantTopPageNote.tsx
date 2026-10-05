import Image from "next/legacy/image";

import CircleOutlineIcon from "statics/images/circle-outline.svg";
import CrossRedIcon from "statics/images/cross-red.svg";
import TriangleImage from "statics/images/triangle-pc.svg";

export default function TenantTopPageNote() {
  return (
    <div className="flex justify-center items-center gap-[40px] xs:flex-col xs:gap-[10px] xs:items-start">
      <div className="flex items-center">
        <span className="xs:w-[10px] xs:h-[10px] inline-flex">
          <Image src={CircleOutlineIcon} alt="tenant-logo" width={16} height={16} />
        </span>
        &nbsp;
        <span className="text-[12px] leading-[14px]">すぐにご入場できます</span>
      </div>
      <div className="flex items-center">
        <span className="xs:w-[10px] xs:h-[10px] inline-flex">
          <Image src={TriangleImage} alt="tenant-logo" width={16} height={16} />
        </span>
        &nbsp;
        <span className="text-[12px] leading-[14px]">入場制限中。お待ちいただきます</span>
      </div>
      <div className="flex items-center">
        <span className="xs:w-[10px] xs:h-[10px] inline-flex">
          <Image src={CrossRedIcon} alt="tenant-logo" width={16} height={16} />
        </span>
        &nbsp;
        <span className="text-[12px] leading-[14px]">完売</span>
      </div>
    </div>
  );
}
