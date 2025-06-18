import type { Gate, Wire } from '../../../types';

export const SELF_OSCILLATING_MEMORY = {
  id: 'self-oscillating-memory',
  title: '🌀 セルフオシレーティングメモリ',
  description: 'メモリ回路が自分で振動する驚異的な現象！競合状態（Race Condition）を利用した自励振動回路の実例です。',
  gates: [
    // 制御入力
    {
      id: 'enable',
      type: 'INPUT' as const,
      position: { x: 100, y: 150 },
      output: true, // 有効にして振動開始
      inputs: [],
    },
    {
      id: 'trigger',
      type: 'INPUT' as const,
      position: { x: 100, y: 250 },
      output: false,
      inputs: [],
    },
    
    // メモリセル1（SR-LATCH）
    {
      id: 'memory1_sr',
      type: 'SR-LATCH' as const,
      position: { x: 300, y: 150 },
      output: false,
      inputs: ['', ''],
      outputs: [false, true],
      metadata: { state: false },
    },
    
    // メモリセル2（SR-LATCH）
    {
      id: 'memory2_sr',
      type: 'SR-LATCH' as const,
      position: { x: 300, y: 300 },
      output: false,
      inputs: ['', ''],
      outputs: [false, true],
      metadata: { state: false },
    },
    
    // クロス結合用のゲート
    {
      id: 'and1',
      type: 'AND' as const,
      position: { x: 200, y: 120 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'and2',
      type: 'AND' as const,
      position: { x: 200, y: 180 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'and3',
      type: 'AND' as const,
      position: { x: 200, y: 270 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'and4',
      type: 'AND' as const,
      position: { x: 200, y: 330 },
      output: false,
      inputs: ['', ''],
    },
    
    // 遅延要素（NOTチェーン）
    {
      id: 'delay1',
      type: 'NOT' as const,
      position: { x: 450, y: 150 },
      output: false,
      inputs: [''],
    },
    {
      id: 'delay2',
      type: 'NOT' as const,
      position: { x: 500, y: 150 },
      output: false,
      inputs: [''],
    },
    {
      id: 'delay3',
      type: 'NOT' as const,
      position: { x: 550, y: 150 },
      output: false,
      inputs: [''],
    },
    
    {
      id: 'delay4',
      type: 'NOT' as const,
      position: { x: 450, y: 300 },
      output: false,
      inputs: [''],
    },
    {
      id: 'delay5',
      type: 'NOT' as const,
      position: { x: 500, y: 300 },
      output: false,
      inputs: [''],
    },
    {
      id: 'delay6',
      type: 'NOT' as const,
      position: { x: 550, y: 300 },
      output: false,
      inputs: [''],
    },
    
    // フィードバック制御
    {
      id: 'feedback_and1',
      type: 'AND' as const,
      position: { x: 600, y: 200 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'feedback_and2',
      type: 'AND' as const,
      position: { x: 600, y: 250 },
      output: false,
      inputs: ['', ''],
    },
    
    // 出力観測
    {
      id: 'out_mem1_q',
      type: 'OUTPUT' as const,
      position: { x: 400, y: 100 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_mem1_qbar',
      type: 'OUTPUT' as const,
      position: { x: 400, y: 200 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_mem2_q',
      type: 'OUTPUT' as const,
      position: { x: 400, y: 250 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_mem2_qbar',
      type: 'OUTPUT' as const,
      position: { x: 400, y: 350 },
      output: false,
      inputs: [''],
    },
    
    // 振動パターン観測
    {
      id: 'oscillation_xor',
      type: 'XOR' as const,
      position: { x: 700, y: 200 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'oscillation_and',
      type: 'AND' as const,
      position: { x: 700, y: 250 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'pattern_or',
      type: 'OR' as const,
      position: { x: 700, y: 150 },
      output: false,
      inputs: ['', ''],
    },
    
    {
      id: 'out_oscillation',
      type: 'OUTPUT' as const,
      position: { x: 800, y: 200 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_sync',
      type: 'OUTPUT' as const,
      position: { x: 800, y: 250 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_activity',
      type: 'OUTPUT' as const,
      position: { x: 800, y: 150 },
      output: false,
      inputs: [''],
    },
    
    // 分析用の追加出力
    {
      id: 'delayed_q1',
      type: 'OUTPUT' as const,
      position: { x: 600, y: 100 },
      output: false,
      inputs: [''],
    },
    {
      id: 'delayed_q2',
      type: 'OUTPUT' as const,
      position: { x: 600, y: 350 },
      output: false,
      inputs: [''],
    },
    
    // 位相差検出
    {
      id: 'phase_detector',
      type: 'XOR' as const,
      position: { x: 650, y: 300 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'phase_out',
      type: 'OUTPUT' as const,
      position: { x: 750, y: 300 },
      output: false,
      inputs: [''],
    },
  ],
  wires: [
    // 入力制御
    {
      id: 'enable_to_and1',
      from: { gateId: 'enable', pinIndex: -1 },
      to: { gateId: 'and1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'enable_to_and3',
      from: { gateId: 'enable', pinIndex: -1 },
      to: { gateId: 'and3', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'trigger_to_and2',
      from: { gateId: 'trigger', pinIndex: -1 },
      to: { gateId: 'and2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'trigger_to_and4',
      from: { gateId: 'trigger', pinIndex: -1 },
      to: { gateId: 'and4', pinIndex: 0 },
      isActive: false,
    },
    
    // クロス結合（競合状態を作る核心部分）
    {
      id: 'mem1_q_to_and4',
      from: { gateId: 'memory1_sr', pinIndex: -1 }, // Q出力
      to: { gateId: 'and4', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'mem1_qbar_to_and3',
      from: { gateId: 'memory1_sr', pinIndex: -2 }, // Q_BAR出力
      to: { gateId: 'and3', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'mem2_q_to_and2',
      from: { gateId: 'memory2_sr', pinIndex: -1 }, // Q出力
      to: { gateId: 'and2', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'mem2_qbar_to_and1',
      from: { gateId: 'memory2_sr', pinIndex: -2 }, // Q_BAR出力
      to: { gateId: 'and1', pinIndex: 1 },
      isActive: false,
    },
    
    // ANDゲートからSR-LATCHへの接続
    {
      id: 'and1_to_mem1_s',
      from: { gateId: 'and1', pinIndex: -1 },
      to: { gateId: 'memory1_sr', pinIndex: 0 }, // S入力
      isActive: false,
    },
    {
      id: 'and2_to_mem1_r',
      from: { gateId: 'and2', pinIndex: -1 },
      to: { gateId: 'memory1_sr', pinIndex: 1 }, // R入力
      isActive: false,
    },
    {
      id: 'and3_to_mem2_s',
      from: { gateId: 'and3', pinIndex: -1 },
      to: { gateId: 'memory2_sr', pinIndex: 0 }, // S入力
      isActive: false,
    },
    {
      id: 'and4_to_mem2_r',
      from: { gateId: 'and4', pinIndex: -1 },
      to: { gateId: 'memory2_sr', pinIndex: 1 }, // R入力
      isActive: false,
    },
    
    // 遅延チェーン1
    {
      id: 'mem1_to_delay1',
      from: { gateId: 'memory1_sr', pinIndex: -1 },
      to: { gateId: 'delay1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'delay1_to_delay2',
      from: { gateId: 'delay1', pinIndex: -1 },
      to: { gateId: 'delay2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'delay2_to_delay3',
      from: { gateId: 'delay2', pinIndex: -1 },
      to: { gateId: 'delay3', pinIndex: 0 },
      isActive: false,
    },
    
    // 遅延チェーン2
    {
      id: 'mem2_to_delay4',
      from: { gateId: 'memory2_sr', pinIndex: -1 },
      to: { gateId: 'delay4', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'delay4_to_delay5',
      from: { gateId: 'delay4', pinIndex: -1 },
      to: { gateId: 'delay5', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'delay5_to_delay6',
      from: { gateId: 'delay5', pinIndex: -1 },
      to: { gateId: 'delay6', pinIndex: 0 },
      isActive: false,
    },
    
    // フィードバック制御
    {
      id: 'delay3_to_feedback1',
      from: { gateId: 'delay3', pinIndex: -1 },
      to: { gateId: 'feedback_and1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'enable_to_feedback1',
      from: { gateId: 'enable', pinIndex: -1 },
      to: { gateId: 'feedback_and1', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'delay6_to_feedback2',
      from: { gateId: 'delay6', pinIndex: -1 },
      to: { gateId: 'feedback_and2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'enable_to_feedback2',
      from: { gateId: 'enable', pinIndex: -1 },
      to: { gateId: 'feedback_and2', pinIndex: 1 },
      isActive: false,
    },
    
    // メモリ出力観測
    {
      id: 'mem1_q_to_out',
      from: { gateId: 'memory1_sr', pinIndex: -1 },
      to: { gateId: 'out_mem1_q', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'mem1_qbar_to_out',
      from: { gateId: 'memory1_sr', pinIndex: -2 },
      to: { gateId: 'out_mem1_qbar', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'mem2_q_to_out',
      from: { gateId: 'memory2_sr', pinIndex: -1 },
      to: { gateId: 'out_mem2_q', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'mem2_qbar_to_out',
      from: { gateId: 'memory2_sr', pinIndex: -2 },
      to: { gateId: 'out_mem2_qbar', pinIndex: 0 },
      isActive: false,
    },
    
    // 振動パターン分析
    {
      id: 'mem1_to_xor',
      from: { gateId: 'memory1_sr', pinIndex: -1 },
      to: { gateId: 'oscillation_xor', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'mem2_to_xor',
      from: { gateId: 'memory2_sr', pinIndex: -1 },
      to: { gateId: 'oscillation_xor', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'mem1_to_and_osc',
      from: { gateId: 'memory1_sr', pinIndex: -1 },
      to: { gateId: 'oscillation_and', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'mem2_to_and_osc',
      from: { gateId: 'memory2_sr', pinIndex: -1 },
      to: { gateId: 'oscillation_and', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'mem1_to_or',
      from: { gateId: 'memory1_sr', pinIndex: -1 },
      to: { gateId: 'pattern_or', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'mem2_to_or',
      from: { gateId: 'memory2_sr', pinIndex: -1 },
      to: { gateId: 'pattern_or', pinIndex: 1 },
      isActive: false,
    },
    
    {
      id: 'xor_to_out',
      from: { gateId: 'oscillation_xor', pinIndex: -1 },
      to: { gateId: 'out_oscillation', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'and_to_out',
      from: { gateId: 'oscillation_and', pinIndex: -1 },
      to: { gateId: 'out_sync', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'or_to_out',
      from: { gateId: 'pattern_or', pinIndex: -1 },
      to: { gateId: 'out_activity', pinIndex: 0 },
      isActive: false,
    },
    
    // 遅延出力観測
    {
      id: 'delay3_to_out',
      from: { gateId: 'delay3', pinIndex: -1 },
      to: { gateId: 'delayed_q1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'delay6_to_out',
      from: { gateId: 'delay6', pinIndex: -1 },
      to: { gateId: 'delayed_q2', pinIndex: 0 },
      isActive: false,
    },
    
    // 位相差検出
    {
      id: 'mem1_to_phase',
      from: { gateId: 'memory1_sr', pinIndex: -1 },
      to: { gateId: 'phase_detector', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'delay6_to_phase',
      from: { gateId: 'delay6', pinIndex: -1 },
      to: { gateId: 'phase_detector', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'phase_to_out',
      from: { gateId: 'phase_detector', pinIndex: -1 },
      to: { gateId: 'phase_out', pinIndex: 0 },
      isActive: false,
    },
  ],
};