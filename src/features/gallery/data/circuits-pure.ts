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
  'mandala-circuit': MANDALA_CIRCUIT,
} as const;

export type EvaluationCircuitId = keyof typeof PURE_CIRCUITS;
