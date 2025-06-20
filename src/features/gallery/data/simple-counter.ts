import type { Gate, Wire } from '../../../types';

export const SIMPLE_COUNTER = {
  id: 'simple-counter',
  title: '2ビット同期カウンタ',
  description: 'T-フリップフロップを使った同期カウンタ。クロックエッジでカウントアップします。',
  gates: [
    // クロック入力
    {
      id: 'CLOCK',
      type: 'CLOCK' as const,
      position: { x: 100, y: 250 },
      output: false,
      inputs: [],
      metadata: {
        frequency: 1.0, // 1Hz
        isRunning: true,
        // startTimeは評価時に自動設定
      },
    },

    // === T-FF 0 (LSB) - 常にトグル ===
    // T-FF 0のSRラッチ
    {
      id: 'TFF0_NOR1',
      type: 'NOR' as const,
      position: { x: 300, y: 200 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'TFF0_NOR2',
      type: 'NOR' as const,
      position: { x: 300, y: 250 },
      output: false,
      inputs: ['', ''],
    },
    
    // T-FF 0のクロック制御
    {
      id: 'TFF0_AND1',
      type: 'AND' as const,
      position: { x: 200, y: 200 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'TFF0_AND2',
      type: 'AND' as const,
      position: { x: 200, y: 300 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'TFF0_NOT1',
      type: 'NOT' as const,
      position: { x: 150, y: 220 },
      output: false,
      inputs: [''],
    },
    {
      id: 'TFF0_NOT2',
      type: 'NOT' as const,
      position: { x: 150, y: 320 },
      output: false,
      inputs: [''],
    },

    // === T-FF 1 (MSB) - Q0でイネーブル ===
    // T-FF 1のSRラッチ
    {
      id: 'TFF1_NOR1',
      type: 'NOR' as const,
      position: { x: 500, y: 200 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'TFF1_NOR2',
      type: 'NOR' as const,
      position: { x: 500, y: 250 },
      output: false,
      inputs: ['', ''],
    },
    
    // T-FF 1のクロック制御 (Q0 AND CLK)
    {
      id: 'TFF1_AND_EN',
      type: 'AND' as const,
      position: { x: 400, y: 225 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'TFF1_AND1',
      type: 'AND' as const,
      position: { x: 450, y: 200 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'TFF1_AND2',
      type: 'AND' as const,
      position: { x: 450, y: 300 },
      output: false,
      inputs: ['', ''],
    },
    {
      id: 'TFF1_NOT1',
      type: 'NOT' as const,
      position: { x: 400, y: 180 },
      output: false,
      inputs: [''],
    },
    {
      id: 'TFF1_NOT2',
      type: 'NOT' as const,
      position: { x: 400, y: 320 },
      output: false,
      inputs: [''],
    },

    // 出力
    {
      id: 'Q0_OUTPUT',
      type: 'OUTPUT' as const,
      position: { x: 400, y: 150 },
      output: false,
      inputs: [''],
    },
    {
      id: 'Q1_OUTPUT',
      type: 'OUTPUT' as const,
      position: { x: 600, y: 150 },
      output: false,
      inputs: [''],
    },

    // カウント値表示
    {
      id: 'COUNT_DISPLAY',
      type: 'OUTPUT' as const,
      position: { x: 650, y: 225 },
      output: false,
      inputs: [''],
    },
  ],
  wires: [
    // === T-FF 0の配線 ===
    // クロック分岐
    {
      id: 'w_clk_tff0_1',
      from: { gateId: 'CLOCK', pinIndex: -1 },
      to: { gateId: 'TFF0_AND1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_clk_tff0_2',
      from: { gateId: 'CLOCK', pinIndex: -1 },
      to: { gateId: 'TFF0_AND2', pinIndex: 0 },
      isActive: false,
    },

    // Q0の反転 -> T入力 (常にトグル)
    {
      id: 'w_tff0_q_to_not1',
      from: { gateId: 'TFF0_NOR2', pinIndex: -1 },
      to: { gateId: 'TFF0_NOT1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_tff0_q_to_not2',
      from: { gateId: 'TFF0_NOR1', pinIndex: -1 },
      to: { gateId: 'TFF0_NOT2', pinIndex: 0 },
      isActive: false,
    },

    // T入力のAND演算
    {
      id: 'w_tff0_not1_and1',
      from: { gateId: 'TFF0_NOT1', pinIndex: -1 },
      to: { gateId: 'TFF0_AND1', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'w_tff0_not2_and2',
      from: { gateId: 'TFF0_NOT2', pinIndex: -1 },
      to: { gateId: 'TFF0_AND2', pinIndex: 1 },
      isActive: false,
    },

    // SRラッチへの入力
    {
      id: 'w_tff0_and1_nor1',
      from: { gateId: 'TFF0_AND1', pinIndex: -1 },
      to: { gateId: 'TFF0_NOR1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_tff0_and2_nor2',
      from: { gateId: 'TFF0_AND2', pinIndex: -1 },
      to: { gateId: 'TFF0_NOR2', pinIndex: 0 },
      isActive: false,
    },

    // SRラッチのクロスカップリング
    {
      id: 'w_tff0_cross1',
      from: { gateId: 'TFF0_NOR1', pinIndex: -1 },
      to: { gateId: 'TFF0_NOR2', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'w_tff0_cross2',
      from: { gateId: 'TFF0_NOR2', pinIndex: -1 },
      to: { gateId: 'TFF0_NOR1', pinIndex: 1 },
      isActive: false,
    },

    // === T-FF 1の配線 ===
    // Q0とクロックのAND (T-FF1のイネーブル)
    {
      id: 'w_q0_enable',
      from: { gateId: 'TFF0_NOR1', pinIndex: -1 },
      to: { gateId: 'TFF1_AND_EN', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_clk_enable',
      from: { gateId: 'CLOCK', pinIndex: -1 },
      to: { gateId: 'TFF1_AND_EN', pinIndex: 1 },
      isActive: false,
    },

    // T-FF1のクロック制御
    {
      id: 'w_en_to_and1',
      from: { gateId: 'TFF1_AND_EN', pinIndex: -1 },
      to: { gateId: 'TFF1_AND1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_en_to_and2',
      from: { gateId: 'TFF1_AND_EN', pinIndex: -1 },
      to: { gateId: 'TFF1_AND2', pinIndex: 0 },
      isActive: false,
    },

    // Q1の反転 -> T入力
    {
      id: 'w_tff1_q_to_not1',
      from: { gateId: 'TFF1_NOR2', pinIndex: -1 },
      to: { gateId: 'TFF1_NOT1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_tff1_q_to_not2',
      from: { gateId: 'TFF1_NOR1', pinIndex: -1 },
      to: { gateId: 'TFF1_NOT2', pinIndex: 0 },
      isActive: false,
    },

    // T入力のAND演算
    {
      id: 'w_tff1_not1_and1',
      from: { gateId: 'TFF1_NOT1', pinIndex: -1 },
      to: { gateId: 'TFF1_AND1', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'w_tff1_not2_and2',
      from: { gateId: 'TFF1_NOT2', pinIndex: -1 },
      to: { gateId: 'TFF1_AND2', pinIndex: 1 },
      isActive: false,
    },

    // SRラッチへの入力
    {
      id: 'w_tff1_and1_nor1',
      from: { gateId: 'TFF1_AND1', pinIndex: -1 },
      to: { gateId: 'TFF1_NOR1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_tff1_and2_nor2',
      from: { gateId: 'TFF1_AND2', pinIndex: -1 },
      to: { gateId: 'TFF1_NOR2', pinIndex: 0 },
      isActive: false,
    },

    // SRラッチのクロスカップリング
    {
      id: 'w_tff1_cross1',
      from: { gateId: 'TFF1_NOR1', pinIndex: -1 },
      to: { gateId: 'TFF1_NOR2', pinIndex: 1 },
      isActive: false,
    },
    {
      id: 'w_tff1_cross2',
      from: { gateId: 'TFF1_NOR2', pinIndex: -1 },
      to: { gateId: 'TFF1_NOR1', pinIndex: 1 },
      isActive: false,
    },

    // 出力配線
    {
      id: 'w_q0_output',
      from: { gateId: 'TFF0_NOR1', pinIndex: -1 },
      to: { gateId: 'Q0_OUTPUT', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w_q1_output',
      from: { gateId: 'TFF1_NOR1', pinIndex: -1 },
      to: { gateId: 'Q1_OUTPUT', pinIndex: 0 },
      isActive: false,
    },
  ],
};