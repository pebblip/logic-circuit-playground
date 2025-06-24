export const FIBONACCI_COUNTER = {
  id: 'fibonacci-counter',
  title: '🌸 フィボナッチカウンター',
  description:
    '数学の黄金比を生み出すフィボナッチ数列を生成する美しい循環回路。自然界のパターンをデジタル回路で再現！',
  simulationConfig: {
    needsAnimation: true,
    updateInterval: 150, // 0.15秒 - 1.667HzCLOCK(600ms)の1/4間隔で正確な変化を捉える
    expectedBehavior: 'sequence_generator' as const,
    minimumCycles: 8,
    clockFrequency: 1.667, // 1.667Hz = 600ms周期
  },
  skipAutoLayout: true, // 手動配置された最適レイアウトを保持
  gates: [
    // === Layer 0: CLOCK source ===
    {
      id: 'clock',
      type: 'CLOCK' as const,
      position: { x: 100, y: 400 },
      outputs: [true],
      inputs: [],
      metadata: { frequency: 1.667, isRunning: true }, // startTimeは評価時に自動設定
    },

    // === Layer 1: Register A (previous value) ===
    {
      id: 'reg_a_0',
      type: 'D-FF' as const,
      position: { x: 250, y: 350 },
      outputs: [false], // F(0) = 0
      inputs: [],
      metadata: {
        qOutput: false,
        qBarOutput: true,
        previousClockState: false,
        isFirstEvaluation: true,
      },
    },
    {
      id: 'reg_a_1',
      type: 'D-FF' as const,
      position: { x: 250, y: 450 },
      outputs: [false],
      inputs: [],
      metadata: {
        qOutput: false,
        qBarOutput: true,
        previousClockState: false,
        isFirstEvaluation: true,
      },
    },

    // === Layer 2: Register B (current value) ===
    {
      id: 'reg_b_0',
      type: 'D-FF' as const,
      position: { x: 400, y: 350 },
      outputs: [true], // F(1) = 1
      inputs: [],
      metadata: {
        qOutput: true,
        qBarOutput: false,
        previousClockState: false,
        isFirstEvaluation: true,
      },
    },
    {
      id: 'reg_b_1',
      type: 'D-FF' as const,
      position: { x: 400, y: 450 },
      outputs: [false],
      inputs: [],
      metadata: {
        qOutput: false,
        qBarOutput: true,
        previousClockState: false,
        isFirstEvaluation: true,
      },
    },

    // === Layer 3: Adder stage 1 (XOR/AND) ===
    {
      id: 'xor_0',
      type: 'XOR' as const,
      position: { x: 550, y: 300 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'and_0',
      type: 'AND' as const,
      position: { x: 550, y: 400 },
      outputs: [false],
      inputs: [],
    },

    {
      id: 'xor_1a',
      type: 'XOR' as const,
      position: { x: 550, y: 500 },
      outputs: [false],
      inputs: [],
    },
    // === Layer 4: Adder stage 2 (carry logic) ===
    {
      id: 'xor_1b',
      type: 'XOR' as const,
      position: { x: 700, y: 350 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'and_1a',
      type: 'AND' as const,
      position: { x: 550, y: 600 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'and_1b',
      type: 'AND' as const,
      position: { x: 700, y: 450 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'or_1',
      type: 'OR' as const,
      position: { x: 700, y: 550 },
      outputs: [false],
      inputs: [],
    },

    {
      id: 'reg_a_2',
      type: 'D-FF' as const,
      position: { x: 250, y: 550 },
      outputs: [false],
      inputs: [],
      metadata: {
        qOutput: false,
        qBarOutput: true,
        previousClockState: false,
        isFirstEvaluation: true,
      },
    },
    {
      id: 'reg_b_2',
      type: 'D-FF' as const,
      position: { x: 400, y: 550 },
      outputs: [false],
      inputs: [],
      metadata: {
        qOutput: false,
        qBarOutput: true,
        previousClockState: false,
        isFirstEvaluation: true,
      },
    },

    // === Layer 5: フィボナッチ結果出力 ===
    {
      id: 'out_fib_0',
      type: 'OUTPUT' as const,
      position: { x: 1000, y: 350 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_fib_1',
      type: 'OUTPUT' as const,
      position: { x: 1000, y: 450 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_fib_2',
      type: 'OUTPUT' as const,
      position: { x: 1000, y: 550 },
      outputs: [false],
      inputs: [],
    },

    // A値デバッグ出力 (上部配置)
    {
      id: 'out_a_0',
      type: 'OUTPUT' as const,
      position: { x: 250, y: 150 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_a_1',
      type: 'OUTPUT' as const,
      position: { x: 400, y: 150 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_a_2',
      type: 'OUTPUT' as const,
      position: { x: 550, y: 150 },
      outputs: [false],
      inputs: [],
    },

    // B値デバッグ出力 (下部配置)
    {
      id: 'out_b_0',
      type: 'OUTPUT' as const,
      position: { x: 250, y: 700 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_b_1',
      type: 'OUTPUT' as const,
      position: { x: 400, y: 700 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_b_2',
      type: 'OUTPUT' as const,
      position: { x: 550, y: 700 },
      outputs: [false],
      inputs: [],
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
    // reg_a_2にはreg_b_2の値を転送（正しいフィボナッチロジック：A = B）
    {
      id: 'b2_to_a2',
      from: { gateId: 'reg_b_2', pinIndex: -1 },
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
