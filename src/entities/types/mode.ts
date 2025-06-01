export type AppMode = 'learning' | 'free' | 'puzzle';

export interface ModeConfig {
  id: AppMode;
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

export const MODE_CONFIGS: Record<AppMode, ModeConfig> = {
  learning: {
    id: 'learning',
    name: '📚 学習モード',
    description: 'ステップバイステップで論理回路を学ぼう！',
    icon: '📚',
    features: {
      availableGates: ['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT'],
      allowCustomGates: false,
      showHints: true,
      trackDiscoveries: true,
    }
  },
  free: {
    id: 'free', 
    name: '🎨 自由モード',
    description: '制限なしで自由に回路を創作しよう！',
    icon: '🎨',
    features: {
      availableGates: [], // すべて利用可能
      allowCustomGates: true,
      showHints: false,
      trackDiscoveries: false,
    }
  },
  puzzle: {
    id: 'puzzle',
    name: '🧩 パズルモード',
    description: 'ゲーム感覚で楽しく問題に挑戦！',
    icon: '🧩',
    features: {
      availableGates: [], // パズルごとに設定
      allowCustomGates: false,
      showHints: true,
      trackDiscoveries: true,
    }
  }
};

export const DEFAULT_MODE: AppMode = 'learning';