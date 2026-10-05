import styled from "@emotion/styled";

/* ──────────────────────────────────────────────────────────────
   Segmented pill slider — DRAG to change value (not clickable).
   Two labels are always visible side-by-side; a white thumb
   must be dragged horizontally across the track to switch sides.
────────────────────────────────────────────────────────────── */

export const Track = styled("div")<{ disabled?: boolean }>`
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  width: 100%;
  height: 64px;
  padding: 4px;
  background: #BFBFBF;
  border-radius: 9999px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.06);
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  user-select: none;
  touch-action: pan-y;
  box-sizing: border-box;
`;

export const Thumb = styled("div")<{
  offset: number;
  dragging: boolean;
  disabled?: boolean;
}>`
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: #ffffff;
  border-radius: 9999px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.08);
  transform: translateX(${({ offset }) => `${offset * 100}%`});
  transition: ${({ dragging }) =>
    dragging ? "none" : "transform 260ms cubic-bezier(0.4, 0, 0.2, 1)"};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "grab")};

  &:active {
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "grabbing")};
  }
`;

export const Segment = styled("div")<{ selected: boolean }>`
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: ${({ selected }) => (selected ? 700 : 500)};
  color: ${({ selected }) => (selected ? "#0068B7" : "#6b7280")};
  padding: 0 12px;
  pointer-events: none;
  transition: color 200ms ease, font-weight 200ms ease;

  @media (min-width: 768px) {
    font-size: 18px;
  }
`;
