import type { GalleryCircuit } from './types';

/**
 * 3入力多数決回路
 * 3つの入力のうち2つ以上が1なら1を出力
 * 民主主義を論理回路で表現！
 */
export const MAJORITY_VOTER: GalleryCircuit = {
  id: 'majority-voter',
  title: '多数決回路',
  description:
    '3つの入力（投票者A、B、C）から多数決を取る回路。各入力をクリックして賛成（1）または反対（0）を投票し、2票以上の賛成で出力が点灯することを確認しましょう。',
  skipAutoLayout: true, // 手動配置されたレイアウトを保持
  gates: [
    // === Layer 0: 投票者入力 ===
    {
      id: 'voter_a',
      type: 'INPUT',
      position: { x: 100, y: 350 },
      outputs: [],
      inputs: [],
    },
    {
      id: 'voter_b',
      type: 'INPUT',
      position: { x: 100, y: 400 },
      outputs: [],
      inputs: [],
    },
    {
      id: 'voter_c',
      type: 'INPUT',
      position: { x: 100, y: 450 },
      outputs: [],
      inputs: [],
    },
    // === Layer 1: 組み合わせチェック（A∧B, B∧C, A∧C） ===
    {
      id: 'and_ab',
      type: 'AND',
      position: { x: 250, y: 325 },
      outputs: [],
      inputs: [],
    },
    {
      id: 'and_bc',
      type: 'AND',
      position: { x: 250, y: 400 },
      outputs: [],
      inputs: [],
    },
    {
      id: 'and_ac',
      type: 'AND',
      position: { x: 250, y: 475 },
      outputs: [],
      inputs: [],
    },
    // === Layer 2: 中間OR ===
    {
      id: 'or_ab_bc',
      type: 'OR',
      position: { x: 400, y: 350 },
      outputs: [],
      inputs: [],
    },
    // === Layer 3: 最終OR ===
    {
      id: 'or_final',
      type: 'OR',
      position: { x: 550, y: 400 },
      outputs: [],
      inputs: [],
    },
    // === Layer 4: 出力群 ===
    {
      id: 'debug_ab',
      type: 'OUTPUT',
      position: { x: 700, y: 325 },
      outputs: [],
      inputs: [],
    },
    {
      id: 'debug_bc',
      type: 'OUTPUT',
      position: { x: 700, y: 375 },
      outputs: [],
      inputs: [],
    },
    {
      id: 'result',
      type: 'OUTPUT',
      position: { x: 700, y: 425 },
      outputs: [],
      inputs: [],
    },
    {
      id: 'debug_ac',
      type: 'OUTPUT',
      position: { x: 700, y: 475 },
      outputs: [],
      inputs: [],
    },
  ],
  wires: [
    // A AND B
    {
      id: 'w_a_ab',
      from: { gateId: 'voter_a', pinIndex: -1 },
      to: { gateId: 'and_ab', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_b_ab',
      from: { gateId: 'voter_b', pinIndex: -1 },
      to: { gateId: 'and_ab', pinIndex: 1 },
      isActive: false,
    },
    // B AND C
    {
      id: 'w_b_bc',
      from: { gateId: 'voter_b', pinIndex: -1 },
      to: { gateId: 'and_bc', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_c_bc',
      from: { gateId: 'voter_c', pinIndex: -1 },
      to: { gateId: 'and_bc', pinIndex: 1 },
      isActive: false,
    },
    // A AND C
    {
      id: 'w_a_ac',
      from: { gateId: 'voter_a', pinIndex: -1 },
      to: { gateId: 'and_ac', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_c_ac',
      from: { gateId: 'voter_c', pinIndex: -1 },
      to: { gateId: 'and_ac', pinIndex: 1 },
      isActive: false,
    },
    // OR結合
    {
      id: 'w_ab_or',
      from: { gateId: 'and_ab', pinIndex: -1 },
      to: { gateId: 'or_ab_bc', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_bc_or',
      from: { gateId: 'and_bc', pinIndex: -1 },
      to: { gateId: 'or_ab_bc', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'w_or_inter',
      from: { gateId: 'or_ab_bc', pinIndex: -1 },
      to: { gateId: 'or_final', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_ac_or',
      from: { gateId: 'and_ac', pinIndex: -1 },
      to: { gateId: 'or_final', pinIndex: 1 },
      isActive: false,
    },
    // 最終出力
    {
      id: 'w_final_out',
      from: { gateId: 'or_final', pinIndex: -1 },
      to: { gateId: 'result', pinIndex: 0 },
      isActive: false,
    },
    // デバッグ出力
    {
      id: 'w_debug_ab',
      from: { gateId: 'and_ab', pinIndex: -1 },
      to: { gateId: 'debug_ab', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_debug_bc',
      from: { gateId: 'and_bc', pinIndex: -1 },
      to: { gateId: 'debug_bc', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_debug_ac',
      from: { gateId: 'and_ac', pinIndex: -1 },
      to: { gateId: 'debug_ac', pinIndex: 0 },
      isActive: false,
    },
  ],
};
