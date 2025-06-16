import type { Gate, Wire } from '../../../types';

export interface CircuitMetadata {
  id: string;
  title: string;
  description: string;
  gates: Gate[];
  wires: Wire[];
}

export const FEATURED_CIRCUITS: CircuitMetadata[] = [
  {
    id: 'half-adder',
    title: '半加算器',
    description: '2つの1ビット数を加算する基本回路。コンピュータの計算の原点です。',
    gates: [
      {
        id: 'input-a',
        type: 'INPUT',
        position: { x: 100, y: 150 },
        output: false,
        inputs: [],
      },
      {
        id: 'input-b',
        type: 'INPUT',
        position: { x: 100, y: 250 },
        output: false,
        inputs: [],
      },
      {
        id: 'xor-sum',
        type: 'XOR',
        position: { x: 300, y: 150 },
        output: false,
        inputs: [],
      },
      {
        id: 'and-carry',
        type: 'AND',
        position: { x: 300, y: 250 },
        output: false,
        inputs: [],
      },
      {
        id: 'output-sum',
        type: 'OUTPUT',
        position: { x: 500, y: 150 },
        output: false,
        inputs: [],
      },
      {
        id: 'output-carry',
        type: 'OUTPUT',
        position: { x: 500, y: 250 },
        output: false,
        inputs: [],
      },
    ],
    wires: [
      {
        id: 'w1',
        from: { gateId: 'input-a', pinIndex: -1 },
        to: { gateId: 'xor-sum', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w2',
        from: { gateId: 'input-b', pinIndex: -1 },
        to: { gateId: 'xor-sum', pinIndex: 1 },
        isActive: false,
      },
      {
        id: 'w3',
        from: { gateId: 'input-a', pinIndex: -1 },
        to: { gateId: 'and-carry', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w4',
        from: { gateId: 'input-b', pinIndex: -1 },
        to: { gateId: 'and-carry', pinIndex: 1 },
        isActive: false,
      },
      {
        id: 'w5',
        from: { gateId: 'xor-sum', pinIndex: -1 },
        to: { gateId: 'output-sum', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w6',
        from: { gateId: 'and-carry', pinIndex: -1 },
        to: { gateId: 'output-carry', pinIndex: 0 },
        isActive: false,
      },
    ],
  },

  {
    id: 'sr-latch',
    title: 'SR ラッチ',
    description: 'Set/Resetで状態を記憶する基本的なメモリ素子。デジタル回路におけるメモリの基礎概念を学べます。',
    gates: [
      // Set入力
      {
        id: 'input_s',
        type: 'INPUT',
        position: { x: 100, y: 150 },
        output: false,
        inputs: [],
      },
      // Reset入力
      {
        id: 'input_r',
        type: 'INPUT',
        position: { x: 100, y: 250 },
        output: false,
        inputs: [],
      },
      // SR-LATCHゲート（専用ゲート）
      {
        id: 'sr_latch',
        type: 'SR-LATCH',
        position: { x: 300, y: 200 },
        output: false,
        inputs: [],
        metadata: { state: false },
      },
      // Q出力（主出力）
      {
        id: 'output_q',
        type: 'OUTPUT',
        position: { x: 500, y: 150 },
        output: false,
        inputs: [],
      },
      // Q_BAR出力（反転出力）
      {
        id: 'output_q_bar',
        type: 'OUTPUT',
        position: { x: 500, y: 250 },
        output: false,
        inputs: [],
      },
    ],
    wires: [
      // S入力をSR-LATCHのS入力に接続
      {
        id: 'w_s_latch',
        from: { gateId: 'input_s', pinIndex: -1 },
        to: { gateId: 'sr_latch', pinIndex: 0 }, // S入力
        isActive: false,
      },
      // R入力をSR-LATCHのR入力に接続
      {
        id: 'w_r_latch',
        from: { gateId: 'input_r', pinIndex: -1 },
        to: { gateId: 'sr_latch', pinIndex: 1 }, // R入力
        isActive: false,
      },
      // SR-LATCHのQ出力を主出力Qに接続
      {
        id: 'w_latch_q',
        from: { gateId: 'sr_latch', pinIndex: -1 }, // Q出力
        to: { gateId: 'output_q', pinIndex: 0 },
        isActive: false,
      },
      // SR-LATCHのQ_BAR出力を反転出力に接続
      {
        id: 'w_latch_q_bar',
        from: { gateId: 'sr_latch', pinIndex: -2 }, // Q_BAR出力
        to: { gateId: 'output_q_bar', pinIndex: 0 },
        isActive: false,
      },
    ],
  },

  {
    id: 'traffic-light',
    title: '信号機制御回路',
    description: '2つのスイッチで信号機の3色を制御する回路。実世界の応用例です。',
    gates: [
      // 制御スイッチ
      {
        id: 'switch1',
        type: 'INPUT',
        position: { x: 100, y: 150 },
        output: false,
        inputs: [],
      },
      {
        id: 'switch2',
        type: 'INPUT',
        position: { x: 100, y: 250 },
        output: false,
        inputs: [],
      },
      // 論理ゲート
      {
        id: 'not1',
        type: 'NOT',
        position: { x: 250, y: 150 },
        output: false,
        inputs: [],
      },
      {
        id: 'not2',
        type: 'NOT',
        position: { x: 250, y: 250 },
        output: false,
        inputs: [],
      },
      {
        id: 'and_red',
        type: 'AND',
        position: { x: 400, y: 100 },
        output: false,
        inputs: [],
      },
      {
        id: 'and_yellow',
        type: 'AND',
        position: { x: 400, y: 200 },
        output: false,
        inputs: [],
      },
      // 信号機の3色
      {
        id: 'red',
        type: 'OUTPUT',
        position: { x: 550, y: 100 },
        output: false,
        inputs: [],
      },
      {
        id: 'yellow',
        type: 'OUTPUT',
        position: { x: 550, y: 200 },
        output: false,
        inputs: [],
      },
      {
        id: 'green',
        type: 'OUTPUT',
        position: { x: 550, y: 300 },
        output: false,
        inputs: [],
      },
    ],
    wires: [
      // スイッチをNOTに接続
      {
        id: 'w_switch1_not1',
        from: { gateId: 'switch1', pinIndex: -1 },
        to: { gateId: 'not1', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w_switch2_not2',
        from: { gateId: 'switch2', pinIndex: -1 },
        to: { gateId: 'not2', pinIndex: 0 },
        isActive: false,
      },
      // 赤信号: switch1=OFF, switch2=OFF
      {
        id: 'w_not1_red',
        from: { gateId: 'not1', pinIndex: -1 },
        to: { gateId: 'and_red', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w_not2_red',
        from: { gateId: 'not2', pinIndex: -1 },
        to: { gateId: 'and_red', pinIndex: 1 },
        isActive: false,
      },
      // 黄信号: switch1=ON, switch2=OFF
      {
        id: 'w_switch1_yellow',
        from: { gateId: 'switch1', pinIndex: -1 },
        to: { gateId: 'and_yellow', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w_not2_yellow',
        from: { gateId: 'not2', pinIndex: -1 },
        to: { gateId: 'and_yellow', pinIndex: 1 },
        isActive: false,
      },
      // 緑信号: switch2=ON（switch1は関係なし）
      {
        id: 'w_switch2_green',
        from: { gateId: 'switch2', pinIndex: -1 },
        to: { gateId: 'green', pinIndex: 0 },
        isActive: false,
      },
      // 出力接続
      {
        id: 'w_and_red_output',
        from: { gateId: 'and_red', pinIndex: -1 },
        to: { gateId: 'red', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w_and_yellow_output',
        from: { gateId: 'and_yellow', pinIndex: -1 },
        to: { gateId: 'yellow', pinIndex: 0 },
        isActive: false,
      },
    ],
  },

  {
    id: 'decoder',
    title: 'デコーダー回路',
    description: '2ビット入力を4つの出力に変換する回路。バイナリコードを具体的な選択信号に変換する重要な回路を学べます。',
    gates: [
      // 入力A（下位ビット）
      {
        id: 'input_a',
        type: 'INPUT',
        position: { x: 100, y: 150 },
        output: false,
        inputs: [],
      },
      // 入力B（上位ビット）
      {
        id: 'input_b',
        type: 'INPUT',
        position: { x: 100, y: 250 },
        output: false,
        inputs: [],
      },
      // NOT A
      {
        id: 'not_a',
        type: 'NOT',
        position: { x: 200, y: 150 },
        output: false,
        inputs: [],
      },
      // NOT B
      {
        id: 'not_b',
        type: 'NOT',
        position: { x: 200, y: 250 },
        output: false,
        inputs: [],
      },
      // AND 出力0（A'B' = 00）
      {
        id: 'and_00',
        type: 'AND',
        position: { x: 350, y: 100 },
        output: false,
        inputs: [],
      },
      // AND 出力1（A'B = 01）
      {
        id: 'and_01',
        type: 'AND',
        position: { x: 350, y: 170 },
        output: false,
        inputs: [],
      },
      // AND 出力2（AB' = 10）
      {
        id: 'and_10',
        type: 'AND',
        position: { x: 350, y: 240 },
        output: false,
        inputs: [],
      },
      // AND 出力3（AB = 11）
      {
        id: 'and_11',
        type: 'AND',
        position: { x: 350, y: 310 },
        output: false,
        inputs: [],
      },
      // 出力0
      {
        id: 'output_0',
        type: 'OUTPUT',
        position: { x: 500, y: 100 },
        output: false,
        inputs: [],
      },
      // 出力1
      {
        id: 'output_1',
        type: 'OUTPUT',
        position: { x: 500, y: 170 },
        output: false,
        inputs: [],
      },
      // 出力2
      {
        id: 'output_2',
        type: 'OUTPUT',
        position: { x: 500, y: 240 },
        output: false,
        inputs: [],
      },
      // 出力3
      {
        id: 'output_3',
        type: 'OUTPUT',
        position: { x: 500, y: 310 },
        output: false,
        inputs: [],
      },
    ],
    wires: [
      // A入力の配線
      {
        id: 'w_a_not',
        from: { gateId: 'input_a', pinIndex: -1 },
        to: { gateId: 'not_a', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w_a_and10',
        from: { gateId: 'input_a', pinIndex: -1 },
        to: { gateId: 'and_10', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w_a_and11',
        from: { gateId: 'input_a', pinIndex: -1 },
        to: { gateId: 'and_11', pinIndex: 0 },
        isActive: false,
      },
      // B入力の配線
      {
        id: 'w_b_not',
        from: { gateId: 'input_b', pinIndex: -1 },
        to: { gateId: 'not_b', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w_b_and01',
        from: { gateId: 'input_b', pinIndex: -1 },
        to: { gateId: 'and_01', pinIndex: 1 },
        isActive: false,
      },
      {
        id: 'w_b_and11',
        from: { gateId: 'input_b', pinIndex: -1 },
        to: { gateId: 'and_11', pinIndex: 1 },
        isActive: false,
      },
      // NOT出力の配線
      {
        id: 'w_not_a_and00',
        from: { gateId: 'not_a', pinIndex: -1 },
        to: { gateId: 'and_00', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w_not_a_and01',
        from: { gateId: 'not_a', pinIndex: -1 },
        to: { gateId: 'and_01', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w_not_b_and00',
        from: { gateId: 'not_b', pinIndex: -1 },
        to: { gateId: 'and_00', pinIndex: 1 },
        isActive: false,
      },
      {
        id: 'w_not_b_and10',
        from: { gateId: 'not_b', pinIndex: -1 },
        to: { gateId: 'and_10', pinIndex: 1 },
        isActive: false,
      },
      // 出力配線
      {
        id: 'w_and00_out',
        from: { gateId: 'and_00', pinIndex: -1 },
        to: { gateId: 'output_0', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w_and01_out',
        from: { gateId: 'and_01', pinIndex: -1 },
        to: { gateId: 'output_1', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w_and10_out',
        from: { gateId: 'and_10', pinIndex: -1 },
        to: { gateId: 'output_2', pinIndex: 0 },
        isActive: false,
      },
      {
        id: 'w_and11_out',
        from: { gateId: 'and_11', pinIndex: -1 },
        to: { gateId: 'output_3', pinIndex: 0 },
        isActive: false,
      },
    ],
  },

  {
    id: 'binary-counter',
    title: '2ビットバイナリカウンタ',
    description: 'クロック信号に同期してカウントアップする回路。デジタル回路の基本となるカウンタ動作を体験できます。',
    gates: [
      // クロック入力
      {
        id: 'clock',
        type: 'CLOCK',
        position: { x: 100, y: 200 },
        output: false,
        inputs: [],
        metadata: {
          frequency: 0.5, // 0.5Hz (2秒周期)
          isRunning: true,
          startTime: Date.now(),
        },
      },
      // バイナリカウンタ
      {
        id: 'counter',
        type: 'BINARY_COUNTER',
        position: { x: 300, y: 200 },
        output: false,
        outputs: [false, false],
        inputs: [''],
        metadata: {
          bitCount: 2,
          currentValue: 0,
          previousClockState: false,
        },
      },
      // 出力（Q0: LSB）
      {
        id: 'output_q0',
        type: 'OUTPUT',
        position: { x: 500, y: 170 },
        output: false,
        inputs: [],
      },
      // 出力（Q1: MSB）
      {
        id: 'output_q1',
        type: 'OUTPUT',
        position: { x: 500, y: 230 },
        output: false,
        inputs: [],
      },
      // 7セグメント風表示用（オプション）
      {
        id: 'display',
        type: 'OUTPUT',
        position: { x: 600, y: 200 },
        output: false,
        inputs: [],
      },
    ],
    wires: [
      // クロック -> カウンタCLK
      {
        id: 'w_clk',
        from: { gateId: 'clock', pinIndex: -1 },
        to: { gateId: 'counter', pinIndex: 0 },
        isActive: false,
      },
      // カウンタQ0 -> 出力Q0
      {
        id: 'w_q0',
        from: { gateId: 'counter', pinIndex: -1 },
        to: { gateId: 'output_q0', pinIndex: 0 },
        isActive: false,
      },
      // カウンタQ1 -> 出力Q1
      {
        id: 'w_q1',
        from: { gateId: 'counter', pinIndex: -2 },
        to: { gateId: 'output_q1', pinIndex: 0 },
        isActive: false,
      },
    ],
  },
];
