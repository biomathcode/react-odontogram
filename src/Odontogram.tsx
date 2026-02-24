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
import { NewTeethPaths, teethPaths } from "./data";
import type {
  OdontogramProps,
  Placement,
  ToothConditionGroup,
  ToothDetail,
  ToothInteractionEvent,
} from "./type";
import {
  convertFDIToNotation,
  getToothNotations,
  mapToCssVars,
  placements,
  quadrants as newquadrants,
  oldquadrants
} from "./utils";
import ConditionLabels from "./Labels";

type Layout = 'circle' | 'square';
type ShowHalf = 'full' | 'upper' | 'lower';

export function getViewBox(layout: Layout, showHalf: ShowHalf): string {
  if (layout === 'square') {
    // linear does not support half slicing (single row)

    if (showHalf === 'upper') return '0 0 900 75';
    if (showHalf === 'lower') return '0 75 900 75 ';


    return '0 0 900 150';
  }

  // circle layout
  const full = '0 0 409 694';
  const upper = '0 0 409 347';
  const lower = '0 347 409 347';

  if (showHalf === 'upper') return upper;
  if (showHalf === 'lower') return lower;
  return full;
}

export const Odontogram: FC<OdontogramProps> = ({
  defaultSelected = [],
  singleSelect = false,
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
  maxTeeth = 8,
  teethConditions,
  readOnly = false,
  showLabels = false,
  layout = 'circle',
  styles
}) => {
  /**
   * Memo: tooth type lookup
   */

  const teethpath = layout === 'circle' ? teethPaths : NewTeethPaths;

  const quadrants = layout === 'circle' ? oldquadrants : newquadrants;

  const toothTypeByName = useMemo(
    () => new Map(teethpath.map((t) => [t.name, t.type])),
    [teethpath]
  );

  /**
   * Helpers
   */
  const getToothType = useCallback(
    (id: string) => {
      const toothName = id.replace("teeth-", "").slice(1);
      return toothTypeByName.get(toothName) ?? "Unknown";
    },
    [toothTypeByName]
  );

  const clampMaxTeeth = useCallback(
    (value: number | undefined) => {
      if (typeof value !== "number" || Number.isNaN(value)) {
        return teethpath.length;
      }
      return Math.max(0, Math.min(teethpath.length, Math.floor(value)));
    },
    []
  );

  const buildToothDetail = useCallback(
    (id: string): ToothDetail => ({
      id,
      notations: getToothNotations(id),
      type: getToothType(id),
    }),
    [getToothType]
  );

  /**
   * Theme
   */
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

  /**
   * State
   */
  const [selected, setSelected] = useState<Set<string>>(
    () =>
      new Set(
        singleSelect ? defaultSelected.slice(0, 1) : defaultSelected
      )
  );

  const svgRef = useRef<SVGSVGElement>(null);

  const [tooltipData, setTooltipData] = useState<{
    active: boolean;
    position?: { x: number; y: number };
    payload?: ToothDetail;
  }>({ active: false });

  /**
   * Handlers
   */
  const handleToggle = useCallback(
    (id: string) => {
      if (readOnly) return;

      setSelected((previous) => {
        const updated = new Set(previous);

        if (singleSelect) {
          if (updated.has(id)) {
            updated.delete(id);
          } else {
            updated.clear();
            updated.add(id);
          }
        } else {
          updated.has(id) ? updated.delete(id) : updated.add(id);
        }

        onChange?.(Array.from(updated).map(buildToothDetail));
        return updated;
      });
    },
    [onChange, readOnly, buildToothDetail, singleSelect]
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
      if (!(path && svgRef.current)) return;

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
    [tooltip.margin, tooltip.placement, buildToothDetail]
  );

  const handleLeave = useCallback(() => {
    setTooltipData((prev) => ({ ...prev, active: false }));
  }, []);

  /**
   * Quadrants
   */
  const visibleQuadrants =
    showHalf === "upper"
      ? quadrants.slice(0, 2)
      : showHalf === "lower"
        ? quadrants.slice(2)
        : quadrants;

  /**
   * Teeth slice
   */
  const filteredTeeth = useMemo(
    () => teethpath.slice(0, clampMaxTeeth(maxTeeth)),
    [maxTeeth, clampMaxTeeth, layout]
  );

  /**
   * Condition map
   */
  const conditionMap = useMemo(() => {
    const map = new Map<string, ToothConditionGroup>();

    teethConditions?.forEach((condition) => {
      condition.teeth.forEach((toothId) => {
        map.set(toothId, condition);
      });
    });

    return map;
  }, [teethConditions]);

  /**
   * Render teeth
   */
  const renderTeeth = useCallback(
    (prefix: string) =>
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
            <title>{displayName}</title>
          </Teeth>
        );
      }),
    [
      filteredTeeth,
      notation,
      conditionMap,
      readOnly,
      selected,
      handleToggle,
      handleKeyDown,
      handleHover,
      handleLeave,
      showTooltip,
      tooltip.placement,
    ]
  );

  /**
   * Colors
   */
  const finalColors = {
    ...themeColors,
    ...mapToCssVars(colors),
  };

  const containerClasses = [
    "Odontogram",
    theme === "dark" ? "dark-theme" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");


  //we have 4 conditions 
  //layout is circle or square 
  // if 



  return (
    <div
      className={containerClasses}
      style={{
        ...(finalColors as CSSProperties),
        width: "100%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        justifyContent: "center",
        alignItems: "center",
        ...styles as CSSProperties
      }}
      role="listbox"
      aria-label="Odontogram"
      aria-multiselectable={!singleSelect}
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
        viewBox={getViewBox(layout, showHalf)
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
