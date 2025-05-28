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
  
  // カスタムゲート
  CUSTOM = 'CUSTOM'
}

export interface GateData {
  id: ID;
  type: GateType;
  position: Position;
  inputs: Pin[];
  outputs: Pin[];
  customType?: string; // カスタムゲートの場合の名前
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