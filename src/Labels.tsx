import type { FC } from "react";
import type { ToothConditionGroup } from "./type";

type ConditionLabelsProps = {
	conditions?: ToothConditionGroup[];
	className?: string;
};

export const ConditionLabels: FC<ConditionLabelsProps> = ({
	conditions,
	className = "",
}) => {
	if (!conditions || conditions.length === 0) {
		return null;
	}

	return (
		<ul
			className={className}
			style={{
				display: "flex",
				gap: 8,
				fontFamily: "sans-serif",
				fontSize: 14,
				flexWrap: "wrap",
			}}
			aria-label="Tooth condition legend"
		>
			{conditions.map((condition) => (
				<li
					key={condition.label}
					style={{
						display: "flex",
						alignItems: "center",
						gap: 8,
					}}
				>
					<span
						aria-hidden="true"
						style={{
							width: 14,
							height: 14,
							borderRadius: 4,
							background: condition.fillColor,
							border: `2px solid ${
								condition.outlineColor ?? condition.fillColor
							}`,
							display: "inline-block",
						}}
					/>
					<span style={{ textTransform: "capitalize" }}>{condition.label}</span>
				</li>
			))}
		</ul>
	);
};

export default ConditionLabels;
