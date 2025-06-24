export const CHAOS_GENERATOR = {
  id: 'chaos-generator',
  title: '🌀 カオス発生器（LFSR）',
  description:
    '線形フィードバックシフトレジスタによる疑似ランダム生成器。暗号学や乱数生成に使われる高度な循環回路です。',
  simulationConfig: {
    needsAnimation: true,
    updateInterval: 125, // 0.125秒 - 2HzCLOCK(500ms)の1/4間隔で正確な変化を捉える
    expectedBehavior: 'oscillator' as const,
    minimumCycles: 20,
  },
  skipAutoLayout: true, // 手動配置された最適レイアウトを保持
  gates: [
    // === Layer 0: CLOCK source ===
    {
      id: 'clock',
      type: 'CLOCK' as const,
      position: { x: 100, y: 400 },
      outputs: [true], // 初期状態でONにしてクロック信号を見やすく
      inputs: [],
      metadata: { frequency: 2, isRunning: true }, // 2Hz - startTimeは評価時に自動設定
    },

    // === Layer 1: 4ビットシフトレジスタ ===
    {
      id: 'dff1',
      type: 'D-FF' as const,
      position: { x: 250, y: 350 },
      outputs: [true], // 初期値
      inputs: [],
      metadata: {
        qOutput: true,
        qBarOutput: false,
        previousClockState: false,
        isFirstEvaluation: true,
      }, // 初回エッジ検出を防ぐ
    },
    {
      id: 'dff2',
      type: 'D-FF' as const,
      position: { x: 250, y: 450 },
      outputs: [false],
      inputs: [],
      metadata: {
        qOutput: false,
        qBarOutput: true,
        previousClockState: false,
        isFirstEvaluation: true,
      }, // 初回エッジ検出を防ぐ
    },
    {
      id: 'dff3',
      type: 'D-FF' as const,
      position: { x: 400, y: 350 },
      outputs: [true], // 1に変更
      inputs: [],
      metadata: {
        qOutput: true,
        qBarOutput: false,
        previousClockState: false,
        isFirstEvaluation: true,
      }, // 初回エッジ検出を防ぐ
    },
    {
      id: 'dff4',
      type: 'D-FF' as const,
      position: { x: 400, y: 450 },
      outputs: [false],
      inputs: [],
      metadata: {
        qOutput: false,
        qBarOutput: true,
        previousClockState: false,
        isFirstEvaluation: true,
      }, // 初回エッジ検出を防ぐ
    },

    // === Layer 2: XORフィードバック ===
    {
      id: 'xor_feedback',
      type: 'XOR' as const,
      position: { x: 550, y: 400 },
      outputs: [false],
      inputs: [],
    },

    // === Layer 3: 出力観測用 ===
    {
      id: 'out_bit3',
      type: 'OUTPUT' as const,
      position: { x: 700, y: 300 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_bit2',
      type: 'OUTPUT' as const,
      position: { x: 700, y: 400 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_bit1',
      type: 'OUTPUT' as const,
      position: { x: 700, y: 500 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_bit0',
      type: 'OUTPUT' as const,
      position: { x: 700, y: 600 },
      outputs: [false],
      inputs: [],
    },

    // メインランダム出力
    {
      id: 'random_output',
      type: 'OUTPUT' as const,
      position: { x: 700, y: 200 },
      outputs: [false],
      inputs: [],
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
