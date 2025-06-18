import type { Gate, Wire } from '../../../types';

/**
 * 🌀 真のセルフオシレーティングメモリ
 * 
 * 設計思想：
 * - 非対称なフィードバックループで自己振動を実現
 * - Memory1とMemory2が交互に状態を変える
 * - XOR出力が振動を検出して点滅する
 */
export const SELF_OSCILLATING_MEMORY_V2 = {
  id: 'self-oscillating-memory-v2',
  title: '🌀 セルフオシレーティングメモリ V2',
  description: '真の自己振動を実現！非対称フィードバックにより、メモリが自動的に交互に状態を変えます。',
  gates: [
    // 制御入力
    {
      id: 'enable',
      type: 'INPUT' as const,
      position: { x: 50, y: 200 },
      output: true, // 振動を有効化
      inputs: [],
    },
    {
      id: 'start',
      type: 'INPUT' as const,
      position: { x: 50, y: 300 },
      output: false, // 振動開始トリガー
      inputs: [],
    },
    
    // メモリセル
    {
      id: 'memory1',
      type: 'SR-LATCH' as const,
      position: { x: 300, y: 150 },
      output: false,
      inputs: ['', ''],
      outputs: [false, true],
      metadata: { qOutput: false },
    },
    {
      id: 'memory2',
      type: 'SR-LATCH' as const,
      position: { x: 300, y: 350 },
      output: false,
      inputs: ['', ''],
      outputs: [false, true],
      metadata: { qOutput: false },
    },
    
    // スタートトリガー用OR（初期パルス注入）
    {
      id: 'start_or1',
      type: 'OR' as const,
      position: { x: 150, y: 120 },
      output: false,
      inputs: ['', ''],
    },
    
    // クロスカップリング用OR（Memory2 → Memory1）- より強い結合
    {
      id: 'cross_or1',
      type: 'OR' as const,
      position: { x: 200, y: 100 },
      output: false,
      inputs: ['', ''],
    },
    
    // クロスカップリング用AND（Memory1 → Memory2）
    {
      id: 'cross_and2',
      type: 'AND' as const,
      position: { x: 200, y: 400 },
      output: false,
      inputs: ['', ''],
    },
    
    // 非対称遅延（Memory1側は短い）
    {
      id: 'delay1_not1',
      type: 'NOT' as const,
      position: { x: 400, y: 150 },
      output: true,
      inputs: [''],
    },
    {
      id: 'delay1_not2',
      type: 'NOT' as const,
      position: { x: 450, y: 150 },
      output: false,
      inputs: [''],
    },
    
    // 非対称遅延（Memory2側は長い）
    {
      id: 'delay2_not1',
      type: 'NOT' as const,
      position: { x: 400, y: 350 },
      output: true,
      inputs: [''],
    },
    {
      id: 'delay2_not2',
      type: 'NOT' as const,
      position: { x: 450, y: 350 },
      output: false,
      inputs: [''],
    },
    {
      id: 'delay2_not3',
      type: 'NOT' as const,
      position: { x: 500, y: 350 },
      output: true,
      inputs: [''],
    },
    {
      id: 'delay2_not4',
      type: 'NOT' as const,
      position: { x: 550, y: 350 },
      output: false,
      inputs: [''],
    },
    
    // フィードバック制御AND
    {
      id: 'feedback_and1',
      type: 'AND' as const,
      position: { x: 500, y: 200 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'feedback_and2',
      type: 'AND' as const,
      position: { x: 600, y: 300 },
      output: false,
      inputs: ['', ''],
    },
    
    // 振動検出
    {
      id: 'oscillation_xor',
      type: 'XOR' as const,
      position: { x: 700, y: 250 },
      output: false,
      inputs: ['', ''],
    },
    
    // 出力
    {
      id: 'out_memory1',
      type: 'OUTPUT' as const,
      position: { x: 350, y: 50 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_memory2',
      type: 'OUTPUT' as const,
      position: { x: 350, y: 450 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_oscillation',
      type: 'OUTPUT' as const,
      position: { x: 800, y: 250 },
      output: false,
      inputs: [''],
    },
  ],
  wires: [
    // スタートトリガー
    {
      id: 'start_to_or1',
      from: { gateId: 'start', pinIndex: -1 },
      to: { gateId: 'start_or1', pinIndex: 0 },
      isActive: false,
    },
    
    // Memory2のQ̄ → Memory1のセット（クロスカップリング）
    {
      id: 'mem2_qbar_to_or1',
      from: { gateId: 'memory2', pinIndex: -2 }, // Q̄
      to: { gateId: 'cross_or1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'feedback2_to_or1',
      from: { gateId: 'feedback_and2', pinIndex: -1 },
      to: { gateId: 'cross_or1', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'or1_to_start_or1',
      from: { gateId: 'cross_or1', pinIndex: -1 },
      to: { gateId: 'start_or1', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'or1_to_mem1_s',
      from: { gateId: 'start_or1', pinIndex: -1 },
      to: { gateId: 'memory1', pinIndex: 0 }, // S
      isActive: false,
    },
    
    // Memory1のQ → 遅延チェーン1（短い）
    {
      id: 'mem1_to_delay1',
      from: { gateId: 'memory1', pinIndex: -1 },
      to: { gateId: 'delay1_not1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'delay1_1_to_2',
      from: { gateId: 'delay1_not1', pinIndex: -1 },
      to: { gateId: 'delay1_not2', pinIndex: 0 },
      isActive: false,
    },
    
    // 遅延1 → フィードバック1
    {
      id: 'delay1_to_fb1',
      from: { gateId: 'delay1_not2', pinIndex: -1 },
      to: { gateId: 'feedback_and1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'enable_to_fb1',
      from: { gateId: 'enable', pinIndex: -1 },
      to: { gateId: 'feedback_and1', pinIndex: 1 },
      isActive: false,
    },
    
    // フィードバック1 → Memory1のリセット
    {
      id: 'fb1_to_mem1_r',
      from: { gateId: 'feedback_and1', pinIndex: -1 },
      to: { gateId: 'memory1', pinIndex: 1 }, // R
      isActive: false,
    },
    
    // Memory1のQ̄ → Memory2のセット（クロスカップリング）
    {
      id: 'mem1_qbar_to_and2',
      from: { gateId: 'memory1', pinIndex: -2 }, // Q̄
      to: { gateId: 'cross_and2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'enable_to_and2',
      from: { gateId: 'enable', pinIndex: -1 },
      to: { gateId: 'cross_and2', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'and2_to_mem2_s',
      from: { gateId: 'cross_and2', pinIndex: -1 },
      to: { gateId: 'memory2', pinIndex: 0 }, // S
      isActive: false,
    },
    
    // Memory2のQ → 遅延チェーン2（長い）
    {
      id: 'mem2_to_delay2',
      from: { gateId: 'memory2', pinIndex: -1 },
      to: { gateId: 'delay2_not1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'delay2_1_to_2',
      from: { gateId: 'delay2_not1', pinIndex: -1 },
      to: { gateId: 'delay2_not2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'delay2_2_to_3',
      from: { gateId: 'delay2_not2', pinIndex: -1 },
      to: { gateId: 'delay2_not3', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'delay2_3_to_4',
      from: { gateId: 'delay2_not3', pinIndex: -1 },
      to: { gateId: 'delay2_not4', pinIndex: 0 },
      isActive: false,
    },
    
    // 遅延2 → フィードバック2
    {
      id: 'delay2_to_fb2',
      from: { gateId: 'delay2_not4', pinIndex: -1 },
      to: { gateId: 'feedback_and2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'enable_to_fb2',
      from: { gateId: 'enable', pinIndex: -1 },
      to: { gateId: 'feedback_and2', pinIndex: 1 },
      isActive: false,
    },
    
    // フィードバック2 → Memory2のリセット
    {
      id: 'fb2_to_mem2_r',
      from: { gateId: 'feedback_and2', pinIndex: -1 },
      to: { gateId: 'memory2', pinIndex: 1 }, // R
      isActive: false,
    },
    
    // 振動検出（XOR）
    {
      id: 'mem1_to_xor',
      from: { gateId: 'memory1', pinIndex: -1 },
      to: { gateId: 'oscillation_xor', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'mem2_to_xor',
      from: { gateId: 'memory2', pinIndex: -1 },
      to: { gateId: 'oscillation_xor', pinIndex: 1 },
      isActive: false,
    },
    
    // 出力
    {
      id: 'mem1_to_out',
      from: { gateId: 'memory1', pinIndex: -1 },
      to: { gateId: 'out_memory1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'mem2_to_out',
      from: { gateId: 'memory2', pinIndex: -1 },
      to: { gateId: 'out_memory2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'xor_to_out',
      from: { gateId: 'oscillation_xor', pinIndex: -1 },
      to: { gateId: 'out_oscillation', pinIndex: 0 },
      isActive: false,
    },
  ],
};