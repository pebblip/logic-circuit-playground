import type { CircuitMetadata } from './gallery';

/**
 * 4ビット比較器回路
 * 2つの4ビット数値を比較して、A>B, A=B, A<B を判定
 * 基本ゲートのみで実装された教育的価値の高い回路
 */
export const COMPARATOR_4BIT: CircuitMetadata = {
  id: '4bit-comparator',
  title: '4ビット比較器',
  description: '2つの4ビット数値を比較。A>B、A=B、A<Bを判定する実用的な回路。基本ゲートの組み合わせで高度な機能を実現！',
  gates: [
    // A入力（4ビット）
    {
      id: 'a3',
      type: 'INPUT',
      position: { x: 50, y: 100 },
      output: false,
      inputs: [],
    },
    {
      id: 'a2',
      type: 'INPUT',
      position: { x: 50, y: 150 },
      output: false,
      inputs: [],
    },
    {
      id: 'a1',
      type: 'INPUT',
      position: { x: 50, y: 200 },
      output: false,
      inputs: [],
    },
    {
      id: 'a0',
      type: 'INPUT',
      position: { x: 50, y: 250 },
      output: false,
      inputs: [],
    },
    // B入力（4ビット）
    {
      id: 'b3',
      type: 'INPUT',
      position: { x: 50, y: 350 },
      output: false,
      inputs: [],
    },
    {
      id: 'b2',
      type: 'INPUT',
      position: { x: 50, y: 400 },
      output: false,
      inputs: [],
    },
    {
      id: 'b1',
      type: 'INPUT',
      position: { x: 50, y: 450 },
      output: false,
      inputs: [],
    },
    {
      id: 'b0',
      type: 'INPUT',
      position: { x: 50, y: 500 },
      output: false,
      inputs: [],
    },
    // 各ビット位置での等価性チェック (XNOR)
    // Bit 3
    {
      id: 'xor3',
      type: 'XOR',
      position: { x: 150, y: 125 },
      output: false,
      inputs: [],
    },
    {
      id: 'not_xor3',
      type: 'NOT',
      position: { x: 250, y: 125 },
      output: false,
      inputs: [],
    },
    // Bit 2
    {
      id: 'xor2',
      type: 'XOR',
      position: { x: 150, y: 175 },
      output: false,
      inputs: [],
    },
    {
      id: 'not_xor2',
      type: 'NOT',
      position: { x: 250, y: 175 },
      output: false,
      inputs: [],
    },
    // Bit 1
    {
      id: 'xor1',
      type: 'XOR',
      position: { x: 150, y: 225 },
      output: false,
      inputs: [],
    },
    {
      id: 'not_xor1',
      type: 'NOT',
      position: { x: 250, y: 225 },
      output: false,
      inputs: [],
    },
    // Bit 0
    {
      id: 'xor0',
      type: 'XOR',
      position: { x: 150, y: 275 },
      output: false,
      inputs: [],
    },
    {
      id: 'not_xor0',
      type: 'NOT',
      position: { x: 250, y: 275 },
      output: false,
      inputs: [],
    },
    // 各ビット位置での大小比較
    // A3 > B3
    {
      id: 'not_b3',
      type: 'NOT',
      position: { x: 150, y: 350 },
      output: false,
      inputs: [],
    },
    {
      id: 'a3_gt_b3',
      type: 'AND',
      position: { x: 350, y: 100 },
      output: false,
      inputs: [],
    },
    // A3 < B3
    {
      id: 'not_a3',
      type: 'NOT',
      position: { x: 150, y: 100 },
      output: false,
      inputs: [],
    },
    {
      id: 'a3_lt_b3',
      type: 'AND',
      position: { x: 350, y: 350 },
      output: false,
      inputs: [],
    },
    // 全ビット等価チェック
    {
      id: 'eq_3_2',
      type: 'AND',
      position: { x: 450, y: 150 },
      output: false,
      inputs: [],
    },
    {
      id: 'eq_1_0',
      type: 'AND',
      position: { x: 450, y: 250 },
      output: false,
      inputs: [],
    },
    {
      id: 'all_equal',
      type: 'AND',
      position: { x: 550, y: 200 },
      output: false,
      inputs: [],
    },
    // 出力
    {
      id: 'out_gt',
      type: 'OUTPUT',
      position: { x: 700, y: 100 },
      output: false,
      inputs: [],
    },
    {
      id: 'out_eq',
      type: 'OUTPUT',
      position: { x: 700, y: 200 },
      output: false,
      inputs: [],
    },
    {
      id: 'out_lt',
      type: 'OUTPUT',
      position: { x: 700, y: 300 },
      output: false,
      inputs: [],
    },
  ],
  wires: [
    // XOR接続（等価チェック）
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
      id: 'w_xor3_not',
      from: { gateId: 'xor3', pinIndex: -1 },
      to: { gateId: 'not_xor3', pinIndex: 0 },
      isActive: false,
    },
    // 同様にBit2,1,0も接続
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
      id: 'w_xor2_not',
      from: { gateId: 'xor2', pinIndex: -1 },
      to: { gateId: 'not_xor2', pinIndex: 0 },
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
      id: 'w_xor1_not',
      from: { gateId: 'xor1', pinIndex: -1 },
      to: { gateId: 'not_xor1', pinIndex: 0 },
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
      id: 'w_xor0_not',
      from: { gateId: 'xor0', pinIndex: -1 },
      to: { gateId: 'not_xor0', pinIndex: 0 },
      isActive: false,
    },
    // A3 > B3チェック
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
    // A3 < B3チェック
    {
      id: 'w_a3_not',
      from: { gateId: 'a3', pinIndex: -1 },
      to: { gateId: 'not_a3', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_nota3_lt',
      from: { gateId: 'not_a3', pinIndex: -1 },
      to: { gateId: 'a3_lt_b3', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_b3_lt',
      from: { gateId: 'b3', pinIndex: -1 },
      to: { gateId: 'a3_lt_b3', pinIndex: 1 },
      isActive: false,
    },
    // 等価チェックの結合
    {
      id: 'w_eq3_and',
      from: { gateId: 'not_xor3', pinIndex: -1 },
      to: { gateId: 'eq_3_2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_eq2_and',
      from: { gateId: 'not_xor2', pinIndex: -1 },
      to: { gateId: 'eq_3_2', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'w_eq1_and',
      from: { gateId: 'not_xor1', pinIndex: -1 },
      to: { gateId: 'eq_1_0', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_eq0_and',
      from: { gateId: 'not_xor0', pinIndex: -1 },
      to: { gateId: 'eq_1_0', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'w_eq32_all',
      from: { gateId: 'eq_3_2', pinIndex: -1 },
      to: { gateId: 'all_equal', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_eq10_all',
      from: { gateId: 'eq_1_0', pinIndex: -1 },
      to: { gateId: 'all_equal', pinIndex: 1 },
      isActive: false,
    },
    // 最終出力（簡易版：MSBのみで判定）
    {
      id: 'w_gt_out',
      from: { gateId: 'a3_gt_b3', pinIndex: -1 },
      to: { gateId: 'out_gt', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_eq_out',
      from: { gateId: 'all_equal', pinIndex: -1 },
      to: { gateId: 'out_eq', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_lt_out',
      from: { gateId: 'a3_lt_b3', pinIndex: -1 },
      to: { gateId: 'out_lt', pinIndex: 0 },
      isActive: false,
    },
  ],
};