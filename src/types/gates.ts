import type { Gate, CustomGateDefinition } from './circuit';

// Re-export for convenience
export type { GateType, CustomGateDefinition } from './circuit';

// ゲートタイプの詳細定義
export type BasicGateType = 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR';
export type IOGateType = 'INPUT' | 'OUTPUT';
export type SpecialGateType =
  | 'CLOCK'
  | 'D-FF'
  | 'SR-LATCH'
  | 'MUX'
  | 'BINARY_COUNTER'
  | 'LED';
export type CustomGateType = 'CUSTOM';
export type AllGateType =
  | BasicGateType
  | IOGateType
  | SpecialGateType
  | CustomGateType;

// 特殊ゲートのインターフェース
// NOTE: 実際のゲート実装では、これらの属性はmetadataフィールド内に格納されています
export interface ClockGate extends Gate {
  type: 'CLOCK';
  metadata?: {
    frequency?: number;
    isRunning?: boolean;
    lastToggleTime?: number;
    startTime?: number;
  };
}

export interface DFlipFlopGate extends Gate {
  type: 'D-FF';
  metadata?: {
    clockEdge?: 'rising' | 'falling';
    previousClockState?: boolean;
    qOutput?: boolean;
    qBarOutput?: boolean;
  };
}

export interface SRLatchGate extends Gate {
  type: 'SR-LATCH';
  metadata?: {
    qOutput?: boolean;
    qBarOutput?: boolean;
  };
}

export interface MuxGate extends Gate {
  type: 'MUX';
  metadata?: {
    dataInputCount?: 2 | 4 | 8;
    selectedInput?: number;
  };
}

export interface BinaryCounterGate extends Gate {
  type: 'BINARY_COUNTER';
  metadata?: {
    bitCount?: number;
    currentValue?: number;
    previousClockState?: boolean;
  };
}

export interface LEDGateData {
  bitWidth: number; // 1-16 任意のピン数
  displayMode: 'binary' | 'decimal' | 'both' | 'hex';
}

export interface LEDGate extends Gate {
  type: 'LED';
  gateData: LEDGateData;
}

export interface CustomGate extends Gate {
  type: 'CUSTOM';
  customGateDefinition: CustomGateDefinition;
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

export function isBinaryCounterGate(gate: Gate): gate is BinaryCounterGate {
  return gate.type === 'BINARY_COUNTER';
}

export function isLEDGate(gate: Gate): gate is LEDGate {
  return gate.type === 'LED';
}

export function isCustomGate(gate: Gate): gate is CustomGate {
  return gate.type === 'CUSTOM';
}
