import type { Gate, Wire } from '../../../types';

/**
 * 🌀 真のセルフオシレーティングメモリ V3
 * 
 * 設計思想：
 * - リングオシレーター方式で確実な振動を実現
 * - 奇数個のNOTゲートによる発振回路
 * - その振動でメモリを駆動し、XORで検出
 */
export const SELF_OSCILLATING_MEMORY_V3 = {
  id: 'self-oscillating-memory-v3',
  title: '🌀 セルフオシレーティングメモリ V3',
  description: 'リングオシレーター方式による確実な自己振動！3つのNOTゲートで発振し、メモリを駆動します。',
  gates: [
    // 制御入力
    {
      id: 'enable',
      type: 'INPUT' as const,
      position: { x: 50, y: 200 },
      output: true,
      inputs: [],
    },
    
    // リングオシレーター（3つのNOT）
    {
      id: 'ring_not1',
      type: 'NOT' as const,
      position: { x: 200, y: 200 },
      output: false,
      inputs: [''],
    },
    {
      id: 'ring_not2',
      type: 'NOT' as const,
      position: { x: 300, y: 200 },
      output: true,
      inputs: [''],
    },
    {
      id: 'ring_not3',
      type: 'NOT' as const,
      position: { x: 400, y: 200 },
      output: false,
      inputs: [''],
    },
    
    // 発振制御AND（Enableで発振ON/OFF）
    {
      id: 'osc_control',
      type: 'AND' as const,
      position: { x: 150, y: 150 },
      output: false,
      inputs: ['', ''],
    },
    
    // 分周器（T-FF風の動作）
    {
      id: 'divider',
      type: 'D-FF' as const,
      position: { x: 500, y: 200 },
      output: false,
      inputs: ['', ''],
      outputs: [false, true],
      metadata: { previousClock: false },
    },
    
    // 位相シフト用遅延
    {
      id: 'phase_delay1',
      type: 'NOT' as const,
      position: { x: 300, y: 300 },
      output: true,
      inputs: [''],
    },
    {
      id: 'phase_delay2',
      type: 'NOT' as const,
      position: { x: 400, y: 300 },
      output: false,
      inputs: [''],
    },
    
    // メモリ（発振で駆動）
    {
      id: 'memory1',
      type: 'SR-LATCH' as const,
      position: { x: 600, y: 150 },
      output: false,
      inputs: ['', ''],
      outputs: [false, true],
    },
    {
      id: 'memory2',
      type: 'SR-LATCH' as const,
      position: { x: 600, y: 350 },
      output: false,
      inputs: ['', ''],
      outputs: [false, true],
    },
    
    // 振動検出XOR
    {
      id: 'detect_xor',
      type: 'XOR' as const,
      position: { x: 750, y: 250 },
      output: false,
      inputs: ['', ''],
    },
    
    // 出力
    {
      id: 'out_osc',
      type: 'OUTPUT' as const,
      position: { x: 550, y: 100 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_mem1',
      type: 'OUTPUT' as const,
      position: { x: 700, y: 150 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_mem2',
      type: 'OUTPUT' as const,
      position: { x: 700, y: 350 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_xor',
      type: 'OUTPUT' as const,
      position: { x: 850, y: 250 },
      output: false,
      inputs: [''],
    },
  ],
  wires: [
    // 発振制御
    {
      id: 'enable_to_control',
      from: { gateId: 'enable', pinIndex: -1 },
      to: { gateId: 'osc_control', pinIndex: 1 },
      isActive: false,
    },
    
    // リングオシレーター配線
    {
      id: 'control_to_ring1',
      from: { gateId: 'osc_control', pinIndex: -1 },
      to: { gateId: 'ring_not1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring1_to_ring2',
      from: { gateId: 'ring_not1', pinIndex: -1 },
      to: { gateId: 'ring_not2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring2_to_ring3',
      from: { gateId: 'ring_not2', pinIndex: -1 },
      to: { gateId: 'ring_not3', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'ring3_to_control',
      from: { gateId: 'ring_not3', pinIndex: -1 },
      to: { gateId: 'osc_control', pinIndex: 0 },
      isActive: false,
    },
    
    // 発振出力
    {
      id: 'ring2_to_out',
      from: { gateId: 'ring_not2', pinIndex: -1 },
      to: { gateId: 'out_osc', pinIndex: 0 },
      isActive: false,
    },
    
    // 分周器接続（T-FF動作）
    {
      id: 'ring2_to_divider_clk',
      from: { gateId: 'ring_not2', pinIndex: -1 },
      to: { gateId: 'divider', pinIndex: 1 }, // CLK
      isActive: false,
    },
    {
      id: 'divider_qbar_to_d',
      from: { gateId: 'divider', pinIndex: -2 }, // Q̄
      to: { gateId: 'divider', pinIndex: 0 }, // D
      isActive: false,
    },
    
    // 位相シフト
    {
      id: 'ring2_to_phase',
      from: { gateId: 'ring_not2', pinIndex: -1 },
      to: { gateId: 'phase_delay1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'phase1_to_phase2',
      from: { gateId: 'phase_delay1', pinIndex: -1 },
      to: { gateId: 'phase_delay2', pinIndex: 0 },
      isActive: false,
    },
    
    // メモリ駆動
    {
      id: 'divider_to_mem1_s',
      from: { gateId: 'divider', pinIndex: -1 }, // Q
      to: { gateId: 'memory1', pinIndex: 0 }, // S
      isActive: false,
    },
    {
      id: 'divider_qbar_to_mem1_r',
      from: { gateId: 'divider', pinIndex: -2 }, // Q̄
      to: { gateId: 'memory1', pinIndex: 1 }, // R
      isActive: false,
    },
    {
      id: 'phase2_to_mem2_s',
      from: { gateId: 'phase_delay2', pinIndex: -1 },
      to: { gateId: 'memory2', pinIndex: 0 }, // S
      isActive: false,
    },
    {
      id: 'phase1_to_mem2_r',
      from: { gateId: 'phase_delay1', pinIndex: -1 },
      to: { gateId: 'memory2', pinIndex: 1 }, // R
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
      id: 'mem1_to_out',
      from: { gateId: 'memory1', pinIndex: -1 },
      to: { gateId: 'out_mem1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'mem2_to_out',
      from: { gateId: 'memory2', pinIndex: -1 },
      to: { gateId: 'out_mem2', pinIndex: 0 },
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