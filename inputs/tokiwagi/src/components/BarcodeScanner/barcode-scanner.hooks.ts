import { useState, useEffect, useRef } from "react";

export function useBarcodeScanner(onScan: (code: string) => void) {
  const [cameraActive, setCameraActive] = useState(false);
  const [hasBarcodeDetector, setHasBarcodeDetector] = useState<boolean | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if ("BarcodeDetector" in window) {
        if (mounted) setHasBarcodeDetector(true);
        return;
      }
      try {
        const mod = await import("barcode-detector");
        // package may export default or BarcodeDetector
        const Det = mod?.default || mod?.BarcodeDetector;
        if (Det) {
          // attach to window for later usage
          // @ts-ignore
          (window as any).BarcodeDetector = Det;
          if (mounted) setHasBarcodeDetector(true);
          return;
        }
      } catch (err) {
        console.debug("[Barcode] dynamic import barcode-detector failed", err);
      }
      if (mounted) setHasBarcodeDetector(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    if (detectIntervalRef.current) {
      clearInterval(detectIntervalRef.current);
      detectIntervalRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  const startDetecting = async () => {
    const tryGetDetector = async (): Promise<any | null> => {
      if ("BarcodeDetector" in window) return (window as any).BarcodeDetector;
      try {
        const mod = await import("barcode-detector");
        return (
          mod?.default ||
          mod?.BarcodeDetector ||
          (window as any).BarcodeDetector ||
          null
        );
      } catch (err) {
        console.debug("[Barcode] barcode-detector import failed", err);
        return null;
      }
    };

    const BarcodeDetectorClass = await tryGetDetector();
    setHasBarcodeDetector(Boolean(BarcodeDetectorClass));
    if (!BarcodeDetectorClass) return;

    const detector = new BarcodeDetectorClass({
      formats: ["code_128", "qr_code", "code_39", "ean_13"],
    });

    detectIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;
      try {
        const codes = await detector.detect(videoRef.current);
        if (codes?.length > 1) {
          setErrorMsg(
            "複数のバーコードが検出されました。バーコードを1つだけ表示して、再度スキャンしてください。",
          );
        } else if (codes?.length === 1) {
          onScan(codes[0].rawValue);
        }
      } catch (e) {
        console.debug("[Barcode] detect error", e);
      }
    }, 500);
  };

  const startCamera = async () => {
    try {
      setErrorMsg("");
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        setErrorMsg("video要素が見つかりません");
        return;
      }
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
      setCameraActive(true);
      await startDetecting();
    } catch {
      setErrorMsg("カメラへのアクセスが拒否されました");
    }
  };

  return {
    cameraActive,
    hasBarcodeDetector,
    errorMsg,
    videoRef,
    startCamera,
    stopCamera,
    setErrorMsg,
  };
}
