import { act, create } from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";
import NativeOdontogram, {
	NativeOdontogram as NamedNativeOdontogram,
} from "../src/index";

const getInteractiveTeeth = (root: ReturnType<typeof create>["root"]) =>
	root.findAll(
		(node) =>
			node.props.testID === "G" && node.props.accessibilityRole === "button",
	);

const getTooth = (
	root: ReturnType<typeof create>["root"],
	accessibilityLabel: string,
) =>
	root.find(
		(node) =>
			node.props.testID === "G" &&
			node.props.accessibilityLabel === accessibilityLabel,
	);

const getSvgNode = (root: ReturnType<typeof create>["root"]) =>
	root.findByProps({ testID: "Svg" });

describe("NativeOdontogram", () => {
	it("exports the native component as default and named exports", () => {
		expect(NativeOdontogram).toBe(NamedNativeOdontogram);
	});

	it("renders all permanent teeth by default", () => {
		const chart = create(<NativeOdontogram />);

		expect(getInteractiveTeeth(chart.root)).toHaveLength(32);
		expect(getSvgNode(chart.root).props.viewBox).toBe("0 0 409 694");
	});

	it("renders upper and lower halves", () => {
		const chart = create(<NativeOdontogram showHalf="upper" />);

		expect(getInteractiveTeeth(chart.root)).toHaveLength(16);
		expect(getSvgNode(chart.root).props.viewBox).toBe("0 0 409 347");

		act(() => {
			chart.update(<NativeOdontogram showHalf="lower" />);
		});

		expect(getInteractiveTeeth(chart.root)).toHaveLength(16);
		expect(getSvgNode(chart.root).props.viewBox).toBe("0 347 409 347");
	});

	it("respects maxTeeth for each quadrant", () => {
		const chart = create(<NativeOdontogram maxTeeth={5} />);

		expect(getInteractiveTeeth(chart.root)).toHaveLength(20);
	});

	it("toggles selection and emits detailed onChange payloads", () => {
		const onChange = vi.fn();
		const chart = create(<NativeOdontogram onChange={onChange} />);
		const tooth = getTooth(chart.root, "Tooth 11");

		act(() => {
			tooth.props.onPress();
		});

		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenLastCalledWith([
			{
				id: "teeth-11",
				notations: {
					fdi: "11",
					universal: "8",
					palmer: "1UR",
				},
				type: "Central Incisor",
			},
		]);
		expect(getTooth(chart.root, "Tooth 11").props.accessibilityState).toEqual({
			disabled: false,
			selected: true,
		});

		act(() => {
			getTooth(chart.root, "Tooth 11").props.onPress();
		});

		expect(onChange).toHaveBeenCalledTimes(2);
		expect(onChange).toHaveBeenLastCalledWith([]);
	});

	it("limits selection to one tooth in singleSelect mode", () => {
		const onChange = vi.fn();
		const chart = create(
			<NativeOdontogram onChange={onChange} singleSelect={true} />,
		);

		act(() => {
			getTooth(chart.root, "Tooth 11").props.onPress();
		});
		act(() => {
			getTooth(chart.root, "Tooth 12").props.onPress();
		});

		expect(getTooth(chart.root, "Tooth 11").props.accessibilityState).toEqual({
			disabled: false,
			selected: false,
		});
		expect(getTooth(chart.root, "Tooth 12").props.accessibilityState).toEqual({
			disabled: false,
			selected: true,
		});
		expect(onChange).toHaveBeenLastCalledWith([
			expect.objectContaining({ id: "teeth-12" }),
		]);
	});

	it("does not expose press handlers in readOnly mode", () => {
		const onChange = vi.fn();
		const chart = create(
			<NativeOdontogram onChange={onChange} readOnly={true} />,
		);
		const tooth = chart.root.findByProps({ accessibilityLabel: "Tooth 11" });

		expect(tooth.props.accessibilityRole).toBe("image");
		expect(tooth.props.accessibilityState).toEqual({
			disabled: true,
			selected: false,
		});
		expect(tooth.props.onPress).toBeUndefined();
		expect(onChange).not.toHaveBeenCalled();
	});

	it("uses condition colors and renders condition labels", () => {
		const chart = create(
			<NativeOdontogram
				showLabels={true}
				teethConditions={[
					{
						fillColor: "#ef4444",
						label: "caries",
						outlineColor: "#b91c1c",
						teeth: ["teeth-11"],
					},
				]}
			/>,
		);
		const toothPaths = getTooth(chart.root, "Tooth 11").findAllByProps({
			testID: "Path",
		});

		expect(toothPaths[0].props.stroke).toBe("#b91c1c");
		expect(toothPaths[1].props.fill).toBe("#ef4444");
		expect(chart.root.findByProps({ testID: "Rect" }).props.fill).toBe(
			"#ef4444",
		);
		expect(chart.root.findByProps({ testID: "Text" }).children).toEqual([
			"caries",
		]);
		expect(getSvgNode(chart.root).props.viewBox).toBe("0 0 409 722");
	});

	it("supports square layout and alternate notation labels", () => {
		const chart = create(
			<NativeOdontogram layout="square" notation="Universal" />,
		);

		expect(getSvgNode(chart.root).props.viewBox).toBe("0 0 900 150");
		expect(getTooth(chart.root, "Tooth 8")).toBeTruthy();
	});
});
