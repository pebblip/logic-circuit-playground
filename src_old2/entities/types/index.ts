export interface Position {
  x: number;
  y: number;
}

export interface Pin {
  id: string;
  type: 'input' | 'output';
  value: boolean;
  position?: Position; // ゲートに対する相対位置
}

export type GateType = 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR' | 'INPUT' | 'OUTPUT' | 'CLOCK' | 'D-FLIPFLOP' | 'SR-LATCH' | 'MUX';

export interface GateData {
  id: string;
  type: GateType;
  position: Position;
  inputs: Pin[];
  outputs: Pin[]; // 複数出力に対応（将来の拡張性のため）
  // ゲート固有のプロパティ
  label?: string;
  value?: boolean; // INPUT/OUTPUTゲート用
}

export interface Connection {
  id: string;
  from: {
    gateId: string;
    pinId: string;
  };
  to: {
    gateId: string;
    pinId: string;
  };
}