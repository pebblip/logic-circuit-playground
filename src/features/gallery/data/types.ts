/**
 * ギャラリー回路の型定義
 */

import type { EvaluationCircuit } from '@/domain/simulation/core/types';

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
}

/**
 * ギャラリー回路（メタデータ付きEvaluationCircuit）
 */
export interface GalleryCircuit
  extends EvaluationCircuit,
    GalleryCircuitMetadata {}
