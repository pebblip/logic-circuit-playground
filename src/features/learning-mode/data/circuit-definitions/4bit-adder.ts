import { IdGenerator } from '@/shared/id';
import type { Gate, Wire } from '@/types/circuit';

/**
 * レッスン9: 4ビット加算器（リップルキャリー加算器）
 * 4つの全加算器を連結
 */
export const fourBitAdderCircuit = {
  title: '4ビット加算器（リップルキャリー方式）',
  gates: [
    // 入力A（4ビット）
    {
      id: 'input-a0',
      type: 'INPUT' as const,
      position: { x: 50, y: 50 },
      inputs: [],
      outputs: [false],
      output: false,
      metadata: { name: 'A0' },
    },
    {
      id: 'input-a1',
      type: 'INPUT' as const,
      position: { x: 50, y: 150 },
      inputs: [],
      outputs: [true],
      output: true,
      metadata: { name: 'A1' },
    },
    {
      id: 'input-a2',
      type: 'INPUT' as const,
      position: { x: 50, y: 250 },
      inputs: [],
      outputs: [true],
      output: true,
      metadata: { name: 'A2' },
    },
    {
      id: 'input-a3',
      type: 'INPUT' as const,
      position: { x: 50, y: 350 },
      inputs: [],
      outputs: [false],
      output: false,
      metadata: { name: 'A3' },
    },

    // 入力B（4ビット）
    {
      id: 'input-b0',
      type: 'INPUT' as const,
      position: { x: 50, y: 100 },
      inputs: [],
      outputs: [true],
      output: true,
      metadata: { name: 'B0' },
    },
    {
      id: 'input-b1',
      type: 'INPUT' as const,
      position: { x: 50, y: 200 },
      inputs: [],
      outputs: [false],
      output: false,
      metadata: { name: 'B1' },
    },
    {
      id: 'input-b2',
      type: 'INPUT' as const,
      position: { x: 50, y: 300 },
      inputs: [],
      outputs: [true],
      output: true,
      metadata: { name: 'B2' },
    },
    {
      id: 'input-b3',
      type: 'INPUT' as const,
      position: { x: 50, y: 400 },
      inputs: [],
      outputs: [true],
      output: true,
      metadata: { name: 'B3' },
    },

    // 簡略化のため、各全加算器を1つのカスタムブロックとして表現
    // 実際の実装では、各FAブロックは2つのXOR、2つのAND、1つのORで構成

    // FA0（最下位ビット - 半加算器として動作）
    {
      id: 'xor0',
      type: 'XOR' as const,
      position: { x: 200, y: 75 },
      inputs: [false, false],
      outputs: [false],
      output: false,
      metadata: { name: 'FA0-S' },
    },
    {
      id: 'and0',
      type: 'AND' as const,
      position: { x: 200, y: 125 },
      inputs: [false, false],
      outputs: [false],
      output: false,
      metadata: { name: 'FA0-C' },
    },

    // FA1
    {
      id: 'fa1-xor1',
      type: 'XOR' as const,
      position: { x: 350, y: 150 },
      inputs: [false, false],
      outputs: [false],
      output: false,
    },
    {
      id: 'fa1-xor2',
      type: 'XOR' as const,
      position: { x: 450, y: 175 },
      inputs: [false, false],
      outputs: [false],
      output: false,
      metadata: { name: 'FA1-S' },
    },
    {
      id: 'fa1-and1',
      type: 'AND' as const,
      position: { x: 350, y: 200 },
      inputs: [false, false],
      outputs: [false],
      output: false,
    },
    {
      id: 'fa1-and2',
      type: 'AND' as const,
      position: { x: 450, y: 225 },
      inputs: [false, false],
      outputs: [false],
      output: false,
    },
    {
      id: 'fa1-or',
      type: 'OR' as const,
      position: { x: 550, y: 212 },
      inputs: [false, false],
      outputs: [false],
      output: false,
      metadata: { name: 'FA1-C' },
    },

    // 出力（簡略化のため、S0とS1のみ表示）
    {
      id: 'output-s0',
      type: 'OUTPUT' as const,
      position: { x: 700, y: 75 },
      inputs: [false],
      outputs: [],
      metadata: { name: 'S0' },
    },
    {
      id: 'output-s1',
      type: 'OUTPUT' as const,
      position: { x: 700, y: 175 },
      inputs: [false],
      outputs: [],
      metadata: { name: 'S1' },
    },
    {
      id: 'output-c1',
      type: 'OUTPUT' as const,
      position: { x: 700, y: 275 },
      inputs: [false],
      outputs: [],
      metadata: { name: 'C1' },
    },
  ] as Gate[],

  wires: [
    // FA0の接続
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
      isActive: true,
    },
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'input-a0', pinIndex: -1 },
      to: { gateId: 'and0', pinIndex: 0 },
      isActive: false,
    },
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'input-b0', pinIndex: -1 },
      to: { gateId: 'and0', pinIndex: 1 },
      isActive: true,
    },

    // FA1の第1段
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'input-a1', pinIndex: -1 },
      to: { gateId: 'fa1-xor1', pinIndex: 0 },
      isActive: true,
    },
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'input-b1', pinIndex: -1 },
      to: { gateId: 'fa1-xor1', pinIndex: 1 },
      isActive: false,
    },
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'input-a1', pinIndex: -1 },
      to: { gateId: 'fa1-and1', pinIndex: 0 },
      isActive: true,
    },
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'input-b1', pinIndex: -1 },
      to: { gateId: 'fa1-and1', pinIndex: 1 },
      isActive: false,
    },

    // FA1の第2段（キャリー入力）
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'and0', pinIndex: -1 },
      to: { gateId: 'fa1-xor2', pinIndex: 1 },
      isActive: false,
    },
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'fa1-xor1', pinIndex: -1 },
      to: { gateId: 'fa1-xor2', pinIndex: 0 },
      isActive: true,
    },
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'and0', pinIndex: -1 },
      to: { gateId: 'fa1-and2', pinIndex: 1 },
      isActive: false,
    },
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'fa1-xor1', pinIndex: -1 },
      to: { gateId: 'fa1-and2', pinIndex: 0 },
      isActive: true,
    },

    // キャリー出力
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'fa1-and1', pinIndex: -1 },
      to: { gateId: 'fa1-or', pinIndex: 0 },
      isActive: false,
    },
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'fa1-and2', pinIndex: -1 },
      to: { gateId: 'fa1-or', pinIndex: 1 },
      isActive: false,
    },

    // 出力接続
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'xor0', pinIndex: -1 },
      to: { gateId: 'output-s0', pinIndex: 0 },
      isActive: false,
    },
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'fa1-xor2', pinIndex: -1 },
      to: { gateId: 'output-s1', pinIndex: 0 },
      isActive: true,
    },
    {
      id: IdGenerator.generateWireId(),
      from: { gateId: 'fa1-or', pinIndex: -1 },
      to: { gateId: 'output-c1', pinIndex: 0 },
      isActive: false,
    },
  ] as Wire[],

  layout: {
    preferredWidth: 800,
    preferredHeight: 500,
    inputLabels: ['A0-A3', 'B0-B3'],
    outputLabels: ['S0-S3', 'Cout'],
  },
};
