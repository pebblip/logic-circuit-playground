/**
 * ギャラリー回路のEvaluationCircuit形式定義
 * 完全にboolean型で統一された新しい回路定義
 */

import type { EvaluationCircuit } from '../../../domain/simulation/core/types';

/**
 * シンプル2ビットLFSR
 * パターン: [1,0] → [0,1] → [1,0] の2周期
 */
export const SIMPLE_LFSR: EvaluationCircuit = {
  gates: [
    // CLOCK
    {
      id: 'clock',
      type: 'CLOCK',
      position: { x: 100, y: 100 },
      inputs: [],
      outputs: [false], // 初期状態：LOW
    },

    // D-FF A (初期値: 1)
    {
      id: 'dff_a',
      type: 'D-FF',
      position: { x: 250, y: 150 },
      inputs: [false, false], // [D, CLK] - 初期は両方LOW
      outputs: [true, false], // [Q=1, Q̄=0]
    },

    // D-FF B (初期値: 0)
    {
      id: 'dff_b',
      type: 'D-FF',
      position: { x: 400, y: 150 },
      inputs: [false, false], // [D, CLK] - 初期は両方LOW
      outputs: [false, true], // [Q=0, Q̄=1]
    },

    // 出力観測
    {
      id: 'out_a',
      type: 'OUTPUT',
      position: { x: 250, y: 250 },
      inputs: [true], // dff_aの出力を観測
      outputs: [],
    },
    {
      id: 'out_b',
      type: 'OUTPUT',
      position: { x: 400, y: 250 },
      inputs: [false], // dff_bの出力を観測
      outputs: [],
    },
  ],
  wires: [
    // クロック分配
    {
      id: 'clk_a',
      from: { gateId: 'clock', pinIndex: 0 },
      to: { gateId: 'dff_a', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'clk_b',
      from: { gateId: 'clock', pinIndex: 0 },
      to: { gateId: 'dff_b', pinIndex: 1 },
      isActive: false,
    },

    // シフト: dff_a → dff_b
    {
      id: 'shift',
      from: { gateId: 'dff_a', pinIndex: 0 },
      to: { gateId: 'dff_b', pinIndex: 0 },
      isActive: true, // dff_a出力(1)がアクティブ
    },

    // フィードバック: dff_b → dff_a
    {
      id: 'feedback',
      from: { gateId: 'dff_b', pinIndex: 0 },
      to: { gateId: 'dff_a', pinIndex: 0 },
      isActive: false, // dff_b出力(0)なのでfalse
    },

    // 出力観測
    {
      id: 'observe_a',
      from: { gateId: 'dff_a', pinIndex: 0 },
      to: { gateId: 'out_a', pinIndex: 0 },
      isActive: true,
    },
    {
      id: 'observe_b',
      from: { gateId: 'dff_b', pinIndex: 0 },
      to: { gateId: 'out_b', pinIndex: 0 },
      isActive: false,
    },
  ],
};

/**
 * 基本SR-Latch
 */
export const SR_LATCH: EvaluationCircuit = {
  gates: [
    // 入力
    {
      id: 'input_s',
      type: 'INPUT',
      position: { x: 100, y: 100 },
      inputs: [],
      outputs: [true], // S=1（SET）
    },
    {
      id: 'input_r',
      type: 'INPUT',
      position: { x: 100, y: 200 },
      inputs: [],
      outputs: [false], // R=0
    },

    // SR-Latch
    {
      id: 'sr_latch',
      type: 'SR-LATCH',
      position: { x: 300, y: 150 },
      inputs: [true, false], // [S=1, R=0]
      outputs: [true, false], // [Q=1, Q̄=0] SET状態
    },

    // 出力
    {
      id: 'out_q',
      type: 'OUTPUT',
      position: { x: 500, y: 100 },
      inputs: [true],
      outputs: [],
    },
    {
      id: 'out_qbar',
      type: 'OUTPUT',
      position: { x: 500, y: 200 },
      inputs: [false],
      outputs: [],
    },
  ],
  wires: [
    {
      id: 'w_s',
      from: { gateId: 'input_s', pinIndex: 0 },
      to: { gateId: 'sr_latch', pinIndex: 0 },
      isActive: true,
    },
    {
      id: 'w_r',
      from: { gateId: 'input_r', pinIndex: 0 },
      to: { gateId: 'sr_latch', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'w_q',
      from: { gateId: 'sr_latch', pinIndex: 0 },
      to: { gateId: 'out_q', pinIndex: 0 },
      isActive: true,
    },
    {
      id: 'w_qbar',
      from: { gateId: 'sr_latch', pinIndex: 1 },
      to: { gateId: 'out_qbar', pinIndex: 0 },
      isActive: false,
    },
  ],
};

/**
 * 半加算機（Pure版）
 * 2つの1ビット数を加算する基本回路
 */
export const HALF_ADDER: EvaluationCircuit = {
  gates: [
    // 入力ゲート
    {
      id: 'input-a',
      type: 'INPUT',
      position: { x: 100, y: 150 },
      inputs: [],
      outputs: [true], // A=1
    },
    {
      id: 'input-b',
      type: 'INPUT',
      position: { x: 100, y: 250 },
      inputs: [],
      outputs: [false], // B=0
    },

    // ロジックゲート
    {
      id: 'xor-sum',
      type: 'XOR',
      position: { x: 300, y: 150 },
      inputs: [true, false], // A XOR B
      outputs: [true], // 1 XOR 0 = 1
    },
    {
      id: 'and-carry',
      type: 'AND',
      position: { x: 300, y: 250 },
      inputs: [true, false], // A AND B
      outputs: [false], // 1 AND 0 = 0
    },

    // 出力ゲート
    {
      id: 'output-sum',
      type: 'OUTPUT',
      position: { x: 500, y: 150 },
      inputs: [true], // XORの出力
      outputs: [],
    },
    {
      id: 'output-carry',
      type: 'OUTPUT',
      position: { x: 500, y: 250 },
      inputs: [false], // ANDの出力
      outputs: [],
    },
  ],
  wires: [
    // input-a → xor-sum
    {
      id: 'w1',
      from: { gateId: 'input-a', pinIndex: 0 },
      to: { gateId: 'xor-sum', pinIndex: 0 },
      isActive: true,
    },
    // input-b → xor-sum
    {
      id: 'w2',
      from: { gateId: 'input-b', pinIndex: 0 },
      to: { gateId: 'xor-sum', pinIndex: 1 },
      isActive: false,
    },
    // input-a → and-carry
    {
      id: 'w3',
      from: { gateId: 'input-a', pinIndex: 0 },
      to: { gateId: 'and-carry', pinIndex: 0 },
      isActive: true,
    },
    // input-b → and-carry
    {
      id: 'w4',
      from: { gateId: 'input-b', pinIndex: 0 },
      to: { gateId: 'and-carry', pinIndex: 1 },
      isActive: false,
    },
    // xor-sum → output-sum
    {
      id: 'w5',
      from: { gateId: 'xor-sum', pinIndex: 0 },
      to: { gateId: 'output-sum', pinIndex: 0 },
      isActive: true,
    },
    // and-carry → output-carry
    {
      id: 'w6',
      from: { gateId: 'and-carry', pinIndex: 0 },
      to: { gateId: 'output-carry', pinIndex: 0 },
      isActive: false,
    },
  ],
};

/**
 * 2-to-4デコーダー（Pure版）
 * 2ビット入力を4つの出力に変換する基本回路
 */
export const DECODER: EvaluationCircuit = {
  gates: [
    // 入力ゲート (初期: A=0, B=0)
    {
      id: 'input_a',
      type: 'INPUT',
      position: { x: 100, y: 150 },
      inputs: [],
      outputs: [false], // A=0
    },
    {
      id: 'input_b',
      type: 'INPUT',
      position: { x: 100, y: 250 },
      inputs: [],
      outputs: [false], // B=0
    },

    // NOTゲート
    {
      id: 'not_a',
      type: 'NOT',
      position: { x: 200, y: 150 },
      inputs: [false], // A=0を受け取る
      outputs: [true], // A'=1
    },
    {
      id: 'not_b',
      type: 'NOT',
      position: { x: 200, y: 250 },
      inputs: [false], // B=0を受け取る
      outputs: [true], // B'=1
    },

    // ANDゲート群
    {
      id: 'and_00', // A'B' (00選択)
      type: 'AND',
      position: { x: 350, y: 100 },
      inputs: [true, true], // A'=1, B'=1
      outputs: [true], // 00の場合アクティブ
    },
    {
      id: 'and_01', // A'B (01選択)
      type: 'AND',
      position: { x: 350, y: 170 },
      inputs: [true, false], // A'=1, B=0
      outputs: [false],
    },
    {
      id: 'and_10', // AB' (10選択)
      type: 'AND',
      position: { x: 350, y: 240 },
      inputs: [false, true], // A=0, B'=1
      outputs: [false],
    },
    {
      id: 'and_11', // AB (11選択)
      type: 'AND',
      position: { x: 350, y: 310 },
      inputs: [false, false], // A=0, B=0
      outputs: [false],
    },

    // 出力ゲート
    {
      id: 'output_0',
      type: 'OUTPUT',
      position: { x: 500, y: 100 },
      inputs: [true], // and_00の出力
      outputs: [],
    },
    {
      id: 'output_1',
      type: 'OUTPUT',
      position: { x: 500, y: 170 },
      inputs: [false], // and_01の出力
      outputs: [],
    },
    {
      id: 'output_2',
      type: 'OUTPUT',
      position: { x: 500, y: 240 },
      inputs: [false], // and_10の出力
      outputs: [],
    },
    {
      id: 'output_3',
      type: 'OUTPUT',
      position: { x: 500, y: 310 },
      inputs: [false], // and_11の出力
      outputs: [],
    },
  ],
  wires: [
    // A入力の配線
    {
      id: 'w_a_not',
      from: { gateId: 'input_a', pinIndex: 0 },
      to: { gateId: 'not_a', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_a_and10',
      from: { gateId: 'input_a', pinIndex: 0 },
      to: { gateId: 'and_10', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_a_and11',
      from: { gateId: 'input_a', pinIndex: 0 },
      to: { gateId: 'and_11', pinIndex: 0 },
      isActive: false,
    },

    // B入力の配線
    {
      id: 'w_b_not',
      from: { gateId: 'input_b', pinIndex: 0 },
      to: { gateId: 'not_b', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_b_and01',
      from: { gateId: 'input_b', pinIndex: 0 },
      to: { gateId: 'and_01', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'w_b_and11',
      from: { gateId: 'input_b', pinIndex: 0 },
      to: { gateId: 'and_11', pinIndex: 1 },
      isActive: false,
    },

    // NOT出力の配線
    {
      id: 'w_not_a_and00',
      from: { gateId: 'not_a', pinIndex: 0 },
      to: { gateId: 'and_00', pinIndex: 0 },
      isActive: true, // A'=1がアクティブ
    },
    {
      id: 'w_not_a_and01',
      from: { gateId: 'not_a', pinIndex: 0 },
      to: { gateId: 'and_01', pinIndex: 0 },
      isActive: true, // A'=1がアクティブ
    },
    {
      id: 'w_not_b_and00',
      from: { gateId: 'not_b', pinIndex: 0 },
      to: { gateId: 'and_00', pinIndex: 1 },
      isActive: true, // B'=1がアクティブ
    },
    {
      id: 'w_not_b_and10',
      from: { gateId: 'not_b', pinIndex: 0 },
      to: { gateId: 'and_10', pinIndex: 1 },
      isActive: true, // B'=1がアクティブ
    },

    // 出力配線
    {
      id: 'w_and00_out',
      from: { gateId: 'and_00', pinIndex: 0 },
      to: { gateId: 'output_0', pinIndex: 0 },
      isActive: true, // and_00=1がアクティブ
    },
    {
      id: 'w_and01_out',
      from: { gateId: 'and_01', pinIndex: 0 },
      to: { gateId: 'output_1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_and10_out',
      from: { gateId: 'and_10', pinIndex: 0 },
      to: { gateId: 'output_2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_and11_out',
      from: { gateId: 'and_11', pinIndex: 0 },
      to: { gateId: 'output_3', pinIndex: 0 },
      isActive: false,
    },
  ],
};

/**
 * パリティチェッカー（Pure版）
 * 4ビット入力の1の個数が奇数なら1を出力
 */
export const PARITY_CHECKER: EvaluationCircuit = {
  gates: [
    // 4ビット入力 (初期: 全て0)
    {
      id: 'input_d3',
      type: 'INPUT',
      position: { x: 100, y: 100 },
      inputs: [],
      outputs: [false], // D3=0
    },
    {
      id: 'input_d2',
      type: 'INPUT',
      position: { x: 100, y: 200 },
      inputs: [],
      outputs: [false], // D2=0
    },
    {
      id: 'input_d1',
      type: 'INPUT',
      position: { x: 100, y: 300 },
      inputs: [],
      outputs: [false], // D1=0
    },
    {
      id: 'input_d0',
      type: 'INPUT',
      position: { x: 100, y: 400 },
      inputs: [],
      outputs: [false], // D0=0
    },

    // XORカスケード
    {
      id: 'xor_32', // D3 XOR D2
      type: 'XOR',
      position: { x: 300, y: 150 },
      inputs: [false, false], // D3=0, D2=0
      outputs: [false], // 0 XOR 0 = 0
    },
    {
      id: 'xor_10', // D1 XOR D0
      type: 'XOR',
      position: { x: 300, y: 350 },
      inputs: [false, false], // D1=0, D0=0
      outputs: [false], // 0 XOR 0 = 0
    },
    {
      id: 'xor_final', // (D3^D2) XOR (D1^D0)
      type: 'XOR',
      position: { x: 500, y: 250 },
      inputs: [false, false], // 0, 0
      outputs: [false], // 最終結果: 偶数パリティ
    },

    // 出力ゲート
    {
      id: 'parity_out',
      type: 'OUTPUT',
      position: { x: 700, y: 250 },
      inputs: [false], // xor_finalの出力
      outputs: [],
    },

    // デバッグ出力
    {
      id: 'debug_32',
      type: 'OUTPUT',
      position: { x: 450, y: 150 },
      inputs: [false],
      outputs: [],
    },
    {
      id: 'debug_10',
      type: 'OUTPUT',
      position: { x: 450, y: 350 },
      inputs: [false],
      outputs: [],
    },
  ],
  wires: [
    // D3, D2 → XOR_32
    {
      id: 'w_d3_xor32',
      from: { gateId: 'input_d3', pinIndex: 0 },
      to: { gateId: 'xor_32', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_d2_xor32',
      from: { gateId: 'input_d2', pinIndex: 0 },
      to: { gateId: 'xor_32', pinIndex: 1 },
      isActive: false,
    },

    // D1, D0 → XOR_10
    {
      id: 'w_d1_xor10',
      from: { gateId: 'input_d1', pinIndex: 0 },
      to: { gateId: 'xor_10', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_d0_xor10',
      from: { gateId: 'input_d0', pinIndex: 0 },
      to: { gateId: 'xor_10', pinIndex: 1 },
      isActive: false,
    },

    // XOR中間結果 → Final XOR
    {
      id: 'w_xor32_final',
      from: { gateId: 'xor_32', pinIndex: 0 },
      to: { gateId: 'xor_final', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_xor10_final',
      from: { gateId: 'xor_10', pinIndex: 0 },
      to: { gateId: 'xor_final', pinIndex: 1 },
      isActive: false,
    },

    // 出力配線
    {
      id: 'w_final_out',
      from: { gateId: 'xor_final', pinIndex: 0 },
      to: { gateId: 'parity_out', pinIndex: 0 },
      isActive: false,
    },

    // デバッグ配線
    {
      id: 'w_xor32_debug',
      from: { gateId: 'xor_32', pinIndex: 0 },
      to: { gateId: 'debug_32', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_xor10_debug',
      from: { gateId: 'xor_10', pinIndex: 0 },
      to: { gateId: 'debug_10', pinIndex: 0 },
      isActive: false,
    },
  ],
};

/**
 * 多数決回路（Pure版）
 * 3入力の多数決を取る回路
 */
export const MAJORITY_VOTER: EvaluationCircuit = {
  gates: [
    // 3つの投票者入力 (初期: 全て0)
    {
      id: 'voter_a',
      type: 'INPUT',
      position: { x: 100, y: 150 },
      inputs: [],
      outputs: [false], // A=0
    },
    {
      id: 'voter_b',
      type: 'INPUT',
      position: { x: 100, y: 250 },
      inputs: [],
      outputs: [false], // B=0
    },
    {
      id: 'voter_c',
      type: 'INPUT',
      position: { x: 100, y: 350 },
      inputs: [],
      outputs: [false], // C=0
    },

    // 2人組み合わせのANDゲート
    {
      id: 'and_ab', // A AND B
      type: 'AND',
      position: { x: 300, y: 100 },
      inputs: [false, false], // A=0, B=0
      outputs: [false], // 0 AND 0 = 0
    },
    {
      id: 'and_bc', // B AND C
      type: 'AND',
      position: { x: 300, y: 250 },
      inputs: [false, false], // B=0, C=0
      outputs: [false], // 0 AND 0 = 0
    },
    {
      id: 'and_ac', // A AND C
      type: 'AND',
      position: { x: 300, y: 400 },
      inputs: [false, false], // A=0, C=0
      outputs: [false], // 0 AND 0 = 0
    },

    // 最終ORゲート (2段構成)
    {
      id: 'or_first', // (A∧B) OR (B∧C)
      type: 'OR',
      position: { x: 450, y: 175 },
      inputs: [false, false], // and_ab=0, and_bc=0
      outputs: [false],
    },
    {
      id: 'or_final', // or_first OR (A∧C)
      type: 'OR',
      position: { x: 600, y: 250 },
      inputs: [false, false], // or_first=0, and_ac=0
      outputs: [false], // 最終結果
    },

    // 結果出力
    {
      id: 'result_out',
      type: 'OUTPUT',
      position: { x: 750, y: 250 },
      inputs: [false],
      outputs: [],
    },
  ],
  wires: [
    // 投票者 → ANDゲート
    {
      id: 'w_a_ab',
      from: { gateId: 'voter_a', pinIndex: 0 },
      to: { gateId: 'and_ab', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_b_ab',
      from: { gateId: 'voter_b', pinIndex: 0 },
      to: { gateId: 'and_ab', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'w_b_bc',
      from: { gateId: 'voter_b', pinIndex: 0 },
      to: { gateId: 'and_bc', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_c_bc',
      from: { gateId: 'voter_c', pinIndex: 0 },
      to: { gateId: 'and_bc', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'w_a_ac',
      from: { gateId: 'voter_a', pinIndex: 0 },
      to: { gateId: 'and_ac', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_c_ac',
      from: { gateId: 'voter_c', pinIndex: 0 },
      to: { gateId: 'and_ac', pinIndex: 1 },
      isActive: false,
    },

    // ANDゲート → 第1段OR
    {
      id: 'w_ab_or1',
      from: { gateId: 'and_ab', pinIndex: 0 },
      to: { gateId: 'or_first', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_bc_or1',
      from: { gateId: 'and_bc', pinIndex: 0 },
      to: { gateId: 'or_first', pinIndex: 1 },
      isActive: false,
    },

    // 第1段OR & A∧C → 最終OR
    {
      id: 'w_or1_final',
      from: { gateId: 'or_first', pinIndex: 0 },
      to: { gateId: 'or_final', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_ac_final',
      from: { gateId: 'and_ac', pinIndex: 0 },
      to: { gateId: 'or_final', pinIndex: 1 },
      isActive: false,
    },

    // 最終出力
    {
      id: 'w_final_out',
      from: { gateId: 'or_final', pinIndex: 0 },
      to: { gateId: 'result_out', pinIndex: 0 },
      isActive: false,
    },
  ],
};

/**
 * 基本D-FF（テスト用）
 */
export const BASIC_DFF: EvaluationCircuit = {
  gates: [
    {
      id: 'input_d',
      type: 'INPUT',
      position: { x: 100, y: 100 },
      inputs: [],
      outputs: [true], // D=1
    },
    {
      id: 'clock',
      type: 'CLOCK',
      position: { x: 100, y: 200 },
      inputs: [],
      outputs: [false], // CLK=0（初期）
    },
    {
      id: 'dff',
      type: 'D-FF',
      position: { x: 300, y: 150 },
      inputs: [true, false], // [D=1, CLK=0]
      outputs: [false, true], // [Q=0, Q̄=1]（初期状態）
    },
    {
      id: 'output_q',
      type: 'OUTPUT',
      position: { x: 500, y: 150 },
      inputs: [false],
      outputs: [],
    },
  ],
  wires: [
    {
      id: 'w_d',
      from: { gateId: 'input_d', pinIndex: 0 },
      to: { gateId: 'dff', pinIndex: 0 },
      isActive: true,
    },
    {
      id: 'w_clk',
      from: { gateId: 'clock', pinIndex: 0 },
      to: { gateId: 'dff', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'w_q',
      from: { gateId: 'dff', pinIndex: 0 },
      to: { gateId: 'output_q', pinIndex: 0 },
      isActive: false,
    },
  ],
};

/**
 * シンプルリングオシレータ（Pure版）
 * 3つのNOTゲートによる発振回路
 */
export const SIMPLE_RING_OSCILLATOR: EvaluationCircuit = {
  gates: [
    {
      id: 'NOT1',
      type: 'NOT',
      position: { x: 300, y: 200 },
      inputs: [true], // NOT3の出力(true)を受け取る
      outputs: [false], // !true = false
    },
    {
      id: 'NOT2',
      type: 'NOT',
      position: { x: 500, y: 200 },
      inputs: [false], // NOT1の出力(false)を受け取る
      outputs: [true], // !false = true
    },
    {
      id: 'NOT3',
      type: 'NOT',
      position: { x: 700, y: 200 },
      inputs: [true], // NOT2の出力(true)を受け取る
      outputs: [false], // !true = false
    },

    // 観測用OUTPUT
    {
      id: 'OUT_NOT1',
      type: 'OUTPUT',
      position: { x: 300, y: 100 },
      inputs: [false], // NOT1の出力を観測
      outputs: [],
    },
    {
      id: 'OUT_NOT2',
      type: 'OUTPUT',
      position: { x: 500, y: 100 },
      inputs: [true], // NOT2の出力を観測
      outputs: [],
    },
    {
      id: 'OUT_NOT3',
      type: 'OUTPUT',
      position: { x: 700, y: 100 },
      inputs: [false], // NOT3の出力を観測
      outputs: [],
    },
  ],
  wires: [
    // リング接続
    {
      id: 'w1',
      from: { gateId: 'NOT1', pinIndex: 0 },
      to: { gateId: 'NOT2', pinIndex: 0 },
      isActive: false, // NOT1の出力(false)
    },
    {
      id: 'w2',
      from: { gateId: 'NOT2', pinIndex: 0 },
      to: { gateId: 'NOT3', pinIndex: 0 },
      isActive: true, // NOT2の出力(true)
    },
    {
      id: 'w3',
      from: { gateId: 'NOT3', pinIndex: 0 },
      to: { gateId: 'NOT1', pinIndex: 0 },
      isActive: false, // NOT3の出力(false)でフィードバック
    },

    // 観測用接続
    {
      id: 'w4',
      from: { gateId: 'NOT1', pinIndex: 0 },
      to: { gateId: 'OUT_NOT1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w5',
      from: { gateId: 'NOT2', pinIndex: 0 },
      to: { gateId: 'OUT_NOT2', pinIndex: 0 },
      isActive: true,
    },
    {
      id: 'w6',
      from: { gateId: 'NOT3', pinIndex: 0 },
      to: { gateId: 'OUT_NOT3', pinIndex: 0 },
      isActive: false,
    },
  ],
};

/**
 * Mandala回路（Pure版）
 * 複雑な循環パターンによる美しい発振
 */
export const MANDALA_CIRCUIT: EvaluationCircuit = {
  gates: [
    // 中央のSR-LATCH
    {
      id: 'center_sr',
      type: 'SR-LATCH',
      position: { x: 400, y: 300 },
      inputs: [true, false], // [S=1, R=0] SET状態
      outputs: [true, false], // [Q=1, Q̄=0] SET状態
    },

    // 周囲のNOTゲート群
    {
      id: 'not_top',
      type: 'NOT',
      position: { x: 400, y: 150 },
      inputs: [false],
      outputs: [true],
    },
    {
      id: 'not_right',
      type: 'NOT',
      position: { x: 550, y: 300 },
      inputs: [true],
      outputs: [false],
    },
    {
      id: 'not_bottom',
      type: 'NOT',
      position: { x: 400, y: 450 },
      inputs: [true],
      outputs: [false],
    },
    {
      id: 'not_left',
      type: 'NOT',
      position: { x: 250, y: 300 },
      inputs: [false],
      outputs: [true],
    },

    // 観測用OUTPUT
    {
      id: 'out_center_q',
      type: 'OUTPUT',
      position: { x: 500, y: 250 },
      inputs: [true],
      outputs: [],
    },
    {
      id: 'out_center_qbar',
      type: 'OUTPUT',
      position: { x: 500, y: 350 },
      inputs: [false],
      outputs: [],
    },
  ],
  wires: [
    // SR-LATCHへの入力
    {
      id: 'w_top_to_s',
      from: { gateId: 'not_top', pinIndex: 0 },
      to: { gateId: 'center_sr', pinIndex: 0 },
      isActive: true,
    },
    {
      id: 'w_bottom_to_r',
      from: { gateId: 'not_bottom', pinIndex: 0 },
      to: { gateId: 'center_sr', pinIndex: 1 },
      isActive: false,
    },

    // フィードバックループ
    {
      id: 'w_q_to_right',
      from: { gateId: 'center_sr', pinIndex: 0 },
      to: { gateId: 'not_right', pinIndex: 0 },
      isActive: true,
    },
    {
      id: 'w_qbar_to_left',
      from: { gateId: 'center_sr', pinIndex: 1 },
      to: { gateId: 'not_left', pinIndex: 0 },
      isActive: false,
    },

    // 循環接続
    {
      id: 'w_right_to_bottom',
      from: { gateId: 'not_right', pinIndex: 0 },
      to: { gateId: 'not_bottom', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_left_to_top',
      from: { gateId: 'not_left', pinIndex: 0 },
      to: { gateId: 'not_top', pinIndex: 0 },
      isActive: true,
    },

    // 観測用
    {
      id: 'w_obs_q',
      from: { gateId: 'center_sr', pinIndex: 0 },
      to: { gateId: 'out_center_q', pinIndex: 0 },
      isActive: true,
    },
    {
      id: 'w_obs_qbar',
      from: { gateId: 'center_sr', pinIndex: 1 },
      to: { gateId: 'out_center_qbar', pinIndex: 0 },
      isActive: false,
    },
  ],
};

/**
 * 4ビット比較器回路（基本版）
 * シンプルな1ビット比較で動作テスト
 */
export const FOUR_BIT_COMPARATOR: EvaluationCircuit = {
  gates: [
    // A入力（1ビット簡易版）
    {
      id: 'a0',
      type: 'INPUT',
      position: { x: 50, y: 100 },
      inputs: [],
      outputs: [true], // A=1
    },
    
    // B入力（1ビット簡易版）
    {
      id: 'b0',
      type: 'INPUT',
      position: { x: 50, y: 150 },
      inputs: [],
      outputs: [false], // B=0
    },
    
    // A > B 判定ロジック
    {
      id: 'not_b0',
      type: 'NOT',
      position: { x: 150, y: 150 },
      inputs: [false],
      outputs: [true], // !B0
    },
    
    {
      id: 'a_gt_b',
      type: 'AND',
      position: { x: 250, y: 125 },
      inputs: [true, true], // A0 & !B0
      outputs: [true],
    },
    
    // A = B 判定ロジック
    {
      id: 'a_eq_b',
      type: 'XNOR',
      position: { x: 250, y: 175 },
      inputs: [true, false], // A0 XNOR B0
      outputs: [false],
    },
    
    // A < B 判定ロジック
    {
      id: 'not_a0',
      type: 'NOT',
      position: { x: 150, y: 100 },
      inputs: [true],
      outputs: [false], // !A0
    },
    
    {
      id: 'a_lt_b',
      type: 'AND',
      position: { x: 250, y: 75 },
      inputs: [false, false], // !A0 & B0
      outputs: [false],
    },
    
    // 出力
    {
      id: 'out_gt',
      type: 'OUTPUT',
      position: { x: 350, y: 125 },
      inputs: [true],
      outputs: [true], // A > B
    },
    
    {
      id: 'out_eq',
      type: 'OUTPUT',
      position: { x: 350, y: 175 },
      inputs: [false],
      outputs: [false], // A = B
    },
    
    {
      id: 'out_lt',
      type: 'OUTPUT',
      position: { x: 350, y: 75 },
      inputs: [false],
      outputs: [false], // A < B
    },
  ],
  wires: [
    // A0 connections
    { id: 'w1', from: { gateId: 'a0', pinIndex: 0 }, to: { gateId: 'not_a0', pinIndex: 0 }, isActive: true },
    { id: 'w2', from: { gateId: 'a0', pinIndex: 0 }, to: { gateId: 'a_gt_b', pinIndex: 0 }, isActive: true },
    { id: 'w3', from: { gateId: 'a0', pinIndex: 0 }, to: { gateId: 'a_eq_b', pinIndex: 0 }, isActive: true },
    
    // B0 connections
    { id: 'w4', from: { gateId: 'b0', pinIndex: 0 }, to: { gateId: 'not_b0', pinIndex: 0 }, isActive: false },
    { id: 'w5', from: { gateId: 'b0', pinIndex: 0 }, to: { gateId: 'a_lt_b', pinIndex: 1 }, isActive: false },
    { id: 'w6', from: { gateId: 'b0', pinIndex: 0 }, to: { gateId: 'a_eq_b', pinIndex: 1 }, isActive: false },
    
    // Logic connections
    { id: 'w7', from: { gateId: 'not_a0', pinIndex: 0 }, to: { gateId: 'a_lt_b', pinIndex: 0 }, isActive: false },
    { id: 'w8', from: { gateId: 'not_b0', pinIndex: 0 }, to: { gateId: 'a_gt_b', pinIndex: 1 }, isActive: true },
    
    // Output connections
    { id: 'w9', from: { gateId: 'a_gt_b', pinIndex: 0 }, to: { gateId: 'out_gt', pinIndex: 0 }, isActive: true },
    { id: 'w10', from: { gateId: 'a_eq_b', pinIndex: 0 }, to: { gateId: 'out_eq', pinIndex: 0 }, isActive: false },
    { id: 'w11', from: { gateId: 'a_lt_b', pinIndex: 0 }, to: { gateId: 'out_lt', pinIndex: 0 }, isActive: false },
  ],
};

/**
 * 7セグメントデコーダー（0-3表示）
 * 2ビット入力を7セグメントディスプレイのパターンに変換
 */
export const SEVEN_SEGMENT: EvaluationCircuit = {
  gates: [
    // 2ビット入力（B1 B0で0-3を表現）
    {
      id: 'input_b1',
      type: 'INPUT',
      position: { x: 50, y: 200 },
      inputs: [],
      outputs: [false],
    },
    {
      id: 'input_b0',
      type: 'INPUT',
      position: { x: 50, y: 300 },
      inputs: [],
      outputs: [false],
    },
    // NOT ゲート（入力の反転）
    {
      id: 'not_b1',
      type: 'NOT',
      position: { x: 150, y: 200 },
      inputs: [false],
      outputs: [true],
    },
    {
      id: 'not_b0',
      type: 'NOT',
      position: { x: 150, y: 300 },
      inputs: [false],
      outputs: [true],
    },
    // セグメントa (0,2,3で点灯) = B1 + B0
    {
      id: 'seg_a',
      type: 'OR',
      position: { x: 350, y: 100 },
      inputs: [false, false],
      outputs: [false],
    },
    // セグメントb (0,1,2,3で点灯) = 常に1
    {
      id: 'seg_b',
      type: 'OR',
      position: { x: 350, y: 170 },
      inputs: [false, false],
      outputs: [false],
    },
    // セグメントc (0,1,3で点灯) = NOT B1 + B0
    {
      id: 'seg_c_or',
      type: 'OR',
      position: { x: 350, y: 240 },
      inputs: [true, false],
      outputs: [true],
    },
    // セグメントd (0,2,3で点灯) = B1 + NOT B0
    {
      id: 'seg_d_or',
      type: 'OR',
      position: { x: 350, y: 310 },
      inputs: [false, true],
      outputs: [true],
    },
    // セグメントf (0で点灯) = NOT B1 AND NOT B0
    {
      id: 'seg_f_and',
      type: 'AND',
      position: { x: 350, y: 380 },
      inputs: [true, true],
      outputs: [true],
    },
    // 7セグメント出力（a-g）
    {
      id: 'out_a',
      type: 'OUTPUT',
      position: { x: 550, y: 100 },
      inputs: [false],
      outputs: [],
    },
    {
      id: 'out_b',
      type: 'OUTPUT',
      position: { x: 550, y: 170 },
      inputs: [false],
      outputs: [],
    },
    {
      id: 'out_c',
      type: 'OUTPUT',
      position: { x: 550, y: 240 },
      inputs: [true],
      outputs: [],
    },
    {
      id: 'out_d',
      type: 'OUTPUT',
      position: { x: 550, y: 310 },
      inputs: [true],
      outputs: [],
    },
    {
      id: 'out_e',
      type: 'OUTPUT',
      position: { x: 550, y: 380 },
      inputs: [true],
      outputs: [],
    },
    {
      id: 'out_f',
      type: 'OUTPUT',
      position: { x: 550, y: 450 },
      inputs: [true],
      outputs: [],
    },
    {
      id: 'out_g',
      type: 'OUTPUT',
      position: { x: 550, y: 520 },
      inputs: [false],
      outputs: [],
    },
  ],
  wires: [
    // NOT接続
    {
      id: 'w_b1_not',
      from: { gateId: 'input_b1', pinIndex: 0 },
      to: { gateId: 'not_b1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_b0_not',
      from: { gateId: 'input_b0', pinIndex: 0 },
      to: { gateId: 'not_b0', pinIndex: 0 },
      isActive: false,
    },
    // セグメントa = B1 OR B0
    {
      id: 'w_b1_seg_a',
      from: { gateId: 'input_b1', pinIndex: 0 },
      to: { gateId: 'seg_a', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_b0_seg_a',
      from: { gateId: 'input_b0', pinIndex: 0 },
      to: { gateId: 'seg_a', pinIndex: 1 },
      isActive: false,
    },
    // セグメントb = 1 (B1 OR B1で代用)
    {
      id: 'w_b1_seg_b1',
      from: { gateId: 'input_b1', pinIndex: 0 },
      to: { gateId: 'seg_b', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_b1_seg_b2',
      from: { gateId: 'input_b1', pinIndex: 0 },
      to: { gateId: 'seg_b', pinIndex: 1 },
      isActive: false,
    },
    // セグメントc = NOT B1 OR B0
    {
      id: 'w_notb1_seg_c',
      from: { gateId: 'not_b1', pinIndex: 0 },
      to: { gateId: 'seg_c_or', pinIndex: 0 },
      isActive: true,
    },
    {
      id: 'w_b0_seg_c',
      from: { gateId: 'input_b0', pinIndex: 0 },
      to: { gateId: 'seg_c_or', pinIndex: 1 },
      isActive: false,
    },
    // セグメントd = B1 OR NOT B0
    {
      id: 'w_b1_seg_d',
      from: { gateId: 'input_b1', pinIndex: 0 },
      to: { gateId: 'seg_d_or', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_notb0_seg_d',
      from: { gateId: 'not_b0', pinIndex: 0 },
      to: { gateId: 'seg_d_or', pinIndex: 1 },
      isActive: true,
    },
    // セグメントf = NOT B1 AND NOT B0
    {
      id: 'w_notb1_seg_f',
      from: { gateId: 'not_b1', pinIndex: 0 },
      to: { gateId: 'seg_f_and', pinIndex: 0 },
      isActive: true,
    },
    {
      id: 'w_notb0_seg_f',
      from: { gateId: 'not_b0', pinIndex: 0 },
      to: { gateId: 'seg_f_and', pinIndex: 1 },
      isActive: true,
    },
    // 出力接続
    {
      id: 'w_seg_a_out',
      from: { gateId: 'seg_a', pinIndex: 0 },
      to: { gateId: 'out_a', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_seg_b_out',
      from: { gateId: 'seg_b', pinIndex: 0 },
      to: { gateId: 'out_b', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_seg_c_out',
      from: { gateId: 'seg_c_or', pinIndex: 0 },
      to: { gateId: 'out_c', pinIndex: 0 },
      isActive: true,
    },
    {
      id: 'w_seg_d_out',
      from: { gateId: 'seg_d_or', pinIndex: 0 },
      to: { gateId: 'out_d', pinIndex: 0 },
      isActive: true,
    },
    // セグメントe = NOT B0をそのまま使用
    {
      id: 'w_seg_e_out',
      from: { gateId: 'not_b0', pinIndex: 0 },
      to: { gateId: 'out_e', pinIndex: 0 },
      isActive: true,
    },
    {
      id: 'w_seg_f_out',
      from: { gateId: 'seg_f_and', pinIndex: 0 },
      to: { gateId: 'out_f', pinIndex: 0 },
      isActive: true,
    },
    // セグメントg = B1をそのまま使用
    {
      id: 'w_seg_g_out',
      from: { gateId: 'input_b1', pinIndex: 0 },
      to: { gateId: 'out_g', pinIndex: 0 },
      isActive: false,
    },
  ],
};

/**
 * フィボナッチカウンター
 * フィボナッチ数列を生成する回路 (A=B, B=A+B)
 */
export const FIBONACCI_COUNTER: EvaluationCircuit = {
  gates: [
    // CLOCK
    {
      id: 'clock',
      type: 'CLOCK',
      position: { x: 50, y: 250 },
      inputs: [],
      outputs: [false],
      metadata: { frequency: 1.667, isRunning: true },
    },
    // レジスタ A (前の値) - 2ビット
    {
      id: 'reg_a_0',
      type: 'D-FF',
      position: { x: 200, y: 150 },
      inputs: [false, false], // [D, CLK]
      outputs: [false, true], // [Q=0, Q̄=1] - F(0) = 0
    },
    {
      id: 'reg_a_1',
      type: 'D-FF',
      position: { x: 300, y: 150 },
      inputs: [false, false],
      outputs: [false, true],
    },
    // レジスタ B (現在の値) - 2ビット
    {
      id: 'reg_b_0',
      type: 'D-FF',
      position: { x: 200, y: 350 },
      inputs: [true, false], // [D, CLK]
      outputs: [true, false], // [Q=1, Q̄=0] - F(1) = 1
    },
    {
      id: 'reg_b_1',
      type: 'D-FF',
      position: { x: 300, y: 350 },
      inputs: [false, false],
      outputs: [false, true],
    },
    // 2ビット加算器
    // ビット0の半加算器
    {
      id: 'xor_0',
      type: 'XOR',
      position: { x: 500, y: 200 },
      inputs: [false, true], // A0=0, B0=1
      outputs: [true], // Sum0 = 1
    },
    {
      id: 'and_0',
      type: 'AND',
      position: { x: 500, y: 280 },
      inputs: [false, true],
      outputs: [false], // Carry0 = 0
    },
    // ビット1の全加算器
    {
      id: 'xor_1a',
      type: 'XOR',
      position: { x: 600, y: 200 },
      inputs: [false, false], // A1=0, B1=0
      outputs: [false],
    },
    {
      id: 'xor_1b',
      type: 'XOR',
      position: { x: 700, y: 200 },
      inputs: [false, false], // xor_1a=0, carry0=0
      outputs: [false], // Sum1 = 0
    },
    {
      id: 'and_1a',
      type: 'AND',
      position: { x: 600, y: 280 },
      inputs: [false, false],
      outputs: [false],
    },
    {
      id: 'and_1b',
      type: 'AND',
      position: { x: 700, y: 280 },
      inputs: [false, false],
      outputs: [false],
    },
    {
      id: 'or_1',
      type: 'OR',
      position: { x: 750, y: 240 },
      inputs: [false, false],
      outputs: [false], // Carry1 = 0
    },
    // ダミーのbit2レジスタ（オーバーフロー表示用）
    {
      id: 'reg_a_2',
      type: 'D-FF',
      position: { x: 400, y: 150 },
      inputs: [false, false],
      outputs: [false, true],
    },
    {
      id: 'reg_b_2',
      type: 'D-FF',
      position: { x: 400, y: 350 },
      inputs: [false, false],
      outputs: [false, true],
    },
    // 出力表示
    {
      id: 'out_fib_0',
      type: 'OUTPUT',
      position: { x: 850, y: 150 },
      inputs: [true], // Sum0
      outputs: [],
    },
    {
      id: 'out_fib_1',
      type: 'OUTPUT',
      position: { x: 850, y: 250 },
      inputs: [false], // Sum1
      outputs: [],
    },
    {
      id: 'out_fib_2',
      type: 'OUTPUT',
      position: { x: 850, y: 350 },
      inputs: [false], // Carry
      outputs: [],
    },
    // A値表示
    {
      id: 'out_a_0',
      type: 'OUTPUT',
      position: { x: 200, y: 50 },
      inputs: [false],
      outputs: [],
    },
    {
      id: 'out_a_1',
      type: 'OUTPUT',
      position: { x: 300, y: 50 },
      inputs: [false],
      outputs: [],
    },
    {
      id: 'out_a_2',
      type: 'OUTPUT',
      position: { x: 400, y: 50 },
      inputs: [false],
      outputs: [],
    },
    // B値表示
    {
      id: 'out_b_0',
      type: 'OUTPUT',
      position: { x: 200, y: 450 },
      inputs: [true],
      outputs: [],
    },
    {
      id: 'out_b_1',
      type: 'OUTPUT',
      position: { x: 300, y: 450 },
      inputs: [false],
      outputs: [],
    },
    {
      id: 'out_b_2',
      type: 'OUTPUT',
      position: { x: 400, y: 450 },
      inputs: [false],
      outputs: [],
    },
  ],
  wires: [
    // クロック分配
    { id: 'clk_a0', from: { gateId: 'clock', pinIndex: 0 }, to: { gateId: 'reg_a_0', pinIndex: 1 }, isActive: false },
    { id: 'clk_a1', from: { gateId: 'clock', pinIndex: 0 }, to: { gateId: 'reg_a_1', pinIndex: 1 }, isActive: false },
    { id: 'clk_a2', from: { gateId: 'clock', pinIndex: 0 }, to: { gateId: 'reg_a_2', pinIndex: 1 }, isActive: false },
    { id: 'clk_b0', from: { gateId: 'clock', pinIndex: 0 }, to: { gateId: 'reg_b_0', pinIndex: 1 }, isActive: false },
    { id: 'clk_b1', from: { gateId: 'clock', pinIndex: 0 }, to: { gateId: 'reg_b_1', pinIndex: 1 }, isActive: false },
    { id: 'clk_b2', from: { gateId: 'clock', pinIndex: 0 }, to: { gateId: 'reg_b_2', pinIndex: 1 }, isActive: false },
    // A = B
    { id: 'b0_to_a0', from: { gateId: 'reg_b_0', pinIndex: 0 }, to: { gateId: 'reg_a_0', pinIndex: 0 }, isActive: true },
    { id: 'b1_to_a1', from: { gateId: 'reg_b_1', pinIndex: 0 }, to: { gateId: 'reg_a_1', pinIndex: 0 }, isActive: false },
    { id: 'b2_to_a2', from: { gateId: 'reg_b_2', pinIndex: 0 }, to: { gateId: 'reg_a_2', pinIndex: 0 }, isActive: false },
    // 加算器入力
    { id: 'a0_to_xor0', from: { gateId: 'reg_a_0', pinIndex: 0 }, to: { gateId: 'xor_0', pinIndex: 0 }, isActive: false },
    { id: 'b0_to_xor0', from: { gateId: 'reg_b_0', pinIndex: 0 }, to: { gateId: 'xor_0', pinIndex: 1 }, isActive: true },
    { id: 'a0_to_and0', from: { gateId: 'reg_a_0', pinIndex: 0 }, to: { gateId: 'and_0', pinIndex: 0 }, isActive: false },
    { id: 'b0_to_and0', from: { gateId: 'reg_b_0', pinIndex: 0 }, to: { gateId: 'and_0', pinIndex: 1 }, isActive: true },
    { id: 'a1_to_xor1a', from: { gateId: 'reg_a_1', pinIndex: 0 }, to: { gateId: 'xor_1a', pinIndex: 0 }, isActive: false },
    { id: 'b1_to_xor1a', from: { gateId: 'reg_b_1', pinIndex: 0 }, to: { gateId: 'xor_1a', pinIndex: 1 }, isActive: false },
    { id: 'xor1a_to_xor1b', from: { gateId: 'xor_1a', pinIndex: 0 }, to: { gateId: 'xor_1b', pinIndex: 0 }, isActive: false },
    { id: 'carry0_to_xor1b', from: { gateId: 'and_0', pinIndex: 0 }, to: { gateId: 'xor_1b', pinIndex: 1 }, isActive: false },
    { id: 'a1_to_and1a', from: { gateId: 'reg_a_1', pinIndex: 0 }, to: { gateId: 'and_1a', pinIndex: 0 }, isActive: false },
    { id: 'b1_to_and1a', from: { gateId: 'reg_b_1', pinIndex: 0 }, to: { gateId: 'and_1a', pinIndex: 1 }, isActive: false },
    { id: 'xor1a_to_and1b', from: { gateId: 'xor_1a', pinIndex: 0 }, to: { gateId: 'and_1b', pinIndex: 0 }, isActive: false },
    { id: 'carry0_to_and1b', from: { gateId: 'and_0', pinIndex: 0 }, to: { gateId: 'and_1b', pinIndex: 1 }, isActive: false },
    { id: 'and1a_to_or1', from: { gateId: 'and_1a', pinIndex: 0 }, to: { gateId: 'or_1', pinIndex: 0 }, isActive: false },
    { id: 'and1b_to_or1', from: { gateId: 'and_1b', pinIndex: 0 }, to: { gateId: 'or_1', pinIndex: 1 }, isActive: false },
    // B = A + B
    { id: 'sum0_to_b0', from: { gateId: 'xor_0', pinIndex: 0 }, to: { gateId: 'reg_b_0', pinIndex: 0 }, isActive: true },
    { id: 'sum1_to_b1', from: { gateId: 'xor_1b', pinIndex: 0 }, to: { gateId: 'reg_b_1', pinIndex: 0 }, isActive: false },
    { id: 'carry_to_b2', from: { gateId: 'or_1', pinIndex: 0 }, to: { gateId: 'reg_b_2', pinIndex: 0 }, isActive: false },
    // 出力接続
    { id: 'sum0_to_out', from: { gateId: 'xor_0', pinIndex: 0 }, to: { gateId: 'out_fib_0', pinIndex: 0 }, isActive: true },
    { id: 'sum1_to_out', from: { gateId: 'xor_1b', pinIndex: 0 }, to: { gateId: 'out_fib_1', pinIndex: 0 }, isActive: false },
    { id: 'carry_to_out_fib2', from: { gateId: 'or_1', pinIndex: 0 }, to: { gateId: 'out_fib_2', pinIndex: 0 }, isActive: false },
    // A値観測
    { id: 'a0_to_out_a0', from: { gateId: 'reg_a_0', pinIndex: 0 }, to: { gateId: 'out_a_0', pinIndex: 0 }, isActive: false },
    { id: 'a1_to_out_a1', from: { gateId: 'reg_a_1', pinIndex: 0 }, to: { gateId: 'out_a_1', pinIndex: 0 }, isActive: false },
    { id: 'a2_to_out_a2', from: { gateId: 'reg_a_2', pinIndex: 0 }, to: { gateId: 'out_a_2', pinIndex: 0 }, isActive: false },
    // B値観測
    { id: 'b0_to_out_b0', from: { gateId: 'reg_b_0', pinIndex: 0 }, to: { gateId: 'out_b_0', pinIndex: 0 }, isActive: true },
    { id: 'b1_to_out_b1', from: { gateId: 'reg_b_1', pinIndex: 0 }, to: { gateId: 'out_b_1', pinIndex: 0 }, isActive: false },
    { id: 'b2_to_out_b2', from: { gateId: 'reg_b_2', pinIndex: 0 }, to: { gateId: 'out_b_2', pinIndex: 0 }, isActive: false },
  ],
};

/**
 * ジョンソンカウンター
 * 4ビットシフトレジスタ with 反転フィードバック
 */
export const JOHNSON_COUNTER: EvaluationCircuit = {
  gates: [
    // CLOCK (1Hz)
    {
      id: 'clock',
      type: 'CLOCK',
      position: { x: 100, y: 200 },
      inputs: [],
      outputs: [false],
      metadata: { frequency: 1, isRunning: true },
    },
    // 4ビットシフトレジスタ
    {
      id: 'dff0',
      type: 'D-FF',
      position: { x: 200, y: 200 },
      inputs: [true, false], // [D=反転フィードバック初期値, CLK]
      outputs: [false, true], // [Q=0, Q̄=1]
    },
    {
      id: 'dff1',
      type: 'D-FF',
      position: { x: 300, y: 200 },
      inputs: [false, false],
      outputs: [false, true],
    },
    {
      id: 'dff2',
      type: 'D-FF',
      position: { x: 400, y: 200 },
      inputs: [false, false],
      outputs: [false, true],
    },
    {
      id: 'dff3',
      type: 'D-FF',
      position: { x: 500, y: 200 },
      inputs: [false, false],
      outputs: [false, true],
    },
    // 反転フィードバック用NOTゲート
    {
      id: 'not_feedback',
      type: 'NOT',
      position: { x: 550, y: 100 },
      inputs: [false], // dff3の出力
      outputs: [true], // 反転された値
    },
    // 各ビットの出力表示（LED）
    {
      id: 'led0',
      type: 'OUTPUT',
      position: { x: 200, y: 300 },
      inputs: [false],
      outputs: [],
    },
    {
      id: 'led1',
      type: 'OUTPUT',
      position: { x: 300, y: 300 },
      inputs: [false],
      outputs: [],
    },
    {
      id: 'led2',
      type: 'OUTPUT',
      position: { x: 400, y: 300 },
      inputs: [false],
      outputs: [],
    },
    {
      id: 'led3',
      type: 'OUTPUT',
      position: { x: 500, y: 300 },
      inputs: [false],
      outputs: [],
    },
    // パターン解析用ゲート
    {
      id: 'pattern_a',
      type: 'AND',
      position: { x: 650, y: 150 },
      inputs: [false, false], // dff0 & dff2
      outputs: [false],
    },
    {
      id: 'pattern_b',
      type: 'AND',
      position: { x: 650, y: 200 },
      inputs: [false, false], // dff1 & dff3
      outputs: [false],
    },
    {
      id: 'pattern_c',
      type: 'XOR',
      position: { x: 650, y: 250 },
      inputs: [false, false], // dff0 ^ dff3
      outputs: [false],
    },
    // パターン出力
    {
      id: 'out_pattern_a',
      type: 'OUTPUT',
      position: { x: 750, y: 150 },
      inputs: [false],
      outputs: [],
    },
    {
      id: 'out_pattern_b',
      type: 'OUTPUT',
      position: { x: 750, y: 200 },
      inputs: [false],
      outputs: [],
    },
    {
      id: 'out_pattern_c',
      type: 'OUTPUT',
      position: { x: 750, y: 250 },
      inputs: [false],
      outputs: [],
    },
  ],
  wires: [
    // クロック分配
    { id: 'clk_dff0', from: { gateId: 'clock', pinIndex: 0 }, to: { gateId: 'dff0', pinIndex: 1 }, isActive: false },
    { id: 'clk_dff1', from: { gateId: 'clock', pinIndex: 0 }, to: { gateId: 'dff1', pinIndex: 1 }, isActive: false },
    { id: 'clk_dff2', from: { gateId: 'clock', pinIndex: 0 }, to: { gateId: 'dff2', pinIndex: 1 }, isActive: false },
    { id: 'clk_dff3', from: { gateId: 'clock', pinIndex: 0 }, to: { gateId: 'dff3', pinIndex: 1 }, isActive: false },
    // シフトレジスタ接続
    { id: 'shift_0_1', from: { gateId: 'dff0', pinIndex: 0 }, to: { gateId: 'dff1', pinIndex: 0 }, isActive: false },
    { id: 'shift_1_2', from: { gateId: 'dff1', pinIndex: 0 }, to: { gateId: 'dff2', pinIndex: 0 }, isActive: false },
    { id: 'shift_2_3', from: { gateId: 'dff2', pinIndex: 0 }, to: { gateId: 'dff3', pinIndex: 0 }, isActive: false },
    // 反転フィードバック
    { id: 'feedback_to_not', from: { gateId: 'dff3', pinIndex: 0 }, to: { gateId: 'not_feedback', pinIndex: 0 }, isActive: false },
    { id: 'inverted_feedback', from: { gateId: 'not_feedback', pinIndex: 0 }, to: { gateId: 'dff0', pinIndex: 0 }, isActive: true },
    // LED出力
    { id: 'dff0_to_led0', from: { gateId: 'dff0', pinIndex: 0 }, to: { gateId: 'led0', pinIndex: 0 }, isActive: false },
    { id: 'dff1_to_led1', from: { gateId: 'dff1', pinIndex: 0 }, to: { gateId: 'led1', pinIndex: 0 }, isActive: false },
    { id: 'dff2_to_led2', from: { gateId: 'dff2', pinIndex: 0 }, to: { gateId: 'led2', pinIndex: 0 }, isActive: false },
    { id: 'dff3_to_led3', from: { gateId: 'dff3', pinIndex: 0 }, to: { gateId: 'led3', pinIndex: 0 }, isActive: false },
    // パターン分析
    { id: 'pattern_a_in0', from: { gateId: 'dff0', pinIndex: 0 }, to: { gateId: 'pattern_a', pinIndex: 0 }, isActive: false },
    { id: 'pattern_a_in1', from: { gateId: 'dff2', pinIndex: 0 }, to: { gateId: 'pattern_a', pinIndex: 1 }, isActive: false },
    { id: 'pattern_b_in0', from: { gateId: 'dff1', pinIndex: 0 }, to: { gateId: 'pattern_b', pinIndex: 0 }, isActive: false },
    { id: 'pattern_b_in1', from: { gateId: 'dff3', pinIndex: 0 }, to: { gateId: 'pattern_b', pinIndex: 1 }, isActive: false },
    { id: 'pattern_c_in0', from: { gateId: 'dff0', pinIndex: 0 }, to: { gateId: 'pattern_c', pinIndex: 0 }, isActive: false },
    { id: 'pattern_c_in1', from: { gateId: 'dff3', pinIndex: 0 }, to: { gateId: 'pattern_c', pinIndex: 1 }, isActive: false },
    // パターン出力
    { id: 'pattern_a_out', from: { gateId: 'pattern_a', pinIndex: 0 }, to: { gateId: 'out_pattern_a', pinIndex: 0 }, isActive: false },
    { id: 'pattern_b_out', from: { gateId: 'pattern_b', pinIndex: 0 }, to: { gateId: 'out_pattern_b', pinIndex: 0 }, isActive: false },
    { id: 'pattern_c_out', from: { gateId: 'pattern_c', pinIndex: 0 }, to: { gateId: 'out_pattern_c', pinIndex: 0 }, isActive: false },
  ],
};

/**
 * カオス発生器（LFSR）
 * 4ビット線形フィードバックシフトレジスタ
 */
export const CHAOS_GENERATOR: EvaluationCircuit = {
  gates: [
    // CLOCK (2Hz)
    {
      id: 'clock',
      type: 'CLOCK',
      position: { x: 100, y: 150 },
      inputs: [],
      outputs: [false],
      metadata: { frequency: 2, isRunning: true },
    },
    // 4ビットシフトレジスタ - 初期値 [1, 0, 1, 0]
    {
      id: 'dff1',
      type: 'D-FF',
      position: { x: 200, y: 200 },
      inputs: [false, false], // [D, CLK]
      outputs: [true, false], // [Q=1, Q̄=0]
    },
    {
      id: 'dff2',
      type: 'D-FF',
      position: { x: 300, y: 200 },
      inputs: [true, false],
      outputs: [false, true], // [Q=0, Q̄=1]
    },
    {
      id: 'dff3',
      type: 'D-FF',
      position: { x: 400, y: 200 },
      inputs: [false, false],
      outputs: [true, false], // [Q=1, Q̄=0]
    },
    {
      id: 'dff4',
      type: 'D-FF',
      position: { x: 500, y: 200 },
      inputs: [true, false],
      outputs: [false, true], // [Q=0, Q̄=1]
    },
    // XORフィードバック（多項式: x^4 + x^3 + 1）
    {
      id: 'xor_feedback',
      type: 'XOR',
      position: { x: 350, y: 100 },
      inputs: [true, false], // dff3=1, dff4=0
      outputs: [true], // 1 XOR 0 = 1
    },
    // 出力観測用
    {
      id: 'out_bit3',
      type: 'OUTPUT',
      position: { x: 200, y: 300 },
      inputs: [true], // dff1の出力
      outputs: [],
    },
    {
      id: 'out_bit2',
      type: 'OUTPUT',
      position: { x: 300, y: 300 },
      inputs: [false], // dff2の出力
      outputs: [],
    },
    {
      id: 'out_bit1',
      type: 'OUTPUT',
      position: { x: 400, y: 300 },
      inputs: [true], // dff3の出力
      outputs: [],
    },
    {
      id: 'out_bit0',
      type: 'OUTPUT',
      position: { x: 500, y: 300 },
      inputs: [false], // dff4の出力
      outputs: [],
    },
    // ランダム出力
    {
      id: 'random_output',
      type: 'OUTPUT',
      position: { x: 600, y: 200 },
      inputs: [false], // dff4の出力
      outputs: [],
    },
  ],
  wires: [
    // クロック分配
    { id: 'clk_dff1', from: { gateId: 'clock', pinIndex: 0 }, to: { gateId: 'dff1', pinIndex: 1 }, isActive: false },
    { id: 'clk_dff2', from: { gateId: 'clock', pinIndex: 0 }, to: { gateId: 'dff2', pinIndex: 1 }, isActive: false },
    { id: 'clk_dff3', from: { gateId: 'clock', pinIndex: 0 }, to: { gateId: 'dff3', pinIndex: 1 }, isActive: false },
    { id: 'clk_dff4', from: { gateId: 'clock', pinIndex: 0 }, to: { gateId: 'dff4', pinIndex: 1 }, isActive: false },
    // シフトレジスタ接続
    { id: 'shift_1_2', from: { gateId: 'dff1', pinIndex: 0 }, to: { gateId: 'dff2', pinIndex: 0 }, isActive: true },
    { id: 'shift_2_3', from: { gateId: 'dff2', pinIndex: 0 }, to: { gateId: 'dff3', pinIndex: 0 }, isActive: false },
    { id: 'shift_3_4', from: { gateId: 'dff3', pinIndex: 0 }, to: { gateId: 'dff4', pinIndex: 0 }, isActive: true },
    // XORフィードバック
    { id: 'feedback_tap3', from: { gateId: 'dff3', pinIndex: 0 }, to: { gateId: 'xor_feedback', pinIndex: 0 }, isActive: true },
    { id: 'feedback_tap4', from: { gateId: 'dff4', pinIndex: 0 }, to: { gateId: 'xor_feedback', pinIndex: 1 }, isActive: false },
    { id: 'feedback_loop', from: { gateId: 'xor_feedback', pinIndex: 0 }, to: { gateId: 'dff1', pinIndex: 0 }, isActive: true },
    // 出力観測
    { id: 'observe_bit3', from: { gateId: 'dff1', pinIndex: 0 }, to: { gateId: 'out_bit3', pinIndex: 0 }, isActive: true },
    { id: 'observe_bit2', from: { gateId: 'dff2', pinIndex: 0 }, to: { gateId: 'out_bit2', pinIndex: 0 }, isActive: false },
    { id: 'observe_bit1', from: { gateId: 'dff3', pinIndex: 0 }, to: { gateId: 'out_bit1', pinIndex: 0 }, isActive: true },
    { id: 'observe_bit0', from: { gateId: 'dff4', pinIndex: 0 }, to: { gateId: 'out_bit0', pinIndex: 0 }, isActive: false },
    // ランダム出力
    { id: 'random_tap', from: { gateId: 'dff4', pinIndex: 0 }, to: { gateId: 'random_output', pinIndex: 0 }, isActive: false },
  ],
};

/**
 * SRラッチ（基本ゲート版）
 * NORゲート2つで作る最も基本的な記憶回路
 */
export const SR_LATCH_BASIC: EvaluationCircuit = {
  gates: [
    // 入力
    {
      id: 'S',
      type: 'INPUT',
      position: { x: 100, y: 100 },
      inputs: [],
      outputs: [false], // S=0
    },
    {
      id: 'R',
      type: 'INPUT',
      position: { x: 100, y: 300 },
      inputs: [],
      outputs: [false], // R=0
    },
    // NORゲート - 初期状態を設定（Q=1, Q̄=0）
    {
      id: 'NOR1',
      type: 'NOR',
      position: { x: 300, y: 150 },
      inputs: [false, false], // [R, Q̄]
      outputs: [true], // Q = 1
    },
    {
      id: 'NOR2',
      type: 'NOR',
      position: { x: 300, y: 250 },
      inputs: [false, true], // [S, Q]
      outputs: [false], // Q̄ = 0
    },
    // 出力
    {
      id: 'Q',
      type: 'OUTPUT',
      position: { x: 500, y: 150 },
      inputs: [true], // NOR1の出力
      outputs: [],
    },
    {
      id: 'Q_BAR',
      type: 'OUTPUT',
      position: { x: 500, y: 250 },
      inputs: [false], // NOR2の出力
      outputs: [],
    },
  ],
  wires: [
    // R → NOR1（Q側）の1番目の入力
    {
      id: 'w1',
      from: { gateId: 'R', pinIndex: 0 },
      to: { gateId: 'NOR1', pinIndex: 0 },
      isActive: false,
    },
    // S → NOR2（Q̄側）の1番目の入力
    {
      id: 'w2',
      from: { gateId: 'S', pinIndex: 0 },
      to: { gateId: 'NOR2', pinIndex: 0 },
      isActive: false,
    },
    // NOR1 → Q
    {
      id: 'w3',
      from: { gateId: 'NOR1', pinIndex: 0 },
      to: { gateId: 'Q', pinIndex: 0 },
      isActive: true,
    },
    // NOR2 → Q_BAR
    {
      id: 'w4',
      from: { gateId: 'NOR2', pinIndex: 0 },
      to: { gateId: 'Q_BAR', pinIndex: 0 },
      isActive: false,
    },
    // クロスカップリング: NOR1 → NOR2
    {
      id: 'w5',
      from: { gateId: 'NOR1', pinIndex: 0 },
      to: { gateId: 'NOR2', pinIndex: 1 },
      isActive: true,
    },
    // クロスカップリング: NOR2 → NOR1
    {
      id: 'w6',
      from: { gateId: 'NOR2', pinIndex: 0 },
      to: { gateId: 'NOR1', pinIndex: 1 },
      isActive: false,
    },
  ],
};

// SELF_OSCILLATING_MEMORY_FINAL removed - use individual file instead

/**
 * 全Pure回路のマップ
 */
export const PURE_CIRCUITS = {
  'half-adder': HALF_ADDER,
  decoder: DECODER,
  'parity-checker': PARITY_CHECKER,
  'majority-voter': MAJORITY_VOTER,
  'simple-lfsr': SIMPLE_LFSR,
  'sr-latch': SR_LATCH,
  'basic-dff': BASIC_DFF,
  'simple-ring-oscillator': SIMPLE_RING_OSCILLATOR,
  // 'mandala-circuit': MANDALA_CIRCUIT, // 38ゲート版を使用するため削除
  '4bit-comparator': FOUR_BIT_COMPARATOR,
  'seven-segment': SEVEN_SEGMENT,
  'fibonacci-counter': FIBONACCI_COUNTER,
  'johnson-counter': JOHNSON_COUNTER,
  'chaos-generator': CHAOS_GENERATOR,
  'sr-latch-basic': SR_LATCH_BASIC,
  // 'self-oscillating-memory-final': removed - use individual file
} as const;

export type EvaluationCircuitId = keyof typeof PURE_CIRCUITS;
