import "./styles.css";
import { useCallback, useState } from "react";
import { teethPaths } from "./data";

interface TeethProps {
	name: string;
	outlinePath: string;
	shadowPath: string;
	lineHighlightPath: string | string[];
	selected?: boolean;
	onClick?: (name: string) => void;
	onKeyDown?: (e: React.KeyboardEvent<SVGGElement>, name: string) => void;
	children?: React.ReactNode;
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
}

function convertFDIToNotation(
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

function getToothNotations(fdi: string) {
	const num = fdi.replace("teeth-", "");
	const universal = convertFDIToNotation(fdi, "Universal");
	const palmer = convertFDIToNotation(fdi, "Palmer");
	return {
		fdi: num,
		universal,
		palmer,
	};
}

const Teeth = ({
	name,
	outlinePath,
	shadowPath,
	lineHighlightPath,
	selected,
	onClick,
	onKeyDown,
	children,
}: TeethProps) => (
	<g
		className={`${name} ${selected ? "selected" : ""}`}
		tabIndex={0}
		onClick={() => onClick?.(name)}
		onKeyDown={(e) => onKeyDown?.(e, name)}
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

const Odontogram: React.FC<OdontogramProps> = ({
	defaultSelected = [],
	onChange,
	className = "",
	theme = "light",
	colors = {},
	notation,
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
			}}
		>
			<svg
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
		</div>
	);
};

function mapToCssVars(colors: Record<string, string | undefined>) {
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
