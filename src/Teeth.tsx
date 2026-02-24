import type { TeethProps } from "./type";
export const Teeth = ({
  name,
  outlinePath,
  shadowPath,
  lineHighlightPath,
  selected,
  condition,
  readOnly,
  onClick,
  onKeyDown,
  onHover,
  onFocus,
  onLeave,
  onBlur,
  children,
}: TeethProps) => {
  const strokeColor = condition?.outlineColor ?? "currentColor";
  const fillColor = condition?.fillColor ?? "currentColor";

  return (
    <g
      className={`${name} ${selected ? "selected" : ""}`}
      onClick={readOnly ? undefined : () => onClick?.(name)}
      onKeyDown={readOnly ? undefined : (e) => onKeyDown?.(e, name)}
      onMouseEnter={onHover ? (e) => onHover(name, e) : undefined}
      onFocus={onFocus ? (e) => onFocus(name, e) : undefined}
      onMouseLeave={onLeave}
      onBlur={onBlur}
      role={readOnly ? undefined : "option"}
      aria-selected={readOnly ? undefined : selected}
      tabIndex={readOnly ? -1 : 0}
      aria-label={
        readOnly ? undefined : `Tooth ${name.replace("teeth-", "")}`
      }

      aria-disabled={readOnly}
      style={{
        cursor: readOnly ? "default" : "pointer",
        color: strokeColor,
      }}
    >
      {children}

      {/* outline */}
      <path
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        d={outlinePath}
      />

      {/* fill */}
      <path
        fill={fillColor}
        d={shadowPath}
        data-colored={condition ? "true" : undefined}
        style={{ opacity: condition ? 1 : undefined }}
      />

      {/* highlight lines */}
      {Array.isArray(lineHighlightPath)
        ? lineHighlightPath.map((d) => (
          <path
            key={d}
            stroke={strokeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            d={d}
          />
        ))
        : (
          <path
            stroke={strokeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            d={lineHighlightPath}
          />
        )}


    </g>
  );
};