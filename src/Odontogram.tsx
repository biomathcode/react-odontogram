import "./styles.css";
import {
  type CSSProperties,
  type FC,
  type KeyboardEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Teeth } from "./Teeth";
import { OdontogramTooltip } from "./Tooltip";
import { teethPaths } from "./data";
import type {
  OdontogramProps,
  Placement,
  ToothConditionGroup,
  ToothDetail,
  ToothInteractionEvent,
} from "./type";
import { convertFDIToNotation, getToothNotations, mapToCssVars, placements, quadrants } from "./utils";
import ConditionLabels from "./Labels";



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
  teethConditions,
  readOnly = false,
  showLabels = false,
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
      if (readOnly) return;

      setSelected((previous) => {
        const updated = new Set(previous);
        updated.has(id) ? updated.delete(id) : updated.add(id);

        onChange?.(Array.from(updated).map(buildToothDetail));
        return updated;
      });
    },
    [onChange, readOnly]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<SVGGElement>, id: string) => {
      if (readOnly) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleToggle(id);
      }
    },
    [handleToggle, readOnly]
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

  const conditionMap = useMemo(() => {
    const map = new Map<string, ToothConditionGroup>();

    teethConditions?.forEach((condition) => {
      condition.teeth.forEach((toothId) => {
        map.set(toothId, condition);
      });
    });

    return map;
  }, [teethConditions]);

  const conditionByTooth = new Map<
    string,
    { fill?: string; stroke?: string; label?: string }
  >();

  teethConditions?.forEach((condition) => {
    condition.teeth.forEach((toothId) => {
      conditionByTooth.set(toothId, condition);
    });
  });

  const renderTeeth = (prefix: string) =>
    filteredTeeth.map((tooth) => {
      const id = `${prefix}${tooth.name}`;
      const displayName = convertFDIToNotation(id, notation);

      const condition = conditionMap.get(id);

      return (
        <Teeth
          key={id}
          readOnly={readOnly}

          {...tooth}
          name={id}
          selected={selected.has(id)}
          condition={condition}
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
          <title>
            {displayName}
          </title>
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
        flexDirection: 'column',
        gap: '20px',
        justifyContent: "center",
        alignItems: "center",
      }}
      role="listbox"
      aria-label="Odontogram"
      aria-multiselectable="true"
      data-read-only={readOnly ? "true" : "false"}
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

      {showLabels && (
        <ConditionLabels conditions={teethConditions} />
      )}

    </div>
  );
};



export default Odontogram;
