// Circuit constants placeholder
export const GRID_SIZE = 20;
export const PIN_RADIUS = 6;
export const GATE_DEFAULT_SIZE = {
  width: 50,
  height: 50,
} as const;

export const WIRE_COLORS = {
  OFF: '#666666',
  ON: '#00ff88',
  SELECTED: '#3b82f6',
} as const;

// InfoPanel用の定数
export const LEVELS: Record<number, { name: string; description: string }> = {
  1: { name: '基本ゲート', description: 'AND, OR, NOTゲートの使い方を学びます' },
  2: { name: '応用ゲート', description: 'NAND, NOR, XORゲートとメモリ要素' },
  3: { name: '演算回路', description: '加算器などの実用的な回路' }
};

export const TABS = {
  reference: { id: 'reference', label: 'リファレンス' },
  tutorial: { id: 'tutorial', label: 'チュートリアル' },
  timing: { id: 'timing', label: 'タイミング' },
  truth: { id: 'truth', label: '真理値表' }
};

export const GATE_TYPES: Record<string, { name: string }> = {
  AND: { name: 'ANDゲート' },
  OR: { name: 'ORゲート' },
  NOT: { name: 'NOTゲート' },
  NAND: { name: 'NANDゲート' },
  NOR: { name: 'NORゲート' },
  XOR: { name: 'XORゲート' },
  XNOR: { name: 'XNORゲート' },
  INPUT: { name: '入力' },
  OUTPUT: { name: '出力' },
  CLOCK: { name: 'クロック' },
  SR_LATCH: { name: 'SRラッチ' },
  D_FF: { name: 'Dフリップフロップ' },
  HALF_ADDER: { name: '半加算器' },
  FULL_ADDER: { name: '全加算器' }
};