import type {
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from "react";

export type Notation = "FDI" | "Universal" | "Palmer";

export type Theme = "light" | "dark";

export type Placement =
  | "top"
  | "top-start"
  | "top-end"
  | "right"
  | "right-start"
  | "right-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end";

export interface ToothDetail {
  id: string;
  notations: {
    fdi: string;
    universal: string;
    palmer: string;
  };
  type: string;
}

export interface OdontogramColors {
  darkBlue?: string;
  baseBlue?: string;
  lightBlue?: string;
}

export type TooltipContentRenderer = (payload?: ToothDetail) => ReactNode;

export interface TeethProps {
  name: string;
  outlinePath: string;
  shadowPath: string;
  lineHighlightPath: string | string[];
  selected?: boolean;
  onClick?: (name: string) => void;
  onKeyDown?: (e: KeyboardEvent<SVGGElement>, name: string) => void;
  children?: ReactNode;
  onHover?: (name: string, event: MouseEvent<SVGGElement>) => void;
  onFocus?: (name: string, event: FocusEvent<SVGGElement>) => void;
  onLeave?: () => void;
  onBlur?: () => void;
}

export interface OdontogramProps {
  name?: string;
  defaultSelected?: string[];
  onChange?: (selected: ToothDetail[]) => void;
  className?: string;
  selectedColor?: string;
  hoverColor?: string;
  theme?: Theme;
  colors?: OdontogramColors;
  notation?: Notation;
  tooltip?: {
    placement?: Placement;
    margin?: number;
    content?: ReactNode | TooltipContentRenderer;
  };
  showTooltip?: boolean;
  showHalf?: "upper" | "lower" | "full";
  maxTeeth?: number;
}
