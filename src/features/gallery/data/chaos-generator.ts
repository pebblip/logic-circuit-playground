import type { Gate, Wire } from '../../../types';

export const CHAOS_GENERATOR = {
  id: 'chaos-generator',
  title: '🌀 カオス発生器（LFSR）',
  description: '線形フィードバックシフトレジスタによる疑似ランダム生成器。暗号学や乱数生成に使われる驚異的な循環回路です！',
  gates: [
    // CLOCK (1Hz)
    {
      id: 'clock',
      type: 'CLOCK' as const,
      position: { x: 100, y: 150 },
      output: true, // 初期状態でONにしてクロック信号を見やすく
      inputs: [],
      metadata: { frequency: 1 },
    },
    
    // 4ビットシフトレジスタ（D-FFで構成）
    {
      id: 'dff1',
      type: 'D-FF' as const,
      position: { x: 200, y: 200 },
      output: true, // 初期値
      inputs: ['', ''],
      metadata: { state: true },
    },
    {
      id: 'dff2',
      type: 'D-FF' as const,
      position: { x: 300, y: 200 },
      output: false,
      inputs: ['', ''],
      metadata: { state: false },
    },
    {
      id: 'dff3',
      type: 'D-FF' as const,
      position: { x: 400, y: 200 },
      output: true,
      inputs: ['', ''],
      metadata: { state: true },
    },
    {
      id: 'dff4',
      type: 'D-FF' as const,
      position: { x: 500, y: 200 },
      output: false,
      inputs: ['', ''],
      metadata: { state: false },
    },
    
    // XORフィードバック（多項式: x^4 + x^3 + 1）
    {
      id: 'xor_feedback',
      type: 'XOR' as const,
      position: { x: 350, y: 100 },
      output: false,
      inputs: ['', ''],
    },
    
    // 出力観測用
    {
      id: 'out_bit3',
      type: 'OUTPUT' as const,
      position: { x: 200, y: 300 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_bit2',
      type: 'OUTPUT' as const,
      position: { x: 300, y: 300 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_bit1',
      type: 'OUTPUT' as const,
      position: { x: 400, y: 300 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_bit0',
      type: 'OUTPUT' as const,
      position: { x: 500, y: 300 },
      output: false,
      inputs: [''],
    },
    
    // ランダム出力
    {
      id: 'random_output',
      type: 'OUTPUT' as const,
      position: { x: 600, y: 200 },
      output: false,
      inputs: [''],
    },
  ],
  wires: [
    // クロック分配
    {
      id: 'clk_dff1',
      from: { gateId: 'clock', pinIndex: -1 },
      to: { gateId: 'dff1', pinIndex: 1 },
      isActive: true, // クロック信号を視覚的に表示
    },
    {
      id: 'clk_dff2',
      from: { gateId: 'clock', pinIndex: -1 },
      to: { gateId: 'dff2', pinIndex: 1 },
      isActive: true, // クロック信号を視覚的に表示
    },
    {
      id: 'clk_dff3',
      from: { gateId: 'clock', pinIndex: -1 },
      to: { gateId: 'dff3', pinIndex: 1 },
      isActive: true, // クロック信号を視覚的に表示
    },
    {
      id: 'clk_dff4',
      from: { gateId: 'clock', pinIndex: -1 },
      to: { gateId: 'dff4', pinIndex: 1 },
      isActive: true, // クロック信号を視覚的に表示
    },
    
    // シフトレジスタ接続
    {
      id: 'shift_1_2',
      from: { gateId: 'dff1', pinIndex: -1 },
      to: { gateId: 'dff2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'shift_2_3',
      from: { gateId: 'dff2', pinIndex: -1 },
      to: { gateId: 'dff3', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'shift_3_4',
      from: { gateId: 'dff3', pinIndex: -1 },
      to: { gateId: 'dff4', pinIndex: 0 },
      isActive: false,
    },
    
    // XORフィードバック
    {
      id: 'feedback_tap3',
      from: { gateId: 'dff3', pinIndex: -1 },
      to: { gateId: 'xor_feedback', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'feedback_tap4',
      from: { gateId: 'dff4', pinIndex: -1 },
      to: { gateId: 'xor_feedback', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'feedback_loop',
      from: { gateId: 'xor_feedback', pinIndex: -1 },
      to: { gateId: 'dff1', pinIndex: 0 },
      isActive: false,
    },
    
    // 出力観測
    {
      id: 'observe_bit3',
      from: { gateId: 'dff1', pinIndex: -1 },
      to: { gateId: 'out_bit3', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'observe_bit2',
      from: { gateId: 'dff2', pinIndex: -1 },
      to: { gateId: 'out_bit2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'observe_bit1',
      from: { gateId: 'dff3', pinIndex: -1 },
      to: { gateId: 'out_bit1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'observe_bit0',
      from: { gateId: 'dff4', pinIndex: -1 },
      to: { gateId: 'out_bit0', pinIndex: 0 },
      isActive: false,
    },
    
    // ランダム出力
    {
      id: 'random_tap',
      from: { gateId: 'dff4', pinIndex: -1 },
      to: { gateId: 'random_output', pinIndex: 0 },
      isActive: false,
    },
  ],
};