// 特殊ゲートの型定義
// metadata: anyを排除し、型安全性を向上

import type { Gate } from './circuit';

// CLOCKゲートのメタデータ
export interface ClockMetadata {
  frequency: number; // Hz
  isRunning: boolean;
  startTime: number;
  lastToggleTime?: number;
  [key: string]: unknown; // index signature for compatibility
}

// D-FFゲートのメタデータ
export interface DFlipFlopMetadata {
  clockEdge: 'rising' | 'falling';
  previousClockState: boolean;
  qOutput: boolean;
  qBarOutput: boolean;
  isFirstEvaluation?: boolean; // 必要に応じて明示的に追加
}

// SR-LATCHゲートのメタデータ
export interface SRLatchMetadata {
  qOutput: boolean;
  qBarOutput: boolean;
  previousS?: boolean;
  previousR?: boolean;
}

// MUXゲートのメタデータ
export interface MuxMetadata {
  dataInputCount: 2 | 4 | 8;
  selectedInput: number;
}

// 特殊ゲートの型定義
export interface ClockGate extends Omit<Gate, 'metadata'> {
  type: 'CLOCK';
  metadata: ClockMetadata;
}

export interface DFlipFlopGate extends Omit<Gate, 'metadata'> {
  type: 'D-FF';
  metadata: DFlipFlopMetadata;
}

export interface SRLatchGate extends Omit<Gate, 'metadata'> {
  type: 'SR-LATCH';
  metadata: SRLatchMetadata;
}

export interface MuxGate extends Omit<Gate, 'metadata'> {
  type: 'MUX';
  metadata: MuxMetadata;
}

// 型ガード関数
export function isClockGate(gate: Gate): gate is ClockGate {
  return gate.type === 'CLOCK';
}

export function isDFlipFlopGate(gate: Gate): gate is DFlipFlopGate {
  return gate.type === 'D-FF';
}

export function isSRLatchGate(gate: Gate): gate is SRLatchGate {
  return gate.type === 'SR-LATCH';
}

export function isMuxGate(gate: Gate): gate is MuxGate {
  return gate.type === 'MUX';
}

// 特殊ゲートユニオン型
export type SpecialGate = ClockGate | DFlipFlopGate | SRLatchGate | MuxGate;

// ゲートの完全な型定義（型安全）
export type TypedGate =
  | Gate // 基本ゲート（AND, OR, NOT等）
  | ClockGate
  | DFlipFlopGate
  | SRLatchGate
  | MuxGate;

// メタデータの初期値
export const DEFAULT_METADATA = {
  CLOCK: {
    frequency: 1,
    isRunning: false,
    startTime: Date.now(),
  } as ClockMetadata,

  'D-FF': {
    clockEdge: 'rising',
    previousClockState: false,
    qOutput: false,
    qBarOutput: false,
  } as DFlipFlopMetadata,

  'SR-LATCH': {
    qOutput: false,
    qBarOutput: true,
  } as SRLatchMetadata,

  MUX: {
    dataInputCount: 2,
    selectedInput: 0,
  } as MuxMetadata,
};
