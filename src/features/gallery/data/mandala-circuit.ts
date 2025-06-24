import type { GalleryCircuit } from './types';

export const MANDALA_CIRCUIT: GalleryCircuit = {
  id: 'mandala-circuit',
  title: '🌸 マンダラ回路（ミニマル版）',
  description:
    '2つのリングオシレーター（3個と5個のNOT）が生み出す美しい周期パターン。20ゲートで全出力が動的に変化！',
  simulationConfig: {
    needsAnimation: true,
    updateInterval: 500, // 0.5秒 - 適度な速度で変化を観察
    expectedBehavior: 'oscillator' as const,
    minimumCycles: 15,
  },
  skipAutoLayout: true, // 手動配置された美しいマンダラレイアウトを保持
  gates: [
    // === Ring1 (3個のNOT) - 内側正三角形配置 ===
    {
      id: 'ring1_not1',
      type: 'NOT' as const,
      position: { x: 400, y: 175 }, // 上（中心から80px）
      outputs: [true],
      inputs: [],
    },
    {
      id: 'ring1_not2',
      type: 'NOT' as const,
      position: { x: 325, y: 300 }, // 左下（120度）
      outputs: [false],
      inputs: [],
    },
    {
      id: 'ring1_not3',
      type: 'NOT' as const,
      position: { x: 475, y: 300 }, // 右下（240度）
      outputs: [false],
      inputs: [],
    },

    // === Ring2 (5個のNOT) - 外側正五角形配置 ===
    {
      id: 'ring2_not1',
      type: 'NOT' as const,
      position: { x: 400, y: 110 }, // 上（0度）
      outputs: [true],
      inputs: [],
    },
    {
      id: 'ring2_not2',
      type: 'NOT' as const,
      position: { x: 533, y: 193 }, // 右上（72度）
      outputs: [false],
      inputs: [],
    },
    {
      id: 'ring2_not3',
      type: 'NOT' as const,
      position: { x: 486, y: 383 }, // 右下（144度）
      outputs: [true],
      inputs: [],
    },
    {
      id: 'ring2_not4',
      type: 'NOT' as const,
      position: { x: 314, y: 383 }, // 左下（216度）
      outputs: [false],
      inputs: [],
    },
    {
      id: 'ring2_not5',
      type: 'NOT' as const,
      position: { x: 267, y: 193 }, // 左上（288度）
      outputs: [false],
      inputs: [],
    },

    // === 相互作用ゲート - 中央配置 ===
    {
      id: 'interact_xor',
      type: 'XOR' as const,
      position: { x: 400, y: 290 }, // 中央下寄り（重なり回避）
      outputs: [false],
      inputs: [],
    },

    // === パターン生成 - 5個を正五角形配置 ===
    {
      id: 'pattern_xor1',
      type: 'XOR' as const,
      position: { x: 525, y: 100 }, // パターン0度（-54度オフセット）
      outputs: [false],
      inputs: [],
    },
    {
      id: 'pattern_xor2',
      type: 'XOR' as const,
      position: { x: 588, y: 314 }, // パターン72度
      outputs: [false],
      inputs: [],
    },
    {
      id: 'pattern_xor3',
      type: 'XOR' as const,
      position: { x: 400, y: 400 }, // パターン144度
      outputs: [false],
      inputs: [],
    },
    {
      id: 'pattern_xor4',
      type: 'XOR' as const,
      position: { x: 212, y: 314 }, // パターン216度
      outputs: [false],
      inputs: [],
    },
    {
      id: 'pattern_xor5',
      type: 'XOR' as const,
      position: { x: 275, y: 100 }, // パターン288度
      outputs: [false],
      inputs: [],
    },

    // === 出力（6方向）- 最外殻放射状配置 ===
    {
      id: 'out_north',
      type: 'OUTPUT' as const,
      position: { x: 400, y: -30 }, // 北（280px半径）
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_northeast',
      type: 'OUTPUT' as const,
      position: { x: 642, y: 108 }, // 北東（60度）
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_southeast',
      type: 'OUTPUT' as const,
      position: { x: 642, y: 392 }, // 南東（120度）
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_south',
      type: 'OUTPUT' as const,
      position: { x: 400, y: 530 }, // 南（180度）
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_southwest',
      type: 'OUTPUT' as const,
      position: { x: 158, y: 392 }, // 南西（240度）
      outputs: [false],
      inputs: [],
    },
    {
      id: 'out_northwest',
      type: 'OUTPUT' as const,
      position: { x: 158, y: 108 }, // 北西（300度）
      outputs: [false],
      inputs: [],
    },
  ],
  wires: [
    // === リング1の接続 ===
    {
      id: 'r1_1_2',
      from: { gateId: 'ring1_not1', pinIndex: -1 },
      to: { gateId: 'ring1_not2', pinIndex: 0 },
      isActive: true,
    },
    {
      id: 'r1_2_3',
      from: { gateId: 'ring1_not2', pinIndex: -1 },
      to: { gateId: 'ring1_not3', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'r1_3_1',
      from: { gateId: 'ring1_not3', pinIndex: -1 },
      to: { gateId: 'ring1_not1', pinIndex: 0 },
      isActive: false,
    },

    // === リング2の接続 ===
    {
      id: 'r2_1_2',
      from: { gateId: 'ring2_not1', pinIndex: -1 },
      to: { gateId: 'ring2_not2', pinIndex: 0 },
      isActive: true,
    },
    {
      id: 'r2_2_3',
      from: { gateId: 'ring2_not2', pinIndex: -1 },
      to: { gateId: 'ring2_not3', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'r2_3_4',
      from: { gateId: 'ring2_not3', pinIndex: -1 },
      to: { gateId: 'ring2_not4', pinIndex: 0 },
      isActive: true,
    },
    {
      id: 'r2_4_5',
      from: { gateId: 'ring2_not4', pinIndex: -1 },
      to: { gateId: 'ring2_not5', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'r2_5_1',
      from: { gateId: 'ring2_not5', pinIndex: -1 },
      to: { gateId: 'ring2_not1', pinIndex: 0 },
      isActive: false,
    },

    // === 相互作用 ===
    {
      id: 'r1_to_interact',
      from: { gateId: 'ring1_not1', pinIndex: -1 },
      to: { gateId: 'interact_xor', pinIndex: 0 },
      isActive: true,
    },
    {
      id: 'r2_to_interact',
      from: { gateId: 'ring2_not1', pinIndex: -1 },
      to: { gateId: 'interact_xor', pinIndex: 1 },
      isActive: true,
    },

    // === パターン生成への入力 ===
    {
      id: 'r2_to_pattern1',
      from: { gateId: 'ring2_not4', pinIndex: -1 },
      to: { gateId: 'pattern_xor1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'r1_to_pattern1',
      from: { gateId: 'ring1_not3', pinIndex: -1 },
      to: { gateId: 'pattern_xor1', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'r2_to_pattern2',
      from: { gateId: 'ring2_not3', pinIndex: -1 },
      to: { gateId: 'pattern_xor2', pinIndex: 0 },
      isActive: true,
    },
    {
      id: 'interact_to_pattern2',
      from: { gateId: 'interact_xor', pinIndex: -1 },
      to: { gateId: 'pattern_xor2', pinIndex: 1 },
      isActive: false,
    },

    // === 追加パターン生成への入力 ===
    {
      id: 'r1_to_pattern3',
      from: { gateId: 'ring1_not3', pinIndex: -1 },
      to: { gateId: 'pattern_xor3', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'r2_to_pattern3',
      from: { gateId: 'ring2_not2', pinIndex: -1 },
      to: { gateId: 'pattern_xor3', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'r1_to_pattern4',
      from: { gateId: 'ring1_not1', pinIndex: -1 },
      to: { gateId: 'pattern_xor4', pinIndex: 0 },
      isActive: true,
    },
    {
      id: 'r2_to_pattern4',
      from: { gateId: 'ring2_not5', pinIndex: -1 },
      to: { gateId: 'pattern_xor4', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'r2_to_pattern5',
      from: { gateId: 'ring2_not4', pinIndex: -1 },
      to: { gateId: 'pattern_xor5', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'interact_to_pattern5',
      from: { gateId: 'interact_xor', pinIndex: -1 },
      to: { gateId: 'pattern_xor5', pinIndex: 1 },
      isActive: false,
    },

    // === 出力配線 ===
    {
      id: 'pattern3_to_north',
      from: { gateId: 'pattern_xor3', pinIndex: -1 },
      to: { gateId: 'out_north', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'pattern5_to_northeast',
      from: { gateId: 'pattern_xor5', pinIndex: -1 },
      to: { gateId: 'out_northeast', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'pattern2_to_southeast',
      from: { gateId: 'pattern_xor2', pinIndex: -1 },
      to: { gateId: 'out_southeast', pinIndex: 0 },
      isActive: true,
    },
    {
      id: 'interact_to_south',
      from: { gateId: 'interact_xor', pinIndex: -1 },
      to: { gateId: 'out_south', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'pattern1_to_southwest',
      from: { gateId: 'pattern_xor1', pinIndex: -1 },
      to: { gateId: 'out_southwest', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'pattern4_to_northwest',
      from: { gateId: 'pattern_xor4', pinIndex: -1 },
      to: { gateId: 'out_northwest', pinIndex: 0 },
      isActive: true,
    },
  ],
};
