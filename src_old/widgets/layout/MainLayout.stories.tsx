import type { Meta, StoryObj } from '@storybook/react';
import { MainLayout } from './MainLayout';
import { action } from '@storybook/addon-actions';

const meta = {
  title: 'Components/Layout/MainLayout',
  component: MainLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'アプリケーションのメインレイアウト。ヘッダー、サイドバー、コンテンツエリアを含みます。',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MainLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const Canvas = () => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '100%',
    color: '#94a3b8',
    fontSize: '18px',
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
      <div>ゲートをドラッグ&ドロップして回路を作成</div>
    </div>
  </div>
);

export const DiscoveryMode: Story = {
  args: {
    currentMode: 'discovery',
    availableGates: ['INPUT', 'OUTPUT', 'AND', 'OR'],
    lockedGates: ['NOT', 'XOR', 'NAND', 'NOR'],
    autoSaveStatus: 'saved',
    onModeChange: action('onModeChange'),
    onSave: action('onSave'),
    onShare: action('onShare'),
    onSettings: action('onSettings'),
    onGateSelect: action('onGateSelect'),
    onCreateCustomGate: action('onCreateCustomGate'),
    children: <Canvas />,
  },
};

export const SandboxMode: Story = {
  args: {
    currentMode: 'sandbox',
    availableGates: ['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR', 'MUX', 'CLOCK', 'SR_LATCH', 'D_FLIP_FLOP'],
    lockedGates: [],
    autoSaveStatus: 'saved',
    customGates: [
      { id: 'halfAdder', name: '半加算器' },
      { id: 'fullAdder', name: '全加算器' },
      { id: 'mux4to1', name: '4to1 MUX', icon: '🔀' },
    ],
    onModeChange: action('onModeChange'),
    onSave: action('onSave'),
    onShare: action('onShare'),
    onSettings: action('onSettings'),
    onGateSelect: action('onGateSelect'),
    onCreateCustomGate: action('onCreateCustomGate'),
    children: <Canvas />,
  },
};

export const ChallengeMode: Story = {
  args: {
    currentMode: 'challenge',
    availableGates: ['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT'],
    lockedGates: ['XOR', 'NAND', 'NOR'],
    autoSaveStatus: 'saved',
    showSidebar: true,
    onModeChange: action('onModeChange'),
    onSave: action('onSave'),
    onShare: action('onShare'),
    onSettings: action('onSettings'),
    onGateSelect: action('onGateSelect'),
    children: <Canvas />,
  },
};

export const Saving: Story = {
  args: {
    ...SandboxMode.args,
    autoSaveStatus: 'saving',
  },
  parameters: {
    docs: {
      description: {
        story: '保存中の状態',
      },
    },
  },
};

export const SaveError: Story = {
  args: {
    ...SandboxMode.args,
    autoSaveStatus: 'error',
  },
  parameters: {
    docs: {
      description: {
        story: '保存エラーの状態',
      },
    },
  },
};

export const NoSidebar: Story = {
  args: {
    ...SandboxMode.args,
    showSidebar: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'サイドバーを非表示にした状態',
      },
    },
  },
};

export const MobileView: Story = {
  args: {
    ...DiscoveryMode.args,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'モバイル表示（サイドバーは折りたたまれる予定）',
      },
    },
  },
};

export const WithActiveCircuit: Story = {
  args: {
    ...SandboxMode.args,
    children: (
      <div style={{ padding: '20px' }}>
        <svg width="100%" height="100%" style={{ minHeight: '400px' }}>
          {/* 簡単な回路の例 */}
          <circle cx="100" cy="100" r="30" fill="#10b981" />
          <text x="100" y="105" textAnchor="middle" fill="white" fontSize="14">IN</text>
          
          <rect x="200" y="70" width="80" height="60" fill="#3b82f6" rx="8" />
          <text x="240" y="105" textAnchor="middle" fill="white" fontSize="14">AND</text>
          
          <circle cx="380" cy="100" r="30" fill="#f59e0b" />
          <text x="380" y="105" textAnchor="middle" fill="white" fontSize="14">OUT</text>
          
          <line x1="130" y1="100" x2="200" y2="100" stroke="#10b981" strokeWidth="2" />
          <line x1="280" y1="100" x2="350" y2="100" stroke="#10b981" strokeWidth="2" />
        </svg>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'アクティブな回路が表示されている状態',
      },
    },
  },
};