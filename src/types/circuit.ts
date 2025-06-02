// 基本的な型定義
export type GateType = 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR' | 'INPUT' | 'OUTPUT' | 'CLOCK' | 'D-FF' | 'SR-LATCH' | 'MUX' | 'CUSTOM';

export interface Position {
  x: number;
  y: number;
}

// カスタムゲート用の型定義
export interface CustomGatePin {
  name: string;
  index: number;
}

export interface CustomGateDefinition {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  inputs: CustomGatePin[];
  outputs: CustomGatePin[];
  truthTable: Record<string, string>; // 入力パターン -> 出力パターン
  icon?: string; // 表示用アイコン（絵文字）
  category?: string;
  width: number;
  height: number;
  createdAt: number;
  updatedAt: number;
}

export interface Gate {
  id: string;
  type: GateType;
  position: Position;
  inputs: string[];  // 入力ピンの状態
  output: boolean;   // 出力ピンの状態
  metadata?: any;    // 特殊ゲート用の追加データ（後方互換性のため）
  customGateDefinition?: CustomGateDefinition; // カスタムゲート用定義
}

export interface Wire {
  id: string;
  from: {
    gateId: string;
    pinIndex: number;
  };
  to: {
    gateId: string;
    pinIndex: number;
  };
  isActive: boolean;
}

export interface CircuitState {
  gates: Gate[];
  wires: Wire[];
  selectedGateId: string | null;
  isDrawingWire: boolean;
  wireStart: { gateId: string; pinIndex: number; position: Position } | null;
  customGates: CustomGateDefinition[];
}