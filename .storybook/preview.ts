import type { Preview } from "@storybook/react";
import { withThemeByClassName } from '@storybook/addon-themes';


export const decorators = [
	withThemeByClassName({
		themes: {
			light: 'light-theme',
			dark: 'dark-theme',
		},
		defaultTheme: 'light',
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
