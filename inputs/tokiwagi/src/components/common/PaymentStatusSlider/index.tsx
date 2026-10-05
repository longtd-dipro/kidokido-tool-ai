import React, { useCallback, useEffect, useRef, useState } from "react";

import * as S from "./payment-status-slider.styles";

export type PaymentStatusSliderValue = "left" | "right";

interface PaymentStatusSliderProps {
  /** Label for the left segment (e.g. "未払い") */
  leftLabel: string;
  /** Label for the right segment (e.g. "支払い済み") */
  rightLabel: string;
  /** Which side is currently selected */
  value: PaymentStatusSliderValue;
  /** Called when the user drags the thumb to a different side. */
  onChange: (value: PaymentStatusSliderValue) => void;
  /** Disable interaction */
  disabled?: boolean;
  /** Optional className on outer track */
  className?: string;
}

/**
 * Segmented pill slider with drag-to-switch behavior.
 * Both labels are visible; the white thumb must be dragged
 * horizontally across the track to change the selection.
 * Clicking a label does NOT change the value.
 */
function PaymentStatusSlider({
  leftLabel,
  rightLabel,
  value,
  onChange,
  disabled = false,
  className,
}: PaymentStatusSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  // Drag state
  const [dragging, setDragging] = useState(false);
  // Live offset in [0..1] while dragging; when not dragging, this is ignored
  // and the resting offset is derived from `value`.
  const [dragOffset, setDragOffset] = useState<number | null>(null);

  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);
  const trackWidthRef = useRef(0);

  const restingOffset = value === "right" ? 1 : 0;
  const offset = dragOffset ?? restingOffset;

  const endDrag = useCallback(
    (commit: boolean, finalOffset: number) => {
      setDragging(false);
      setDragOffset(null);
      pointerIdRef.current = null;
      if (!commit) return;
      const next: PaymentStatusSliderValue = finalOffset >= 0.5 ? "right" : "left";
      if (next !== value) onChange(next);
    },
    [value, onChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;

    // Track "travel" = full track width minus thumb width (= half track width here).
    // Since thumb is 50% wide, max translate in px == track inner width / 2.
    const trackWidth = track.clientWidth - 8; // account for 4px padding each side
    trackWidthRef.current = trackWidth / 2; // max px travel for the thumb

    pointerIdRef.current = e.pointerId;
    thumb.setPointerCapture(e.pointerId);
    startXRef.current = e.clientX;
    startOffsetRef.current = restingOffset;
    setDragging(true);
    setDragOffset(restingOffset);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || pointerIdRef.current !== e.pointerId) return;
    const travel = trackWidthRef.current;
    if (travel <= 0) return;
    const dx = e.clientX - startXRef.current;
    const next = Math.min(1, Math.max(0, startOffsetRef.current + dx / travel));
    setDragOffset(next);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    const finalOffset = dragOffset ?? restingOffset;
    endDrag(true, finalOffset);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    endDrag(false, restingOffset);
  };

  // Safety: if the component unmounts mid-drag, reset state.
  useEffect(() => {
    return () => {
      pointerIdRef.current = null;
    };
  }, []);

  return (
    <S.Track
      ref={trackRef}
      disabled={disabled}
      className={className}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={value === "right" ? 1 : 0}
      aria-valuetext={value === "right" ? rightLabel : leftLabel}
      aria-disabled={disabled}
    >
      <S.Thumb
        ref={thumbRef}
        offset={offset}
        dragging={dragging}
        disabled={disabled}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      />
      <S.Segment selected={value === "left"}>{leftLabel}</S.Segment>
      <S.Segment selected={value === "right"}>{rightLabel}</S.Segment>
    </S.Track>
  );
}

export default PaymentStatusSlider;
