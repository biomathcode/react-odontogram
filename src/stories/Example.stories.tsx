import type { Meta, StoryFn } from "@storybook/react-webpack5";
import Odontogram from "..";

export default {
  title: "Components/Odontogram",
  component: Odontogram,

  parameters: {
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#f5f5f5" },
        { name: "dark", value: "#0b0d1a" },
      ],
    },
  },
  args: {
    styles: {
      maxWidth: '300px',
    }
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
    onChange: { action: "changed" },

  },
} as Meta<typeof Odontogram>;

const Template: StoryFn<typeof Odontogram> = (args) => <Odontogram {...args} />;

export const Light = Template.bind({});
Light.args = {
  theme: "light",
  colors: {},
  defaultSelected: ["teeth-11", "teeth-12", "teeth-22"],
  onChange: (selected) => {
    alert(JSON.stringify(selected));
  },
  tooltip: {
    margin: -10,
    placement: "top"
  }
};



const DarkTemplate: StoryFn<typeof Odontogram> = (args) =>
  <div className="dark-template">
    <Odontogram {...args} />
  </div>
  ;


export const Dark = DarkTemplate.bind({});
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

export const WithCustomTooltip = Template.bind({});
WithCustomTooltip.args = {
  theme: "light",
  colors: {},
  tooltip: {
    placement: "top",
    content: (payload) => (
      <div
        style={{
          padding: "8px 12px",
          borderRadius: "6px",
          background: "#333",
          color: "#fff",
          fontSize: "13px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        }}
      >
        <strong>Tooth #{payload?.notations?.fdi}</strong>
        <br />
        Type: {payload?.type}
      </div>
    ),
  },
  defaultSelected: ["teeth-11"],
};
WithCustomTooltip.storyName = "Custom Tooltip";

export const WithoutTooltip = Template.bind({});
WithoutTooltip.args = {
  theme: "light",
  colors: {},
  defaultSelected: ["teeth-11", "teeth-21"],
  showTooltip: false, // 👈 No tooltip prop passed
};
WithoutTooltip.storyName = "Without Tooltip";

export const UpperHalf = Template.bind({});
UpperHalf.args = {
  theme: "light",
  colors: {},
  defaultSelected: ["teeth-11", "teeth-21"],
  showTooltip: true, // 👈 No tooltip prop passed
  showHalf: "upper",
};
UpperHalf.storyName = "UpperHalf";

export const LowerHalf = Template.bind({});
LowerHalf.args = {
  theme: "light",
  colors: {},
  defaultSelected: ["teeth-11", "teeth-21"],
  showTooltip: true, // 👈 No tooltip prop passed
  showHalf: "lower",
};
LowerHalf.storyName = "LowerHalf";



