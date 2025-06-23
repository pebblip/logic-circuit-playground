/**
 * 🌀 セルフオシレーティングメモリ（改善版）
 *
 * 改善点：
 * - トリガーのワンショット化で安定動作
 * - シンプルな発振器コア（5ゲートリング）
 * - 明確な制御ロジック分離
 */
export const SELF_OSCILLATING_MEMORY_IMPROVED = {
  id: 'self-oscillating-memory-improved',
  title: '🌀 セルフオシレーティングメモリ（改善版）',
  description:
    'トリガーワンショット化とシンプルな設計で安定した発振を実現！enable制御とtrigger起動の両方に対応。',
  simulationConfig: {
    needsAnimation: true,
    updateInterval: 500, // 0.5秒 - 見やすい速度
    expectedBehavior: 'oscillator' as const,
    minimumCycles: 10,
  },
  gates: [
    // === 制御入力 ===
    {
      id: 'enable',
      type: 'INPUT' as const,
      position: { x: 50, y: 200 },
      outputs: [true],
      inputs: [],
    },
    {
      id: 'trigger',
      type: 'INPUT' as const,
      position: { x: 50, y: 300 },
      outputs: [false],
      inputs: [],
    },

    // === トリガーワンショット回路 ===
    // CLOCKゲート（エッジ検出用）
    {
      id: 'edge_clock',
      type: 'CLOCK' as const,
      position: { x: 50, y: 400 },
      outputs: [false],
      inputs: [],
      metadata: { frequency: 10, isRunning: true }, // 10Hz - 高速サンプリング
    },
    
    // D-FFでtrigger状態を記憶
    {
      id: 'trigger_dff',
      type: 'D-FF' as const,
      position: { x: 150, y: 350 },
      outputs: [false, true],
      inputs: [],
    },
    
    // XORでエッジ検出（立ち上がりのみ）
    {
      id: 'edge_detector',
      type: 'AND' as const, // trigger AND NOT(previous)
      position: { x: 250, y: 300 },
      outputs: [false],
      inputs: [],
    },
    
    // NOT（前回値の反転）
    {
      id: 'prev_not',
      type: 'NOT' as const,
      position: { x: 150, y: 300 },
      outputs: [true],
      inputs: [],
    },

    // === 発振器コア（5ゲートリング） ===
    {
      id: 'osc1',
      type: 'NOT' as const,
      position: { x: 400, y: 200 },
      outputs: [true], // 初期状態
      inputs: [],
    },
    {
      id: 'osc2',
      type: 'NOT' as const,
      position: { x: 500, y: 200 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'osc3',
      type: 'NOT' as const,
      position: { x: 600, y: 200 },
      outputs: [true],
      inputs: [],
    },
    {
      id: 'osc4',
      type: 'NOT' as const,
      position: { x: 700, y: 200 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'osc5',
      type: 'NOT' as const,
      position: { x: 800, y: 200 },
      outputs: [true],
      inputs: [],
    },

    // === 制御ロジック ===
    // Enable制御（発振器出力をゲート）
    {
      id: 'enable_gate',
      type: 'AND' as const,
      position: { x: 900, y: 200 },
      outputs: [false],
      inputs: [],
    },
    
    // 発振器へのフィードバック制御
    {
      id: 'feedback_control',
      type: 'OR' as const,
      position: { x: 300, y: 200 },
      outputs: [false],
      inputs: [],
    },

    // === 出力 ===
    {
      id: 'output_main',
      type: 'OUTPUT' as const,
      position: { x: 1000, y: 200 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'output_inverted',
      type: 'OUTPUT' as const,
      position: { x: 1000, y: 300 },
      outputs: [false],
      inputs: [],
    },
    
    // 反転出力用NOT
    {
      id: 'output_not',
      type: 'NOT' as const,
      position: { x: 900, y: 300 },
      outputs: [false],
      inputs: [],
    },
  ],
  wires: [
    // === トリガーワンショット配線 ===
    // trigger → D-FFのD入力
    {
      id: 'w_trigger_to_dff',
      from: { gateId: 'trigger', pinIndex: -1 },
      to: { gateId: 'trigger_dff', pinIndex: 0 },
      isActive: false,
    },
    // edge_clock → D-FFのCLK入力
    {
      id: 'w_clock_to_dff',
      from: { gateId: 'edge_clock', pinIndex: -1 },
      to: { gateId: 'trigger_dff', pinIndex: 1 },
      isActive: false,
    },
    // D-FFのQ出力 → NOT
    {
      id: 'w_dff_to_not',
      from: { gateId: 'trigger_dff', pinIndex: 0 },
      to: { gateId: 'prev_not', pinIndex: 0 },
      isActive: false,
    },
    // trigger → ANDの入力1
    {
      id: 'w_trigger_to_and',
      from: { gateId: 'trigger', pinIndex: -1 },
      to: { gateId: 'edge_detector', pinIndex: 0 },
      isActive: false,
    },
    // NOT出力 → ANDの入力2
    {
      id: 'w_not_to_and',
      from: { gateId: 'prev_not', pinIndex: -1 },
      to: { gateId: 'edge_detector', pinIndex: 1 },
      isActive: false,
    },

    // === 発振器コア配線（リング） ===
    // osc5 → feedback_control（フィードバック入力）
    {
      id: 'w_osc5_to_fb',
      from: { gateId: 'osc5', pinIndex: -1 },
      to: { gateId: 'feedback_control', pinIndex: 0 },
      isActive: false,
    },
    // edge_detector → feedback_control（トリガー入力）
    {
      id: 'w_edge_to_fb',
      from: { gateId: 'edge_detector', pinIndex: -1 },
      to: { gateId: 'feedback_control', pinIndex: 1 },
      isActive: false,
    },
    // feedback_control → osc1
    {
      id: 'w_fb_to_osc1',
      from: { gateId: 'feedback_control', pinIndex: -1 },
      to: { gateId: 'osc1', pinIndex: 0 },
      isActive: false,
    },
    // osc1 → osc2
    {
      id: 'w_osc1_to_osc2',
      from: { gateId: 'osc1', pinIndex: -1 },
      to: { gateId: 'osc2', pinIndex: 0 },
      isActive: false,
    },
    // osc2 → osc3
    {
      id: 'w_osc2_to_osc3',
      from: { gateId: 'osc2', pinIndex: -1 },
      to: { gateId: 'osc3', pinIndex: 0 },
      isActive: false,
    },
    // osc3 → osc4
    {
      id: 'w_osc3_to_osc4',
      from: { gateId: 'osc3', pinIndex: -1 },
      to: { gateId: 'osc4', pinIndex: 0 },
      isActive: false,
    },
    // osc4 → osc5
    {
      id: 'w_osc4_to_osc5',
      from: { gateId: 'osc4', pinIndex: -1 },
      to: { gateId: 'osc5', pinIndex: 0 },
      isActive: false,
    },

    // === Enable制御配線 ===
    // osc5 → enable_gate入力1
    {
      id: 'w_osc5_to_enable',
      from: { gateId: 'osc5', pinIndex: -1 },
      to: { gateId: 'enable_gate', pinIndex: 0 },
      isActive: false,
    },
    // enable → enable_gate入力2
    {
      id: 'w_enable_to_gate',
      from: { gateId: 'enable', pinIndex: -1 },
      to: { gateId: 'enable_gate', pinIndex: 1 },
      isActive: false,
    },

    // === 出力配線 ===
    // enable_gate → output_main
    {
      id: 'w_gate_to_out',
      from: { gateId: 'enable_gate', pinIndex: -1 },
      to: { gateId: 'output_main', pinIndex: 0 },
      isActive: false,
    },
    // enable_gate → output_not
    {
      id: 'w_gate_to_not',
      from: { gateId: 'enable_gate', pinIndex: -1 },
      to: { gateId: 'output_not', pinIndex: 0 },
      isActive: false,
    },
    // output_not → output_inverted
    {
      id: 'w_not_to_out_inv',
      from: { gateId: 'output_not', pinIndex: -1 },
      to: { gateId: 'output_inverted', pinIndex: 0 },
      isActive: false,
    },
  ],
};