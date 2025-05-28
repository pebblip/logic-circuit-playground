export type CircuitMode = 'discovery' | 'sandbox' | 'challenge';

export interface ModeConfig {
  id: CircuitMode;
  name: string;
  description: string;
  icon: string;
  features?: ModeFeatures;
}

export interface ModeFeatures {
  availableGates: string[];
  allowCustomGates: boolean;
  showHints: boolean;
  trackDiscoveries: boolean;
  unlockCondition?: () => boolean;
}

export const MODE_CONFIGS: Record<CircuitMode, ModeConfig> = {
  discovery: {
    id: 'discovery',
    name: '探検モード',
    description: '論理ゲートの世界を探検しよう！',
    icon: '🔍',
    features: {
      availableGates: ['AND', 'OR', 'NOT', 'XOR'],
      allowCustomGates: false,
      showHints: true,
      trackDiscoveries: true,
    }
  },
  sandbox: {
    id: 'sandbox', 
    name: '実験室モード',
    description: '自由に回路を作って実験しよう！',
    icon: '🧪',
    features: {
      availableGates: [], // すべて利用可能
      allowCustomGates: true,
      showHints: false,
      trackDiscoveries: false,
    }
  },
  challenge: {
    id: 'challenge',
    name: 'チャレンジモード',
    description: 'パズルに挑戦して新しい発見を！',
    icon: '🏆',
    features: {
      availableGates: [], // チャレンジごとに設定
      allowCustomGates: false,
      showHints: false,
      trackDiscoveries: true,
    }
  }
};

export const DEFAULT_MODE: CircuitMode = 'discovery';