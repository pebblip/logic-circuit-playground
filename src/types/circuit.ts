// 基本的な型定義
export type GateType =
  | 'AND'
  | 'OR'
  | 'NOT'
  | 'XOR'
  | 'NAND'
  | 'NOR'
  | 'INPUT'
  | 'OUTPUT'
  | 'CLOCK'
  | 'D-FF'
  | 'SR-LATCH'
  | 'MUX'
  | 'CUSTOM';

export interface Position {
  x: number;
  y: number;
}

// カスタムゲート用の型定義
export interface CustomGatePin {
  name: string;
  index: number;
  gateId?: string; // 元のゲートIDを保持（フル回路から作成時）
}

export interface CustomGateDefinition {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  inputs: CustomGatePin[];
  outputs: CustomGatePin[];
  truthTable?: Record<string, string>; // オプショナルに変更
  // 内部回路構造（新規追加）
  internalCircuit?: {
    gates: Gate[];
    wires: Wire[];
    // 境界接続: 外部ピンインデックス → 内部ゲートID:ピンインデックス
    inputMappings: Record<number, { gateId: string; pinIndex: number }>;
    outputMappings: Record<number, { gateId: string; pinIndex: number }>;
  };
  // 自動分析結果
  analysis?: {
    gateCount: number;
    maxDepth: number;
    isSequential: boolean;
    criticalPath?: string[];
  };
  icon?: string;
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
  inputs: string[]; // 入力ピンの状態
  output: boolean; // 出力ピンの状態（後方互換性のため残す）
  outputs?: boolean[]; // 複数出力のサポート（カスタムゲート用）
  metadata?: any; // 特殊ゲート用の追加データ（後方互換性のため）
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
