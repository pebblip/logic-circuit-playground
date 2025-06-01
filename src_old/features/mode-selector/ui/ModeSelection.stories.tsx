import type { Meta, StoryObj } from '@storybook/react';
import { ModeSelection } from './ModeSelection';
import { action } from '@storybook/addon-actions';

const meta = {
  title: 'Components/ModeSelection',
  component: ModeSelection,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'アプリケーション起動時に表示されるモード選択画面。ユーザーの経験レベルに応じて3つのモードから選択できます。',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ModeSelection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onModeSelect: action('onModeSelect'),
  },
};

export const WithAnimation: Story = {
  args: {
    onModeSelect: action('onModeSelect'),
  },
  parameters: {
    docs: {
      description: {
        story: 'カードが順番にフェードインするアニメーション付きバージョン',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // アニメーションが完了するまで待機
    await new Promise(resolve => setTimeout(resolve, 1000));
  },
};

export const MobileView: Story = {
  args: {
    onModeSelect: action('onModeSelect'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'モバイル画面でのレイアウト。カードが縦に並びます。',
      },
    },
  },
};

export const TabletView: Story = {
  args: {
    onModeSelect: action('onModeSelect'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'タブレット画面でのレイアウト',
      },
    },
  },
};

export const InteractionExample: Story = {
  args: {
    onModeSelect: (mode) => {
      alert(`Selected mode: ${mode}`);
      action('onModeSelect')(mode);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'カードをクリックすると選択したモードがアラートで表示されます',
      },
    },
  },
};