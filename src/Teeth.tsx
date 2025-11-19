import { TeethProps } from "./type";

export const Teeth = ({
  name,
  outlinePath,
  shadowPath,
  lineHighlightPath,
  selected,
  onClick,
  onKeyDown,
  onHover,
  onLeave,
  children,
}: TeethProps) => (
  <g
    className={`${name} ${selected ? "selected" : ""}`}
    tabIndex={0}
    onClick={() => onClick?.(name)}
    onKeyDown={(e) => onKeyDown?.(e, name)}
    onMouseMove={(e) => onHover?.(name, e)}
    onMouseLeave={onLeave}
    role="option"
    aria-selected={selected}
    aria-label={`Tooth ${name}`}
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
