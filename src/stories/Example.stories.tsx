import type { Meta, StoryFn } from "@storybook/react";
import Odontogram from "..";

export default {
	title: "Components/Odontogram",
	component: Odontogram,
	parameters: {
		layout: "centered",
		backgrounds: {
			default: "light",
			values: [
				{ name: "light", value: "#f5f5f5" },
				{ name: "dark", value: "#0b0d1a" },
			],
		},
	},
	argTypes: {
		theme: {
			control: "radio",
			options: ["light", "dark"],
		},
		notation: {
			control: "radio",
			options: ["FDI", "Universal", "Palmer"],
		},
		colors: {
			control: "object",
		},
	},
} as Meta<typeof Odontogram>;

const Template: StoryFn<typeof Odontogram> = (args) => (
	<Odontogram
		{...args}
		onChange={(selected) => {
			alert(JSON.stringify(selected));
		}}
	/>
);

export const Light = Template.bind({});
Light.args = {
	theme: "light",
	colors: {},
	defaultSelected: ["teeth-11", "teeth-12", "teeth-22"],
};

export const Dark = Template.bind({});
Dark.args = {
	theme: "dark",
	colors: {
		darkBlue: "#aab6ff",
		baseBlue: "#d0d5f6",
		lightBlue: "#5361e6",
	},
};

// Optional: force background to dark for dark story
Dark.parameters = {
	backgrounds: { default: "dark" },
};

export const Default = Template.bind({});
Default.args = {
	colors: {},
	defaultSelected: ["teeth-11", "teeth-12", "teeth-22"],
};
