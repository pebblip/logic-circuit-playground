import type { CircuitMetadata } from './gallery';

/**
 * 3入力多数決回路
 * 3つの入力のうち2つ以上が1なら1を出力
 * 民主主義を論理回路で表現！
 */
export const MAJORITY_VOTER: CircuitMetadata = {
  id: 'majority-voter',
  title: '多数決回路',
  description:
    '3つの入力から多数決を取る回路。2票以上の賛成で可決！民主主義の原理を論理回路で実現。',
  gates: [
    // 3つの入力（投票者A, B, C）
    {
      id: 'voter_a',
      type: 'INPUT',
      position: { x: 100, y: 150 },
      output: false,
      inputs: [],
    },
    {
      id: 'voter_b',
      type: 'INPUT',
      position: { x: 100, y: 250 },
      output: false,
      inputs: [],
    },
    {
      id: 'voter_c',
      type: 'INPUT',
      position: { x: 100, y: 350 },
      output: false,
      inputs: [],
    },
    // 2人の組み合わせをチェック（A∧B, B∧C, A∧C）
    {
      id: 'and_ab',
      type: 'AND',
      position: { x: 300, y: 100 },
      output: false,
      inputs: [],
    },
    {
      id: 'and_bc',
      type: 'AND',
      position: { x: 300, y: 250 },
      output: false,
      inputs: [],
    },
    {
      id: 'and_ac',
      type: 'AND',
      position: { x: 300, y: 400 },
      output: false,
      inputs: [],
    },
    // いずれかの組み合わせが成立すれば可決
    {
      id: 'or_ab_bc',
      type: 'OR',
      position: { x: 500, y: 175 },
      output: false,
      inputs: [],
    },
    {
      id: 'or_final',
      type: 'OR',
      position: { x: 650, y: 250 },
      output: false,
      inputs: [],
    },
    // 多数決結果
    {
      id: 'result',
      type: 'OUTPUT',
      position: { x: 800, y: 250 },
      output: false,
      inputs: [],
    },
    // デバッグ用：各ANDゲートの出力
    {
      id: 'debug_ab',
      type: 'OUTPUT',
      position: { x: 450, y: 100 },
      output: false,
      inputs: [],
    },
    {
      id: 'debug_bc',
      type: 'OUTPUT',
      position: { x: 450, y: 250 },
      output: false,
      inputs: [],
    },
    {
      id: 'debug_ac',
      type: 'OUTPUT',
      position: { x: 450, y: 400 },
      output: false,
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
