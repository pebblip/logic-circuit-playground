import type { Gate, Wire } from '../../../types';
import { COMPARATOR_4BIT } from './comparator-circuit';
import { PARITY_CHECKER } from './parity-checker';
import { MAJORITY_VOTER } from './majority-voter';
import { SEVEN_SEGMENT_DECODER } from './seven-segment';
import { SR_LATCH_BASIC } from './sr-latch-circuit';
import { SIMPLE_RING_OSCILLATOR } from './simple-ring-oscillator';
import { CHAOS_GENERATOR } from './chaos-generator';
import { FIBONACCI_COUNTER } from './fibonacci-counter';
import { JOHNSON_COUNTER } from './johnson-counter';
import { SELF_OSCILLATING_MEMORY_FINAL } from './self-oscillating-memory-final';
import { MANDALA_CIRCUIT } from './mandala-circuit';

export interface SimulationConfig {
  needsAnimation?: boolean;      // オシレーション回路かどうか
  updateInterval?: number;       // 更新間隔（ms）
  expectedBehavior?: 'oscillator' | 'sequence_generator' | 'memory_circuit' | 'logic_gate';
  minimumCycles?: number;        // テスト用最小サイクル数
  clockFrequency?: number;       // CLOCKゲートの周波数（Hz）
}

export interface CircuitMetadata {
  id: string;
  title: string;
  description: string;
  gates: Gate[];
  wires: Wire[];
  simulationConfig?: SimulationConfig;  // 🆕 シミュレーション設定を統合
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
        output: true,
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
        metadata: { qOutput: false },
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

  // 信号機制御回路は削除（教育的価値が低い）

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

  // 問題のあるバイナリカウンタ（専用ゲート使用）を削除
  // 将来的に基本ゲート版を追加予定
  
  // 基本ゲートで作る高度な回路
  COMPARATOR_4BIT,
  PARITY_CHECKER,
  MAJORITY_VOTER,
  SEVEN_SEGMENT_DECODER,
  
  // 循環回路（イベント駆動シミュレーション対応）
  SR_LATCH_BASIC,
  SIMPLE_RING_OSCILLATOR,
  
  // 循環回路（高度）
  CHAOS_GENERATOR,
  FIBONACCI_COUNTER,
  JOHNSON_COUNTER,
  SELF_OSCILLATING_MEMORY_FINAL,
  MANDALA_CIRCUIT,
];
