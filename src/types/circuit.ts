import type { LEDGateData } from './gates';

// 基本的な型定義
export type GateType =
  | 'AND'
  | 'OR'
  | 'NOT'
  | 'XOR'
  | 'NAND'
  | 'NOR'
  | 'XNOR'
  | 'INPUT'
  | 'OUTPUT'
  | 'CLOCK'
  | 'D-FF'
  | 'SR-LATCH'
  | 'MUX'
  | 'BINARY_COUNTER'
  | 'LED'
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

// ゲートのメタデータ型定義
export interface GateMetadata {
  // CLOCKゲート用
  isRunning?: boolean;
  frequency?: number;
  previousClockState?: boolean;
  startTime?: number;
  lastToggleTime?: number;

  // D-FFゲート用
  qOutput?: boolean;
  qBarOutput?: boolean;
  clockEdge?: 'rising' | 'falling';
  isFirstEvaluation?: boolean;

  // SR-LATCH用
  previousS?: boolean;
  previousR?: boolean;

  // MUX用
  dataInputCount?: 2 | 4 | 8;
  selectedInput?: number;

  // カウンター/特殊ゲート用
  bitCount?: number;
  maxValue?: number;
  currentValue?: number; // BINARY_COUNTER用の現在値

  // ストレージメタデータ用
  author?: string;
  createdAt?: number;
  description?: string;
  name?: string;
  tags?: string[];
  thumbnail?: string;
  updatedAt?: number;
  id?: string;
  validationTimeMs?: number;

  // 注意: [key: string]: unknown; は削除済み
  // 新しいプロパティは明示的に追加すること
}

export interface Gate {
  id: string;
  type: GateType;
  position: Position;
  inputs: readonly boolean[]; // 型安全: 不変boolean配列で統一
  outputs: readonly boolean[]; // 型安全: 不変複数出力対応
  metadata?: GateMetadata; // 特殊ゲート用の追加データ
  customGateDefinition?: CustomGateDefinition; // カスタムゲート用定義
  timing?: GateTiming; // 遅延モード用のタイミング設定（Phase 0で追加）
  gateData?: LEDGateData; // LEDゲート等の特殊ゲート用データ
}

// 遅延モード用のタイミング設定
export interface GateTiming {
  propagationDelay?: number; // 伝播遅延（ns単位）
  riseTime?: number; // 立ち上がり時間（将来の拡張用）
  fallTime?: number; // 立ち下がり時間（将来の拡張用）
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

export interface Circuit {
  gates: Gate[];
  wires: Wire[];
}

export interface CircuitState {
  gates: Gate[];
  wires: Wire[];
  selectedGateId: string | null;
  isDrawingWire: boolean;
  wireStart: { gateId: string; pinIndex: number; position: Position } | null;
  customGates: CustomGateDefinition[];
}
