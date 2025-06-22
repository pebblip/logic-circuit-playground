import type { CircuitMetadata } from './gallery';

/**
 * 4ビット比較器回路（シンプル版）
 * 2つの4ビット数値を比較して、A>B, A=B, A<B を判定
 * 標準的な階層比較ロジックを使用（約26ゲート）
 * A=5, B=3でデモンストレーション（A>Bが光る）
 */
export const COMPARATOR_4BIT: CircuitMetadata = {
  id: '4bit-comparator',
  title: '4ビット比較器（シンプル版）',
  description:
    '2つの4ビット数値を比較。A>B、A=B、A<Bを判定する教育的回路。標準的な階層比較ロジック！',
  gates: [
    // A入力（4ビット）- A=5 (0101)
    {
      id: 'a3',
      type: 'INPUT',
      position: { x: 50, y: 100 },
      outputs: [false], // MSB of 5
      inputs: [],
    },
    {
      id: 'a2',
      type: 'INPUT',
      position: { x: 50, y: 130 },
      outputs: [true], // bit 2 of 5
      inputs: [],
    },
    {
      id: 'a1',
      type: 'INPUT',
      position: { x: 50, y: 160 },
      outputs: [false], // bit 1 of 5
      inputs: [],
    },
    {
      id: 'a0',
      type: 'INPUT',
      position: { x: 50, y: 190 },
      outputs: [true], // LSB of 5
      inputs: [],
    },

    // B入力（4ビット）- B=3 (0011)
    {
      id: 'b3',
      type: 'INPUT',
      position: { x: 50, y: 250 },
      outputs: [false], // MSB of 3
      inputs: [],
    },
    {
      id: 'b2',
      type: 'INPUT',
      position: { x: 50, y: 280 },
      outputs: [false], // bit 2 of 3
      inputs: [],
    },
    {
      id: 'b1',
      type: 'INPUT',
      position: { x: 50, y: 310 },
      outputs: [true], // bit 1 of 3
      inputs: [],
    },
    {
      id: 'b0',
      type: 'INPUT',
      position: { x: 50, y: 340 },
      outputs: [true], // LSB of 3
      inputs: [],
    },

    // 各ビット等価性チェック（XNOR実装）
    {
      id: 'xor3',
      type: 'XOR',
      position: { x: 150, y: 100 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'eq3',
      type: 'NOT',
      position: { x: 200, y: 100 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'xor2',
      type: 'XOR',
      position: { x: 150, y: 130 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'eq2',
      type: 'NOT',
      position: { x: 200, y: 130 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'xor1',
      type: 'XOR',
      position: { x: 150, y: 160 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'eq1',
      type: 'NOT',
      position: { x: 200, y: 160 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'xor0',
      type: 'XOR',
      position: { x: 150, y: 190 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'eq0',
      type: 'NOT',
      position: { x: 200, y: 190 },
      outputs: [false],
      inputs: [],
    },

    // 各ビット A > B チェック（Ai AND NOT Bi）
    {
      id: 'not_b3',
      type: 'NOT',
      position: { x: 150, y: 250 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'a3_gt_b3',
      type: 'AND',
      position: { x: 250, y: 100 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'not_b2',
      type: 'NOT',
      position: { x: 150, y: 280 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'a2_gt_b2',
      type: 'AND',
      position: { x: 250, y: 130 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'not_b1',
      type: 'NOT',
      position: { x: 150, y: 310 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'a1_gt_b1',
      type: 'AND',
      position: { x: 250, y: 160 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'not_b0',
      type: 'NOT',
      position: { x: 150, y: 340 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'a0_gt_b0',
      type: 'AND',
      position: { x: 250, y: 190 },
      outputs: [false],
      inputs: [],
    },

    // 階層条件のAND（等価性の累積）
    {
      id: 'eq3_eq2',
      type: 'AND',
      position: { x: 300, y: 130 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'eq3_eq2_eq1',
      type: 'AND',
      position: { x: 350, y: 160 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'eq3_eq2_eq1_eq0',
      type: 'AND',
      position: { x: 400, y: 190 },
      outputs: [false],
      inputs: [],
    },

    // A > B の階層条件
    {
      id: 'gt_cond2',
      type: 'AND',
      position: { x: 350, y: 130 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'gt_cond1',
      type: 'AND',
      position: { x: 400, y: 160 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'gt_cond0',
      type: 'AND',
      position: { x: 450, y: 190 },
      outputs: [false],
      inputs: [],
    },

    // A > B の最終OR
    {
      id: 'gt_temp1',
      type: 'OR',
      position: { x: 500, y: 100 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'gt_temp2',
      type: 'OR',
      position: { x: 550, y: 130 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'a_gt_b',
      type: 'OR',
      position: { x: 600, y: 150 },
      outputs: [false],
      inputs: [],
    },

    // A = B の最終AND
    {
      id: 'a_eq_b',
      type: 'AND',
      position: { x: 450, y: 250 },
      outputs: [false],
      inputs: [],
    },

    // A < B の計算（NOT(A>B) AND NOT(A=B)）
    {
      id: 'not_gt',
      type: 'NOT',
      position: { x: 650, y: 150 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'not_eq',
      type: 'NOT',
      position: { x: 500, y: 250 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'a_lt_b',
      type: 'AND',
      position: { x: 700, y: 200 },
      outputs: [false],
      inputs: [],
    },

    // 出力
    {
      id: 'out_gt',
      type: 'OUTPUT',
      position: { x: 750, y: 150 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_eq',
      type: 'OUTPUT',
      position: { x: 550, y: 250 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_lt',
      type: 'OUTPUT',
      position: { x: 750, y: 200 },
      outputs: [false],
      inputs: [],
    },
  ],
  wires: [
    // === 等価性チェック配線 ===
    {
      id: 'w_a3_xor3',
      from: { gateId: 'a3', pinIndex: -1 },
      to: { gateId: 'xor3', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_b3_xor3',
      from: { gateId: 'b3', pinIndex: -1 },
      to: { gateId: 'xor3', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'w_xor3_eq3',
      from: { gateId: 'xor3', pinIndex: -1 },
      to: { gateId: 'eq3', pinIndex: 0 },
      isActive: false,
    },

    {
      id: 'w_a2_xor2',
      from: { gateId: 'a2', pinIndex: -1 },
      to: { gateId: 'xor2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_b2_xor2',
      from: { gateId: 'b2', pinIndex: -1 },
      to: { gateId: 'xor2', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'w_xor2_eq2',
      from: { gateId: 'xor2', pinIndex: -1 },
      to: { gateId: 'eq2', pinIndex: 0 },
      isActive: false,
    },

    {
      id: 'w_a1_xor1',
      from: { gateId: 'a1', pinIndex: -1 },
      to: { gateId: 'xor1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_b1_xor1',
      from: { gateId: 'b1', pinIndex: -1 },
      to: { gateId: 'xor1', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'w_xor1_eq1',
      from: { gateId: 'xor1', pinIndex: -1 },
      to: { gateId: 'eq1', pinIndex: 0 },
      isActive: false,
    },

    {
      id: 'w_a0_xor0',
      from: { gateId: 'a0', pinIndex: -1 },
      to: { gateId: 'xor0', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_b0_xor0',
      from: { gateId: 'b0', pinIndex: -1 },
      to: { gateId: 'xor0', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'w_xor0_eq0',
      from: { gateId: 'xor0', pinIndex: -1 },
      to: { gateId: 'eq0', pinIndex: 0 },
      isActive: false,
    },

    // === A > B チェック配線 ===
    {
      id: 'w_b3_not',
      from: { gateId: 'b3', pinIndex: -1 },
      to: { gateId: 'not_b3', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_a3_gt',
      from: { gateId: 'a3', pinIndex: -1 },
      to: { gateId: 'a3_gt_b3', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_notb3_gt',
      from: { gateId: 'not_b3', pinIndex: -1 },
      to: { gateId: 'a3_gt_b3', pinIndex: 1 },
      isActive: false,
    },

    {
      id: 'w_b2_not',
      from: { gateId: 'b2', pinIndex: -1 },
      to: { gateId: 'not_b2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_a2_gt',
      from: { gateId: 'a2', pinIndex: -1 },
      to: { gateId: 'a2_gt_b2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_notb2_gt',
      from: { gateId: 'not_b2', pinIndex: -1 },
      to: { gateId: 'a2_gt_b2', pinIndex: 1 },
      isActive: false,
    },

    {
      id: 'w_b1_not',
      from: { gateId: 'b1', pinIndex: -1 },
      to: { gateId: 'not_b1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_a1_gt',
      from: { gateId: 'a1', pinIndex: -1 },
      to: { gateId: 'a1_gt_b1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_notb1_gt',
      from: { gateId: 'not_b1', pinIndex: -1 },
      to: { gateId: 'a1_gt_b1', pinIndex: 1 },
      isActive: false,
    },

    {
      id: 'w_b0_not',
      from: { gateId: 'b0', pinIndex: -1 },
      to: { gateId: 'not_b0', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_a0_gt',
      from: { gateId: 'a0', pinIndex: -1 },
      to: { gateId: 'a0_gt_b0', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_notb0_gt',
      from: { gateId: 'not_b0', pinIndex: -1 },
      to: { gateId: 'a0_gt_b0', pinIndex: 1 },
      isActive: false,
    },

    // === 等価性の累積配線 ===
    {
      id: 'w_eq3_eq32',
      from: { gateId: 'eq3', pinIndex: -1 },
      to: { gateId: 'eq3_eq2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_eq2_eq32',
      from: { gateId: 'eq2', pinIndex: -1 },
      to: { gateId: 'eq3_eq2', pinIndex: 1 },
      isActive: false,
    },

    {
      id: 'w_eq32_eq321',
      from: { gateId: 'eq3_eq2', pinIndex: -1 },
      to: { gateId: 'eq3_eq2_eq1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_eq1_eq321',
      from: { gateId: 'eq1', pinIndex: -1 },
      to: { gateId: 'eq3_eq2_eq1', pinIndex: 1 },
      isActive: false,
    },

    {
      id: 'w_eq321_eq3210',
      from: { gateId: 'eq3_eq2_eq1', pinIndex: -1 },
      to: { gateId: 'eq3_eq2_eq1_eq0', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_eq0_eq3210',
      from: { gateId: 'eq0', pinIndex: -1 },
      to: { gateId: 'eq3_eq2_eq1_eq0', pinIndex: 1 },
      isActive: false,
    },

    // === A > B 階層条件配線 ===
    {
      id: 'w_eq32_gtcond2',
      from: { gateId: 'eq3_eq2', pinIndex: -1 },
      to: { gateId: 'gt_cond2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_a2gtb2_gtcond2',
      from: { gateId: 'a2_gt_b2', pinIndex: -1 },
      to: { gateId: 'gt_cond2', pinIndex: 1 },
      isActive: false,
    },

    {
      id: 'w_eq321_gtcond1',
      from: { gateId: 'eq3_eq2_eq1', pinIndex: -1 },
      to: { gateId: 'gt_cond1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_a1gtb1_gtcond1',
      from: { gateId: 'a1_gt_b1', pinIndex: -1 },
      to: { gateId: 'gt_cond1', pinIndex: 1 },
      isActive: false,
    },

    {
      id: 'w_eq3210_gtcond0',
      from: { gateId: 'eq3_eq2_eq1_eq0', pinIndex: -1 },
      to: { gateId: 'gt_cond0', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_a0gtb0_gtcond0',
      from: { gateId: 'a0_gt_b0', pinIndex: -1 },
      to: { gateId: 'gt_cond0', pinIndex: 1 },
      isActive: false,
    },

    // === A > B 最終OR配線 ===
    {
      id: 'w_a3gtb3_gtemp1',
      from: { gateId: 'a3_gt_b3', pinIndex: -1 },
      to: { gateId: 'gt_temp1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_gtcond2_gtemp1',
      from: { gateId: 'gt_cond2', pinIndex: -1 },
      to: { gateId: 'gt_temp1', pinIndex: 1 },
      isActive: false,
    },

    {
      id: 'w_gtcond1_gtemp2',
      from: { gateId: 'gt_cond1', pinIndex: -1 },
      to: { gateId: 'gt_temp2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_gtcond0_gtemp2',
      from: { gateId: 'gt_cond0', pinIndex: -1 },
      to: { gateId: 'gt_temp2', pinIndex: 1 },
      isActive: false,
    },

    {
      id: 'w_gtemp1_agtb',
      from: { gateId: 'gt_temp1', pinIndex: -1 },
      to: { gateId: 'a_gt_b', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_gtemp2_agtb',
      from: { gateId: 'gt_temp2', pinIndex: -1 },
      to: { gateId: 'a_gt_b', pinIndex: 1 },
      isActive: false,
    },

    // === A = B 配線 ===
    {
      id: 'w_eq32_aeqb',
      from: { gateId: 'eq3_eq2', pinIndex: -1 },
      to: { gateId: 'a_eq_b', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_eq10_aeqb',
      from: { gateId: 'eq3_eq2_eq1_eq0', pinIndex: -1 },
      to: { gateId: 'a_eq_b', pinIndex: 1 },
      isActive: false,
    },

    // === A < B 配線 ===
    {
      id: 'w_agtb_notgt',
      from: { gateId: 'a_gt_b', pinIndex: -1 },
      to: { gateId: 'not_gt', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_aeqb_noteq',
      from: { gateId: 'a_eq_b', pinIndex: -1 },
      to: { gateId: 'not_eq', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_notgt_altb',
      from: { gateId: 'not_gt', pinIndex: -1 },
      to: { gateId: 'a_lt_b', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_noteq_altb',
      from: { gateId: 'not_eq', pinIndex: -1 },
      to: { gateId: 'a_lt_b', pinIndex: 1 },
      isActive: false,
    },

    // === 出力配線 ===
    {
      id: 'w_agtb_out',
      from: { gateId: 'a_gt_b', pinIndex: -1 },
      to: { gateId: 'out_gt', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_aeqb_out',
      from: { gateId: 'a_eq_b', pinIndex: -1 },
      to: { gateId: 'out_eq', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_altb_out',
      from: { gateId: 'a_lt_b', pinIndex: -1 },
      to: { gateId: 'out_lt', pinIndex: 0 },
      isActive: false,
    },
  ],
};
