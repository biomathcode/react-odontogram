import "./styles.css";
import {
  type CSSProperties,
  type FC,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { Teeth } from "./Teeth";
import { OdontogramTooltip } from "./Tooltip";
import { teethPaths } from "./data";
import type {
  Notation,
  OdontogramColors,
  OdontogramProps,
  Placement,
  ToothDetail,
} from "./type";

const placements: Record<
  Placement,
  (toothBox: DOMRect, margin: number) => { x: number; y: number }
> = {
  top: (t, m) => ({ x: t.left + t.width / 2, y: t.top - m }),
  "top-start": (t, m) => ({ x: t.left, y: t.top - m }),
  "top-end": (t, m) => ({ x: t.right, y: t.top - m }),
  bottom: (t, m) => ({ x: t.left + t.width / 2, y: t.bottom + m }),
  "bottom-start": (t, m) => ({ x: t.left, y: t.bottom + m }),
  "bottom-end": (t, m) => ({ x: t.right, y: t.bottom + m }),
  left: (t, m) => ({ x: t.left - m, y: t.top + t.height / 2 }),
  "left-start": (t, m) => ({ x: t.left - m, y: t.top }),
  "left-end": (t, m) => ({ x: t.left - m, y: t.bottom }),
  right: (t, m) => ({ x: t.right + m, y: t.top + t.height / 2 }),
  "right-start": (t, m) => ({ x: t.right + m, y: t.top }),
  "right-end": (t, m) => ({ x: t.right + m, y: t.bottom }),
};

const quadrants: Array<{
  name: "first" | "second" | "third" | "fourth";
  transform: string;
  label: string;
}> = [
  {
    name: "first",
    transform: "",
    label: "Upper Right",
  },
  {
    name: "second",
    transform: "scale(-1, 1) translate(-409, 0)",
    label: "Upper Left",
  },
  {
    name: "third",
    transform: "scale(1, -1) translate(0, -694)",
    label: "Lower Right",
  },
  {
    name: "fourth",
    transform: "scale(-1, -1) translate(-409, -694)",
    label: "Lower Left",
  },
];

const toothTypeByName = new Map(teethPaths.map((tooth) => [tooth.name, tooth.type]));

const getToothType = (id: string) => {
  const toothName = id.replace("teeth-", "").slice(1);
  return toothTypeByName.get(toothName) ?? "Unknown";
};

const clampMaxTeeth = (maxTeeth: number | undefined) => {
  if (typeof maxTeeth !== "number" || Number.isNaN(maxTeeth)) {
    return teethPaths.length;
  }

  return Math.max(0, Math.min(teethPaths.length, Math.floor(maxTeeth)));
};

type ToothInteractionEvent =
  | MouseEvent<SVGGElement>
  | FocusEvent<SVGGElement>;

export function convertFDIToNotation(fdi: string, notation: Notation) {
  const num = fdi.replace("teeth-", "");

  const fdiToUniversal: Record<string, number> = {
    "11": 8,
    "12": 7,
    "13": 6,
    "14": 5,
    "15": 4,
    "16": 3,
    "17": 2,
    "18": 1,
    "21": 9,
    "22": 10,
    "23": 11,
    "24": 12,
    "25": 13,
    "26": 14,
    "27": 15,
    "28": 16,
    "31": 24,
    "32": 23,
    "33": 22,
    "34": 21,
    "35": 20,
    "36": 19,
    "37": 18,
    "38": 17,
    "41": 25,
    "42": 26,
    "43": 27,
    "44": 28,
    "45": 29,
    "46": 30,
    "47": 31,
    "48": 32,
  };

  if (notation === "Universal") {
    return String(fdiToUniversal[num] ?? num);
  }

  if (notation === "Palmer") {
    if (num.length < 2) {
      return num;
    }

    const quadrant = num[0];
    const tooth = num[1];
    const symbols: Record<string, string> = {
      "1": "UR",
      "2": "UL",
      "3": "LL",
      "4": "LR",
    };

    return `${tooth}${symbols[quadrant] ?? ""}`;
  }

  return num;
}

export function getToothNotations(fdi: string) {
  const num = fdi.replace("teeth-", "");
  const universal = convertFDIToNotation(fdi, "Universal");
  const palmer = convertFDIToNotation(fdi, "Palmer");

  return {
    fdi: num,
    universal,
    palmer,
  };
}

const buildToothDetail = (id: string): ToothDetail => ({
  id,
  notations: getToothNotations(id),
  type: getToothType(id),
});

export const Odontogram: FC<OdontogramProps> = ({
  defaultSelected = [],
  onChange,
  className = "",
  theme = "light",
  colors = {},
  notation = "FDI",
  tooltip = {
    margin: 10,
    placement: "top",
  },
  showTooltip = true,
  showHalf = "full",
  name,
  maxTeeth = teethPaths.length,
}) => {
  const themeColors =
    theme === "dark"
      ? {
          "--dark-blue": "#aab6ff",
          "--base-blue": "#d0d5f6",
          "--light-blue": "#5361e6",
        }
      : {
          "--dark-blue": "#3e5edc",
          "--base-blue": "#8a98be",
          "--light-blue": "#c6ccf8",
        };

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(defaultSelected)
  );

  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltipData, setTooltipData] = useState<{
    active: boolean;
    position?: { x: number; y: number };
    payload?: ToothDetail;
  }>({ active: false });

  const handleToggle = useCallback(
    (id: string) => {
      setSelected((previous) => {
        const updated = new Set(previous);
        if (updated.has(id)) {
          updated.delete(id);
        } else {
          updated.add(id);
        }

        onChange?.(Array.from(updated).map(buildToothDetail));
        return updated;
      });
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<SVGGElement>, id: string) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleToggle(id);
      }
    },
    [handleToggle]
  );

  const handleHover = useCallback(
    (
      id: string,
      event: ToothInteractionEvent,
      placement: Placement = "right"
    ) => {
      const path = event.currentTarget.querySelector("path");
      if (!(path && svgRef.current)) {
        return;
      }

      const toothBox = path.getBoundingClientRect();
      const svgBox = svgRef.current.getBoundingClientRect();
      const margin = tooltip.margin ?? 10;

      const { x, y } =
        placements[placement]?.(toothBox, margin) ??
        placements.right(toothBox, margin);
      const safeY = y < svgBox.top ? toothBox.bottom + margin : y;

      setTooltipData({
        active: true,
        position: { x, y: safeY },
        payload: buildToothDetail(id),
      });
    },
    [tooltip.margin]
  );

  const handleLeave = useCallback(() => {
    setTooltipData((previous) => ({ ...previous, active: false }));
  }, []);

  const visibleQuadrants =
    showHalf === "upper"
      ? quadrants.slice(0, 2)
      : showHalf === "lower"
      ? quadrants.slice(2)
      : quadrants;

  const filteredTeeth = teethPaths.slice(0, clampMaxTeeth(maxTeeth));

  const renderTeeth = (prefix: string) =>
    filteredTeeth.map((tooth) => {
      const id = `${prefix}${tooth.name}`;
      const displayName = convertFDIToNotation(id, notation);

      return (
        <Teeth
          key={id}
          {...tooth}
          name={id}
          selected={selected.has(id)}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          onHover={
            showTooltip
              ? (currentId, event) =>
                  handleHover(currentId, event, tooltip.placement)
              : undefined
          }
          onFocus={
            showTooltip
              ? (currentId, event) =>
                  handleHover(currentId, event, tooltip.placement)
              : undefined
          }
          onLeave={showTooltip ? handleLeave : undefined}
          onBlur={showTooltip ? handleLeave : undefined}
        >
          <title>{displayName}</title>
        </Teeth>
      );
    });

  const finalColors = {
    ...themeColors,
    ...mapToCssVars(colors),
  };

  const containerClasses = ["Odontogram", theme === "dark" ? "dark-theme" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={containerClasses}
      style={{
        ...(finalColors as CSSProperties),
        width: "100%",
        maxWidth: 300,
        margin: "0 auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      role="listbox"
      aria-label="Odontogram"
      aria-multiselectable="true"
    >
      <input
        type="hidden"
        name={name ?? "teeth"}
        value={JSON.stringify(Array.from(selected))}
      />
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox={
          showHalf === "full"
            ? "0 0 409 694"
            : showHalf === "upper"
            ? "0 0 409 347"
            : "0 347 409 347"
        }
        className="Odontogram"
        style={{
          width: "100%",
          height: "auto",
          userSelect: "none",
          touchAction: "manipulation",
        }}
      >
        <title>Odontogram</title>
        {visibleQuadrants.map(({ name, transform, label }, index) => (
          <g
            role="group"
            aria-label={label}
            key={name}
            transform={transform}
          >
            {renderTeeth(`teeth-${index + 1}`)}
          </g>
        ))}
      </svg>
      {showTooltip && (
        <OdontogramTooltip
          active={tooltipData.active}
          position={tooltipData.position}
          payload={tooltipData.payload}
          content={tooltip.content}
        />
      )}
    </div>
  );
};

export function mapToCssVars(colors: OdontogramColors) {
  const cssVars: Record<string, string> = {};

  if (colors.darkBlue) {
    cssVars["--dark-blue"] = colors.darkBlue;
  }
  if (colors.baseBlue) {
    cssVars["--base-blue"] = colors.baseBlue;
  }
  if (colors.lightBlue) {
    cssVars["--light-blue"] = colors.lightBlue;
  }

  return cssVars;
}

export default Odontogram;
