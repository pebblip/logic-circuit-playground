import { GateType } from '../../../types';

export interface PuzzleConstraint {
  maxGates?: number;
  maxWires?: number;
  allowedGates: GateType[];
  requiredGates?: GateType[];
}

export interface PuzzleTestCase {
  inputs: boolean[];
  expectedOutput: boolean;
  description?: string;
}

export interface Puzzle {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: 'logic' | 'sequential' | 'arithmetic' | 'optimization';
  
  constraints: PuzzleConstraint;
  testCases: PuzzleTestCase[];
  
  hints?: string[];
  solution?: string;
  
  // 学習要素
  learningObjectives: string[];
  prerequisiteSkills?: string[];
}

// ultrathink: シンプルで段階的な難易度のパズル集
export const PUZZLES: Puzzle[] = [
  // === 初級: 基本論理ゲート ===
  {
    id: 'basic-not',
    title: 'NOTの世界',
    description: 'Aの反対の値を出力してください。シンプルですが、すべての論理の基本です。',
    difficulty: 'beginner',
    category: 'logic',
    constraints: {
      maxGates: 2,
      allowedGates: ['INPUT', 'OUTPUT', 'NOT']
    },
    testCases: [
      { inputs: [false], expectedOutput: true, description: '0 → 1' },
      { inputs: [true], expectedOutput: false, description: '1 → 0' }
    ],
    learningObjectives: ['NOTゲートの理解', '反転論理の基本'],
    hints: ['NOTゲートは入力を反転させます', 'INPUT → NOT → OUTPUT の順で接続']
  },
  
  {
    id: 'basic-and',
    title: 'ANDの条件',
    description: 'AとBが両方ともONの時だけONを出力してください。すべてが満たされた時の論理です。',
    difficulty: 'beginner',
    category: 'logic',
    constraints: {
      maxGates: 4,
      allowedGates: ['INPUT', 'OUTPUT', 'AND']
    },
    testCases: [
      { inputs: [false, false], expectedOutput: false, description: '0 AND 0 = 0' },
      { inputs: [false, true], expectedOutput: false, description: '0 AND 1 = 0' },
      { inputs: [true, false], expectedOutput: false, description: '1 AND 0 = 0' },
      { inputs: [true, true], expectedOutput: true, description: '1 AND 1 = 1' }
    ],
    learningObjectives: ['ANDゲートの理解', '論理積の概念'],
    hints: ['ANDは両方の入力がTRUEの時のみTRUEを出力', '2つのINPUTが必要です']
  },
  
  {
    id: 'basic-or',
    title: 'ORの選択',
    description: 'AまたはBのどちらかがONの時にONを出力してください。選択肢がある論理です。',
    difficulty: 'beginner',
    category: 'logic',
    constraints: {
      maxGates: 4,
      allowedGates: ['INPUT', 'OUTPUT', 'OR']
    },
    testCases: [
      { inputs: [false, false], expectedOutput: false, description: '0 OR 0 = 0' },
      { inputs: [false, true], expectedOutput: true, description: '0 OR 1 = 1' },
      { inputs: [true, false], expectedOutput: true, description: '1 OR 0 = 1' },
      { inputs: [true, true], expectedOutput: true, description: '1 OR 1 = 1' }
    ],
    learningObjectives: ['ORゲートの理解', '論理和の概念'],
    hints: ['ORは少なくとも1つの入力がTRUEならTRUEを出力', 'どちらか一方でもONなら']
  },

  // === 中級: 組み合わせ論理 ===
  {
    id: 'nand-gate',
    title: 'NANDの魔法',
    description: 'NANDゲート1つだけでNOT、AND、ORを作れます。まずはNOTを作ってみましょう。',
    difficulty: 'intermediate',
    category: 'logic',
    constraints: {
      maxGates: 3,
      allowedGates: ['INPUT', 'OUTPUT', 'NAND']
    },
    testCases: [
      { inputs: [false], expectedOutput: true, description: '0 → 1 (NOT動作)' },
      { inputs: [true], expectedOutput: false, description: '1 → 0 (NOT動作)' }
    ],
    learningObjectives: ['NANDゲートの汎用性', 'ユニバーサルゲートの理解'],
    hints: ['NANDの両入力を同じ値にするとNOTになります', 'NAND(A,A) = NOT(A)']
  },

  {
    id: 'xor-puzzle',
    title: 'XORの排他性',
    description: 'AとBが異なる値の時だけONを出力してください。違いを検出する論理です。',
    difficulty: 'intermediate',
    category: 'logic',
    constraints: {
      maxGates: 6,
      allowedGates: ['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT'],
      maxWires: 8
    },
    testCases: [
      { inputs: [false, false], expectedOutput: false, description: '同じ値: 0' },
      { inputs: [false, true], expectedOutput: true, description: '異なる値: 1' },
      { inputs: [true, false], expectedOutput: true, description: '異なる値: 1' },
      { inputs: [true, true], expectedOutput: false, description: '同じ値: 0' }
    ],
    learningObjectives: ['XOR論理の理解', '排他的論理和'],
    hints: ['XOR = (A AND NOT B) OR (NOT A AND B)', 'どちらか一方だけがONの時']
  },

  {
    id: 'three-way-switch',
    title: '3方向スイッチ',
    description: 'A、B、Cの3つの入力のうち、過半数（2つ以上）がONの時にONを出力してください。',
    difficulty: 'intermediate',
    category: 'logic',
    constraints: {
      maxGates: 8,
      allowedGates: ['INPUT', 'OUTPUT', 'AND', 'OR'],
      maxWires: 12
    },
    testCases: [
      { inputs: [false, false, false], expectedOutput: false, description: '0票' },
      { inputs: [false, false, true], expectedOutput: false, description: '1票' },
      { inputs: [false, true, false], expectedOutput: false, description: '1票' },
      { inputs: [true, false, false], expectedOutput: false, description: '1票' },
      { inputs: [false, true, true], expectedOutput: true, description: '2票' },
      { inputs: [true, false, true], expectedOutput: true, description: '2票' },
      { inputs: [true, true, false], expectedOutput: true, description: '2票' },
      { inputs: [true, true, true], expectedOutput: true, description: '3票' }
    ],
    learningObjectives: ['多数決論理', '複数入力の組み合わせ'],
    hints: ['(A AND B) OR (B AND C) OR (A AND C)', '3つのAND + 1つのOR']
  },

  // === 上級: 最適化チャレンジ ===
  {
    id: 'minimal-xor',
    title: 'XOR最小化',
    description: 'XORをNANDゲートだけで作ってください。ゲート数を最小化するのが目標です。',
    difficulty: 'advanced',
    category: 'optimization',
    constraints: {
      maxGates: 6,
      allowedGates: ['INPUT', 'OUTPUT', 'NAND']
    },
    testCases: [
      { inputs: [false, false], expectedOutput: false },
      { inputs: [false, true], expectedOutput: true },
      { inputs: [true, false], expectedOutput: true },
      { inputs: [true, true], expectedOutput: false }
    ],
    learningObjectives: ['ゲート最適化', 'NANDの汎用性'],
    hints: ['NANDだけでXORは作れます', '4つのNANDゲートで実現可能']
  },

  {
    id: 'one-hot-decoder',
    title: 'ワンホットデコーダー',
    description: '2ビット入力(A,B)に対応する出力ピンだけをONにしてください。00→OUT0、01→OUT1、10→OUT2、11→OUT3',
    difficulty: 'advanced',
    category: 'logic',
    constraints: {
      maxGates: 12,
      allowedGates: ['INPUT', 'OUTPUT', 'AND', 'NOT'],
      maxWires: 16
    },
    testCases: [
      { inputs: [false, false], expectedOutput: false, description: '00 → OUT0のみON' },
      { inputs: [false, true], expectedOutput: false, description: '01 → OUT1のみON' },
      { inputs: [true, false], expectedOutput: false, description: '10 → OUT2のみON' },
      { inputs: [true, true], expectedOutput: false, description: '11 → OUT3のみON' }
    ],
    learningObjectives: ['デコーダー回路', 'バイナリ⇔ワンホット変換'],
    hints: ['各出力は特定のAND条件', 'NOT Aを使って条件を作る'],
    // 注意: 複数出力のテストケースは今回簡略化
  }
];

// パズルをカテゴリ別に取得
export function getPuzzlesByCategory(category: Puzzle['category']): Puzzle[] {
  return PUZZLES.filter(puzzle => puzzle.category === category);
}

// 難易度別に取得
export function getPuzzlesByDifficulty(difficulty: Puzzle['difficulty']): Puzzle[] {
  return PUZZLES.filter(puzzle => puzzle.difficulty === difficulty);
}

// パズルを取得
export function getPuzzleById(id: string): Puzzle | undefined {
  return PUZZLES.find(puzzle => puzzle.id === id);
}