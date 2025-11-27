import { type KeyboardEvent, type MouseEvent, type ReactNode } from "react";

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

export interface TeethProps {
  name: string;
  outlinePath: string;
  shadowPath: string;
  lineHighlightPath: string | string[];
  selected?: boolean;
  onClick?: (name: string) => void;
  onKeyDown?: (e: KeyboardEvent<SVGGElement>, name: string) => void;
  children?: ReactNode;
  onHover?: (name: string, event: MouseEvent, placement?: Placement) => void;
  onLeave?: () => void;
}

export interface OdontogramProps {
  name?: string;
  defaultSelected?: string[];
  onChange?: (selected: ToothDetail[]) => void;
  className?: string;
  selectedColor?: string;
  hoverColor?: string;
  theme: "light" | "dark";
  colors: Record<string, string>;
  notation?: "FDI" | "Universal" | "Palmer";
  tooltip?: {
    placement?: Placement;
    margin?: number;
    content?: React.ReactNode | ((payload?: ToothDetail) => React.ReactNode);
  };
  showTooltip?: boolean;
  showHalf?: "upper" | "lower" | "full";
  maxTeeth?: number;

}
