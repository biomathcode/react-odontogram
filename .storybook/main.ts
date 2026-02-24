import type { StorybookConfig } from "@storybook/react-webpack5";
const config: StorybookConfig = {
	stories: ["../src/**/*.stories.@(js|jsx|ts|tsx|mdx)"],

	addons: [
		"@storybook/addon-a11y",
		"@storybook/addon-links",
		"@storybook/addon-webpack5-compiler-swc",
		"@storybook/addon-themes",
		"@storybook/addon-docs",
	],

	framework: {
		name: "@storybook/react-webpack5",
		options: {
			builder: {
				useSWC: true,
			},
		},
	},

	swc: () => ({
		jsc: {
			transform: {
				react: {
					runtime: "automatic",
				},
			},
		},
	}),
};
export default config;
