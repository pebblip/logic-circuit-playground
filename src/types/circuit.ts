// 基本的な型定義
export type GateType = 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR' | 'INPUT' | 'OUTPUT' | 'CLOCK' | 'D-FF' | 'SR-LATCH' | 'MUX';

export interface Position {
  x: number;
  y: number;
}

export interface Gate {
  id: string;
  type: GateType;
  position: Position;
  inputs: string[];  // 入力ピンの状態
  output: boolean;   // 出力ピンの状態
  metadata?: any;    // 特殊ゲート用の追加データ（後方互換性のため）
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
}