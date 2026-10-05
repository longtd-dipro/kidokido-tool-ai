import { useRouter } from "next/router";
import { useEffect } from "react";

import Button from "components/common/Buttons/Button";

export interface Props {
  redirectUrl: string;
  heading: string;
  title: string;
  content: string | string[];
  note?: string;
  error?: string;
  buttonText?: string;
}

export default function BookingCompletion({ redirectUrl, heading, title, content, note, error, buttonText }: Props) {
  const router = useRouter();
  const contentBlocks = content instanceof Array ? content : [content];

  const handleRedirect = () => {
    router.push(redirectUrl);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <div className={"mx-auto max-w-[732px] xs:mx-2"}>
      <h2 className="usr-title-line mx-auto xs:!text-[28px] mb-8">{heading}</h2>
      <div className="my-12 text-center font-light xs:font-medium text-base !leading-7">
        {error && (
          <div className="text-red-color text-center mb-4">
            <p>{error}</p>
          </div>
        )}
        <p>{title}</p>
        {contentBlocks.map((content, index) => (
          <p key={index} className="my-2">
            {content}
          </p>
        ))}
        {note && (
          <div className="font-bold text-center">
            <p>{note}</p>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Button type="button" variant="contained" onClick={handleRedirect} className="xs:w-[290px] xs:h-12 xs:!text-[18px] w-[360px] h-[64px]">
          {buttonText || "バーコードを表示"}
        </Button>
      </div>
    </div>
  );
}
