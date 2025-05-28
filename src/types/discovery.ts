export interface Discovery {
  id: string;
  name: string;
  description: string;
  type: 'gate_combination' | 'circuit_pattern' | 'logic_principle' | 'optimization';
  requiredGates?: string[];
  unlocksGates?: string[];
  icon: string;
  hint?: string;
  discovered: boolean;
  discoveredAt?: Date;
}

export interface DiscoveryCategory {
  id: string;
  name: string;
  icon: string;
  discoveries: Discovery[];
}

// 発見のマイルストーン
export interface Milestone {
  id: string;
  name: string;
  description: string;
  requiredDiscoveries: string[];
  reward: {
    type: 'gate' | 'mode' | 'badge';
    value: string;
  };
  achieved: boolean;
}

// 実験ノートのエントリー
export interface ExperimentEntry {
  id: string;
  timestamp: Date;
  circuit: string; // シリアライズされた回路データ
  notes: string;
  tags: string[];
  discovery?: string; // 関連する発見ID
}

// プレイヤーの進捗
export interface PlayerProgress {
  discoveries: Record<string, boolean>;
  unlockedGates: string[];
  milestones: Record<string, boolean>;
  totalExperiments: number;
  favoriteCircuits: string[];
}