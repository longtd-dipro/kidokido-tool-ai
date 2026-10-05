import styled from "@emotion/styled";

import { ScanVariant } from "./barcode-scanner.types";

export type ScanStatus =
  | "idle"
  | "loading"
  | "success-checkin"
  | "success-checkout"
  | "success-rollback-checkin"
  | "success-rollback-checkout"
  | "error";

export const PageWrapper = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px 40px;
  min-height: calc(100vh - 80px);
  background: #f1f5f9;

  @media (min-width: 768px) {
    padding: 32px 24px 48px;
  }
`;

export const Card = styled("div")`
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 600px;
  overflow: hidden;
`;

export const CardHeader = styled("div") <{ variant?: ScanVariant }>`
  background: ${({ variant }) => (variant === ScanVariant.Rollback ? "#FFE0C8" : "linear-gradient(135deg, #0068b7 0%, #1a8fe3 100%)")};
  padding: 20px 24px 18px;
`;

export const CardTitle = styled("h1") <{ variant?: ScanVariant }>`
  color: ${({ variant }) => (variant === ScanVariant.Rollback ? "#F54D1D" : "#fff")};
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (min-width: 768px) {
    font-size: 20px;
  }
`;

export const CardSubtitle = styled("p") <{ variant?: ScanVariant }>`
  color: ${({ variant }) => (variant === ScanVariant.Rollback ? "#F54D1D" : "#fff")};
  font-size: 16px;
  margin: 0;
`;

export const OperationToggleRow = styled("div")`
  display: flex;
  gap: 16px;
  justify-content: center;
  width: 100%;
  max-width: 600px;
  margin-top: 93px;
  margin-bottom: 16px;
`;

export const OperationToggleBtn = styled("button") <{
  active: boolean;
  variant?: ScanVariant;
}>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1.5px solid
    ${({ active, variant }) => {
    if (variant === ScanVariant.Rollback) {
      if (active) {
        return "#FFE0C8";
      }
      return "#F54D1D";
    } else {
      if (active) {
        return "#0068b7";
      }
      return "#0068b7";
    }
  }};
  background: ${({ active, variant }) => {
    if (!active) {
      return "#ffffff";
    }
    return variant === ScanVariant.Rollback ? "#FFE0C8" : "#0068b7";
  }};
  color: ${({ active, variant }) => {
    if (variant === ScanVariant.Rollback) {
      return "#F54D1D";
    }

    if (active) {
      return "#ffffff";
    }
    return "#0068b7";
  }};
  font-size: 16px;
  font-weight: 700;
  font-family: "Noto Sans JP", sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${({ active }) =>
    active ? "0 1px 3px rgba(38, 36, 44, 0.18)" : "0 1px 3px rgba(38, 36, 44, 0.08)"};

  &:hover {
    background: ${({ active, variant }) => {
    if (active) {
      return variant === ScanVariant.Rollback ? "#FFE0C8" : "#005a9e";
    }
    return variant === ScanVariant.Rollback ? "#FAF7F5" : "#f0f7ff";
  }};
  }

  &:active {
    transform: translateY(1px);
  }
`;

export const TabRow = styled("div")`
  display: flex;
  border-bottom: 1px solid #e2e8f0;
`;

export const Tab = styled("button") <{ active: boolean, variant: ScanVariant }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px 8px;
  background: ${({ variant, active }) => {
    if (variant === ScanVariant.Rollback) {
      return "#FFEEE2";
    }
    return active ? "#f0f7ff" : "transparent";
  }};
  border: none;
  border-bottom: 3px solid ${({ variant, active }) => {
    if (variant === ScanVariant.Rollback) {
      return active ? "#F54D1D" : "transparent";
    }
    return active ? "#0068b7" : "transparent";
  }};
  color: ${({ variant, active }) => {
    if (variant === ScanVariant.Rollback) {
      return active ? "#F54D1D" : "#64748b";
    }
    return active ? "#0068b7" : "#64748b";
  }};
  font-size: 16px;
  font-weight: ${({ active }) => (active ? 700 : 500)};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ variant, active }) => {
    if (variant === ScanVariant.Rollback) {
      return "#FFEEE2";
    }
    return active ? "#f0f7ff" : "#f0f7ff";
  }};
      color: ${({ variant, active }) => {
    if (variant === ScanVariant.Rollback) {
      return "#F54D1D";
    }
    return active ? "#0068b7" : "#0068b7";
  }};
  }
`;

export const ScanSection = styled("div")`
  padding: 24px;
`;

export const InputLabel = styled("label")`
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const BarcodeInputWrapper = styled("div")`
  position: relative;
`;

export const BarcodeInput = styled("input")`
  width: 100%;
  height: 52px;
  border: 2px solid #bfdbfe;
  border-radius: 12px;
  padding: 0 52px 0 16px;
  font-size: 16px;
  font-family: "Courier New", monospace;
  font-weight: 600;
  color: #1e293b;
  background: #f8faff;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: #0068b7;
    box-shadow: 0 0 0 3px rgba(0, 104, 183, 0.12);
    background: #fff;
  }

  &::placeholder {
    color: #94a3b8;
    font-weight: 400;
    font-family: inherit;
  }
`;

export const InputHint = styled("p")`
  font-size: 11px;
  color: #94a3b8;
  margin: 6px 0 0;
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const CameraArea = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

export const VideoWrapper = styled("div")`
  position: relative;
  width: 100%;
  max-width: 340px;
  border-radius: 16px;
  overflow: hidden;
  background: #000;
  aspect-ratio: 1;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
