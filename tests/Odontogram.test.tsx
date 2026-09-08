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

	it("renders correct teeth and transforms for all FDI quadrants (Q1, Q2, Q4, Q3)", () => {
		render(<Odontogram layout="square" />);

		const q1Tooth = screen.getByRole("option", { name: "Tooth 11" });
		expect(q1Tooth.closest("g[transform]")).toHaveAttribute("transform", "");

		const q2Tooth = screen.getByRole("option", { name: "Tooth 21" });
		expect(q2Tooth.closest("g[transform]")).toHaveAttribute(
			"transform",
			"translate(840, 0) scale(-1, 1) translate(-55,0)",
		);

		const q4Tooth = screen.getByRole("option", { name: "Tooth 41" });
		expect(q4Tooth.closest("g[transform]")).toHaveAttribute(
			"transform",
			"scale(1, -1) translate(0, -150)",
		);

		const q3Tooth = screen.getByRole("option", { name: "Tooth 31" });
		expect(q3Tooth.closest("g[transform]")).toHaveAttribute(
			"transform",
			"translate(840, 0) scale(-1, -1) translate(-55,-150)",
		);
	});

	it("renders lower jaw teeth (31-38 and 41-48) when showHalf='lower'", () => {
		render(<Odontogram showHalf="lower" />);

		expect(
			screen.getByRole("option", { name: "Tooth 41" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("option", { name: "Tooth 48" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("option", { name: "Tooth 31" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("option", { name: "Tooth 38" }),
		).toBeInTheDocument();

		expect(
			screen.queryByRole("option", { name: "Tooth 11" }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("option", { name: "Tooth 21" }),
		).not.toBeInTheDocument();
	});

	it("renders upper jaw teeth (11-18 and 21-28) when showHalf='upper'", () => {
		render(<Odontogram showHalf="upper" />);

		expect(
			screen.getByRole("option", { name: "Tooth 11" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("option", { name: "Tooth 18" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("option", { name: "Tooth 21" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("option", { name: "Tooth 28" }),
		).toBeInTheDocument();

		expect(
			screen.queryByRole("option", { name: "Tooth 41" }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("option", { name: "Tooth 31" }),
		).not.toBeInTheDocument();
	});

	it("handles lower tooth selection and onChange with correct FDI payloads", () => {
		const onChange = vi.fn();
		const { container } = render(
			<Odontogram showHalf="lower" onChange={onChange} />,
		);

		const tooth48 = screen.getByRole("option", { name: "Tooth 48" });
		fireEvent.click(tooth48);

		expect(tooth48).toHaveAttribute("aria-selected", "true");
		expect(container.querySelector("input[type='hidden']")).toHaveValue(
			'["teeth-48"]',
		);
		expect(onChange).toHaveBeenLastCalledWith([
			expect.objectContaining({
				id: "teeth-48",
				notations: { fdi: "48", universal: "32", palmer: "8LR" },
			}),
		]);
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
