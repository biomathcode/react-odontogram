import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Odontogram from "../src/Odontogram";
import {
	convertFDIToNotation,
	getToothNotations,
	mapToCssVars,
} from "../src/utils";

describe("Odontogram", () => {
	it("renders all permanent teeth by default", () => {
		render(<Odontogram />);

		expect(
			screen.getByRole("listbox", { name: "Odontogram" }),
		).toBeInTheDocument();

		expect(screen.getAllByRole("option")).toHaveLength(32);
	});

	it("renders only upper or lower halves when requested", () => {
		const { rerender } = render(<Odontogram showHalf="upper" />);
		expect(screen.getAllByRole("option")).toHaveLength(16);

		rerender(<Odontogram showHalf="lower" />);
		expect(screen.getAllByRole("option")).toHaveLength(16);
	});

	it("respects maxTeeth for each quadrant", () => {
		render(<Odontogram maxTeeth={5} />);
		expect(screen.getAllByRole("option")).toHaveLength(20);
	});

	it("toggles selection and emits detailed onChange payload", () => {
		const onChange = vi.fn();

		const { container } = render(
			<Odontogram onChange={onChange} readOnly={false} />,
		);

		const tooth = screen.getByRole("option", { name: "Tooth 11" });

		fireEvent.click(tooth);

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

		const hiddenInput = container.querySelector<HTMLInputElement>(
			"input[type='hidden'][name='teeth']",
		);

		expect(hiddenInput?.value).toBe(JSON.stringify(["teeth-11"]));

		fireEvent.click(tooth);

		expect(onChange).toHaveBeenCalledTimes(2);
		expect(onChange).toHaveBeenLastCalledWith([]);
	});

	it("limits selection to one tooth in singleSelect mode", () => {
		const onChange = vi.fn();

		const { container } = render(
			<Odontogram onChange={onChange} singleSelect={true} readOnly={false} />,
		);

		expect(screen.getByRole("listbox", { name: "Odontogram" })).toHaveAttribute(
			"aria-multiselectable",
			"false",
		);

		const tooth11 = screen.getByRole("option", { name: "Tooth 11" });
		const tooth12 = screen.getByRole("option", { name: "Tooth 12" });

		fireEvent.click(tooth11);
		expect(tooth11).toHaveAttribute("aria-selected", "true");
		expect(tooth12).toHaveAttribute("aria-selected", "false");

		fireEvent.click(tooth12);
		expect(tooth11).toHaveAttribute("aria-selected", "false");
		expect(tooth12).toHaveAttribute("aria-selected", "true");

		const hiddenInput = container.querySelector<HTMLInputElement>(
			"input[type='hidden'][name='teeth']",
		);

		expect(hiddenInput?.value).toBe(JSON.stringify(["teeth-12"]));
		expect(onChange).toHaveBeenLastCalledWith([
			expect.objectContaining({ id: "teeth-12" }),
		]);

		fireEvent.click(tooth12);
		expect(hiddenInput?.value).toBe(JSON.stringify([]));
		expect(onChange).toHaveBeenLastCalledWith([]);
	});

	it("keeps only first defaultSelected tooth in singleSelect mode", () => {
		render(
			<Odontogram
				singleSelect={true}
				defaultSelected={["teeth-11", "teeth-12"]}
			/>,
		);

		expect(screen.getByRole("option", { name: "Tooth 11" })).toHaveAttribute(
			"aria-selected",
			"true",
		);
		expect(screen.getByRole("option", { name: "Tooth 12" })).toHaveAttribute(
			"aria-selected",
			"false",
		);
	});

	it("supports keyboard selection with Enter and Space", () => {
		render(<Odontogram />);

		const tooth = screen.getByRole("option", { name: "Tooth 12" });

		fireEvent.keyDown(tooth, { key: "Enter" });
		expect(tooth).toHaveAttribute("aria-selected", "true");

		fireEvent.keyDown(tooth, { key: " " });
		expect(tooth).toHaveAttribute("aria-selected", "false");
	});

	it("does not render tooltip when showTooltip is false", () => {
		render(<Odontogram showTooltip={false} />);

		const tooth = screen.getByRole("option", { name: "Tooth 11" });

		fireEvent.mouseEnter(tooth);

		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
	});
});

describe("FDI quadrant positioning (Q3/Q4)", () => {
	it("renders Q3 teeth (31–38) inside the mirrored lower transform (circle layout)", () => {
		render(<Odontogram layout="circle" />);
		const tooth = screen.getByRole("option", { name: "Tooth 31" });
		const group = tooth.closest("g[transform]");
		expect(group).toHaveAttribute(
			"transform",
			"scale(-1, -1) translate(-409, -694)",
		);
	});

	it("renders Q4 teeth (41–48) inside the same-side lower transform (circle layout)", () => {
		render(<Odontogram layout="circle" />);
		const tooth = screen.getByRole("option", { name: "Tooth 41" });
		const group = tooth.closest("g[transform]");
		expect(group).toHaveAttribute("transform", "scale(1, -1) translate(0, -694)");
	});

	it("renders Q3 teeth (31–38) inside the mirrored lower transform (square layout)", () => {
		render(<Odontogram layout="square" />);
		const tooth = screen.getByRole("option", { name: "Tooth 31" });
		const group = tooth.closest("g[transform]");
		expect(group).toHaveAttribute(
			"transform",
			"translate(840, 0) scale(-1, -1) translate(-55,-150)",
		);
	});

	it("renders Q4 teeth (41–48) inside the same-side lower transform (square layout)", () => {
		render(<Odontogram layout="square" />);
		const tooth = screen.getByRole("option", { name: "Tooth 41" });
		const group = tooth.closest("g[transform]");
		expect(group).toHaveAttribute("transform", "scale(1, -1) translate(0, -150)");
	});

	it("onChange returns correct FDI codes for lower-jaw teeth", () => {
		const onChange = vi.fn();
		render(<Odontogram onChange={onChange} />);

		fireEvent.click(screen.getByRole("option", { name: "Tooth 31" }));
		expect(onChange).toHaveBeenLastCalledWith(
			expect.arrayContaining([expect.objectContaining({ id: "teeth-31" })]),
		);

		fireEvent.click(screen.getByRole("option", { name: "Tooth 41" }));
		expect(onChange).toHaveBeenLastCalledWith(
			expect.arrayContaining([expect.objectContaining({ id: "teeth-41" })]),
		);
	});
});

describe("notation helpers", () => {
	it("converts FDI notation to Universal and Palmer", () => {
		expect(convertFDIToNotation("teeth-21", "Universal")).toBe("9");
		expect(convertFDIToNotation("teeth-21", "Palmer")).toBe("1UL");
		expect(convertFDIToNotation("teeth-21", "FDI")).toBe("21");
	});

	it("returns complete notation object", () => {
		expect(getToothNotations("teeth-48")).toEqual({
			fdi: "48",
			universal: "32",
			palmer: "8LR",
		});
	});

	it("maps provided colors to css variables", () => {
		expect(
			mapToCssVars({
				darkBlue: "#1",
				baseBlue: "#2",
			}),
		).toEqual({
			"--dark-blue": "#1",
			"--base-blue": "#2",
		});
	});
});
