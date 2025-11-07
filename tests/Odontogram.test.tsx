import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Odontogram from "../src/Odontogram";

describe("Odontogram Component Snapshots", () => {
	it("renders full odontogram correctly", () => {
		const { container } = render(
			<Odontogram
				theme="light"
				colors={{
					darkBlue: "#0000ff",
					baseBlue: "#8888ff",
					lightBlue: "#ccccff",
				}}
				showHalf="full"
			/>,
		);

		expect(container).toMatchSnapshot();
	});

	it("renders upper half odontogram", () => {
		const { container } = render(
			<Odontogram
				theme="light"
				colors={{
					darkBlue: "#0000ff",
					baseBlue: "#8888ff",
					lightBlue: "#ccccff",
				}}
				showHalf="upper"
			/>,
		);

		expect(container).toMatchSnapshot();
	});

	it("renders lower half odontogram", () => {
		const { container } = render(
			<Odontogram
				theme="light"
				colors={{
					darkBlue: "#0000ff",
					baseBlue: "#8888ff",
					lightBlue: "#ccccff",
				}}
				showHalf="lower"
			/>,
		);

		expect(container).toMatchSnapshot();
	});

	it("renders dark theme correctly", () => {
		const { container } = render(
			<Odontogram
				theme="dark"
				colors={{
					darkBlue: "#222222",
					baseBlue: "#444444",
					lightBlue: "#666666",
				}}
				showHalf="full"
			/>,
		);

		expect(container).toMatchSnapshot();
	});
});
