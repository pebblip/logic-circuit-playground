import type { Gate, Wire } from '../../../types';

export const FIBONACCI_COUNTER = {
  id: 'fibonacci-counter',
  title: '🌸 フィボナッチカウンター',
  description: '数学の黄金比を生み出すフィボナッチ数列を生成する美しい循環回路。自然界のパターンをデジタル回路で再現！',
  simulationConfig: {
    needsAnimation: true,
    updateInterval: 200,
    expectedBehavior: 'sequence_generator' as const,
    minimumCycles: 8,
    clockFrequency: 2
  },
  gates: [
    // CLOCK (2Hz for better observation)
    {
      id: 'clock',
      type: 'CLOCK' as const,
      position: { x: 100, y: 200 },
      output: true,
      inputs: [],
      metadata: { frequency: 2, isRunning: true, startTime: Date.now() },
    },
    
    // フィボナッチ数列レジスタ A (前の値) - 2ビット版
    {
      id: 'reg_a_0',
      type: 'D-FF' as const,
      position: { x: 250, y: 150 },
      output: true, // F(0) = 1
      inputs: ['', ''],
      metadata: { qOutput: true, previousClockState: false },
    },
    {
      id: 'reg_a_1',
      type: 'D-FF' as const,
      position: { x: 350, y: 150 },
      output: false,
      inputs: ['', ''],
      metadata: { qOutput: false, previousClockState: false },
    },
    
    // フィボナッチ数列レジスタ B (現在の値) - 2ビット版
    {
      id: 'reg_b_0',
      type: 'D-FF' as const,
      position: { x: 250, y: 300 },
      output: true, // F(1) = 1
      inputs: ['', ''],
      metadata: { qOutput: true, previousClockState: false },
    },
    {
      id: 'reg_b_1',
      type: 'D-FF' as const,
      position: { x: 350, y: 300 },
      output: false,
      inputs: ['', ''],
      metadata: { qOutput: false, previousClockState: false },
    },
    
    // 2ビット加算器 (A + B)
    // ビット0の半加算器
    {
      id: 'xor_0',
      type: 'XOR' as const,
      position: { x: 550, y: 120 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'and_0',
      type: 'AND' as const,
      position: { x: 550, y: 160 },
      output: false,
      inputs: ['', ''],
    },
    
    // ビット1の全加算器
    {
      id: 'xor_1a',
      type: 'XOR' as const,
      position: { x: 550, y: 220 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'xor_1b',
      type: 'XOR' as const,
      position: { x: 650, y: 220 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'and_1a',
      type: 'AND' as const,
      position: { x: 550, y: 260 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'and_1b',
      type: 'AND' as const,
      position: { x: 650, y: 260 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'or_1',
      type: 'OR' as const,
      position: { x: 700, y: 240 },
      output: false,
      inputs: ['', ''],
    },
    
    // ダミーのbit2レジスタ（オーバーフロー表示用）
    {
      id: 'reg_a_2',
      type: 'D-FF' as const,
      position: { x: 450, y: 150 },
      output: false,
      inputs: ['', ''],
      metadata: { qOutput: false, previousClockState: false },
    },
    {
      id: 'reg_b_2',
      type: 'D-FF' as const,
      position: { x: 450, y: 300 },
      output: false,
      inputs: ['', ''],
      metadata: { qOutput: false, previousClockState: false },
    },
    
    // 出力表示
    {
      id: 'out_fib_0',
      type: 'OUTPUT' as const,
      position: { x: 750, y: 120 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_fib_1',
      type: 'OUTPUT' as const,
      position: { x: 750, y: 220 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_fib_2',
      type: 'OUTPUT' as const,
      position: { x: 750, y: 320 },
      output: false,
      inputs: [''],
    },
    
    // 現在のA値表示
    {
      id: 'out_a_0',
      type: 'OUTPUT' as const,
      position: { x: 250, y: 50 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_a_1',
      type: 'OUTPUT' as const,
      position: { x: 350, y: 50 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_a_2',
      type: 'OUTPUT' as const,
      position: { x: 450, y: 50 },
      output: false,
      inputs: [''],
    },
    
    // 現在のB値表示
    {
      id: 'out_b_0',
      type: 'OUTPUT' as const,
      position: { x: 250, y: 400 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_b_1',
      type: 'OUTPUT' as const,
      position: { x: 350, y: 400 },
      output: false,
      inputs: [''],
    },
    {
      id: 'out_b_2',
      type: 'OUTPUT' as const,
      position: { x: 450, y: 400 },
      output: false,
      inputs: [''],
    },
  ],
  wires: [
    // クロック分配
    {
      id: 'clk_a0',
      from: { gateId: 'clock', pinIndex: -1 },
      to: { gateId: 'reg_a_0', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'clk_a1',
      from: { gateId: 'clock', pinIndex: -1 },
      to: { gateId: 'reg_a_1', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'clk_a2',
      from: { gateId: 'clock', pinIndex: -1 },
      to: { gateId: 'reg_a_2', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'clk_b0',
      from: { gateId: 'clock', pinIndex: -1 },
      to: { gateId: 'reg_b_0', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'clk_b1',
      from: { gateId: 'clock', pinIndex: -1 },
      to: { gateId: 'reg_b_1', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'clk_b2',
      from: { gateId: 'clock', pinIndex: -1 },
      to: { gateId: 'reg_b_2', pinIndex: 1 },
      isActive: false,
    },
    
    // フィボナッチロジック: A = B, B = A + B
    // レジスタAにBの値を転送
    {
      id: 'b0_to_a0',
      from: { gateId: 'reg_b_0', pinIndex: -1 },
      to: { gateId: 'reg_a_0', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'b1_to_a1',
      from: { gateId: 'reg_b_1', pinIndex: -1 },
      to: { gateId: 'reg_a_1', pinIndex: 0 },
      isActive: false,
    },
    // reg_a_2もキャリーから直接（同時に光るように）
    {
      id: 'carry_to_a2',
      from: { gateId: 'or_1', pinIndex: -1 },
      to: { gateId: 'reg_a_2', pinIndex: 0 },
      isActive: false,
    },
    
    // 加算器の入力接続
    // ビット0
    {
      id: 'a0_to_xor0',
      from: { gateId: 'reg_a_0', pinIndex: -1 },
      to: { gateId: 'xor_0', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'b0_to_xor0',
      from: { gateId: 'reg_b_0', pinIndex: -1 },
      to: { gateId: 'xor_0', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'a0_to_and0',
      from: { gateId: 'reg_a_0', pinIndex: -1 },
      to: { gateId: 'and_0', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'b0_to_and0',
      from: { gateId: 'reg_b_0', pinIndex: -1 },
      to: { gateId: 'and_0', pinIndex: 1 },
      isActive: false,
    },
    
    // ビット1
    {
      id: 'a1_to_xor1a',
      from: { gateId: 'reg_a_1', pinIndex: -1 },
      to: { gateId: 'xor_1a', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'b1_to_xor1a',
      from: { gateId: 'reg_b_1', pinIndex: -1 },
      to: { gateId: 'xor_1a', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'xor1a_to_xor1b',
      from: { gateId: 'xor_1a', pinIndex: -1 },
      to: { gateId: 'xor_1b', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'carry0_to_xor1b',
      from: { gateId: 'and_0', pinIndex: -1 },
      to: { gateId: 'xor_1b', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'a1_to_and1a',
      from: { gateId: 'reg_a_1', pinIndex: -1 },
      to: { gateId: 'and_1a', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'b1_to_and1a',
      from: { gateId: 'reg_b_1', pinIndex: -1 },
      to: { gateId: 'and_1a', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'xor1a_to_and1b',
      from: { gateId: 'xor_1a', pinIndex: -1 },
      to: { gateId: 'and_1b', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'carry0_to_and1b',
      from: { gateId: 'and_0', pinIndex: -1 },
      to: { gateId: 'and_1b', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'and1a_to_or1',
      from: { gateId: 'and_1a', pinIndex: -1 },
      to: { gateId: 'or_1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'and1b_to_or1',
      from: { gateId: 'and_1b', pinIndex: -1 },
      to: { gateId: 'or_1', pinIndex: 1 },
      isActive: false,
    },
    
    
    // 加算結果をレジスタBに戻す
    {
      id: 'sum0_to_b0',
      from: { gateId: 'xor_0', pinIndex: -1 },
      to: { gateId: 'reg_b_0', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'sum1_to_b1',
      from: { gateId: 'xor_1b', pinIndex: -1 },
      to: { gateId: 'reg_b_1', pinIndex: 0 },
      isActive: false,
    },
    // reg_b_2にはキャリー（オーバーフロー）を接続
    {
      id: 'carry_to_b2',
      from: { gateId: 'or_1', pinIndex: -1 },
      to: { gateId: 'reg_b_2', pinIndex: 0 },
      isActive: false,
    },
    
    // 出力接続
    {
      id: 'sum0_to_out',
      from: { gateId: 'xor_0', pinIndex: -1 },
      to: { gateId: 'out_fib_0', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'sum1_to_out',
      from: { gateId: 'xor_1b', pinIndex: -1 },
      to: { gateId: 'out_fib_1', pinIndex: 0 },
      isActive: false,
    },
    // フィボナッチ結果のbit2はキャリー（オーバーフロー）
    {
      id: 'carry_to_out_fib2',
      from: { gateId: 'or_1', pinIndex: -1 },
      to: { gateId: 'out_fib_2', pinIndex: 0 },
      isActive: false,
    },
    
    // A値観測
    {
      id: 'a0_to_out_a0',
      from: { gateId: 'reg_a_0', pinIndex: -1 },
      to: { gateId: 'out_a_0', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'a1_to_out_a1',
      from: { gateId: 'reg_a_1', pinIndex: -1 },
      to: { gateId: 'out_a_1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'a2_to_out_a2',
      from: { gateId: 'reg_a_2', pinIndex: -1 },
      to: { gateId: 'out_a_2', pinIndex: 0 },
      isActive: false,
    },
    
    // B値観測
    {
      id: 'b0_to_out_b0',
      from: { gateId: 'reg_b_0', pinIndex: -1 },
      to: { gateId: 'out_b_0', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'b1_to_out_b1',
      from: { gateId: 'reg_b_1', pinIndex: -1 },
      to: { gateId: 'out_b_1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'b2_to_out_b2',
      from: { gateId: 'reg_b_2', pinIndex: -1 },
      to: { gateId: 'out_b_2', pinIndex: 0 },
      isActive: false,
    },
  ],
};