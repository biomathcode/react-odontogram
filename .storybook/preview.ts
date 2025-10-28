import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react";

export const decorators = [
	withThemeByClassName({
		themes: {
			light: "light-theme",
			dark: "dark-theme",
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
