import { useEffect, useRef } from "react";

export type TooltipContentRenderer = (payload?: any) => React.ReactNode;

export interface OdontogramTooltipProps {
	active: boolean;
	payload?: any;
	position?: { x: number; y: number };
	content?: React.ReactNode | TooltipContentRenderer;
}

const getContent = (
	content: React.ReactNode | TooltipContentRenderer,
	payload?: any,
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

	useEffect(() => {
		if (ref.current && position) {
			const { x, y } = position;
			ref.current.style.left = `${x + 10}px`;
			ref.current.style.top = `${y + 10}px`;
		}
	}, [position]);

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
				background: "rgba(0, 0, 0, 0.75)",
				color: "#fff",
				padding: "6px 10px",
				borderRadius: "6px",
				fontSize: "12px",
				lineHeight: 1.3,
				whiteSpace: "nowrap",
				zIndex: 1000,
				transform: "translate(-50%, -100%)",
				transition: "opacity 0.15s ease",
			}}
		>
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
		</div>
	);
};
