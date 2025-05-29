/**
 * ゲート関連の型定義
 */

import { ID, Position, Pin } from './common';

export enum GateType {
  // 基本ゲート
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
  NAND = 'NAND',
  NOR = 'NOR',
  XOR = 'XOR',
  XNOR = 'XNOR',
  
  // 演算ゲート
  HALF_ADDER = 'HALF_ADDER',
  FULL_ADDER = 'FULL_ADDER',
  ADDER_4BIT = 'ADDER_4BIT',
  
  // 数値入出力
  NUMBER_4BIT_INPUT = 'NUMBER_4BIT_INPUT',
  NUMBER_4BIT_DISPLAY = 'NUMBER_4BIT_DISPLAY',
  
  // 記憶素子
  D_FLIP_FLOP = 'D_FLIP_FLOP',
  SR_LATCH = 'SR_LATCH',
  REGISTER_4BIT = 'REGISTER_4BIT',
  
  // マルチプレクサ
  MUX_2TO1 = 'MUX_2TO1',
  
  // カスタムゲート
  CUSTOM = 'CUSTOM',
  
  // 特殊ゲート
  CLOCK = 'CLOCK'
}

export interface GateData {
  id: ID;
  type: GateType | string;
  position: Position;
  inputs: Pin[];
  outputs: Pin[];
  customType?: string; // カスタムゲートの場合の名前
  // UltraModernGateとの互換性のため追加
  x?: number;
  y?: number;
}

export interface CustomGateDefinition {
  name: string;
  description?: string;
  category?: string;
  inputs: Array<{
    id: ID;
    name: string;
    position: number;
  }>;
  outputs: Array<{
    id: ID;
    name: string;
    position: number;
  }>;
  circuit: {
    gates: GateData[];
    connections: ConnectionData[];
  };
  metadata?: {
    createdAt: number;
    updatedAt: number;
    version: number;
  };
}

export interface ConnectionData {
  id: ID;
  from: ID;
  fromOutput?: number;
  to: ID;
  toInput?: number;
}