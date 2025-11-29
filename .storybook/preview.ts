import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-webpack5";
import "../src/styles.css";

export const decorators = [
	withThemeByClassName({
		themes: {
			light: "light",
			dark: "dark",
		},
		defaultTheme: "light",
	}),
];

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/,
			},
		},
	},
};

export default preview;
