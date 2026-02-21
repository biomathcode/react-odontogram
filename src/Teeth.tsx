import type { TeethProps } from "./type";

export const Teeth = ({
  name,
  outlinePath,
  shadowPath,
  lineHighlightPath,
  selected,
  onClick,
  onKeyDown,
  onHover,
  onFocus,
  onLeave,
  onBlur,
  children,
}: TeethProps) => (
  <g
    className={`${name} ${selected ? "selected" : ""}`}
    tabIndex={0}
    onClick={() => onClick?.(name)}
    onKeyDown={(e) => onKeyDown?.(e, name)}
    onMouseEnter={(e) => onHover?.(name, e)}
    onFocus={(e) => onFocus?.(name, e)}
    onMouseLeave={onLeave}
    onBlur={onBlur}
    role="option"
    aria-selected={selected}
    aria-label={`Tooth ${name.replace("teeth-", "")}`}
    style={{
      cursor: "pointer",
      outline: "none",
      touchAction: "manipulation",
      transition: "all 0.2s ease",
    }}
  >
    {children}
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d={outlinePath}
    />
    <path fill="currentColor" d={shadowPath} />
    {Array.isArray(lineHighlightPath) ? (
      lineHighlightPath.map((d) => (
        <path
          key={`${d}`}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          d={d}
        />
      ))
    ) : (
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d={lineHighlightPath}
      />
    )}
  </g>
);
