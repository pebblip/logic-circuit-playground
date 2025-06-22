import { IdGenerator } from '@/shared/id';
import type { Gate, Wire } from '@/types/circuit';

/**
 * 2ビット比較器の回路定義
 * A=B, A>B, A<B を判定
 */
export const comparatorCircuit = {
  title: '2ビット比較器（A=B検出）',
  gates: [
    // 入力A（2ビット）
    {
      id: 'input-a0',
      type: 'INPUT' as const,
      position: { x: 50, y: 100 },
      inputs: [],
      outputs: [false],
      output: false,
      metadata: { name: 'A0' },
    },
    {
      id: 'input-a1',
      type: 'INPUT' as const,
      position: { x: 50, y: 200 },
      inputs: [],
      outputs: [true],
      output: true,
      metadata: { name: 'A1' },
    },

    // 入力B（2ビット）
    {
      id: 'input-b0',
      type: 'INPUT' as const,
      position: { x: 50, y: 300 },
      inputs: [],
      outputs: [false],
      output: false,
      metadata: { name: 'B0' },
    },
    {
      id: 'input-b1',
      type: 'INPUT' as const,
      position: { x: 50, y: 400 },
      inputs: [],
      outputs: [true],
      output: true,
      metadata: { name: 'B1' },
    },

    // ビット単位の比較（XNOR = 同じなら1）
    // A0=B0の検出
    {
      id: 'xor0',
      type: 'XOR' as const,
      position: { x: 250, y: 200 },
      inputs: [false, false],
      outputs: [false],
      output: false,
    },
    {
      id: 'not0',
      type: 'NOT' as const,
      position: { x: 350, y: 200 },
      inputs: [false],
      outputs: [true],
      output: true,
    },

    // A1=B1の検出
    {
      id: 'xor1',
      type: 'XOR' as const,
      position: { x: 250, y: 350 },
      inputs: [false, false],
      outputs: [false],
      output: false,
    },
    {
      id: 'not1',
      type: 'NOT' as const,
      position: { x: 350, y: 350 },
      inputs: [false],
      outputs: [true],
      output: true,
    },

    // 全ビットが等しいかAND
    {
      id: 'and-equal',
      type: 'AND' as const,
      position: { x: 500, y: 275 },
      inputs: [false, false],
      outputs: [true],
      output: true,
    },

    // 出力（A=B）
    {
      id: 'output-equal',
      type: 'OUTPUT' as const,
      position: { x: 650, y: 275 },
      inputs: [false],
      outputs: [],
      metadata: { name: 'A=B' },
    },
  ] as Gate[],

  wires: [
    // A0とB0の比較
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'input-a0', pinIndex: -1 },
      to: { gateId: 'xor0', pinIndex: 0 },
      isActive: false,
    },
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'input-b0', pinIndex: -1 },
      to: { gateId: 'xor0', pinIndex: 1 },
      isActive: false,
    },
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'xor0', pinIndex: -1 },
      to: { gateId: 'not0', pinIndex: 0 },
      isActive: false,
    },

    // A1とB1の比較
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'input-a1', pinIndex: -1 },
      to: { gateId: 'xor1', pinIndex: 0 },
      isActive: true,
    },
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'input-b1', pinIndex: -1 },
      to: { gateId: 'xor1', pinIndex: 1 },
      isActive: true,
    },
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'xor1', pinIndex: -1 },
      to: { gateId: 'not1', pinIndex: 0 },
      isActive: false,
    },

    // AND処理
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'not0', pinIndex: -1 },
      to: { gateId: 'and-equal', pinIndex: 0 },
      isActive: true,
    },
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'not1', pinIndex: -1 },
      to: { gateId: 'and-equal', pinIndex: 1 },
      isActive: true,
    },

    // 出力
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'and-equal', pinIndex: -1 },
      to: { gateId: 'output-equal', pinIndex: 0 },
      isActive: true,
    },
  ] as Wire[],

  layout: {
    preferredWidth: 750,
    preferredHeight: 500,
    inputLabels: ['A0-A1', 'B0-B1'],
    outputLabels: ['A=B'],
  },
};
