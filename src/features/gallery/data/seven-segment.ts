import type { GalleryCircuit } from './types';

/**
 * 7セグメントデコーダー（0-3表示）
 * 2ビット入力を7セグメントディスプレイのパターンに変換
 * 実際のデジタル表示の基本原理
 */
export const SEVEN_SEGMENT_DECODER: GalleryCircuit = {
  id: 'seven-segment',
  title: '7セグメントデコーダー',
  description:
    '0から3までの数字を7セグメントディスプレイ用の信号に変換。デジタル時計や電卓の表示原理がわかる！',
  skipAutoLayout: true, // 手動配置されたレイアウトを保持
  gates: [
    // === Layer 0: 2ビット入力 ===
    {
      id: 'input_b1',
      type: 'INPUT',
      position: { x: 100, y: 350 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'input_b0',
      type: 'INPUT',
      position: { x: 100, y: 450 },
      outputs: [false],
      inputs: [],
    },
    // === Layer 1: NOT ゲート ===
    {
      id: 'not_b1',
      type: 'NOT',
      position: { x: 250, y: 350 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'not_b0',
      type: 'NOT',
      position: { x: 250, y: 450 },
      outputs: [false],
      inputs: [],
    },
    // === Layer 2: セグメント論理ゲート ===
    {
      id: 'seg_a',
      type: 'OR',
      position: { x: 400, y: 300 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'seg_b',
      type: 'OR',
      position: { x: 400, y: 350 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'seg_c_or',
      type: 'OR',
      position: { x: 400, y: 400 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'seg_d_or',
      type: 'OR',
      position: { x: 400, y: 450 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'seg_f_and',
      type: 'AND',
      position: { x: 400, y: 500 },
      outputs: [false],
      inputs: [],
    },
    // === Layer 3: 7セグメント出力 ===
    {
      id: 'out_a',
      type: 'OUTPUT',
      position: { x: 550, y: 275 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_b',
      type: 'OUTPUT',
      position: { x: 550, y: 325 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_c',
      type: 'OUTPUT',
      position: { x: 550, y: 375 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_d',
      type: 'OUTPUT',
      position: { x: 550, y: 425 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_e',
      type: 'OUTPUT',
      position: { x: 550, y: 475 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_f',
      type: 'OUTPUT',
      position: { x: 550, y: 525 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_g',
      type: 'OUTPUT',
      position: { x: 550, y: 575 },
      outputs: [false],
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