`;

export const StyledVideo = styled("video")`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const ScanFrame = styled("div")`
  position: absolute;
  inset: 0;
  pointer-events: none;

  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 48px;
    height: 48px;
    border-color: #22d3ee;
    border-style: solid;
    border-width: 0;
  }
  &::before {
    top: 20px;
    left: 20px;
    border-top-width: 3px;
    border-left-width: 3px;
    border-radius: 4px 0 0 0;
  }
  &::after {
    bottom: 20px;
    right: 20px;
    border-bottom-width: 3px;
    border-right-width: 3px;
    border-radius: 0 0 4px 0;
  }
`;

export const ScanLine = styled("div") <{ animate: boolean }>`
  position: absolute;
  left: 20px;
  right: 20px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #22d3ee, transparent);
  animation: ${({ animate }) => (animate ? "scanline 2s linear infinite" : "none")};

  @keyframes scanline {
    0% { top: 20px; }
    100% { top: calc(100% - 20px); }
  }
`;

export const CameraBtn = styled("button") <{ danger?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ danger }) =>
    danger
      ? "linear-gradient(135deg, #ef4444, #dc2626)"
      : "linear-gradient(135deg, #0068b7, #1a8fe3)"};
  color: #fff;
  box-shadow: ${({ danger }) =>
    danger
      ? "0 2px 8px rgba(239, 68, 68, 0.3)"
      : "0 2px 8px rgba(0, 104, 183, 0.3)"};

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ danger }) => danger ? "0 4px 12px rgba(239, 68, 68, 0.45)" : "0 4px 12px rgba(0, 104, 183, 0.45)"};
  }
  &:active { transform: translateY(0); }
`;

export const NoBarcodeDetector = styled("div")`
  text-align: center;
  padding: 24px 16px;
  color: #64748b;
  font-size: 13px;
  background: #fef9c3;
  border: 1px solid #fde68a;
  border-radius: 12px;
`;

export const StatusArea = styled("div") <{ status: ScanStatus }>`
  margin: 16px 24px 24px;
  border-radius: 14px;
  overflow: hidden;
  background: ${({ status }) => {
    if (status === "success-checkin") return "linear-gradient(135deg, #ecfdf5, #d1fae5)";
    if (status === "success-checkout") return "linear-gradient(135deg, #fff7ed, #ffedd5)";
    if (status === "success-rollback-checkin") return "linear-gradient(135deg, #f5f3ff, #ede9fe)";
    if (status === "success-rollback-checkout") return "linear-gradient(135deg, #eff6ff, #dbeafe)";
    if (status === "error") return "linear-gradient(135deg, #fef2f2, #fee2e2)";
    if (status === "loading") return "#f8faff";
    return "transparent";
  }};
  border: 1.5px solid ${({ status }) => {
    if (status === "success-checkin") return "#6ee7b7";
    if (status === "success-checkout") return "#fdba74";
    if (status === "success-rollback-checkin") return "#c4b5fd";
    if (status === "success-rollback-checkout") return "#93c5fd";
    if (status === "error") return "#fca5a5";
    if (status === "loading") return "#bfdbfe";
    return "transparent";
  }};
  transition: all 0.3s;
`;

export const StatusHeader = styled("div") <{ status: ScanStatus }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 16px;
  background: ${({ status }) => {
    if (status === "success-checkin") return "rgba(16, 185, 129, 0.1)";
    if (status === "success-checkout") return "rgba(249, 115, 22, 0.1)";
    if (status === "success-rollback-checkin") return "rgba(139, 92, 246, 0.1)";
    if (status === "success-rollback-checkout") return "rgba(59, 130, 246, 0.1)";
    if (status === "error") return "rgba(239, 68, 68, 0.1)";
    return "transparent";
  }};
  border-bottom: 1px solid ${({ status }) => {
    if (status === "success-checkin") return "#6ee7b7";
    if (status === "success-checkout") return "#fdba74";
    if (status === "success-rollback-checkin") return "#c4b5fd";
    if (status === "success-rollback-checkout") return "#93c5fd";
    if (status === "error") return "#fca5a5";
    return "transparent";
  }};
`;

export const StatusTitle = styled("span") <{ status: ScanStatus }>`
  font-weight: 600;
  font-size: 18px;
  color: ${({ status }) => {
    if (status === "success-checkin") return "#059669";
    if (status === "success-checkout") return "#ea580c";
    if (status === "success-rollback-checkin") return "#7c3aed";
    if (status === "success-rollback-checkout") return "#2563eb";
    if (status === "error") return "#dc2626";
    if (status === "loading") return "#0068b7";
    return "#1e293b";
  }};
`;

export const BookingDetail = styled("div")`
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const DetailRow = styled("div")`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
`;

export const DetailLabel = styled("span")`
  color: #94a3b8;
  width: 116px;
  flex-shrink: 0;
  padding-top: 1px;
`;

export const DetailValue = styled("span")`
  color: #1e293b;
  font-weight: 500;
  flex: 1;
`;

export const DetailExtendedPrices = styled("span")`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const TicketNoLabel = styled("div")`
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
`;

export const PartialCheckoutEntry = styled("div")`
  display: flex;
  flex-direction: column;
`;

export const PartialCheckoutTime = styled("span")`
  color: #ea580c;
  font-weight: 700;
`;

export const PartialCheckoutQuantity = styled("span")`
  color: #94a3b8;
  font-size: 12px;
`;

export const TotalAmountBlock = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
`;

export const ResetBtn = styled("button")`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: calc(100% - 48px);
  margin: 0 24px 24px;
  padding: 12px;
  border-radius: 10px;
  border: 1.5px dashed #cbd5e1;
  background: transparent;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #0068b7;
    color: #0068b7;
    background: #f0f7ff;
  }
`;
