import type { Gate, Wire } from '../../../types';

export const RING_OSCILLATOR = {
  id: 'ring-oscillator',
  title: 'DELAYリングオシレータ',
  description: '3つのNOTゲートとDELAYゲートを使った真の発振回路。すべてのゲートの出力を観測でき、信号がループを回る様子が視覚的に理解できます。',
  gates: [
    {
      id: 'NOT1',
      type: 'NOT' as const,
      position: { x: 300, y: 200 },
      output: true, // 初期状態をtrueに設定して発振を開始
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
    // DELAYゲート（3サイクル遅延で真の発振を実現）
    {
      id: 'DELAY1',
      type: 'DELAY' as const,
      position: { x: 500, y: 350 },
      output: false,
      inputs: [''],
      metadata: {
        history: [], // 3サイクル遅延履歴
      },
    },
    // NOT1の出力確認用
    {
      id: 'OUT_NOT1',
      type: 'OUTPUT' as const,
      position: { x: 300, y: 100 },
      output: false,
      inputs: [''],
    },
    // NOT2の出力確認用
    {
      id: 'OUT_NOT2',
      type: 'OUTPUT' as const,
      position: { x: 500, y: 100 },
      output: false,
      inputs: [''],
    },
    // NOT3の出力確認用
    {
      id: 'OUT_NOT3',
      type: 'OUTPUT' as const,
      position: { x: 700, y: 100 },
      output: false,
      inputs: [''],
    },
    // DELAYの出力確認用
    {
      id: 'OUT_DELAY',
      type: 'OUTPUT' as const,
      position: { x: 500, y: 450 },
      output: false,
      inputs: [''],
    },
  ],
  wires: [
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
    // NOT3 → DELAY1
    {
      id: 'w3',
      from: { gateId: 'NOT3', pinIndex: -1 },
      to: { gateId: 'DELAY1', pinIndex: 0 },
      isActive: false,
    },
    // DELAY1 → NOT1（フィードバックループ完成）
    {
      id: 'w4',
      from: { gateId: 'DELAY1', pinIndex: -1 },
      to: { gateId: 'NOT1', pinIndex: 0 },
      isActive: false,
    },
    // 観測用接続
    {
      id: 'w5',
      from: { gateId: 'NOT1', pinIndex: -1 },
      to: { gateId: 'OUT_NOT1', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w6',
      from: { gateId: 'NOT2', pinIndex: -1 },
      to: { gateId: 'OUT_NOT2', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w7',
      from: { gateId: 'NOT3', pinIndex: -1 },
      to: { gateId: 'OUT_NOT3', pinIndex: 0 },
      isActive: false,
    },
    {
      id: 'w8',
      from: { gateId: 'DELAY1', pinIndex: -1 },
      to: { gateId: 'OUT_DELAY', pinIndex: 0 },
      isActive: false,
    },
  ],
};