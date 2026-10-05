import { useEffect, useRef } from "react";
import bwipjs from "bwip-js";

export type BarcodeProps = {
  code: string;
  scale?: number;
  height?: number;
  includeText?: boolean;
  textxalign?: "offleft" | "left" | "center" | "right" | "offright" | "justify" | undefined;
  textsize?: number;
  backgroundcolor?: string;
  paddingheight?: number;
  paddingwidth?: number;
  className?: string;
};

export const Barcode = ({
  code,
  scale = 3,
  height = 10,
  includeText = true,
  textxalign = "center",
  textsize,
  backgroundcolor,
  paddingheight,
  paddingwidth,
  className,
}: BarcodeProps) => {
  const canvasRef = useRef();

  useEffect(() => {
    bwipjs.toCanvas(canvasRef.current, {
      bcid: "code128",
      text: code,
      scale,
      height,
      textxalign,
      includetext: includeText,
      textsize,
      backgroundcolor,
      paddingheight,
      paddingwidth,
    });

    return () => {
      // Cleanup function
      const canvas: any = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [code, scale, height, includeText, textxalign]);

  return <canvas className={className ?? "xs:w-[100%] md:w-[20rem] w-[17rem]"} ref={canvasRef} />;
};
