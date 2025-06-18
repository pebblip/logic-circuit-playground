import type { Gate, Wire } from '../../../types';

/**
 * 🌀 セルフオシレーティングメモリ（最終版）
 * 
 * 設計思想：
 * - 最もシンプルで確実な設計
 * - 非安定マルチバイブレータ構成
 * - 2つのNORゲートによるクロスカップリング
 */
export const SELF_OSCILLATING_MEMORY_FINAL = {
  id: 'self-oscillating-memory-final',
  title: '🌀 セルフオシレーティングメモリ（最終版）',
  description: '2つのNORゲートによる非安定マルチバイブレータ！確実に振動し、XORで検出します。',
  simulationConfig: {
    needsAnimation: true,
    updateInterval: 150,
    expectedBehavior: 'oscillator' as const,
    minimumCycles: 15
  },
  gates: [
    // 制御入力
    {
      id: 'enable',
      type: 'INPUT' as const,
      position: { x: 50, y: 250 },
      output: true,
      inputs: [],
    },
    
    // トリガー入力（初期パルス）
    {
      id: 'trigger',
      type: 'INPUT' as const,
      position: { x: 50, y: 350 },
      output: false,
      inputs: [],
    },
    
    // 非安定マルチバイブレータのコア（NOR x2）
    {
      id: 'nor1',
      type: 'NOR' as const,
      position: { x: 300, y: 200 },
      output: true,
      inputs: ['', ''],
    },
    {
      id: 'nor2',
      type: 'NOR' as const,
      position: { x: 300, y: 300 },
      output: false,
      inputs: ['', ''],
    },
    
    // 遅延チェーン1（NOR1用）
    {
      id: 'delay1_1',
      type: 'NOT' as const,
      position: { x: 400, y: 200 },
      output: false,
      inputs: [''],
    },
    {
      id: 'delay1_2',
      type: 'NOT' as const,
      position: { x: 450, y: 200 },
      output: true,
      inputs: [''],
    },
    {
      id: 'delay1_3',
      type: 'NOT' as const,
      position: { x: 500, y: 200 },
      output: false,
      inputs: [''],
    },
    
    // 遅延チェーン2（NOR2用 - より長い）
    {
      id: 'delay2_1',
      type: 'NOT' as const,
      position: { x: 400, y: 300 },
      output: true,
      inputs: [''],
    },
    {
      id: 'delay2_2',
      type: 'NOT' as const,
      position: { x: 450, y: 300 },
      output: false,
      inputs: [''],
    },
    {
      id: 'delay2_3',
      type: 'NOT' as const,
      position: { x: 500, y: 300 },
      output: true,
      inputs: [''],
    },
    {
      id: 'delay2_4',
      type: 'NOT' as const,
      position: { x: 550, y: 300 },
      output: false,
      inputs: [''],
    },
    {
      id: 'delay2_5',
      type: 'NOT' as const,
      position: { x: 600, y: 300 },
      output: true,
      inputs: [''],
    },
    
    // フィードバック制御AND
    {
      id: 'fb_and1',
      type: 'AND' as const,
      position: { x: 550, y: 150 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'fb_and2',
      type: 'AND' as const,
      position: { x: 650, y: 350 },
      output: false,
      inputs: ['', ''],
    },
    
    // トリガー用OR
    {
      id: 'trigger_or',
      type: 'OR' as const,
      position: { x: 200, y: 320 },
      output: false,
      inputs: ['', ''],
    },
    
    // メモリ（振動状態を保持）
    {
      id: 'memory1',
      type: 'SR-LATCH' as const,
      position: { x: 700, y: 150 },
      output: false,
      inputs: ['', ''],
      outputs: [false, true],
    },
    {
      id: 'memory2',
      type: 'SR-LATCH' as const,
      position: { x: 700, y: 350 },
      output: false,
      inputs: ['', ''],
      outputs: [false, true],
    },
    
    // 振動検出XOR
    {
      id: 'detect_xor',
      type: 'XOR' as const,
      position: { x: 850, y: 250 },
      output: false,
      inputs: ['', ''],
    },
    
    // 出力
    {
      id: 'out_nor1',
      type: 'OUTPUT' as const,
      position: { x: 350, y: 100 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_nor2',
      type: 'OUTPUT' as const,
      position: { x: 350, y: 400 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_xor',
      type: 'OUTPUT' as const,
      position: { x: 950, y: 250 },
      output: false,
      inputs: [''],
    },
  ],
  wires: [
    // トリガー接続
    {
      id: 'trigger_to_or',
      from: { gateId: 'trigger', pinIndex: -1 },
      to: { gateId: 'trigger_or', pinIndex: 0 },
      isActive: false,
    },
    
    // NOR1出力 → 遅延チェーン1
    {
      id: 'nor1_to_delay1',
      from: { gateId: 'nor1', pinIndex: -1 },
      to: { gateId: 'delay1_1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'delay1_1_to_2',
      from: { gateId: 'delay1_1', pinIndex: -1 },
      to: { gateId: 'delay1_2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'delay1_2_to_3',
      from: { gateId: 'delay1_2', pinIndex: -1 },
      to: { gateId: 'delay1_3', pinIndex: 0 },
      isActive: false,
    },
    
    // 遅延1 → フィードバック1
    {
      id: 'delay1_to_fb1',
      from: { gateId: 'delay1_3', pinIndex: -1 },
      to: { gateId: 'fb_and1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'enable_to_fb1',
      from: { gateId: 'enable', pinIndex: -1 },
      to: { gateId: 'fb_and1', pinIndex: 1 },
      isActive: false,
    },
    
    // フィードバック1 → NOR2
    {
      id: 'fb1_to_nor2',
      from: { gateId: 'fb_and1', pinIndex: -1 },
      to: { gateId: 'nor2', pinIndex: 0 },
      isActive: false,
    },
    
    // NOR2出力 → 遅延チェーン2
    {
      id: 'nor2_to_delay2',
      from: { gateId: 'nor2', pinIndex: -1 },
      to: { gateId: 'delay2_1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'delay2_1_to_2',
      from: { gateId: 'delay2_1', pinIndex: -1 },
      to: { gateId: 'delay2_2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'delay2_2_to_3',
      from: { gateId: 'delay2_2', pinIndex: -1 },
      to: { gateId: 'delay2_3', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'delay2_3_to_4',
      from: { gateId: 'delay2_3', pinIndex: -1 },
      to: { gateId: 'delay2_4', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'delay2_4_to_5',
      from: { gateId: 'delay2_4', pinIndex: -1 },
      to: { gateId: 'delay2_5', pinIndex: 0 },
      isActive: false,
    },
    
    // 遅延2 → フィードバック2
    {
      id: 'delay2_to_fb2',
      from: { gateId: 'delay2_5', pinIndex: -1 },
      to: { gateId: 'fb_and2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'enable_to_fb2',
      from: { gateId: 'enable', pinIndex: -1 },
      to: { gateId: 'fb_and2', pinIndex: 1 },
      isActive: false,
    },
    
    // フィードバック2 → トリガーOR
    {
      id: 'fb2_to_or',
      from: { gateId: 'fb_and2', pinIndex: -1 },
      to: { gateId: 'trigger_or', pinIndex: 1 },
      isActive: false,
    },
    
    // トリガーOR → NOR1
    {
      id: 'or_to_nor1',
      from: { gateId: 'trigger_or', pinIndex: -1 },
      to: { gateId: 'nor1', pinIndex: 0 },
      isActive: false,
    },
    
    // クロスカップリング（重要！）
    {
      id: 'nor1_to_nor2_cross',
      from: { gateId: 'nor1', pinIndex: -1 },
      to: { gateId: 'nor2', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'nor2_to_nor1_cross',
      from: { gateId: 'nor2', pinIndex: -1 },
      to: { gateId: 'nor1', pinIndex: 1 },
      isActive: false,
    },
    
    // メモリ駆動
    {
      id: 'nor1_to_mem1_s',
      from: { gateId: 'nor1', pinIndex: -1 },
      to: { gateId: 'memory1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'nor2_to_mem1_r',
      from: { gateId: 'nor2', pinIndex: -1 },
      to: { gateId: 'memory1', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'nor2_to_mem2_s',
      from: { gateId: 'nor2', pinIndex: -1 },
      to: { gateId: 'memory2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'nor1_to_mem2_r',
      from: { gateId: 'nor1', pinIndex: -1 },
      to: { gateId: 'memory2', pinIndex: 1 },
      isActive: false,
    },
    
    // XOR接続
    {
      id: 'mem1_to_xor',
      from: { gateId: 'memory1', pinIndex: -1 },
      to: { gateId: 'detect_xor', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'mem2_to_xor',
      from: { gateId: 'memory2', pinIndex: -1 },
      to: { gateId: 'detect_xor', pinIndex: 1 },
      isActive: false,
    },
    
    // 出力接続
    {
      id: 'nor1_to_out',
      from: { gateId: 'nor1', pinIndex: -1 },
      to: { gateId: 'out_nor1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'nor2_to_out',
      from: { gateId: 'nor2', pinIndex: -1 },
      to: { gateId: 'out_nor2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'xor_to_out',
      from: { gateId: 'detect_xor', pinIndex: -1 },
      to: { gateId: 'out_xor', pinIndex: 0 },
      isActive: false,
    },
  ],
};