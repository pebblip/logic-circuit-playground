import type { Gate, CustomGateDefinition } from './circuit';

// Re-export for convenience
export type { GateType, CustomGateDefinition } from './circuit';

// ゲートタイプの詳細定義
export type BasicGateType = 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR';
export type IOGateType = 'INPUT' | 'OUTPUT';
export type SpecialGateType = 'CLOCK' | 'D-FF' | 'SR-LATCH' | 'MUX' | 'BINARY_COUNTER';
export type CustomGateType = 'CUSTOM';
export type AllGateType =
  | BasicGateType
  | IOGateType
  | SpecialGateType
  | CustomGateType;

// 特殊ゲートのインターフェース
export interface ClockGate extends Gate {
  type: 'CLOCK';
  frequency: number; // Hz
  isRunning: boolean;
  lastToggleTime: number;
}

export interface DFlipFlopGate extends Gate {
  type: 'D-FF';
  clockEdge: 'rising' | 'falling';
  previousClockState: boolean;
  qOutput: boolean;
  qBarOutput: boolean;
}

export interface SRLatchGate extends Gate {
  type: 'SR-LATCH';
  qOutput: boolean;
  qBarOutput: boolean;
}

export interface MuxGate extends Gate {
  type: 'MUX';
  dataInputs: string[]; // 2, 4, or 8 inputs
  selectInputs: string[]; // 1, 2, or 3 select lines
}

export interface BinaryCounterGate extends Gate {
  type: 'BINARY_COUNTER';
  bitCount: number; // 1, 2, 4, or 8 bits
  currentValue: number;
  previousClockState: boolean;
}

export interface CustomGate extends Gate {
  type: 'CUSTOM';
  customGateDefinition: CustomGateDefinition;
}

// ゲートサイズ定義
export const GATE_SIZES = {
  // 基本ゲート
  AND: { width: 70, height: 50 },
  OR: { width: 70, height: 50 },
  NOT: { width: 70, height: 50 },
  XOR: { width: 70, height: 50 },
  NAND: { width: 70, height: 50 },
  NOR: { width: 70, height: 50 },

  // 入出力
  INPUT: { width: 50, height: 30 },
  OUTPUT: { width: 40, height: 40 },

  // 特殊ゲート
  CLOCK: { width: 80, height: 80 }, // 円形
  'D-FF': { width: 100, height: 80 },
  'SR-LATCH': { width: 100, height: 80 },
  MUX: { width: 100, height: 100 },
  BINARY_COUNTER: { width: 120, height: 100 },

  // カスタムゲート（デフォルト、実際は可変）
  CUSTOM: { width: 100, height: 80 },
} as const;

// ピン配置定義
export const PIN_CONFIGS = {
  // 基本ゲート
  AND: { inputs: 2, outputs: 1 },
  OR: { inputs: 2, outputs: 1 },
  NOT: { inputs: 1, outputs: 1 },
  XOR: { inputs: 2, outputs: 1 },
  NAND: { inputs: 2, outputs: 1 },
  NOR: { inputs: 2, outputs: 1 },

  // 入出力
  INPUT: { inputs: 0, outputs: 1 },
  OUTPUT: { inputs: 1, outputs: 0 },

  // 特殊ゲート
  CLOCK: { inputs: 0, outputs: 1 },
  'D-FF': { inputs: 2, outputs: 2 }, // D, CLK -> Q, Q̄
  'SR-LATCH': { inputs: 2, outputs: 2 }, // S, R -> Q, Q̄
  MUX: { inputs: -1, outputs: 1 }, // 可変
  BINARY_COUNTER: { inputs: 1, outputs: -1 }, // CLK入力, ビット数分の出力

  // カスタムゲート（可変）
  CUSTOM: { inputs: -1, outputs: -1 }, // 可変
} as const;

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

export function isBinaryCounterGate(gate: Gate): gate is BinaryCounterGate {
  return gate.type === 'BINARY_COUNTER';
}

export function isCustomGate(gate: Gate): gate is CustomGate {
  return gate.type === 'CUSTOM';
}
