import { type ReactNode, useEffect, useRef, useState } from "react";
import type { ToothDetail, TooltipContentRenderer } from "./type";

const ARROW_OFFSET = 12;
const VIEWPORT_PADDING = 8;

export interface OdontogramTooltipProps {
  active: boolean;
  payload?: ToothDetail;
  position?: { x: number; y: number };
  content?: ReactNode | TooltipContentRenderer;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getContent = (
  content: ReactNode | TooltipContentRenderer | undefined,
  payload?: ToothDetail
) => {
  if (!content) {
    return undefined;
  }

  return typeof content === "function" ? content(payload) : content;
};

export function OdontogramTooltip({
  active,
  payload,
  position,
  content,
}: OdontogramTooltipProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ left: number; top: number } | null>(
    null
  );

  useEffect(() => {
    if (!(active && ref.current && position)) {
      return;
    }

    const tooltipBox = ref.current.getBoundingClientRect();
    const { x, y } = position;

    const maxLeft = Math.max(
      VIEWPORT_PADDING,
      window.innerWidth - tooltipBox.width - VIEWPORT_PADDING
    );
    const left = clamp(x - tooltipBox.width / 2, VIEWPORT_PADDING, maxLeft);

    const nextTop = y - tooltipBox.height - ARROW_OFFSET;
    const top = nextTop < VIEWPORT_PADDING ? y + ARROW_OFFSET : nextTop;

    setCoords({ left, top });
  }, [active, position, content, payload]);

  if (!(active && payload)) {
    return null;
  }

  return (
    <div
      ref={ref}
      className="odontogram-tooltip"
      style={{
        position: "fixed",
        pointerEvents: "none",
        background: "var(--odontogram-tooltip-bg, rgba(0,0,0,0.85))",
        color: "var(--odontogram-tooltip-fg, #fff)",
        padding: "6px 10px",
        borderRadius: "6px",
        fontSize: "12px",
        lineHeight: 1.3,
        whiteSpace: "nowrap",
        zIndex: 1000,
        left: coords?.left ?? -9999,
        top: coords?.top ?? -9999,
        opacity: coords ? 1 : 0,
        transition: "opacity 0.15s ease",
      }}
    >
      {getContent(content, payload) ?? (
        <>
          <div>Tooth: {payload.notations.fdi}</div>
          <div>Type: {payload.type}</div>
          <div>
            Universal: {payload.notations.universal}, Palmer:{" "}
            {payload.notations.palmer}
          </div>
        </>
      )}
      <div
        className="odontogram-tooltip-arrow"
        style={{
          position: "absolute",
          bottom: "-6px",
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop:
            "6px solid var(--odontogram-tooltip-bg, rgba(0, 0, 0, 0.85))",
        }}
      />
    </div>
  );
}
