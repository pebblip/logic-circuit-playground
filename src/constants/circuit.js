// 回路関連の定数定義

// レベル定義
export const LEVELS = {
  1: {
    name: "基本ゲート",
    gates: ['AND', 'OR', 'NOT', 'INPUT', 'OUTPUT'],
    description: "基本的な論理ゲートを学びましょう"
  },
  2: {
    name: "メモリ要素",
    gates: ['NAND', 'NOR', 'CLOCK', 'SR_LATCH', 'D_FF'],
    description: "記憶素子とクロック信号を学びましょう"
  },
  3: {
    name: "演算回路",
    gates: ['XOR', 'HALF_ADDER', 'FULL_ADDER', 'BUS'],
    description: "加算器と演算回路を構築しましょう"
  },
  4: {
    name: "CPU要素",
    gates: ['REGISTER', 'ALU', 'MUX', 'DECODER'],
    description: "簡単なCPUを作ってみましょう"
  }
};

// ゲート種別定義
export const GATE_TYPES = {
  // レベル1: 基本ゲート
  AND: { name: 'AND', symbol: 'AND', inputs: 2, outputs: 1, func: (a, b) => a && b, level: 1 },
  OR: { name: 'OR', symbol: 'OR', inputs: 2, outputs: 1, func: (a, b) => a || b, level: 1 },
  NOT: { name: 'NOT', symbol: 'NOT', inputs: 1, outputs: 1, func: (a) => !a, level: 1 },
  INPUT: { name: '入力', symbol: 'IN', inputs: 0, outputs: 1, func: () => true, level: 1 },
  OUTPUT: { name: '出力', symbol: 'OUT', inputs: 1, outputs: 0, func: (a) => a, level: 1 },
  
  // レベル2: メモリ要素
  NAND: { name: 'NAND', symbol: 'NAND', inputs: 2, outputs: 1, func: (a, b) => !(a && b), level: 2 },
  NOR: { name: 'NOR', symbol: 'NOR', inputs: 2, outputs: 1, func: (a, b) => !(a || b), level: 2 },
  CLOCK: { name: 'クロック', symbol: 'CLK', inputs: 0, outputs: 1, func: () => true, level: 2 },
  SR_LATCH: { name: 'SRラッチ', symbol: 'SR', inputs: 2, outputs: 2, func: null, level: 2, hasMemory: true },
  D_FF: { name: 'Dフリップフロップ', symbol: 'D-FF', inputs: 2, outputs: 2, func: null, level: 2, hasMemory: true },
  
  // レベル3: 演算回路
  XOR: { name: 'XOR', symbol: 'XOR', inputs: 2, outputs: 1, func: (a, b) => a !== b, level: 3 },
  HALF_ADDER: { name: '半加算器', symbol: 'HA', inputs: 2, outputs: 2, func: null, level: 3, isComposite: true },
  FULL_ADDER: { name: '全加算器', symbol: 'FA', inputs: 3, outputs: 2, func: null, level: 3, isComposite: true },
  
  // レベル4: CPU要素（将来実装）
  REGISTER: { name: 'レジスタ', symbol: 'REG', inputs: 9, outputs: 8, func: null, level: 4, hasMemory: true },
  ALU: { name: 'ALU', symbol: 'ALU', inputs: 10, outputs: 9, func: null, level: 4, isComposite: true }
};

// UI関連の定数
export const CANVAS = {
  WIDTH: 1000,
  HEIGHT: 600,
  GRID_SIZE: 20,
  MIN_X: 50,
  MAX_X: 950,
  MIN_Y: 50,
  MAX_Y: 550
};

export const GATE_UI = {
  RECT_WIDTH: 120,
  RECT_HEIGHT: 50,
  RECT_CORNER_RADIUS: 4,
  CIRCLE_RADIUS: 35,
  TERMINAL_RADIUS: 6,
  TERMINAL_SPACING: 25,
  OUTPUT_SPACING: 20
};

// シミュレーション関連の定数
export const SIMULATION = {
  MAX_ITERATIONS: 20,
  DEFAULT_SPEED: 1,
  MIN_SPEED: 0.5,
  MAX_SPEED: 5,
  SPEED_STEP: 0.5,
  CLOCK_INTERVAL_BASE: 1000 // ミリ秒
};

// タブ定義
export const TABS = {
  DESCRIPTION: { id: 'description', label: '回路説明' },
  TIMING: { id: 'timing', label: 'タイミング' },
  TRUTH: { id: 'truth', label: '真理値表' },
  TUTORIAL: { id: 'tutorial', label: 'チュートリアル' }
};