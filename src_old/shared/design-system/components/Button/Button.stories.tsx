/**
 * ButtonコンポーネントのStorybook
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Design System/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    fullWidth: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 基本的なバリエーション
export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger Button',
  },
};

// サイズバリエーション
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    children: 'Medium Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

// 状態
export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading...',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

// アイコン付き
export const WithLeftIcon: Story = {
  args: {
    icon: <span>🚀</span>,
    iconPosition: 'left',
    children: 'Launch',
  },
};

export const WithRightIcon: Story = {
  args: {
    icon: <span>→</span>,
    iconPosition: 'right',
    children: 'Next',
  },
};

// フルワイド
export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

// すべてのバリエーションを表示
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Button variant="primary" size="sm">Small Primary</Button>
        <Button variant="primary" size="md">Medium Primary</Button>
        <Button variant="primary" size="lg">Large Primary</Button>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Button variant="secondary" size="sm">Small Secondary</Button>
        <Button variant="secondary" size="md">Medium Secondary</Button>
        <Button variant="secondary" size="lg">Large Secondary</Button>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Button variant="ghost" size="sm">Small Ghost</Button>
        <Button variant="ghost" size="md">Medium Ghost</Button>
        <Button variant="ghost" size="lg">Large Ghost</Button>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Button variant="danger" size="sm">Small Danger</Button>
        <Button variant="danger" size="md">Medium Danger</Button>
        <Button variant="danger" size="lg">Large Danger</Button>
      </div>
    </div>
  ),
};

// インタラクティブなデモ
export const Interactive: Story = {
  render: () => {
    const handleClick = () => alert('Button clicked!');
    
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button onClick={handleClick}>Click me</Button>
        <Button variant="secondary" onClick={handleClick}>
          <span>💾</span> Save
        </Button>
        <Button variant="ghost" onClick={handleClick}>
          Cancel
        </Button>
      </div>
    );
  },
};