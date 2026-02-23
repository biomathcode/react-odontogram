import type { Meta, StoryObj } from '@storybook/react-webpack5';

import Odontogram from '../Odontogram';

const meta = {
  component: Odontogram,
  title: "Read Only Odontogram",
  args: {
    showTooltip: false,

    teethConditions: [
      {
        label: "yellowing",
        teeth: ["teeth-11", "teeth-12", "teeth-13"],
        fillColor: "#fde047",
        outlineColor: "#ca8a04",
      },
      {
        label: "caries",
        teeth: ["teeth-16", "teeth-26"],
        fillColor: "#ef4444",
        outlineColor: "#ef4444",
      },
    ],
    readOnly: true,
    showLabels: true,
  },


  argTypes: {
    teethConditions: {
      control: 'object'
    },
    showTooltip: {
      control: "boolean"
    },
    readOnly: {
      control: 'boolean'
    },
    showLabels: {
      control: 'boolean'
    }

  }


} satisfies Meta<typeof Odontogram>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}
    >
      {/* Odontogram */}
      <Odontogram {...args} />

    </div>
  ),
};