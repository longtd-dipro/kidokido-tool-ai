import { Dialog } from "@mui/material";
import { News } from "@prisma/client";
import Image from "next/legacy/image";
import moment from "moment";

import { SHORT_DATE_DOT } from "constants/common";
import CloseIcon from "statics/images/close.svg";
import "react-quill/dist/quill.snow.css";

interface Props {
  news: News;
  onDismiss: any;
}

export default function NewsItemDialog({ news, onDismiss }: Props) {
  const { title, date, content } = news;

  return (
    <Dialog disablePortal open={true} onClose={onDismiss} aria-labelledby="responsive-dialog-title"
      className="max-w-[640px] xsup:w-full mx-auto xs:mx-7 ql-snow">
      <div className="flex flex-col items-center gap-[22px] justify-center pt-[20px] px-[20px] xs:pb-[20px] xs:gap-[18px]">
        <div className="flex max-w-[600px] w-full flex-row items-start justify-end ">
          <Image src={CloseIcon} alt="close" onClick={onDismiss} className="cursor-pointer" />
        </div>

        <h3 className="text-lg text-center font-medium text-color xs:text-base">{title}</h3>
        <p className="font-medium xs:text-sm">{moment(date).format(SHORT_DATE_DOT)}</p>
      </div>
      <div className="text-left px-[20px] pb-[40px] mt-6 xs:mt-0 ql-editor">
        <div dangerouslySetInnerHTML={{ __html: content }}></div>
      </div>
    </Dialog>
  );
}
