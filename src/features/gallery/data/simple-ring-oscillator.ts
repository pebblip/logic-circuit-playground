import type { Gate, Wire } from '../../../types';

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
  title: '🔥 シンプルリングオシレータ（遅延モード版）',
  description: 'DELAYゲート不要の3-NOTリングオシレータ。遅延モードONで各NOTゲートの自然な1ns遅延により3ns周期で発振します。',
  simulationConfig: {
    needsAnimation: true,
    updateInterval: 500,  // 500ms（0.5秒）に変更 - より視認しやすい速度
    expectedBehavior: 'oscillator' as const,
    minimumCycles: 10
  },
  gates: [
    // 🔥 たったこれだけ！3つのNOTゲートのみ
    {
      id: 'NOT1',
      type: 'NOT' as const,
      position: { x: 300, y: 200 },
      output: true, // 初期状態をtrueに設定して発振開始
      inputs: [''],
    },
    {
      id: 'NOT2',
      type: 'NOT' as const,
      position: { x: 500, y: 200 },
      output: false,
      inputs: [''],
    },
    {
      id: 'NOT3',
      type: 'NOT' as const,
      position: { x: 700, y: 200 },
      output: false,
      inputs: [''],
    },
    
    // 各ゲートの出力を観測
    {
      id: 'OUT_NOT1',
      type: 'OUTPUT' as const,
      position: { x: 300, y: 100 },
      output: false,
      inputs: [''],
    },
    {
      id: 'OUT_NOT2',
      type: 'OUTPUT' as const,
      position: { x: 500, y: 100 },
      output: false,
      inputs: [''],
    },
    {
      id: 'OUT_NOT3',
      type: 'OUTPUT' as const,
      position: { x: 700, y: 100 },
      output: false,
      inputs: [''],
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