import renderer from "react-test-renderer";
import { expect, it } from "vitest";
import { Example } from "../src";

it("renders correctly", () => {
	const tree = renderer
		.create(<Example />)
		.toJSON();
	expect(tree).toMatchSnapshot();
});
