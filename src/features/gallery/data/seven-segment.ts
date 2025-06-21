import type { CircuitMetadata } from './gallery';

/**
 * 7セグメントデコーダー（0-3表示）
 * 2ビット入力を7セグメントディスプレイのパターンに変換
 * 実際のデジタル表示の基本原理
 */
export const SEVEN_SEGMENT_DECODER: CircuitMetadata = {
  id: 'seven-segment',
  title: '7セグメントデコーダー',
  description:
    '0から3までの数字を7セグメントディスプレイ用の信号に変換。デジタル時計や電卓の表示原理がわかる！',
  gates: [
    // 2ビット入力（B1 B0で0-3を表現）
    {
      id: 'input_b1',
      type: 'INPUT',
      position: { x: 50, y: 200 },
      output: false,
      inputs: [],
    },
    {
      id: 'input_b0',
      type: 'INPUT',
      position: { x: 50, y: 300 },
      output: false,
      inputs: [],
    },
    // NOT ゲート（入力の反転）
    {
      id: 'not_b1',
      type: 'NOT',
      position: { x: 150, y: 200 },
      output: false,
      inputs: [],
    },
    {
      id: 'not_b0',
      type: 'NOT',
      position: { x: 150, y: 300 },
      output: false,
      inputs: [],
    },
    // セグメントa (0,2,3で点灯) = B1 + B0
    {
      id: 'seg_a',
      type: 'OR',
      position: { x: 350, y: 100 },
      output: false,
      inputs: [],
    },
    // セグメントb (0,1,2,3で点灯) = 常に1
    // → 簡易実装のため、ORゲートで1を作る
    {
      id: 'seg_b',
      type: 'OR',
      position: { x: 350, y: 170 },
      output: false,
      inputs: [],
    },
    // セグメントc (0,1,3で点灯) = NOT B1 + B0
    {
      id: 'seg_c_or',
      type: 'OR',
      position: { x: 350, y: 240 },
      output: false,
      inputs: [],
    },
    // セグメントd (0,2,3で点灯) = B1 + NOT B0
    {
      id: 'seg_d_or',
      type: 'OR',
      position: { x: 350, y: 310 },
      output: false,
      inputs: [],
    },
    // セグメントe (0,2で点灯) = NOT B0
    // → not_b0をそのまま使用

    // セグメントf (0で点灯) = NOT B1 AND NOT B0
    {
      id: 'seg_f_and',
      type: 'AND',
      position: { x: 350, y: 380 },
      output: false,
      inputs: [],
    },
    // セグメントg (2,3で点灯) = B1
    // → input_b1をそのまま使用

    // 7セグメント出力（a-g）
    {
      id: 'out_a',
      type: 'OUTPUT',
      position: { x: 550, y: 100 },
      output: false,
      inputs: [],
    },
    {
      id: 'out_b',
      type: 'OUTPUT',
      position: { x: 550, y: 170 },
      output: false,
      inputs: [],
    },
    {
      id: 'out_c',
      type: 'OUTPUT',
      position: { x: 550, y: 240 },
      output: false,
      inputs: [],
    },
    {
      id: 'out_d',
      type: 'OUTPUT',
      position: { x: 550, y: 310 },
      output: false,
      inputs: [],
    },
    {
      id: 'out_e',
      type: 'OUTPUT',
      position: { x: 550, y: 380 },
      output: false,
      inputs: [],
    },
    {
      id: 'out_f',
      type: 'OUTPUT',
      position: { x: 550, y: 450 },
      output: false,
      inputs: [],
    },
    {
      id: 'out_g',
      type: 'OUTPUT',
      position: { x: 550, y: 520 },
      output: false,
      inputs: [],
    },
  ],
  wires: [
    // NOT接続
    {
      id: 'w_b1_not',
      from: { gateId: 'input_b1', pinIndex: -1 },
      to: { gateId: 'not_b1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_b0_not',
      from: { gateId: 'input_b0', pinIndex: -1 },
      to: { gateId: 'not_b0', pinIndex: 0 },
      isActive: false,
    },
    // セグメントa = B1 OR B0
    {
      id: 'w_b1_seg_a',
      from: { gateId: 'input_b1', pinIndex: -1 },
      to: { gateId: 'seg_a', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_b0_seg_a',
      from: { gateId: 'input_b0', pinIndex: -1 },
      to: { gateId: 'seg_a', pinIndex: 1 },
      isActive: false,
    },
    // セグメントb = 1 (B1 OR B1で代用)
    {
      id: 'w_b1_seg_b1',
      from: { gateId: 'input_b1', pinIndex: -1 },
      to: { gateId: 'seg_b', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_b1_seg_b2',
      from: { gateId: 'input_b1', pinIndex: -1 },
      to: { gateId: 'seg_b', pinIndex: 1 },
      isActive: false,
    },
    // セグメントc = NOT B1 OR B0
    {
      id: 'w_notb1_seg_c',
      from: { gateId: 'not_b1', pinIndex: -1 },
      to: { gateId: 'seg_c_or', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_b0_seg_c',
      from: { gateId: 'input_b0', pinIndex: -1 },
      to: { gateId: 'seg_c_or', pinIndex: 1 },
      isActive: false,
    },
    // セグメントd = B1 OR NOT B0
    {
      id: 'w_b1_seg_d',
      from: { gateId: 'input_b1', pinIndex: -1 },
      to: { gateId: 'seg_d_or', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_notb0_seg_d',
      from: { gateId: 'not_b0', pinIndex: -1 },
      to: { gateId: 'seg_d_or', pinIndex: 1 },
      isActive: false,
    },
    // セグメントf = NOT B1 AND NOT B0
    {
      id: 'w_notb1_seg_f',
      from: { gateId: 'not_b1', pinIndex: -1 },
      to: { gateId: 'seg_f_and', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_notb0_seg_f',
      from: { gateId: 'not_b0', pinIndex: -1 },
      to: { gateId: 'seg_f_and', pinIndex: 1 },
      isActive: false,
    },
    // 出力接続
    {
      id: 'w_seg_a_out',
      from: { gateId: 'seg_a', pinIndex: -1 },
      to: { gateId: 'out_a', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_seg_b_out',
      from: { gateId: 'seg_b', pinIndex: -1 },
      to: { gateId: 'out_b', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_seg_c_out',
      from: { gateId: 'seg_c_or', pinIndex: -1 },
      to: { gateId: 'out_c', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_seg_d_out',
      from: { gateId: 'seg_d_or', pinIndex: -1 },
      to: { gateId: 'out_d', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_seg_e_out',
      from: { gateId: 'not_b0', pinIndex: -1 },
      to: { gateId: 'out_e', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_seg_f_out',
      from: { gateId: 'seg_f_and', pinIndex: -1 },
      to: { gateId: 'out_f', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_seg_g_out',
      from: { gateId: 'input_b1', pinIndex: -1 },
      to: { gateId: 'out_g', pinIndex: 0 },
      isActive: false,
    },
  ],
};
