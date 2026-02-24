import { type ReactNode, useEffect, useRef, useState } from "react";
import type { Placement, TooltipContentRenderer, ToothDetail } from "./type";

const ARROW_OFFSET = 12;
const VIEWPORT_PADDING = 8;

export interface OdontogramTooltipProps {
	active: boolean;
	payload?: ToothDetail;
	position?: {
		x: number;
		placement: Placement;
		margin: number;
		anchorRect: {
			top: number;
			right: number;
			bottom: number;
			left: number;
		};
	};
	content?: ReactNode | TooltipContentRenderer;
}

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);

const prefersBottom = (placement: Placement) => placement.startsWith("bottom");

const getContent = (
	content: ReactNode | TooltipContentRenderer | undefined,
	payload?: ToothDetail,
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
	const [coords, setCoords] = useState<{
		left: number;
		top: number;
		isBottomPlacement: boolean;
	} | null>(null);

	useEffect(() => {
		if (!(active && ref.current && position)) {
			return;
		}

		const tooltipBox = ref.current.getBoundingClientRect();
		const { x, placement, margin, anchorRect } = position;

		const maxLeft = Math.max(
			VIEWPORT_PADDING,
			window.innerWidth - tooltipBox.width - VIEWPORT_PADDING,
		);
		const left = clamp(x - tooltipBox.width / 2, VIEWPORT_PADDING, maxLeft);

		const topWhenAbove =
			anchorRect.top - tooltipBox.height - margin - ARROW_OFFSET;
		const topWhenBelow = anchorRect.bottom + margin + ARROW_OFFSET;

		const shouldStartBelow = prefersBottom(placement);
		let isBottomPlacement = shouldStartBelow;
		let top = shouldStartBelow ? topWhenBelow : topWhenAbove;

		if (!isBottomPlacement && top < VIEWPORT_PADDING) {
			isBottomPlacement = true;
			top = topWhenBelow;
		}

		const maxTop = Math.max(
			VIEWPORT_PADDING,
			window.innerHeight - tooltipBox.height - VIEWPORT_PADDING,
		);

		if (isBottomPlacement && top > maxTop) {
			isBottomPlacement = false;
			top = topWhenAbove;
		}

		top = clamp(top, VIEWPORT_PADDING, maxTop);

		setCoords({ left, top, isBottomPlacement });
	}, [active, position]);

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
					left: "50%",
					transform: "translateX(-50%)",
					width: 0,
					height: 0,
					borderLeft: "6px solid transparent",
					borderRight: "6px solid transparent",
					...(coords?.isBottomPlacement
						? {
								top: "-6px",
								borderBottom:
									"6px solid var(--odontogram-tooltip-bg, rgba(0, 0, 0, 0.85))",
						  }
						: {
								bottom: "-6px",
								borderTop:
									"6px solid var(--odontogram-tooltip-bg, rgba(0, 0, 0, 0.85))",
						  }),
				}}
			/>
		</div>
	);
}
