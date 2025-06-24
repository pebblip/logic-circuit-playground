export const BINARY_COUNTER_BASIC = {
  id: 'binary-counter-basic',
  title: '2ビットバイナリカウンタ（基本ゲート版）',
  description:
    'D-FFとクロック制御を基本ゲートで実現したカウンタ。0→1→2→3→0の順でカウントします。',
  skipAutoLayout: true, // 手動配置されたレイアウトを保持
  gates: [
    // クロック入力
    {
      id: 'CLOCK',
      type: 'CLOCK' as const,
      position: { x: 100, y: 300 },
      outputs: [false],
      inputs: [],
      metadata: {
        frequency: 0.5, // 0.5Hz (2秒周期)
        isRunning: true,
        // startTimeは評価時に自動設定
      },
    },

    // リセット入力
    {
      id: 'RESET',
      type: 'INPUT' as const,
      position: { x: 100, y: 200 },
      outputs: [false],
      inputs: [],
    },

    // === D-FF 0 (LSB) ===
    // D-FF 0のSRラッチ (Master)
    {
      id: 'DFF0_M_NOR1',
      type: 'NOR' as const,
      position: { x: 400, y: 280 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'DFF0_M_NOR2',
      type: 'NOR' as const,
      position: { x: 400, y: 330 },
      outputs: [false],
      inputs: [],
    },

    // D-FF 0のSRラッチ (Slave)
    {
      id: 'DFF0_S_NOR1',
      type: 'NOR' as const,
      position: { x: 550, y: 280 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'DFF0_S_NOR2',
      type: 'NOR' as const,
      position: { x: 550, y: 330 },
      outputs: [false],
      inputs: [],
    },

    // クロック制御 (D-FF 0)
    {
      id: 'DFF0_CLK_NOT',
      type: 'NOT' as const,
      position: { x: 200, y: 300 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'DFF0_NAND1',
      type: 'NAND' as const,
      position: { x: 300, y: 260 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'DFF0_NAND2',
      type: 'NAND' as const,
      position: { x: 300, y: 340 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'DFF0_NAND3',
      type: 'NAND' as const,
      position: { x: 480, y: 260 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'DFF0_NAND4',
      type: 'NAND' as const,
      position: { x: 480, y: 340 },
      outputs: [false],
      inputs: [],
    },

    // === D-FF 1 (MSB) ===
    // D-FF 1のSRラッチ (Master)
    {
      id: 'DFF1_M_NOR1',
      type: 'NOR' as const,
      position: { x: 400, y: 480 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'DFF1_M_NOR2',
      type: 'NOR' as const,
      position: { x: 400, y: 530 },
      outputs: [false],
      inputs: [],
    },

    // D-FF 1のSRラッチ (Slave)
    {
      id: 'DFF1_S_NOR1',
      type: 'NOR' as const,
      position: { x: 550, y: 480 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'DFF1_S_NOR2',
      type: 'NOR' as const,
      position: { x: 550, y: 530 },
      outputs: [false],
      inputs: [],
    },

    // クロック制御 (D-FF 1)
    {
      id: 'DFF1_NAND1',
      type: 'NAND' as const,
      position: { x: 300, y: 460 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'DFF1_NAND2',
      type: 'NAND' as const,
      position: { x: 300, y: 540 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'DFF1_NAND3',
      type: 'NAND' as const,
      position: { x: 480, y: 460 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'DFF1_NAND4',
      type: 'NAND' as const,
      position: { x: 480, y: 540 },
      outputs: [false],
      inputs: [],
    },

    // Q0出力の反転 (D-FF1のD入力用)
    {
      id: 'Q0_NOT',
      type: 'NOT' as const,
      position: { x: 650, y: 305 },
      outputs: [false],
      inputs: [],
    },

    // 出力
    {
      id: 'Q0_OUTPUT',
      type: 'OUTPUT' as const,
      position: { x: 750, y: 305 },
      outputs: [false],
      inputs: [],
    },
    {
      id: 'Q1_OUTPUT',
      type: 'OUTPUT' as const,
      position: { x: 750, y: 505 },
      outputs: [false],
      inputs: [],
    },

    // カウント値表示用
    {
      id: 'COUNT_DISPLAY',
      type: 'OUTPUT' as const,
      position: { x: 850, y: 400 },
      outputs: [false],
      inputs: [],
    },
  ],
  wires: [
    // クロック配線
    {
      id: 'w_clk_not',
      from: { gateId: 'CLOCK', pinIndex: -1 },
      to: { gateId: 'DFF0_CLK_NOT', pinIndex: 0 },
      isActive: false,
    },

    // === D-FF 0の配線 ===
    // D入力 (1を入力 - トグル動作のため)
    {
      id: 'w_dff0_d_const',
      from: { gateId: 'Q0_NOT', pinIndex: -1 },
      to: { gateId: 'DFF0_NAND1', pinIndex: 0 },
      isActive: false,
    },

    // クロック配線
    {
      id: 'w_dff0_clk1',
      from: { gateId: 'CLOCK', pinIndex: -1 },
      to: { gateId: 'DFF0_NAND1', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'w_dff0_clk2',
      from: { gateId: 'DFF0_CLK_NOT', pinIndex: -1 },
      to: { gateId: 'DFF0_NAND2', pinIndex: 1 },
      isActive: false,
    },

    // Master ラッチ配線
    {
      id: 'w_dff0_nand1_nor1',
      from: { gateId: 'DFF0_NAND1', pinIndex: -1 },
      to: { gateId: 'DFF0_M_NOR1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_dff0_nand2_nor2',
      from: { gateId: 'DFF0_NAND2', pinIndex: -1 },
      to: { gateId: 'DFF0_M_NOR2', pinIndex: 0 },
      isActive: false,
    },

    // Master フィードバック
    {
      id: 'w_dff0_m_feedback1',
      from: { gateId: 'DFF0_M_NOR1', pinIndex: -1 },
      to: { gateId: 'DFF0_M_NOR2', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'w_dff0_m_feedback2',
      from: { gateId: 'DFF0_M_NOR2', pinIndex: -1 },
      to: { gateId: 'DFF0_M_NOR1', pinIndex: 1 },
      isActive: false,
    },

    // Master -> Slave
    {
      id: 'w_dff0_m_to_s1',
      from: { gateId: 'DFF0_M_NOR1', pinIndex: -1 },
      to: { gateId: 'DFF0_NAND3', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_dff0_m_to_s2',
      from: { gateId: 'DFF0_M_NOR2', pinIndex: -1 },
      to: { gateId: 'DFF0_NAND4', pinIndex: 0 },
      isActive: false,
    },

    // Slave クロック配線
    {
      id: 'w_dff0_s_clk1',
      from: { gateId: 'DFF0_CLK_NOT', pinIndex: -1 },
      to: { gateId: 'DFF0_NAND3', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'w_dff0_s_clk2',
      from: { gateId: 'CLOCK', pinIndex: -1 },
      to: { gateId: 'DFF0_NAND4', pinIndex: 1 },
      isActive: false,
    },

    // Slave ラッチ配線
    {
      id: 'w_dff0_nand3_nor1',
      from: { gateId: 'DFF0_NAND3', pinIndex: -1 },
      to: { gateId: 'DFF0_S_NOR1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_dff0_nand4_nor2',
      from: { gateId: 'DFF0_NAND4', pinIndex: -1 },
      to: { gateId: 'DFF0_S_NOR2', pinIndex: 0 },
      isActive: false,
    },

    // Slave フィードバック
    {
      id: 'w_dff0_s_feedback1',
      from: { gateId: 'DFF0_S_NOR1', pinIndex: -1 },
      to: { gateId: 'DFF0_S_NOR2', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'w_dff0_s_feedback2',
      from: { gateId: 'DFF0_S_NOR2', pinIndex: -1 },
      to: { gateId: 'DFF0_S_NOR1', pinIndex: 1 },
      isActive: false,
    },

    // === D-FF 1の配線 ===
    // D入力 (Q0からの入力)
    {
      id: 'w_dff1_d_input',
      from: { gateId: 'DFF0_S_NOR1', pinIndex: -1 },
      to: { gateId: 'DFF1_NAND1', pinIndex: 0 },
      isActive: false,
    },

    // クロック配線
    {
      id: 'w_dff1_clk1',
      from: { gateId: 'CLOCK', pinIndex: -1 },
      to: { gateId: 'DFF1_NAND1', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'w_dff1_clk2',
      from: { gateId: 'DFF0_CLK_NOT', pinIndex: -1 },
      to: { gateId: 'DFF1_NAND2', pinIndex: 1 },
      isActive: false,
    },

    // Master ラッチ配線
    {
      id: 'w_dff1_nand1_nor1',
      from: { gateId: 'DFF1_NAND1', pinIndex: -1 },
      to: { gateId: 'DFF1_M_NOR1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_dff1_nand2_nor2',
      from: { gateId: 'DFF1_NAND2', pinIndex: -1 },
      to: { gateId: 'DFF1_M_NOR2', pinIndex: 0 },
      isActive: false,
    },

    // Master フィードバック
    {
      id: 'w_dff1_m_feedback1',
      from: { gateId: 'DFF1_M_NOR1', pinIndex: -1 },
      to: { gateId: 'DFF1_M_NOR2', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'w_dff1_m_feedback2',
      from: { gateId: 'DFF1_M_NOR2', pinIndex: -1 },
      to: { gateId: 'DFF1_M_NOR1', pinIndex: 1 },
      isActive: false,
    },

    // Master -> Slave
    {
      id: 'w_dff1_m_to_s1',
      from: { gateId: 'DFF1_M_NOR1', pinIndex: -1 },
      to: { gateId: 'DFF1_NAND3', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_dff1_m_to_s2',
      from: { gateId: 'DFF1_M_NOR2', pinIndex: -1 },
      to: { gateId: 'DFF1_NAND4', pinIndex: 0 },
      isActive: false,
    },

    // Slave クロック配線
    {
      id: 'w_dff1_s_clk1',
      from: { gateId: 'DFF0_CLK_NOT', pinIndex: -1 },
      to: { gateId: 'DFF1_NAND3', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'w_dff1_s_clk2',
      from: { gateId: 'CLOCK', pinIndex: -1 },
      to: { gateId: 'DFF1_NAND4', pinIndex: 1 },
      isActive: false,
    },

    // Slave ラッチ配線
    {
      id: 'w_dff1_nand3_nor1',
      from: { gateId: 'DFF1_NAND3', pinIndex: -1 },
      to: { gateId: 'DFF1_S_NOR1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_dff1_nand4_nor2',
      from: { gateId: 'DFF1_NAND4', pinIndex: -1 },
      to: { gateId: 'DFF1_S_NOR2', pinIndex: 0 },
      isActive: false,
    },

    // Slave フィードバック
    {
      id: 'w_dff1_s_feedback1',
      from: { gateId: 'DFF1_S_NOR1', pinIndex: -1 },
      to: { gateId: 'DFF1_S_NOR2', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'w_dff1_s_feedback2',
      from: { gateId: 'DFF1_S_NOR2', pinIndex: -1 },
      to: { gateId: 'DFF1_S_NOR1', pinIndex: 1 },
      isActive: false,
    },

    // Q0のフィードバック（トグル動作用）
    {
      id: 'w_q0_feedback',
      from: { gateId: 'DFF0_S_NOR1', pinIndex: -1 },
      to: { gateId: 'Q0_NOT', pinIndex: 0 },
      isActive: false,
    },

    // 出力配線
    {
      id: 'w_q0_out',
      from: { gateId: 'DFF0_S_NOR1', pinIndex: -1 },
      to: { gateId: 'Q0_OUTPUT', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_q1_out',
      from: { gateId: 'DFF1_S_NOR1', pinIndex: -1 },
      to: { gateId: 'Q1_OUTPUT', pinIndex: 0 },
      isActive: false,
    },
  ],
};
