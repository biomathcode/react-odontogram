import { type FC, type ReactNode, useCallback, useMemo, useState } from "react";
import Svg, { G, Path, Rect, Text } from "react-native-svg";
import { NewTeethPaths, teethPaths } from "../../../src/data";
import type {
	Notation,
	OdontogramColors,
	Theme,
	ToothConditionGroup,
	ToothDetail,
} from "../../../src/type";
import {
	convertFDIToNotation,
	getToothNotations,
	getViewBox,
	quadrants as newquadrants,
	oldquadrants,
} from "../../../src/utils";

export interface NativeOdontogramProps {
	defaultSelected?: string[];
	singleSelect?: boolean;
	onChange?: (selected: ToothDetail[]) => void;
	theme?: Theme;
	colors?: OdontogramColors;
	notation?: Notation;
	showHalf?: "upper" | "lower" | "full";
	maxTeeth?: number;
	teethConditions?: ToothConditionGroup[];
	readOnly?: boolean;
	showLabels?: boolean;
	layout?: "circle" | "square";
	width?: number | string;
	height?: number | string;
	style?: unknown;
	children?: ReactNode;
}

const nativeThemeColors = {
	light: {
		darkBlue: "#3e5edc",
		baseBlue: "#8a98be",
		lightBlue: "#c6ccf8",
	},
	dark: {
		darkBlue: "#aab6ff",
		baseBlue: "#d0d5f6",
		lightBlue: "#5361e6",
	},
};

const labelHeight = 28;
const viewBoxPartPattern = /\s+/;

type NativeToothProps = {
	id: string;
	outlinePath: string;
	shadowPath: string;
	lineHighlightPath: string | string[];
	displayName: string;
	selected: boolean;
	readOnly: boolean;
	strokeColor: string;
	fillColor: string;
	onPress: (id: string) => void;
};

const NativeTooth = ({
	id,
	outlinePath,
	shadowPath,
	lineHighlightPath,
	displayName,
	selected,
	readOnly,
	strokeColor,
	fillColor,
	onPress,
}: NativeToothProps) => (
	<G
		accessibilityLabel={`Tooth ${displayName}`}
		accessibilityRole={readOnly ? "image" : "button"}
		accessibilityState={{ selected, disabled: readOnly }}
		onPress={readOnly ? undefined : () => onPress(id)}
	>
		<Path
			d={outlinePath}
			stroke={strokeColor}
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={selected ? 1.5 : 2}
		/>
		<Path d={shadowPath} fill={fillColor} />
		{Array.isArray(lineHighlightPath) ? (
			lineHighlightPath.map((path) => (
				<Path
					key={path}
					d={path}
					stroke={strokeColor}
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			))
		) : (
			<Path
				d={lineHighlightPath}
				stroke={strokeColor}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		)}
	</G>
);

const getNativeViewBox = (
	layout: "circle" | "square",
	showHalf: "upper" | "lower" | "full",
	showLabels: boolean,
) => {
	const viewBox = getViewBox(layout, showHalf).trim();

	if (!showLabels) {
		return viewBox;
	}

	const [x, y, width, height] = viewBox.split(viewBoxPartPattern).map(Number);

	return `${x} ${y} ${width} ${height + labelHeight}`;
};

