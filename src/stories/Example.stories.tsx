import type { Meta, StoryFn } from "@storybook/react";
import Odontogram from ".."; // your component file

export default {
	title: "Components/Odontogram",
	component: Odontogram,
} as Meta<typeof Odontogram>;

const Template: StoryFn<typeof Odontogram> = (args) => <Odontogram {...args} />;

export const Default = Template.bind({});
Default.args = {
	defaultSelected: ["teeth-11", "teeth-12", "teeth-22"],
};
