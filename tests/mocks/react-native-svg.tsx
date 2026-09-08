import { type ReactNode, createElement } from "react";

type SvgMockProps = {
	children?: ReactNode;
	[key: string]: unknown;
};

const createSvgMock =
	(type: string) =>
	({ children, ...props }: SvgMockProps) =>
		createElement(type, props, children);

const Svg = createSvgMock("Svg");

export const G = createSvgMock("G");
export const Path = createSvgMock("Path");
export const Rect = createSvgMock("Rect");
export const Text = createSvgMock("Text");

export default Svg;
