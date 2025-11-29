import { useEffect, useRef, useState } from "react";

export type TooltipContentRenderer = (payload?: any) => React.ReactNode;

export interface OdontogramTooltipProps {
  active: boolean;
  payload?: any;
  position?: { x: number; y: number };
  content?: React.ReactNode | TooltipContentRenderer;
}

const getContent = (
  content: React.ReactNode | TooltipContentRenderer,
  payload?: any
) => {
  return typeof content === "function" ? content(payload) : content;
};

export const OdontogramTooltip: React.FC<OdontogramTooltipProps> = ({
  active,
  payload,
  position,
  content,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (!ref.current || !position) return;

    const tooltipBox = ref.current.getBoundingClientRect();
    const { x, y } = position;

    // place tooltip above the hover point
    const left = x - tooltipBox.width / 2;
    const top = y - tooltipBox.height - 12; // space for arrow

    setCoords({ left, top });
  }, [position, content, payload]);

  if (!(active && payload)) return null;

  return (
    <div
      ref={ref}
      className="odontogram-tooltip"
      style={{
        position: "fixed",
        pointerEvents: "none",
        background: "rgba(0,0,0,0.85)",
        color: "#fff",
        padding: "6px 10px",
        borderRadius: "6px",
        fontSize: "12px",
        lineHeight: 1.3,
        whiteSpace: "nowrap",
        zIndex: 1000,

        left: coords.left,
        top: coords.top,

        opacity: active ? 1 : 0,
        transition: "opacity 0.15s ease",
      }}
    >
      {/* tooltip content */}
      {getContent(content, payload) ?? (
        <>
          <div>Tooth: {payload?.notations?.fdi}</div>
          <div>Type: {payload?.type}</div>
          <div>
            Universal: {payload?.notations?.universal}, Palmer:{" "}
            {payload?.notations?.palmer}
          </div>
        </>
      )}

      {/* ARROW */}
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
          borderTop: "6px solid rgba(0, 0, 0, 0.85)", // arrow color
        }}
      />
    </div>
  );
};
