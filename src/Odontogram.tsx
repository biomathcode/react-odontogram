import "./styles.css";
import { useCallback, useRef, useState } from "react";
import { teethPaths } from "./data";
import { OdontogramTooltip } from "./Tooltip";

type Placement =
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


export interface TeethProps {
	name: string;
	outlinePath: string;
	shadowPath: string;
	lineHighlightPath: string | string[];
	selected?: boolean;
	onClick?: (name: string) => void;
	onKeyDown?: (e: React.KeyboardEvent<SVGGElement>, name: string) => void;
	children?: React.ReactNode;
	onHover?: (name: string, event: React.MouseEvent, placement?: Placement) => void;
	onLeave?: () => void;
}

export interface ToothDetail {
	id: string;
	notations: {
		fdi: string;
		universal: string;
		palmer: string;
	};
	type: string;
}

export interface OdontogramProps {
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
}

export function convertFDIToNotation(
	fdi: string,
	notation: "FDI" | "Universal" | "Palmer",
) {
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
		const quadrant = num[0];
		const tooth = num[1];
		const symbols: Record<string, string> = {
			"1": "UR", // upper right
			"2": "UL", // upper left
			"3": "LL", // lower left
			"4": "LR", // lower right
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
		role="button"
		aria-pressed={selected}
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
			lineHighlightPath.map((d, i) => (
				<path
					key={i}
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

export const Odontogram: React.FC<OdontogramProps> = ({
	defaultSelected = [],
	onChange,
	className = "",
	theme = "light",
	colors = {},
	notation,
	tooltip = {
		margin: 10,
	},
	showTooltip = true,

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
		new Set(defaultSelected),
	);

	const svgRef = useRef<SVGSVGElement>(null);
	const tooltipRef = useRef<HTMLDivElement>(null);

	const [tooltipData, setTooltipData] = useState<{
		active: boolean;
		position?: { x: number; y: number };
		payload?: ToothDetail;
	}>({ active: false });

	const handleToggle = useCallback(
		(name: string) => {
			setSelected((prev) => {
				const updated = new Set(prev);
				updated.has(name) ? updated.delete(name) : updated.add(name);

				// build detailed JSON output
				const details = Array.from(updated).map((id) => {
					const fdi = id.replace("teeth-", "");
					const toothBase = fdi.slice(1);
					const toothData = teethPaths.find((t) => t.name === toothBase);
					return {
						id,
						notations: getToothNotations(id),
						type: toothData?.type ?? "Unknown",
					};
				});

				onChange?.(details);
				return updated;
			});
		},
		[onChange],
	);
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<SVGGElement>, name: string) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				handleToggle(name);
			}
		},
		[handleToggle],
	);

	const quadrants = [
		{ name: "first", transform: "" },
		{ name: "second", transform: "scale(-1, 1) translate(-409, 0)" },
		{ name: "third", transform: "scale(1, -1) translate(0, -694)" },
		{ name: "fourth", transform: "scale(-1, -1) translate(-409, -694)" },
	];


	const handleHover = (
		name: string,
		e: React.MouseEvent,
		placement: Placement = "right" // default
	) => {
		const target = e.currentTarget as SVGGElement;
		const path = target.querySelector("path");

		if (!path || !svgRef.current) return;

		const toothBox = path.getBoundingClientRect();
		const svgBox = svgRef.current.getBoundingClientRect();

		const margin = tooltip?.margin || 10; // distance between tooth and tooltip

		// Compute tooltip position just above or below depending on space
		let x = toothBox.left
		let y = toothBox.top

		switch (placement) {
			case "top":
				x = toothBox.left + toothBox.width / 2;
				y = toothBox.top - margin;
				break;
			case "top-start":
				x = toothBox.left;
				y = toothBox.top - margin;
				break;
			case "top-end":
				x = toothBox.right;
				y = toothBox.top - margin;
				break;
			case "bottom":
				x = toothBox.left + toothBox.width / 2;
				y = toothBox.bottom + margin;
				break;
			case "bottom-start":
				x = toothBox.left;
				y = toothBox.bottom + margin;
				break;
			case "bottom-end":
				x = toothBox.right;
				y = toothBox.bottom + margin;
				break;
			case "left":
				x = toothBox.left - margin;
				y = toothBox.top + toothBox.height / 2;
				break;
			case "left-start":
				x = toothBox.left - margin;
				y = toothBox.top;
				break;
			case "left-end":
				x = toothBox.left - margin;
				y = toothBox.bottom;
				break;
			case "right":
				x = toothBox.right + margin;
				y = toothBox.top + toothBox.height / 2;
				break;
			case "right-start":
				x = toothBox.right + margin;
				y = toothBox.top;
				break;
			case "right-end":
				x = toothBox.right + margin;
				y = toothBox.bottom;
				break;
		}


		// If tooltip would go above svg, place it below instead
		if (y < svgBox.top) {
			y = toothBox.bottom + margin;
		}

		setTooltipData({
			active: true,
			position: { x, y },
			payload: {
				id: name,
				notations: getToothNotations(name),
				type: teethPaths.find((t) => t.name === name.replace("teeth-", "").slice(1))
					?.type ?? "Unknown",
			},
		});
	};
	const handleLeave = () => setTooltipData((p) => ({ ...p, active: false }));


	const renderTeeth = (prefix: string) =>
		teethPaths.map((tooth) => {
			const id = `${prefix}${tooth.name}`;
			const displayName = convertFDIToNotation(id, notation ?? "FDI"); // 🆕

			return (
				<Teeth
					key={id}
					{...tooth}
					name={id}
					selected={selected.has(id)}
					onClick={handleToggle}
					onKeyDown={handleKeyDown}
					onHover={(name, e) => handleHover(name, e, tooltip?.placement)}
					onLeave={handleLeave}
				>
					<title>{displayName}</title>
				</Teeth>
			);
		});


	const finalColors = { ...themeColors, ...mapToCssVars(colors) };

	return (
		<div
			className={`Odontogram ${theme === "dark" ? "dark-theme" : ""}`}
			style={{
				...(finalColors as React.CSSProperties),
				width: "100%",
				maxWidth: 300,
				margin: "0 auto",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				// isolation: "isolate",
			}}
		>
			<svg
				ref={svgRef}

				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 409 694"
				className="Odontogram"
				style={{
					width: "100%",
					height: "auto",
					userSelect: "none",
					touchAction: "manipulation",
				}}
			>
				<g name="upper">
					{quadrants.slice(0, 2).map(({ name, transform }, index) => (
						<g key={name} name={name} transform={transform}>
							{renderTeeth(`teeth-${index + 1}`)}
						</g>
					))}
				</g>

				<g name="lower">
					{quadrants.slice(2).map(({ name, transform }, index) => (
						<g key={name} name={name} transform={transform}>
							{renderTeeth(`teeth-${index + 3}`)}
						</g>
					))}
				</g>
			</svg>
			{showTooltip && (
				<OdontogramTooltip
					active={tooltipData.active}
					position={tooltipData.position}
					payload={tooltipData.payload}
					content={tooltip?.content}
				/>
			)}
		</div>
	);
};

export function mapToCssVars(colors: Record<string, string | undefined>) {
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
