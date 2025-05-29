/**
 * デモ回路のコレクション
 */

export interface DemoCircuit {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  circuitData: any; // 実際の回路データ
}

export const demoCircuits: DemoCircuit[] = [
  {
    id: 'calculator-4bit',
    name: '4ビット電卓',
    description: '2つの4ビット数値（0-15）を加算する簡単な電卓',
    difficulty: 'intermediate',
    category: '算術演算',
    circuitData: {
      gates: [
        {
          id: 'num_a',
          type: 'NUMBER_4BIT_INPUT',
          position: { x: 100, y: 150 },
          value: 3
        },
        {
          id: 'num_b',
          type: 'NUMBER_4BIT_INPUT',
          position: { x: 100, y: 350 },
          value: 5
        },
        {
          id: 'adder',
          type: 'ADDER_4BIT',
          position: { x: 350, y: 250 }
        },
        {
          id: 'result',
          type: 'NUMBER_4BIT_DISPLAY',
          position: { x: 600, y: 200 }
        },
        {
          id: 'carry_out',
          type: 'OUTPUT',
          position: { x: 600, y: 350 }
        }
      ],
      connections: [
        // A入力を加算器へ
        { from: 'num_a', fromOutput: 0, to: 'adder', toInput: 0 },
        { from: 'num_a', fromOutput: 1, to: 'adder', toInput: 1 },
        { from: 'num_a', fromOutput: 2, to: 'adder', toInput: 2 },
        { from: 'num_a', fromOutput: 3, to: 'adder', toInput: 3 },
        // B入力を加算器へ
        { from: 'num_b', fromOutput: 0, to: 'adder', toInput: 4 },
        { from: 'num_b', fromOutput: 1, to: 'adder', toInput: 5 },
        { from: 'num_b', fromOutput: 2, to: 'adder', toInput: 6 },
        { from: 'num_b', fromOutput: 3, to: 'adder', toInput: 7 },
        // 加算結果を表示へ
        { from: 'adder', fromOutput: 0, to: 'result', toInput: 0 },
        { from: 'adder', fromOutput: 1, to: 'result', toInput: 1 },
        { from: 'adder', fromOutput: 2, to: 'result', toInput: 2 },
        { from: 'adder', fromOutput: 3, to: 'result', toInput: 3 },
        // 桁上げ出力
        { from: 'adder', fromOutput: 4, to: 'carry_out', toInput: 0 }
      ]
    }
  },
  {
    id: 'half-adder-demo',
    name: '半加算器デモ',
    description: '1ビットの加算を行う基本的な回路',
    difficulty: 'beginner',
    category: '算術演算',
    circuitData: {
      gates: [
        {
          id: 'input_a',
          type: 'INPUT',
          position: { x: 100, y: 150 }
        },
        {
          id: 'input_b',
          type: 'INPUT',
          position: { x: 100, y: 250 }
        },
        {
          id: 'half_adder',
          type: 'HALF_ADDER',
          position: { x: 300, y: 200 }
        },
        {
          id: 'sum',
          type: 'OUTPUT',
          position: { x: 500, y: 150 }
        },
        {
          id: 'carry',
          type: 'OUTPUT',
          position: { x: 500, y: 250 }
        }
      ],
      connections: [
        { from: 'input_a', fromOutput: 0, to: 'half_adder', toInput: 0 },
        { from: 'input_b', fromOutput: 0, to: 'half_adder', toInput: 1 },
        { from: 'half_adder', fromOutput: 0, to: 'sum', toInput: 0 },
        { from: 'half_adder', fromOutput: 1, to: 'carry', toInput: 0 }
      ]
    }
  },
  {
    id: '4bit-counter',
    name: '4ビットカウンタ',
    description: 'クロック信号で0から15までカウントアップする回路',
    difficulty: 'advanced',
    category: '順序回路',
    circuitData: {
      // TODO: 実装予定
      gates: [],
      connections: []
    }
  },
  {
    id: 'sr-latch-demo',
    name: 'SRラッチデモ',
    description: '基本的な記憶素子の動作を確認',
    difficulty: 'beginner',
    category: '記憶素子',
    circuitData: {
      gates: [
        {
          id: 'set',
          type: 'INPUT',
          position: { x: 100, y: 150 }
        },
        {
          id: 'reset',
          type: 'INPUT',
          position: { x: 100, y: 250 }
        },
        {
          id: 'sr_latch',
          type: 'SR_LATCH',
          position: { x: 300, y: 200 }
        },
        {
          id: 'q',
          type: 'OUTPUT',
          position: { x: 500, y: 150 }
        },
        {
          id: 'q_bar',
          type: 'OUTPUT',
          position: { x: 500, y: 250 }
        }
      ],
      connections: [
        { from: 'set', fromOutput: 0, to: 'sr_latch', toInput: 0 },
        { from: 'reset', fromOutput: 0, to: 'sr_latch', toInput: 1 },
        { from: 'sr_latch', fromOutput: 0, to: 'q', toInput: 0 },
        { from: 'sr_latch', fromOutput: 1, to: 'q_bar', toInput: 0 }
      ]
    }
  }
];