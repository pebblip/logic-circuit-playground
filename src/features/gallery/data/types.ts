/**
 * ギャラリー回路の型定義
 */

import type { Gate, Wire } from '@/types/circuit';

/**
 * ギャラリー回路のメタデータ
 */
export interface GalleryCircuitMetadata {
  id: string;
  title: string;
  description: string;
  simulationConfig?: {
    needsAnimation?: boolean;
    updateInterval?: number;
    expectedBehavior?:
      | 'oscillator'
      | 'sequence_generator'
      | 'memory_circuit'
      | 'logic_gate';
    minimumCycles?: number;
    clockFrequency?: number;
  };
  /** 自動レイアウトをスキップして手動配置を保持 */
  skipAutoLayout?: boolean;
}

/**
 * ギャラリー回路（メタデータ付きCircuit）
 */
export interface GalleryCircuit extends GalleryCircuitMetadata {
  gates: Gate[];
  wires: Wire[];
}
