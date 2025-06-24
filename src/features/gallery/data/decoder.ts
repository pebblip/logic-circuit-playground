import type { GalleryCircuit } from './types';

/**
 * 2-to-4 デコーダー回路
 * 2ビット入力を4つの出力線のうち1つをアクティブにする
 * デジタル回路の基本構成要素
 */
export const DECODER_2TO4: GalleryCircuit = {
  id: 'decoder',
  title: '2-to-4 デコーダー',
  description:
    '2ビット入力を4つの出力線に変換。アドレスデコーダーやメモリ選択回路の基本。',
  skipAutoLayout: true, // 手動配置されたレイアウトを保持
  gates: [
    // === Layer 0: 2ビット入力 ===
    {
      id: 'input_a',
      type: 'INPUT',
      position: { x: 100, y: 375 },
      outputs: [],
      inputs: [],
    },
    {
      id: 'input_b',
      type: 'INPUT',
      position: { x: 100, y: 425 },
      outputs: [],
      inputs: [],
    },
    // === Layer 1: NOT ゲート ===
    {
      id: 'not_a',
      type: 'NOT',
      position: { x: 250, y: 375 },
      outputs: [],
      inputs: [],
    },
    {
      id: 'not_b',
      type: 'NOT',
      position: { x: 250, y: 425 },
      outputs: [],
      inputs: [],
    },
    // === Layer 2: AND ゲート (4つの組み合わせ) ===
    {
      id: 'and_00',
      type: 'AND',
      position: { x: 400, y: 325 },
      outputs: [],
      inputs: [],
    },
    {
      id: 'and_01',
      type: 'AND',
      position: { x: 400, y: 375 },
      outputs: [],
      inputs: [],
    },
    {
      id: 'and_10',
      type: 'AND',
      position: { x: 400, y: 425 },
      outputs: [],
      inputs: [],
    },
    {
      id: 'and_11',
      type: 'AND',
      position: { x: 400, y: 475 },
      outputs: [],
      inputs: [],
    },
    // === Layer 3: 4出力 ===
    {
      id: 'output_0',
      type: 'OUTPUT',
      position: { x: 550, y: 325 },
      outputs: [],
      inputs: [],
    },
    {
      id: 'output_1',
      type: 'OUTPUT',
      position: { x: 550, y: 375 },
      outputs: [],
      inputs: [],
    },
    {
      id: 'output_2',
      type: 'OUTPUT',
      position: { x: 550, y: 425 },
      outputs: [],
      inputs: [],
    },
    {
      id: 'output_3',
      type: 'OUTPUT',
      position: { x: 550, y: 475 },
      outputs: [],
      inputs: [],
    },
  ],
  wires: [
    // A入力の分岐
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
    // B入力の分岐
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
    // NOT A の出力
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
    // NOT B の出力
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
    // AND ゲートから出力へ
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
};
