import "./styles.css";
import { teethPaths } from "./data";
import { useCallback, useState } from "react";

interface TeethProps {
	name: string;
	outlinePath: string;
	shadowPath: string;
	lineHighlightPath: string | string[];
	selected?: boolean;
	onClick?: (name: string) => void;
	onKeyDown?: (e: React.KeyboardEvent<SVGGElement>, name: string) => void;
}

const Teeth = ({
	name,
	outlinePath,
	shadowPath,
	lineHighlightPath,
	selected,
	onClick,
	onKeyDown,
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
		<title>{name}</title>
		<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d={outlinePath} />
		<path fill="currentColor" d={shadowPath} />
		{Array.isArray(lineHighlightPath)
			? lineHighlightPath.map((d, i) => (
				<path key={i} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d={d} />
			))
			: <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d={lineHighlightPath} />}
	</g>
);

export interface OdontogramProps {
	defaultSelected?: string[];
	onChange?: (selected: string[]) => void;
	className?: string;
	selectedColor?: string;
	hoverColor?: string;
}

const Odontogram: React.FC<OdontogramProps> = ({
	defaultSelected = [],
	onChange,
	className = "",
	selectedColor = "#1E90FF",
	hoverColor = "#60A5FA",
}) => {
	const [selected, setSelected] = useState<Set<string>>(new Set(defaultSelected));

	const handleToggle = useCallback(
		(name: string) => {
			setSelected((prev) => {
				const updated = new Set(prev);
				updated.has(name) ? updated.delete(name) : updated.add(name);
				onChange?.(Array.from(updated));
				return updated;
			});
		},
		[onChange]
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<SVGGElement>, name: string) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				handleToggle(name);
			}
		},
		[handleToggle]
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
			return (
				<Teeth
					key={id}
					{...tooth}
					name={id}
					selected={selected.has(id)}
					onClick={handleToggle}
					onKeyDown={handleKeyDown}
				/>
			);
		});

	return (
		<div
			className={`OdontogramWrapper ${className}`}
			style={{
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

export default Odontogram;
