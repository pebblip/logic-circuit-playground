export const SR_LATCH_BASIC = {
  id: 'sr-latch-basic',
  title: 'SRラッチ（記憶素子）',
  description:
    'NORゲート2つで作る最も基本的な記憶回路。S（Set）をONにするとQ出力が1に、R（Reset）をONにするとQ出力が0になります。両方OFFにしても状態を保持します。',
  simulationConfig: {
    needsAnimation: false,
    updateInterval: 100,
    expectedBehavior: 'memory_circuit' as const,
    minimumCycles: 5,
  },
  skipAutoLayout: true, // 手動配置されたレイアウトを保持
  gates: [
    // === Layer 0: 入力 ===
    {
      id: 'S',
      type: 'INPUT' as const,
      position: { x: 100, y: 350 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'R',
      type: 'INPUT' as const,
      position: { x: 100, y: 450 },
      outputs: [false],
      inputs: [],
    },
    // === Layer 1: NORゲート ===
    {
      id: 'NOR1',
      type: 'NOR' as const,
      position: { x: 250, y: 350 },
      outputs: [true], // Q = 1
      inputs: [],
    },
    {
      id: 'NOR2',
      type: 'NOR' as const,
      position: { x: 250, y: 450 },
      outputs: [false], // Q̄ = 0
      inputs: [],
    },
    // === Layer 2: 出力 ===
    {
      id: 'Q',
      type: 'OUTPUT' as const,
      position: { x: 400, y: 350 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'Q_BAR',
      type: 'OUTPUT' as const,
      position: { x: 400, y: 450 },
      outputs: [false],
      inputs: [],
    },
  ],
  wires: [
    // R → NOR1（Q側）の1番目の入力
    {
      id: 'w1',
      from: { gateId: 'R', pinIndex: -1 },
      to: { gateId: 'NOR1', pinIndex: 0 },
      isActive: false,
    },
    // S → NOR2（Q̄側）の1番目の入力
    {
      id: 'w2',
      from: { gateId: 'S', pinIndex: -1 },
      to: { gateId: 'NOR2', pinIndex: 0 },
      isActive: false,
    },
    // NOR1 → Q
    {
      id: 'w3',
      from: { gateId: 'NOR1', pinIndex: -1 },
      to: { gateId: 'Q', pinIndex: 0 },
      isActive: false,
    },
    // NOR2 → Q_BAR
    {
      id: 'w4',
      from: { gateId: 'NOR2', pinIndex: -1 },
      to: { gateId: 'Q_BAR', pinIndex: 0 },
      isActive: false,
    },
    // クロスカップリング: NOR1 → NOR2
    {
      id: 'w5',
      from: { gateId: 'NOR1', pinIndex: -1 },
      to: { gateId: 'NOR2', pinIndex: 1 },
      isActive: false,
    },
    // クロスカップリング: NOR2 → NOR1
    {
      id: 'w6',
      from: { gateId: 'NOR2', pinIndex: -1 },
      to: { gateId: 'NOR1', pinIndex: 1 },
      isActive: false,
    },
  ],
};
