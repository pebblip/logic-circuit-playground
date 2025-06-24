export const JOHNSON_COUNTER = {
  id: 'johnson-counter',
  title: '💫 ジョンソンカウンター',
  description:
    '美しい回転パターンを生成する循環シフトレジスタ。反転フィードバックにより魔法のような連続パターンを作り出します！',
  simulationConfig: {
    needsAnimation: true,
    updateInterval: 250, // 0.25秒 - 1HzCLOCK(1000ms)の1/4間隔で正確な変化を捉える
    expectedBehavior: 'sequence_generator' as const,
    minimumCycles: 12,
    clockFrequency: 1,
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
      metadata: { frequency: 1, isRunning: true },
    },

    // === Layer 1: D-FF shift register ===
    {
      id: 'dff0',
      type: 'D-FF' as const,
      position: { x: 250, y: 250 },
      outputs: [false],
      inputs: [],
      metadata: { qOutput: false, qBarOutput: true, previousClockState: false },
    },
    {
      id: 'dff1',
      type: 'D-FF' as const,
      position: { x: 250, y: 350 },
      outputs: [false],
      inputs: [],
      metadata: { qOutput: false, qBarOutput: true, previousClockState: false },
    },
    {
      id: 'dff2',
      type: 'D-FF' as const,
      position: { x: 250, y: 450 },
      outputs: [false],
      inputs: [],
      metadata: { qOutput: false, qBarOutput: true, previousClockState: false },
    },
    {
      id: 'dff3',
      type: 'D-FF' as const,
      position: { x: 250, y: 550 },
      outputs: [false],
      inputs: [],
      metadata: { qOutput: false, qBarOutput: true, previousClockState: false },
    },

    // === Layer 2a: Feedback NOT gate ===
    {
      id: 'not_feedback',
      type: 'NOT' as const,
      position: { x: 400, y: 400 },
      outputs: [false],
      inputs: [],
    },

    // === Layer 2b: LED outputs ===
    {
      id: 'led0',
      type: 'OUTPUT' as const,
      position: { x: 550, y: 250 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'led1',
      type: 'OUTPUT' as const,
      position: { x: 550, y: 350 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'led2',
      type: 'OUTPUT' as const,
      position: { x: 550, y: 450 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'led3',
      type: 'OUTPUT' as const,
      position: { x: 550, y: 550 },
      outputs: [false],
      inputs: [],
    },

    // === Layer 3: Pattern analysis gates ===
    {
      id: 'pattern_a',
      type: 'AND' as const,
      position: { x: 700, y: 350 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'pattern_b',
      type: 'AND' as const,
      position: { x: 700, y: 450 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'pattern_c',
      type: 'XOR' as const,
      position: { x: 700, y: 550 },
      outputs: [false],
      inputs: [],
    },

    // === Layer 4: Pattern outputs ===
    {
      id: 'out_pattern_a',
      type: 'OUTPUT' as const,
      position: { x: 850, y: 350 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_pattern_b',
      type: 'OUTPUT' as const,
      position: { x: 850, y: 450 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_pattern_c',
      type: 'OUTPUT' as const,
      position: { x: 850, y: 550 },
      outputs: [false],
      inputs: [],
    },

    // === Layer 8: State outputs ===
    {
      id: 'state_000',
      type: 'OUTPUT' as const,
      position: { x: 1450, y: 150 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'state_001',
      type: 'OUTPUT' as const,
      position: { x: 1450, y: 250 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'state_011',
      type: 'OUTPUT' as const,
      position: { x: 1450, y: 350 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'state_111',
      type: 'OUTPUT' as const,
      position: { x: 1450, y: 450 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'state_110',
      type: 'OUTPUT' as const,
      position: { x: 1450, y: 550 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'state_100',
      type: 'OUTPUT' as const,
      position: { x: 1450, y: 650 },
      outputs: [false],
      inputs: [],
    },

    // === Layer 5: State decoder NOTs ===
    {
      id: 'not0',
      type: 'NOT' as const,
      position: { x: 1000, y: 250 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'not1',
      type: 'NOT' as const,
      position: { x: 1000, y: 350 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'not2',
      type: 'NOT' as const,
      position: { x: 1000, y: 450 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'not3',
      type: 'NOT' as const,
      position: { x: 1000, y: 550 },
      outputs: [false],
      inputs: [],
    },

    // === Layer 7: State decoder final ANDs ===
    {
      id: 'and_state_000',
      type: 'AND' as const,
      position: { x: 1300, y: 150 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'and_state_001',
      type: 'AND' as const,
      position: { x: 1300, y: 250 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'and_state_011',
      type: 'AND' as const,
      position: { x: 1300, y: 350 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'and_state_111',
      type: 'AND' as const,
      position: { x: 1300, y: 450 },
      outputs: [false],
      inputs: [],
    },

    // === Layer 6: State decoder intermediate ANDs ===
    {
      id: 'and_state_110_mid',
      type: 'AND' as const,
      position: { x: 1150, y: 375 },
      outputs: [false],
      inputs: [],
    },

    // 状態110デコーダー用の最終ロジック ((dff2 & dff1) & ~dff0)
    {
      id: 'and_state_110',
      type: 'AND' as const,
      position: { x: 1300, y: 550 },
      outputs: [false],
      inputs: [],
    },

    // 状態100デコーダー用の中間ロジック (~dff1 & ~dff0)
    {
      id: 'and_state_100_mid',
      type: 'AND' as const,
      position: { x: 1150, y: 525 },
      outputs: [false],
      inputs: [],
    },

    // 状態100デコーダー用の最終ロジック (dff2 & (~dff1 & ~dff0))
    {
      id: 'and_state_100',
      type: 'AND' as const,
      position: { x: 1300, y: 650 },
      outputs: [false],
      inputs: [],
    },
  ],
  wires: [
    // クロック分配
    {
      id: 'clk_dff0',
      from: { gateId: 'clock', pinIndex: -1 },
      to: { gateId: 'dff0', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'clk_dff1',
      from: { gateId: 'clock', pinIndex: -1 },
      to: { gateId: 'dff1', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'clk_dff2',
      from: { gateId: 'clock', pinIndex: -1 },
      to: { gateId: 'dff2', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'clk_dff3',
      from: { gateId: 'clock', pinIndex: -1 },
      to: { gateId: 'dff3', pinIndex: 1 },
      isActive: false,
    },

    // シフトレジスタ接続
    {
      id: 'shift_0_1',
      from: { gateId: 'dff0', pinIndex: -1 },
      to: { gateId: 'dff1', pinIndex: 0 },
      isActive: false,
    },
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

    // 反転フィードバック（ジョンソンカウンターの核心）
    {
      id: 'feedback_to_not',
      from: { gateId: 'dff3', pinIndex: -1 },
      to: { gateId: 'not_feedback', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'inverted_feedback',
      from: { gateId: 'not_feedback', pinIndex: -1 },
      to: { gateId: 'dff0', pinIndex: 0 },
      isActive: false,
    },

    // LED出力
    {
      id: 'dff0_to_led0',
      from: { gateId: 'dff0', pinIndex: -1 },
      to: { gateId: 'led0', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'dff1_to_led1',
      from: { gateId: 'dff1', pinIndex: -1 },
      to: { gateId: 'led1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'dff2_to_led2',
      from: { gateId: 'dff2', pinIndex: -1 },
      to: { gateId: 'led2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'dff3_to_led3',
      from: { gateId: 'dff3', pinIndex: -1 },
      to: { gateId: 'led3', pinIndex: 0 },
      isActive: false,
    },

    // パターン分析
    {
      id: 'pattern_a_in0',
      from: { gateId: 'dff0', pinIndex: -1 },
      to: { gateId: 'pattern_a', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'pattern_a_in1',
      from: { gateId: 'dff2', pinIndex: -1 },
      to: { gateId: 'pattern_a', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'pattern_b_in0',
      from: { gateId: 'dff1', pinIndex: -1 },
      to: { gateId: 'pattern_b', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'pattern_b_in1',
      from: { gateId: 'dff3', pinIndex: -1 },
      to: { gateId: 'pattern_b', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'pattern_c_in0',
      from: { gateId: 'dff0', pinIndex: -1 },
      to: { gateId: 'pattern_c', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'pattern_c_in1',
      from: { gateId: 'dff3', pinIndex: -1 },
      to: { gateId: 'pattern_c', pinIndex: 1 },
      isActive: false,
    },

    {
      id: 'pattern_a_out',
      from: { gateId: 'pattern_a', pinIndex: -1 },
      to: { gateId: 'out_pattern_a', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'pattern_b_out',
      from: { gateId: 'pattern_b', pinIndex: -1 },
      to: { gateId: 'out_pattern_b', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'pattern_c_out',
      from: { gateId: 'pattern_c', pinIndex: -1 },
      to: { gateId: 'out_pattern_c', pinIndex: 0 },
      isActive: false,
    },

    // 状態デコーダ用のNOT接続
    {
      id: 'dff0_to_not0',
      from: { gateId: 'dff0', pinIndex: -1 },
      to: { gateId: 'not0', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'dff1_to_not1',
      from: { gateId: 'dff1', pinIndex: -1 },
      to: { gateId: 'not1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'dff2_to_not2',
      from: { gateId: 'dff2', pinIndex: -1 },
      to: { gateId: 'not2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'dff3_to_not3',
      from: { gateId: 'dff3', pinIndex: -1 },
      to: { gateId: 'not3', pinIndex: 0 },
      isActive: false,
    },

    // 状態000の検出
    {
      id: 'not0_to_state000',
      from: { gateId: 'not0', pinIndex: -1 },
      to: { gateId: 'and_state_000', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'not1_to_state000',
      from: { gateId: 'not1', pinIndex: -1 },
      to: { gateId: 'and_state_000', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'state000_out',
      from: { gateId: 'and_state_000', pinIndex: -1 },
      to: { gateId: 'state_000', pinIndex: 0 },
      isActive: false,
    },

    // 状態001の検出
    {
      id: 'dff0_to_state001',
      from: { gateId: 'dff0', pinIndex: -1 },
      to: { gateId: 'and_state_001', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'not1_to_state001',
      from: { gateId: 'not1', pinIndex: -1 },
      to: { gateId: 'and_state_001', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'state001_out',
      from: { gateId: 'and_state_001', pinIndex: -1 },
      to: { gateId: 'state_001', pinIndex: 0 },
      isActive: false,
    },

    // 状態011の検出
    {
      id: 'dff0_to_state011',
      from: { gateId: 'dff0', pinIndex: -1 },
      to: { gateId: 'and_state_011', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'dff1_to_state011',
      from: { gateId: 'dff1', pinIndex: -1 },
      to: { gateId: 'and_state_011', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'state011_out',
      from: { gateId: 'and_state_011', pinIndex: -1 },
      to: { gateId: 'state_011', pinIndex: 0 },
      isActive: false,
    },

    // 状態111の検出
    {
      id: 'dff0_to_state111',
      from: { gateId: 'dff0', pinIndex: -1 },
      to: { gateId: 'and_state_111', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'dff1_to_state111',
      from: { gateId: 'dff1', pinIndex: -1 },
      to: { gateId: 'and_state_111', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'state111_out',
      from: { gateId: 'and_state_111', pinIndex: -1 },
      to: { gateId: 'state_111', pinIndex: 0 },
      isActive: false,
    },

    // 状態110の検出 (dff2 & dff1 & ~dff0)
    // 中間ロジック: dff2 & dff1
    {
      id: 'dff2_to_state110_mid',
      from: { gateId: 'dff2', pinIndex: -1 },
      to: { gateId: 'and_state_110_mid', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'dff1_to_state110_mid',
      from: { gateId: 'dff1', pinIndex: -1 },
      to: { gateId: 'and_state_110_mid', pinIndex: 1 },
      isActive: false,
    },
    // 最終ロジック: (dff2 & dff1) & ~dff0
    {
      id: 'state110_mid_to_final',
      from: { gateId: 'and_state_110_mid', pinIndex: -1 },
      to: { gateId: 'and_state_110', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'not0_to_state110',
      from: { gateId: 'not0', pinIndex: -1 },
      to: { gateId: 'and_state_110', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'state110_out',
      from: { gateId: 'and_state_110', pinIndex: -1 },
      to: { gateId: 'state_110', pinIndex: 0 },
      isActive: false,
    },

    // 状態100の検出 (dff2 & ~dff1 & ~dff0)
    // 中間ロジック: ~dff1 & ~dff0
    {
      id: 'not1_to_state100_mid',
      from: { gateId: 'not1', pinIndex: -1 },
      to: { gateId: 'and_state_100_mid', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'not0_to_state100_mid',
      from: { gateId: 'not0', pinIndex: -1 },
      to: { gateId: 'and_state_100_mid', pinIndex: 1 },
      isActive: false,
    },
    // 最終ロジック: dff2 & (~dff1 & ~dff0)
    {
      id: 'dff2_to_state100',
      from: { gateId: 'dff2', pinIndex: -1 },
      to: { gateId: 'and_state_100', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'state100_mid_to_final',
      from: { gateId: 'and_state_100_mid', pinIndex: -1 },
      to: { gateId: 'and_state_100', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'state100_out',
      from: { gateId: 'and_state_100', pinIndex: -1 },
      to: { gateId: 'state_100', pinIndex: 0 },
      isActive: false,
    },
  ],
};
