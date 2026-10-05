import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import Image from "next/legacy/image";
import Plyr from "plyr-react";
import "plyr-react/dist/plyr.css";

import Button from "components/common/Buttons/Button";
import CloseIcon from "statics/images/close.svg";
import { getVideoSource } from "utils/video-player";

interface Props {
  onDismiss: () => void;
  onNext: () => void;
  videoUrl: string;
}

export default function GuideVideoDialog({ onDismiss, onNext, videoUrl }: Props) {
  const videoSource = getVideoSource(videoUrl);

  return (
    <Dialog disablePortal open={true} onClose={onDismiss} aria-labelledby="responsive-dialog-title" className="mx-auto text-color w-[640px] xs:w-full xs:px-5">
      <div className="flex w-full items-start justify-end pt-[20px] px-[20px]">
        <Image src={CloseIcon} alt="close" onClick={onDismiss} className="cursor-pointer" />
      </div>
      <DialogTitle className="!text-2xl !font-medium text-center responsive-dialog-title xs:!text-xl">必ずご家族でご覧ください </DialogTitle>

      <DialogContent className="mt-2">
        <p className="mx-4 mb-6 font-thin xs:mx-0 xs:text-base">
          皆さまが安心・安全に、そして何より楽しくあそび場をご利用いただけるよう、「あそび場のルール」がございます。事前にご視聴をお願いいたします。
        </p>
        <div className="w-full flex justify-center">
          <div className="w-[550px] xs:w-[280px] flex flex-col items-center max-h-[400px]">
            <Plyr source={videoSource} />
          </div>
        </div>
      </DialogContent>
      <DialogActions className="flex flex-col justify-center">
        <Button variant="contained" onClick={onNext} className="!static w-[300px] h-[64px] xs:w-[150px] xs:h-[48px] xs:text-lg !mb-4">
          次へ
        </Button>
      </DialogActions>
    </Dialog>
  );
}
