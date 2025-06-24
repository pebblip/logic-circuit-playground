/**
 * 🔥 シンプルリングオシレータ（遅延モード版）
 *
 * 改善ポイント：
 * - DELAYゲート不要
 * - 3つのNOTゲートのみで発振を実現
 * - 各NOTゲートの自然な遅延（1ns×3 = 3ns周期）
 * - 遅延モードONで自動的に動作
 */
export const SIMPLE_RING_OSCILLATOR = {
  id: 'simple-ring-oscillator',
  title: '🔥 3ゲート発振器',
  description:
    '3つのNOTゲートをリング状に接続した発振回路。ゲートの伝搬遅延により自動的に信号が循環し、出力がON/OFFを繰り返します。遅延モードをONにして動作を確認しましょう。',
  simulationConfig: {
    needsAnimation: true,
    updateInterval: 1000, // 1秒 - 視認しやすく教育的にも適切な速度
    expectedBehavior: 'oscillator' as const,
    minimumCycles: 10,
  },
  skipAutoLayout: true, // 手動配置された美しい水平レイアウトを保持
  gates: [
    // 🔥 たったこれだけ！3つのNOTゲートのみ
    {
      id: 'NOT1',
      type: 'NOT' as const,
      position: { x: 300, y: 200 },
      outputs: [true], // 初期状態をtrueに設定して発振開始
      inputs: [],
    },
    {
      id: 'NOT2',
      type: 'NOT' as const,
      position: { x: 500, y: 200 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'NOT3',
      type: 'NOT' as const,
      position: { x: 700, y: 200 },
      outputs: [false],
      inputs: [],
    },

    // 各ゲートの出力を観測
    {
      id: 'OUT_NOT1',
      type: 'OUTPUT' as const,
      position: { x: 300, y: 100 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'OUT_NOT2',
      type: 'OUTPUT' as const,
      position: { x: 500, y: 100 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'OUT_NOT3',
      type: 'OUTPUT' as const,
      position: { x: 700, y: 100 },
      outputs: [false],
      inputs: [],
    },
  ],
  wires: [
    // 🔥 シンプルなリング接続
    // NOT1 → NOT2
    {
      id: 'w1',
      from: { gateId: 'NOT1', pinIndex: -1 },
      to: { gateId: 'NOT2', pinIndex: 0 },
      isActive: false,
    },
    // NOT2 → NOT3
    {
      id: 'w2',
      from: { gateId: 'NOT2', pinIndex: -1 },
      to: { gateId: 'NOT3', pinIndex: 0 },
      isActive: false,
    },
    // NOT3 → NOT1（フィードバックループ完成）
    {
      id: 'w3',
      from: { gateId: 'NOT3', pinIndex: -1 },
      to: { gateId: 'NOT1', pinIndex: 0 },
      isActive: false,
    },

    // 観測用接続
    {
      id: 'w4',
      from: { gateId: 'NOT1', pinIndex: -1 },
      to: { gateId: 'OUT_NOT1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w5',
      from: { gateId: 'NOT2', pinIndex: -1 },
      to: { gateId: 'OUT_NOT2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w6',
      from: { gateId: 'NOT3', pinIndex: -1 },
      to: { gateId: 'OUT_NOT3', pinIndex: 0 },
      isActive: false,
    },
  ],
};
