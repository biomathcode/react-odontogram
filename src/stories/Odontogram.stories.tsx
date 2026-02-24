import type { Meta, StoryObj } from '@storybook/react-webpack5';
import Odontogram from '../Odontogram';

const meta = {
  component: Odontogram,
  title: 'Read Only Odontogram',

  args: {
    showTooltip: false,
    layout: 'circle',
    readOnly: true,
    showLabels: true,
    styles: {
      maxWidth: '300px'
    }
  },

  argTypes: {
    teethConditions: { control: 'object' },
    showTooltip: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    showLabels: { control: 'boolean' },
    layout: { control: 'select', options: ['circle', 'linear'] },
  },
} satisfies Meta<typeof Odontogram>;

export default meta;

type Story = StoryObj<typeof meta>;

const Wrapper = (args: any) => (
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
    <Odontogram {...args} />
  </div>
);

/* ------------------ STORIES ------------------ */

export const Default: Story = {
  render: Wrapper,
  args: {
    teethConditions: [
      {
        label: 'yellowing',
        teeth: ['teeth-11', 'teeth-12', 'teeth-13'],
        fillColor: '#fde047',
        outlineColor: '#ca8a04',
      },
      {
        label: 'caries',
        teeth: ['teeth-16', 'teeth-26'],
        fillColor: '#ef4444',
        outlineColor: '#ef4444',
      },
    ],
  },
};

export const NoConditions: Story = {
  render: Wrapper,
  args: {
    teethConditions: [],
    showLabels: false,
  },
};

export const FullMouthCaries: Story = {
  render: Wrapper,
  args: {
    teethConditions: [
      {
        label: 'caries',
        teeth: Array.from({ length: 32 }, (_, i) => `teeth-${i + 1}`),
        fillColor: '#ef4444',
        outlineColor: '#b91c1c',
      },
    ],
  },
};

export const MixedConditions: Story = {
  render: Wrapper,
  args: {
    teethConditions: [
      {
        label: 'caries',
        teeth: ['teeth-16', 'teeth-17', 'teeth-36', 'teeth-37'],
        fillColor: '#ef4444',
        outlineColor: '#b91c1c',
      },
      {
        label: 'filling',
        teeth: ['teeth-14', 'teeth-24'],
        fillColor: '#60a5fa',
        outlineColor: '#2563eb',
      },
      {
        label: 'missing',
        teeth: ['teeth-18', 'teeth-28'],
        fillColor: '#e5e7eb',
        outlineColor: '#6b7280',
      },
    ],
  },
};


export const SquareLayout: Story = {
  render: Wrapper,
  args: {
    layout: 'square',
    styles: {
      maxWidth: '800px',
    },
    teethConditions: [
      {
        label: 'yellowing',
        teeth: ['teeth-31', 'teeth-32', 'teeth-33'],
        fillColor: '#fde047',
        outlineColor: '#ca8a04',
      },
    ],
  },
};

export const ReadWriteMode: Story = {
  render: Wrapper,
  args: {
    readOnly: false,
    showTooltip: true,
    teethConditions: [
      {
        label: 'selected',
        teeth: ['teeth-21'],
        fillColor: '#34d399',
        outlineColor: '#059669',
      },
    ],
  },
};