import React, { useCallback, useEffect, useRef, useState } from "react";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ReplayIcon from "@mui/icons-material/Replay";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import Image from "next/legacy/image";

import BarcodeActiveIcon from "statics/images/barcode-active.svg";
import BarcodeActiveRollbackModeIcon from "statics/images/barcode-active-rollback-mode.svg";
import BarcodeInactiveIcon from "statics/images/barcode-inactive.svg";
import BarcodeInactiveRollbackModeIcon from "statics/images/barcode-inactive-rollback-mode.svg";
import {
  scanBookingBarCode,
  rollbackScanBookingBarCode,
} from "services/api-client/admin/booking.service";
import {
  DUPLICATE_SCAN_CONFIRM_MS,
  SCAN_RESULT_DISPLAY_SECONDS,
} from "constants/common";
import { MESSAGES } from "constants/messages";

import ScanStatusPanel from "./ScanStatusPanel";
import ConfirmDuplicateDialog from "./ConfirmDuplicateDialog";
import * as S from "./barcode-scanner.styles";
import { ScanMode, ScanResult, ScanVariant } from "./barcode-scanner.types";
import { useBarcodeScanner } from "./barcode-scanner.hooks";

function BarcodeScanner({ isV2 = false }: { isV2?: boolean }) {
  const [operation, setOperation] = useState<ScanVariant>(ScanVariant.Scan);
  const [mode, setMode] = useState<ScanMode>("camera");
  const [barCodeInput, setBarCodeInput] = useState("");
  const [status, setStatus] = useState<S.ScanStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [pendingCode, setPendingCode] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const lastScannedRef = useRef<string>("");
  const operationRef = useRef<ScanVariant>(operation);
  const isProcessingRef = useRef<boolean>(false);
  const autoResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lastCheckinRef = useRef<{ code: string; at: number } | null>(null);

  const clearAutoResetTimer = () => {
    if (autoResetTimerRef.current !== null) {
      clearTimeout(autoResetTimerRef.current);
      autoResetTimerRef.current = null;
    }
  };

  useEffect(() => {
    operationRef.current = operation;
  }, [operation]);

  /** Was this barcode checked in within the confirmation window? */
  const isRecentlyCheckedIn = (code: string) => {
    const last = lastCheckinRef.current;
    if (!last || last.code !== code) return false;
    const elapsed = Date.now() - last.at;
    // Negative means the device clock moved backwards; treat as expired.
    return elapsed >= 0 && elapsed < DUPLICATE_SCAN_CONFIRM_MS;
  };

  /* ── Main scan handler ── */
  const handleScan = useCallback(async (code: string, confirmed = false) => {
    const trimmed = code.trim();
    if (!trimmed || isProcessingRef.current) return;
    // Blocks the camera from re-firing the same code while the result panel is up.
    if (!confirmed && trimmed === lastScannedRef.current) return;

    // Consecutive scan after a 入場 — ask first. 入場取り消し must always go through,
    // and it runs on another endpoint anyway, so it is exempt.
    if (
      !confirmed &&
      operationRef.current !== ScanVariant.Rollback &&
      isRecentlyCheckedIn(trimmed)
    ) {
      // The detect loop keeps running behind the modal, so it must be stopped.
      stopCamera();
      setPendingCode(trimmed);
      return;
    }

    isProcessingRef.current = true;
    lastScannedRef.current = trimmed;

    setStatus("loading");
    setErrorMsg("");
    setResult(null);

    const currentOperation = operationRef.current;

    try {
      let scanResult: ScanResult;
      if (currentOperation === ScanVariant.Rollback) {
        scanResult = await rollbackScanBookingBarCode({ barCode: trimmed });
      } else {
        scanResult = await scanBookingBarCode({
          barCode: trimmed,
          performedAt: new Date(),
        });
      }

      setResult(scanResult);

      if (currentOperation !== ScanVariant.Rollback) {
        lastCheckinRef.current =
          scanResult.action === "checkin"
            ? { code: trimmed, at: Date.now() }
            : null;
      } else if (
        scanResult.action === "rollback-checkin" &&
        lastCheckinRef.current?.code === trimmed
      ) {
        lastCheckinRef.current = null;
      }
      switch (scanResult.action) {
        case "checkin":
          setStatus("success-checkin");
          break;
        case "checkout":
          setStatus("success-checkout");
          break;
        case "rollback-checkin":
          setStatus("success-rollback-checkin");
          break;
        case "rollback-checkout":
          setStatus("success-rollback-checkout");
          break;
        default:
          setStatus("success-checkin");
      }
      stopCamera();
    } catch (err: any) {
      const msg =
        err.response?.data?.error || err.message || "エラーが発生しました";
      setErrorMsg(msg);
      setStatus("error");
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  const {
    cameraActive,
    hasBarcodeDetector,
    errorMsg: cameraError,
    videoRef,
    startCamera,
    stopCamera,
    setErrorMsg: setCameraError,
  } = useBarcodeScanner(handleScan);

  /* ── Sync camera error to local error state ── */
  useEffect(() => {
    if (cameraError) {
      setErrorMsg(cameraError);
      setStatus("error");
      setCameraError("");
    }
  }, [cameraError, setCameraError]);

  /* ── Focus input on mode switch ── */
  useEffect(() => {
    if (mode === "input") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [mode]);

  /* ── Input: submit on Enter ── */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && barCodeInput.trim()) {
      handleScan(barCodeInput);
    }
  };

  const handleReset = () => {
    clearAutoResetTimer();
    setStatus("idle");
    setErrorMsg("");
    setResult(null);
    setBarCodeInput("");
    setPendingCode(null);
    lastScannedRef.current = "";
    isProcessingRef.current = false;
    // Leaves scanHistoryRef alone on purpose — that is the duplicate-scan window.
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleConfirmDuplicateScan = () => {
    const code = pendingCode;
    setPendingCode(null);
    if (code) handleScan(code, true);
  };

  const handleCancelDuplicateScan = () => handleReset();

  /* ── Auto-reset ScanStatusPanel after SCAN_RESULT_DISPLAY_SECONDS (v2 only) ── */
  useEffect(() => {
    if (!isV2 || result?.action !== "checkin") return;
    autoResetTimerRef.current = setTimeout(() => {
      if (mode !== "camera") {
        handleReset();
        return;
      }
      handleStartCamera();
    }, SCAN_RESULT_DISPLAY_SECONDS * 1_000);
    return clearAutoResetTimer;
  }, [result, isV2]);

  const handleStartCamera = async () => {
    await startCamera();
    handleReset();
  };

  const handleChangeOperation = (next: ScanVariant) => {
    if (next === operation) return;
    setOperation(next);
    stopCamera();
    handleReset();
  };

  const isRollback = operation === ScanVariant.Rollback;

  const getCardBarcodeIcon = (
    scanVariant: ScanVariant,
    scanMode: ScanMode,
    isHeader = true,
  ) => {
    return scanVariant === ScanVariant.Rollback ? (
      scanMode == "input" ? (
        <Image src={BarcodeActiveRollbackModeIcon} alt="Barcode Icon"></Image>
      ) : (
        <Image
          src={
            isHeader
              ? BarcodeActiveRollbackModeIcon
              : BarcodeInactiveRollbackModeIcon
          }
          alt="Barcode Icon"
        ></Image>
      )
    ) : scanMode == "input" ? (
      <Image
        src={isHeader ? BarcodeInactiveIcon : BarcodeActiveIcon}
        alt="Barcode Icon"
      ></Image>
    ) : (
      <Image
        src={isHeader ? BarcodeInactiveIcon : BarcodeActiveIcon}
        alt="Barcode Icon"
      ></Image>
    );
  };

  const getCameraIcon = (scanVariant: ScanVariant, scanMode: ScanMode) => {
    const color = scanVariant === ScanVariant.Rollback ? "#F54D1D" : "#0068B7";
    return scanMode == "input" ? (
      <CameraAltOutlinedIcon sx={{ fontSize: 24, color: "#979797" }} />
    ) : (
      <CameraAltOutlinedIcon sx={{ fontSize: 24, color: color }} />
    );
  };

  return (
    <S.PageWrapper>
      {/* ── Operation Toggle (scan vs rollback) — sits above the card ── */}
      <S.OperationToggleRow>
        <S.OperationToggleBtn
          variant={ScanVariant.Scan}
          active={operation === ScanVariant.Scan}
          onClick={() => handleChangeOperation(ScanVariant.Scan)}
        >
          入場・退場・決済
        </S.OperationToggleBtn>
        <S.OperationToggleBtn
          variant={ScanVariant.Rollback}
          active={operation === ScanVariant.Rollback}
          onClick={() => handleChangeOperation(ScanVariant.Rollback)}
        >
          入場取り消し・退場取り消し
        </S.OperationToggleBtn>
      </S.OperationToggleRow>

      <S.Card>
        {/* ── Header ── */}
        <S.CardHeader variant={operation}>
          <S.CardTitle variant={operation}>
            {getCardBarcodeIcon(operation, mode)}
            バーコード読み取り
          </S.CardTitle>
          <S.CardSubtitle variant={operation}>
            {isRollback
              ? "バーコードをスキャンして入場や退場の取り消しを行います"
              : "バーコードをスキャンしてチェックイン/ チェックアウト/会計を行います"}
          </S.CardSubtitle>
        </S.CardHeader>

        {/* ── Mode Tabs ── */}
        <S.TabRow>
          <S.Tab
            variant={operation}
            active={mode === "input"}
            onClick={() => {
              setMode("input");
              stopCamera();
            }}
          >
            {getCardBarcodeIcon(operation, mode, false)}
            バーコードリーダー
          </S.Tab>
          <S.Tab
            variant={operation}
            active={mode === "camera"}
            onClick={() => setMode("camera")}
          >
            {getCameraIcon(operation, mode)}
            カメラスキャン
          </S.Tab>
        </S.TabRow>

        {/* ── Scan Input ── */}
        <S.ScanSection>
          {mode === "input" && (
            <>
              <S.InputLabel>バーコード入力</S.InputLabel>
              <S.BarcodeInputWrapper>
                <S.BarcodeInput
                  ref={inputRef}
                  value={barCodeInput}
                  onChange={(e) => setBarCodeInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="バーコードをスキャン または 手動入力..."
                  autoComplete="off"
                  autoFocus
                  disabled={status === "loading"}
                />
              </S.BarcodeInputWrapper>
              <S.InputHint>USB/Bluetoothリーダー対応</S.InputHint>
              <S.InputHint className="mt-0">
                スキャン後、Enterキーを押して確定してください
              </S.InputHint>
            </>
          )}

          {mode === "camera" && (
            <S.CameraArea>
              {hasBarcodeDetector === false ? (
                <S.NoBarcodeDetector>
                  <WarningAmberIcon
                    sx={{ fontSize: 28, color: "#f59e0b", mb: 1 }}
                  />
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontWeight: 600,
                      color: "#92400e",
                    }}
                  >
                    このブラウザはカメラスキャンに対応していません
                  </p>
                  <p style={{ margin: "6px 0 0", fontSize: 12 }}>
                    Chrome / Edge (Android, デスクトップ) をご利用ください。
                    <br />
                    または「バーコードリーダー」タブをお使いください。
                  </p>
                </S.NoBarcodeDetector>
              ) : (
                <>
                  <S.VideoWrapper>
                    <S.StyledVideo ref={videoRef} playsInline muted />
                    {cameraActive && (
                      <S.ScanFrame>
                        <S.ScanLine animate={cameraActive} />
                      </S.ScanFrame>
                    )}
                  </S.VideoWrapper>

                  {!cameraActive ? (
                    <S.CameraBtn
                      onClick={handleStartCamera}
                      disabled={status === "loading"}
                    >
                      <CameraAltOutlinedIcon sx={{ fontSize: 20 }} />
                      カメラを起動する
                    </S.CameraBtn>
                  ) : (
                    <S.CameraBtn danger onClick={stopCamera}>
                      カメラを停止する
                    </S.CameraBtn>
                  )}

                  <S.InputHint
                    style={{
                      textAlign: "center",
                      justifyContent: "center",
                      fontSize: 12,
                    }}
                  >
                    <QrCodeScannerIcon sx={{ fontSize: 12 }} />
                    バーコードをカメラに向けてください。自動的に読み取ります。
                  </S.InputHint>
                </>
              )}
            </S.CameraArea>
          )}
        </S.ScanSection>

        {/* ── Status / Result ── */}
        <ScanStatusPanel
          status={status}
          errorMsg={errorMsg}
          result={result}
          isV2={isV2}
        />

        {/* ── Reset button ── */}
        {status !== "idle" && status !== "loading" && (
          <S.ResetBtn onClick={handleReset}>
            <ReplayIcon sx={{ fontSize: 16 }} />
            次のスキャンへ
          </S.ResetBtn>
        )}
      </S.Card>

      <ConfirmDuplicateDialog
        isOpen={!!pendingCode}
        message={MESSAGES.DUPLICATE_SCAN_CONFIRM}
        onYes={handleConfirmDuplicateScan}
        onNo={handleCancelDuplicateScan}
      />
    </S.PageWrapper>
  );
}

export default BarcodeScanner;
