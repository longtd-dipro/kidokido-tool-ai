/* eslint-disable @next/next/no-img-element */

interface Props {
  src: string;
  alt: string;
}

export default function SmaregiQRCode({ src, alt }: Props) {
  return (
    <div className="w-[220px] h-[150px] shrink-0 overflow-hidden">
      <img className="w-full h-full object-contain" src={src} alt={alt} />
    </div>
  );
}
