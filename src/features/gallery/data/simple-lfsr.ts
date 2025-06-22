/**
 * シンプルな2ビットLFSR - 最小限のテスト用
 * 確実に動作することを確認してから複雑にする
 */
export const SIMPLE_LFSR = {
  id: 'simple-lfsr',
  title: '🔧 シンプル2ビットLFSR（テスト用）',
  description:
    '最小限の2ビットLFSRで動作を確認。複雑になる前に基本動作をテスト。',
  simulationConfig: {
    needsAnimation: true,
    updateInterval: 250, // 0.25秒 - 1HzCLOCK(1000ms)の1/4間隔で正確な変化を捉える
    expectedBehavior: 'oscillator' as const,
    minimumCycles: 4,
  },
  gates: [
    // CLOCK
    {
      id: 'clock',
      type: 'CLOCK' as const,
      position: { x: 100, y: 100 },
      outputs: [false],
      inputs: [],
      metadata: { frequency: 1, isRunning: true }, // 1Hz - ゆっくり
    },

    // 2ビットD-FF
    {
      id: 'dff_a',
      type: 'D-FF' as const,
      position: { x: 250, y: 150 },
      outputs: [true], // 初期値 1
      inputs: [],
      metadata: {
        qOutput: true,
        qBarOutput: false,
        previousClockState: false, // 初回エッジ検出を有効に
        isFirstEvaluation: true,
      },
    },
    {
      id: 'dff_b',
      type: 'D-FF' as const,
      position: { x: 400, y: 150 },
      outputs: [false], // 初期値 0
      inputs: [],
      metadata: {
        qOutput: false,
        qBarOutput: true,
        previousClockState: false, // 初回エッジ検出を有効に
        isFirstEvaluation: true,
      },
    },

    // フィードバック（単純にdff_bの出力をdff_aに戻す）
    // これで [1,0] -> [0,1] -> [1,0] の2周期になる

    // 出力観測
    {
      id: 'out_a',
      type: 'OUTPUT' as const,
      position: { x: 250, y: 250 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_b',
      type: 'OUTPUT' as const,
      position: { x: 400, y: 250 },
      outputs: [false],
      inputs: [],
    },
  ],
  wires: [
    // クロック分配
    {
      id: 'clk_a',
      from: { gateId: 'clock', pinIndex: -1 },
      to: { gateId: 'dff_a', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'clk_b',
      from: { gateId: 'clock', pinIndex: -1 },
      to: { gateId: 'dff_b', pinIndex: 1 },
      isActive: false,
    },

    // シフト: dff_a -> dff_b
    {
      id: 'shift',
      from: { gateId: 'dff_a', pinIndex: -1 },
      to: { gateId: 'dff_b', pinIndex: 0 },
      isActive: false,
    },

    // フィードバック: dff_b -> dff_a
    {
      id: 'feedback',
      from: { gateId: 'dff_b', pinIndex: -1 },
      to: { gateId: 'dff_a', pinIndex: 0 },
      isActive: false,
    },

    // 出力観測
    {
      id: 'observe_a',
      from: { gateId: 'dff_a', pinIndex: -1 },
      to: { gateId: 'out_a', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'observe_b',
      from: { gateId: 'dff_b', pinIndex: -1 },
      to: { gateId: 'out_b', pinIndex: 0 },
      isActive: false,
    },
  ],
};
