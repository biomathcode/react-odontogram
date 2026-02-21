import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Odontogram, {
  convertFDIToNotation,
  getToothNotations,
  mapToCssVars,
} from "../src/Odontogram";

describe("Odontogram", () => {
  it("renders all permanent teeth by default", () => {
    render(<Odontogram />);

    expect(
      screen.getByRole("listbox", { name: "Odontogram" })
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
    const { container } = render(<Odontogram onChange={onChange} />);
    const tooth = screen.getByLabelText("Tooth 11");

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
      "input[type='hidden'][name='teeth']"
    );
    expect(hiddenInput?.value).toBe(JSON.stringify(["teeth-11"]));

    fireEvent.click(tooth);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("supports keyboard selection with Enter and Space", () => {
    render(<Odontogram />);
    const tooth = screen.getByLabelText("Tooth 12");

    fireEvent.keyDown(tooth, { key: "Enter" });
    expect(tooth).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(tooth, { key: " " });
    expect(tooth).toHaveAttribute("aria-selected", "false");
  });

  it("does not render tooltip when showTooltip is false", () => {
    render(<Odontogram showTooltip={false} />);
    const tooth = screen.getByLabelText("Tooth 11");

    fireEvent.mouseEnter(tooth);

    expect(screen.queryByText(/Universal:/)).not.toBeInTheDocument();
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
      })
    ).toEqual({
      "--dark-blue": "#1",
      "--base-blue": "#2",
    });
  });
});