export const NativeOdontogram: FC<NativeOdontogramProps> = ({
	defaultSelected = [],
	singleSelect = false,
	onChange,
	theme = "light",
	colors = {},
	notation = "FDI",
	showHalf = "full",
	maxTeeth = 8,
	teethConditions,
	readOnly = false,
	showLabels = false,
	layout = "circle",
	width = "100%",
	height,
	style,
	children,
}) => {
	const teethpath = layout === "circle" ? teethPaths : NewTeethPaths;
	const quadrants = layout === "circle" ? oldquadrants : newquadrants;
	const palette = {
		...nativeThemeColors[theme],
		...colors,
	};

	const toothTypeByName = useMemo(
		() => new Map(teethpath.map((tooth) => [tooth.name, tooth.type])),
		[teethpath],
	);

	const getToothType = useCallback(
		(id: string) => {
			const toothName = id.replace("teeth-", "").slice(1);
			return toothTypeByName.get(toothName) ?? "Unknown";
		},
		[toothTypeByName],
	);

	const buildToothDetail = useCallback(
		(id: string): ToothDetail => ({
			id,
			notations: getToothNotations(id),
			type: getToothType(id),
		}),
		[getToothType],
	);

	const [selected, setSelected] = useState<Set<string>>(
		() => new Set(singleSelect ? defaultSelected.slice(0, 1) : defaultSelected),
	);

	const clampMaxTeeth = useCallback(
		(value: number | undefined) => {
			if (typeof value !== "number" || Number.isNaN(value)) {
				return teethpath.length;
			}

			return Math.max(0, Math.min(teethpath.length, Math.floor(value)));
		},
		[teethpath],
	);

	const conditionMap = useMemo(() => {
		const map = new Map<string, ToothConditionGroup>();

		if (teethConditions) {
			for (const condition of teethConditions) {
				for (const toothId of condition.teeth) {
					map.set(toothId, condition);
				}
			}
		}

		return map;
	}, [teethConditions]);

	const filteredTeeth = useMemo(
		() => teethpath.slice(0, clampMaxTeeth(maxTeeth)),
		[maxTeeth, clampMaxTeeth, teethpath],
	);

	const visibleQuadrants =
		showHalf === "upper"
			? quadrants.slice(0, 2)
			: showHalf === "lower"
				? quadrants.slice(2)
				: quadrants;

	const handleToggle = useCallback(
		(id: string) => {
			if (readOnly) {
				return;
			}

			setSelected((previous) => {
				const updated = new Set(previous);

				if (singleSelect) {
					if (updated.has(id)) {
						updated.delete(id);
					} else {
						updated.clear();
						updated.add(id);
					}
				} else {
					updated.has(id) ? updated.delete(id) : updated.add(id);
				}

				onChange?.(Array.from(updated).map(buildToothDetail));
				return updated;
			});
		},
		[buildToothDetail, onChange, readOnly, singleSelect],
	);

	const renderTeeth = useCallback(
		(prefix: string) =>
			filteredTeeth.map((tooth) => {
				const id = `${prefix}${tooth.name}`;
				const isSelected = selected.has(id);
				const condition = conditionMap.get(id);
				const strokeColor =
					condition?.outlineColor ??
					(isSelected ? palette.darkBlue : palette.baseBlue);
				const fillColor =
					condition?.fillColor ?? (isSelected ? palette.lightBlue : "none");
				const displayName = convertFDIToNotation(id, notation);

				return (
					<NativeTooth
						key={id}
						displayName={displayName}
						fillColor={fillColor}
						id={id}
						lineHighlightPath={tooth.lineHighlightPath}
						onPress={handleToggle}
						outlinePath={tooth.outlinePath}
						readOnly={readOnly}
						selected={isSelected}
						shadowPath={tooth.shadowPath}
						strokeColor={strokeColor}
					/>
				);
			}),
		[
			conditionMap,
			filteredTeeth,
			handleToggle,
			notation,
			palette.baseBlue,
			palette.darkBlue,
			palette.lightBlue,
			readOnly,
			selected,
		],
	);

	const chartViewBox = getViewBox(layout, showHalf).trim();
	const [viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight] = chartViewBox
		.split(viewBoxPartPattern)
		.map(Number);

	return (
		<Svg
			fill="none"
			height={height}
			style={style}
			viewBox={getNativeViewBox(layout, showHalf, showLabels)}
			width={width}
		>
			{visibleQuadrants.map(({ name, transform, prefix }) => (
				<G key={name} transform={transform}>
					{renderTeeth(`teeth-${prefix}`)}
				</G>
			))}

			{showLabels &&
				teethConditions?.map((condition, index) => {
					const labelX = viewBoxX + 8 + index * 120;
					const labelY = viewBoxY + viewBoxHeight + 17;

					return (
						<G key={condition.label}>
							<Rect
								fill={condition.fillColor}
								height={12}
								rx={3}
								stroke={condition.outlineColor}
								strokeWidth={1.5}
								width={12}
								x={labelX}
								y={labelY - 10}
							/>
							<Text
								fill={palette.baseBlue}
								fontSize={12}
								x={labelX + 18}
								y={labelY}
							>
								{condition.label}
							</Text>
						</G>
					);
				})}

			{children}
		</Svg>
	);
};

export default NativeOdontogram;
export type { ToothConditionGroup, ToothDetail };
